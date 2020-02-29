import { combineReducers } from 'redux';

import { sessionReducer } from './sessionReducer';
import routesReducer from './routesReducer';

const rootReducer = combineReducers({
  session: sessionReducer,
  routes: routesReducer,
});

export default rootReducer;
