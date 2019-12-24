import React, { Component } from 'react';
import ImageLoader from '../components/ImageLoader';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { _sendRequest } from './../api/HttpRequestsHandler';
import { Container, Content, List, ListItem,  Body, Left, Right, Segment, Toast, Thumbnail } from 'native-base';
import Colors from '../constants/Colors';
import  device  from './../constants/Layout';
import moment from 'moment';

export default class NotificationsScreen extends Component {
    static navigationOptions = {
        title: 'Notifications',
    };
    
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      isLoading: true
    };
  }

  componentDidMount(){
    _sendRequest('GET', '/api/volunteer/getNotifications')
    .then(res => {
      const { notifications } = res.data;
      this.setState({isLoading: false, notifications})
    })
    .catch(err => {
      this.setState({ isLoading: false })
    })
  }

  render() {
    return (
      <Container style={styles.container}>
         {
          this.state.isLoading 
          ? <View style={{flex:1, justifyContent: 'center'}}><ActivityIndicator size="large" color={Colors.appMainColor} /></View>
          :
            <Content>
            <List>
              {
                this.state.notifications.length === 0 
                ? <ListItem style={{borderBottomWidth: 0}}>
                    <Body>
                        <Text style={{ fontWeight: 'bold', backgroundColor: '#d1ecf1', padding: 12, color: '#0c5460', textAlign: 'center'}}>You don't have any notifications.</Text>
                    </Body>
                  </ListItem>
                : this.state.notifications.map((item, index) => {
                  return (
                      <ListItem thumbnail style={{padding:0}} key={index}>
                        <Left>
                          <Thumbnail square  source={
                            item.sender_logo
                            ? {uri:  device.assetsPath+item.sender_logo}
                            : require('../assets/images/member-logo.png')
                          } style={{ width: 75, height: 75 }} />
                        </Left>
                        <Body>
                            <Text><Text style={{fontWeight: 'bold'}}>{item.sender_name} </Text>{item.contents}</Text>
                            <Text style={{marginTop: 5,fontSize: 12}}>{item.sender_type}</Text>
                            <Text style={{fontSize: 12}}> { moment(item.date.date, "YYYY-MM-DD h:mm:ss").fromNow() }</Text>
                        </Body>
                    </ListItem>
                  );
                })

              }               
            </List>
        </Content>
         }
      </Container>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 7
    }
  });