import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';

 import MapView from 'react-native-maps';

//import { MapView } from react-native-map

import { Container, Content, Input, Icon, Tab, Tabs, Button,  List, ListItem, Thumbnail, Body, Left, Right,  Card, CardItem, Item, TabHeading } from 'native-base';
import Modal from "react-native-modal";
import  device  from './../constants/Layout';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Colors from '../constants/Colors';
import { _storeData, _retrieveData, _multiRemove, _getLoggedInUser, _multiGet } from './../api/AsyncStorage';
import   request from './../api/Request';
import ImageLoader from '../components/ImageLoader';

const OpportunitiesList = (props) => {
 return (
  <Container>
  <Content>
  <List>
    {
      props.opportunities.map((item, index) => {
      const { logo_img } = item;
      const logo = logo_img
      ?  device.assetsPath + logo_img
      : null;

      return <ListItem thumbnail key={index} onPress={() => props.opportunityDetail(item.id)}>
            <Left>
                <ImageLoader  src={logo} style={{width: 65, height: 70}}/>
            </Left>
            <Body>
                <Text style={{ fontWeight: 'bold'}}>{item.title}</Text>
                <Text note numberOfLines={2}>{item.description}</Text>
            </Body>
        </ListItem>
      })
    }
  </List>
  </Content>
</Container>
 );
} 

export default class OpportunitiesScreen extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      title: 'Opportunities',
      headerRight: (
        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => params.handleThis()}>
          <Text style={{fontSize: 14, color: '#2e78b7'}}>Filters</Text>
        </TouchableOpacity>
      )
    };
  };

  constructor(props) {
    super(props);    
    this.state = {
      userRegion: null,
      opportunitiesTypes: [],
      organizationTypes: [],
      activeOpportunities: [],
      isLoading: false,
      scrollOffset: 0,
      showFilterModal: false,
      currentLocation: null,
      searchKeyword: null,
      selectedOpportunities : [],
      selectedOrganizations : [],
      opportunities: [],
      allOpportunities: [],
      startDate: "MM/DD/YYYY",
      endDate: "MM/DD/YYYY",
      showPickerFor: null
    };

    this.handleSearchFilter = this.handleSearchFilter.bind(this);
    this.opportunityDetailHandler = this.opportunityDetailHandler.bind(this);
  }

  setFilterModal = () => {
    this.setState({
      showFilterModal: !this.state.showFilterModal,
      isDateTimePickerVisible: false
     })
  }

  showDateTimePicker = (type) => {
    this.setState({ isDateTimePickerVisible: true, showPickerFor: type });
  }

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  }

  handleDatePicked = date => {
    this.setState({ [this.state.showPickerFor] : moment(date).format("MM/DD/YYYY") });
    console.log("A date has been picked: ", date);
    this.hideDateTimePicker();
  };

