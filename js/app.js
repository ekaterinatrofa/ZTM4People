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

let linesMap = new Map();

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

async function getLastGPSPositions() {
  await fetch(config.gpsPosAPI)
  .then(async response => {
    if(response.ok)
    {
      let fetchedData = await response.json()
      .then(fetchedData => {
        APIdata.gpsPos_array = fetchedData['Vehicles'];
        APIdata.lastUpdateData = fetchedData['LastUpdateData'];
      })
    }
  })
};

async function getRoutes() {
  await fetch(config.routesAPI)
  .then(async response => {
    if(response.ok)
    {
      let fetchedData = await response.json()
      .then(fetchedData => {
        let currentDate = new Date().toISOString().slice(0,10);
        APIdata.routes_array = fetchedData[currentDate]['trips'];
      })
    }
  })
};

async function getLines() {
  await fetch(config.linesAPI)
  .then(async response => {
    if(response.ok)
    {
      let fetchedData = await response.json()
      .then(fetchedData => {
        let currentDate = new Date().toISOString().slice(0,10);
        APIdata.lines_array = fetchedData[currentDate]['routes'];
      })
    }
  })
};


function updateMap() {

  markersGroup.clearLayers();

  for (const singleGPSPos of APIdata.gpsPos_array) {
    let mapKey = singleGPSPos.Line.toString();
    let lineDesc = linesMap.get(mapKey);
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
}

function toggleFront() {

  let front = document.querySelector('.Front');
  let className = 'Front-hidden';

  front.classList.contains(className)
    ? front.classList.remove(className)
    : front.classList.add(className);
}

function updateUI(data) {
  document.getElementById('lastUpdate').innerText = data.LastUpdateData;
}

getRoutes();

getLines().then(() => {
  for(const line of APIdata.lines_array)
  {
    let lineDesc = { 
      routeLongName: line.routeLongName,
      routeType:line.routeType 
    };
    linesMap.set(line.routeShortName.toString(), lineDesc);
  }
  getLastGPSPositions().then(() => {
    updateMap();
  });
});

function refreshMap()
{
  getLastGPSPositions().then(() => {
    updateMap();
  });
}

refreshMap();
setInterval(refreshMap, config.gpsInterval);
setInterval(getLines, config.linesInterval);
setInterval(getRoutes, config.routesInterval);