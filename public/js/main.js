/**
 * config, constants
 */
const GOOGLE_MAPS_API_KEY = 'AIzaSyCuQdzHfDq_NrjkpiUk7mXGFJ3NxDLretY';

const ICON_GREEN_BRANCH = 'img/icons/branch-green.svg';
const ICON_YELLOW_BRANCH = 'img/icons/branch-yellow.svg';
const ICON_RED_BRANCH = 'img/icons/branch-red.svg';

const ICON_GREEN_CLOUD = 'img/icons/cloud-1-green.svg';
const ICON_YELLOW_CLOUD = 'img/icons/cloud-1-yellow.svg';
const ICON_RED_CLOUD = 'img/icons/cloud-1-red.svg';

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
}

const mapOptions = {
  // mapTypeControl: Map / Satellite toggle
  mapTypeControl: false,
  mapTypeControlOptions: {
    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
    position: google.maps.ControlPosition.TOP_CENTER,
  },
  // zoomControl: + / - toggle
  zoomControl: true,
  zoomControlOptions: {
    position: google.maps.ControlPosition.LEFT_BOTTOM,
  },
  // scaleControl: 2KM distance in legend
  scaleControl: false,
  // streetViewControl: enables pegman
  streetViewControl: false,
  streetViewControlOptions: {
    position: google.maps.ControlPosition.LEFT_TOP,
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
  pixelOffset: new google.maps.Size(0, 0),
  zIndex: null,
  boxStyle: {
    padding: '0px 0px 0px 0px',
    width: '200px',
    height: '40px'
  },
  closeBoxURL : '',
  infoBoxClearance: new google.maps.Size(1, 1),
  isHidden: false,
  pane: 'floatPane',
  enableEventPropagation: false
};

let points = null;
let nodes = null;
let HQ_point = null;
const mockData = {
  location: 'Turlock',
  ip_address: '195.168.103',
  num_client: 7,
};
function mockLoadData() {
  return new Promise(( resolve ) => {
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
    }, 100)
  });
}

/**
 * map rendering functions
 */
function createGoogleMap() {
  window.googleMap = new google.maps.Map(mapRegionDOM, {
    center: {
      lat: 37.46787055967662,
      lng: -122.04780556144539,
    },
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    ...mapOptions,
  });
}

const toolTipTemplate = _.template(`
  <div class="tooltip" >
    <div class="tooltip__content" >
      <div class="tooltip__head" > Branch Name </div>
      <div class="tooltip__row" >
        <div class="tooltip__col" > Location </div>
        <div class="tooltip__col" > <%= location %> </div>
      </div>
      <div class="tooltip__row" >
        <div class="tooltip__col" > Status </div>
        <div class="tooltip__col tooltip__status" > <%= status %> </div>
      </div>
      <div class="tooltip__row" >
        <div class="tooltip__col" > IP Address </div>
        <div class="tooltip__col" > <%= ip_address %> </div>
      </div>
      <div class="tooltip__row" >
        <div class="tooltip__col" > Clients </div>
        <div class="tooltip__col" > <%= num_client %> </div>
      </div>
    </div>
    <a href="node-summary.html?ip=<%= ip_address %>" >
      <div class="tooltip__cta" > View Details </div>
    </a>
  </div>
`);

const MOUSEOVER_DISABLED_MS = 50;
let mouseWithinTooltip = false;
let mouseWithinMarker = false;
const MOUSEOUT_TIMER_MS = 50;

function hideToolTip() {
  if ( infoBox ) {
    infoBox.close();
    infoBox = null;
  }
}

function showToolTip( node ) {
  // Render box content
  const toolTipHtml = toolTipTemplate({
    location: node.location,
    ip_address: node.ip_address,
    num_client: node.num_clients,
  });
  const boxText = document.createElement('div');
  boxText.style.cssText = "margin-top: 0px; background: #fff; padding: 0px;";
  boxText.innerHTML = toolTipHtml;
  ibOptions.content = boxText;
  const tooltipDOM = boxText.querySelector('.tooltip');

  // close existing tooltip
  if ( infoBox ) {
    infoBox.close();
  }
  // create and show new tooltip
  infoBox = new InfoBox(ibOptions);
  infoBox.open(window.googleMap, node.marker);

  tooltipDOM.addEventListener('mouseover', () => {
    mouseWithinTooltip = true;
  });
  tooltipDOM.addEventListener('mouseleave', function( event ) {
    mouseWithinTooltip = false;
    setTimeout(() => {
      if ( mouseWithinMarker ) {
        return;
      }
      hideToolTip();
    }, MOUSEOUT_TIMER_MS);
  });
}

function toggleToolTip( node ) {
  infoBox ? hideToolTip() : showToolTip( node );
}

function addNode( node, index ) {
  const coords = node.coords;
  // create marker
  const marker = new google.maps.Marker({
    position: {
      lat: coords.lat,
      lng: coords.lng,
    },
    map: window.googleMap,
    icon: {
      url: mapNodeToIcon( node.type, node.status ),
      // ( width, height )
      scaledSize: new google.maps.Size(40, 40),
      // ( originX, originY )
      origin: new google.maps.Point(0, 0),
      // Image anchor
      anchor: new google.maps.Point(20, 20)
    },
  });
  node.marker = marker;
  // don't show tooltip for HQ
  if ( node.type === NODE_TYPE_HQ ) return marker;

  // add tooltip event listeners
  marker.addListener('click', () => {
    if ( mouseWithinMarker ) {
      window.location.href = `node-summary.html?ip=${node.ip_address}`;
      return;
    }
    toggleToolTip( node );
  });
  marker.addListener('mouseover', () => {
    console.log('marker mouseover');
    mouseWithinMarker = true;
    showToolTip( node );
  });
  marker.addListener('mouseout', () => {
    mouseWithinMarker = false;
    setTimeout(() => {
      if ( mouseWithinTooltip ) {
        mouseWithinTooltip = false;
        return;
      }
      hideToolTip();
    }, MOUSEOUT_TIMER_MS);
  });
  return marker;
}

function addNodes() {
  const markers = nodes.map(( node, index ) => {
    return addNode(node, index);
  });
  // setup cluster
  const markerCluster = new MarkerClusterer(window.googleMap, markers);
}

function setupEvents() {
  this.googleMap.addListener('click', (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();
    console.log(`clicked map at ${clickedLat} ${clickedLng} `);
    hideToolTip();
  });
}

/**
 * entry point
 */
const loadDataPromise = mockLoadData();
createGoogleMap();
setupEvents();
loadDataPromise.then(addNodes);
