// config
const GOOGLE_MAPS_API_KEY = 'AIzaSyCuQdzHfDq_NrjkpiUk7mXGFJ3NxDLretY';

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

// globals
window.googleMap = null;
const mapRegionDOM = document.querySelector('#mapRegion');
const points = [
  { lat: 37.47360064083576, lng: -122.25839401562502 },
  { lat: 37.45288986053689, lng: -122.17736984570314 },
  { lat: 37.5084689856724, lng: -122.19522262890627 },
  { lat: 37.47360064083576, lng: -122.25839401562502 },
  { lat: 37.51173705842232, lng: -121.97137619335939 },
  { lat: 37.56944941254819, lng: -121.92605758984377 },
];
const lines = [
  [ points[0], points[1] ],
];

function loadGoogleMapsScript() {
  return new Promise((resolve) => {
    window.initMap = resolve;
    Util.appendScriptToHead(`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`);
  });
}

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

function addPoint( point ) {
  const marker = new google.maps.Marker({
    position: {
      lat: point.lat,
      lng: point.lng,
    },
    map: window.googleMap,
    // icon: saved ? ICON_PATH : GREYED_ICON_PATH,
  });
}

function addPoints() {
  points.forEach(addPoint);
}

function addLine( line ) {
  const polyLine = new google.maps.Polyline({
    path: line,
    geodesic: true,
    strokeColor: '#000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });
  polyLine.setMap(window.googleMap);
}

function addLines() {
  lines.forEach(addLine);
}

// entry point
loadGoogleMapsScript()
  .then(() => {
    createGoogleMap();
    setupEvents();
    addPoints();
    addLines();
  });

