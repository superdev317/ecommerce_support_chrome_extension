// Chrome extension backend to handle all http/https requests

(function (window) {
  window.RuleMatcher = {};

  /**
   *
   * @param finalString String having $values e.g. http://www.example.com?q=$1&p=$2
   * @param matches Array of matches in Regex and wildcard matches
   * @returns String after replacing $s with match values
   */
  RuleMatcher.populateMatchesInString = function (finalString, matches) {
    matches.forEach(function (matchValue, index) {
      // First match is the full string in Regex and empty string in wildcard match
      if (index === 0) {
        return;
      }

      // Even if match is not found, just replace that placeholder with empty string
      matchValue = matchValue || '';

      // Replace all $index values in destinationUrl with the matched groups
      finalString = finalString.replace(new RegExp('[\$]' + index, 'g'), matchValue);
    });

    return finalString;
  };

  /**
   *
   * @param regexString Value Field in source object
   * @param inputString UrlComponent of Source - host/url/path
   * @param finalString destinationurl - We need to place the values of groups in this string e.g. http://yahoo.com?q=$1
   * @returns {*}
   */
  RuleMatcher.checkRegexMatch = function (regexString, inputString, finalString) {
    var regex = RQ.Utils.toRegex(regexString),
      matches;

    // Do not match when regex is invalid or regex does not match with Url
    if (!regex || inputString.search(regex) === -1) {
      return null;
    }

    matches = regex.exec(inputString) || [];
    return RuleMatcher.populateMatchesInString(finalString, matches);
  };

  /**
   * Checks if intercepted HTTP Request Url matches with any Rule
   *
   * @param sourceObject Object e.g. { key: 'Url/host/path', operator: 'Contains/Matches/Equals', value: 'google' }
   * @param url Url for which HTTP Request is intercepted.
   * @param destination String e.g. 'http://www.example.com?a=$1'
   *
   * @returns Empty string ('') If rule should be applied and source object does not affect resulting url.
   * In some cases like wildcard match or regex match, resultingUrl will be destination+replaced group variables.
   */
  RuleMatcher.matchUrlWithRuleSource = function (sourceObject, url, destination) {
    var operator = sourceObject.operator,
      urlComponent = RuleMatcher.extractUrlComponent(url, sourceObject.key),
      resultingUrl = destination || '', // Destination Url is not present in all rule types (e.g. Cancel, QueryParam)
      value = sourceObject.value,
      blackListedDomains = [];

    for (var index = 0; index < blackListedDomains.length; index++) {
      if (url.indexOf(blackListedDomains[index]) !== -1) {
        return null;
      }
    }

    switch (operator) {
      case 0:
        if (value === urlComponent) { return resultingUrl; }
        break;

      case 1: if (urlComponent.indexOf(value) !== -1) { return resultingUrl; }
        break;

      case 2: {
        return RuleMatcher.checkRegexMatch(value, urlComponent, resultingUrl);
      }
    }

    return null;
  };

  /**
   *
   * @param pairs RulePairs used in Redirect and Cancel Rules
   * @param url Url which is matched with RulePairs
   * @returns ResultingUrl which is obtained after applying rulePairs to input Url
   */
  RuleMatcher.matchUrlWithRulePairs = function (pairs, url) {
    var pairIndex,
      resultingUrl = url,
      newResultingUrl,
      destination,
      pair;

    for (pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
      pair = pairs[pairIndex];
      destination = typeof pair.destination !== 'undefined' ? pair.destination : null; // We pass destination as null in Cancel ruleType

      newResultingUrl = RuleMatcher.matchUrlWithRuleSource(pair.source, resultingUrl, pair.destination);
      if (newResultingUrl !== null) {
        resultingUrl = newResultingUrl;
      }
    }

    return resultingUrl !== url ? resultingUrl : null;
  };

  RuleMatcher.extractUrlComponent = function (url, key) {
    BG.dummyAnchor.href = url;
    switch (key) {
      case 0: return url;
      // case RQ.URL_COMPONENTS.PROTOCOL: return BG.dummyAnchor.protocol;
      case 1: return BG.dummyAnchor.host;
      case 2: return BG.dummyAnchor.pathname;
      // case RQ.URL_COMPONENTS.QUERY: return BG.dummyAnchor.search;
      // case RQ.URL_COMPONENTS.HASH: return BG.dummyAnchor.hash;
    }
    console.error('Invalid source key', url, key);
  }
})(window);

