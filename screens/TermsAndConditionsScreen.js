import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class TermsAndConditionsScreen extends Component {
  static navigationOptions = {
    title: 'Terms And Conditions',
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{marginBottom: 6}}>Qui Lorem sint proident excepteur non elit id aute esse nulla ex adipisicing deserunt dolor.</Text>
        <Text style={{marginBottom: 6}}>Et ipsum velit commodo fugiat. Nostrud qui esse ut nisi. Ad deserunt sit esse velit nostrud minim.</Text>
        <Text style={{marginBottom: 6}}>Laborum commodo non exercitation nulla. Veniam consequat tempor sint quis anim magna non ullamco.</Text>
        <Text style={{marginBottom: 6}}>Ad laborum dolore officia esse nisi tempor id non duis magna in. Enim esse consectetur sint eu exercitation id sit consectetur quis.</Text>
        <Text style={{marginBottom: 6}}> Cupidatat quis nulla mollit aute nostrud est. Non et et nulla fugiat esse id pariatur nostrud labore adipisicing velit qui voluptate velit.</Text>
        <Text style={{marginBottom: 6}}> Cupidatat quis nulla mollit aute nostrud est. Non et et nulla fugiat esse id pariatur nostrud labore adipisicing velit qui voluptate velit.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 6,
      backgroundColor: '#fff',
    },
  });