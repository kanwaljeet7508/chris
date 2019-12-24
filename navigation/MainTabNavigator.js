import React from 'react';
import  {createStackNavigator}  from 'react-navigation-stack'
import  {createBottomTabNavigator}  from 'react-navigation-tabs';

import TabBarIcon from '../components/TabBarIcon';
import TrackTimeScreen from '../screens/TrackTimeScreen';
import ImpactScreen from '../screens/ImpactScreen';
import MessagesScreen from '../screens/MessagesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OpportunitiesScreen from '../screens/OpportunitiesScreen';
import OpportunityDetail from '../screens/OpportunityDetail';
import JoinOpportunityScreen from '../screens/JoinOpportunityScreen';
import Colors from '../constants/Colors';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import UpdatePasswordScreen from '../screens/UpdatePasswordScreen';
import AddHoursScreens from '../screens/AddHoursScreen';
import ChatScreen from '../screens/ChatScreen';
import TestScreen from '../screens/TestScreen';

const OpportunitiesStack = createStackNavigator({
  Home: TestScreen,
  Home: OpportunitiesScreen,
  AddOppHours: AddHoursScreens,
  OpportunityDetail

});

OpportunitiesStack.navigationOptions = {
  tabBarLabel: 'Opportunities',
  tabBarOptions: { 
    activeTintColor: Colors.appMainColor
  },
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name="globe"
    />
  ),
};

const TrackTimeStack = createStackNavigator({
  Track: TrackTimeScreen,
  JoinOpportunityScreen,
  AddHours: AddHoursScreens
})

TrackTimeStack.navigationOptions = {
  tabBarLabel: 'Track',
  tabBarOptions: { 
    activeTintColor: Colors.appMainColor
  },
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name="time"
    />
  )
};

const ImpactStack = createStackNavigator({
  Impact: ImpactScreen,
})

ImpactStack.navigationOptions = {
  tabBarLabel: 'Impact',
  tabBarOptions: { 
    activeTintColor: Colors.appMainColor
  },
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name="pie"
    />
  )
};

const MessagesStack = createStackNavigator({
  Messages: MessagesScreen,
  Chat: ChatScreen
});

MessagesStack.navigationOptions = {
  tabBarLabel: 'Messages',
  tabBarOptions: { 
    activeTintColor: Colors.appMainColor
  },
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      //name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'}
      name="chatbubbles"
    />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
  Notifications: NotificationsScreen,
  Profile: ProfileScreen,
  EditProfile: EditProfileScreen,
  UpdatePassword: UpdatePasswordScreen
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'More',
  tabBarOptions: { 
    activeTintColor: Colors.appMainColor
  },
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name="more"
    />
  ),
};

export default createBottomTabNavigator({
  OpportunitiesStack,
  TrackTimeStack,
  ImpactStack,
  MessagesStack,
  SettingsStack,
});
