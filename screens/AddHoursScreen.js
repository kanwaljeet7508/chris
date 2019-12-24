import React, { Component } from 'react';
import { Keyboard, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Alert} from 'react-native';
import { Content, Icon, Form, Item, Radio, Input, Button, Toast } from "native-base";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import DateTimePicker from "react-native-modal-datetime-picker";
import { _sendRequest } from './../api/HttpRequestsHandler';
import RNPickerSelect from 'react-native-picker-select';
import Colors from '../constants/Colors';
import  moment from 'moment';
import * as _ from 'lodash'

export default class AddHoursScreens extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      title: 'Add Hours',
      headerRight: (
        params.isEditForm 
        ? <TouchableOpacity style={{ marginRight: 10 }} onPress={() => params.onDeleteTrack()}>
            <Icon style={{color: 'red'}} name="trash"/>
          </TouchableOpacity>
        : null
      )

    };
  };

  constructor(props) {
    super(props);
    const { opporId, title, trackId, trackDate, orgName, orgEmail, isUnlisted } =  this.props.navigation.state.params;
    this.state = {
      groups: [],
      oppDetail: [],
      timeBlocks: [],
      opportunities: [], 
      selectedTimeBlocks: [],
      oppTitle: title || null,
      orgName: orgName || null,
      orgEmail: orgEmail || null,
      selectedOppId: opporId || null,
      trackId: trackId || null,
      selectedDate: trackDate || null,
      comments: null,
      isLoading: true,
      showOppList: false,
      isSubmitting: false,
      selectedGroupId: null,            
      isDesignativeHours: false,
      isDateTimePickerVisible: false,
      isUnlisted: isUnlisted || false,
      isEditForm: trackId ? true : false,
    };
  }

  timeBlockHandler = (selectedItems) =>  this.setState({ selectedTimeBlocks: selectedItems })
  
  deleteTimeTrackListener = () => {
    if (this.state.isLoading ) return false;
    Alert.alert(
      'Delete Track',
      'Are you sure, you want to delete this time track?',
      [
        {text: 'OK', onPress: () => this.onTimeTrackDelete() },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        }
      ],
      {cancelable: false},
    );
  }

  componentDidMount() {
    this.props.navigation.setParams({
      onDeleteTrack: this.deleteTimeTrackListener,
      isEditForm: this.state.isEditForm
    });

    if (this.state.trackId) this.getTrackById()
    else if (this.state.selectedOppId) this.getOpportunityById();
    else if (this.state.isUnlisted) this.getTimeBlocks()
    else this.fetchOpportunities()
  }

  fetchOpportunities = () => {
    _sendRequest('GET', '/api/volunteer/track')
    .then(res => {
      const { opprs, all_groups_list } = res.data;
      const opportunities = opprs.map((item) => ({ label: item.title, value: item.id, timeBlocks: item.oppr_time_blocks }));
     
      this.setState({
        showOppList: true,
        opportunities,
        groups: all_groups_list
      })
    })
    .catch(err => {
      console.log(JSON.stringify(err))
    })
    .finally(() => this.setState({isLoading: false}))
  }

  getOpportunityById = () => {
    if(!this.state.selectedOppId) return null;
    _sendRequest('GET', `/api/volunteer/opportunity/${this.state.selectedOppId}`)
    .then( res => {
      const { groups_list, oppr_info } = res.data;
      const timeBlocks = [{
        name: "Opportunity Time Blocks",
        id: 0,
        children: oppr_info.oppr_time_blocks,
      }] 
      this.setState({
        isLoading: false,
        oppTitle: oppr_info.title,
        groups: groups_list,
        timeBlocks: timeBlocks,
        oppDetail: oppr_info
      })
    })
    .catch(error => {
      Toast.show({
        duration: 5000,
        text: 'Something went wrong, Please try later!!',
        buttonText: "Okay",
        type: "danger"
      })
      this.props.navigation.navigate('Track')
    })
  }

  getTrackById = () => { 
    _sendRequest('GET', `/api/volunteer/track/${this.state.trackId}`)
    .then(res => {
        const { tracking, oppr_time_blocks,groups_list } = res.data;
        const { 
          description,
          custom_time_block,
          designated_group_id,
          opp_name, logged_date,
          is_designated, oppor_id  } = tracking;

        const timeBlocks = [{
          name: "Opportunity Time Blocks",
          id: 0,
          children: oppr_time_blocks,
        }] 

        this.setState({
          timeBlocks,
          comments: description,
          oppTitle: opp_name,
          oppDetail: tracking,
          groups: groups_list,
          selectedOppId: oppor_id,
          selectedDate: logged_date,
          isDesignativeHours: is_designated,
          selectedGroupId: Number(designated_group_id),            
          selectedTimeBlocks: custom_time_block
        })
    })
    .catch(err => {
      console.log(JSON.stringify(err))
    })
    .finally(() => this.setState({isLoading: false}))
  }

  getTimeBlocks = () => { 
    _sendRequest('GET', `/api/volunteer/get-time-blocks`)
    .then(res => { 
        const timeBlocks = [{
          name: "Opportunity Time Blocks",
          id: 0,
          children: res.data,
        }] 
        this.setState({timeBlocks})
    })
    .catch(err => {
      console.log(JSON.stringify(err))
    })
    .finally(() => this.setState({isLoading: false}))
  }

  submitHandler = () => {
      Keyboard.dismiss();
      this.setState({ isSubmitting: true })
      const timeBlocks = this.state.selectedTimeBlocks.sort();

      const trackData = { 
        is_designated: +this.state.isDesignativeHours, //+ for implicit cast ture false = 1 0
        designated_group_id: (this.state.isDesignativeHours? this.state.selectedGroupId : 0),
        time_blocks:timeBlocks.join(),
        selected_date: this.state.selectedDate,
        comments: this.state.comments,
        is_edit: this.state.isEditForm ? 1 : 0,
        tracking_id: this.state.isEditForm ? this.state.trackId : 0
      }
    
      if(this.state.isUnlisted) {
        trackData.is_unlisted_oppr = true
        trackData.private_opp_name = this.state.oppTitle
        trackData.unlist_org_name =  this.state.orgName
        trackData.unlist_org_email =  this.state.orgEmail
      } else {
        trackData.opp_id = this.state.selectedOppId
      }

      _sendRequest('POST', '/api/volunteer/track/addHours', trackData)
      .then( res => {
        Toast.show({
          duration: 3000,
          text: res.message || 'Your time track has been added!!',
          buttonText: "Okay",
          type: "success"
        })
        
        if(!this.state.isEditForm) setTimeout(()=> this.props.navigation.navigate('Track'), 1000)
      })
      .catch(err => {
        if(err == 'TOKEN_ERROR') {
          error = 'Unauthenticated!!';
          setTimeout(() => this.props.navigation.navigate('Auth'), 2000)
        } else {
          error = err.data.message || 'Unable to add time track!!'
        } 
          Toast.show({
            duration: 6000,
            text: error,
            buttonText: "Okay",
            type: "danger"
          })
      })
      .finally( () => this.setState({isSubmitting: false}))
  }

  handleDatePickerVisibility = () => {
    this.setState({ isDateTimePickerVisible: !this.state.isDateTimePickerVisible });
  }

  handleDatePicked = date => {
    this.setState({ selectedDate : moment(date).format("MM/DD/YYYY") });
    this.handleDatePickerVisibility();
  };

  onTimeTrackDelete = () => {
    this.setState({isLoading: true})
    _sendRequest('GET', `/api/volunteer/removeHours/${this.state.trackId}`)
    .then( res => {
      Toast.show({
        duration: 6000,
        text: res.message || 'Time track has been deleted!!',
        buttonText: "Okay",
        type: "success"
      })
      this.props.navigation.navigate('Track')     
    })
    .catch(error => {
      console.log(JSON.stringify(error))
      Toast.show({
        duration: 6000,
        text: 'Unable to delete this time track, Please try again later!!',
        buttonText: "Okay",
        type: "danger"
      })
    }
    ).finally( () => this.setState({isLoading: false}))
  }

  toggleDesignateHours = ( ) => {
    this.setState({isDesignativeHours: !this.state.isDesignativeHours})
  }

  oppChangeHandler = (selectedOppId) => {
    const getTimeBlocks = this.state.opportunities
    .filter(item => selectedOppId === item.value)
    const timeBlocks = [{
      name: "Opportunity Time Blocks",
      id: 0,
      children: getTimeBlocks[0].timeBlocks || [],
    }] 
    this.setState({selectedOppId, timeBlocks, selectedTimeBlocks: []})
  }

  render() {
    const { isLoading } = this.state;
    return (
        isLoading 
        ? <View style={{flex:1, justifyContent: 'center'}}><ActivityIndicator size="large" color={Colors.appMainColor} /></View>
        : <KeyboardAvoidingView behavior="padding" style={styles.container} keyboardVerticalOffset={100}>
            <Content>
              <DateTimePicker
                date={ this.state.isEditForm || this.state.selectedDate ? new Date(this.state.selectedDate) : new Date() }
                maximumDate={new Date()}
                isVisible={this.state.isDateTimePickerVisible}
                onConfirm={this.handleDatePicked}
                onCancel={this.handleDatePickerVisibility}
              />
              <Form>
                <View>
                  <Text style={{marginTop:13, fontWeight: 'bold', marginBottom:5}}>Opportunity:</Text>
                  {
                    this.state.showOppList
                    ? <RNPickerSelect
                        placeholder={{
                          label: 'Select Your Opportunity',
                          value: null,
                          color: '#9EA0A4'
                        }}
                        items={this.state.opportunities}
                        onValueChange={selectedOppId =>  this.oppChangeHandler(selectedOppId) }
                        style={{
                          ...pickerSelectStyles,
                          iconContainer: {
                            top: 10,
                            right: 12,
                          },
                        }}
                        value={this.state.selectedOppId}
                        useNativeAndroidPickerStyle={false}
                        textInputProps={{ underlineColor: 'yellow' }}
                        Icon={() => {
                          return <Icon name="arrow-dropdown" fontSize={10}  color="gray" />;
                        }}
                      />
                      :  <View style={styles.inputBox}>
                          <Text style={{marginLeft:8}}>{this.state.oppTitle ? this.state.oppTitle : 'N/A'}</Text>
                        </View>
                  }
                </View> 
                <TouchableOpacity onPress={this.toggleDesignateHours}> 
                  <View style={[styles.inputBox, {flex:1,marginTop: 13,flexDirection: 'row', justifyContent: 'space-between'}]}>
                    <Text style={[styles.leftContainer, {fontWeight: 'bold'}]}>Designate hours for group?</Text>  
                    <View style={styles.rightContainer}>
                      <Radio
                        onPress={this.toggleDesignateHours}
                        color={"#f0ad4e"}
                        selectedColor={"#5cb85c"}
                        selected={this.state.isDesignativeHours}
                      />
                    </View>  
                  </View>
                </TouchableOpacity>
                {
                  this.state.isDesignativeHours 
                  ?
                  <View>
                    <Text style={{marginTop:13, fontWeight: 'bold', marginBottom:5}}>Groups:</Text>
                      <RNPickerSelect
                          placeholder={{
                            label: 'Select Your Group',
                            value: null,
                            color: '#9EA0A4'
                          }}
                          items={this.state.groups}
                          onValueChange={selectedGroupId => {this.setState({selectedGroupId})}}
                          style={{
                            ...pickerSelectStyles,
                            iconContainer: {
                              top: 10,
                              right: 12,
                            },
                          }}
                          value={this.state.selectedGroupId}
                          useNativeAndroidPickerStyle={false}
                          textInputProps={{ underlineColor: 'yellow' }}
                          Icon={() => {
                            return <Icon name="arrow-dropdown" fontSize={10}  color="gray" />;
                          }}
                        />
                  </View>
                  : null
                }
                <View>
                  <Text style={{marginTop:13, marginBottom:5, fontWeight: 'bold'}}>Date:</Text>
                    <TouchableOpacity onPress={this.handleDatePickerVisibility}>
                    <View style={styles.inputBox}>
                      <Text style={{marginLeft:8}}>{this.state.selectedDate ? this.state.selectedDate : 'MM/DD/YYYY'}</Text>
                    </View>
                    </TouchableOpacity>
                </View>

                <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom:5}}>Time Blocks ({this.state.selectedTimeBlocks.length*30} mins):</Text>
                <View style={{ flex: 1}}>
                  <SectionedMultiSelect
                    colors={{
                      primary: Colors.appMainColor
                    }}
                    hideSearch={true}
                    items={this.state.timeBlocks}
                    uniqueKey='id'
                    subKey='children'
                    expandDropDowns={true}
                    alwaysShowSelectText={true}
                    iconKey='icon'
                    selectText='Select Time Blocks'
                    showDropDowns={true}
                    readOnlyHeadings={true}
                    onSelectedItemsChange={this.timeBlockHandler}
                    selectedItems={this.state.selectedTimeBlocks.sort()}
                  />
                </View>

                <View>
                  <Text style={{marginTop:15, marginBottom:5, fontWeight: 'bold'}}>Comments</Text>
                    <Item regular style={{borderRadius: 5}}>
                      <Input onChangeText={comments => this.setState({comments})} value={this.state.comments}/>
                    </Item>
                </View>
                
                <Button 
                block  
                disabled={this.state.isSubmitting}
                style={{marginTop: 20, backgroundColor: Colors.appMainColor}} onPress={this.submitHandler}>
                 {
                   this.state.isSubmitting
                   ? <ActivityIndicator  color={'#ffff'} />
                   : <Text style={{color: '#ffff'}}>{ this.state.isEditForm ? 'Update' : 'Save'  }</Text>
                 }
                </Button>
              </Form>
            </Content>
          </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 7,
    paddingRight: 7,
    backgroundColor: '#fff',
  },
  dateContainer : {
    height: 45,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius:5,
    borderColor: Colors.borderColor,
    borderWidth: 0.5
  },
  leftContainer: {
    flex: 1,  
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft:7
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight:7
  },
  inputBox: {
    borderWidth: 0.5,
    borderColor: Colors.borderColor,
    borderRadius: 5,
    paddingTop:13,
    paddingBottom:13
  }
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: Colors.borderColor,
      borderRadius: 4,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: Colors.borderColor,
      borderRadius: 5,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
});