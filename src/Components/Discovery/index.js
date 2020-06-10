import React from 'react';
import { Route, Switch } from 'react-router-dom';
import CreateProject from './Create';
import EditProject from './Edit';


class Discovery extends React.Component {

  render() {
    return (
      <Switch>
        <Route exact path="/discover/create" component={CreateProject} />
        <Route exact path="/discover/:id" component={EditProject} />
      </Switch>
    );
  }
}

export default Discovery;
