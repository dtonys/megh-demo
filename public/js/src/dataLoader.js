(function () {
  const BASIC_AUTH_SECRET = 'Basic TWVnaE5ldHdvcmtzOm5qZTk3NnhzdzQ1Mw==';

  // Do any client side data processing
  function processNodes( nodesToModify ) {
    nodesToModify.forEach(( node ) => {
      // convert to number
      node.coords.lat = ( typeof node.coords.lat === 'string'
        ? parseFloat(node.coords.lat)
        : node.coords.lat
      );
      node.coords.lng = ( typeof node.coords.lng === 'string'
        ? parseFloat(node.coords.lng)
        : node.coords.lng
      );
    });
  }

  window.DataLoader = {
    loadAlarms: () => {
      return window.unfetch('/megh/api/v1.0/alarms', {
        credentials: 'include',
        headers: {
          'Authorization': BASIC_AUTH_SECRET
        }
      })
        .then(( response ) => {
          return response.json();
        });
    },
    loadNodeList: () => {
      return window.unfetch('/megh/api/v1.0/nodes', {
        credentials: 'include',
        headers: {
          'Authorization': BASIC_AUTH_SECRET
        }
      })
        .then(( response ) => {
          return response.json();
        })
        .then(( nodeData ) => {
          processNodes(nodeData.nodes);
          return nodeData;
        });
    },
    loadNodeDetail: (nodeID) => {
      return window.unfetch(`/megh/api/v1.0/node/${encodeURIComponent(nodeID)}`, {
        credentials: 'include',
        headers: {
          'Authorization': BASIC_AUTH_SECRET
        }
      })
        .then(( response ) => {
          return response.json();
        })
        .then(( data ) => {
          return data;
        });
    },
  };
})();
