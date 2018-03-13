(function () {
  /**
   * config, constants
   */
  const differ = window.jsondiffpatch.create();
  const nodeTypes = {
    DATACENTER: 'DataCenter',
    CNG: 'CNG',
    CCW: 'CCW'
  };


  // const ALARM_STATUS_NA = 'n/a';
  const BASIC_AUTH_SECRET = 'Basic TWVnaE5ldHdvcmtzOm5qZTk3NnhzdzQ1Mw==';
  const ICON_GREEN_BRANCH = 'img/icons/ccw-green.svg';
  const ICON_YELLOW_BRANCH = 'img/icons/ccw-yellow.svg';
  const ICON_RED_BRANCH = 'img/icons/ccw-red.svg';

  const ICON_GREEN_CLOUD = 'img/icons/cng-green.svg';
  const ICON_YELLOW_CLOUD = 'img/icons/cng-yellow.svg';
  const ICON_RED_CLOUD = 'img/icons/cng-red.svg';

  const ICON_GROUP_CIRCLE = 'img/icons/group-circle.svg';
  const ICON_DATA_CENTER = 'img/icons/dc.svg';

  const ALARM_STATUS_CLEAR = 0;
  const ALARM_STATUS_MINOR = 1;
  const ALARM_STATUS_MAJOR = 2;
  const mapNodeStatusToCode = {
    Clear: ALARM_STATUS_CLEAR,
    Minor: ALARM_STATUS_MINOR,
    Major: ALARM_STATUS_MAJOR,
  };
  const mapNodeToIcon = ( nodeType, nodeStatus ) => {
    if ( nodeType === nodeTypes.DATACENTER ) return ICON_DATA_CENTER;
    if ( nodeStatus === ALARM_STATUS_CLEAR ) {
      if ( nodeType === nodeTypes.CNG ) return ICON_GREEN_CLOUD;
      if ( nodeType === nodeTypes.CCW ) return ICON_GREEN_BRANCH;
    }
    if ( nodeStatus === ALARM_STATUS_MINOR ) {
      if ( nodeType === nodeTypes.CNG ) return ICON_YELLOW_CLOUD;
      if ( nodeType === nodeTypes.CCW ) return ICON_YELLOW_BRANCH;
    }
    if ( nodeStatus === ALARM_STATUS_MAJOR ) {
      if ( nodeType === nodeTypes.CNG ) return ICON_RED_CLOUD;
      if ( nodeType === nodeTypes.CCW ) return ICON_RED_BRANCH;
    }
    return ICON_GREEN_BRANCH;
  };

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

  let nodes = null;
  let nodeMap = {};

  function loadNodeList() {
    return window.unfetch('/megh/api/v1.0/nodes', {
      credentials: 'include',
      headers: {
        'Authorization': BASIC_AUTH_SECRET
      }
    })
      .then(( response ) => {
        return response.json();
      })
      .then(( data ) => {
        nodes = data.nodes;
        nodes.forEach(( node ) => {
          // convert to number
          node.coords.lat = parseFloat(node.coords.lat);
          node.coords.lng = parseFloat(node.coords.lng);
          // populate nodeMap,
          nodeMap[node.node_id] = node;
        });
      });
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
    const options = Object.assign({
      center: {
        lat: 37.437081,
        lng: -122.077481,
        // lat: 45.8696,
        // lng: -119.688,
      },
      zoom: 10,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    }, mapOptions);
    window.googleMap = new window.google.maps.Map(mapRegionDOM, options);
  }

  function updateNodeIcon( node ) {
    node.marker.setIcon({
      url: mapNodeToIcon( node.type, node.alarm_status ),
      // ( width, height )
      scaledSize: new window.google.maps.Size(40, 40),
      // ( originX, originY )
      origin: new window.google.maps.Point(0, 0),
      // Image anchor
      anchor: new window.google.maps.Point(20, 20)
    });
  }

  function addMarker( node, mapToolTip, index ) {
    const coords = node.coords;
    // create marker
    const marker = new window.google.maps.Marker({
      position: {
        lat: coords.lat,
        lng: coords.lng,
      },
      map: window.googleMap,
      icon: {
        url: mapNodeToIcon( node.type, node.alarm_status ),
        // ( width, height )
        scaledSize: new window.google.maps.Size(40, 40),
        // ( originX, originY )
        origin: new window.google.maps.Point(0, 0),
        // Image anchor
        anchor: new window.google.maps.Point(20, 20)
      },
      label: node.node_id.toString(),
    });
    node.marker = marker;
    marker.node = node;
    // don't show tooltip for HQ
    if ( node.type === nodeTypes.DATACENTER ) return marker;

    if ( node.node_id === 'BR#3' ) {
      setTimeout(() => {
        mapToolTip.openOnMarker( node );
      }, 1000);
    }

    // if ( node.node_id === 'CNG1' ) {
    //   setTimeout(() => {
    //     mapToolTip.openOnMarker( node );
    //   }, 1000);
    // }

    // Setup events, for tooltip
    marker.addListener('click', () => {
      if ( mouseState.mouseWithinMarker ) {
        window.location.href = `node-summary?ip=${node.node_id}`;
        return;
      }
      // mapToolTip.toggleMarker( node );
    });
    marker.addListener('mouseover', () => {
      mouseState.mouseWithinMarker = node;
      if ( mouseState.mouseWithinCluster ) { // mouse in while inside cluster, ignore event
        return;
      }
      // TODO: Uncomment this section
      // mapToolTip.openOnMarker( node );
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
        // mapToolTip.close();
      }, mouseConfig.MOUSEOUT_TIMER_DELAY_MS);
    });
    return marker;
  }

  function addClusterer( markers, mapToolTip ) {
    // Only cluster CCW nodes
    const CCWMarkers = markers.filter(( marker ) => {
      return ( marker.node.type === nodeTypes.CCW );
    });

    // setup cluster
    const markerClusters = new window.MarkerClusterer(window.googleMap, CCWMarkers, {
      clusterClass: 'markerCluster',
      styles: [ {
        url: ICON_GROUP_CIRCLE,
        width: 60,
        height: 60,
        textColor: '#515151',
        textSize: 30
      } ]
    });

    // Setup events, for tooltip
    window.google.maps.event.addListener(markerClusters, 'click', function () {
      // mapToolTip.close();
    });
    window.google.maps.event.addListener(markerClusters, 'mouseover', function (cluster) {
      mouseState.mouseWithinCluster = cluster;
      if ( !mapToolTip.toolTip ) {
        // mapToolTip.openOnCluster(cluster);
      }
    });
    window.google.maps.event.addListener(markerClusters, 'mouseout', function () {
      mouseState.mouseWithinCluster = false;
      setTimeout(() => {
        if ( mouseState.mouseWithinTooltip ) {
          mouseState.mouseWithinTooltip = false;
          return;
        }
        mapToolTip.close();
        if ( mouseState.mouseWithinMarker ) {
          // TODO: Uncomment this section
          // mapToolTip.openOnMarker( mouseState.mouseWithinMarker );
        }
      }, mouseConfig.MOUSEOUT_TIMER_DELAY_MS);
    });
  }

  // function pollAlarms () {
  //   // set timeout
  //   // fetch alarms
  //   // diff alarms
  //   // apply updates
  // }

  function loadAlarms() {
    return window.unfetch('/megh/api/v1.0/alarms', {
      credentials: 'include',
      headers: {
        'Authorization': BASIC_AUTH_SECRET
      }
    })
      .then(function ( response ) {
        return response.json();
      });
  }

  function mapArrayToIdObject( array ) {
    const obj = {};
    if ( !array ) return obj;
    array.forEach(( item ) => {
      obj[item.node_id] = item;
    });
    return obj;
  }

  function syncNodesWithAlarmHistory(alarmHistory) {
    // get all nodes in alarm state
    const alarmNodesMap = {};
    nodes
      .filter(( node ) => (
        node.alarm_status === ALARM_STATUS_MINOR || node.alarm_status === ALARM_STATUS_MAJOR
      ))
      .forEach(( node ) => {
        alarmNodesMap[node.node_id] = node;
      });

    // update all alarm history nodes
    alarmHistory.forEach(( alarm ) => {
      nodeMap[alarm.node_id].alarm_status = mapNodeStatusToCode(alarm.severity);
      updateNodeIcon(nodeMap[alarm.node_id]);
      // remove node from map once it's updated
      delete alarmNodesMap[alarm.node_id];
    });
    // any remaining nodes in alarmNodesMap are no longer in alarm state, set them to clear
    Object.keys(alarmNodesMap).forEach(( nodeId ) => {
      alarmNodesMap[nodeId].alarm_status = ALARM_STATUS_CLEAR;
      updateNodeIcon(nodeMap[nodeId]);
    });
  }

  function diffAlarmHistoryAndUpdateNodes(alarmHistoryArray, nextAlarmHistoryArray ) {
    const currObj = mapArrayToIdObject(alarmHistoryArray);
    const nextObj = mapArrayToIdObject(nextAlarmHistoryArray);
    const diffResult = differ.diff(currObj, nextObj);

    if ( !diffResult ) return;

    Object.keys(diffResult).forEach(( nodeId ) => {
      const diffItem = diffResult[nodeId];
      // alarm is added or removed
      if ( Array.isArray(diffItem) ) {
        if ( diffItem[1] === 0 && diffItem[2] === 0 ) {
          // alarm removed, set alarm_status to Clear
          nodeMap[nodeId].alarm_status = mapNodeStatusToCode['Clear'];
          updateNodeIcon(nodeMap[nodeId]);
          return;
        }
        // alarm added, update alarm_status
        nodeMap[nodeId].alarm_status = mapNodeStatusToCode[diffItem[0].severity];
        updateNodeIcon(nodeMap[nodeId]);
        return;
      }
      // alarm value changed, update alarm_status
      if ( diffItem.severity ) {
        nodeMap[nodeId].alarm_status = mapNodeStatusToCode[diffItem.severity[1]];
        updateNodeIcon(nodeMap[nodeId]);
        return;
      }
    });
  }

  // const mockAlarmHistory1 = [
  //   {
  //     alarm_id: '1',
  //     description: 'Lan line is down',
  //     instance: '1',
  //     node_id: 'BR#1',
  //     occurrence_date: '2018-03-01 19:43:13',
  //     severity: 'Minor',
  //     type: 'LINE_DOWN'
  //   },
  //   {
  //     alarm_id: '2',
  //     description: 'Lan line is down',
  //     instance: '1',
  //     node_id: 'BR#2',
  //     occurrence_date: '2018-03-01 19:43:13',
  //     severity: 'Major',
  //     type: 'LINE_DOWN'
  //   },
  //   {
  //     alarm_id: '3',
  //     description: 'Lan line is down',
  //     instance: '1',
  //     node_id: 'BR#3',
  //     occurrence_date: '2018-03-01 19:43:13',
  //     severity: 'Major',
  //     type: 'LINE_DOWN'
  //   },
  // ];

  // const mockAlarmHistory2 = [
  //   {
  //     alarm_id: '1',
  //     description: 'Lan line is down',
  //     instance: '1',
  //     node_id: 'BR#2',
  //     occurrence_date: '2018-03-01 19:43:13',
  //     severity: 'Minor',
  //     type: 'LINE_DOWN'
  //   },
  //   {
  //     alarm_id: '2',
  //     description: 'Lan line is down',
  //     instance: '1',
  //     node_id: 'BR#3',
  //     occurrence_date: '2018-03-01 19:43:13',
  //     severity: 'Major',
  //     type: 'LINE_DOWN'
  //   },
  //   {
  //     alarm_id: '2',
  //     description: 'Lan line is down',
  //     instance: '1',
  //     node_id: 'BR#4',
  //     occurrence_date: '2018-03-01 19:43:13',
  //     severity: 'Major',
  //     type: 'LINE_DOWN'
  //   }
  // ];

  function initialize() {
    let alarmHistory = null;
    createGoogleMap();

    const alarmDropDown = new window.AlarmDropDown({
      $trigger: document.querySelector('.navbar__alarmsTrigger'),
      $container: document.querySelector('.navbar__alarms .alarmDropdown'),
      template: window.templates.tableList,
      mouseConfig: mouseConfig,
    });

    // let i = 0;
    // Load alarms once per second, waiting for the prev request to finish
    function pollAlarms() {
      window.setTimeout(() => {
        loadAlarms().then(( alarmData ) => {
          // mock set history response
          // if ( i % 2 === 0 ) {
          //   alarmData.alarms[0].alarm_history = mockAlarmHistory2;
          //   alarmData.alarms[0].num_alarms = mockAlarmHistory2.length;
          // }

          // Render alarms in the alarm dropdown, as a list
          alarmDropDown.updateAlarmData(alarmData);
          alarmDropDown.updateAlarmCount();

          diffAlarmHistoryAndUpdateNodes(alarmHistory, alarmData.alarms[0].alarm_history );
          alarmHistory = alarmData.alarms[0].alarm_history;
          // i++;
          pollAlarms();
        });
      }, 1000);
    }

    // Fire once on page load
    loadAlarms().then(( alarmData ) => {
      // Render alarms in the alarm dropdown, as a list
      alarmDropDown.updateAlarmData( alarmData );
      alarmDropDown.updateAlarmCount();
      alarmHistory = alarmData.alarms[0].alarm_history;
      if ( alarmHistory ) {
        syncNodesWithAlarmHistory(alarmHistory);
      }
      // pollAlarms();
    });

    const mapToolTip = new window.MapToolTip({
      nodeTypes: nodeTypes,
      mapNodeStatusToCode: mapNodeStatusToCode,
      mouseState: mouseState,
      mouseConfig: mouseConfig,
    });
    const markers = nodes.map(( node, index ) => {
      return addMarker(node, mapToolTip, index);
    });
    addClusterer(markers, mapToolTip);
  }

  /**
   * entry point
   */
  const domLoadedPromise = new window.Promise( (resolve) => {
    window.google.maps.event.addDomListener(window, 'load', resolve);
  });

  window.Promise.all([
    loadNodeList(),
    domLoadedPromise
  ])
    .then(initialize);

})();

