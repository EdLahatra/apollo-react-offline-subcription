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
import { persistCombineReducers } from 'redux-persist';
import thunk from 'redux-thunk';
import { setContext } from 'apollo-link-context';
import _ from 'lodash'; // eslint-disable-line

// import { navigationReducer, navigationMiddleware } from '../mobile/src/navigation';
import auth from './reducers/auth.reducer';
import { logout } from './actions/auth.actions';
import storage from '../es/storage';
import conf from './config';

const config = {
  key: 'root',
  storage,
  // blacklist: ['nav'], // don't persist nav for now k
};

const reducer = navigationReducer => persistCombineReducers(config, {
  apollo: apolloReducer,
  nav: navigationReducer,
  auth,
});

/* export const store = createStore(
  reducer,
  {}, // initial state n
  composeWithDevTools(applyMiddleware(thunk, navigationMiddleware)),
); */

export const store = (navigationReducer, navigationMiddleware) => createStore(
  reducer(navigationReducer),
  {}, // initial state
  composeWithDevTools(applyMiddleware(thunk, navigationMiddleware)),
);

// persistent storage
// export const persistor = persistStore(store);

// export const persist = stre => persistStore(stre);

// const cache = new ReduxCache({ store });

// const reduxLink = new ReduxLink(store);

const httpLink = createHttpLink({ uri: conf.serverUrl });

// middleware for requests
const middlewareLink = (navigationReducer, navigationMiddleware) =>
  setContext((req, previousContext) => {
  // get the authentication token from local storage if it exists
    const { jwt } = store(navigationReducer, navigationMiddleware).getState().auth;
    console.log('jwt', store(navigationReducer, navigationMiddleware).getState());
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
const errorLink = (navigationReducer, navigationMiddleware) =>
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      console.log({ graphQLErrors });
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.log({ message, locations, path });
        if (message === 'Unauthorized') {
          store(navigationReducer, navigationMiddleware).dispatch(
            logout(navigationReducer, navigationMiddleware));
        }
      });
    }
    if (networkError) {
      console.log('[Network error]:');
      console.log({ networkError });
      if (networkError.statusCode === 401) {
        store(navigationReducer, navigationMiddleware).dispatch(
          logout(navigationReducer, navigationMiddleware));
      }
    }
  });

// Create WebSocket client
export const wsClient = (navigationReducer, navigationMiddleware) =>
  new SubscriptionClient(conf.websocketUrl, {
    lazy: true,
    reconnect: true,
    connectionParams() {
    // get the authentication token from local storage if it exists v
      return {
        jwt: store(navigationReducer, navigationMiddleware).getState().auth
        && store(navigationReducer, navigationMiddleware).getState().auth.jwt
          ? store(navigationReducer, navigationMiddleware).getState().auth.jwt : null,
      };
    },
  });

const webSocketLink = (navigationReducer, navigationMiddleware) =>
  new WebSocketLink(wsClient(navigationReducer, navigationMiddleware));

const requestLink = ({ queryOrMutationLink, subscriptionLink }) =>
  ApolloLink.split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    subscriptionLink,
    queryOrMutationLink,
  );

const link = (navigationReducer, navigationMiddleware) => ApolloLink.from([
  new ReduxLink(store(navigationReducer, navigationMiddleware)),
  errorLink(navigationReducer, navigationMiddleware),
  requestLink({
    queryOrMutationLink: middlewareLink(navigationReducer, navigationMiddleware).concat(httpLink),
    subscriptionLink: webSocketLink(navigationReducer, navigationMiddleware),
  }),
]);

export const client = (navigationReducer, navigationMiddleware) => new ApolloClient({
  link: link(navigationReducer, navigationMiddleware),
  cache: new ReduxCache({ store: store(navigationReducer, navigationMiddleware) }),
});
