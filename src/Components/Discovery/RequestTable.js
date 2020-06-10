import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TableView from './TableView';

const chrome = window.chrome || {};

class RequestTable extends React.Component {
  state = {
    anchorEl: null,
    selectedRow: {},
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleMenuClick = (selectedRow, event) => {
    const { projectInfo } = this.props;
    this.setState({ anchorEl: event.currentTarget, selectedRow }, () => {
      chrome.runtime.sendMessage({ sendTempRequest: true, data: { project: projectInfo, ...selectedRow } });
    });
  };

  sendTempRequest = (selectedRow, event) => {
    const { projectInfo } = this.props;
    chrome.runtime.sendMessage({ sendTempRequest: true, data: { project: projectInfo, ...selectedRow } });
  };

  render() {
    const { projectInfo } = this.props;
    const isDisabled = !(projectInfo.id);
    const { anchorEl } = this.state;
    let rows = [];
    if (
      projectInfo &&
      projectInfo.baseUrl &&
      projectInfo.baseUrl.length
    ) {
      for (var m = 0; m < projectInfo.baseUrl.length; m++) {
        let baseUrlExist = false;
        for (var j = 0; j < rows.length; j++) {
          if (projectInfo.baseUrl[m].url === rows[j].baseUrl) {
            baseUrlExist = true;
            break;
          }
        }
        if (!baseUrlExist) {
          var ruleTypes = [];
          if (projectInfo.baseUrl[m].rules && projectInfo.baseUrl[m].rules.length) {
            for (var n = 0; n < projectInfo.baseUrl[m].rules.length; n++) {
              if (!ruleTypes.includes(projectInfo.baseUrl[m].rules[n].ruleType)) {
                ruleTypes.push(projectInfo.baseUrl[m].rules[n].ruleType)
              }
            }
          }
          rows.push({
            type: 'baseUrl',
            id: projectInfo.baseUrl[m].id,
            baseUrl: projectInfo.baseUrl[m].url,
            discoveredRequest: '',
            requestType: '',
            favIconUrl: projectInfo.baseUrl[m].favIconUrl,
            ruleTypes
          });
        }
      }
    }
    if (
      projectInfo &&
      projectInfo.childUrl &&
      projectInfo.childUrl.length
    ) {
      for (var k in projectInfo.childUrl) {
        if (projectInfo.childUrl.hasOwnProperty(k)) {
          const baseUrlId = projectInfo.childUrl[k].id.split('_')[0];
          for (var l = 0; l < rows.length; l++) {
            if (baseUrlId === rows[l].id) {
              ruleTypes = [];
              if (projectInfo.childUrl[k].rules && projectInfo.childUrl[k].rules.length) {
                for (n = 0; n < projectInfo.childUrl[k].rules.length; n++) {
                  if (!ruleTypes.includes(projectInfo.childUrl[k].rules[n].ruleType)) {
                    ruleTypes.push(projectInfo.childUrl[k].rules[n].ruleType)
                  }
                }
              }
              rows[l].childUrl = rows[l].childUrl || [];
              rows[l].childUrl.push({
                type: 'discoveredRequests',
                id: projectInfo.childUrl[k].id,
                baseUrl: '',
                discoveredRequest: projectInfo.childUrl[k].url,
                requestType: projectInfo.childUrl[k].requestType,
                favIconUrl: '',
                ruleTypes
              });
            }
          }
        }
      }
    }
    let convertedRows = [];
    for (var i = 0; i < rows.length; i++) {
      convertedRows[i] = [];
      const { type, id, baseUrl, discoveredRequest, requestType, favIconUrl, ruleTypes } = rows[i];
      convertedRows[i].push({
        type, id, baseUrl, discoveredRequest, requestType, favIconUrl, ruleTypes
      });
      if (rows[i].childUrl && rows[i].childUrl.length) {
        for (j = 0; j < rows[i].childUrl.length; j++) {
          const { type, id, baseUrl, discoveredRequest, requestType, favIconUrl, ruleTypes } = rows[i].childUrl[j];
          convertedRows[i].push({
            type, id, baseUrl, discoveredRequest, requestType, favIconUrl, ruleTypes
          });
        }
      }
    }
    return (
      <div>
        {convertedRows.map(rows => (
          <TableView history={this.props.history} sendTempRequest={this.sendTempRequest} rows={rows} handleMenuClick={this.handleMenuClick} anchorEl={anchorEl} isDisabled={isDisabled} />
        ))}
        <Menu
          id="anchor-button-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem component={Link} to="/discover/select-rule">Create Rule</MenuItem>
          <MenuItem >Import Rule</MenuItem>
          <MenuItem >Un Assign Rule</MenuItem>
        </Menu>
      </div>
    );
  }
}

RequestTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default RequestTable;
