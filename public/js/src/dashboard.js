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

  function processNodes( data ) {
    nodes = data.nodes;
    nodes.forEach(( node ) => {
      // convert to number
      node.coords.lat = parseFloat(node.coords.lat);
      node.coords.lng = parseFloat(node.coords.lng);
      // populate nodeMap,
      nodeMap[node.node_id] = node;
    });
  }

  function mockLoadNodeList() {
    const data = JSON.parse('{"nodes":[{"alarm_status":0,"coords":{"lat":"45.8696","lng":"-119.688"},"name":"CNG Oregon","node_id":"CNG1","type":"CNG"},{"alarm_status":"n/a","coords":{"lat":36.104935,"lng":-115.172299},"name":"Main Data Center","node_id":"DC1","type":"DataCenter"},{"alarm_status":0,"coords":{"lat":"37.693719","lng":"-122.471859"},"name":"BR#1 name","node_id":"BR#1","type":"CCW"},{"alarm_status":0,"coords":{"lat":"37.666555","lng":"-122.102525"},"name":"BR#2 name","node_id":"BR#2","type":"CCW"},{"alarm_status":0,"coords":{"lat":"37.38559","lng":"-122.031637"},"name":"BR#3 name","node_id":"BR#3","type":"CCW"},{"alarm_status":0,"coords":{"lat":"37.51282","lng":"-121.967547"},"name":"BR#4 name","node_id":"BR#4","type":"CCW"},{"alarm_status":0,"coords":{"lat":"37.720342","lng":"-121.852962"},"name":"BR#5 name","node_id":"BR#5","type":"CCW"},{"alarm_status":0,"coords":{"lat":"37.177947","lng":"-121.652213"},"name":"BR#6 name","node_id":"BR#6","type":"CCW"},{"alarm_status":0,"coords":{"lat":"37.190733","lng":"-121.654836"},"name":"BR#7 name","node_id":"BR#7","type":"CCW"},{"alarm_status":0,"coords":{"lat":"37.974087","lng":"-122.061324"},"name":"BR#8 name","node_id":"BR#8","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.052332","lng":"-121.315326"},"name":"BR#9 name","node_id":"BR#9","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.14684","lng":"-121.262206"},"name":"BR#10 name","node_id":"BR#10","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.292005","lng":"-122.629484"},"name":"BR#11 name","node_id":"BR#11","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.306505","lng":"-122.056705"},"name":"BR#12 name","node_id":"BR#12","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.505589","lng":"-122.726486"},"name":"BR#13 name","node_id":"BR#13","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.511011","lng":"-121.500094"},"name":"BR#14 name","node_id":"BR#14","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.473049","lng":"-121.400781"},"name":"BR#15 name","node_id":"BR#15","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.714938","lng":"-121.160584"},"name":"BR#16 name","node_id":"BR#16","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.833778","lng":"-121.269135"},"name":"BR#17 name","node_id":"BR#17","type":"CCW"},{"alarm_status":0,"coords":{"lat":"37.265446","lng":"-121.669438"},"name":"BR#18 name","node_id":"BR#18","type":"CCW"},{"alarm_status":0,"coords":{"lat":"36.791828","lng":"-121.674923"},"name":"BR#19 name","node_id":"BR#19","type":"CCW"},{"alarm_status":0,"coords":{"lat":"36.923685","lng":"-119.873166"},"name":"BR#20 name","node_id":"BR#20","type":"CCW"},{"alarm_status":0,"coords":{"lat":"36.417","lng":"-119.323849"},"name":"BR#21 name","node_id":"BR#21","type":"CCW"},{"alarm_status":0,"coords":{"lat":"35.388706","lng":"-120.706209"},"name":"BR#22 name","node_id":"BR#22","type":"CCW"},{"alarm_status":0,"coords":{"lat":"35.532369","lng":"-119.118809"},"name":"BR#23 name","node_id":"BR#23","type":"CCW"},{"alarm_status":0,"coords":{"lat":"35.063193","lng":"-120.431843"},"name":"BR#24 name","node_id":"BR#24","type":"CCW"},{"alarm_status":0,"coords":{"lat":"34.596683","lng":"-117.355031"},"name":"BR#25 name","node_id":"BR#25","type":"CCW"},{"alarm_status":0,"coords":{"lat":"34.300402","lng":"-118.099737"},"name":"BR#26 name","node_id":"BR#26","type":"CCW"},{"alarm_status":0,"coords":{"lat":"34.035559","lng":"-118.406765"},"name":"BR#27 name","node_id":"BR#27","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.654542","lng":"-117.170559"},"name":"BR#28 name","node_id":"BR#28","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.850933","lng":"-116.401516"},"name":"BR#29 name","node_id":"BR#29","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.759644","lng":"-112.254177"},"name":"BR#30 name","node_id":"BR#30","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.82812","lng":"-112.058662"},"name":"BR#31 name","node_id":"BR#31","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.608805","lng":"-111.913601"},"name":"BR#32 name","node_id":"BR#32","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.466866","lng":"-111.985012"},"name":"BR#33 name","node_id":"BR#33","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.283376","lng":"-117.362819"},"name":"BR#34 name","node_id":"BR#34","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.191485","lng":"-117.263943"},"name":"BR#35 name","node_id":"BR#35","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.242037","lng":"-117.104641"},"name":"BR#36 name","node_id":"BR#36","type":"CCW"},{"alarm_status":0,"coords":{"lat":"32.873724","lng":"-117.22549"},"name":"BR#37 name","node_id":"BR#37","type":"CCW"},{"alarm_status":0,"coords":{"lat":"36.247503","lng":"-115.182033"},"name":"BR#38 name","node_id":"BR#38","type":"CCW"},{"alarm_status":0,"coords":{"lat":"37.246636","lng":"-113.556057"},"name":"BR#39 name","node_id":"BR#39","type":"CCW"},{"alarm_status":0,"coords":{"lat":"41.173399","lng":"-111.979519"},"name":"BR#40 name","node_id":"BR#40","type":"CCW"},{"alarm_status":0,"coords":{"lat":"40.733643","lng":"-111.864163"},"name":"BR#41 name","node_id":"BR#41","type":"CCW"},{"alarm_status":0,"coords":{"lat":"40.49596","lng":"-111.831204"},"name":"BR#42 name","node_id":"BR#42","type":"CCW"},{"alarm_status":0,"coords":{"lat":"40.37471","lng":"-111.704861"},"name":"BR#43 name","node_id":"BR#43","type":"CCW"},{"alarm_status":0,"coords":{"lat":"43.706517","lng":"-116.59927"},"name":"BR#44 name","node_id":"BR#44","type":"CCW"},{"alarm_status":0,"coords":{"lat":"43.714459","lng":"-116.291653"},"name":"BR#45 name","node_id":"BR#45","type":"CCW"},{"alarm_status":0,"coords":{"lat":"42.705566","lng":"-114.456936"},"name":"BR#46 name","node_id":"BR#46","type":"CCW"},{"alarm_status":0,"coords":{"lat":"43.007576","lng":"-112.462918"},"name":"BR#47 name","node_id":"BR#47","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.790016","lng":"-117.198025"},"name":"BR#48 name","node_id":"BR#48","type":"CCW"},{"alarm_status":0,"coords":{"lat":"48.870962","lng":"-122.504421"},"name":"BR#49 name","node_id":"BR#49","type":"CCW"},{"alarm_status":0,"coords":{"lat":"48.551993","lng":"-122.339626"},"name":"BR#50 name","node_id":"BR#50","type":"CCW"},{"alarm_status":0,"coords":{"lat":"48.249292","lng":"-122.202297"},"name":"BR#51 name","node_id":"BR#51","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.753097","lng":"-122.713161"},"name":"BR#52 name","node_id":"BR#52","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.804776","lng":"-122.339626"},"name":"BR#53 name","node_id":"BR#53","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.716152","lng":"-122.136379"},"name":"BR#54 name","node_id":"BR#54","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.634781","lng":"-122.042995"},"name":"BR#55 name","node_id":"BR#55","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.534742","lng":"-122.273708"},"name":"BR#56 name","node_id":"BR#56","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.404778","lng":"-122.30667"},"name":"BR#57 name","node_id":"BR#57","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.311749","lng":"-122.482448"},"name":"BR#58 name","node_id":"BR#58","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.255854","lng":"-122.31216"},"name":"BR#59 name","node_id":"BR#59","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.132675","lng":"-122.983381"},"name":"BR#60 name","node_id":"BR#60","type":"CCW"},{"alarm_status":0,"coords":{"lat":"45.688042","lng":"-122.688495"},"name":"BR#61 name","node_id":"BR#61","type":"CCW"},{"alarm_status":0,"coords":{"lat":"45.634293","lng":"-122.919208"},"name":"BR#62 name","node_id":"BR#62","type":"CCW"},{"alarm_status":0,"coords":{"lat":"45.499697","lng":"-122.74892"},"name":"BR#63 name","node_id":"BR#63","type":"CCW"},{"alarm_status":0,"coords":{"lat":"45.553574","lng":"-122.584125"},"name":"BR#64 name","node_id":"BR#64","type":"CCW"},{"alarm_status":0,"coords":{"lat":"45.592026","lng":"-122.43581"},"name":"BR#65 name","node_id":"BR#65","type":"CCW"},{"alarm_status":0,"coords":{"lat":"45.028009","lng":"-122.979633"},"name":"BR#66 name","node_id":"BR#66","type":"CCW"},{"alarm_status":0,"coords":{"lat":"44.202971","lng":"-123.100482"},"name":"BR#67 name","node_id":"BR#67","type":"CCW"},{"alarm_status":0,"coords":{"lat":"42.477946","lng":"-122.891768"},"name":"BR#68 name","node_id":"BR#68","type":"CCW"},{"alarm_status":0,"coords":{"lat":"40.731242","lng":"-122.350417"},"name":"BR#69 name","node_id":"BR#69","type":"CCW"},{"alarm_status":0,"coords":{"lat":"39.864342","lng":"-121.782089"},"name":"BR#70 name","node_id":"BR#70","type":"CCW"},{"alarm_status":0,"coords":{"lat":"39.608145","lng":"-119.802738"},"name":"BR#71 name","node_id":"BR#71","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.889806","lng":"-121.279085"},"name":"BR#72 name","node_id":"BR#72","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.573861","lng":"-122.72302"},"name":"BR#73 name","node_id":"BR#73","type":"CCW"},{"alarm_status":0,"coords":{"lat":"43.000388","lng":"-106.275386"},"name":"BR#74 name","node_id":"BR#74","type":"CCW"},{"alarm_status":0,"coords":{"lat":"39.766592","lng":"-105.119132"},"name":"BR#75 name","node_id":"BR#75","type":"CCW"},{"alarm_status":0,"coords":{"lat":"36.881991","lng":"-108.169814"},"name":"BR#76 name","node_id":"BR#76","type":"CCW"},{"alarm_status":0,"coords":{"lat":"32.457089","lng":"-106.758792"},"name":"BR#77 name","node_id":"BR#77","type":"CCW"},{"alarm_status":0,"coords":{"lat":"31.219565","lng":"-97.678603"},"name":"BR#78 name","node_id":"BR#78","type":"CCW"},{"alarm_status":0,"coords":{"lat":"32.732272","lng":"-96.953495"},"name":"BR#79 name","node_id":"BR#79","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.044946","lng":"-97.325848"},"name":"BR#80 name","node_id":"BR#80","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.356513","lng":"-96.790182"},"name":"BR#81 name","node_id":"BR#81","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.050422","lng":"-96.47089"},"name":"BR#82 name","node_id":"BR#82","type":"CCW"},{"alarm_status":0,"coords":{"lat":"33.077795","lng":"-96.829377"},"name":"BR#83 name","node_id":"BR#83","type":"CCW"},{"alarm_status":0,"coords":{"lat":"35.447583","lng":"-97.495693"},"name":"BR#84 name","node_id":"BR#84","type":"CCW"},{"alarm_status":0,"coords":{"lat":"35.479506","lng":"-94.412349"},"name":"BR#85 name","node_id":"BR#85","type":"CCW"},{"alarm_status":0,"coords":{"lat":"36.204975","lng":"-95.875631"},"name":"BR#86 name","node_id":"BR#86","type":"CCW"},{"alarm_status":0,"coords":{"lat":"37.852828","lng":"-97.273588"},"name":"BR#87 name","node_id":"BR#87","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.105137","lng":"-100.84687"},"name":"BR#88 name","node_id":"BR#88","type":"CCW"},{"alarm_status":0,"coords":{"lat":"38.933109","lng":"-97.606746"},"name":"BR#89 name","node_id":"BR#89","type":"CCW"},{"alarm_status":0,"coords":{"lat":"39.05496","lng":"-94.412349"},"name":"BR#90 name","node_id":"BR#90","type":"CCW"},{"alarm_status":0,"coords":{"lat":"39.171537","lng":"-95.758045"},"name":"BR#91 name","node_id":"BR#91","type":"CCW"},{"alarm_status":0,"coords":{"lat":"39.93103","lng":"-94.836962"},"name":"BR#92 name","node_id":"BR#92","type":"CCW"},{"alarm_status":0,"coords":{"lat":"41.074484","lng":"-98.403712"},"name":"BR#93 name","node_id":"BR#93","type":"CCW"},{"alarm_status":0,"coords":{"lat":"40.931516","lng":"-96.639934"},"name":"BR#94 name","node_id":"BR#94","type":"CCW"},{"alarm_status":0,"coords":{"lat":"41.393801","lng":"-96.065073"},"name":"BR#95 name","node_id":"BR#95","type":"CCW"},{"alarm_status":0,"coords":{"lat":"43.694391","lng":"-97.780158"},"name":"BR#96 name","node_id":"BR#96","type":"CCW"},{"alarm_status":0,"coords":{"lat":"44.647848","lng":"-94.956427"},"name":"BR#97 name","node_id":"BR#97","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.475171","lng":"-101.669073"},"name":"BR#98 name","node_id":"BR#98","type":"CCW"},{"alarm_status":0,"coords":{"lat":"47.080131","lng":"-100.779181"},"name":"BR#99 name","node_id":"BR#99","type":"CCW"},{"alarm_status":0,"coords":{"lat":"46.51069","lng":"-94.3192"},"name":"BR#100 name","node_id":"BR#100","type":"CCW"}]}');
    return new window.Promise((resolve, reject) => {
      setTimeout(() => {
        processNodes(data);
        resolve();
      }, 500);
    });
  }

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
        processNodes(data);
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
        // lat: 37.437081,
        // lng: -122.077481,
        lat: 45.8696,
        lng: -119.688,
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
      // label: node.node_id.toString(),
    });
    node.marker = marker;
    marker.node = node;
    // don't show tooltip for HQ
    if ( node.type === nodeTypes.DATACENTER ) return marker;

    // if ( node.node_id === 'BR#3' ) {
    //   setTimeout(() => {
    //     mapToolTip.openOnMarker( node );
    //   }, 1000);
    // }

    if ( node.node_id === 'CNG1' ) {
      setTimeout(() => {
        mapToolTip.openOnMarker( node );
      }, 1000);
    }

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
      nodeMap[alarm.node_id].alarm_status = mapNodeStatusToCode[alarm.severity];
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

    // const alarmDropDown = new window.AlarmDropDown({
    //   $trigger: document.querySelector('.navbar__alarmsTrigger'),
    //   $container: document.querySelector('.navbar__alarms .alarmDropdown'),
    //   template: window.templates.tableList,
    //   mouseConfig: mouseConfig,
    // });

    // let i = 0;
    // Load alarms once per second, waiting for the prev request to finish
    // function pollAlarms() {
    //   window.setTimeout(() => {
    //     loadAlarms().then(( alarmData ) => {
    //       // mock set history response
    //       // if ( i % 2 === 0 ) {
    //       //   alarmData.alarms[0].alarm_history = mockAlarmHistory2;
    //       //   alarmData.alarms[0].num_alarms = mockAlarmHistory2.length;
    //       // }

    //       // Render alarms in the alarm dropdown, as a list
    //       alarmDropDown.updateAlarmData(alarmData);
    //       alarmDropDown.updateAlarmCount();

    //       diffAlarmHistoryAndUpdateNodes(alarmHistory, alarmData.alarms[0].alarm_history );
    //       alarmHistory = alarmData.alarms[0].alarm_history;
    //       // i++;
    //       pollAlarms();
    //     });
    //   }, 1000);
    // }

    // Fire once on page load
    // loadAlarms().then(( alarmData ) => {
    //   // Render alarms in the alarm dropdown, as a list
    //   alarmDropDown.updateAlarmData( alarmData );
    //   alarmDropDown.updateAlarmCount();
    //   alarmHistory = alarmData.alarms[0].alarm_history;
    //   if ( alarmHistory ) {
    //     syncNodesWithAlarmHistory(alarmHistory);
    //   }
    //   // pollAlarms();
    // });

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
    mockLoadNodeList(),
    domLoadedPromise
  ])
    .then(initialize);

})();