var Queue = function (maxSize) {
  this.reset = function () {
    this.head = -1;
    this.queue = [];
  };

  this.reset();
  this.maxSize = maxSize || Queue.MAX_SIZE;

  this.increment = function (number) {
    return (number + 1) % this.maxSize;
  };
};

Queue.MAX_SIZE = Math.pow(2, 53) - 1;

Queue.prototype.enQueue = function (record) {
  this.head = this.increment(this.head);
  this.queue[this.head] = record;
};

/**
 * @param record Record to look for
 * @returns Number Position of record in the queue otherwise -1
 */
Queue.prototype.getElementIndex = function (record) {
  return this.queue.indexOf(record);
};

Queue.prototype.print = function () {
  for (var i = 0; i <= this.head; i++) {
    console.log(this.queue[i]);
  }
};

var BG = {
  Methods: {},
  discoverRequests: {},
  projects: [],
  tempRequest: {},
  discoverTabIds: [],
  requestType: [
    { value: 'url', label: 'Url' },
    { value: 'host', label: 'Host' },
    { value: 'path', label: 'Path' },
  ],
  type: {
    REDIRECT: 'Redirect'
  },
  dummyAnchor: document.createElement('a'),
  modifiedRequestsPool: new Queue(1000),
  matchType: [
    { value: 'equal', label: 'Equals', src: 'e.g. http://www.example.com', target: 'e.g. http://www.new-example.com' },
    { value: 'contains', label: 'Contains', src: 'e.g. google', target: 'e.g. http://www.new-example.com' },
    { value: 'regex', label: 'Matches (regex)', src: 'e.g. /example-([0-9]+)/ig', target: 'e.g. http://www.new-example.com?queryParam=$1&searchParam=$2' },
    // { value: 'equal', label: 'Matches (wildcard)', src: 'e.g. *://*.mydomain.com/* (Each * can be replaced with respective $ in destination)', target: 'e.g. $1://$2.newdomain.com/$3' },
  ]
};

BG.Methods.init = () => {
  BG.Methods.addListenerForIconClicked();
  BG.Methods.fetchProjects();
  BG.Methods.initMessaging();
  BG.Methods.initTabEvent();
  BG.Methods.initWebRequest();
}

BG.Methods.fetchProjects = () => {
  chrome.storage.local.get(['projects'], (result) => {
    let projects = result.projects || BG.projects;
    BG.projects = projects;
  })
}

BG.Methods.addListenerForIconClicked = () => {
  chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ 'url': chrome.extension.getURL('/index.html') }, function (tab) { });
  });
};

