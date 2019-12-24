import React, { Component } from 'react';
import { Keyboard ,View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Switch, KeyboardAvoidingView } from 'react-native';
import { Content, Icon, Form, Item, Radio, Input, Button, Toast } from "native-base";
import { _sendRequest } from './../api/HttpRequestsHandler';
import RNPickerSelect from 'react-native-picker-select';
import Colors from '../constants/Colors';

export default class JoinOpportunityScreen extends Component {
  static navigationOptions = {
    title: 'Join to Opportunity',
  };

  constructor(props) {
    super(props);
    this.state = {
      orgName: null,
      orgEmail:null,
      orgNotExist: false,
      oppExist: false,
      isLoading: true,
      opportunities: [],
      organizations: [],
      oppPrivateName: null,
      selectedOrg: undefined,
      selectedOpp: undefined,
      formSubmitting: false
    };
  }
  
  componentDidMount() {
    _sendRequest('GET', '/api/volunteer/track')
    .then(res => {
      const { org_names, opprs } = res.data;
      const organizations = org_names.map((item) => ({ label: item.org_name, value: item.id }));
      this.setState({
        isLoading: false,
        allOppors: opprs,
        organizations
      });
    })
    .catch(err => {
     // console.log(JSON.stringify(err))
      this.setState({ isLoading: false });
    });
  }

  oppExitHandler = () =>  this.setState({oppExist: !this.state.oppExist })

  orgExitHandler = () =>  this.setState({orgNotExist: !this.state.orgNotExist })
  
  orgChangeHandler = (selectedOrg) => {
    if(selectedOrg) {
      this.setState({ isLoading: true, selectedOrg });
      const getOpportunities = this.state.allOppors.filter(item => item.org_id == selectedOrg)
      const opportunities = getOpportunities.map((item) => ({ label: item.title, value: item.id }));
       this.setState({ opportunities, isLoading: false });
    }
  }

  submitHandler = () => {
    Keyboard.dismiss();
    const { selectedOrg, selectedOpp, oppPrivateName, oppExist, orgNotExist, orgName, orgEmail } = this.state;
    if(orgNotExist) {
       this.props.navigation.navigate('AddHours', { isUnlisted: true, title: oppPrivateName, orgName, orgEmail });
    } else 
    {
      this.setState({formSubmitting: true})
      const formData = {
        is_opp_exist: +(!oppExist), //negation and data type casting
        org_id: selectedOrg,
        opp_id: selectedOpp,
        private_opp: oppPrivateName
      }
      _sendRequest('POST', '/api/volunteer/track/joinToOpportunity', formData)
      .then(res => {
        const { result, opp_id } = res.data
        Toast.show({
          duration: 5000,
          text: result,
          buttonText: "Okay",
          type: "success"
        });
        //this.props.navigation.navigate('AddHours', { opporId: opp_id });
        this.props.navigation.navigate('Track');
      })
      .catch(err => {
        Toast.show({
          duration: 5000,
          text: err.data.message || 'Something went wrong, Please try later!!',
          buttonText: "Okay",
          type: "danger"
        });
      })
      .finally( () => this.setState({formSubmitting: false}));
    }
  }

