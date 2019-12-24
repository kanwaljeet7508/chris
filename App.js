import React, {Component} from 'react';
import { Platform, StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
// import { AppLoading, Asset, Font, Icon } from 'expo';
import { Provider } from 'react-redux';
import authReducer from './store/reducers/authReducer';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { Root } from 'native-base';
import AppNavigator from './navigation/AppNavigator';
import { _storeData, _retrieveData, _multiRemove, _getLoggedInUser } from './api/AsyncStorage';
import Fire from './api/Fire';

const rootReducers= combineReducers({
  auth: authReducer
});

const store = createStore(rootReducers,  applyMiddleware(thunk));

export default class App extends Component {
  state = {
    isLoadingComplete: false,
    isAuthenticated: false,
    authenticating: false
  };

  async componentDidMount() {
    this.setState({ authenticating: true });
    await _getLoggedInUser()
    .then(response => {
      console.log('already logged in', response);
      this.setState({isAuthenticated: true, authenticating: false })
    }).catch(err => {
      console.log('app.js', JSON.stringify(err));
      Fire.shared.logout();
      this.setState({ authenticating: false })
    });
  }


  render() {
    return(  <Provider store={store}>
      <Root>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {
           <AppNavigator/>
          }
      </Root>
    </Provider>)
    // const AppNavigator = createRootNavigator(this.state.isAuthenticated );
    // if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
    //   return (
    //     <AppLoading
    //       startAsync= {this._loadResourcesAsync}
    //       onError= {this._handleLoadingError}
    //       onFinish= {this._handleFinishLoading}
    //     />
    //   );
    // } else {
    //   return (
    //     <Provider store={store}>
    //       <Root>
    //           {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
    //           {
    //             this.state.authenticating ?<View style={{ flex: 1, justifyContent: 'center'}}><ActivityIndicator size="large" color="#3bb44a" /></View>:<AppNavigator />
    //           }
    //       </Root>
    //     </Provider>
    //   );
    // }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        'Roboto': require('native-base/Fonts/Roboto.ttf'),
        'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        ...Icon.Ionicons.font,
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}
