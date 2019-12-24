import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack'
import MainTabNavigator from './MainTabNavigator';
import VolRegisterScreen from '../screens/VolRegisterScreen';
import ForgetPasswordScreen from './../screens/ForgetPasswordScreen';
import TermsAndConditionsScreen from './../screens/TermsAndConditionsScreen';
import LoginScreen from '../screens/LoginScreen';
import SettingsScreen from '../screens/SettingsScreen';

// const App = createAppContainer(MyStack);

const AuthStack = createStackNavigator({ 
  Login: LoginScreen,
  ForgetPassword: ForgetPasswordScreen,
  TermsAndConditions: TermsAndConditionsScreen,
  VolunteerRegister: VolRegisterScreen,
  SettingsScreen:SettingsScreen,

 },  {
  initialRouteName: 'Login'
}
);

 const App = createAppContainer(AuthStack);

// const createRootNavigator
//   return createAppContainer(
//     createSwitchNavigator({
//       Auth: AuthStack,
//       Main: MainTabNavigator, 
//   },
//   {
//     initialRouteName: isLoggedIn ? 'Main' : 'Auth'
//   }));

export default createAppContainer(createSwitchNavigator({
  Auth:AuthStack,
  Main: MainTabNavigator

   


}));
