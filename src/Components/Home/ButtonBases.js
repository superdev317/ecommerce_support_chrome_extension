import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'space-evenly',
    minWidth: 300,
    width: '100%',
    marginTop: 80,
  },
  button: {
    position: 'relative',
    height: 150,
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      width: '100% !important', // Overrides inline-style
      height: 100,
    },
    '&:hover, &$focusVisible': {
      zIndex: 1,
      '& $buttonBackdrop': {
        opacity: 0.15,
      },
    },
  },
  focusVisible: {},
  buttonButton: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
  },
  buttonSrc: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
  },
  buttonBackdrop: {
    position: 'absolute',
    borderRadius: '5px',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create('opacity'),
  },
  buttonTitle: {
    position: 'relative',
  },
});

const buttons = [
  {
    title: 'Discover Mode',
    description: `Let's get started discovering browser requests`,
    width: '30%',
  },
  {
    title: 'Rules Mode',
    description: 'Create Failures',
    width: '30%',
  },
];

function ButtonBases(props) {
  const { classes } = props;

  return (
    <div className={classes.root}>
      {buttons.map(button => (
        <ButtonBase
          focusRipple
          key={button.title}
          className={classes.button}
          focusVisibleClassName={classes.focusVisible}
          style={{
            width: button.width,
          }}
        >
          <span className={classes.buttonBackdrop} />
          <span className={classes.buttonButton}>
            <Typography
              component="span"
              variant="subtitle1"
              color="inherit"
              className={classes.buttonTitle}
              >
              {button.title}
            </Typography>
            <Typography
              color="inherit"
              component="span"
              variant="subtitle1"
              className={classes.buttonTitle}
            >
              {button.description}
            </Typography>
          </span>
        </ButtonBase>
      ))}
    </div>
  );
}

ButtonBases.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ButtonBases);
