import { createStore, combineReducers, applyMiddleware } from 'redux';
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

export default createStore(rootReducer, applyMiddleware(thunk));
