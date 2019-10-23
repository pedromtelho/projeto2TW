import React from 'react';
import './App.css';
import axios from 'axios';
import LoadingScreen from 'react-loading-screen';
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row, Col } from 'react-bootstrap';

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      info: '',
      champs: '',
      champsCurrent: '',
      champsSeason: '',
      teams: '',
      error: null,
      loading: true
    };
    this.selectRegion = this.selectRegion.bind(this);
  }

  selectRegion = async (e) => {
    var teams = [];
    let idx = e.target.selectedIndex;
    const index = this.state.info[idx].id;
    await axios.get(`http://api.football-data.org/v2/competitions/${index}`,
      {
        headers: {
          'X-Auth-Token': 'd5627ca1908f47b19b6e11d039d113da',
          'content-type': 'application/json'
        }
      }
    ).then(res => {
      this.setState({
        champs: res.data,
        champsCurrent: res.data.currentSeason,
        champsSeason: res.data.seasons,
        error: null
      })
      axios.get(`http://api.football-data.org/v2/competitions/${index}/teams`,
        {
          headers: {
            'X-Auth-Token': 'd5627ca1908f47b19b6e11d039d113da',
            'content-type': 'application/json'
          }
        }
      ).then(res => {
        console.log(res.data.teams)
        let teamsList = res.data.teams.map((item, i) => {
          teams.push(item)
        })
        this.setState({ teams: teams })
      })
    }).catch(err => {
      console.log('error')
      this.setState({
        error: "true"
      })
    })
  };

  async componentWillMount() {
    var listSucess = [];
    var champs = [];
    var champsCurrent = [];
    var champsSeason = [];
    await axios.get("http://api.football-data.org/v2/competitions/",
      {
        headers: {
          'X-Auth-Token': 'd5627ca1908f47b19b6e11d039d113da',
          'content-type': 'application/json'
        }
      }
    ).then(res => {
      var listNames = [];
      let infoList = res.data.competitions.map(async (item, i) => {
        await axios.get(`http://api.football-data.org/v2/competitions/${item.area.id}`,
          {
            headers: {
              'X-Auth-Token': 'd5627ca1908f47b19b6e11d039d113da',
              'content-type': 'application/json'
            }
          }
        ).then(res => {
          listSucess.push(res.data);
          champs.push(res.data);
          champsCurrent.push(res.data.currentSeason);
          champsSeason.push(res.data.seasons);
          console.log(listSucess)
        }).catch(err => {
          this.setState({
            error: "true"
          })
        })
        return (
          this.setState({
            info: listSucess,
            champs: champs,
            champsCurrent: champsCurrent,
            champsSeason: champsSeason,
            error: null,
            loading: false
          })
        )
      }, this);
    })
  }

  render() {
    const { info, champs, champsCurrent, champsSeason, error, teams, loading } = this.state;
    let seasonList = ((error === null) && champsSeason) ? champsSeason.map((item, i) => (
      <div key={i}>
        <p key={i}>{'Id season: '}{item.id}</p>
        <li>{'Start date: '}{item.startDate}</li>
        <li>{'End date: '}{item.endDate}</li>
      </div>

    )) : (<div key={0}>
      <p>{"Dados indisponíveis"}</p>
    </div>)

    let infoList = info.length > 0 && info.map((item, i) => {
      return (
        <option key={i} value={info[i].id}>{item.area.name}</option>
      )
    }, this);

    let infoTeams = teams.length > 0 ? teams.map((item, i) => (
        <div key={i}>
          <ul>
            <li>
              {item.name}
            </li>
          </ul>
        </div>
      
    )) : (<div key={0}>
      <p>{"Dados indisponíveis"}</p>
    </div>)

    return (
      <div>
        <LoadingScreen
          loading={loading}
          bgColor='#f1f1f1'
          spinnerColor='#9ee5f8'
          textColor='#676767'
          // logoSrc='/logo.png'
          text='Welcome to FBI - Football Browser Information'
        >
          <div>
            <div className="grid-container">
              <div className="item1">Wait dropdown loads then select your region:</div>
            </div>
            <div>
              <select className="browser-default custom-select mb-3" onChange={this.selectRegion}>
                {infoList}
              </select>
            </div>
            <Container>
              <Row>
                <Col>
                  <p>Current Season</p>
                  <ul>
                    {champs.name}{' - '}{champs.code}
                    <li>{'Start date: '}{champsCurrent.startDate}</li>
                    <li>{'End date: '}{champsCurrent.endDate}</li>
                  </ul>
                </Col>
                <Col>
                  <p>Previous Seasons</p>
                  <ul>
                    {seasonList}
                  </ul>
                </Col>
                <Col>
                  Teams in competition:
          {infoTeams}
                </Col>
              </Row>
            </Container>
          </div>
        </LoadingScreen>
      </div>
    );
  }
}