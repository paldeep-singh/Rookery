import React from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography"
import CssBaseline from "@material-ui/core/CssBaseline"
import { Card, CardContent } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


const axios = require('axios').default
const buttonStyles = {
  justifyContent: 'left'
}

const listStyles = {
  maxHeight: 225,
  position: 'relative',
  overflow: 'auto',
  minHeight: 225
}

const isSearched = searchTerm => alcoholName =>
  alcoholName.toLowerCase().includes(searchTerm.toLowerCase());

async function getSpecificCocktail(selectedCocktail) {

  let requestAddress = 'https://rookery-bar-app-server-269602.appspot.com/api/cocktail/' + selectedCocktail

  let resultData = undefined

  await axios.get(requestAddress)
    .then(function (response) {
      resultData = response.data
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });


  return resultData
}

function CocktailDialog(props) {
  const [open, setOpen] = React.useState(false);
  const [chosenCocktail, setChosenCocktail] = React.useState(undefined)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOnEnter = async () => {
    const newCocktail = await getSpecificCocktail(props.cocktailName)
    setChosenCocktail(newCocktail)
  }

  return (
    <div>
      <Button onClick={handleClickOpen}>
        {props.cocktailName}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        onEnter={handleOnEnter}
        aria-labelledby="cocktail-dialog-title"
        aria-describedby="cocktail-dialog-description"
      >
        <DialogTitle id="cocktail-dialog-title">{props.cocktailName + " Recipe"}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText id="cocktail-dialog-description">
            <Typography gutterBottom>Ingredients: {chosenCocktail ? chosenCocktail.ingredients : "Loading..."}</Typography>
            <Typography>Method: {chosenCocktail ? chosenCocktail.method : "Loading..."}</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div >
  );
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      alcoholList: [],
      myBar: [],
      cocktailList: [], //Cocktails missing no alcohol
      cocktailList2: [], //Cocktails missing 1 alcohol
      searchTerm: '',
      filterTerm: ''
    }
  }

  async getAlcohols() {

    let resultData = []
    await axios.get('https://rookery-bar-app-server-269602.appspot.com/api/alcohol')
      .then(function (response) {
        // handle success
        let x = 0
        response.data.forEach(record => {
          resultData.push(
            response.data[x].name)
          x += 1
        })

      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
    this.setState({ alcoholList: resultData })
  }

  async getCocktailsMissingNone() {

    //create address to use
    let requestAddress = 'https://rookery-bar-app-server-269602.appspot.com/api/cocktail/?filter=none-missing'

    if (this.state.myBar.length === 1) {
      requestAddress = requestAddress + '&alcohol=' + this.state.myBar[0] + '&alcohol=blah'
    }
    else if (this.state.myBar.length > 1) {
      let x = 0
      while (x < this.state.myBar.length) {
        requestAddress = requestAddress + '&alcohol=' + this.state.myBar[x]
        x += 1
      }
    }
    else if (this.state.myBar.length === 0) {
      requestAddress = 'https://rookery-bar-app-server-269602.appspot.com/api/cocktail/?filter=none-missing&alcohol=blah&alcohol=blah'
    }

    encodeURI(requestAddress)

    let resultData = []
    await axios.get(requestAddress)
      .then(function (response) {
        // handle success
        let x = 0
        response.data.forEach(record => {
          resultData.push(
            response.data[x].name)
          x += 1
        })
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
    this.setState({ cocktailList: resultData })
  }

  async getCocktailsMissingOne() {

    //create address to use
    let requestAddress = 'https://rookery-bar-app-server-269602.appspot.com/api/cocktail/?filter=one-missing'

    if (this.state.myBar.length === 1) {
      requestAddress = requestAddress + '&alcohol=' + this.state.myBar[0] + '&alcohol=blah'
    }
    else if (this.state.myBar.length > 1) {
      let x = 0
      while (x < this.state.myBar.length) {
        requestAddress = requestAddress + '&alcohol=' + this.state.myBar[x]
        x += 1
      }
    }
    else if (this.state.myBar.length === 0) {
      requestAddress = 'https://rookery-bar-app-server-269602.appspot.com/api/cocktail/?filter=one-missing&alcohol=blah&alcohol=blah'
    }

    encodeURI(requestAddress)

    let resultData = []
    await axios.get(requestAddress)
      .then(function (response) {
        // handle success
        console.log(response)
        let x = 0
        response.data.forEach(record => {
          resultData.push(
            response.data[x].name)
          x += 1
        })
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
    this.setState({ cocktailList2: resultData })
  }

  componentDidMount() {
    this.getAlcohols()
    this.getCocktails()
  }

  getCocktails() {
    this.getCocktailsMissingNone()
    this.getCocktailsMissingOne()
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
    this.getCocktails()
  }

  removeFromBar(alcohol) {
    let updateBar = this.state.myBar
    let removeIndex = updateBar.indexOf(alcohol)
    updateBar.splice(removeIndex, 1)
    updateBar.sort()
    this.setState({
      myBar: updateBar
    });
    this.getCocktails()
  }

  handleSearchChange = (event) => {
    this.setState({
      searchTerm: event.target.value
    })
  }

  handleFilterChange = (event) => {
    this.setState({
      filterTerm: event.target.value
    })
  }

  render() {
    return (
      <>
        <CssBaseline />
        <Grid container spacing={3} justify="center" wrap='wrap'>
          <Grid item xs={10} sm={6} md={4}  lg={3} xl={3}>
            <Card variant="outlined">
              <CardContent>
                <form noValidate autoComplete="off">
                  <Typography variant="subtitle1" align="center" paragraph={true} >
                    Add alcohol to your bar.
                  </Typography>
                  <TextField id="standard-basic"
                    label="Type here to search"
                    fullWidth={true}
                    value={this.state.searchTerm}
                    onChange={this.handleSearchChange}
                  />
                </form>
                <List style={listStyles}>
                  {this.state.alcoholList.filter(isSearched(this.state.searchTerm)).map(item =>
                    <ListItem key={item}>
                      <Button fullWidth={true} style={buttonStyles} onClick={() => this.addToBar(item)}>{item}</Button></ListItem>
                  )}</List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={10} sm={6} md={4}  lg={3} xl={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" align="center" paragraph={true} >
                  Your Bar (click to remove)
              </Typography>
                <TextField id="standard-basic"
                  label="Type here to filter"
                  fullWidth={true}
                  value={this.state.filterTerm}
                  onChange={this.handleFilterChange}
                />
                <List style={listStyles}>
                  {this.state.myBar.filter(isSearched(this.state.filterTerm)).map(item =>
                    <ListItem key={item}>
                      <Button fullWidth={true} style={buttonStyles} onClick={() => this.removeFromBar(item)}>{item}</Button>
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <CssBaseline />
        <Grid container spacing={3} justify="center">
        <Grid item xs={10} sm={6} md={4} lg={3} xl={3}>
            <Card variant="outlined" >
              <CardContent>
                <Typography variant="subtitle1" align="center" paragraph={true} >
                  Available Cocktails:
              </Typography>
                <List style={listStyles}>
                  {this.state.cocktailList.map(item =>
                    <ListItem key={item}>

                      <CocktailDialog cocktailName={item}></CocktailDialog>
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={10} sm={6} md={4}  lg={3} xl={3}>
            <Card variant="outlined" >
              <CardContent>
                <Typography variant="subtitle1" align="center" paragraph={true} >
                  Cocktails missing one alcohol:
              </Typography>
                <List style={listStyles}>

                  {this.state.cocktailList2.map(item =>
                    <ListItem key={item}>

                      <CocktailDialog cocktailName={item}></CocktailDialog>
                    </ListItem>
                  )}

                </List>
              </CardContent>
            </Card>
          </Grid>
          
        </Grid>
        <p align="center">Cocktails from https://www.thecocktaildb.com/</p>
      </>
    )
  };
}

export default App;
