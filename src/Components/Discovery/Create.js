import React from 'react';
import DiscoverTable from './DiscoverTable';
import Form from './Form';


const { chrome } = window;

class CreateProject extends React.Component {
  constructor() {
    super();
    this.state = {
      projectInfo: {},
    }
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.onMessage);
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.onMessage);
  }

  onMessage = (request, sender, sendResponse) => {
    const { msg } = request;
    if (msg === 'projectAdded') {
      const { newProject } = request;
      this.setState({ projectInfo: newProject });
    }
  }

  saveProject = (projectInfo) => {
    this.setState({ projectInfo }, () => {
      chrome.runtime.sendMessage({ addProject: true, data: projectInfo });
    });
  }

  render() {
    const { projectInfo } = this.state;
    return (
      <div>
        <Form saveProject={this.saveProject} projectInfo={projectInfo} />
        <DiscoverTable projectInfo={projectInfo} />
      </div>
    );
  }
}

export default CreateProject;
