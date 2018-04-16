import React from 'react';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';

import PersistGate from 'common/redux-persist/persistGate';
import persistStore from 'common/redux-persist/persistStore';
import { store, client } from 'common/store.1';

import AppWithNavigationState, { navigationReducer, navigationMiddleware } from './navigation';

const stre = store(navigationReducer, navigationMiddleware);
const persistor = persistStore(stre);
const clientApollo = client(navigationReducer, navigationMiddleware);

const App = () => (
  <ApolloProvider client={clientApollo}>
    <Provider store={stre}>
      <PersistGate persistor={persistor}>
        <AppWithNavigationState />
      </PersistGate>
    </Provider>
  </ApolloProvider>
);

export default App;
