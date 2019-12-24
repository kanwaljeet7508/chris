import * as actionTypes from './../actions/actionTypes';
import { updateObject } from './../utility';

const initialState = {
	token: null,
	user: null,
	error: null,
	isAuthenticated: false,
	isLoading: false
};

const authStart = (state, action) => {
	return updateObject(state, {
		error: null,
		isLoading: true
	});
};

const authSuccess = (state, action) => {
	return updateObject(state, {
		token: action.token,
		isAuthenticated: true,
		error: null,
		isLoading: false
	});
};

const authenticated = (state, action) => {
	return updateObject(state, {
		user: action.user,
		isAuthenticated: true,
		error: null,
		isLoading: false
	});
};

const authFail = (state, action) => {
	return updateObject(state, {
		error: action.error,
		isLoading: false
	});
};

const authLogout = (state, action) => {
	return updateObject(state, {
		token: null,
		userId: null,
		isAuthenticated: false
	});
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.AUTH_START:
			return authStart(state, action);
		case actionTypes.AUTH_SUCCESS:
			return authSuccess(state, action);
		case actionTypes.AUTH_USER:
			return authenticated(state, action);
		case actionTypes.AUTH_FAIL:
			return authFail(state, action);
		case actionTypes.AUTH_LOGOUT:
			return authLogout(state, action);
		default:
			return state;
	}
};

export default reducer;
