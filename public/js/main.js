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

const ICON_BLUE_HOME = 'img/icons/hq-3.svg';

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
  pixelOffset: new google.maps.Size(-100, 29),
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
let HQ_point = null;
function mockLoadData() {
  return new Promise(( resolve ) => {
    setTimeout(() => {
      HQ_point = {
        lat: 37.3691261,
        lng: -121.919605
      };

      points = [
        { lat: 37.47360064083576, lng: -122.25839401562502 },
        { lat: 37.45288986053689, lng: -122.17736984570314 },
        { lat: 37.5084689856724, lng: -122.19522262890627 },
        { lat: 37.51173705842232, lng: -121.97137619335939 },
        { lat: 37.56944941254819, lng: -121.92605758984377 },
        { lat: 37.72031641754861, lng: -122.43285251296783 },
        { lat: 37.76266931206604, lng: -122.43422580398345 },
        { lat: 37.75289771812296, lng: -122.49053073562408 },
        { lat: 37.66598239336537, lng: -122.51113010085845 },
        { lat: 37.6627210859622, lng: -122.44658542312408 },
        { lat: 37.68989426898018, lng: -122.36693454421783 },
        { lat: 37.47253816730712, lng: -122.19906650971052 },
        { lat: 37.47771503954888, lng: -122.14997135590193 },
        { lat: 37.43492696738677, lng: -122.22344242523786 }
        // { lat: '', lng: '' }
      ];
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
    <a href="#" >
      <div class="tooltip__cta" > View Details </div>
    </a>
  </div>
`);

const MOUSEOVER_DISABLED_MS = 200;
let disableMouseOver = false;

function hideToolTip() {
  disableMouseOver = true;
  setTimeout(() => {
    disableMouseOver = false;
  }, MOUSEOVER_DISABLED_MS);
  if ( infoBox ) {
    infoBox.close();
    infoBox = null;
  }
}

function showToolTip( marker ) {
  // Render box content
  const toolTipHtml = toolTipTemplate({
    location: 'Turlock',
    status: 'Up',
    ip_address: '195.168.103',
    num_client: 7,
  });
  const boxText = document.createElement('div');
  boxText.style.cssText = "margin-top: 0px; background: #fff; padding: 0px;";
  boxText.innerHTML = toolTipHtml;
  ibOptions.content = boxText;

  // close existing tooltip
  if ( infoBox ) {
    infoBox.close();
  }
  // create and show new tooltip
  infoBox = new InfoBox(ibOptions);
  infoBox.open(window.googleMap, marker);
  google.maps.event.addDomListener( boxText, 'click', () => {
    hideToolTip(infoBox);
  });
}

function toggleToolTip( marker ) {
  infoBox ? hideToolTip() : showToolTip( marker );
}

function addPoint( point, index, isHQ ) {
  // create marker
  const marker = new google.maps.Marker({
    position: {
      lat: point.lat,
      lng: point.lng,
    },
    map: window.googleMap,
    icon: {
      url: isHQ ? ICON_BLUE_HOME : ICON_GREEN_CLOUD,
      // This marker is 20 pixels wide by 32 pixels high.
      scaledSize: new google.maps.Size(40, 40),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(20, 20)
    },
  });
  // don't show tooltip for HQ
  if ( isHQ ) return marker;

  // add tooltip event listeners
  marker.addListener('click', () => {
    toggleToolTip( marker );
  });
  marker.addListener('mouseover', () => {
    if ( disableMouseOver ) return;
    showToolTip( marker );
  });
  return marker;
}

function addPoints() {
  addPoint( HQ_point, null, true );
  const markers = points.map(( point, index ) => {
    return addPoint(point, index);
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
loadDataPromise.then(addPoints);
