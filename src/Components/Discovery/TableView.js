import React from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
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
import Apps from '@material-ui/icons/Apps';
import MoreVert from '@material-ui/icons/MoreVert';
import TablePaginationActionsWrapped from '../Libs/TablePaginationActionsWrapped';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Shuffle from '@material-ui/icons/Shuffle';
// import Block from '@material-ui/icons/Block';
// import SwapHoriz from '@material-ui/icons/SwapHoriz';
// import Code from '@material-ui/icons/Code';
// import PhoneIphone from '@material-ui/icons/PhoneIphone';
// import Icon from '@material-ui/core/Icon';


const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  tableCell: {
    padding: '0 10px',
  },
  tableRow: {
    height: 31,
  },
  tableHeaderRow: {
    height: 36,
  },
  customCell: {
    display: 'inline-flex',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  favIcon: {
    height: 15,
    width: 'auto',
    marginRight: 5,
  },
  editButton: {
    padding: '0px',
    cursor: 'pointer',
  },
  leftBorder: {
    borderLeft: '1px solid #E0E0E0',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  smallButton: {
    padding: '3px',
    cursor: 'pointer',
  },
  icon: {
    zoom: 0.5,
    lineHeight: '24px'
  }
});

class TableView extends React.Component {
  state = {
    page: 0,
    rowsPerPage: 10,
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: event.target.value });
  };

  handleRuleIconClick = (row, url, event) => {
    this.props.sendTempRequest(row, event);
    setTimeout(() => {
      this.props.history.push(url);
    }, 100);
  }

  getShortText = (text) => {
    const limit = 70;
    text = text || '';
    if (text.length > limit) {
      return text.substring(0, limit) + '...';
    } else {
      return text;
    }
  }

  render() {
    const { classes, rows, handleMenuClick, anchorEl, isDisabled } = this.props;
    const { rowsPerPage, page } = this.state;
    console.log(rows)
    // const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>{rows[0].baseUrl}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Paper className={classes.root}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow className={classes.tableHeaderRow}>
                  <TableCell align="center" padding="none">Base URL</TableCell>
                  <TableCell className={classes.leftBorder} align="center" padding="none">Discovered Requests</TableCell>
                  <TableCell className={classes.leftBorder} align="center" padding="none">Type</TableCell>
                  <TableCell className={classes.leftBorder} align="center" padding="none">Assigned Rules</TableCell>
                  <TableCell className={classes.leftBorder} align="center" padding="none">Failure Rule</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                  <TableRow key={row.id} className={classes.tableRow} hover>
                    <TableCell className={classes.tableCell} style={{ width: '30%' }} align="left">
                      {row.type === 'baseUrl' && <span className={classes.customCell} title={row.baseUrl}>
                        <img className={classes.favIcon} src={row.favIconUrl} alt="favIcon" />
                        {
                          row.ruleTypes ? 
                            <a href={row.baseUrl} target="_blank">{this.getShortText(row.baseUrl)}</a> :
                            this.getShortText(row.baseUrl)
                        }
                      </span>}
                    </TableCell>
                    <TableCell className={`${classes.tableCell} ${classes.leftBorder}`} style={{ width: '40%' }} align="left">
                      <span className={classes.customCell} title={row.discoveredRequest}>{this.getShortText(row.discoveredRequest)}</span>
                    </TableCell>
                    <TableCell className={`${classes.tableCell} ${classes.leftBorder}`} style={{ width: '10%' }} align="center">{row.requestType}</TableCell>
                    <TableCell className={`${classes.tableCell} ${classes.leftBorder}`} style={{ width: '10%' }} align="center">
                      {(row.ruleTypes && row.ruleTypes.includes('Redirect')) && <IconButton onClick={this.handleRuleIconClick.bind(this, row, `/discover/redirect`)} color="primary" className={classes.smallButton}>
                        <Shuffle className={classes.icon} />
                      </IconButton>}
                      {/* <IconButton color="primary" className={classes.smallButton}>
                        <Block className={classes.icon} />
                      </IconButton>
                      <IconButton color="primary" className={classes.smallButton}>
                        <SwapHoriz className={classes.icon} />
                      </IconButton>
                      <IconButton color="primary" className={classes.smallButton}>
                        <Icon className={classes.icon}>H</Icon>
                      </IconButton>
                      <IconButton color="primary" className={classes.smallButton}>
                        <Icon className={classes.icon}>?</Icon>
                      </IconButton>
                      <IconButton color="primary" className={classes.smallButton}>
                        <Code className={classes.icon} />
                      </IconButton>
                      <IconButton color="primary" className={classes.smallButton}>
                        <PhoneIphone className={classes.icon} />
                      </IconButton> */}
                    </TableCell>
                    <TableCell className={`${classes.tableCell} ${classes.leftBorder}`} style={{ width: '10%' }} align="center">
                      <IconButton
                        disabled={isDisabled}
                        aria-owns={anchorEl ? 'anchor-button-menu' : null}
                        aria-haspopup="true"
                        onClick={handleMenuClick.bind(this, row)}
                        className={classes.editButton}
                      >
                        {row.type === 'baseUrl' ? <Apps /> : <MoreVert />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {/* {emptyRows > 0 && (
                  <TableRow style={{ height: 31 * emptyRows }}>
                    <TableCell colSpan={4} />
                  </TableRow>
                )} */}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={4}
                    count={rows.length}
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
          </Paper>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

TableView.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TableView);
