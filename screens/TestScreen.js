import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, Image } from 'react-native';
//import DocumentPicker from 'react-native-document-picker';
// import { DocumentPicker, ImagePicker } from 'expo';
import { RNS3 } from 'react-native-aws3';
import mime from 'react-native-mime-types'

const options = {
  keyPrefix: "",
  bucket: "my-voluntier-chat-files",
  region: "us-east-2",
  accessKey: "AKIAYOSZMFEA6QSMQSU3",
  secretKey: "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",
  successActionStatus: 201
}

export default class TestScreen extends React.Component {
    state = {
      image: null,
      uploadPercentage: 0
    };

    componentDidMount() {
    }

    parseFile = fileName => {
      if (fileName) {
        const timeStamp = new Date().getTime();
        return {
          name: `${timeStamp}-${fileName.replace(/\s+/g, '-').toLowerCase()}`,
          type: mime.lookup(fileName)
        }
      }
      return false;
    }

  _pickDocument = async () => {
	    let result = await DocumentPicker.getDocumentAsync({});
      if (!result.cancelled) {
        const  fileInfo =  this.parseFile(result.name);
        if(fileInfo) {
          const file = {
            uri: result.uri,
            ...fileInfo
          }
          
          RNS3.put(file, options)
            .then(response => {
              if (response.status !== 201)
                throw new Error("Failed to upload image to S3");
              console.log(response.body);
            })
            .progress((e) => this.setState({uploadPercentage: Math.round(e.percent*100)}))
        }
      }
	}

   _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    alert(result.uri);
    console.log(result)

    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }
  };

  render() {
    let { image } = this.state;
    return (
      <View style={styles.container}>
        <Text>{this.state.uploadPercentage}%</Text>
        <Button
          title="Select Document"
          onPress={this._pickDocument}
        />

      <View style={{ 'marginTop': 20}}>
        <Button
          title="Select Image"
          onPress={this._pickImage}
        />
        {image &&
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
