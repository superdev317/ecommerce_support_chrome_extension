import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
import CloudDownload from '@material-ui/icons/CloudDownload';
import TablePaginationActionsWrapped from '../Libs/TablePaginationActionsWrapped';
import SearchComponent from './Search';
import ConfirmModal from '../Modals/ConfirmModal';


const chrome = window.chrome || {};

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

let ProjectTableToolbar = (props) => {
  const { classes, search } = props;

  return (
    <Toolbar
      className={classes.root}
    >
      <SearchComponent search={search} />
      <div className={classes.spacer} />
      <div className={classes.actions}>
        <Tooltip title="New Project">
          <IconButton aria-label="New Project" component={Link} to="/discover/create">
            <AddCircleOutline />
          </IconButton>
        </Tooltip>
      </div>
    </Toolbar>
  );
};

ProjectTableToolbar.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  search: PropTypes.func.isRequired,
};

ProjectTableToolbar = withStyles(toolbarStyles)(ProjectTableToolbar);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  tebleCell: {
    padding: '0 10px',
  },
  tebleRow: {
    height: 31,
  },
  tebleHeaderRow: {
    borderTop: '1px solid #E0E0E0',
    height: 36,
  },
  leftBorder: {
    borderLeft: '1px solid #E0E0E0',
  },
  smallButton: {
    padding: '3px',
    cursor: 'pointer',
  },
});

class Project extends React.Component {
  state = {
    page: 0,
    rowsPerPage: 15,
    projects: [],
    search: '',
  };

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.onMessage);
    chrome.runtime.sendMessage({ getProjects: true });
  }
  
  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.onMessage);
  }

  onMessage = (request, sender, response) => {
    const { msg } = request;
    if (msg === 'sendProjects') {
      const { projects } = request;
      this.setState({ projects });
    }
  }

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: event.target.value });
  };

  search = (search) => {
    this.setState({ search });
  }

  openConfirmModal = (id) => {
    const message = 'Are you sure you want to delete this project?'
    ReactDOM.render(<ConfirmModal message={message} handleConfirm={this.deleteProject.bind(this, id)} handleCancel={this.closeConfirmModal} />, document.getElementById('confirm_modal'));
  }

  closeConfirmModal = () => {
    ReactDOM.unmountComponentAtNode(document.getElementById('confirm_modal'));
  }

  deleteProject = (projectId) => {
    chrome.runtime.sendMessage({ deleteProject: true, projectId: projectId });
    this.closeConfirmModal();
  }

  exportProject = (projectId) => {
    chrome.runtime.sendMessage({ downloadProject: true, projectId })
  }

  render() {
    const { classes } = this.props;
    const { rowsPerPage, page, projects, search } = this.state;
    var filteredProjects = projects.filter(project => (
      project.id.toString().includes(search.toLowerCase()) ||
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.desc.toLowerCase().includes(search.toLowerCase())
    ));
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredProjects.length - page * rowsPerPage);
    return (
      <Paper className={classes.root}>
        <ProjectTableToolbar search={this.search} />
        <Table className={classes.table}>
          <TableHead>
            <TableRow className={classes.tebleHeaderRow}>
              <TableCell className={classes.leftBorder} style={{ borderLeftWidth: '0px' }} align="center" padding="none">ProjectId</TableCell>
              <TableCell className={classes.leftBorder} align="center" padding="none">Project Name</TableCell>
              <TableCell className={classes.leftBorder} align="center" padding="none">Project Desc</TableCell>
              <TableCell className={classes.leftBorder} align="center" padding="none">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(project => (
              <TableRow key={project.id} className={classes.tebleRow} hover>
                <TableCell className={classes.tebleCell} style={{ width: '20%' }} align="center">{project.id}</TableCell>
                <TableCell className={`${classes.tebleCell} ${classes.leftBorder}`} style={{ width: '20%' }} align="left">{project.name}</TableCell>
                <TableCell className={`${classes.tebleCell} ${classes.leftBorder}`} style={{ width: '30%' }} align="left">{project.desc}</TableCell>
                <TableCell className={`${classes.tebleCell} ${classes.leftBorder}`} style={{ width: '30%', paddingRight: '10px' }} align="center">
                  <IconButton component={Link} to={`/discover/${project.id}`} color="primary" className={classes.smallButton}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={this.openConfirmModal.bind(this, project.id)} color="secondary" className={classes.smallButton}>
                    <Delete />
                  </IconButton>
                  <IconButton onClick={this.exportProject.bind(this, project.id)} color="default" className={classes.smallButton}>
                    <CloudDownload />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 31 * emptyRows }}>
                <TableCell colSpan={4} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 15, 20]}
                colSpan={4}
                count={filteredProjects.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  native: true,
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActionsWrapped}
              />
            </TableRow>
          </TableFooter>
        </Table>
        <div id="confirm_modal" />
      </Paper>
    );
  }
}

Project.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Project);
