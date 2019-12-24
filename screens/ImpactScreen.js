import React, {Component} from 'react';
import {
  Share,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Container, Content, List, ListItem, Icon, Toast } from 'native-base';
import { _sendRequest } from './../api/HttpRequestsHandler';
import PureChart from 'react-native-pure-chart';
import { Rating } from 'react-native-ratings';
import Colors from './../constants/Colors';
import { AlertInfo } from './../components/AlertBoxes';

const DetailItem = (props) => {
  return (
    <View style={[props.style]}>
      <Text style={{fontWeight: 'bold'}}>{ `${props.title}` }</Text>
      <Text>{props.description ? props.description: null}</Text>
      {props.children}
    </View>
  );
}

export default class ImpactScreen extends Component {
  static navigationOptions = {
    title: 'Impact',
  };

  constructor (props) {
    super(props)
    this.props.navigation.setParams({
      handleShare: this._shareText
    });

    this.state = {
      rank: 0,
      reviews: [],
      isLoading: true,
      myLoggedHours: 0,
      opportunitiesHours: [],
      organizationHours: [],
      organizationRanking: [],
      barData: [],
      pieData: []
    }
  }

  componentDidMount() {
    _sendRequest('GET', '/api/volunteer/impact')
    .then(res => {
        const {logged_hours_sum,  org_ranking, reviews, opp_hours, rank, org_hours, bar_chart, pie_chart  } = res.data;
        this.setState({
          reviews: reviews.data || [],
          rank,
          barData: bar_chart,
          pieData: pie_chart,
          myLoggedHours: logged_hours_sum,
          opportunitiesHours: opp_hours,
          organizationHours: org_hours,
          organizationRanking: org_ranking
        })
    })
    .catch(err => {
       Toast.show({
        duration: 5000,
        text: 'Something went wrong, Please try later!!',
        buttonText: "Okay",
        type: "danger"
      });
      console.log(JSON.stringify(err))
    })
    .finally( () => this.setState({ isLoading: false }))
    ;
  }
  render() {
    return (
      <Container style={styles.container}>
        {
           this.state.isLoading 
           ? <View style={{flex:1, justifyContent: 'center'}}><ActivityIndicator size="large" color={Colors.appMainColor} /></View>
           :
            <Content>
              <DetailItem title="Your Total Tracked Hours:" description={`${this.state.myLoggedHours} Hours`} style={{paddingBottom: 15, paddingLeft: 15}} />
              <DetailItem title="Your Ranking Among Your Friends:" description={this.state.rank} style={{paddingBottom: 15, paddingLeft: 15}} />
              <DetailItem title="Tracked Hours of Your Friends" style={{paddingLeft: 15, paddingTop:5, borderTopColor: 'grey', borderTopWidth: 0.5, paddingBottom: 10}} />
              {
                this.state.barData.length > 0
                ? <PureChart showEvenNumberXaxisLabel={false} type={'bar'} data={this.state.barData}  height={200}/>
                : <AlertInfo text="You don't have any tracked hours of your Friends" />
              }
              
              <List>
                <ListItem itemDivider>
                  <Text>Ranking & Tracked Hours on Organizations</Text>
                </ListItem>
                {
                  this.state.organizationRanking.length === 0 
                  ?
                    <ListItem>
                      <AlertInfo text="You don't have any hours tracked on Organizations" />
                    </ListItem>
                  : <>
                    {
                      this.state.organizationRanking.map((item, index) => {
                        return (
                          <ListItem key={index}>
                            <DetailItem title={item.org_name} description={`Your Rank: ${item.my_ranking}`} />
                          </ListItem>
                        )
                      })
                    }
                    <DetailItem title="Tracked Hours By Organizations" style={{paddingLeft: 15, paddingTop:10, borderTopColor: 'grey', paddingBottom: 10, borderTopWidth: 0.5}} />
                    <View style={{ 
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingBottom: 10 
                      }}>
                      {
                        this.state.pieData.length > 0
                        ? <PureChart type={'pie'} data={this.state.pieData} />
                        : <AlertInfo text="You don't have Organizations tracked hours related record" />
                      }
                    </View>
                    </>
                }
              </List>

              <List>
                <ListItem itemDivider>
                  <Text>Performance Awards for User Name</Text>
                </ListItem> 
                {
                  this.state.opportunitiesHours.length === 0
                  ? <ListItem>
                      <AlertInfo text="You don't have performance awards related record" />
                    </ListItem> 
                  : this.state.opportunitiesHours.map((item, index) => {
                        return (
                          <ListItem key={index}>
                            <DetailItem title={`Opportunity: ${item.opp_name}`} description={`Date: ${item.submitted_date}`}>
                              <Text>Tracked Hours: { parseFloat(item.logged_hours).toFixed( 2 )}</Text>
                            </DetailItem>
                          </ListItem>
                        )
                    })
                }
                <ListItem itemDivider>
                  <Text>Comments & Reviews</Text>
                </ListItem>                    
                {
                  this.state.reviews.length === 0 
                  ? <ListItem>
                      <AlertInfo text="You don't have any reviews" />
                    </ListItem>
                  : this.state.reviews.map((item, index) => {
                      return (
                        <ListItem key={index}>
                          <DetailItem title={item.org_name}>
                            <Rating
                              startingValue={Number(item.mark)}
                              showRating={false}
                              readonly={true}
                              imageSize={35}
                              style={{ paddingVertical: 10 }}
                            />
                            <Text>{item.comment}</Text>
                          </DetailItem>
                        </ListItem>
                      )
                  })
                }
            </List>
         </Content>
          }
      </Container>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    backgroundColor: '#fff',
  },
});
