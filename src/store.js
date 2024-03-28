import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import AuthReducers from './loginscreen/reducers/reducers';

const RootReducers = combineReducers({
  AuthReducers,
});

export const store = createStore(RootReducers, applyMiddleware(thunk));
