import React from 'react';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';

import PersistGate from 'common/redux-persist/persistGate';
import { store, client, persistor } from 'common/store';

import AppWithNavigationState from './navigation';

const App = () => (
  <ApolloProvider client={client}>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AppWithNavigationState />
      </PersistGate>
    </Provider>
  </ApolloProvider>
);

export default App;
