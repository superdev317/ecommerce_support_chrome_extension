import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import Main from './Components/Main';
import './App.css';

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Main />
      </HashRouter>
    );
  }
}

export default App;
