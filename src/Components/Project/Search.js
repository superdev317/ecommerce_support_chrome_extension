import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

const styles = {
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: 5,
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4,
  },
};

class SearchComponent extends React.Component {
  state = {
    search: '',
  }

  search = () => {
    this.props.search(this.state.search.trim());
  }

  onChange = (event) => {
    const { value } = event.target;
    this.setState({ search: value });
  }

  render() {
    const { classes } = this.props;
  
    return (
      <Paper className={classes.root} elevation={1}>
        <InputBase className={classes.input} onChange={this.onChange} placeholder="Search Projects" />
        <Divider className={classes.divider} />
        <IconButton className={classes.iconButton} onClick={this.search} aria-label="Search">
          <SearchIcon />
        </IconButton>
      </Paper>
    );
  }
}

SearchComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  search: PropTypes.func.isRequired,
};

export default withStyles(styles)(SearchComponent);
