import request from "./Request";
import { _retrieveData, _multiRemove } from './AsyncStorage'

/**
 * Send Http Request with Auth Header
 * @param {GET  | POST | PUT | DELETE } method 
 * @param { API END POINT } url 
 * @param {?Payload} data 
 */
const _sendPublicRequest = (method, url, data={}) => {
    return new Promise((resolve, reject) => {
      request({ url, method, data })
      .then( response => resolve(response))
      .catch ( err => reject(err))
    })
}

const _sendRequest = (method, url, data={}) => {
    return _retrieveData('token').then(token => {
        return new Promise((resolve, reject) => {
        if(token) {
            request({
              url,
              method,
              data,
              headers: {
                  Authorization: `Bearer ${token}`
              }
              }).then( response => {
                 resolve(response);
              }).catch ( err => {

                if (err.status=== 401) {
                  _multiRemove(['token', 'loggedINUser', 'fire_base_token'])
                  reject('TOKEN_ERROR');
                }
                reject(err);
              })
        } else {
          _multiRemove(['token', 'loggedINUser', 'fire_base_token'])
          reject('TOKEN_ERROR');
        }
      })
    })
}

export {
  _sendRequest,
  _sendPublicRequest
}