import React, { Component } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { Content, Item, Input, ListItem, Right, Left, Button, Icon, Toast } from 'native-base';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from "react-native-modal-datetime-picker";
import Colors from '../constants/Colors';
import request from './../api/Request'
import { Formik } from 'formik';
import * as yup from 'yup';
import  moment from 'moment';

const validationSchema = yup.object().shape({ 
  userName: yup
    .string()
    .required('Required')
    .min(3, 'Too Short')
    .max(12, 'Too Long'),
 
  firstName: yup
    .string()
    .required('Required'),

  lastName: yup
    .string()
    .required('Required'),

  email: yup
    .string()
    .required('Required')
    .email('Invalid Email'),

  zipCode: yup
    .string()
    .required('Required'),

  contactNumber: yup
    .string()
    .required('Required'),

  password: yup
    .string()
    .label('Password')
    .required('Required')
    .min(6, 'Too Short')
    .max(12, 'Too Long'),

  confirmPassword: yup
    .string()
    .required('Required')
    .label('Confirm password')
    .test('passwords-match', 'Passwords Must Match', function(value) {
    return this.parent.password === value;
  })
});

const StyledInput = ({ label,  formikProps, formikKey, ...rest }) => {    
  const inputStyles = {
    borderRadius: 6,
    borderWidth: 1
  };

  if (formikProps.touched[formikKey] && formikProps.errors[formikKey]) {
    inputStyles.borderColor = 'red';
  }
  return (
  <View style={{ marginBottom: 8 }}>
      <Text style={{fontWeight: 'bold', paddingLeft:4, paddingBottom:2}}>{label}</Text>
      <Item regular style={inputStyles}>
          <Input 
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

export default class VolRegister extends Component {
  static navigationOptions = {
    title: 'Create Volunteer Account',
  }

  state = {
    date: null,
    yearsOld : false,
    acceptTerms: false,
    gender: null,
    isDateTimePickerVisible: false,
  };

  toggleSwitch = (key, value) => {
    this.setState({[key]: value})
 }

  constructor(props) {
    super(props);
  }

  handleTerms = () => {
    this.setState({acceptTerms: !this.state.acceptTerms })
  }

  handleAgeCheck = () => {
    this.setState({yearsOld: !this.state.yearsOld })
  }

  handleSubmit = (values, {setSubmitting, resetForm}) => {
     Keyboard.dismiss();
    if(!this.state.yearsOld){
      setSubmitting(false)
      Toast.show({
        text: 'Please verify your age!!',
        type: "danger"
      })
    }else if(!this.state.acceptTerms){
      setSubmitting(false)
      Toast.show({
        text: 'Please accept terms and conditions!!',
        type: "danger"
      })
    } else {
      const { userName,firstName,lastName, email,zipCode, password, contactNumber, confirmPassword } = values;
      const volunteer = {
        user_name: userName,
        first_name: firstName,
        last_name: lastName,
        email,
        gender: this.state.gender,
        birth_date: this.state.date,
        contact_number: contactNumber,
        password,
        password_confirmation: confirmPassword,
        zipcode: zipCode,
      }
      request({
            url:    '/api/register',
            method: 'POST',
            data: volunteer
      })
      .then(res => {
          resetForm()
          Toast.show({
            duration: 10000,
            text: res.message || 'Your account has been registered!!',
            buttonText: "Okay",
            type: "success"
          })
      })
      .catch(err => {
          Toast.show({
            duration: 10000,
            text: err.data.message || 'Something went wrong, try again later!!',
            buttonText: "Okay",
            type: "danger"
          })
      })
      .finally(() => setSubmitting(false))
    }
  }

  handleDatePickerVisibility = () => {
    this.setState({ isDateTimePickerVisible: !this.state.isDateTimePickerVisible });
  }

  handleDatePicked = date => {
    this.setState({ date : moment(date).format("MM/DD/YYYY") });
    console.log("A date has been picked: ", date);
    this.handleDatePickerVisibility();
  };


  render() {
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container} keyboardVerticalOffset={100}>
        <DateTimePicker
          maximumDate={new Date()}
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this.handleDatePicked}
          onCancel={this.handleDatePickerVisibility}
        />
        <Content style={{marginTop:5}}>
        <Formik
            initialValues={{ 
              userName: '',
              firstName:'',
              lastName: '',
              email:    '',
              zipCode:  '',
              password: '',
              contactNumber: '',
              confirmPassword: ''
            }}
            onSubmit={this.handleSubmit}
            validationSchema={validationSchema}
          >
            { formikProps => (
              <React.Fragment>
                <StyledInput
                  label="User Name"
                  formikProps={formikProps}
                  formikKey="userName"
                  placeholder="Enter User Name"
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

                <View style={{ marginBottom: 8 }}>
                  <Text style={{fontWeight: 'bold', paddingLeft:4, paddingBottom:2}}>Gender</Text>
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
                </View>

                <View style={{ marginBottom: 8 }}>
                  <Text style={{paddingLeft:4, paddingBottom:2, fontWeight: 'bold'}}>Date Of Birth</Text>
                  <TouchableOpacity onPress={this.handleDatePickerVisibility}>
                    <View style={styles.inputBox}>
                      <Text style={{marginLeft:8}}>{this.state.date ? this.state.date : 'MM/DD/YYYY'}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <StyledInput
                  label="Email"
                  formikProps={formikProps}
                  formikKey="email"
                  placeholder="Enter Email"
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <StyledInput
                  label="Contact Number"
                  formikProps={formikProps}
                  formikKey="contactNumber"
                  placeholder="111-111-1111"
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />
                
                <StyledInput
                  label="Zip Code"
                  formikProps={formikProps}
                  formikKey="zipCode"
                  placeholder="Enter Zip Code"
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <StyledInput
                  label="Password"
                  formikProps={formikProps}
                  formikKey="password"
                  placeholder="Enter Password"
                  secureTextEntry
                  autoCapitalize='none'
                  underlineColorAndroid='transparent'
                />

                <StyledInput
                  label="Confirm Password:"
                  formikProps={formikProps}
                  formikKey="confirmPassword"
                  placeholder="Enter Confirm Password"
                  secureTextEntry
                  autoCapitalize='none'
                  underlineColorAndroid='transparent'
                />

                <ListItem>
                  <Left>
                    <Text>I am older than 13 years old</Text>
                  </Left>
                  <Right>
                  <Switch
                    thumbColor={ this.state.yearsOld ?  Colors.appMainColor: null}
                    onValueChange = {value => this.toggleSwitch('yearsOld', value)}
                    value = {this.state.yearsOld}/>
                  </Right>
                </ListItem>

                <ListItem>
                  <Left>
                    <Text>I accept the </Text>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('TermsAndConditions')}> 
                      <Text style={{color: 'blue', textDecorationLine: 'underline'}}>Terms and Conditions</Text>
                    </TouchableOpacity>
                  </Left>
                  <Right>
                  <Switch
                    thumbColor={ this.state.acceptTerms ?  Colors.appMainColor: null}
                    onValueChange = { value => this.toggleSwitch('acceptTerms', value)}
                    value = {this.state.acceptTerms}/>
                  </Right>
                </ListItem>

                <Button 
                  success block 
                  style={{marginTop:7, marginBottom:5}} 
                  onPress={formikProps.handleSubmit}>
                  {
                      (formikProps.isSubmitting) ?  <ActivityIndicator color="#ffff"/> : <Text style={{color:'#fff'}}>Register</Text>
                  }
                </Button>
              </React.Fragment>
            )}
        </Formik>
        </Content>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgColor,
    padding: 7
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