BG.Methods.initMessaging = () => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.getDiscoverRequests) {
      chrome.runtime.sendMessage({ msg: 'discoverRequests', discoverRequests: BG.discoverRequests });
    } else if (request.discoverUrl) {
      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        if (tabs.length) {
          for (var i = 0; i < tabs.length; i++) {
            if (BG.Methods.isValidUrl(tabs[i].url)) {
              BG.discoverTabIds = [];
              BG.discoverTabIds.push(tabs[i].id);
              BG.discoverRequests[tabs[i].id] = { baseUrl: tabs[i].url, favIconUrl: tabs[i].favIconUrl, discoveredRequests: [] };
              chrome.tabs.reload(tabs[i].id);
              const domain = BG.Methods.getDomainName(tabs[i].url);
              for (var j = i + 1; j < tabs.length; j++) {
                if (domain === BG.Methods.getDomainName(tabs[j].url)) {
                  BG.discoverTabIds.push(tabs[j].id);
                  BG.discoverRequests[tabs[j].id] = { baseUrl: tabs[j].url, favIconUrl: tabs[j].favIconUrl, discoveredRequests: [] };
                  chrome.tabs.reload(tabs[j].id);
                }
              }
              break;
            }
          }
        }
      })
    } else if (request.addProject) {
      const { name, desc } = request.data;
      chrome.storage.local.get(['projects'], (result) => {
        let projects = result.projects || BG.projects;
        let maxId = 0;
        if (typeof projects === 'object' && projects.length) {
          maxId = Math.max.apply(Math, projects.map((project) => project.id));
        }
        const newProject = { name, desc, id: maxId + 1, baseUrl: [], childUrl: [] };
        projects.push(newProject);
        BG.projects = projects;
        chrome.storage.local.set({ projects }, (response) => {
          chrome.runtime.sendMessage({ msg: 'projectAdded', newProject });
          BG.Methods.sendNotification('Project added successfully');
        });
      });
    } else if (request.updateProject) {
      const { data } = request;
      chrome.storage.local.get(['projects'], (result) => {
        let projects = result.projects || BG.projects;
        for (var i = 0; i < projects.length; i++) {
          if (projects[i].id == data.id) {
            projects[i] = data;
            break;
          }
        }
        BG.projects = projects;
        chrome.storage.local.set({ projects }, (response) => { });
        BG.Methods.sendNotification('Project updated successfully');
      });
    } else if (request.deleteProject) {
      const { projectId } = request;
      chrome.storage.local.get(['projects'], (result) => {
        let projects = result.projects || BG.projects;
        for (var i = 0; i < projects.length; i++) {
          if (projects[i].id == projectId) {
            projects.splice(i, 1);
            break;
          }
        }
        chrome.storage.local.set({ projects }, () => {
          BG.Methods.sendProjects();
          BG.Methods.sendNotification('Project deleted successfully');
        });
      });
    } else if (request.getProjects) {
      BG.Methods.sendProjects();
    } else if (request.downloadProject) {
      const { projectId } = request;
      BG.Methods.downloadProject(projectId);
    } else if (request.sendTempRequest) {
      BG.tempRequest = request.data;
    } else if (request.getTempRequest) {
      chrome.runtime.sendMessage({ msg: 'tempRequest', tempRequest: BG.tempRequest });
    } else if (request.getTypes) {
      const { requestType, matchType } = BG;
      chrome.runtime.sendMessage({ msg: 'sendTypes', data: { requestType, matchType } })
    }
  });
};

BG.Methods.initTabEvent = () => {
  chrome.tabs.onRemoved.addListener((tab) => {
    BG.Methods.cleanTabRequests(tab);
  });
};

BG.Methods.sendNotification = (notification) => {
  chrome.runtime.sendMessage({ msg: 'showNotification', notification })
}

BG.Methods.initWebRequest = () => {
  if (!chrome.webRequest.onBeforeRequest.hasListener(BG.Methods.modifyUrl)) {
    chrome.webRequest.onBeforeRequest.addListener(
      BG.Methods.modifyUrl,
      {
        urls: ["http://*/*", "https://*/*"],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
      },
      ["blocking"]
    )
  }
  chrome.webRequest.onCompleted.addListener((details) => {
    const { tabId, url, type, initiator } = details;
    if (BG.discoverTabIds.includes(tabId) && initiator && BG.Methods.isValidUrl(initiator)) {
      if (BG.discoverRequests[tabId] &&
        !BG.discoverRequests[tabId].discoveredRequests.some(e => e.url === url && e.type === type)
      ) { // make sure same elements is not included
        BG.discoverRequests[tabId].discoveredRequests.push({ url, type });
        chrome.runtime.sendMessage({ msg: 'discoverRequests', discoverRequests: BG.discoverRequests });
      }
    }
  }, { urls: ["http://*/*", "https://*/*"] });
};

BG.Methods.getDomainName = (url) => {
  const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  const domain = matches && matches[1];  // domain will be null if no match is found
  return domain;
}

BG.Methods.isValidUrl = (url) => {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(url);
}

