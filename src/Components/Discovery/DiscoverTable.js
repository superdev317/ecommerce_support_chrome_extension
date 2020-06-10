import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TableView from './TableView';

const chrome = window.chrome || {};

class DiscoverTable extends React.Component {
  state = {
    anchorEl: null,
    selectedRow: {},
  };

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.onMessage);
    chrome.runtime.sendMessage({ discoverUrl: true });
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.onMessage);
  }

  onMessage = (request, sender, sendResponse) => {
    const { msg } = request;
    if (msg === 'discoverRequests') {
      const { discoverRequests } = request;
      this.setState({ discoverRequests });
    }
  }

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
    const { anchorEl, discoverRequests } = this.state;
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
    for (var i in discoverRequests) {
      if (discoverRequests.hasOwnProperty(i)) {
        let baseUrlExist = false;
        var existingBaseUrlIndex = 0;
        for (j = 0; j < rows.length; j++) {
          if (discoverRequests[i].baseUrl === rows[j].baseUrl) {
            baseUrlExist = true;
            existingBaseUrlIndex = j;
            break;
          }
        }
        if (!baseUrlExist) {
          var newRow = {
            type: 'baseUrl',
            id: i,
            baseUrl: discoverRequests[i].baseUrl,
            discoveredRequest: '',
            requestType: '',
            favIconUrl: discoverRequests[i].favIconUrl,
            childUrl: []
          };
          // eslint-disable-next-line no-loop-func
          discoverRequests[i].discoveredRequests.forEach((discoveredRequest, index) => {
            newRow.childUrl.push({
              type: 'discoveredRequests',
              id: i + '_' + index,
              baseUrl: discoverRequests[i].baseUrl,
              discoveredRequest: discoveredRequest.url,
              requestType: discoveredRequest.type,
              favIconUrl: discoverRequests[i].favIconUrl
            });
          });
          rows.push(newRow);
        } else {
          rows[existingBaseUrlIndex].childUrl = rows[existingBaseUrlIndex].childUrl || [];
          // eslint-disable-next-line no-loop-func
          discoverRequests[i].discoveredRequests.forEach((discoveredRequest, index) => {
            var childUrlExist = false;
            for (var n = 0; n < rows[existingBaseUrlIndex].childUrl.length; n++) {
              if (discoveredRequest.url === rows[existingBaseUrlIndex].childUrl[n].discoveredRequest) {
                childUrlExist = true;
              }
            }
            if (!childUrlExist) {
              rows[existingBaseUrlIndex].childUrl.push({
                type: 'discoveredRequests',
                id: i + '_' + index,
                baseUrl: discoverRequests[i].baseUrl,
                discoveredRequest: discoveredRequest.url,
                requestType: discoveredRequest.type,
                favIconUrl: discoverRequests[i].favIconUrl
              });
            }
          });
        }
      }
    }
    let convertedRows = [];
    for (i = 0; i < rows.length; i++) {
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

DiscoverTable.propTypes = {
  classes: PropTypes.object.isRequired,
  discoverRequests: PropTypes.object.isRequired,
};

export default DiscoverTable;
