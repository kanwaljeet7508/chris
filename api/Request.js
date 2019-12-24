/**
 * Axios Request Wrapper
 * ---------------------
 *
 * @author  Seersol
 *
 */

import axios from 'axios'

/**
 * Create an Axios Client with defaults
 */
const client = axios.create({
   baseURL: 'http://myvoluntier-api.seersol.com'
 // baseURL: 'TOKEN_BASE_API_URL'
});

/**
 * Request Wrapper with default success/error actions
 */
const request = function(options) {
  const onSuccess = function(response) {
    return response.data;
  }

  const onError = function(error) {

    JSON.stringify(error.message)
  /*    console.log(error)
    if (error.response) {
     
      console.warn(error.response.data.message || error.response.data.error)
      // Request was made but server responded with something
      // other than 2xx
     // console.log('Status:',  error.response.status);
     // console.log('Data:',    error.response.data);
     // console.log('Headers:', error.response.headers);
    } else {
        // Something else happened while setting up the request
        // triggered the error
        //network error
       // console.log('Error Message:', error.message);
       console.warn(error.message);
      }
  */
      return Promise.reject(error.response || error.message);
    }
  
    return client(options)
          .then(onSuccess)
          .catch(onError);
  }
  

  export default request;