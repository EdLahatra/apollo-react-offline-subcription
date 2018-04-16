import { REHYDRATE } from 'redux-persist';
import Immutable from 'seamless-immutable';

import { LOGOUT, SET_CURRENT_USER } from '../constants/constants';

/* const initialState = Immutable({
  loading: true,
});

const auth = (state = initialState, action) => {
  const { payload = {} } = action;
  console.log('action.user', action.user);
  switch (action.type) {
    case REHYDRATE:
      // convert persisted data to Immutable and confirm rehydration
      return Immutable(payload.auth || state)
        .set('loading', false);
    case SET_CURRENT_USER:
      return state.merge(action.user);
    case LOGOUT:
      return Immutable({ loading: false });
    default:
      return state;
  }
};
 */

const initialState = {
  loading: true,
  jwt: null,
  id: null,
  username: null,
};

const auth = (state = initialState, action) => {
  console.log((action.type));
  let newState;
  switch (action.type) {
    case REHYDRATE:
      // convert persisted data to Immutable and confirm rehydration
      if (action.payload) {
        return {
          ...state,
          ...action.payload.auth,
        };
      }
      return state;
    case SET_CURRENT_USER:
      newState = {
        ...state,
        ...action.user,
      };
      console.log('newState', newState);
      return newState;
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default auth;
