import firebase from 'firebase'; //6.3.0
import * as _ from 'lodash'

class Fire {
    bucketPath = 'https://s3.us-east-2.amazonaws.com/my-voluntier-chat-files/';
    loggedInUser = null;
    constructor() {
        this.init();
    }

    init = () => {
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyB-dJAxQJ1K4XG38bV9q-_H3grri86_mz4",
                authDomain: "myvoluntierproject-cd034.firebaseapp.com",
                databaseURL: "https://myvoluntierproject-cd034.firebaseio.com/",
                projectId: "myvoluntierproject-cd034",
                storageBucket: "myvoluntierproject-cd034.appspot.com",
                messagingSenderId: "632239583862"
            });
        }
    };

    loginUser = (token) => {
        return new Promise((resolve, reject) => {
            if (!firebase.auth().currentUser) {
                firebase.auth()
                    .signInWithCustomToken(token)
                    .then(user => {
                        resolve(user)
                    }).catch((error) => {
                        console.log(JSON.stringify(error))
                        reject(error)
                    });
            } else {
                resolve(firebase.auth().currentUser)
            }
        })
    }

    get uid() {
      if (firebase.auth().currentUser) 
          return (firebase.auth().currentUser || {}).uid;
      return null;
    }

    getUserName() {
        if (firebase.auth().currentUser) {
           return firebase.database()
            .ref('users/' + this.uid)
            .child('name')
            .once('value');
        }
        return null;
    }

    async getChatMessages(chatId, callback, count = 10, start) {
        if (typeof start == 'undefined') start = Date.now(); // + 1000;
        return await firebase.database().ref('messages/' + chatId)
           // .orderByChild('created')
            .endAt(start)
            .limitToLast(count)
            .on('child_added', snapshot => callback(this.parse(snapshot)),
                error => {
                    console.log('chat error', error)
                });
    }

    parse = snapshot => {

        const {
            created,
            message: text,
            name: user,
            uid,
            Id,
            file
        } = snapshot.val();
        const message = {
            _id: Id,
            createdAt: created,
            text,
            user: {
                _id: uid,
                name: user
            }
        };
        if (file !== undefined) {
            const filePath = this.bucketPath + file.path;
            if (file.isImage) {
                message['image'] = filePath;
            } else if (file.isVideo) {
                message['video'] = filePath;
            } else {
                message['file'] = filePath;
            }
            message['file_name'] = file.name;
        }
        return message;
    };

    async getUserContacts(callback) {
        return await firebase.database().ref(`users/${this.uid}/chats`).on('child_added', callback)
    }

    getChat(id, callback) {
        return firebase.database().ref('chats/' + id).once('value', callback);
    }

    send(message) {
        const { chatId } = message;
        var messageKey = firebase.database().ref('messages/' + chatId).push().key;
        message.Id = messageKey;
        var updates = {};
        updates[`messages/${chatId}/${messageKey}`] = message;
        firebase.database().ref('members/' + chatId).once('value', function(users) {
            users = users.val();
            for (var uid in users) {
                if (uid == message.uid) continue;
                firebase.database().ref('members')
                    .child(chatId)
                    .child(message.uid)
                    .child('unread')
                    .transaction(function(count) {
                        return ++count; 
                    });
            }
        });
        firebase.database().ref().update(updates);
        return messageKey;

    }

    get timestamp() {
      return firebase.database.ServerValue.TIMESTAMP;
    }

    // close the connection to the Backend
    off() {
        return firebase.database().ref('messages').off();
    }

    logout() {
        firebase.auth().signOut();
    }
}

Fire.shared = new Fire();
export default Fire; 