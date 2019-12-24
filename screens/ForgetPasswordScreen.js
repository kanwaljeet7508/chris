
import React, { Component } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { _sendPublicRequest } from './../api/HttpRequestsHandler';
import request from './../api/Request'
import { Icon, Toast } from 'native-base';
import  device  from './../constants/Layout';
import Colors from '../constants/Colors';
import DateTimePicker from "react-native-modal-datetime-picker";
import { Formik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .label('Email')
    .email('Invalid Email')
    .required('Required')
});

const StyledInput = ({ icon, formikProps, formikKey, ...rest }) => {
  
  const inputStyles = {
    borderColor: Colors.appMainColor,
    color: Colors.appMainColor
  };

  if (formikProps.touched[formikKey] && formikProps.errors[formikKey]) {
    inputStyles.borderColor = 'red';
    inputStyles.color = 'red';
  }
  return (
    <View style={[styles.inputContainer, inputStyles]}>
     <Icon name={icon} style={[styles.icon, styles.inputIcon, inputStyles]} />
      <TextInput
        value={ formikProps.values[formikKey] || '' }
        style={styles.inputs}
        onChangeText={formikProps.handleChange(formikKey)}
        onBlur={formikProps.handleBlur(formikKey)}
        {...rest}
      />
      <Text style={{ color: 'red', marginRight:6 }}>
        {formikProps.touched[formikKey] && formikProps.errors[formikKey]}
      </Text>
    </View>
  );
};

export default class ForgetPasswordScreen extends Component {

    static navigationOptions = {
        title: 'Reset Password?',
    };

    async handleSubmit(values, {setSubmitting, resetForm}) {
      Keyboard.dismiss();
      request({
          url:    '/api/password/reset/request',
          method: 'POST',
          data : {
            email: values.email 
          }
      })
      .then(res => {
        resetForm()
        Toast.show({
          duration: 10000,
          text: res.message || 'Password reset email has been sent, Please check Inbox',
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

  render() {
    return (
      <View style={styles.container}>
        <Image style={{
          width:device.window.width*0.80, 
          height:device.window.height*0.07, 
          marginTop: device.window.height*0.12,
          marginBottom:device.window.height*0.06 }} source={ require('../assets/images/logo.png') }/>
        <Formik
            initialValues={{ email: ''}}
            onSubmit={this.handleSubmit}
            validationSchema={validationSchema}
          >
            {formikProps => (
              <React.Fragment>
                <Text style={{marginBottom: 3}}>Enter your E-mail associated with your account:</Text>
                <StyledInput
                  icon="mail"
                  formikProps={formikProps}
                  formikKey="email"
                  autoFocus
                  placeholder="Email"
                  keyboardType="email-address"
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <React.Fragment>
                  <TouchableOpacity 
                  disabled={ this.props.isLoading || formikProps.isSubmitting }
                  style={[styles.buttonContainer, styles.loginButton]} onPress={formikProps.handleSubmit}>
                  {
                    (formikProps.isSubmitting || this.props.isLoading) ?  <ActivityIndicator color="#ffff"/> : <Text style={styles.btnText}>Send</Text>
                  }
                  </TouchableOpacity>
                </React.Fragment>
                
              </React.Fragment>
            )}
          </Formik>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.bgColor
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius:27,
    width:device.window.width*0.8,
    height:45,
    marginBottom:15,
    flexDirection: 'row',
    alignItems:'center',
    borderWidth: 1,
    borderColor: '#3bb44a'
},
inputs:{
    height:45,
    marginLeft:16,
    borderBottomColor: '#FFFFFF',
    flex:1,
},
icon:{
  width:30,
  height:30,
},
inputIcon:{
  marginLeft:15,
  justifyContent: 'center',
  color: '#3bb44a'
},
 
  buttonContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:15,
    width:device.window.width*0.8,
    borderRadius:30,
  },
  loginButton: {
    backgroundColor: '#3bb44a'
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },

});
 