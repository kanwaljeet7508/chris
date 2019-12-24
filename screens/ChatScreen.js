import React, { PureComponent } from "react";
import {View, KeyboardAvoidingView, TouchableOpacity, YellowBox, Text}  from 'react-native'
import { Icon, Toast } from "native-base";
import { GiftedChat } from "react-native-gifted-chat";
import CustomChatView from './../components/CustomChatView';
import Fire from './../api/Fire';
import _ from 'lodash';
import { _retrieveData } from "../api/AsyncStorage";
import Colors from "../constants/Colors";
import DocumentPicker from 'react-native-document-picker'

//import { DocumentPicker } from 'expo';


import { RNS3 } from 'react-native-aws3';
import mime from 'react-native-mime-types'

YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

const options = {
  keyPrefix: "",
  bucket: "my-voluntier-chat-files",
  region: "us-east-2",
  accessKey: "AKIAYOSZMFEA6QSMQSU3",
  secretKey: "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",
  successActionStatus: 201
}


export default class ChatScreen extends PureComponent {
  
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      title: 'Chat Room',
      headerRight: (
       <TouchableOpacity style={{ marginRight: 10 }} onPress={() => params.onPickDocument()}>
            <Icon style={{color: Colors.appMainColor}} name="attach"/>
       </TouchableOpacity>
      )

    };
  };

  constructor(props) {
    super(props);
    const { chatId } =  this.props.navigation.state.params;
    this._isMounted = false;
    this.state = {
      createdAt: [Date.now()],
      messages: [],
      chatId: chatId || null,
      isLoadingEarlier: false,
      isUploading: false,
      loggedInUser: null,
      uploadPercentage: 0
      //loadEarlierCounter: 1
    };
  }

  componentDidMount () {
    this.props.navigation.setParams({
      onPickDocument: this._pickDocument,
    });

    Fire.shared.getUserName()
    .then(snapshot => {
      const name = snapshot.val();
      this.setState({
        loggedInUser: {
          _id: Fire.shared.uid,
          name
        }
      })
    })
    .catch(err => {
      console.log('Unable to fetch user name', err);      
    })
    this._isMounted = true;
    this._isMounted && this.getChat();
  }

  getChat = (loadEarlier = false) => {
    let createdAt = undefined;
    /*if (loadEarlier) {
        createdAt = _.head(this.state.createdAt.sort()) - 1
        this.setState({
            createdAt: [createdAt],
            loadEarlierCounter: this.state.isLoadingEarlier + 1
        })
    }*/

    Fire.shared.getChatMessages(this.state.chatId, message => {
        const getDate = message.createdAt
        message.createdAt = new Date(getDate);
        
        this._isMounted &&  this.setState(prevState => ({
            createdAt: [...prevState.createdAt, getDate],
            messages: GiftedChat.append(
              prevState.messages,
              message),
        }))

    }, 80)
  }

  onSend(messages = []) {
    if (messages.length > 0) {
      const { text:message, user }  = messages[0];
      var text = {
        uid: user._id,
        name:user.name,
        chatId: this.state.chatId,
        file: null,
        message,
        created: Fire.shared.timestamp
      };
      console.log('message', text)
      Fire.shared.send(text);
    }    
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
        this.setState({isUploading: true})
        const fileName = result.name;
        const  parsedFile =  this.parseFile(fileName);

        if(parsedFile) {
          const file = {
            uri: result.uri,
            ...parsedFile
          }

          const fileInfo = {
              ready: true,
              isImage: false,
              isVideo: false,
              name: fileName,
              path: parsedFile.name
          };

          if(file.type.indexOf('image') >= 0) {
            fileInfo.isImage = true;
          } else if(file.type.indexOf('video') >= 0) {
            fileInfo.isVideo = true;
          }

          RNS3.put(file, options)
            .then(response => {
              if (response.status !== 201) throw new Error("Failed to upload image to S3");
                  this.setState({isUploading: false})
                  const { _id: uid, name } = this.state.loggedInUser
                  var text = {
                    uid,
                    name,
                    chatId: this.state.chatId,
                    file: fileInfo,
                    message:null,
                    created: Fire.shared.timestamp
                  };
                  console.log('message file upload', text)
                  Fire.shared.send(text);
            })
            .progress((e) => {
              this.setState({uploadPercentage: Math.round(e.percent*100)})
            })
            .catch(e => console.log(JSON.stringify(e)))
        }
      }
  }

  renderCustomView(props) {
    const { currentMessage  } = props
    if (currentMessage.file) {
      const { _id } = currentMessage.user;
      const fileNameColor = Fire.shared.uid === _id ? '#ffff' : Colors.appMainColor;
      return <CustomChatView {...props } color={fileNameColor}/>
    }
  }

  componentWillUnmount() {
    Fire.shared.off();
  }

  render() {
    return (
      <View style={{flex: 1}}>     
      <GiftedChat
        onLoadEarlier={() => this.getChat(true)}
       // loadEarlier ={ this.state.messages.length < this.state.loadEarlierCounter * 20 
                  //      ? false :  true }
        loadEarlier={false}
        isLoadingEarlier={this.state.isLoadingEarlier}
        renderUsernameOnMessage ={true}
        isCustomViewBottom= {true}
        renderCustomView={this.renderCustomView}
        //messages={_.orderBy(this.state.messages, ['createdAt'], ['desc'])}
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={this.state.loggedInUser}
        parsePatterns={linkStyle => [
          {
            pattern: /#(\w+)/,
            style: { textDecorationLine: "underline", color: 'lightgreen' }
          },
        ]}
      />
        {
          this.state.isUploading ?
            <View style={{alignItems: 'flex-end'}}>
              <Text style={{color: Colors.appMainColor, fontWeight: 'bold', padding:10}}>
               {this.state.uploadPercentage}% Uploading
                </Text>
            </View>
          : null
        }
        <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={80}/>
      </View>

    );
  }
}