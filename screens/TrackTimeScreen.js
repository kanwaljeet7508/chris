import React, {Component} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Colors from '../constants/Colors';
import { Container, Content, Icon, Tab, Tabs, List, ListItem, Body, Left, Right, TabHeading, Item, Toast } from 'native-base';
import { _sendRequest } from './../api/HttpRequestsHandler';
import {Calendar} from 'react-native-calendars';
import  device  from './../constants/Layout';
import Modal from "react-native-modal";
import moment from 'moment';
import { AlertInfo } from '../components/AlertBoxes';

const ApprovalStatus = ({status}) => {
  if(status == 0 ) return <Text style={[styles.approvedText, {backgroundColor: 'blue'}]}>Pending</Text>
  else if(status == 1 ) return <Text style={styles.approvedText}>Approved</Text>
  else return <Text style={[styles.approvedText, { backgroundColor: 'red' }]}>Rejected</Text>

}

const TimeTrackModal = (props) => {
  return (
    <Modal 
      isVisible={props.isVisible}
      onBackdropPress={() => props.modalHandler()}
      swipeDirection="down"
      onSwipeComplete={() => props.modalHandler()}
    >
        <View style={{backgroundColor: 'white', padding: 10}}>
        <Text style={{ textAlign: 'center', fontWeight: 'bold'}}>List Of Opportunities Tracked On {props.selectedDate}</Text>

        {
          props.isLoading 
          ? <ActivityIndicator size="large" color={Colors.appMainColor} style={{marginTop: 15, marginBottom:15}} />
          :
            <FlatList
            data={props.data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={
              ({ item }) =>
                <Item style={{paddingBottom: 5, paddingTop: 5}} onPress={() => props.clickHandler(item.id) }>
                  <View>
                    <Text style={{fontWeight: '500'}}>{item.opp_name}</Text>
                    <Text>Tracked Time {`${item.started_time} - ${item.ended_time} (${item.logged_mins}) mins`}</Text>
                  </View>
                </Item>
              }
            /> 
        }
            <TouchableOpacity style={[styles.buttonContainer, {backgroundColor: '#bdc3c7', marginTop: 10}]} onPress={() => props.modalHandler()}>
              <Text style={{color: '#ffff'}}>Close</Text>
            </TouchableOpacity>
        </View>            
    </Modal>
  )
}

export default class TrackTimeScreen extends Component {

  state= {
    myTracks: [],
    activities: [],
    myOpportunities: [],
    trackedOpportunities: [],
    isLoading: true,
    markedDates: null,
    selectedDate: null,
    isModalVisible: false,
    showModalLoading: false
  };

  constructor(props) {
    super(props);
    //this.modalClickHandler = this.modalClickHandler.bind(this);
     // this will fire every time Page 1 receives navigation focus
    this.props.navigation.addListener('willFocus', () => {
      this.setState({isLoading: true})
      this.getTrackDetail();
    })
  }

  toggleModal = () => this.setState({isModalVisible: !this.state.isModalVisible})

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      title: 'Time Track',
      headerRight: (
        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => navigation.navigate('JoinOpportunityScreen')}>
          <Icon name='add-circle' style={{ color: Colors.appMainColor}}/>
        </TouchableOpacity>
      )

    };
  };
  
  componentDidMount() {
    this.getTrackDetail();
  }

  getTrackDetail = () => {
    _sendRequest('GET', '/api/volunteer/track')
    .then( res => {
      const { opprs, tracks, activity } = res.data;
      const markedDates =  tracks.reduce((c, v) => Object.assign(c, 
        {
          [v.logged_date]: {
            opporId: v.oppor_id,
            selected: true,
            marked: true,
            selectedColor: Colors.appMainColor
          }
        }
        ), {});
      this.setState({
        activities: activity,
        isLoading: false,
        myOpportunities: opprs|| [],
        myTracks: tracks,
        markedDates
      })
     // console.log(JSON.stringify(res.data)); 
    })
    .catch(error => {
      console.log(JSON.stringify(error));
    })
  }

  addHoursHandler({dateString}) {
    if(this.state.myOpportunities.length  === 0 ) {
      Toast.show({
        duration: 5000,
        text: 'You need to join an opportunity to track hours!!',
        buttonText: "Okay",
        style: {
          backgroundColor: Colors.noticeBackground
        }
      })
      this.props.navigation.navigate('JoinOpportunityScreen');
      return false;
    }
    const getOppor =  this.state.markedDates[dateString];
    if(getOppor !== undefined) {
      this.setState({
        showModalLoading: true,
        selectedDate:dateString,
        isModalVisible: true
      });
      _sendRequest('GET', `api/volunteer/track-by-date?date=${dateString}`)
      .then(res => {
        this.setState({trackedOpportunities: res.data})
      })
      .catch(err => {
        console.log(JSON.stringify(err));
      })
      .finally(() => this.setState({showModalLoading: false}))

    } else {
      this.props.navigation.navigate('AddHours', { opporId: null, trackDate: moment(dateString).format('MM/DD/YYYY') });
    }
  }
  
  modalClickHandler = (trackId) => {
    this.setState({ isModalVisible: false })
    this.props.navigation.navigate('AddHours', { trackId });
  }

  render() {
   
    return (
      <Container style={styles.container} >
        {
          this.state.isLoading 
          ? <View style={{flex:1, justifyContent: 'center'}}><ActivityIndicator size="large" color={Colors.appMainColor} /></View>
          : <>
            <TimeTrackModal
              data={this.state.trackedOpportunities} 
              isLoading={this.state.showModalLoading}
              modalHandler={this.toggleModal}
              isVisible={this.state.isModalVisible}
              selectedDate={this.state.selectedDate}
              clickHandler={this.modalClickHandler.bind(this)}
            />

            <Content>
            <Tabs transparent >
              <Tab heading={ 
                <TabHeading style={{ backgroundColor: Colors.appMainColor }}>
                    <Text style={{color: '#ffff', fontWeight: 'bold'}}>Add Hours</Text>
                </TabHeading>}>
                  <Calendar
                    // Specify style for calendar container element. Default = {}
                      style={{ height: device.window.height*0.43 }}
                      markedDates={this.state.markedDates}
                      // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
                      maxDate={moment().format('YYYY-MM-DD')}
                      //maximumDate={new Date()}
                      // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
                      //maxDate={'2012-05-30'}
                      // Handler which gets executed on day press. Default = undefined
                      onDayPress={(day) => {this.addHoursHandler(day)}}
                      // Handler which gets executed on day long press. Default = undefined
                      onDayLongPress={(day) => {console.log('selected day', day)}}
                      // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                      monthFormat={'MMMM yyyy'}
                      // Handler which gets executed when visible month changes in calendar. Default = undefined
                      onMonthChange={(month) => {console.log('month changed', month)}}
                      // Hide month navigation arrows. Default = false
                      hideArrows={false}                      
                      // Do not show days of other months in month page. Default = false
                      // hideExtraDays={true}
                      // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
                      // day from another month that is visible in calendar page. Default = false
                      // disableMonthChange={true}
                      // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
                      firstDay={1}
                      // Hide day names. Default = false
                      // Show week numbers to the left. Default = false
                      showWeekNumbers={true}
                      onPressArrowLeft={substractMonth => substractMonth()}
                      // Handler which gets executed when press arrow icon left. It receive a callback can go next month
                      onPressArrowRight={addMonth => addMonth()}
                    />
                  <View>
                    <Text style={{ fontWeight: 'bold', marginTop: 13, paddingLeft: 15}}>My Opportunities [{this.state.myOpportunities.length}]:</Text>
                    <List>
                      {
                        (this.state.myOpportunities.length === 0)
                        ? <ListItem><AlertInfo text="You don't have any joined Opportunities." /></ListItem>
                        : this.state.myOpportunities.map((item, index) => {
                        return(
                          <ListItem 
                          style={[ item.type ==2 ? styles.privateOpp : null ]}
                          key={index} 
                          onPress={() => this.props.navigation.navigate('AddHours', { opporId: item.id,  title: item.title})}>
                            <Left>
                              <Text>{item.title}</Text>
                            </Left>
                            <Right>
                              <Icon name="arrow-forward" />
                            </Right>
                          </ListItem>)
                        })
                      }                  
                    </List>
                  </View>
              </Tab>

              <Tab heading={ 
                <TabHeading style={{ backgroundColor: Colors.appMainColor }}>
                    <Text style={{color: '#ffff', fontWeight: 'bold'}}>My Activities</Text>
                </TabHeading>}>
                  <List>
                    {
                      (this.state.activities.length === 0) 
                      ? <ListItem><AlertInfo text="You don't have any activities." /></ListItem>
                      : this.state.activities.map((item, index) => {
                        return <ListItem key={index}>
                                  <Text>{`${item.content} ${item.oppor_title}`}</Text>
                               </ListItem>
                      }) 
                    }
                  </List>
              </Tab>
              
              <Tab heading={ 
                <TabHeading style={{ backgroundColor: Colors.appMainColor }}>
                    <Text style={{color: '#ffff', fontWeight: 'bold'}}>Pending Approvals</Text>
                </TabHeading>}>
                <List>
                    {
                      (this.state.myTracks.length === 0) 
                      ? <ListItem><AlertInfo text="You don't have any pending approvals." /></ListItem>
                      : this.state.myTracks.map((item, index) => {
                        return (
                          <ListItem style={{paddingBottom:5}} key={index}>
                              <Body>
                                <Text style={{fontWeight: 'bold'}}>{item.oppor_name}</Text>
                                <Text>From {item.started_time} to {item.ended_time} ({item.logged_mins} mins)</Text>
                                <Text>{item.logged_date}</Text>
                              </Body>
                              <Right><ApprovalStatus  status={item.approv_status}/></Right>
                          </ListItem>
                        )
                      })
                    }
                </List>
              </Tab>
            </Tabs>
            </Content>
            </>
        }
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  privateOpp: {
    backgroundColor: '#ff7a39',
    color: '#fff',
    marginRight: 5
  },
  approvedText: {
    color: 'white',
    backgroundColor: Colors.appMainColor,
    paddingTop:14,
    paddingBottom:14,
    paddingLeft:5,
    paddingRight:5
  },
  buttonContainer: {
    height:40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:5,
    marginTop: 5
  },
});
