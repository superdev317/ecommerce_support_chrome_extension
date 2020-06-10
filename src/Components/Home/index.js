import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ButtonBases from './ButtonBases';


const styles = theme => ({
  mainContent: {
    textAlign: 'center',
  },
  toolbar: theme.mixins.toolbar,
});

class Home extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {};
    // chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {});
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.mainContent}>
        <div className={classes.toolbar} />
        <Typography paragraph variant="h5">
          Chrome extension to modify network requests
        </Typography>
        <ButtonBases />
      </div>
    );
  }
}

export default withStyles(styles)(Home);
