import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {
    Text,
  Platform,
  TouchableOpacity,
  ViewPropTypes,
} from 'react-native'
// import { FileSystem } from 'expo';

export default class CustomChatView extends Component {
  static propTypes = {
    currentMessage: PropTypes.object,
    containerStyle: ViewPropTypes.style,
  }

  static defaultProps = {
    currentMessage: {},
    containerStyle: {},
  }

  downloadHandler() {
    const { currentMessage, containerStyle  } = this.props
    console.log(currentMessage)
    FileSystem.downloadAsync(
     currentMessage.file,
     FileSystem.documentDirectory + currentMessage.file_name
    ).then(({ uri }) => {
       console.log('Finished downloading to ', uri);
    }).catch(error => {
       console.error(error);
    });
 }
  render() {
    const { currentMessage, containerStyle, color  } = this.props
    if (currentMessage.file) {
      return (
        <TouchableOpacity 
        onPress={() => { this.downloadHandler();}}
        style={containerStyle}>
            <Text style={{ fontWeight: 'bold', color: color, padding: 10, textDecorationLine: 'underline' }}>
            {currentMessage.file_name}
            </Text>
        </TouchableOpacity>
      )
    }
    return null
  }
}