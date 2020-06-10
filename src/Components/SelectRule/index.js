import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Shuffle from '@material-ui/icons/Shuffle';
import Block from '@material-ui/icons/Block';
import SwapHoriz from '@material-ui/icons/SwapHoriz';
import Code from '@material-ui/icons/Code';
import PhoneIphone from '@material-ui/icons/PhoneIphone';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';


const styles = theme => ({
  container: {
    textAlign: 'center',
    display: 'flex',
    flexWrap: 'wrap'
  },
  card: {
    flexBasis: '20%',
    margin: 20,
    textDecoration: 'unset'
  },
  media: {
    height: 140,
    display: 'flex',
    justifyContent: 'center'
  },
  icon: {
    zoom: 3,
    marginTop: 15,
  }
});

class SelectRule extends React.Component {
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
      <div className={classes.container}>
        <Card className={classes.card} component={Link} to="/discover/redirect">
          <CardActionArea>
            <CardMedia
              className={classes.media}
              title="Redirect Request"
            >
              <Shuffle className={classes.icon} />
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h6" component="h2">
                Redirect Request
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card className={classes.card} component={Link} to="#">
          <CardActionArea>
            <CardMedia
              className={classes.media}
              title="Cancel Request"
            >
              <Block className={classes.icon} />
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h6" component="h2">
                Cancel Request
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card className={classes.card} component={Link} to="#">
          <CardActionArea>
            <CardMedia
              className={classes.media}
              title="Replace Host"
            >
              <SwapHoriz className={classes.icon} />
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h6" component="h2">
                Replace Host
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card className={classes.card} component={Link} to="#">
          <CardActionArea>
            <CardMedia
              className={classes.media}
              title="Modify Headers"
            >
              <Icon className={classes.icon}>H</Icon>
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h6" component="h2">
                Modify Headers
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card className={classes.card} component={Link} to="#">
          <CardActionArea>
            <CardMedia
              className={classes.media}
              title="Modify Query Parameters"
            >
              <Icon className={classes.icon}>?</Icon>
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h6" component="h2">
                Modify Query Parameters
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card className={classes.card} component={Link} to="#">
          <CardActionArea>
            <CardMedia
              className={classes.media}
              title="Insert Scripts"
            >
              <Code className={classes.icon} />
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h6" component="h2">
                Insert Scripts
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card className={classes.card} component={Link} to="#">
          <CardActionArea>
            <CardMedia
              className={classes.media}
              title="Override User-Agent"
            >
              <PhoneIphone className={classes.icon} />
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h6" component="h2">
                Override User-Agent
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(SelectRule);
