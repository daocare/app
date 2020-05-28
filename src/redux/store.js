import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import proposals from './proposals/proposalsReducer';
import user from './user/userReducer';
import fund from './fund/fundReducer';
import web3 from './web3/web3Reducer';

const rootReducer = combineReducers({
  user,
  proposals,
  fund,
  web3,
});

// For redux chrome tool - https://github.com/zalmoxisus/redux-devtools-extension#usage
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default createStore(
  rootReducer,
  /* preloadedState, */ composeEnhancers(applyMiddleware(thunk))
);
