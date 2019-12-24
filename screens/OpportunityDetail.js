import React, { Component } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Container, Content, Button,  List, ListItem,  Body, Left, Right, Segment, Toast, Icon, Badge } from 'native-base';
import { _storeData, _retrieveData, _multiRemove } from './../api/AsyncStorage';
import { _sendRequest } from './../api/HttpRequestsHandler';
import  device  from './../constants/Layout';
//import { MapView } from 'expo';
import Colors from '../constants/Colors';
import   request from './../api/Request';
import ImageLoader from '../components/ImageLoader';
import _ from 'lodash';

const DetailItem = ({title, description}) => {
  return (
    <View style={{marginBottom:10}}>
      <Text style={{fontWeight: 'bold'}}>{ `${title}:` }</Text>
      <Text>{ `${description}` }</Text>
    </View>
  );
}

const DetailTab = (props) => {
  const detail = props.detail;
 return(
  <Content>
      <DetailItem title='Opportunity Type' description={detail.opportunity_type}/>
      <DetailItem title='Opportunity Code' description={detail.code ? detail.code : 'N/A'}/>
      <DetailItem title='Content Name' description={detail.contact_name}/>
      <DetailItem title='Contact Email' description={detail.contact_email}/>
      <DetailItem title='Contact Number' description={detail.contact_number}/>
      <DetailItem title='Qualifications' description={detail.qualification}/>
      <DetailItem title='Date' description={`${detail.start_date} - ${detail.end_date}`}/>
      <DetailItem title='Time' description={`${detail.start_at} - ${detail.end_at}`}/>
      <DetailItem title='Days of Week' description={detail.weekdays}/>
      <DetailItem title='Minimum Age' description={detail.min_age}/>
    </Content>  
 )
}

const MembersTab = (props) => {
  const members = props.members;
  return (
    <View>
      <List>
      {
        members.length === 0
        ?
          <ListItem style={{borderBottomWidth: 0}}>
              <Body>
                  <Text style={{ fontWeight: 'bold', backgroundColor: '#d1ecf1', padding: 12, color: '#0c5460'}}>This Opportunity doesn't have any Member.</Text>
              </Body>
          </ListItem>
        :
          members.map((member, index) => {
          return <ListItem key={index}>
              <Body>
                  <Text style={{ fontWeight: 'bold'}}>{`${member.first_name} ${member.last_name}`}</Text>
                  <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>{member.email}</Text>
                  <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>{member.contact_number}</Text>
              </Body>
            </ListItem>
          })
      }
      </List>
    </View>
  )
}

