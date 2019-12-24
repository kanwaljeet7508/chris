import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  View
} from 'react-native';
import { Container, Content, List, ListItem, Left, Right, Icon  } from 'native-base';
import { _multiRemove } from './../api/AsyncStorage';
import Fire from '../api/Fire';
export default class SettingsScreen extends Component {
  static navigationOptions = {
    title: 'More',
  };

  state =  { isLoading: false }
  logoutHandler(){
    this.setState({isLoading: true});
    _multiRemove(['token', 'loggedINUser', 'fire_base_token']).then(err => {
      if(!err) {
        Fire.shared.logout(); // logout active firebase user
        setTimeout(() => this.props.navigation.navigate('Login'), 1000)
      }
    })
  }

  constructor(props) {
    super(props);
    this.logoutHandler = this.logoutHandler.bind(this);
  }

  render() {
    if(this.state.isLoading ) {
    return <View  style={{flex:1, justifyContent: 'center'}}><ActivityIndicator size="large" color="#3bb44a" /></View>
    }
    else {
    return (
      <Container>
        <Content>
          <List>
            <ListItem onPress={() => this.props.navigation.navigate('Profile')}>
            <Left>
                <Text>Profile</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
            <ListItem onPress={() => this.props.navigation.navigate('Notifications')}>
              <Left>
                <Text>Notifications</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
           {/* <ListItem onPress={() => this.props.navigation.navigate('UpdatePassword')}>
              <Left>
                <Text>Update Password</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
            */}
            <ListItem style={{ borderBottomWidth: 0, marginTop:25}} onPress={this.logoutHandler}>
              <Left>
                <Icon name="log-out" style={{color: 'red'}}/>
                <Text style={{color: 'red'}}>Logout</Text>
              </Left>
            </ListItem>
          </List>
        </Content>
      </Container>
    )}
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
