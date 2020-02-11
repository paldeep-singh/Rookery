import React from 'react';
import './App.css';
import neo4j from 'neo4j-driver';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography"
import CssBaseline from "@material-ui/core/CssBaseline"
import { Card, CardContent } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

const buttonStyles = {
  justifyContent: 'left'
}

const isSearched = searchTerm => alcoholName =>
  alcoholName.toLowerCase().includes(searchTerm.toLowerCase());

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      alcoholList: [],
      myBar: [],
      searchTerm: '',
      filteredList: []
    }
  }

  async getData() {
    let resultData = []
    let driver = await neo4j.driver(
      process.env.REACT_APP_NEO4J_URL,
      neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = await driver.session()
    session
      .run(
        'MATCH (n:Alcohol) RETURN n ORDER BY n.name'
      )
      .then(result => {
        result.records.forEach(record => {
          resultData.push(
            record.toObject().n.properties.name)
        })
      })
      .then(() => {
        this.setState({ alcoholList: resultData, filteredList: resultData })
      })
      .catch(error => {
        console.log(error)
      })
      .then(() => session.close())
  }

  componentDidMount() {
    this.getData();
  }

  addToBar(alcohol) {
    let updateBar = this.state.myBar
    let alcoholExist = updateBar.indexOf(alcohol)
    if (alcoholExist === -1) {
      updateBar.push(alcohol)
      updateBar.sort()
    }
    this.setState({
      myBar: updateBar
    });
  }

  removeFromBar(alcohol) {
    let updateBar = this.state.myBar
    let removeIndex = updateBar.indexOf(alcohol)
    updateBar.splice(removeIndex, 1)
    updateBar.sort()
    this.setState({
      myBar: updateBar
    });
  }

  handleSearchChange = (event) => {
    this.setState({
      searchTerm: event.target.value
    })
    this.handleDisplayAlcoholList(this.state.searchTerm)
  }

  handleFilterAlcohol(filterTerm) {
    return this.state.alcoholList.filter(function (el) {
      return el.toLowerCase().includes(filterTerm.toLowerCase())
    })
  }

  handleDisplayAlcoholList(filterTerm) {
    let workingAlcoholList = []
    if (this.state.searchTerm === '') {
      workingAlcoholList = this.state.alcoholList
    }
    else {
      workingAlcoholList = this.handleFilterAlcohol(filterTerm)
    }
    this.setState({
      filteredList: workingAlcoholList
    })
  }

  render() {
    return (
      <>
        <CssBaseline />
        <Grid container spacing={3} justify="center">
          <Grid item xs={3}>
            <Card variant="outlined">
              <CardContent>
                <form noValidate autoComplete="off">
                  <TextField id="standard-basic"
                    label="What alcohol do you have?"
                    fullWidth={true}
                    value={this.state.searchTerm}
                    onChange={this.handleSearchChange}
                  />
                </form> <br />
                {this.state.filteredList.map(item =>
                  <Button fullWidth={true} style={buttonStyles} onClick={() => this.addToBar(item)}>{item}</Button>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" >
                  My Bar
              </Typography>
                <br />
                {this.state.myBar.map(item =>

                  <Button fullWidth={true} style={buttonStyles} onClick={() => this.removeFromBar(item)}>{item}</Button>

                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    )
  };
}

export default App;
