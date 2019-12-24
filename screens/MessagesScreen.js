import React from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  YellowBox
} from 'react-native';
import { Content, Tab, Tabs, List, ListItem, Body, Left,TabHeading } from 'native-base';
import Colors from '../constants/Colors';
import { _sendRequest } from './../api/HttpRequestsHandler';
import { _retrieveData } from '../api/AsyncStorage';
import Fire from '../api/Fire';
import * as _ from 'lodash'
import { AlertInfo } from '../components/AlertBoxes';


YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

const ListUsers = (props) => {
  return (
    <List>
    <ListItem thumbnail onPress={props._onPress}>
      <Left>
        <Image 
        source={{uri: props.photo}}
        defaultSource={require('../assets/images/thumbnail.png')} 
        style={{width: 40, height: 40, borderRadius: 40/ 2}}/>
      </Left>
      <Body>
          <Text style={{ fontWeight: 'bold'}}>{props.title}</Text>
      </Body>
      
    </ListItem>
  </List>
  )
}

export default class MessagesScreen extends React.Component {
  static navigationOptions = {
    title: 'Messages',
  };

  constructor(props){
    super(props);
    this.state ={ 
      chats: {},
      friends: [],
      groups: [],
      isLoading: true,
      organizations: []
    }
  }

 
  componentDidMount() {
   this.getContacts()
   setTimeout(() => this.setState({isLoading: false}), 8000) //0.13
  }

  getContacts = () => {
    _retrieveData('fire_base_token').then(token => { 
       Fire.shared.loginUser(token).then(res => {
          Fire.shared.getUserContacts( contact => {
            const contactType = contact.key;
            const contacts = contact.val();
            _.map(contacts, (item, chatId) => {      
              Fire.shared.getChat(chatId, chat => {
                chat = chat.val();  
                if (chat !== null )  {
                  const {Id, name,  photo} = chat;
                this.mapUserContacts(contactType, {
                  Id,
                  name,
                  photo,
                  contact_name: item
                })
              }
              })
            })
          })
      })
    })
  }

  mapUserContacts = (type, data) => {
    this.setState(prevState => ({
      [type]: [...prevState[type], data]
    }))
  }

  render(){
    return(
      <ScrollView style={styles.container}>
        <Tabs transparent >
          <Tab heading={ 
            <TabHeading style={{ backgroundColor: Colors.appMainColor }}>
                <Text style={{color: '#ffff', fontWeight: 'bold'}}>Groups</Text>
            </TabHeading>}>
            <Content>
              {
                this.state.isLoading 
                ? <ActivityIndicator size="large" color={Colors.appMainColor} />
                :
                this.state.groups.length > 0 ? 
                this.state.groups.map( (item, index) => {
                  return  <ListUsers 
                  key={index}
                  photo={item.photo}
                  title={`${item.contact_name || 'N/A'}`} 
                  id={item.Id} 
                  _onPress={
                    () =>   this.props.navigation.navigate('Chat', { chatId: item.Id })
                  }/>
                })
                : <AlertInfo  text={"You don't have any group joined!!"}/>
              }
            </Content>
          </Tab>
          <Tab heading={ 
            <TabHeading style={{ backgroundColor: Colors.appMainColor }}>
                <Text style={{color: '#ffff', fontWeight: 'bold'}}>Organizations</Text>
            </TabHeading>}>
            <Content>
              {
                this.state.isLoading 
                ? <ActivityIndicator size="large" color={Colors.appMainColor} />
                :
                this.state.organizations.length > 0 ? 
                this.state.organizations.map( (item, index) => {
                  return  <ListUsers 
                  key={index}
                  photo={item.photo}
                  title={`${item.contact_name || 'N/A'}`} 
                  id={item.Id} 
                  _onPress={
                    () =>   this.props.navigation.navigate('Chat', { chatId: item.Id })
                  }/>
                })
                : <AlertInfo  text={"You don't have any organization joined!!"}/>
              }
            </Content>
          </Tab>
          <Tab heading={ 
            <TabHeading style={{ backgroundColor: Colors.appMainColor }}>
                <Text style={{color: '#ffff', fontWeight: 'bold'}}>Friends</Text>
            </TabHeading>}>
            <Content>
              {
                this.state.isLoading 
                ? <ActivityIndicator size="large" color={Colors.appMainColor} />
                :
                this.state.friends.length > 0 ? 
                this.state.friends.map( (item, index) => {
                  return  <ListUsers 
                  key={index}
                  photo={item.photo}
                  title={`${item.contact_name || 'N/A'}`} 
                  id={item.Id} 
                  _onPress={
                    () =>   this.props.navigation.navigate('Chat', { chatId: item.Id })
                  }/>
                })
                : <AlertInfo  text={"You don't have any friend joined!!"}/>
              }
            </Content>
          </Tab>
        </Tabs>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
