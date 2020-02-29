import * as actionTypes from '../actions';

// const initialState = {
//   loggedIn: true,
//   user: {
//     first_name: 'Shen',
//     last_name: 'Zhi',
//     email: 'demo@devias.io',
//     avatar: '/images/avatars/avatar_11.png',
//     bio: 'Brain Director',
//     role: 'ADMIN', // ['GUEST', 'USER', 'ADMIN']
//   },
// };

const initialState = {
  loggedIn: false,
  user: null,
};

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SESSION_LOGIN: {
      return {
        ...state,
        loggedIn: true,
        user: action.user,
      };
    }

    case actionTypes.SESSION_LOGOUT: {
      return {
        ...state,
        loggedIn: false,
        user: null,
      };
    }

    default: {
      return state;
    }
  }
};

const selectorSessionUser = state =>
  state.session && state.session.loggedIn ? state.session.user : null;

export { sessionReducer, selectorSessionUser };
