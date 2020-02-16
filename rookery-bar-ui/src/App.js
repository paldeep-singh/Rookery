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
  let driver = neo4j.driver(
    process.env.REACT_APP_NEO4J_URL,
    neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
  )
  let session = driver.session()
  let result = await session
    .run(
      `MATCH (c:Cocktail)
        WHERE c.name = $cocktailName
        RETURN c`,
      { cocktailName: selectedCocktail }
    )
  let resultData = result.records[0].toObject().c.properties
  session.close()
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
    let driver = neo4j.driver(
      process.env.REACT_APP_NEO4J_URL,
      neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = driver.session()
    let result = await session
      .run(
        'MATCH (n:Alcohol) RETURN n ORDER BY n.name'
      )

    let resultData = []
    result.records.forEach(record => {
      resultData.push(
        record.toObject().n.properties.name)
    })

    this.setState({ alcoholList: resultData })

    session.close()
  }

  async getCocktailsMissingNone() {

    let driver = neo4j.driver(
      process.env.REACT_APP_NEO4J_URL,
      neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = driver.session()

    let result = await session
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

    let resultData = []
    result.records.forEach(record => {
      resultData.push(
        record.toObject().r.properties.name)
    })

    this.setState({ cocktailList: resultData })

    session.close()
  }

  async getCocktailsMissingOne() {
    let driver = neo4j.driver(
      process.env.REACT_APP_NEO4J_URL,
      neo4j.auth.basic(process.env.REACT_APP_NEO4J_USER, process.env.REACT_APP_NEO4J_PASSWORD)
    )
    let session = driver.session()
    let result = await session
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

    let resultData = []
    result.records.forEach(record => {
      resultData.push(
        record.toObject().r.properties.name)
    })

    this.setState({ cocktailList2: resultData })

    session.close()
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
                    <ListItem key={item}>
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
          <Grid item xs={3}>
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
          <Grid item xs={3}>
            <Card variant="outlined" >
              <CardContent>
                <Typography variant="subtitle1" align="center" paragraph={true} >
                  Cocktails missing one ingredient:
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

      </>
    )
  };
}

export default App;