BG.Methods.sendProjects = () => {
  chrome.storage.local.get(['projects'], (result) => {
    let projects = result.projects || BG.projects;
    BG.projects = projects;
    chrome.runtime.sendMessage({ msg: 'sendProjects', projects });
  });
}

BG.Methods.downloadProject = (projectId) => {
  const project = BG.projects.filter(project => project.id == projectId) || [],
    _project = JSON.stringify(project, null, 4),
    vLink = document.createElement('a'),
    vBlob = new Blob([_project], { type: 'octet/stream' }),
    fileName = `${project[0].name}.json`,
    vUrl = window.URL.createObjectURL(vBlob);
  vLink.setAttribute('href', vUrl);
  vLink.setAttribute('download', fileName);
  vLink.click();
  vLink.remove();
}

BG.Methods.isSameBaseUrlExist = (baseUrl) => {
  for (var i in BG.discoverRequests) {
    if (BG.discoverRequests.hasOwnProperty(i) && BG.discoverRequests[i].baseUrl === baseUrl) {
      return true;
    }
  }
  return false;
};

BG.Methods.cleanTabRequests = (tab) => {
  if (BG.discoverRequests[tab]) {
    BG.discoverRequests[tab] = null;
    delete BG.discoverRequests[tab];
  }
};

BG.Methods.modifyUrl = function (details) {
  var requestUrl = details.url,
    resultingUrl = null,
    enabledRules;

  // Do not modify OPTIONS request since preflight requests cannot be redirected
  if (details.method.toLowerCase() === 'options') {
    return;
  }

  // Do not modify URL again if it has been already processed earlier
  if (details.requestId && BG.modifiedRequestsPool.getElementIndex(details.requestId) > -1) {
    return;
  }

  enabledRules = BG.Methods.getEnabledRules(details);

  for (var i = 0; i < enabledRules.length; i++) {
    var rule = enabledRules[i],
      processedUrl = null;

    switch (rule.ruleType) {
      case BG.type.REDIRECT:
        // Introduce Pairs: Transform the Redirect Rule Model to new Model to support multiple entries (pairs)
        // if (typeof rule.source !== 'undefined' && typeof rule.destination !== 'undefined') {
        //   rule.pairs = [{
        //     source: { key: RQ.RULE_KEYS.URL, operator: rule.source.operator, value: rule.source.values[0] },
        //     destination: rule.destination
        //   }];

        //   delete rule.source;
        //   delete rule.destination;
        // }
        processedUrl = RuleMatcher.matchUrlWithRulePairs(rule.pairs, requestUrl);
        break;
    }

    if (processedUrl) {
      // allow other rules to apply on resultingUrl
      requestUrl = resultingUrl = processedUrl;
    }
  }

  if (resultingUrl) {
    BG.modifiedRequestsPool.enQueue(details.requestId);
    return { redirectUrl: resultingUrl };
  }
};

BG.Methods.getEnabledRules = (details) => {
  var enabledRules = [];
  const project = BG.projects.filter((project) => {
    if (project && project.baseUrl && project.baseUrl.url) {
      if (details.initiator) {
        return project.baseUrl.url.includes(details.initiator);
      } else {
        return project.baseUrl.url === details.url;
      }
    }
  }) || [];

  if (project && project.length) {
    if (details.type === 'main_frame') {
      const baseUrlRules = project[0].baseUrl.rules;
      for (var i = 0; i < baseUrlRules.length; i++) {
        if (baseUrlRules[i].status) {
          enabledRules.push(baseUrlRules[i]);
        }
      }
    } else {
      const childUrl = project[0].childUrl.filter((childUrl) => {
        return childUrl.url === details.url
      })[0];
      if (childUrl) {
        const childUrlRules = childUrl.rules;
        for (var j = 0; j < childUrlRules.length; j++) {
          if (childUrlRules[j].status) {
            enabledRules.push(childUrlRules[j]);
          }
        }
      }
    }
  }
  return enabledRules;
};

BG.Methods.init();
