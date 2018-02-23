/**
 * config, constants
 */
const GOOGLE_MAPS_API_KEY = 'AIzaSyCuQdzHfDq_NrjkpiUk7mXGFJ3NxDLretY';

const ICON_GREEN_BRANCH = 'img/icons/green_branch.png';
const ICON_YELLOW_BRANCH = 'img/icons/yellow_branch.png';
const ICON_RED_BRANCH = 'img/icons/red_branch.png';

const ICON_GREEN_CLOUD = 'img/icons/green_cloud.png';
const ICON_YELLOW_CLOUD = 'img/icons/yellow_cloud.png';
const ICON_RED_CLOUD = 'img/icons/red_cloud.png';

const getMapControlOptions = function(){
  return {
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
  };
};

/**
 * global variables
 */
window.googleMap = null;
const mapRegionDOM = document.querySelector('#mapRegion');
let infoBox = null;
let points = null;

function mockLoadData() {
  return new Promise(( resolve ) => {
    setTimeout(() => {
      points = [
        { lat: 37.47360064083576, lng: -122.25839401562502 },
        { lat: 37.45288986053689, lng: -122.17736984570314 },
        { lat: 37.5084689856724, lng: -122.19522262890627 },
        { lat: 37.47360064083576, lng: -122.25839401562502 },
        { lat: 37.51173705842232, lng: -121.97137619335939 },
        { lat: 37.56944941254819, lng: -121.92605758984377 },
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
    mapTypeId: 'roadmap',
    ...getMapControlOptions(),
  });
}

function setupEvents() {
  this.googleMap.addListener('click', (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();
    console.log(`clicked map at ${clickedLat} ${clickedLng} `);
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
    <div class="tooltip__cta" > View Details </div>
  </div>
`);

function addPoint( point, index ) {
  // create marker
  const marker = new google.maps.Marker({
    position: {
      lat: point.lat,
      lng: point.lng,
    },
    map: window.googleMap,
    icon: {
      url: ICON_GREEN_CLOUD,
      // This marker is 20 pixels wide by 32 pixels high.
      scaledSize: new google.maps.Size(40, 40),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(20, 20)
    },
  });

  // create infoBox
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

  function onMarkerClick() {
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

    if ( infoBox ) {
      infoBox.close();
    }
    infoBox = new InfoBox(ibOptions);
    infoBox.open(window.googleMap, marker);
  }

  if ( index === 0 ) onMarkerClick();

  marker.addListener('click', onMarkerClick);
}

function addPoints() {
  points.forEach(addPoint);
}

/**
 * entry point
 */
const loadDataPromise = mockLoadData();
createGoogleMap();
setupEvents();
loadDataPromise.then(() => {
  addPoints();
});
