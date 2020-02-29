import * as actionTypes from '../actions';

const initialState = {
  allRoutes: [],
};

const routesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ROUTES_LOADED: {
      return {
        ...state,
        allRoutes: action.routes,
      };
    }

    default: {
      return state;
    }
  }
};

export default routesReducer;
