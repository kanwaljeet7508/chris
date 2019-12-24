import React from 'react';
import { Text } from 'react-native';

const AlertInfo = ({text}) => {
    return <Text style={{ 
                flex:1, 
                flexDirection:'row',
                fontWeight: 'bold', 
                backgroundColor: '#d1ecf1',
                padding: 12,
                color: '#0c5460', 
                textAlign: 'center'}}>
                {text}
            </Text>
  }


export {
    AlertInfo
}