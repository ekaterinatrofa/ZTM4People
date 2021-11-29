'use strict';

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

updateMap();