  render() {
    if(this.state.isLoading) {
      return <View style={{ flex: 1, justifyContent: 'center'}}><ActivityIndicator size="large" color={Colors.appMainColor} /></View>
    } else {
      return (
        <KeyboardAvoidingView behavior="padding" style={styles.container} keyboardVerticalOffset={100}>
          <Content>
            <Form>
            <TouchableOpacity onPress={this.orgExitHandler}>
                <View style={[styles.oppExist, styles.inputBox]}>
                  <Text style={[styles.leftContainer, {fontWeight: 'bold'}]}>Organization does not exist</Text>  
                  <View style={styles.rightContainer}>
                    <Switch
                    thumbColor={ this.state.orgNotExist ?  Colors.appMainColor: null}
                    onValueChange = { this.orgExitHandler }
                    value = {this.state.orgNotExist}/>
                  </View>  
                </View>
              </TouchableOpacity>
              {

                this.state.orgNotExist 
                ? 
                <>
                   <Text style={{marginTop:13, fontWeight: 'bold', marginBottom:5}}>Organization Name:</Text>
                   <Item regular style={{borderRadius: 5}}>
                      <Input 
                      placeholder="Enter Organization Name"
                      onChangeText={orgName => this.setState({orgName})}
                      />
                   </Item>
                   <Text style={{marginTop:13, fontWeight: 'bold', marginBottom:5}}>Organization Email:</Text>
                   <Item regular style={{borderRadius: 5}}>
                      <Input 
                      placeholder="Enter Organization E-Mail"
                      onChangeText={orgEmail => this.setState({orgEmail})}
                      />
                   </Item>
                </>
                :<>
                  <View>
                    <Text style={{marginTop:13, fontWeight: 'bold', marginBottom:5}}>Organization:</Text>
                    <RNPickerSelect
                        placeholder={{
                          label: 'Select Organization',
                          value: null,
                          color: '#9EA0A4'
                        }}
                        items={this.state.organizations}
                        onValueChange={(selectedOrg) => this.orgChangeHandler(selectedOrg)}
                        style={{
                          ...pickerSelectStyles,
                          iconContainer: {
                            top: 10,
                            right: 12,
                          },
                        }}
                        value={this.state.selectedOrg}
                        useNativeAndroidPickerStyle={false}
                        textInputProps={{ underlineColor: 'yellow' }}
                        Icon={() => {
                          return <Icon name="arrow-dropdown" fontSize={10}  color="gray" />;
                        }}
                      />
                  </View>

                  <View>
                    <Text style={{marginTop:13, fontWeight: 'bold', marginBottom:5}}>Opportunity:</Text>
                      <RNPickerSelect
                          placeholder={{
                            label: 'Select Opportunity',
                            value: null,
                            color: '#9EA0A4'
                          }}
                          items={this.state.opportunities}
                          onValueChange={selectedOpp => {this.setState({selectedOpp})}}
                          style={{
                            ...pickerSelectStyles,
                            iconContainer: {
                              top: 10,
                              right: 12,
                            },
                          }}
                          value={this.state.selectedOpp}
                          useNativeAndroidPickerStyle={false}
                          textInputProps={{ underlineColor: 'yellow' }}
                          Icon={() => {
                            return <Icon name="arrow-dropdown" fontSize={10}  color="gray" />;
                          }}
                        />
                  </View>
                  <TouchableOpacity onPress={this.oppExitHandler}>
                    <View style={[styles.oppExist, styles.inputBox]}>
                      <Text style={[styles.leftContainer, {fontWeight: 'bold'}]}>Opportunity does not exist</Text>  
                      <View style={styles.rightContainer}>
                        <Switch
                        thumbColor={ this.state.oppExist ?  Colors.appMainColor: null}
                        onValueChange = { this.oppExitHandler }
                        value = {this.state.oppExist}/>
                      </View>  
                    </View>
                  </TouchableOpacity>
                </>
              }
              {
                  this.state.oppExist || this.state.orgNotExist 
                  ?
                    <View>
                      <Text style={{marginTop:13, marginBottom:5, fontWeight: 'bold'}}>Private Opportunity Name:</Text>
                        <Item regular style={{borderRadius: 5}}>
                          <Input 
                          placeholder="Enter Unlisted/Private Opportunity Name"
                          onChangeText={oppPrivateName => this.setState({oppPrivateName})}/>
                        </Item>
                    </View>
                  : null
              }
            <Button 
              block 
              success 
              disabled={this.state.formSubmitting}
              style={{marginTop: 20}} onPress={this.submitHandler}>
                {
                  this.state.formSubmitting 
                  ? <ActivityIndicator  color={'#ffff'} />
                  : <Text style={{color: '#ffff'}}>Add Opportunity</Text>
                }
              </Button>
            </Form>
          </Content>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 7,
    paddingRight: 7,
    backgroundColor: '#fff',
  },
  leftContainer: {
    marginLeft: 8,
    justifyContent: 'flex-start'
  },
  rightContainer: {
    marginRight: 8,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },

  oppExist: {
    flex:1,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    borderRadius: 5,
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