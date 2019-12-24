import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { Container, Content, Input, Item, Button, Toast } from 'native-base';
import { Formik } from 'formik';
import * as yup from 'yup';
import Colors from '../constants/Colors';
import { _sendRequest } from './../api/HttpRequestsHandler';


const validationSchema = yup.object().shape({ 
    currentPassword: yup
    .string()
    .label('Current Password')
    .required('Required'),

    newPassword: yup
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
    return this.parent.newPassword === value;
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
            value={ formikProps.values[formikKey] || '' }
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
  
export default class UpdatePasswordScreen extends Component {
    static navigationOptions = {
        title: 'Change Password',
    };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

   handleSubmit = (values, {setSubmitting, resetForm}) => {
    Keyboard.dismiss();
    _sendRequest('post', '/api/profile/update-password', {
      current_password: values.currentPassword,
      password: values.newPassword,
      password_confirmation: values.confirmPassword
    }).then(res => {
      resetForm()
      Toast.show({
        duration: 2000,
        text: res.message || 'Password has been updated!!',
        buttonText: "Okay",
        type: "success"
      })
    }).catch(err => {
      let error = '';
      if(err == 'TOKEN_ERROR') {
        error = 'Unauthenticated!!';
        setTimeout(() => this.props.navigation.navigate('Auth'), 2000)
      } else {
        error = err.data.message || 'Unable To Update Password!!'
      } 
        Toast.show({
          duration: 6000,
          text: error,
          buttonText: "Okay",
          type: "danger"
        })

    }).finally(() => {
      setSubmitting(false);
    });;
  }

  render() {
    return (
        <Container style={styles.container}>
            <Content>
            <Formik
            initialValues={{ currentPassword: '',  newPassword: '', confirmPassword: ''}}
            onSubmit={this.handleSubmit}
            validationSchema={validationSchema}
            >
            {formikProps => (
              <React.Fragment>
                <StyledInput
                  label="Current Password:"
                  autoFocus
                  formikProps={formikProps}
                  formikKey="currentPassword"
                  secureTextEntry
                  placeholder="Enter Current Password"
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <StyledInput
                  label="New Password:"
                  formikProps={formikProps}
                  formikKey="newPassword"
                  placeholder="Enter New Password"
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

                <Button 
                success block 
                style={{marginTop:7}} 
                onPress={formikProps.handleSubmit}>
                {
                    (formikProps.isSubmitting) ?  <ActivityIndicator color="#ffff"/> : <Text style={{color:'#fff'}}>Update Password</Text>
                }
                </Button>

              </React.Fragment>
            )}
          </Formik>
            </Content>
        </Container>
    );
  }
}

const styles = StyleSheet.create({
    container : {
        padding: 7
    }
});