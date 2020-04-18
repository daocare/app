import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import proposals from './proposals/proposalsReducer';
import user from './user/userReducer';
import fund from './fund/fundReducer';

const rootReducer = combineReducers({
  user,
  proposals,
  fund,
});

export default createStore(rootReducer, applyMiddleware(thunk));
