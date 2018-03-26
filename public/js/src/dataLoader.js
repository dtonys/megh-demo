(function () {
  const BASIC_AUTH_SECRET = 'Basic TWVnaE5ldHdvcmtzOm5qZTk3NnhzdzQ1Mw==';

  function createLatLngId( lat, lng ) {
    return `${lat}_${lng}`;
  }

  function processRegions( regionsToModify ) {
    regionsToModify.forEach(( region ) => {
      // region
      region.lat_lng_id = createLatLngId( region.coords.lat, region.coords.lng );
    });
  }

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
      // Add latlng as string to connect it to region
      node.lat_lng_id = createLatLngId( node.coords.lat, node.coords.lng );
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
    loadRegions: () => {
      return window.unfetch('/megh/api/v1.0/regions', {
        credentials: 'include',
        headers: {
          'Authorization': BASIC_AUTH_SECRET
        }
      })
        .then(( response ) => {
          return response.json();
        })
        .then(( regionData ) => {
          processRegions(regionData.regions);
          return regionData;
        });
    },
  };
})();