const AddressTab = (props) => {
  const detail = props.detail;
  const coords = {
    latitude: Number(detail.lat),
    longitude: Number(detail.lng)
};
   return (
    <View>
      <MapView
        style={{ alignSelf: 'stretch', height: device.window.height*0.43, marginBottom:8 }}
        region={{ latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
        >
        <MapView.Marker
        coordinate={coords}
        title={detail.title}
        description={`${detail.start_date} to ${detail.end_date}`}
        />
      </MapView>
      <DetailItem title="Address" description={`${detail.street_addr1}, ${detail.city}, ${detail.state}, ${detail.zipcode}`}/>
    </View>
   );
}

export default class OpportunityDetail extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      title: 'Opportunity Detail',
      headerRight: (
        params.isLoading == false ? 
          <TouchableOpacity style={{ marginRight: 10 }} 
            onPress={
              params.isMember 
              ? navigation.getParam('addHoursHandler')
              : navigation.getParam('joinOpportunity')
              }>
            <Icon name='add-circle' style={{ color: Colors.appMainColor}}/>
          </TouchableOpacity>
        : null
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isMember: null, //opportunity member
      isLoading:true,
      opporDetail:null,
      opportunityMembers:[],
      opporId: null,
      seg: 1
    };
  }

  componentDidMount(){
    const { navigation } = this.props;
    const opporId = navigation.getParam('opporId', 0);
    this.setState({opporId})
    navigation.setParams({
      isLoading: true
    });
    this.getOpportunityDetail();
  } 

  _setHeaderParams = (isMember) => {
    const { navigation } = this.props;
    navigation.setParams({ 
      addHoursHandler: this._addHoursHandler,
      joinOpportunity: this._joinOpporHandler,
      isLoading: false,
      isMember
     });
  }

  _addHoursHandler = () => {
    return this.props.navigation.navigate('AddOppHours', { opporId: this.state.opporId })
  }

  //Join Single Opportunity Public or Private(need PassCode)
  _joinOpporHandler = () => {
    this.setState({isLoading: true})
    const opporId = this.state.opporId;
    if(opporId) {
      _sendRequest('POST', '/api/volunteer/opportunity-join', {
        oppor_id: opporId
      })
      .then( res => {
        Toast.show({
          duration: 3000,
          text: res.message || 'You have joined this opportunity!!',
          buttonText: "Okay",
          type: "success"
        })
        this._setHeaderParams(true) 
      })
      .catch(err => {
        if(err == 'TOKEN_ERROR') {
          error = 'Unauthenticated!!';
          setTimeout(() => this.props.navigation.navigate('Auth'), 2000)
        } else {
          error = err.data.message || 'Unable to join this opportunity!!'
        } 
          Toast.show({
            duration: 6000,
            text: error, 
            buttonText: "Okay",
            type: "danger"
          })
      }).finally( () => this.setState({isLoading: false}))
    }
  }

  async getOpportunityDetail() {
    await _retrieveData('token').then(token => {
      if(token !== null){
        request({
          url:  `/api/volunteer/opportunity/${this.state.opporId}`,
          method: 'GET',
          headers: {
              Authorization: `Bearer ${token}`
          }
          }).then( response => {
            const { oppr_info, is_member } = response.data;
            const opporMembers = oppr_info.opportunity_member;
            let members = [];
            if(opporMembers.length > 0) {
              members = _.map(opporMembers, 'user');
            }
            this._setHeaderParams(is_member===1 ? true : false)
            this.setState({
              isMember: is_member,
              opportunityMembers: members,
              opporDetail: oppr_info,
              isLoading:false
            })
          }).catch(err => {
            const { status } = err;
            if(status === 404) {
              Toast.show({
                text: "Opportunity detail not found!!",
                buttonText: "Okay",
                type: "danger"
              })
            }
            setTimeout(() => this.props.navigation.navigate('Home'), 1300)
          })
    }
  })
  }

  render() {
    if(this.state.isLoading ) {
      return <View style={{ flex: 1, justifyContent: 'center'}}><ActivityIndicator size="large" color={Colors.appMainColor} /></View>
    } else {
      const opporDetail  = this.state.opporDetail;
      const { logo_img, is_member } = opporDetail;
      const opporLogo = logo_img
      ?  device.assetsPath + logo_img
      : null;
      return (
        <Container>
          <Content>
            <List>
              <ListItem thumbnail>
                <Left>
                  <ImageLoader src={opporLogo}  style={{width: 65, height: 70}}/>
                </Left>
                <Body>
                    { this.state.opporDetail.private_passcode 
                      ? <Icon name="lock" style={{ color: Colors.appMainColor}}/>
                      : null 
                    }

                    {
                      this.state.isMember== 1 
                      ? <Badge success>
                          <Text style={{ color: '#ffff', paddingTop: 3, fontWeight: 'bold'}}>Joined(Member)</Text>
                        </Badge>
                      : null
                    }  
                    <Text style={{ fontWeight: 'bold'}}>
                     {this.state.opporDetail.title}
                    </Text>
                    <Text>{this.state.opporDetail.org_name}</Text>
                </Body>
              </ListItem>
              <ListItem>
                <Body>
                  <Text>{this.state.opporDetail.description}</Text>
                </Body>
              </ListItem>
            </List>
            <Segment style={{flex: 1, width: device.window.width*0.80, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
              <Button
                style={[ this.state.seg === 1 ? styles.activeSegment : styles.segment , { borderBottomLeftRadius: 30, borderTopLeftRadius:30, borderLeftWidth: 0.6, borderLeftColor: Colors.appMainColor}]}
                active={this.state.seg === 1 ? true : false}
                onPress={() => this.setState({ seg: 1 })}
              >
                <Text style={[ this.state.seg === 1 ? styles.activeSegmentText : styles.segmentText]}>Details</Text>
              </Button>
              <Button
                style={[ this.state.seg === 2 ? styles.activeSegment : styles.segment] }
                active={this.state.seg === 2 ? true : false}
                onPress={() => this.setState({ seg: 2 })}
              >
                <Text style={[ this.state.seg === 2 ? styles.activeSegmentText : styles.segmentText]}>Members</Text>
              </Button>
              <Button
                last
                style={[ this.state.seg === 3 ? styles.activeSegment : styles.segment , {borderTopRightRadius: 30, borderBottomRightRadius:30}]}
                active={this.state.seg === 3 ? true : false}
                onPress={() => this.setState({ seg: 3 })}
              >
                <Text style={[ this.state.seg === 3 ? styles.activeSegmentText : styles.segmentText]}>Address</Text>
              </Button>
            </Segment>
            <Content padder style={{marginLeft: 10}}>
              {this.state.seg === 1 && <DetailTab detail={this.state.opporDetail}/>  }
              {this.state.seg === 2 && <MembersTab members={this.state.opportunityMembers}/> }
              {this.state.seg === 3 && <AddressTab detail={this.state.opporDetail}/> }
            </Content>
          </Content>
        </Container>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segment: {
    width:120,
     borderWidth: 0.6,
     justifyContent: 'center',
     borderColor: Colors.appMainColor
  },

  segmentText: {
    color: Colors.appMainColor
  },

  activeSegmentText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  activeSegment: {
    width:120,
    justifyContent: 'center',
    backgroundColor: Colors.appMainColor
  }
});