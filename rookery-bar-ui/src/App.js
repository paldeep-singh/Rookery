import React from 'react';
import './App.css';
import neo4j from 'neo4j-driver';
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
  let resultData = {}
  let driver = await neo4j.driver(
    process.env.REACT_APP_NEO4J_URL,
    neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
  )
  let session = await driver.session()
  session
    .run(
      `MATCH (c:Cocktail)
        WHERE c.name = $cocktailName
        RETURN c`,
      { cocktailName: selectedCocktail }
    )
    .then(result => {
      result.records.forEach(record => {
        resultData = record.toObject().r
      })
    })
    .catch(error => {
      console.log(error)
    })
    .then(() => session.close())
  return resultData
}

function CocktailDialog(props) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={handleClickOpen}>
        {props.cocktailName}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Cocktail Recipe"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>ingredients</p>
            <p>method</p>
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
      filterTerm: '',
      selectedCocktail: {},
      dialogOpen: false
    }
  }

  async getAlcohols() {
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
        this.setState({ alcoholList: resultData })
      })
      .catch(error => {
        console.log(error)
      })
      .then(() => session.close())
  }

  async getCocktailsMissingNone() {
    let resultData = []
    let driver = await neo4j.driver(
      process.env.REACT_APP_NEO4J_URL,
      neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = await driver.session()
    session
      .run(
        `MATCH (i:Alcohol)
        WHERE i.name IN $checkList
        WITH COLLECT(i) AS available_alcohol
        MATCH (r:Cocktail)-[:CONTAINS_INGREDIENT]->(i:Alcohol)
        WITH available_alcohol, r, COLLECT(i) AS recipe_ingredients
        WHERE ALL(x IN recipe_ingredients WHERE x IN available_alcohol)
        RETURN r
        ORDER BY r.name`,
        { checkList: this.state.myBar }
      )
      .then(result => {
        result.records.forEach(record => {
          resultData.push(
            record.toObject().r.properties.name)
        })
      })
      .then(() => {
        this.setState({ cocktailList: resultData })
      })
      .catch(error => {
        console.log(error)
      })
      .then(() => session.close())
  }

  async getCocktailsMissingOne() {
    let resultData = []
    let driver = await neo4j.driver(
      process.env.REACT_APP_NEO4J_URL,
      neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = await driver.session()
    session
      .run(
        `MATCH (i:Alcohol)
        WHERE i.name IN $checkList
        WITH COLLECT(i) AS available_alcohol
        MATCH (r:Cocktail)-[:CONTAINS_INGREDIENT]->(i:Alcohol)
        WITH available_alcohol, r, COLLECT(i) AS recipe_ingredients
        WHERE SINGLE(x IN recipe_ingredients WHERE NOT x IN available_alcohol)
        RETURN r
        ORDER BY r.name`,
        { checkList: this.state.myBar }
      )
      .then(result => {
        result.records.forEach(record => {
          resultData.push(
            record.toObject().r.properties.name)
        })
      })
      .then(() => {
        this.setState({ cocktailList2: resultData })
      })
      .catch(error => {
        console.log(error)
      })
      .then(() => session.close())
  }

  async getSpecificCocktail(selectedCocktail) {
    let resultData = {}
    let driver = await neo4j.driver(
      process.env.REACT_APP_NEO4J_URL,
      neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = await driver.session()
    session
      .run(
        `MATCH (c:Cocktail)
        WHERE c.name = $cocktailName
        RETURN c`,
        { cocktailName: selectedCocktail }
      )
      .then(result => {
        result.records.forEach(record => {
          resultData = record.toObject().r
        })
      })
      .then(() => {
        this.setState({ selectedCocktail: resultData })
      })
      .catch(error => {
        console.log(error)
      })
      .then(() => session.close())
    this.handleCloseDialog()
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

  handleOpenDialog = () => {
    this.setState({
      dialogOpen: true
    })
  }

  handleCloseDialog = () => {
    this.setState({
      dialogOpen: false
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
                    <ListItem>
                      <Button fullWidth={true} style={buttonStyles} onClick={() => this.addToBar(item)}>{item}</Button></ListItem>
                  )}</List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
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
                    <ListItem>
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
          <Grid item xs={3}>
            <Card variant="outlined" >
              <CardContent>
                <Typography variant="subtitle1" align="center" paragraph={true} >
                  Available Cocktails:
              </Typography>
                <List style={listStyles}>
                  {this.state.cocktailList.map(item =>
                    <ListItem>
                      <CocktailDialog cocktailName={item}></CocktailDialog>
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card variant="outlined" >
              <CardContent>
                <Typography variant="subtitle1" align="center" paragraph={true} >
                  Cocktails missing one ingredient:
              </Typography>
                <List style={listStyles}>

                  {this.state.cocktailList2.map(item =>
                    <ListItem>

                      <Button fullWidth={true} style={buttonStyles}>{item}</Button></ListItem>
                  )}

                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </>
    )
  };
}

export default App;
