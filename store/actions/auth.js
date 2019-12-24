import * as actionTypes from './actionTypes'
import request from '../../api/Request'
import { _storeData, _retrieveData, _multiRemove } from './../../api/AsyncStorage';

export const authStart = () => {
	return {
		type: actionTypes.AUTH_START
	}
}

export const authSuccess = (token) => {
	return {
		type: actionTypes.AUTH_SUCCESS,
		token
	}
}

export const authenticatedUSer = (user) => {
	return {
		type: actionTypes.AUTH_USER,
		user
	}
}

export const authFail = (error) => {
	return {
		type: actionTypes.AUTH_FAIL,
		error: error
	}
}

export const logout = () => {
	_multiRemove(['token', 'loggedINUser'])
	return {
		type: actionTypes.AUTH_LOGOUT
	};
}

export const auth = (user, password) => {
	return dispatch => {
		const data = {
			client_id: '2',
			client_secret: 'eHNExtArzDBq7kIs3peEFYj6lRyKkhcdKzd8MRzs',
			grant_type: 'password',
			username: user,
			password: password,
		};

		dispatch(authStart());
		return new Promise((resolve, reject) => {
			request({
					url: '/oauth/token',
					method: 'POST',
					data
				})
				.then(response => {
					_storeData('token', response.access_token)
					dispatch(authSuccess(response.access_token));
					resolve(response.access_token);
				})
				.catch(err => {
					let errorMessage;
					if (err == 'Network Error') {
						errorMessage = 'Network Error, Please check your connection'
					} else {
						errorMessage = err.data.message;
					}
					dispatch(authFail(errorMessage));
					reject(errorMessage || 'E-mail or password is incorrect');
				});
		})

	}
}

export const authCheckState = () => {
	return dispatch => {
		return _retrieveData('token').then(token => {
			return new Promise((resolve, reject) => {
				if (!token) {
					dispatch(logout());
					reject('Invalid Access Token.')
				} else {
					request({
						url: '/api/volunteer/profile',
						method: 'GET',
						headers: {
							Authorization: `Bearer ${token}`
						}
					}).then(response => {
						const {
							user,
							profile_info
						} = response.data;
						const {
							first_name,
							last_name,
							lat,
							lng,
							location,
							email,
							user_name
						} = user
						const loggedINUser = {
							first_name,
							last_name,
							lat,
							lng,
							location,
							email,
							user_name,
							profile_info
						}
						dispatch(authenticatedUSer(loggedINUser));
						_storeData('loggedINUser', JSON.stringify(loggedINUser))
						resolve(loggedINUser);
					}).catch(err => {
						dispatch(logout());
						reject(err.data.message || 'Unauthenticated.')
					})
				}
			})

		})
	}
}

