import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';


const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing.unit * 2,
  },
  inputArea: {
    width: '40%',
  },
  buttonArea: {
    justifyContent: 'flex-end',
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
  margin: {
    marginLeft: theme.spacing.unit * 3,
  },
});

class FormComponent extends React.Component {
  state = {
    name: '',
    desc: '',
    isError: false,
  };

  componentWillReceiveProps(props) {
    // eslint-disable-next-line eqeqeq
    if (props.projectInfo != this.props.projectInfo) {
      const { projectInfo } = props;
      const name = projectInfo.name || '';
      const desc = projectInfo.desc || '';
      this.setState({ name, desc });
    }
  }

  handleChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value });
  };

  saveProject = () => {
    const { name, desc } = this.state;
    if (name === '' || desc === '') {
      this.setState({ isError: true });
    } else {
      this.setState({ isError: false });
      this.props.saveProject({ name, desc });
    }
  }

  render() {
    const { classes } = this.props;
    const { name, desc, isError } = this.state;
    return (
      <Paper className={classes.root}>
        <div className={classes.inputArea}>
          <TextField
            id="project-name"
            label="Project Name"
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
            id="project-desc"
            label="Project Desc"
            className={classes.margin}
            fullWidth
            error={isError && desc === '' }
            name="desc"
            required
            value={this.state.desc}
            onChange={this.handleChange}
          />
        </div>
        <div className={classes.buttonArea}>
          <Button variant="contained" className={classes.button} onClick={this.saveProject}>
            Save Project
          </Button>
        </div>
      </Paper>
    );
  }
}

FormComponent.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FormComponent);