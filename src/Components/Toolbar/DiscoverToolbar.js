import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';


const styles = theme => ({
  container: {
    textAlign: 'center',
  },
  pageTitle: {
    color: '#fff',
    margin: 0,
    paddingLeft: 50,
  },
});

class DiscoverToolbar extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Typography paragraph variant="h6" className={classes.pageTitle}>
          Discovery Mode
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles)(DiscoverToolbar);
