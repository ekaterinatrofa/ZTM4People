'use strict';

const config = {
  gpsPosAPI: 'https://ckan2.multimediagdansk.pl/gpsPositions',
  routesAPI: 'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/b15bb11c-7e06-4685-964e-3db7775f912f/download/trips.json',
  linesAPI: 'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/22313c56-5acf-41c7-a5fd-dc5dc72b3851/download/routes.json',
  messagesAPI: 'https://ckan2.multimediagdansk.pl/displayMessages',
  gpsInterval: 20000, //get GPS positions every 20 seconds
  messagesInterval: 5 * 60 * 1000 //none specified by API - fetch messages every 5 minutes
};

let APIdata = {
  gpsPos_array: null,
  lines_array: null,
  routes_array: null,
  messages_array: null,
  lastUpdateData: null,
  chosenLine: "none",
  chosenVehicleType: "none"
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
  accessToken: 'pk.eyJ1IjoiZWthdGVyaW5hdHJvZmEiLCJhIjoiY2t3MWEyempsMWp0ajJvcWl1OHR3b3F2cyJ9.-WBm6QG9x_C2TEkiBj2lQw'
}).addTo(map);

var greenBusIcon = L.icon({
  iconUrl: 'images/green_bus_icon.svg',
  iconSize: [50, 50], // size of the icon
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
  popupAnchor: [1, -34] // point from which the popup should open relative to the iconAnchor
});

var greenTramIcon = L.icon({
  iconUrl: 'images/green_tram_icon.svg',
  iconSize: [45, 50], // size of the icon
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
  popupAnchor: [1, -34] // point from which the popup should open relative to the iconAnchor
});

var redBusIcon = L.icon({
  iconUrl: 'images/red_bus_icon.svg',
  iconSize: [50, 50], // size of the icon
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
  popupAnchor: [1, -34] // point from which the popup should open relative to the iconAnchor
});

var redTramIcon = L.icon({
  iconUrl: 'images/red_tram_icon.svg',
  iconSize: [45, 50], // size of the icon
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
  popupAnchor: [1, -34] // point from which the popup should open relative to the iconAnchor
});


