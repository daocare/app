import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import proposals from './reducers/proposalsReducer';
import user from './reducers/userReducer';

const rootReducer = combineReducers({
  user,
  proposals,
});

export default createStore(rootReducer, applyMiddleware(thunk));
