import React, { Component } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Keyboard, KeyboardAvoidingView, ScrollView } from 'react-native';
import { _retrieveData, _getLoggedInUser, _multiRemove } from './../api/AsyncStorage';
import { _sendRequest } from './../api/HttpRequestsHandler';
import { Container, Content, Input, Item, Button, Radio, Icon, Toast } from 'native-base';
import RNPickerSelect from 'react-native-picker-select';
import Colors from './../constants/Colors';
import { Formik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object().shape({ 
  firstName: yup
    .string()
    .required('Required'),

  lastName: yup
    .string()
    .required('Required'),

  dob: yup
    .string()
    .required('Required'),

  zipCode: yup
    .string()
    .required('Required'),

  contactNumber: yup
    .string()
    .required('Required')
});

const StyledInput = ({ label,  formikProps, formikKey, disabled, ...rest }) => {    
  const inputStyles = {
    borderRadius: 6,
    borderWidth: 1
  };

  if(disabled) inputStyles.backgroundColor = Colors.disabledInput;

  if (formikProps.touched[formikKey] && formikProps.errors[formikKey]) {
    inputStyles.borderColor = 'red';
  }
  return (
  <View style={{ marginBottom: 8 }}>
      <Text style={{fontWeight: 'bold', paddingLeft:4, paddingBottom:2}}>{label}</Text>
      <Item regular style={inputStyles}>
          <Input 
            disabled={disabled}
            value={formikProps.values[formikKey]}
            onChangeText={formikProps.handleChange(formikKey)}
            onBlur={formikProps.handleBlur(formikKey)}
            {...rest}
          />
          <Text style={{ color: 'red', marginRight:6 }}>
              {formikProps.touched[formikKey] && formikProps.errors[formikKey]}
          </Text>
      </Item>
  </View>
  );
};

export default class EditProfileScreen extends Component {
   
  static navigationOptions = {
      title:  'Edit Profile',
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      userDetail: [],
      gender: null,
      showAddress: null,
      showAge: null
    };
  }

  showHideFieldHandler = (key, value) => {
    const getBool = (value == 'N') ? false : true;
    this.setState({[key]: getBool }) 
  }

  showHideToggleHandler = (key, value) => {
    this.setState({[key]: !value }) 
  }

  componentDidMount() {
    _retrieveData('loggedINUser')
    .then(user => {
        console.log('loggedIn', user)
        if(!user) return this.loggedInUser();
        this.setUser(JSON.parse(user));
    })
    .catch(e => this.loggedInUser())
  }

  async loggedInUser() {
    await _getLoggedInUser()
    .then(user => this.setUser(user))
    .catch(err => this.setState({isLoading: false }));
  }

  setUser = (user) => {
    this.setState({isLoading: false, userDetail:  user, gender:user.gender })
    this.showHideFieldHandler('showAddress', user.show_address);
    this.showHideFieldHandler('showAge', user.show_age);
  }

  handleSubmit = (values, {setSubmitting}) => {
    Keyboard.dismiss();
    _sendRequest('POST', '/api/volunteer/update-account', {
     // address: values.address,
      birth_day: values.dob,
      contact_num: values.contactNumber,
      email: values.email,
      first_name: values.firstName,
      gender: this.state.gender,
      last_name: values.lastName,
      show_address: (this.state.showAddress ? 'Y' : 'N' ),
      show_age: (this.state.showAge ? 'Y' : 'N' ),
      zipcode: values.zipCode,
      my_summary: values.summary
    }).then(res => {
      Toast.show({
        duration: 2000,
        text: res.message || 'Profile has been updated!!',
        buttonText: "Okay",
        type: "success"
      })
      _multiRemove(['loggedINUser']) //remove old user information

    }).catch(err => {
      let error = '';
      if(err == 'TOKEN_ERROR') {
        error = 'Unauthenticated!!';
        setTimeout(() => this.props.navigation.navigate('Auth'), 2000)
      } else {
        error = err.data.message || 'Unable To Update Profile!!'
      } 
        Toast.show({
          duration: 6000,
          text: error,
          buttonText: "Okay",
          type: "danger"
        })
    }).finally( () => setSubmitting(false));
  }

  render() {
      if(this.state.isLoading ) {
        return <View  style={{flex:1, justifyContent: 'center'}}><ActivityIndicator size="large" color={Colors.appMainColor} /></View>
        } else {
        const {first_name, last_name, location, email, user_name, birth_date, zipcode, contact_number, show_age, show_address, summary } = this.state.userDetail;

        return (
            <KeyboardAvoidingView behavior="padding" style={styles.container} keyboardVerticalOffset={100}>
              <Content>
                <Formik
              initialValues={{ 
                address: location,
                contactNumber: contact_number,
                firstName: first_name,
                lastName: last_name,
                email,
                dob: birth_date,
                userName: user_name,
                summary,
                zipCode: zipcode

              }}
              onSubmit={ this.handleSubmit }
              validationSchema={validationSchema}
              >
              {formikProps => (
                <React.Fragment>
                  
                  <StyledInput
                    label="User ID"
                    disabled
                    formikProps={formikProps}
                    formikKey="userName"
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                  />

                  <StyledInput
                    label="First Name"
                    formikProps={formikProps}
                    formikKey="firstName"
                    placeholder="Enter First Name"
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                  />

                  <StyledInput
                    label="Last Name"
                    formikProps={formikProps}
                    formikKey="lastName"
                    placeholder="Enter Last Name"
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                  />

                  <StyledInput
                    disabled
                    label="Email"
                    formikProps={formikProps}
                    formikKey="email"
                    placeholder="Enter Email"
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                  />

                  <StyledInput
                    label="Date of birth"
                    formikProps={formikProps}
                    formikKey="dob"
                    underlineColorAndroid='transparent'
                  />

                  <RNPickerSelect
                    placeholder={{
                      label: 'Select Gender',
                      value: null,
                      color: '#9EA0A4'
                    }}
                    items={[
                      {
                          label: 'Male',
                          value: 'male',
                      },
                      {
                          label: 'Female',
                          value: 'female',
                      }]}
                    onValueChange={ gender => this.setState({gender}) }
                    style={{
                      ...pickerSelectStyles,
                      iconContainer: {
                        top: 10,
                        right: 12,
                      },
                    }}
                    value={this.state.gender}
                    useNativeAndroidPickerStyle={false}
                    textInputProps={{ underlineColor: 'yellow' }}
                    Icon={() => {
                      return <Icon name="arrow-dropdown" fontSize={10}  color="gray" />;
                    }}
                  />

                  <TouchableOpacity onPress={() => this.showHideToggleHandler('showAddress', this.state.showAddress)}>
                    <View style={[styles.showBox, styles.inputBox]}>
                      <Text style={[styles.leftContainer, {fontWeight: 'bold'}]}>Show Address</Text>  
                      <View style={styles.rightContainer}>
                        <Radio
                          onPress={() => this.showHideToggleHandler('showAddress', this.state.showAddress)}
                          color={"#f0ad4e"}
                          selectedColor={"#5cb85c"}
                          selected={this.state.showAddress}
                        />
                      </View>  
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.showHideToggleHandler('showAge', this.state.showAge)}>
                    <View style={[styles.showBox, styles.inputBox]}>
                      <Text style={[styles.leftContainer, {fontWeight: 'bold'}]}>Show Birthday/Age</Text>  
                      <View style={styles.rightContainer}>
                        <Radio
                          onPress={() => this.showHideToggleHandler('showAge', this.state.showAge)}
                          color={"#f0ad4e"}
                          selectedColor={"#5cb85c"}
                          selected={this.state.showAge}
                        />
                      </View>  
                    </View>
                  </TouchableOpacity>

                  <StyledInput
                    label="Zip Code"
                    placeholder="Enter Zip Code"
                    formikProps={formikProps}
                    formikKey="zipCode"
                    underlineColorAndroid='transparent'
                  />

                  <StyledInput
                    label="Contact Number"
                    placeholder="Enter Contact Number"
                    formikProps={formikProps}
                    formikKey="contactNumber"
                    underlineColorAndroid='transparent'
                  />

                  <Button 
                    block 
                    style={{marginTop:7, backgroundColor: Colors.appMainColor}} 
                    onPress={formikProps.handleSubmit}>
                    {
                        (formikProps.isSubmitting) ?  <ActivityIndicator color="#ffff"/> : <Text style={{color:'#fff'}}>Update</Text>
                    }
                  </Button>

                </React.Fragment>
              )}
            </Formik>
              </Content>
           </KeyboardAvoidingView>
        )
      }
  }
}

const styles = StyleSheet.create({
  container : {
      padding: 7,
      flex:1
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

  showBox: {
    flex:1,
    marginTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  inputBox: {
    borderWidth: 0.5,
    borderColor: Colors.borderColor,
    borderRadius: 5,
    paddingTop:13,
    paddingBottom:10,
    marginBottom:7
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