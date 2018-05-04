(function () {
  const BASIC_AUTH_SECRET = 'Basic TWVnaE5ldHdvcmtzOm5qZTk3NnhzdzQ1Mw==';

  function createLatLngId( lat, lng ) {
    return `${lat}_${lng}`;
  }

  function processRegions( regionsToModify ) {
    regionsToModify.forEach(( region ) => {
      // region
      region.lat_lng_id = createLatLngId( region.coords.lat, region.coords.lng );
      // Hardcode hack this node's provider type for demo.
      if ( window.DEMO_MODE && region.name === 'Mumbai' ) {
        region.type = 'Azure';
      }
    });
  }

  // Do any client side data processing
  function processNodes( nodesToModify ) {
    nodesToModify.forEach(( node ) => {
      // Hardcode hack this node's position for demo.
      if ( window.DEMO_MODE ) {
        if ( node.name === 'Mumbai Node' ) {
          node.coords.lat = '12.576009912063801';
          node.coords.lng = '75.322265625';
        }
      }

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

  // const mockAlarmPayload = JSON.parse('{"alarms":[{"alarm_history":[{"alarm_id":5,"description":"BR#101 Link#enp0s20f1 down","instance":"enp0s20f1","node_id":"BR#1","occurrence_date":"03/13/18 22:29:17","severity":"Major","type":"Link down"},{"alarm_id":11,"description":"BR#101 Link#enp0s20f3 down","instance":"enp0s20f3","node_id":"BR#2","occurrence_date":"03/13/18 22:36:02","severity":"Major","type":"Link down"}],"highest_severity":"Major","node_alarms":[{"node_id":"BR#101","severity":"Major"}],"num_alarms":2}]}');

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
        })
        .catch(() => {
          // handle failure for regions API
          return null;
        });
    },
  };
})();
