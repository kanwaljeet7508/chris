import React, { Component } from 'react';
import { StyleSheet, Text, View,Image, ActivityIndicator } from 'react-native';
import { Container, Content, List, ListItem, Button, Toast } from 'native-base';
import Colors from '../constants/Colors';
import device from '../constants/Layout';
import { _getLoggedInUser, _retrieveData } from '../api/AsyncStorage';
import moment from 'moment';

const ItemDetail = ({title, detail}) => {
    return (
    <>
        <ListItem itemDivider>
            <Text style={{fontWeight: 'bold'}}>{title}</Text>
        </ListItem>
        <ListItem>
            <Text>{detail}</Text>
        </ListItem>
    </>
    )
}

export default class ProfileScreen extends Component {
   
    static navigationOptions = ({ navigation }) => ({
      title:  'Profile'
    });
      
    constructor(props) {
      super(props);
       // this will fire every time Page 1 receives navigation focus
      this.props.navigation.addListener('willFocus', () => {
        this.setState({isLoading: true})
        this.getUserProfile();
      })
    }

    state = {
        haveProfileCover: false,
        isLoading: true, 
        userDetail: [],
    };

    componentDidMount() {
      this.getUserProfile();
    }
  
    getUserProfile = () => {
      _retrieveData('loggedINUser').then(user => {
        if(!user) return this.loggedInUser();
        const userDetail = JSON.parse(user);
        this.setState({isLoading: false, userDetail})
    }).catch(e => this.loggedInUser())
    }

    async loggedInUser() {
      await _getLoggedInUser()
      .then(user => { 
        this.setState({isLoading: false, userDetail:  user})
      }).catch(err => {
        Toast.show({
          duration: 10000,
          text:'Something went wrong, try again later!!',
          buttonText: "Okay",
          type: "danger"
        })
    })
    .finally(() => this.setState({isLoading: false }))

    }

  render() {

    if(this.state.isLoading ) {
      return <View  style={{flex:1, justifyContent: 'center'}}><ActivityIndicator size="large" color={Colors.appMainColor} /></View>
    }
    else {
      const {first_name, last_name, summary, email, user_name, birth_date, zipcode, contact_number, logo_img, back_img, profile_info } = this.state.userDetail;
      console.log(logo_img, back_img)
      return (
        <Container>
            <Content>
                {
                    (back_img) ? <Image style={styles.header} source={{uri: back_img}}/>
                    : <View style={[styles.header, { backgroundColor: Colors.appMainColor }]}/> 

                }
                <View style={{ position: 'absolute',marginTop:device.window.height*0.02, alignSelf:'center'}}>
                    <Image style={styles.avatar} source={{
                        uri: ( logo_img ? logo_img : 'https://bootdey.com/img/Content/avatar/avatar6.png' )
                    }}/>
                    <Text style={styles.name}>{`${first_name} ${last_name}`}</Text>
                </View>
                <View style={styles.profileDetail}>
                    <View style={[styles.detailContent, {width: device.window.width*0.31}]}>
                        <Text style={styles.count}> {profile_info.friends_count} </Text>
                        <Text style={styles.title}>Friends</Text>
                    </View>
                    <View style={[styles.detailContent, styles.groupsDetail]}>
                        <Text style={styles.count}> {profile_info.groups_count} </Text>
                        <Text style={styles.title}>Groups</Text>
                    </View>
                    <View style={[styles.detailContent, {width: device.window.width*0.35}]}>
                        <Text style={styles.count}> {profile_info.opportunities_count} </Text>
                        <Text style={styles.title}>Opportunities</Text>
                    </View>
                </View>                
                <List>
                    <ItemDetail title={"My Summary"} detail={summary}  />               
                    <ItemDetail title={"User ID"} detail={user_name} />
                    <ItemDetail title={"Contact Email"} detail={email} />
                    <ItemDetail title={"Phone Number"} detail={contact_number} />
                    <ItemDetail title={"Age"} detail={
                      birth_date ? moment().diff(new Date(birth_date).toISOString(), 'years')
                      : 'N/A'
                    } />
                    <ItemDetail title={"ZipCode"} detail={zipcode} />
                </List>
                <View style={{ padding: 6 }}>
                    <Button 
                      block 
                      style={{marginBottom:5, backgroundColor: Colors.appMainColor}} 
                      onPress={() => this.props.navigation.navigate('EditProfile')}>
                        <Text style={{color:'#fff'}}>Edit Profile</Text>
                    </Button>
                    <Button 
                      block
                      style={{backgroundColor: Colors.appMainColor}} 
                      onPress={() => this.props.navigation.navigate('UpdatePassword')}>
                      <Text style={{color:'#fff'}}>Change Password</Text>
                    </Button>
                </View>
            </Content>
        </Container>
      );
    }
  }
}

const styles = StyleSheet.create({
  header:{
    height:device.window.height*0.30,
    width:device.window.width,
  },
  avatar: {
    width: 125,
    height: 125,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom:10,
    alignSelf:'center'
  },
  name:{
    fontSize:22,
    color:"#FFFFFF",
    fontWeight:'600',
    alignSelf:'center',
    paddingBottom: device.window.height*0.06,
   
  },
  profileDetail:{
    width: device.window.width,
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.appMainColor,
    paddingBottom: 7
  },
  groupsDetail: {
    width: device.window.width*0.32,
    borderLeftWidth:0.8,
    borderRightWidth:0.8,
    borderLeftColor:'#ffff',
    borderRightColor: '#ffff'
  },
  detailContent:{
    alignItems: 'center'
  },
  title:{
    fontSize:20,
    color: "#ffff"
  },
  count:{
    fontStyle: 'italic',
    color: "#ffff",
    fontSize:21,
    fontWeight: 'bold',
  },
});
 