async componentDidMount() {
  this.setState({ isLoading: true });
  this.props.navigation.setParams({
      handleThis: this.setFilterModal
  });

  await _retrieveData('token').then(token => {
    if(token !== null) {
      this.checkLoginUser();
      request({
        url:    '/api/volunteer/opportunities',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
        }).then( response => {
          const { search_addr, opr_type, org_type, active_opprs} = response.data;
          const opportunitiesTypes = [{
            name: "Opportunities Types",
            id: 0,
            children: opr_type
          }]

          const organizationTypes = [{
            name: "Organization Types",
            id: 0,
            children: org_type
          }]

          this.setState({
            isLoading: false,
            opportunitiesTypes,
            organizationTypes,
            opportunities:active_opprs,
            allOpportunities:active_opprs,
          })
          
        }).catch ( err => {
          console.log(err);
          this.setState({ isLoading: false });
        })
    } else {
      this.props.navigation.navigate('Login');
    }
  })
}

 async checkLoginUser () {
  await _retrieveData('loggedINUser').then(user => {
    if(user === null) {
      _getLoggedInUser().then(response => {
        console.log('fetched logged In user', response);
      })
    }
  })
 }

  handleClearFilter= () => {
    this.setState({
      selectedOpportunities : [],
      selectedOrganizations : [],
      startDate: 'MM/DD/YYYY',
      endDate: 'MM/DD/YYYY',
      searchKeyword: null,
      searchLocation: null,
      opportunities: this.state.allOpportunities
    })
  }

 async handleSearchFilter()  {
    this.setState({ isLoading: true, showFilterModal: false })
    const filter = {
      opp_types: this.state.selectedOpportunities.toString(),
      org_types: this.state.selectedOrganizations.toString(),
      start_date:this.state.startDate,
      end_date:  this.state.endDate,
      location: this.state.searchLocation,
      keyword: this.state.searchKeyword
    };

    const queryString = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
    await _retrieveData('token').then(token => {
      if(token !== null){
        request({
          url:    `/api/volunteer/opportunities/get-search-results?${queryString}`,
          method: 'GET',
          headers: {
              Authorization: `Bearer ${token}`
          }
          }).then( response => {
            const { oppr } = response.data;
            console.log(oppr.length)
            this.setState({
              isLoading: false,
              allOpportunities: this.state.opportunities,
              opportunities:oppr
            })
            
          }).catch ( err => {
            this.setState({ isLoading: false });
          })
      } else {
        this.setState({ isLoading: false });
      }
    })
   // alert(queryString)
 }

  opportunityDetailHandler(opporId) {
    this.props.navigation.navigate('OpportunityDetail', {opporId })
  }

  onSelectedOpportunityChange = (selectedItems) =>  this.setState({ selectedOpportunities: selectedItems });

  onSelectedOrganizationChange = (selectedItems) =>  this.setState({ selectedOrganizations: selectedItems });
 
  handleOnScroll = event => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y
    })
  };

  handleScrollTo = p => {
    if (this.scrollViewRef) {
      this.scrollViewRef.scrollTo(p);
    }
  };

  render() {
    return (
      <Container>
        <Modal 
          onSwipeComplete={this.setFilterModal}
          swipeDirection="down"
          scrollTo={this.handleScrollTo}
          scrollOffset={this.state.scrollOffset}
          scrollOffsetMax={400 - 300} // content height - ScrollView height
          isVisible={this.state.showFilterModal}
        >
        <ScrollView
              ref={ref => (this.scrollViewRef = ref)}
              onScroll={this.handleOnScroll}
              scrollEventThrottle={16}>
          <Card>
            <CardItem header bordered>
              <Left>
                  <Text style={{ fontWeight: 'bold' }}>Filter</Text>
              </Left>
              <Right>
                <TouchableOpacity  onPress={this.setFilterModal}>
                  <Icon name="close" />
                </TouchableOpacity>
              </Right>
            </CardItem>
        
            <CardItem>
              <Body>
              
                <Text style={{ fontWeight: 'bold', marginBottom:5}}>Location:</Text>
                <Item regular style={{ marginBottom: 5, borderRadius: 5}}>
                  <Icon active name='paper-plane' />
                  <Input 
                    placeholder='Current Location'
                    value={this.state.currentLocation}
                    onChangeText={ currentLocation => this.setState({currentLocation})}
                    returnKeyType="go"
                  />
                </Item>

                <Item regular style={{ marginBottom: 5, borderRadius: 5}}>
                  <Icon active name='search' />
                  <Input 
                    placeholder='Search Keyword' 
                    value={this.state.searchKeyword}
                    onChangeText={ searchKeyword => this.setState({searchKeyword})} 
                  />
                </Item>

              <Text style={{ fontWeight: 'bold', marginTop: 7, marginBottom:5}}>Opportunity Types:</Text>
              <Item >
                <View style={{ flex: 1}}>
                  <SectionedMultiSelect
                    colors={{
                      primary: Colors.appMainColor
                    }}
                    items={this.state.opportunitiesTypes}
                    uniqueKey='id'
                    subKey='children'
                    expandDropDowns={true}
                    alwaysShowSelectText={true}
                    iconKey='icon'
                    selectText='Select Opportunities Type...'
                    showDropDowns={true}
                    searchPlaceholderText='Search Opportunities...'
                    readOnlyHeadings={true}
                    onSelectedItemsChange={ this.onSelectedOpportunityChange }
                    selectedItems={this.state.selectedOpportunities}
                  />
                </View>
              </Item>

              <Text style={{ fontWeight: 'bold', marginTop: 7, marginBottom:5}}>Organization Types:</Text>
              <Item >
                <View style={{ flex: 1}}>
                  <SectionedMultiSelect
                    colors={{
                      primary: Colors.appMainColor
                    }}
                    items={this.state.organizationTypes}
                    uniqueKey='id'
                    subKey='children'
                    expandDropDowns={true}
                    alwaysShowSelectText={true}
                    iconKey='icon'
                    selectText='Select Organization Types...'
                    showDropDowns={true}
                    searchPlaceholderText='Search Organizations...'
                    readOnlyHeadings={true}
                    onSelectedItemsChange={this.onSelectedOrganizationChange}
                    selectedItems={this.state.selectedOrganizations}
                  />
                </View>
              </Item>


              <Text style={{ fontWeight: 'bold', marginTop: 7, marginBottom:5}}>Date Range:</Text>
              <View style={styles.dateContainer} >
                <View style={styles.leftContainer}>
                    <Text style={ {textAlign: 'left', color: '#828282'}}>From: </Text>
                </View>
                <View style={styles.rightContainer}>
                  <TouchableHighlight  onPress={() => this.showDateTimePicker('startDate')} >
                  <Text style={{color: '#828282'}}> {this.state.startDate} </Text>
                  </TouchableHighlight>
                </View>
              </View>

              <View style={styles.dateContainer} >
                <View style={styles.leftContainer}>
                    <Text style={ {textAlign: 'left', color: '#828282'}}>To: </Text>
                </View>
                <View style={styles.rightContainer}>
                  <TouchableHighlight  onPress={() => this.showDateTimePicker('endDate')} >
                  <Text style={{color: '#828282', fontSize: 14,  alignItems: 'center'}}>{this.state.endDate}</Text>
                  </TouchableHighlight>
                </View>
              </View>

                <DateTimePicker
                  isVisible={this.state.isDateTimePickerVisible}
                  onConfirm={this.handleDatePicked}
                  onCancel={this.hideDateTimePicker}
                />
              </Body>
            </CardItem>
             <CardItem footer bordered>
              <Content>
                <TouchableOpacity style={[styles.buttonContainer, {backgroundColor: Colors.appMainColor}]} onPress={this.handleSearchFilter}>
                  <Text style={styles.btnText}>Apply Filters</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttonContainer, styles.clearButton]} onPress={this.handleClearFilter}>
                  <Text style={styles.btnText}>Clear Filters</Text>
                </TouchableOpacity>
              </Content>
            </CardItem>
         </Card>
         </ScrollView>        
      
      </Modal>
        <Tabs  transparent >
        <Tab heading={ 
          <TabHeading style={{ backgroundColor: Colors.appMainColor }}>
              <Text style={{color: '#ffff', fontWeight: 'bold'}}>Map</Text>
          </TabHeading>}>
          {
          this.state.isLoading ? <View style={{ flex: 1, justifyContent: 'center'}}><ActivityIndicator size="large" color="#3bb44a" /></View>:
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 34.00071,
                longitude: -81.03481,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
            {
              this.state.opportunities.map((marker, index) => {
                const coords = {
                    latitude: Number(marker.lat),
                    longitude: Number(marker.lng),
                };
                return (
                  <MapView.Marker  key={index}   coordinate={coords}>
                      <MapView.Callout onPress={ () =>  this.props.navigation.navigate('OpportunityDetail', {opporId: marker.id }) }>
                          <View style={{ padding: 10}}>
                            <Text style={{fontWeight: 'bold', marginBottom: 5}}>
                              {`${marker.title}`}
                            </Text>
                            <Text>
                              {`${marker.start_date} - ${marker.end_date}`}
                            </Text>
                          </View>
                      </MapView.Callout>
                    </MapView.Marker>
                );
              })
            }
          </MapView>
          }
        </Tab>
        <Tab  heading={<TabHeading style={{ backgroundColor: Colors.appMainColor }}>
            <Text style={{color: '#ffff', fontWeight: 'bold'}}>List</Text>
        </TabHeading>}>
        {
          this.state.isLoading ? <View style={{ flex: 1, justifyContent: 'center'}}><ActivityIndicator size="large" color="#3bb44a" /></View>:
          <OpportunitiesList opportunities={this.state.opportunities} opportunityDetail={this.opportunityDetailHandler}/>
        }
        </Tab>
      </Tabs>
    </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:15,
    width:device.window.width*0.80,
    borderRadius:5
  },
  dateContainer : {
    height: 50,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius:5,
    borderColor: '#828282',
    borderWidth: 0.5
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },

  clearButton: {
    backgroundColor: '#bdc3c7',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold'
  },

});
