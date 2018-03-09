(function () {
  /**
   * config, constants
   */
  const nodeTypes = {
    DATACENTER: 'NODE_TYPE_DATACENTER',
    CNG: 'NODE_TYPE_CNG',
    CCW: 'NODE_TYPE_CCW'
  };

  const BASIC_AUTH_SECRET = 'Basic TWVnaE5ldHdvcmtzOm5qZTk3NnhzdzQ1Mw==';
  const ICON_GREEN_BRANCH = 'img/icons/ccw-green.svg';
  const ICON_YELLOW_BRANCH = 'img/icons/ccw-yellow.svg';
  const ICON_RED_BRANCH = 'img/icons/ccw-red.svg';

  const ICON_GREEN_CLOUD = 'img/icons/cng-green.svg';
  const ICON_YELLOW_CLOUD = 'img/icons/cng-yellow.svg';
  const ICON_RED_CLOUD = 'img/icons/cng-red.svg';

  const ICON_GROUP_CIRCLE = 'img/icons/group-circle.svg';
  const ICON_DATA_CENTER = 'img/icons/dc.svg';

  const mapNodeToIcon = ( nodeType, nodeStatus ) => {
    if ( !nodeStatus || nodeStatus === 'Clear' ) {
      if ( nodeType === nodeTypes.DATACENTER ) return ICON_DATA_CENTER;
      if ( nodeType === nodeTypes.CNG ) return ICON_GREEN_CLOUD;
      if ( nodeType === nodeTypes.CCW ) return ICON_GREEN_BRANCH;
    }
    if ( nodeStatus === 'Minor' ) {
      if ( nodeType === nodeTypes.DATACENTER ) return ICON_DATA_CENTER;
      if ( nodeType === nodeTypes.CNG ) return ICON_YELLOW_CLOUD;
      if ( nodeType === nodeTypes.CCW ) return ICON_YELLOW_BRANCH;
    }
    if ( nodeStatus === 'Major' ) {
      if ( nodeType === nodeTypes.DATACENTER ) return ICON_DATA_CENTER;
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
  const mockData = {
    location: 'Turlock',
    ip_address: '195.168.103',
    num_clients: 7,
  };
  function mockLoadData() {
    return new window.Promise(( resolve ) => {
      setTimeout(() => {
        nodes = [
          {
            type: nodeTypes.DATACENTER,
            coords: { lat: 37.3691261, lng: -121.919605 },
            severity: 'Clear',
          },
          {
            type: nodeTypes.CNG,
            coords: { lat: 37.47360064083576, lng: -122.25839401562502 },
            severity: 'Clear',
          },
          {
            type: nodeTypes.CCW,
            coords: { lat: 37.45288986053689, lng: -122.17736984570314 },
            severity: 'Minor',
          },
          {
            type: nodeTypes.CCW,
            coords: { lat: 37.5084689856724, lng: -122.19522262890627 },
            severity: 'Clear',
          },
          {
            type: nodeTypes.CCW,
            coords: { lat: 37.51173705842232, lng: -121.97137619335939 },
            severity: 'Clear',
          },
          {
            type: nodeTypes.CNG,
            coords: { lat: 37.56944941254819, lng: -121.92605758984377 },
            severity: 'Major',
          },
          {
            type: nodeTypes.CCW,
            coords: { lat: 37.72031641754861, lng: -122.43285251296783 },
            severity: 'Clear',
          },
          {
            type: nodeTypes.CCW,
            coords: { lat: 37.76266931206604, lng: -122.43422580398345 },
            severity: 'Clear',
          },
          {
            type: nodeTypes.CCW,
            coords: { lat: 37.75289771812296, lng: -122.49053073562408 },
            severity: 'Minor',
          },
          {
            type: nodeTypes.CNG,
            coords: { lat: 37.66598239336537, lng: -122.51113010085845 },
            severity: 'Clear',
          },
          {
            type: nodeTypes.CCW,
            coords: { lat: 37.6627210859622, lng: -122.44658542312408 },
            severity: 'Clear',
          },
          {
            type: nodeTypes.CCW,
            coords: { lat: 37.68989426898018, lng: -122.36693454421783 },
            severity: 'Major',
          },
          {
            type: nodeTypes.CCW,
            coords: { lat: 37.47253816730712, lng: -122.19906650971052 },
            severity: 'Clear',
          },
          {
            type: nodeTypes.CNG,
            coords: { lat: 37.47771503954888, lng: -122.14997135590193 },
            severity: 'Clear',
          },
          {
            type: nodeTypes.CCW,
            coords: { lat: 37.43492696738677, lng: -122.22344242523786 },
            severity: 'Minor',
          },
        ];
        // add default data
        nodes.forEach(( node ) => {
          Object.assign(node, mockData);
        });

        resolve();
      }, 100);
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
        lat: 37.46787055967662,
        lng: -122.04780556144539,
      },
      zoom: 11,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    }, mapOptions);
    window.googleMap = new window.google.maps.Map(mapRegionDOM, options);
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
        url: mapNodeToIcon( node.type, node.severity ), // node.severity
        // ( width, height )
        scaledSize: new window.google.maps.Size(40, 40),
        // ( originX, originY )
        origin: new window.google.maps.Point(0, 0),
        // Image anchor
        anchor: new window.google.maps.Point(20, 20)
      },
    });
    node.marker = marker;
    marker.node = node;
    // don't show tooltip for HQ
    if ( node.type === nodeTypes.DATACENTER ) return marker;

    if ( index === 3 ) mapToolTip.openOnMarker( node );

    // Setup events, for tooltip
    marker.addListener('click', () => {
      if ( mouseState.mouseWithinMarker ) {
        window.location.href = `node-summary?ip=${node.ip_address}`;
        return;
      }
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
      mapToolTip.close();
    });
    window.google.maps.event.addListener(markerClusters, 'mouseover', function (cluster) {
      mouseState.mouseWithinCluster = cluster;
      if ( !mapToolTip.toolTip ) {
        mapToolTip.openOnCluster(cluster);
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
          mapToolTip.openOnMarker( mouseState.mouseWithinMarker );
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

  function initialize() {
    createGoogleMap();

    const alarmDropDown = new window.AlarmDropDown({
      $trigger: document.querySelector('.navbar__alarmsTrigger'),
      $container: document.querySelector('.navbar__alarms .alarmDropdown'),
      template: window.templates.tableList,
      mouseConfig: mouseConfig,
    });

    // Load alarms once per second, waiting for the prev request to finish
    function pollAlarms() {
      // window.setTimeout(() => {
      //   // populate alarms
      //   loadAlarms().then(( alarmData ) => {
      //     alarmDropDown.updateAlarmData(alarmData);
      //     alarmDropDown.updateAlarmCount();
      //     pollAlarms();
      //   });
      // }, 1000);
    }

    // Fire once on page load
    loadAlarms().then(( alarmData ) => {
      alarmDropDown.updateAlarmData( alarmData );
      alarmDropDown.updateAlarmCount();
      pollAlarms();
    });

    const mapToolTip = new window.MapToolTip({
      nodeTypes: nodeTypes,
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

  const loadDataPromise = mockLoadData();

  window.Promise.all([ loadDataPromise, domLoadedPromise ])
    .then(initialize);

})();

