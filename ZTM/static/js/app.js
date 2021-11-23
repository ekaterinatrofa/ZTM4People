'use strict';

const linesNight = ['N1','N2','N3','N4','N5','N6','N8','N9','N11','N12','N13'];
const linesTram = [2,3,4,5,6,7,8,9,12,10];
const config = {
  apiUrl: 'https://ckan2.multimediagdansk.pl/gpsPositions'
};

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

//L.marker([ 54.34695189156658,  18.645172119140625], {icon:busIcon}).addTo(map).bindPopup(" I am bus");

//L.marker([ 54.32873744330398,  18.628692626953125], {icon:tramIcon}).addTo(map).bindPopup(" I am tram");

/*let popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);*/


let updateMap = function(gpsData) {

  markersGroup.clearLayers();

  for (let i=0; i < gpsData['Vehicles'].length; i++) {

    let vehicle = gpsData['Vehicles'][i];
    let marker = L.marker([vehicle['Lat'], vehicle['Lon']], { icon: busIcon });
    let tooltipOffset = [0, 0];

    /* Set black marker if night lines exist. */
    for (let i=0; i < linesNight.length; i++) {

      let line = linesNight[i];

      if (line === vehicle['Line']) {
        marker = L.marker([vehicle['Lat'], vehicle['Lon']]);
        tooltipOffset = [0, -28];
        break;
      }
    };

    /* Set red marker if tram lines exist. */
    for (let i=0; i < linesTram.length; i++) {

      let line = linesTram[i];

      if (line === parseInt(vehicle['Line'])) {

        marker = L.marker([vehicle['Lat'], vehicle['Lon']], { icon: tramIcon });
        tooltipOffset = [0, -28];
        break;
      }
    };

    /* Add line number label. */
    marker.bindTooltip(vehicle['Line'], {
      direction: 'top',
      permanent: true,
      offset: tooltipOffset
    });


      marker.bindPopup(String(vehicle['Delay']));




    marker.addTo(markersGroup);
  };

  markersGroup.addTo(map);
};


function getGpsData() {

  let data = null;
  let req = new XMLHttpRequest();

  req.open('GET', `${ config.apiUrl }`);
  req.send(null);
  req.onload = function() {
    if (req.status === 200) {
      data = JSON.parse(req.response);
      updateMap(data);
     // updateUI(data);
    }
  }
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


window.setInterval(getGpsData, 5000);
getGpsData();