async function getLastGPSPositions() {
  await fetch(config.gpsPosAPI)
    .then(async response => {
      if (response.ok) {
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
      if (response.ok) {
        let fetchedData = await response.json()
          .then(fetchedData => {
            let currentDate = new Date().toISOString().slice(0, 10);
            APIdata.routes_array = fetchedData[currentDate]['trips'];
          })
      }
    })
};

async function getLines() {
  await fetch(config.linesAPI)
    .then(async response => {
      if (response.ok) {
        let fetchedData = await response.json()
          .then(fetchedData => {
            let currentDate = new Date().toISOString().slice(0, 10);
            APIdata.lines_array = fetchedData[currentDate]['routes'];
          })
      }
    })
};

async function getMessages() {
  await fetch(config.messagesAPI)
    .then(async response => {
      if (response.ok) {
        let fetchedData = await response.json()
          .then(fetchedData => {
            APIdata.messages_array = fetchedData['displaysMsg'];
          })
      }
    })
}


function updateMap() {

  markersGroup.clearLayers();

  for (const singleGPSPos of APIdata.gpsPos_array) {
    let mapKey = singleGPSPos.Line.toString();
    let lineDesc = linesMap.get(mapKey);

    let vehicleThumbnail = greenBusIcon;
    if (APIdata.chosenLine.localeCompare("none") != 0) {
      if (APIdata.chosenLine.localeCompare(lineDesc.routeLongName) != 0) {
        continue;
      }
    }
    if (APIdata.chosenVehicleType.localeCompare("none") != 0) {
      if (APIdata.chosenVehicleType.localeCompare(lineDesc.routeType) != 0) {
        continue;
      }
    }

    let marker = L.marker([singleGPSPos.Lat, singleGPSPos.Lon], { icon: vehicleThumbnail });
    let tooltipOffset = [0, 0];

    if (lineDesc.routeType === "TRAM") {
      vehicleThumbnail = greenTramIcon;

      if (singleGPSPos.Delay > 60) {

        marker = L.marker([singleGPSPos.Lat, singleGPSPos.Lon], { icon: redTramIcon });
        tooltipOffset = [0, -28];
      } else {

        marker = L.marker([singleGPSPos.Lat, singleGPSPos.Lon], { icon: greenTramIcon });
        tooltipOffset = [0, -28];
      }
    } else if (lineDesc.routeType === "BUS") {
      if (singleGPSPos.Delay > 60) {

        marker = L.marker([singleGPSPos.Lat, singleGPSPos.Lon], { icon: redBusIcon });
        tooltipOffset = [0, -28];
      } else {

        marker = L.marker([singleGPSPos.Lat, singleGPSPos.Lon], { icon: greenBusIcon });
        tooltipOffset = [0, -28];
      }
    } else {

      //because there is type "UNKNOWN" except "BUS" and "TRAM"

      if (singleGPSPos.Delay > 60) {

        marker = L.marker([singleGPSPos.Lat, singleGPSPos.Lon], { icon: redBusIcon });
        tooltipOffset = [0, -28];
      } else {

        marker = L.marker([singleGPSPos.Lat, singleGPSPos.Lon], { icon: greenBusIcon });
        tooltipOffset = [0, -28];
      }


    }

    function convertToMinutes(delay) {
      let minutes = (Math.abs(delay) / 60).toFixed(2); // get minutes
      return minutes;
    };
  
    let popUpStr;


    if (singleGPSPos.Delay > 0) {
      popUpStr = "Opóźnienie [min]: " + String(convertToMinutes(singleGPSPos.Delay)) + "<br />Prędkość [km/h]: " + singleGPSPos.Speed + "<br />";
      popUpStr = popUpStr + "Nazwa linii: " + lineDesc.routeLongName;
    } else if (singleGPSPos.Delay < 0) {

      popUpStr = "Opóźnienie [min]: " + String(convertToMinutes(singleGPSPos.Delay)) + "<br />Prędkość [km/h]: " + singleGPSPos.Speed + "<br />";
      popUpStr = popUpStr + "Nazwa linii: " + lineDesc.routeLongName;
    } else {
      popUpStr = "Opóźnienie [min]: " + String(convertToMinutes(singleGPSPos.Delay)) + "<br />Prędkość [km/h]: " + singleGPSPos.Speed + "<br />";
      popUpStr = popUpStr + "Nazwa linii: " + lineDesc.routeLongName;
    }



    // let popUpStr = "Opóźnienie [s]: " + singleGPSPos.Delay + "<br />Prędkość [km/h]: " + singleGPSPos.Speed + "<br />";
    // popUpStr = popUpStr + "Nazwa linii: " + lineDesc.routeLongName;

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

function displaySingleMessage(stopHeaderContent, messageContent1, messageContent2, time) {
  setTimeout(() => {
    document.getElementById("stop_header").innerHTML = stopHeaderContent;
    let messageString = new String(messageContent1 + messageContent2);
    document.getElementById("message_body").innerHTML = messageString;
  }, time)
}

function displayMessages() {
  let messagesNum = APIdata.messages_array.length;
  var interval = config.messagesInterval / messagesNum; // how much time should the delay between two iterations be (in milliseconds)?
  APIdata.messages_array.forEach(function (element, index) {
    setTimeout(function () {
      document.getElementById("stop_header").innerHTML = "Komunikat przystankowy z: " + element.displayName;
      let messageString = new String(element.messagePart1 + element.messagePart2);
      document.getElementById("message_body").innerHTML = messageString;
      document.getElementById("message_bottom").innerHTML = "Wiadomość wysłana o: " + element.configurationDate;
    }, index * interval);
  });
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

function refreshMap() {
  getLastGPSPositions().then(() => {
    updateMap();
  });
}

function updateMessages() {
  getMessages().then(() => {
    displayMessages();
  });
}

function addLinesToDropdown() {
  let dropdown = document.getElementById("lines_filter");
  document.querySelectorAll('#lines_filter option').forEach(option => option.remove());
  let initialOption = document.createElement("option");
  initialOption.text = "Wybierz linię...";
  initialOption.value = "none";
  initialOption.disabled = true;
  initialOption.selected = true;
  dropdown.add(initialOption);
  for (const [key, value] of linesMap.entries()) {
    if (APIdata.chosenVehicleType.localeCompare("none") != 0) {
      if (value.routeType.localeCompare(APIdata.chosenVehicleType) != 0) {
        continue;
      }
    }
    let optionText = key + " " + value.routeLongName;
    let option = document.createElement("option");
    option.text = optionText;
    option.value = value.routeLongName;
    dropdown.add(option);
  }
}

function setChosenLine() {
  APIdata.chosenLine = document.getElementById("lines_filter").value;
  updateMap();
}

function setChosenRouteType() {
  if (APIdata.chosenVehicleType.localeCompare("none") == 0 || APIdata.chosenVehicleType.localeCompare("TRAM") == 0) {
    APIdata.chosenVehicleType = "BUS";
    document.getElementById("vehicle_type").innerHTML = "Wyświetl tylko tramwaje";
  }
  else if (APIdata.chosenVehicleType.localeCompare("BUS") == 0) {
    APIdata.chosenVehicleType = "TRAM";
    document.getElementById("vehicle_type").innerHTML = "Wyświetl tylko autobusy";
  }
  APIdata.chosenLine = "none";
  addLinesToDropdown();
  updateMap();
}

function resetAll() {
  APIdata.chosenLine = "none";
  APIdata.chosenVehicleType = "none";
  document.getElementById("lines_filter").value = "none";
  document.getElementById("vehicle_type").innerHTML = "Wyświetl tylko autobusy";
  addLinesToDropdown();
  updateMap();
}

window.onload = function () {
  getRoutes().then(() => {
    getLines().then(() => {
      for (const line of APIdata.lines_array) {
        let lineDesc = {
          routeLongName: line.routeLongName,
          routeType: line.routeType
        };
        linesMap.set(line.routeShortName.toString(), lineDesc);
      }
      addLinesToDropdown();
      getLastGPSPositions().then(() => {
        updateMap();
      });
    });
  });
};

refreshMap();
updateMessages();
setInterval(refreshMap, config.gpsInterval);
setInterval(updateMessages, config.messagesInterval);

