import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Icon, Toast  } from 'native-base';
import  device  from './../constants/Layout';
import * as actions from './../store/actions';
import {connect} from 'react-redux';
import { Formik } from 'formik';
import * as yup from 'yup';
import Colors from '../constants/Colors';
import { _retrieveData } from '../api/AsyncStorage';


const validationSchema = yup.object().shape({
  email: yup
    .string()
    .label('Email')
    .email('Invalid Email')
    .required('Required'),
  password: yup
    .string()
    .label('Password')
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

class LoginScreen extends Component {

    static navigationOptions = {
        header: null,
    };
    
    constructor(props) {
      super(props); 
      this.handleSubmit = this.handleSubmit.bind(this);
    }

   async handleSubmit(values, {setSubmitting}) {
      Keyboard.dismiss()
      await this.props.onAuth(values.email, values.password).then(
      res => {
        Toast.show({
          duration: 2000,
          text: 'Logged in successfully..',
          type: "success"
        })
        setTimeout(() => {
          this.props.navigation.navigate('Main')
          setSubmitting(false)
        }, 1000)
      })
      .catch(err => {
        setSubmitting(false)
        Toast.show({
          duration: 10000,
          text: err,
          buttonText: "Okay",
          type: "danger"
        })
      })
    }

  render() {
    return (
      <View style={styles.container}>
          <Image 
            style={{
              marginTop: device.window.height*0.23,
              width:device.window.width*0.80,
              height:device.window.height*0.07,
              marginBottom:30}}
            source={ require('../assets/images/logo.png') }
          />

          <Formik
            initialValues={{ email: '',  password: ''}}
            onSubmit={this.handleSubmit}
            validationSchema={validationSchema}
          >
            {formikProps => (
              <React.Fragment>
                <StyledInput
                  icon="mail"
                  formikProps={formikProps}
                  formikKey="email"
                  placeholder="Email"
                  keyboardType="email-address"
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <StyledInput
                  icon="lock"
                  formikProps={formikProps}
                  formikKey="password"
                  placeholder="Password"
                  secureTextEntry
                  autoCapitalize='none'
                  underlineColorAndroid='transparent'
                />

                <TouchableOpacity 
                style={styles.restoreButtonContainer} 
                onPress={ () => this.props.navigation.navigate('ForgetPassword')}>
                <Text>Forgot Password?</Text>
                </TouchableOpacity>

                <React.Fragment>
                  <TouchableOpacity 
                  disabled={ this.props.isLoading || formikProps.isSubmitting }
                  style={[styles.buttonContainer, styles.loginButton]} onPress={formikProps.handleSubmit}>
                  {
                    (formikProps.isSubmitting || this.props.isLoading) ?  <ActivityIndicator color="#ffff"/> : <Text style={styles.btnText}>Login</Text>
                  }
                  </TouchableOpacity>
                </React.Fragment>
                
              </React.Fragment>
            )}
          </Formik>
          
        <View style={{marginTop:10}}>
          <TouchableOpacity 
              style={[styles.buttonContainer, styles.orgVolButton]}
              onPress={ () => this.props.navigation.navigate('VolunteerRegister')} >
              <Text style={styles.btnText}>Create Volunteer Account</Text>
          </TouchableOpacity>
        </View>
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
    width:device.window.width*0.80,
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
    flex:1
  },
  icon:{
    width:30,
    height:30,
  },
  inputIcon:{
    marginLeft:15,
    justifyContent: 'center',
    color: '#3bb44a',
  },
  buttonContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:15,
    width:device.window.width*0.80,
    borderRadius:30,
  },
  loginButton: {
    backgroundColor: '#3bb44a',
  },

  orgVolButton: {
    backgroundColor: '#5f6a6a',
  },

  btnText: {
    color: 'white',
    fontWeight: 'bold'
  },
  restoreButtonContainer:{
    width:device.window.width*0.80,
    marginBottom:15,
    alignItems: 'flex-end'
  },

});
 

function mapStateToProps(state) {
  console.log('from login page',state.auth)
  const { token, error, isLoading, isAuthenticated } = state.auth;
  return{
    token,
    error,
    isLoading,
    isAuthenticated  
  };
}
const mapDispatchToProps = dispatch => {
  return {
      onAuth: ( email, password ) => dispatch( actions.auth( email, password ) ),
  }
}
  export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);