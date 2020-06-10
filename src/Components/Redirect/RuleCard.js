import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';


const styles = theme => ({
  root: {
    textAlign: 'center',
    marginTop: 20,
  },
  paper: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing.unit * 2,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing.unit * 2,
    justifyContent: 'space-evenly',
  },
  inputArea: {
    width: '60%',
  },
  button: {
    margin: theme.spacing.unit,
  },
});

const validURLPattern = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

const isValidURL = (url) => validURLPattern.test(url);

class RuleCard extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    const { destination, source: { key, operator, value } } = props.pair;
    this.state = {
      src: value,
      target: destination,
      isError: false,
      selectedRequest: key,
      selectedmatch: operator,
    };
  }

  componentWillReceiveProps(props) {
    const { destination, source: { key, operator, value } } = props.pair;
    this.setState({
      src: value,
      target: destination,
      selectedRequest: key,
      selectedmatch: operator,
    });
  }

  deleteRule = () => {
    this.props.deleteRule(this.props.index);
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value }, () => {
      if (this.isValidRule()) {
        const { target, selectedRequest, selectedmatch, src } = this.state;
        this.props.updateRule({
          destination: target,
          source: {
            key: selectedRequest,
            operator: selectedmatch,
            value: src,
          },
        }, this.props.index);
      }
    });
  };

  isValidRule = () => isValidURL(this.state.src) && isValidURL(this.state.target);

  render() {
    const { classes, requestType, matchType, index } = this.props;
    const { selectedRequest, selectedmatch, target, src } = this.state;
    return (
      <Paper className={classes.root}>
        <div className={classes.row}>
          <FormControl className={classes.formControl}>
            <Select
              value={selectedRequest}
              onChange={this.handleChange}
              name="selectedRequest"
            >
              {requestType.map((item, key) => <MenuItem value={key}>{item.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <Select
              value={selectedmatch}
              onChange={this.handleChange}
              name="selectedmatch"
            >
              {matchType.map((item, key) => <MenuItem value={key}>{item.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            className={classes.inputArea}
            placeholder={matchType[selectedmatch].src}
            name="src"
            error={src === ''}
            onChange={this.handleChange}
            value={src}
          />
          {index > 0 && (
            <IconButton onClick={this.deleteRule} className={classes.button} aria-label="Delete">
              <DeleteIcon />
            </IconButton>
          )}
        </div>
        <div className={classes.row}>
          <TextField
            className={classes.inputArea}
            placeholder={matchType[selectedmatch].target}
            name="target"
            error={target === ''}
            onChange={this.handleChange}
            value={target}
          />
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(RuleCard);
