/**
 * config, constants
 */
const ICON_GREEN_BRANCH = 'img/icons/branch-green.svg';
const ICON_YELLOW_BRANCH = 'img/icons/branch-yellow.svg';
const ICON_RED_BRANCH = 'img/icons/branch-red.svg';

const ICON_GREEN_CLOUD = 'img/icons/cloud-1-green.svg';
const ICON_YELLOW_CLOUD = 'img/icons/cloud-1-yellow.svg';
const ICON_RED_CLOUD = 'img/icons/cloud-1-red.svg';

const GROUP_CIRCLE = 'img/icons/group-circle.svg';
const ICON_HQ = 'img/icons/hq-3.svg';

const NODE_TYPE_HQ = 'NODE_TYPE_HQ';
const NODE_TYPE_CNG = 'NODE_TYPE_CNG';
const NODE_TYPE_CCW = 'NODE_TYPE_CCW';

const mapNodeToIcon = ( nodeType, nodeStatus ) => {
  if ( !nodeStatus || nodeStatus === 'green' ) {
    if ( nodeType === NODE_TYPE_HQ ) return ICON_HQ;
    if ( nodeType === NODE_TYPE_CNG ) return ICON_GREEN_CLOUD;
    if ( nodeType === NODE_TYPE_CCW ) return ICON_GREEN_BRANCH;
  }
  if ( nodeStatus === 'yellow' ) {
    if ( nodeType === NODE_TYPE_HQ ) return ICON_HQ;
    if ( nodeType === NODE_TYPE_CNG ) return ICON_YELLOW_CLOUD;
    if ( nodeType === NODE_TYPE_CCW ) return ICON_YELLOW_BRANCH;
  }
  if ( nodeStatus === 'red' ) {
    if ( nodeType === NODE_TYPE_HQ ) return ICON_HQ;
    if ( nodeType === NODE_TYPE_CNG ) return ICON_RED_CLOUD;
    if ( nodeType === NODE_TYPE_CCW ) return ICON_RED_BRANCH;
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
let infoBox = null;
// infoBox defaults
const ibOptions = {
  disableAutoPan: false,
  maxWidth: 0,
  pixelOffset: new window.google.maps.Size(0, 0),
  zIndex: null,
  boxStyle: {
    padding: '0px 0px 0px 0px',
    width: '200px',
    height: '40px'
  },
  closeBoxURL: '',
  infoBoxClearance: new window.google.maps.Size(1, 1),
  isHidden: false,
  pane: 'floatPane',
  enableEventPropagation: false,
};

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
          type: NODE_TYPE_HQ,
          coords: { lat: 37.3691261, lng: -121.919605 },
          status: 'green',
        },
        {
          type: NODE_TYPE_CNG,
          coords: { lat: 37.47360064083576, lng: -122.25839401562502 },
          status: 'green',
        },
        {
          type: NODE_TYPE_CCW,
          coords: { lat: 37.45288986053689, lng: -122.17736984570314 },
          status: 'yellow',
        },
        {
          type: NODE_TYPE_CCW,
          coords: { lat: 37.5084689856724, lng: -122.19522262890627 },
          status: 'green',
        },
        {
          type: NODE_TYPE_CCW,
          coords: { lat: 37.51173705842232, lng: -121.97137619335939 },
          status: 'green',
        },
        {
          type: NODE_TYPE_CNG,
          coords: { lat: 37.56944941254819, lng: -121.92605758984377 },
          status: 'red',
        },
        {
          type: NODE_TYPE_CCW,
          coords: { lat: 37.72031641754861, lng: -122.43285251296783 },
          status: 'green',
        },
        {
          type: NODE_TYPE_CCW,
          coords: { lat: 37.76266931206604, lng: -122.43422580398345 },
          status: 'green',
        },
        {
          type: NODE_TYPE_CCW,
          coords: { lat: 37.75289771812296, lng: -122.49053073562408 },
          status: 'yellow',
        },
        {
          type: NODE_TYPE_CNG,
          coords: { lat: 37.66598239336537, lng: -122.51113010085845 },
          status: 'green',
        },
        {
          type: NODE_TYPE_CCW,
          coords: { lat: 37.6627210859622, lng: -122.44658542312408 },
          status: 'green',
        },
        {
          type: NODE_TYPE_CCW,
          coords: { lat: 37.68989426898018, lng: -122.36693454421783 },
          status: 'red',
        },
        {
          type: NODE_TYPE_CCW,
          coords: { lat: 37.47253816730712, lng: -122.19906650971052 },
          status: 'green',
        },
        {
          type: NODE_TYPE_CNG,
          coords: { lat: 37.47771503954888, lng: -122.14997135590193 },
          status: 'green',
        },
        {
          type: NODE_TYPE_CCW,
          coords: { lat: 37.43492696738677, lng: -122.22344242523786 },
          status: 'yellow',
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
let mouseWithinTooltip = false;
let mouseWithinMarker = false;
const MOUSEOUT_TIMER_DELAY_MS = 50;

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

const CNG_TooltipTemplate = _.template(`
  <div class="tooltip" >
    <a href="node-summary?ip=<%= ip_address %>" >
      <div class="tooltip__head--cloud" >
        <img class="tooltip__headIcon--cloud" src="http://via.placeholder.com/32x20" />
        [Cloud Name]
        <img class="tooltip__X" src="img/icons/close-popup-icon.svg" />
      </div>
      <div class="tooltip__row--dark" >
        <div class="tooltip__col" > Status </div>
        <div class="tooltip__col" >
          <div class="statusDot--<%= nodeStatusClass %>"></div>
          <%= status %>
        </div>
      </div>
      <% _.each([
        ['Location', location],
        ['IP Address', ip_address],
        ['Clients', num_clients],
        ['Field4', 'Field4'],
        ['Field5', 'Field5']
      ], function( item, index ) { %>
        <div class="tooltip__row--<%= index % 2 ? 'dark' : 'light' %>" >
          <div class="tooltip__col" > <%= item[0] %> </div>
          <div class="tooltip__col" > <%= item[1] %> </div>
        </div>
      <% }) %>
    </a>
  </div>
`);

const CCW_TooltipTemplate = _.template(`
  <div class="tooltip" >
    <a href="node-summary?ip=<%= ip_address %>" >
      <div class="tooltip__head--branch" >
        <img class="tooltip__headIcon--branch" src="http://via.placeholder.com/21x25" />
        [Branch Name]
        <img class="tooltip__X" src="img/icons/close-popup-icon.svg" />
      </div>
      <div class="tooltip__row--dark" >
        <div class="tooltip__col" > Status </div>
        <div class="tooltip__col" >
          <div class="statusDot--<%= nodeStatusClass %>"></div>
          <%= status %>
        </div>
      </div>
      <% _.each([
        ['Location', location],
        ['IP Address', ip_address],
        ['Clients', num_clients],
        ['Field4', 'Field4'],
        ['Field5', 'Field5'],
        ['Field6', 'Field6'],
        ['Field7', 'Field7']
      ], function( item, index ) { %>
        <div class="tooltip__row--<%= index % 2 ? 'dark' : 'light' %>" >
          <div class="tooltip__col" > <%= item[0] %> </div>
          <div class="tooltip__col" > <%= item[1] %> </div>
        </div>
      <% }) %>
    </a>
  </div>
`);

const clusterToolTipTemplate = _.template(`
  <div class="clusterTooltip" >
    <a href="node-summary?ip=<%= nodes[0].ip_address %>" >
      <div class="tooltip__head--branch" >
        <img class="tooltip__headIcon--branch" src="http://via.placeholder.com/21x25" />
        <%= nodes.length %> Branches
      </div>
      <div class="clusterTooltip__tableHead" >
        <div class="clusterTooltip__tableRow--darker" >
          <div class="clusterTooltip__tableColumn--1" > Name </div>
          <div class="clusterTooltip__tableColumn--2" > Alarm Status </div>
          <div class="clusterTooltip__tableColumn--3" > Number of Links Connected </div>
          <div class="clusterTooltip__tableColumn--4" > Total Line Utilization </div>
        </div>
      </div>
      <div class="tooltip__tableContent" >
        <% _.each(nodes, function(node, index){ %>
          <div class="clusterTooltip__tableRow--<%= index % 2 ? 'dark' : 'light' %>" >
            <div class="clusterTooltip__tableColumn--1" > <%= node.location %> </div>
            <div class="clusterTooltip__tableColumn--2" >
              <div class="statusDot--<%= node.nodeStatusClass %>"></div>
              <%= node.status %>
            </div>
            <div class="clusterTooltip__tableColumn--3" > 13 </div>
            <div class="clusterTooltip__tableColumn--4" > 27 </div>
          </div>
        <% }) %>
      </div>
    </a>
  </div>
`);

function hideToolTip() {
  // debugger;
  if ( infoBox ) {
    infoBox.close();
    infoBox = null;
  }
}

function showClusterToolTip( cluster ) {
  nodes = cluster.getMarkers().map(( marker ) => marker.node);

  nodes.forEach((node) => {
    if ( node.status === 'green' ) node.nodeStatusClass = 'green';
    if ( node.status === 'yellow' ) node.nodeStatusClass = 'yellow';
    if ( node.status === 'red' ) node.nodeStatusClass = 'red';
  });

  // close existing tooltip
  if ( infoBox ) {
    infoBox.close();
  }
  const toolTipHtml = clusterToolTipTemplate({
    nodes: nodes,
  });
  const boxText = document.createElement('div');
  boxText.style.cssText = 'margin-top: 0px; background: #fff; padding: 0px;';
  boxText.innerHTML = toolTipHtml;
  ibOptions.content = boxText;


  // close existing tooltip
  if ( infoBox ) {
    infoBox.close();
  }
  // create and show new tooltip
  infoBox = new window.InfoBox(ibOptions);
  infoBox.setPosition(
    new window.google.maps.LatLng(nodes[0].coords.lat, nodes[0].coords.lng)
  );
  infoBox.open(window.googleMap);

  const tooltipDOM = boxText.querySelector('.clusterTooltip');
  tooltipDOM.addEventListener('mouseover', () => {
    mouseWithinTooltip = true;
  });
  tooltipDOM.addEventListener('mouseleave', function () {
    mouseWithinTooltip = false;
    setTimeout(() => {
      if ( mouseWithinMarker ) {
        return;
      }
      hideToolTip();
    }, MOUSEOUT_TIMER_DELAY_MS);
  });
  return true;
}

function showMarkerToolTip( node ) {
  const toolTipTemplate = ( node.type === NODE_TYPE_CNG
    ? CNG_TooltipTemplate
    : node.type === NODE_TYPE_CCW
      ? CCW_TooltipTemplate
      : null
  );
  // Get classname from status
  // TODO: Replace with real APi values
  if ( node.status === 'green' ) node.nodeStatusClass = 'green';
  if ( node.status === 'yellow' ) node.nodeStatusClass = 'yellow';
  if ( node.status === 'red' ) node.nodeStatusClass = 'red';

  const toolTipHtml = toolTipTemplate( node );

  const boxText = document.createElement('div');
  boxText.style.cssText = 'margin-top: 0px; background: #fff; padding: 0px;';
  boxText.innerHTML = toolTipHtml;
  ibOptions.content = boxText;

  // close existing tooltip
  if ( infoBox ) {
    infoBox.close();
  }
  // create and show new tooltip
  infoBox = new window.InfoBox(ibOptions);
  infoBox.open(window.googleMap, node.marker);

  const tooltipDOM = boxText.querySelector('.tooltip');
  const tooltipX = boxText.querySelector('.tooltip__X');

  tooltipX.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    hideToolTip();
  });

  tooltipDOM.addEventListener('mouseover', () => {
    mouseWithinTooltip = true;
  });
  tooltipDOM.addEventListener('mouseleave', function () {
    mouseWithinTooltip = false;
    setTimeout(() => {
      if ( mouseWithinMarker ) {
        return;
      }
      hideToolTip();
    }, MOUSEOUT_TIMER_DELAY_MS);
  });
}

