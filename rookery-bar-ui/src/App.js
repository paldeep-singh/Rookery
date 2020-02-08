import React from 'react';
import './App.css';
import neo4j from 'neo4j-driver';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: []
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
      .run('MATCH (n:Alcohol) RETURN n')
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

  render() {
    return (
      <>
        <ul>
          {this.state.data.map(item =>
            <li>{item}</li>
          )}
        </ul>
      </>
    )
  };
}

export default App;
