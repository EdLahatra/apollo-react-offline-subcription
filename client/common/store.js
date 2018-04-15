import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createHttpLink } from 'apollo-link-http';
import { createStore, /* combineReducers, */ applyMiddleware } from 'redux';
import { ReduxCache, apolloReducer } from 'apollo-cache-redux';
import ReduxLink from 'apollo-link-redux';
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { persistStore, persistCombineReducers } from 'redux-persist';
import thunk from 'redux-thunk';
import { setContext } from 'apollo-link-context';
import _ from 'lodash'; // eslint-disable-line

import {
  navigationReducer,
  navigationMiddleware,
} from '../mobile/src/navigation';
import auth from './reducers/auth.reducer';
import { logout } from './actions/auth.actions';
import storage from '../es/storage';
import conf from './config';

const config = {
  key: 'root',
  storage,
  // blacklist: ['nav'], // don't persist nav for now
};

const reducer = persistCombineReducers(config, {
  apollo: apolloReducer,
  nav: navigationReducer,
  auth,
});

export const store = createStore(
  reducer,
  {}, // initial state
  composeWithDevTools(applyMiddleware(thunk, navigationMiddleware)),
);

// persistent storage
export const persistor = persistStore(store);

const cache = new ReduxCache({ store });

const reduxLink = new ReduxLink(store);

const httpLink = createHttpLink({ uri: conf.serverUrl });

// middleware for requests
const middlewareLink = setContext((req, previousContext) => {
  // get the authentication token from local storage if it exists
  const { jwt } = store.getState().auth;
  if (jwt) {
    return {
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    };
  }

  return previousContext;
});

// afterware for responses
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.log({ graphQLErrors });
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log({ message, locations, path });
      if (message === 'Unauthorized') {
        store.dispatch(logout());
      }
    });
  }
  if (networkError) {
    console.log('[Network error]:');
    console.log({ networkError });
    if (networkError.statusCode === 401) {
      store.dispatch(logout());
    }
  }
});

// Create WebSocket client
export const wsClient = new SubscriptionClient(conf.websocketUrl, {
  lazy: true,
  reconnect: true,
  connectionParams() {
    // get the authentication token from local storage if it exists v
    return {
      jwt: store.getState().auth && store.getState().auth.jwt ? store.getState().auth.jwt : null,
    };
  },
});

const webSocketLink = new WebSocketLink(wsClient);

const requestLink = ({ queryOrMutationLink, subscriptionLink }) =>
  ApolloLink.split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    subscriptionLink,
    queryOrMutationLink,
  );

const link = ApolloLink.from([
  reduxLink,
  errorLink,
  requestLink({
    queryOrMutationLink: middlewareLink.concat(httpLink),
    subscriptionLink: webSocketLink,
  }),
]);

export const client = new ApolloClient({
  link,
  cache,
});
