import React from 'react';
import './App.css';
import neo4j from 'neo4j-driver';
import Button from '@material-ui/core/Button';
import SpacingGrid from './Components/Grid';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      myBar: []
    }
  }

  async getData() {
    let resultData = []
    let driver = await neo4j.driver(
      '',
      neo4j.auth.basic('', '')
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
        this.setState({ data: resultData })
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

  render() {
    return (
      <>
        <p>Alcohol options:
        <ul>
            {this.state.data.map(item =>
              <li>
                <Button size="small" onClick={() => this.addToBar(item)}>{item}</Button>
              </li>
            )}
          </ul></p>
        <p>My Bar
        <ul>
            {this.state.myBar.map(item =>
              <li>
                <Button size="small" onClick={() => this.removeFromBar(item)}>{item}</Button>
              </li>
            )}
          </ul></p>
      </>
    )
  };
}

export default App;
