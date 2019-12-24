// import { AsyncStorage } from "react-native"
import AsyncStorage from '@react-native-community/async-storage';
import request from "./Request";

const _storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log(error)
    }
  }

  const _retrieveData =  (key) => {
    try {
      return  AsyncStorage.getItem(key);
    } catch (error) {
      // Error retrieving data
      console.log('retrieve Async storage', error)
    }
  }

  const _multiRemove = (keys) => AsyncStorage.multiRemove(keys)

  const _getLoggedInUser = () => {
    return _retrieveData('token').then(token => {
        return new Promise((resolve, reject) => {
        if(token) {
            request({
              url:    '/api/volunteer/profile',
              method: 'GET',
              headers: {
                  Authorization: `Bearer ${token}`
              }
              }).then( response => {
                  const { user, profile_info, fire_base_token } =  response.data;
                  const { 
                    id,
                    first_name, last_name, 
                    lat, lng, location,
                    logo_img, back_img,
                    email, user_name, 
                    birth_date, gender,
                    zipcode, contact_number, 
                    show_age, show_address, brif
                    } =  user;
                    
                  const loggedINUser = {
                      user_id: id,
                      first_name,
                      last_name, 
                      summary: brif ? brif.replace(/(<([^>]+)>)/ig,"") : 'N/A',
                      lat, lng, location, email, user_name,
                      birth_date, gender, zipcode,logo_img, back_img,
                      contact_number,show_age, show_address,
                      profile_info,
                      fire_base_token
                  }
                  console.log('FireBase Token', fire_base_token);
                  _storeData('loggedINUser', JSON.stringify(loggedINUser))
                  _storeData('fire_base_token', JSON.stringify(fire_base_token))
                 resolve(loggedINUser);
              }).catch ( err => {
                _multiRemove(['token', 'loggedINUser', 'firebase_token'])
                reject(err);
              })
        } else {
          reject('Unauthenticated!!');
        }
      })
    })
  }

export {
  _storeData,
  _multiRemove,
  _retrieveData,
  _getLoggedInUser,
  }