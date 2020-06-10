import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import RuleCard from './RuleCard';


const chrome = window.chrome || {};
const REQUEST_TYPE = 'Redirect';

const styles = theme => ({
  container: {
    textAlign: 'center',
  },
  paper: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing.unit * 2,
  },
  inputArea: {
    width: '30%',
  },
  buttonArea: {
    justifyContent: 'space-evenly',
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
  margin: {
    marginLeft: theme.spacing.unit * 3,
  },
});

class RedirectComponent extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      desc: '',
      isError: false,
      isActive: true,
      requestType: [],
      matchType: [],
      pairs: [],
      tempRequest: {},
    };
    // chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {});
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.onMessage);
    chrome.runtime.sendMessage({ getTypes: true });
    chrome.runtime.sendMessage({ getTempRequest: true });
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.onMessage);
  }

  onMessage = (request, sender, sendResponse) => {
    const { msg } = request;
    if (msg === 'sendTypes') {
      const { requestType, matchType } = request.data;
      this.setState({ requestType, matchType });
    } else if (msg === 'tempRequest') {
      const { tempRequest } = request;
      let url = '', srcProject = [], name = '', description = '';
      const { type, baseUrl, discoveredRequest, project } = tempRequest;
      if (type === 'baseUrl') {
        url = baseUrl;
        srcProject = project.baseUrl;
      } else {
        url = discoveredRequest;
        srcProject = project.childUrl;
      }
      let pairs = [];
      let pairsExist = false;
      for (var i = 0; i < srcProject.length; i++) {
        if (url === srcProject[i].url && srcProject[i].rules && srcProject[i].rules.length) {
          for (var j = 0; j < srcProject[i].rules.length; j++) {
            if (srcProject[i].rules[j].ruleType === REQUEST_TYPE) {
              pairs = srcProject[i].rules[j].pairs || [];
              name = srcProject[i].rules[j].name;
              description = srcProject[i].rules[j].description;
              pairsExist = true;
              break;
            }
          }
        }
        if (pairsExist) {
          break;
        }
      }
      this.setState({ tempRequest, name, desc: description }, () => {
        if (pairs.length === 0) {
          pairs.push(this.getNewRule());
        }
        this.setState({ pairs });
      });
    }
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleToggleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  getNewRule = () => {
    const { type, baseUrl, discoveredRequest } = this.state.tempRequest;
    let src = '';
    if (type === "baseUrl") {
      src = baseUrl;
    } else {
      src = discoveredRequest;
    }
    return {
      destination: '',
      source: {
        key: 0,
        operator: 0,
        value: src,
      }
    };
  }

  saveProject = () => {
    const { name, desc, pairs, isActive } = this.state;
    let invalidInput = false;
    for (var k = 0; k < pairs.length; k++) {
      if (pairs[k].destination === '' || pairs[k].source.value === '') {
        invalidInput = true;
        break;
      }
    }
    if (invalidInput) {
      return;
    }
    if (name === '') {
      this.setState({ isError: true });
    } else {
      this.setState({ isError: false });
      let { project, baseUrl, id, favIconUrl, type, discoveredRequest, requestType } = this.state.tempRequest;
      const currentTime = new Date().valueOf();
      const rule = {
        creationDate: currentTime,
        description: desc,
        groupId: '',
        id: `Redirect_${currentTime}`,
        name: name,
        objectType: 'rule',
        pairs: pairs,
        ruleType: 'Redirect',
        status: isActive,
      };
      let pairsExist = false;
      if (type === 'baseUrl') {
        let baseUrlExist = false;
        for (var i = 0; i < project.baseUrl.length; i++) {
          if (baseUrl === project.baseUrl[i].url) {
            project.baseUrl[i].rules = project.baseUrl[i].rules || [];
            for (var j = 0; j < project.baseUrl[i].rules.length; j++) {
              if (REQUEST_TYPE === project.baseUrl[i].rules[j].ruleType) {
                project.baseUrl[i].rules[j].pairs = pairs;
                pairsExist = true;
                break;
              }
            }
            if (!pairsExist) {
              project.baseUrl[i].rules.push(rule);
            }
            baseUrlExist = true;
            break;
          }
        }
        if (!baseUrlExist) {
          project.baseUrl.push({
            id: id,
            url: baseUrl,
            favIconUrl: favIconUrl,
            rules: [rule]
          });
        }
      } else {
        let childUrlExist = false;
        project.childUrl = project.childUrl || [];
        for (i = 0; i < project.childUrl.length; i++) {
          if (discoveredRequest === project.childUrl[i].url) {
            project.childUrl[i].rules = project.childUrl[i].rules || [];
            for (j = 0; j < project.childUrl[i].rules.length; j++) {
              if (REQUEST_TYPE === project.childUrl[i].rules[j].ruleType) {
                project.childUrl[i].rules[j].pairs = pairs;
                pairsExist = true;
                break;
              }
            }
            if (!pairsExist) {
              project.childUrl[i].rules.push(rule);
            }
            childUrlExist = true;
            break;
          }
        }
        if (!childUrlExist) {
          project.childUrl.push({
            id: id,
            url: discoveredRequest,
            requestType: requestType,
            rules: [rule]
          });
        }
        let isbaseUrlExist = false;
        for (k = 0; k < project.baseUrl.length; k++) {
          if (baseUrl === project.baseUrl[k].url) {
            isbaseUrlExist = true;
            break;
          }
        }
        if (!isbaseUrlExist) { // Add baseUrl if not exist
          project.baseUrl = project.baseUrl || [];
          project.baseUrl.push({
            id: id.split('_')[0],
            url: baseUrl,
            favIconUrl: favIconUrl,
            rules: []
          })
        }
      }
      chrome.runtime.sendMessage({ updateProject: true, data: project });
    }
  }

  newRule = () => {
    let { pairs } = this.state;
    pairs.push(this.getNewRule());
    this.setState({ pairs });
  }

  updateRule = (rule, index) => {
    let { pairs } = this.state;
    pairs[index] = rule;
    this.setState({ pairs }, () => {
    });
  }

  deleteRule = (index) => {
    let { pairs } = this.state;
    pairs.splice(index, 1);
    this.setState({ pairs });
  }

  render() {
    const { classes } = this.props;
    const { name, desc, isError, requestType, tempRequest, matchType, pairs } = this.state;
    const { type, baseUrl, discoveredRequest, project } = tempRequest;
    let src = '';
    if (type === "baseUrl") {
      src = baseUrl;
    } else {
      src = discoveredRequest;
    }
    return (
      <div className={classes.container}>
        <Paper className={classes.paper}>
          <div className={classes.inputArea}>
            <TextField
              label="Rule Name"
              fullWidth
              error={isError && name === ''}
              name="name"
              required
              value={this.state.name}
              onChange={this.handleChange}
            />
          </div>
          <div className={classes.inputArea}>
            <TextField
              label="Rule Desc"
              className={classes.margin}
              fullWidth
              error={isError && desc === ''}
              name="desc"
              value={this.state.desc}
              onChange={this.handleChange}
            />
          </div>
          <div className={classes.buttonArea}>
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.isActive}
                  onChange={this.handleToggleChange('isActive')}
                  value={this.state.isActive}
                />
              }
              labelPlacement="start"
              label="Status"
            />
            <Button variant="contained" className={classes.button} onClick={this.newRule}>
              New
            </Button>
            <Button variant="contained" className={classes.button} onClick={this.saveProject}>
              Save
            </Button>
            {project && <Button variant="contained" component={Link} to={`/discover/${project.id}/re-discover`} className={classes.button}>
              Exit
            </Button>}
          </div>
        </Paper>
        {requestType.length && matchType.length && pairs.map((pair, index) => (
          <RuleCard src={src} pair={pair} index={index} deleteRule={this.deleteRule} updateRule={this.updateRule.bind(this)} requestType={requestType} matchType={matchType} />
        ))}
      </div>
    );
  }
}

export default withStyles(styles)(RedirectComponent);
