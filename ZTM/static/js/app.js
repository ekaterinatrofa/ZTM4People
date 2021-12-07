'use strict';

const config = {
  gpsPosAPI: 'https://ckan2.multimediagdansk.pl/gpsPositions',
  routesAPI: 'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/b15bb11c-7e06-4685-964e-3db7775f912f/download/trips.json',
  linesAPI: 'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/22313c56-5acf-41c7-a5fd-dc5dc72b3851/download/routes.json',
  gpsInterval: 20000,
  routesInterval: 1000 * 60 * 60 * 24,
  linesInterval: 1000 * 60 * 60 * 24
};

let APIdata = {
  gpsPos_array: null,
  lines_array: null,
  routes_array: null,
  lastUpdateData: null
}

function getLastGPSPositions() {
  let reqGPS = new XMLHttpRequest();
  let fetchedData = null;
  reqGPS.open('GET', `${ config.gpsPosAPI }`);
  reqGPS.send(null);
  reqGPS.onload = function() {
    if (reqGPS.status === 200) {
      fetchedData = JSON.parse(reqGPS.response);
      APIdata.gpsPos_array = fetchedData['Vehicles'];
      APIdata.lastUpdateData = fetchedData['LastUpdateData'];
    }
  }
};

function getRoutes() {
  let reqRoutes = new XMLHttpRequest();
  let fetchedData = null;
  reqRoutes.open('GET', `${ config.routesAPI }`);
  reqRoutes.send(null);
  reqRoutes.onload = function() {
    if (reqRoutes.status === 200) {
      fetchedData = JSON.parse(reqRoutes.response);
      APIdata.routes_array = fetchedData;
    }
  }
};

function getLines() {
  let reqLines = new XMLHttpRequest();
  let fetchedData = null;
  reqLines.open('GET', `${ config.linesAPI }`);
  reqLines.send(null);
  reqLines.onload = function() {
    if (reqLines.status === 200) {
      fetchedData = JSON.parse(reqLines.response);
      APIdata.lines_array = fetchedData;
    }
  }
};

let linesMap = new Map();
for(const line of lines_array)
{
  let lineDesc = { routeLongName:line.routeLongName, routeType:line.routeType };
  linesMap.set(line.routeShortName, lineDesc);
}

let markersGroup = L.layerGroup();
let map = L.map('map', {
  center: [54.372158, 18.638306],
  zoom: 13,
  zoomControl: false
});

let controls = L.control.zoom({
  position: 'bottomright'
});

controls.addTo(map);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  maxZoom: 17,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox/streets-v11',
  accessToken:'pk.eyJ1IjoiZWthdGVyaW5hdHJvZmEiLCJhIjoiY2t3MWEyempsMWp0ajJvcWl1OHR3b3F2cyJ9.-WBm6QG9x_C2TEkiBj2lQw'
}).addTo(map);

var busIcon = L.icon({
    iconUrl: 'https://visualpharm.com/assets/845/Bus-595b40b75ba036ed117d73c1.svg',
    iconSize:     [35, 55], // size of the icon
    iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor:  [1, -34] // point from which the popup should open relative to the iconAnchor
});

var tramIcon = L.icon({
    iconUrl: 'https://visualpharm.com/assets/7/Tram-595b40b75ba036ed117d77b2.svg',
    iconSize:     [35, 55], // size of the icon
    iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor:  [1, -34] // point from which the popup should open relative to the iconAnchor
});

let updateMap = function() {

  markersGroup.clearLayers();

  for (const singleGPSPos of gpsPos_array) {
    let lineDesc = linesMap.get(singleGPSPos.Line);
    let vehicleThumbnail = busIcon;
    if(lineDesc.routeType==="TRAM")
    {
      vehicleThumbnail = tramIcon;
    }
    let marker = L.marker([singleGPSPos.Lat, singleGPSPos.Lon], { icon: vehicleThumbnail });
    let tooltipOffset = [0, 0];

    let popUpStr = "Opóźnienie [s]: " + singleGPSPos.Delay +"<br />Prędkość [km/h]: " + singleGPSPos.Speed +"<br />";
    popUpStr = popUpStr + "Nazwa linii: " + lineDesc.routeLongName;

    marker.bindTooltip(String(singleGPSPos.Line), {
      direction: 'top',
      permanent: true,
      offset: tooltipOffset
    });
    marker.bindPopup(String(popUpStr));
    marker.addTo(markersGroup);
  };
  markersGroup.addTo(map);
};

function toggleFront() {

  let front = document.querySelector('.Front');
  let className = 'Front-hidden';

  front.classList.contains(className)
    ? front.classList.remove(className)
    : front.classList.add(className);
};

function updateUI(data) {
  document.getElementById('lastUpdate').innerText = data.LastUpdateData;
}

getLastGPSPositions();
setInterval(getLastGPSPositions, config.gpsInterval);
getLines();
setInterval(getLines, config.linesInterval);
getRoutes();
setInterval(getRoutes, config.routesInterval);
updateMap();