function toggleToolTip( node ) {
  infoBox ? hideToolTip() : showMarkerToolTip( node );
}

function addNode( node ) {
  const coords = node.coords;
  // create marker
  const marker = new window.google.maps.Marker({
    position: {
      lat: coords.lat,
      lng: coords.lng,
    },
    map: window.googleMap,
    icon: {
      url: mapNodeToIcon( node.type, node.status ),
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
  if ( node.type === NODE_TYPE_HQ ) return marker;

  // add tooltip event listeners
  marker.addListener('click', () => {
    if ( mouseWithinMarker ) {
      window.location.href = `node-summary?ip=${node.ip_address}`;
      return;
    }
    toggleToolTip( node );
  });
  marker.addListener('mouseover', () => {
    mouseWithinMarker = true;
    showMarkerToolTip( node );
  });
  marker.addListener('mouseout', () => {
    mouseWithinMarker = false;
    setTimeout(() => {
      if ( mouseWithinTooltip || mouseWithinMarker ) {
        mouseWithinTooltip = false;
        return;
      }
      hideToolTip();
    }, MOUSEOUT_TIMER_DELAY_MS);
  });
  return marker;
}

function addNodes() {
  createGoogleMap();
  const markers = nodes.map(( node, index ) => {
    return addNode(node, index);
  });

  // Only cluster CCW nodes
  const CCWMarkers = markers.filter(( marker ) => {
    return ( marker.node.type === NODE_TYPE_CCW );
  });

  // setup cluster
  const markerCluster = new window.MarkerClusterer(window.googleMap, CCWMarkers, {
    clusterClass: 'markerCluster',
    styles: [ {
      url: GROUP_CIRCLE,
      width: 60,
      height: 60,
      textColor: '#515151',
      textSize: 30
    } ]
  });

  window.google.maps.event.addListener(markerCluster, 'click', function () {
    hideToolTip();
  });
  window.google.maps.event.addListener(markerCluster, 'mouseover', function (cluster) {
    mouseWithinMarker = true;
    showClusterToolTip(cluster);
  });
  window.google.maps.event.addListener(markerCluster, 'mouseout', function () {
    mouseWithinMarker = false;
    setTimeout(() => {
      if ( mouseWithinTooltip || mouseWithinMarker ) {
        mouseWithinTooltip = false;
        return;
      }
      hideToolTip();
    }, MOUSEOUT_TIMER_DELAY_MS);
  });
}


/**
 * entry point
 */
const domLoadedPromise = new window.Promise( (resolve) => {
  window.google.maps.event.addDomListener(window, 'load', resolve);
});

const loadDataPromise = mockLoadData();

window.Promise.all([ loadDataPromise, domLoadedPromise ])
  .then(addNodes);
