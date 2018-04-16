import { client, wsClient } from '../store.1';
import { SET_CURRENT_USER, LOGOUT } from '../constants/constants';

export const setCurrentUser = user => ({
  type: SET_CURRENT_USER,
  user,
});

export const logout = (nav, navigationMiddleware) => {
  client(nav, navigationMiddleware).resetStore();
  wsClient(nav, navigationMiddleware).unsubscribeAll(); // unsubscribe from all subscriptions
  wsClient(nav, navigationMiddleware).close(); // close the WebSocket connection
  return { type: LOGOUT };
};
