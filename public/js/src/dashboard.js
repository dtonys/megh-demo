(function () {
  /**
   * config, constants
   */
  const differ = window.jsondiffpatch.create();

  const mapOptions = {
    // mapTypeControl: Map / Satellite toggle
    mapTypeControl: false,
    mapTypeControlOptions: {
      style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: window.google.maps.ControlPosition.TOP_CENTER,
    },
    // zoomControl: + / - toggle
    zoomControl: true,
    zoomControlOptions: {
      position: window.google.maps.ControlPosition.LEFT_BOTTOM,
    },
    // scaleControl: 2KM distance in legend
    scaleControl: false,
    // streetViewControl: enables pegman
    streetViewControl: false,
    streetViewControlOptions: {
      position: window.google.maps.ControlPosition.LEFT_TOP,
    },
    // fullscreenControl: allow full screen
    fullscreenControl: false,
    // Show point of interest tooltips
    clickableIcons: false,
  };

  /**
   * global variables
   */
  window.googleMap = null;
  const mapRegionDOM = document.querySelector('#mapRegion');

  function NodeDataManager() {
    this.nodeList = [];
    this.nodeMap = {};
    this.regionList = [];
    this.regionMap = {};

    this.updateNodeData = function ( apiNodeData ) {
      this.nodeList = apiNodeData.nodes;
      apiNodeData.nodes.forEach((node) => {
        this.nodeMap[node.node_id] = node;
      });
    };
    this.addNode = function ( node ) {
      this.nodeList.push(node);
      this.nodeMap[node.node_id] = node;
    };
    this.removeNode = function ( node ) {
      const index = _.findIndex(this.nodeList, { node_id: node.node_id });
      if ( index !== -1 ) {
        this.nodeList.splice(index, 1);
        delete this.nodeMap[node.node_id];
      }
    };
    this.updateRegionData = function ( apiRegionData ) {
      this.regionList = apiRegionData.regions;
      apiRegionData.regions.forEach((region) => {
        this.regionMap[region.lat_lng_id] = region;
      });
    };

  }

  function mapArrayToIdObject( array ) {
    const obj = {};
    if ( !array ) return obj;
    array.forEach(( item ) => {
      obj[item.node_id] = item;
    });
    return obj;
  }

  function diffNodeArrays( nodeList, newNodeList ) {
    // convert
    const currNodesMap = mapArrayToIdObject(nodeList);
    const nextNodesMap = mapArrayToIdObject(newNodeList);

    const diffResult = differ.diff(currNodesMap, nextNodesMap);
    if ( !diffResult ) return [];
    const nodesAdded = [];
    const nodesRemoved = [];
    Object.keys(diffResult).forEach(( nodeId ) => {
      const diffItem = diffResult[nodeId];
      if ( Array.isArray(diffItem) ) {
        // remove
        if ( diffItem[1] === 0 && diffItem[2] === 0 ) {
          nodesRemoved.push(diffItem[0]);
          return;
        }
        // add
        nodesAdded.push(diffItem[0]);
      }
    });
    return [ nodesAdded, nodesRemoved ];
  }

  /**
   * map rendering functions
   */
  const mouseConfig = {
    MOUSEOUT_TIMER_DELAY_MS: 50,
  };
  const mouseState = {
    mouseWithinTooltip: false,
    mouseWithinMarker: false,
    mouseWithinCluster: false,
  };
  function createGoogleMap() {
    // const CNGCenter = {
    //   lat: 45.8696,
    //   lng: -119.688,
    // };
    const defaultCenter = {
      lat: 37.417827,
      lng: -122.107340,
    };
    const defaultZoom = 10;
    let zoom = defaultZoom;
    let center = defaultCenter;
    // get saved lat / lng from localStorage
    const savedCenterLat = window.localStorage.getItem('map_center_lat');
    const savedCenterLng = window.localStorage.getItem('map_center_lng');
    const savedZoom = window.localStorage.getItem('map_zoom');
    if ( savedCenterLat && savedCenterLng ) {
      center = {
        lat: parseFloat(savedCenterLat),
        lng: parseFloat(savedCenterLng),
      };
    }
    if ( savedZoom ) {
      zoom = parseInt(savedZoom, 10);
    }

    const options = Object.assign(
      {},
      mapOptions,
      {
        center: center,
        zoom: zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      }
    );
    window.googleMap = new window.google.maps.Map(mapRegionDOM, options);

    // setup map events
    window.googleMap.addListener('center_changed', () => {
      const currentCenter = window.googleMap.getCenter();
      window.localStorage.setItem('map_center_lat', currentCenter.lat().toString());
      window.localStorage.setItem('map_center_lng', currentCenter.lng().toString());
    });

    window.sameLatLngMarkers = [];
    let currZoom = window.googleMap.getZoom();
    let nextZoom = null;
    window.googleMap.addListener('zoom_changed', () => {
      nextZoom = window.googleMap.getZoom();
      window.localStorage.setItem('map_zoom', nextZoom.toString());

      // when zooming IN past threshold, remove nodes from cluster
      if ( currZoom < 10 && nextZoom >= 10 ) {
        window._markerClusterer.removeMarkers(window.sameLatLngMarkers);
        // The markers need to be re-drawn after they are removed from cluster, otherwise they don't appear.
        window.sameLatLngMarkers.forEach((marker) => {
          marker.setMap(window.googleMap);
        });
      }
      // when zooming OUT past threshold, add nodes to cluster
      if ( currZoom >= 10 && nextZoom < 10 ) {
        window._markerClusterer.addMarkers(window.sameLatLngMarkers);
      }

      currZoom = nextZoom;
    });
  }

  // "type": "AWS"
  // "type": "Azure"
  function addRegionMarker( region ) {
    let iconUrl = window.ICON_AWS_REGION;
    if ( region.type === 'Azure' ) {
      iconUrl = window.ICON_AZURE_REGION;
    }

    const marker = new window.google.maps.Marker({
      position: {
        lat: region.coords.lat,
        lng: region.coords.lng,
      },
      map: window.googleMap,
      icon: {
        url: iconUrl,
        // ( width, height )
        scaledSize: new window.google.maps.Size(40, 40),
        // ( originX, originY )
        origin: new window.google.maps.Point(0, 0),
        // Image anchor
        anchor: new window.google.maps.Point(20, 20)
      },
      zIndex: 10,
    });
    region.marker = marker;
    return marker;
  }

  function addNodeMarker( node, mapToolTip, index ) {
    const coords = node.coords;
    // create marker
    const marker = new window.google.maps.Marker({
      position: {
        lat: coords.lat,
        lng: coords.lng,
      },
      map: window.googleMap,
      icon: {
        url: window.mapNodeToIcon( node.type, node.alarm_status ),
        // ( width, height )
        scaledSize: new window.google.maps.Size(40, 40),
        // ( originX, originY )
        origin: new window.google.maps.Point(0, 0),
        // Image anchor
        anchor: node.type === 'CNG'
          ? new window.google.maps.Point(40, 0)
          : new window.google.maps.Point(20, 20),
      },
      zIndex: 11,
      // label: node.node_id.toString(),
    });
    node.marker = marker;
    marker.node = node;
    // don't show tooltip for HQ
    if ( node.type === window.nodeTypes.DATACENTER ) return marker;

    // if ( node.node_id === 'BR#3' ) {
    //   setTimeout(() => {
    //     mapToolTip.openOnMarker( node );
    //   }, 1000);
    // }

    // if ( node.node_id === 'CNG1' ) {
    //   setTimeout(() => {
    //     mapToolTip.openOnMarker( node );
    //   }, 1000);
    // }

    // Setup events, for tooltip
    marker.addListener('click', () => {
      // if ( mouseState.mouseWithinMarker ) {
      //   window.location.href = `node-detail?id=${encodeURIComponent(node.node_id)}&type=${node.type}`;
      //   return;
      // }
      mapToolTip.toggleMarker( node );
    });
    marker.addListener('mouseover', () => {
      mouseState.mouseWithinMarker = node;
      if ( mouseState.mouseWithinCluster ) { // mouse in while inside cluster, ignore event
        return;
      }
      mapToolTip.openOnMarker( node );
    });
    marker.addListener('mouseout', () => {
      mouseState.mouseWithinMarker = false;
      setTimeout(() => {
        if (
          mouseState.mouseWithinTooltip || // mouse out from marker to tooltip
          mouseState.mouseWithinMarker || // mouse out from marker to marker
          mouseState.mouseWithinCluster // mouse out while inside cluster
        ) {
          mouseState.mouseWithinTooltip = false;
          return;
        }
        mapToolTip.close();
      }, mouseConfig.MOUSEOUT_TIMER_DELAY_MS);
    });
    return marker;
  }

  function addClusterer( markers, mapToolTip ) {
    // Only cluster CCW nodes
    let CCWMarkers = markers.filter(( marker ) => {
      return ( marker.node.type === window.nodeTypes.CCW );
    });
    window._CCWMarkers = CCWMarkers;

    /** Identify all nodes with same lat_lng **/
    // map { [lat_lng]: nodeIndex }
    const lat_lng_map = {};
    const markerIndexesToRemoveFromCluster = [];
    CCWMarkers.forEach((marker, index) => {
      // If node @ lat_lng has not been visited, create value in map
      if ( !lat_lng_map[marker.node.lat_lng_id] ) {
        lat_lng_map[marker.node.lat_lng_id] = {
          index,
          flaggedForRemove: false,
          sameNodeNum: 0,
        };
        return;
      }
      // If node @ lat_lng has been visited...
      // if not already flagged for removal, flag original marker for removal from cluster
      if ( lat_lng_map[marker.node.lat_lng_id].flaggedForRemove === false ) {
        lat_lng_map[marker.node.lat_lng_id].flaggedForRemove = true;
        markerIndexesToRemoveFromCluster.push( lat_lng_map[marker.node.lat_lng_id].index );
        window.sameLatLngMarkers.push( CCWMarkers[lat_lng_map[marker.node.lat_lng_id].index] );
      }
      // add this current marker for removal
      markerIndexesToRemoveFromCluster.push( index );
      window.sameLatLngMarkers.push( marker );
      // window.removedMarkers
      // keep track of how many nodes in the same lat_lng
      lat_lng_map[marker.node.lat_lng_id].sameNodeNum++;
      // Offset the node, to the right
      const anchorOffsetX = -20 * lat_lng_map[marker.node.lat_lng_id].sameNodeNum;
      const anchorOffsetY = 0 * lat_lng_map[marker.node.lat_lng_id].sameNodeNum;

      const markerIcon = CCWMarkers[index].getIcon();
      CCWMarkers[index].setIcon({
        url: markerIcon.url,
        scaledSize: markerIcon.scaledSize,
        origin: markerIcon.origin,
        anchor: new window.google.maps.Point(
          markerIcon.anchor.x + anchorOffsetX,
          markerIcon.anchor.y + anchorOffsetY,
        ),
      });
    });

    // If past zoomed in threshhold, exclude CCW marker nodes at same lat lang from cluster.
    const expandNodesAtSameLatLng = ( window.googleMap.getZoom() >= 10 );
    if ( expandNodesAtSameLatLng ) {
      // remove all markers with same lat_lng, from inclusion to cluster
      CCWMarkers = CCWMarkers.filter(( marker, index ) => {
        return ( markerIndexesToRemoveFromCluster.indexOf(index) === -1 );
      });
    }

    // setup cluster
    const markerClusterer = new window.MarkerClusterer(window.googleMap, CCWMarkers, {
      clusterClass: 'markerCluster',
      styles: [
        {
          url: window.ICON_CWC_GROUP_GREEN,
          width: 45,
          height: 45,
          textColor: '#515151',
          textSize: 10
        },
        {
          url: window.ICON_CWC_GROUP_YELLOW,
          width: 45,
          height: 45,
          textColor: '#515151',
          textSize: 10
        },
        {
          url: window.ICON_CWC_GROUP_RED,
          width: 45,
          height: 45,
          textColor: '#515151',
          textSize: 10
        },
      ],
      // `calculator` function controls the style and text to appear on each cluster
      calculator: ( markersArray /* , numStyles */ ) => {
        const maxStatus = Math.max.apply(null, markersArray.map((marker) => (marker.node.alarm_status) ) );
        return {
          index: maxStatus + 1, // index + 1 of the styles array to be used
          text: markersArray.length, // text to show on the marker
        };
      }
    });

    // Setup events, for tooltip
    window.google.maps.event.addListener(markerClusterer, 'click', () => {
      mouseState.mouseWithinCluster = false;
      mapToolTip.close();
    });
    window.google.maps.event.addListener(markerClusterer, 'mouseover', (cluster) => {
      mouseState.mouseWithinCluster = cluster;
      if ( !mapToolTip.toolTip ) {
        mapToolTip.openOnCluster(cluster);
      }
    });
    window.google.maps.event.addListener(markerClusterer, 'mouseout', () => {
      mouseState.mouseWithinCluster = false;
      setTimeout(() => {
        if ( mouseState.mouseWithinTooltip ) {
          mouseState.mouseWithinTooltip = false;
          return;
        }
        mapToolTip.close();
        if ( mouseState.mouseWithinMarker ) {
          mapToolTip.openOnMarker( mouseState.mouseWithinMarker );
        }
      }, mouseConfig.MOUSEOUT_TIMER_DELAY_MS);
    });
    return markerClusterer;
  }

  function updateNodeAlarmStatus( node, alarmStatusNumber ) {
    if ( node && node.marker ) {
      const markerIcon = node.marker.getIcon();
      node.marker.setIcon({
        url: window.mapNodeToIcon( node.type, alarmStatusNumber ),
        scaledSize: new window.google.maps.Size(40, 40),
        origin: new window.google.maps.Point(0, 0),
        anchor: markerIcon.anchor,
      });
      node.alarm_status = alarmStatusNumber;
    }
  }

  // Updates all node colors to match state in the alarmHistory
  function syncNodesWithAlarmHistory(nodeDataManager, alarmData) {
    const alarmHistory = _.get(alarmData, 'alarms[0].alarm_history', []);
    // get all nodes in alarm state
    const alarmNodesMap = {};
    nodeDataManager.nodeList
      .filter(( node ) => (
        node.alarm_status === window.ALARM_STATUS_MINOR || node.alarm_status === window.ALARM_STATUS_MAJOR
      ))
      .forEach(( node ) => {
        alarmNodesMap[node.node_id] = node;
      });

    // update all alarm history nodes
    alarmHistory.forEach(( alarm ) => {
      updateNodeAlarmStatus(alarmNodesMap[alarm.node_id], window.mapNodeStatusToCode[alarm.severity] );
      // remove node from map once it's updated
      delete alarmNodesMap[alarm.node_id];
    });
    // any remaining nodes in alarmNodesMap are no longer in alarm state, set them to clear
    Object.keys(alarmNodesMap).forEach(( nodeId ) => {
      updateNodeAlarmStatus(alarmNodesMap[nodeId], window.ALARM_STATUS_CLEAR );
    });
  }

  function diffAlarmHistoryAndUpdateNodes(alarmHistoryArray, nextAlarmHistoryArray, nodeDataManager) {
    const currObj = mapArrayToIdObject(alarmHistoryArray);
    const nextObj = mapArrayToIdObject(nextAlarmHistoryArray);
    const diffResult = differ.diff(currObj, nextObj);

    if ( !diffResult ) return false;
    Object.keys(diffResult).forEach(( nodeId ) => {
      const diffItem = diffResult[nodeId];

      // alarm is added or removed
      if ( Array.isArray(diffItem) ) {
        if ( diffItem[1] === 0 && diffItem[2] === 0 ) {
          // alarm removed, set alarm_status to Clear
          updateNodeAlarmStatus( nodeDataManager.nodeMap[nodeId], window.mapNodeStatusToCode['Clear'] );
          return;
        }
        // alarm added, update alarm_status
        updateNodeAlarmStatus( nodeDataManager.nodeMap[nodeId], window.mapNodeStatusToCode[diffItem[0].severity] );
        return;
      }
      // alarm value changed, update alarm_status
      if ( diffItem.severity ) {
        updateNodeAlarmStatus( nodeDataManager.nodeMap[nodeId], window.mapNodeStatusToCode[diffItem.severity[1]] );
        return;
      }
    });
    return diffResult;
  }

  // Load alarms once per second, waiting for the prev request to finish
  function pollAlarmHistoryAndUpdateNodeStatus(
    alarmData, alarmDropDown, nodeDataManager, markerClusterer,
  ) {
    let currentAlarmData = alarmData;
    syncNodesWithAlarmHistory(nodeDataManager, alarmData);

    function pollData() {
      window.setTimeout(() => {
        window.DataLoader.loadAlarms().then(( newAlarmData ) => {

          // Render alarms in the alarm dropdown, as a list
          alarmDropDown.updateAlarmData(newAlarmData);

          // Update any changes in the alarm list -> Propagate to node list
          const diffResult = diffAlarmHistoryAndUpdateNodes(
            _.get(currentAlarmData, 'alarms[0].alarm_history', []),
            _.get(newAlarmData, 'alarms[0].alarm_history', []),
            nodeDataManager,
          );
          if ( diffResult ) {
            // Update current alarm data, if there were any updates
            currentAlarmData = newAlarmData;
            // Redraw marker clusters, the icon may have changed
            markerClusterer.repaint();
          }
          pollData();
        });
      }, 1000);
    }
    pollData();
  }

  // check for new nodes, append them
  function pollNodesAndAddOrRemove( nodeDataManager, mapToolTip, markerClusterer ) {
    setTimeout(() => {
      window.DataLoader.loadNodeList()
        .then(( newNodeData ) => {
          let [ nodesAdded, nodesRemoved ] = diffNodeArrays(nodeDataManager.nodeList, newNodeData.nodes);
          return [ nodesAdded, nodesRemoved ];
        })
        .then(( [ nodesAdded, nodesRemoved ] ) => {
          // ADD markers to the map
          if ( nodesAdded && nodesAdded.length ) {
            const addedMarkers = nodesAdded
              .map((node) => {
                const marker = addNodeMarker(node, mapToolTip, 1000);
                nodeDataManager.addNode(node);
                return marker;
              });
            markerClusterer.addMarkers(addedMarkers);
          }

          // REMOVE markers from the map
          if ( nodesRemoved && nodesRemoved.length ) {
            nodesRemoved.forEach(( node ) => {
              node.marker.setMap(null);
              markerClusterer.removeMarker( node.marker );
              nodeDataManager.removeNode( node );
            });
          }
          pollNodesAndAddOrRemove(nodeDataManager, mapToolTip, markerClusterer);
        });
    }, 3000);
  }

  function initialize([ nodeData, alarmData, regionData ]) {
    const nodeDataManager = new NodeDataManager();
    // window._nodeDataManager = nodeDataManager;
    nodeDataManager.updateNodeData(nodeData);
    if ( regionData ) {
      nodeDataManager.updateRegionData(regionData);
    }

    const alarmDropDown = new window.AlarmDropDown({
      $trigger: document.querySelector('.navbar__alarmsTrigger'),
      $container: document.querySelector('.navbar__alarms .alarmDropdown'),
      template: window.templates.tableList,
      mouseConfig: mouseConfig,
    });
    alarmDropDown.updateAlarmData( alarmData );

    // Setup the popup, shows up on hover over marker or cluster
    const mapToolTip = new window.MapToolTip({
      nodeTypes: window.nodeTypes,
      mapNodeStatusToCode: window.mapNodeStatusToCode,
      mouseState: mouseState,
      mouseConfig: mouseConfig,
    });

    // Setup region markers
    if ( nodeDataManager.regionList.length ) {
      nodeDataManager.regionList.forEach(( region ) => {
        addRegionMarker(region);
      });
    }

    // Setup node markers
    const markers = nodeDataManager.nodeList.map(( node, index ) => {
      return addNodeMarker(node, mapToolTip, index);
    });

    // Setup clusters
    const markerClusterer = addClusterer(markers, mapToolTip);
    window._markerClusterer = markerClusterer;

    // Check for alarm updates
    pollAlarmHistoryAndUpdateNodeStatus(alarmData, alarmDropDown, nodeDataManager, markerClusterer);

    // Poll the node list, update the data, add and remove nodes from the map
    pollNodesAndAddOrRemove(nodeDataManager, mapToolTip, markerClusterer);
  }

  /**
   * entry point
   */
  const domLoadedPromise = new window.Promise( (resolve) => {
    window.google.maps.event.addDomListener(window, 'load', resolve);
  });

  domLoadedPromise
    .then(() => {
      createGoogleMap();
      return window.Promise.all([
        window.DataLoader.loadNodeList(),
        window.DataLoader.loadAlarms(),
        window.DataLoader.loadRegions(),
      ]);
    })
    .then( initialize );
})();

