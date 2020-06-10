import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import RequestTable from './RequestTable';
import Form from './Form';


const { chrome } = window;

const styles = () => ({
  buttonsArea: {
    justifyContent: 'space-evenly',
    display: 'flex',
    marginTop: 30,
    flex: 1,
    alignItems: 'center',
  },
});

class EditProject extends React.Component {
  constructor() {
    super();
    this.state = {
      projectInfo: {},
    }
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.onMessage);
    chrome.runtime.sendMessage({ getProjects: true });
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.onMessage);
  }

  onMessage = (request, sender, response) => {
    const { msg } = request;
    if (msg === 'sendProjects') {
      const { projects } = request;
      const { params } = this.props.match;
      // eslint-disable-next-line eqeqeq
      const projectInfo = projects.filter(project => project.id == params.id)[0];
      this.setState({ projectInfo });
    }
  }

  saveProject = (projectInfo) => {
    const updatedProject = { ...this.state.projectInfo, ...projectInfo };
    this.setState({ projectInfo: updatedProject }, () => {
      chrome.runtime.sendMessage({ updateProject: true, data: updatedProject });
    });
  }

  render() {
    const { classes } = this.props;
    const { projectInfo } = this.state;
    return (
      <div>
        <Form saveProject={this.saveProject} projectInfo={projectInfo} />
        <RequestTable history={this.props.history} projectInfo={projectInfo} />
        <div className={classes.buttonsArea}>
          <Button variant="contained" color="primary" component={Link} to={`/discover/${projectInfo.id}/re-discover`}>Re-discovery</Button>
          <Button variant="contained" color="default" component={Link} to="/project">Exit</Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(EditProject);
