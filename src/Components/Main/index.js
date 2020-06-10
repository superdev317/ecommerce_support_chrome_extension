// Main Component that render Appbar and sidebar
import React from 'react';
import { Link, Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SettingsBackupRestore from '@material-ui/icons/SettingsBackupRestore';
import ImportExport from '@material-ui/icons/ImportExport';
import InsertChart from '@material-ui/icons/InsertChart';
import CreateComponent from '../Discovery/Create';
import EditComponent from '../Discovery/Edit';
import ReDiscoverComponent from '../Discovery/ReDiscover';
import Project from '../Project';
import ImprotExport from '../ImportExport';
import SelectRule from '../SelectRule';
import RedirectComponent from '../Redirect';
import ProjectToolbar from '../Toolbar/ProjectToolbar';
import ProjectEditToolbar from '../Toolbar/ProjectEditToolbar';
import ProjectReDiscoverToolbar from '../Toolbar/ProjectReDiscoverToolbar';
import DiscoverToolbar from '../Toolbar/DiscoverToolbar';
import ImportExportToolbar from '../Toolbar/ImportExportToolbar';
import SelectRuleToolbar from '../Toolbar/SelectRuleToolbar';
import RedirectToolbar from '../Toolbar/RedirectToolbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const drawerWidth = 240;

const chrome = window.chrome || {};

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: '#2196f3',
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 12,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing.unit * 7 + 1,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  hide: {
    display: 'none',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
});

class Main extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    // chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {});
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.onMessage);
    chrome.runtime.sendMessage({ discoverUrl: true });
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.onMessage);
  }

  onMessage = (request, sender, sendResponse) => {
    const { msg } = request;
    if (msg === 'showNotification') {
      const { notification } = request;
      toast(notification);
    }
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={classNames(classes.appBar, {
            [classes.appBarShift]: this.state.open,
          })}
        >
          <Toolbar disableGutters={!this.state.open}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, {
                [classes.hide]: this.state.open,
              })}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" noWrap>
              Web Request Manager
            </Typography>
            <Switch>
              <Route exact path="/discover/create" component={DiscoverToolbar} />
              <Route exact path="/discover/select-rule" component={SelectRuleToolbar} />
              <Route exact path="/discover/redirect" component={RedirectToolbar} />
              <Route path="/discover/:id/re-discover" component={ProjectReDiscoverToolbar} />
              <Route path="/discover/:id" component={ProjectEditToolbar} />
              <Route path="/project" component={ProjectToolbar} />
              <Route path="/import-export" component={ImportExportToolbar} />
            </Switch>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          className={classNames(classes.drawer, {
            [classes.drawerOpen]: this.state.open,
            [classes.drawerClose]: !this.state.open,
          })}
          classes={{
            paper: classNames({
              [classes.drawerOpen]: this.state.open,
              [classes.drawerClose]: !this.state.open,
            }),
          }}
          open={this.state.open}
        >
          <div className={classes.toolbar} >
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItem button component={Link} to="/discover">
              <ListItemIcon><SettingsBackupRestore /></ListItemIcon>
              <ListItemText primary="Discovery Mode" />
            </ListItem>
            <ListItem button component={Link} to="/project">
              <ListItemIcon><InsertChart /></ListItemIcon>
              <ListItemText primary="Project Mode" />
            </ListItem>
            <ListItem button component={Link} to="/import-export">
              <ListItemIcon><ImportExport /></ListItemIcon>
              <ListItemText primary="Import Expert Mode" />
            </ListItem>
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route exact path="/discover/create" component={CreateComponent} />
            <Route exact path="/discover/select-rule" component={SelectRule} />
            <Route exact path="/discover/redirect" component={RedirectComponent} />
            <Route exact path="/discover/:id" component={EditComponent} />
            <Route exact path="/discover/:id/re-discover" component={ReDiscoverComponent} />
            <Route exact path="/project" component={Project} />
            <Route exact path="/import-export" component={ImprotExport} />
            {/* <Redirect exact patch="/" to="/discover/redirect" /> */}
            <Redirect exact patch="/" to="/discover/create" />
            {/* <Route path="/" component={Start} /> */}
          </Switch>
        </main>
        <ToastContainer />
      </div>
    );
  }
}

export default withStyles(styles)(Main);
