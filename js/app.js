'use strict';

const config = {
  gpsPosAPI: 'https://ckan2.multimediagdansk.pl/gpsPositions',
  routesAPI: 'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/b15bb11c-7e06-4685-964e-3db7775f912f/download/trips.json',
  linesAPI: 'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/22313c56-5acf-41c7-a5fd-dc5dc72b3851/download/routes.json',
  messagesAPI: 'https://ckan2.multimediagdansk.pl/displayMessages',
  gpsInterval: 20000, //get GPS positions every 20 seconds
  messagesInterval: 5 * 60 * 1000 //none specified by API - fetch messages every 5 minutes
};

const icons_config = {
  busIconSize: [50, 50],
  tramIconSize: [45, 50],
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
  popupAnchor: [1, -34] // point from which the popup should open relative to the iconAnchor
}

const icons = {
  greenBusIcon: L.icon({
    iconUrl: 'images/green_bus_icon.svg',
    iconSize: icons_config.busIconSize,
    iconAnchor: icons_config.iconAnchor,
    popupAnchor: icons_config.popupAnchor
  }),
  greenTramIcon: L.icon({
    iconUrl: 'images/green_tram_icon.svg',
    iconSize: icons_config.tramIconSize,
    iconAnchor: icons_config.iconAnchor,
    popupAnchor: icons_config.popupAnchor
  }),
  redBusIcon: L.icon({
    iconUrl: 'images/red_bus_icon.svg',
    iconSize: icons_config.busIconSize,
    iconAnchor: icons_config.iconAnchor,
    popupAnchor: icons_config.popupAnchor
  }),
  redTramIcon: L.icon({
    iconUrl: 'images/red_tram_icon.svg',
    iconSize: icons_config.tramIconSize,
    iconAnchor: icons_config.iconAnchor,
    popupAnchor: icons_config.popupAnchor
  })
}

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

const firstTileLayer = performance.now();
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  maxZoom: 17,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox/streets-v11',
  accessToken: 'pk.eyJ1IjoiZWthdGVyaW5hdHJvZmEiLCJhIjoiY2t3MWEyempsMWp0ajJvcWl1OHR3b3F2cyJ9.-WBm6QG9x_C2TEkiBj2lQw'
}).addTo(map);
const secondTileLayer = performance.now();
console.log("Map loading time (ms): "+(secondTileLayer - firstTileLayer));

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
  const firstGetRoutes = performance.now()
  await fetch(config.routesAPI)
    .then(async response => {
      if (response.ok) {
        let fetchedData = await response.json()
          .then(fetchedData => {
            let currentDate = new Date().toISOString().slice(0, 10);
            APIdata.routes_array = fetchedData[currentDate]['trips'];
            const secondGetRoutes = performance.now();
            console.log("Get routes time(ms): "+(secondGetRoutes - firstGetRoutes))
          })
      }
    })
};

async function getLines() {
  const firstGetLines = performance.now();
  await fetch(config.linesAPI)
    .then(async response => {
      if (response.ok) {
        let fetchedData = await response.json()
          .then(fetchedData => {
            let currentDate = new Date().toISOString().slice(0, 10);
            APIdata.lines_array = fetchedData[currentDate]['routes'];
            const secondGetLines = performance.now();
            console.log("Get lines time(ms): "+(secondGetLines-firstGetLines));
          })
      }
    })
};

async function getMessages() {
  const firstGetMessages = performance.now();
  await fetch(config.messagesAPI)
    .then(async response => {
      if (response.ok) {
        let fetchedData = await response.json()
          .then(fetchedData => {
            APIdata.messages_array = fetchedData['displaysMsg'];
            const secondGetMessages = performance.now();
            console.log("Get messages time(ms): "+(secondGetMessages-firstGetMessages));
          })
      }
    })
}

function getCorrsepondingIcon(vehicleType, delayTime) {
  switch(vehicleType) {
    case("TRAM"):
      if(delayTime > 60) return icons.redTramIcon; return icons.greenTramIcon;
      break;
    case("BUS"):
      if(delayTime > 60) return icons.redBusIcon; return icons.greenBusIcon;
      break;
    default:
      if(delayTime > 60) return icons.redBusIcon; return icons.greenBusIcon;
      break;
  }
}

function updateMap() {
  const firstUpdateMap = performance.now();
  markersGroup.clearLayers();

  for (const singleGPSPos of APIdata.gpsPos_array) {
    let mapKey = singleGPSPos.Line.toString();
    let lineDesc = linesMap.get(mapKey);
<<<<<<< .merge_file_a08328
<<<<<<< HEAD

    let vehicleThumbnail = greenBusIcon;
    if (APIdata.chosenLine.localeCompare("none") != 0) {
      if (APIdata.chosenLine.localeCompare(lineDesc.routeLongName) != 0) {
=======
=======
>>>>>>> .merge_file_a27780
    if(APIdata.chosenLine.localeCompare("none")!=0)
    {
      if(APIdata.chosenLine.localeCompare(lineDesc.routeLongName)!=0)
      {
>>>>>>> d6814828ba31e9582646705274e05192d3dd93c4
        continue;
      }
    }
    if (APIdata.chosenVehicleType.localeCompare("none") != 0) {
      if (APIdata.chosenVehicleType.localeCompare(lineDesc.routeType) != 0) {
        continue;
      }
    }
    let marker = L.marker([singleGPSPos.Lat, singleGPSPos.Lon], { icon: getCorrsepondingIcon(lineDesc.routeType, singleGPSPos.Delay) });
    let tooltipOffset = [0, -28];

    function convertToMinutes(delay) {
      let minutes = (Math.abs(delay) / 60).toFixed(2); // get minutes
      return minutes;
    };
<<<<<<< .merge_file_a08328
<<<<<<< HEAD
  
=======
>>>>>>> d6814828ba31e9582646705274e05192d3dd93c4
=======
>>>>>>> .merge_file_a27780
    let popUpStr;
    (singleGPSPos.Delay >= 0) ? popUpStr = "Opóźnienie [min]: " : popUpStr = "Przyspieszenie [min]: ";
    popUpStr = popUpStr.concat(String(convertToMinutes(singleGPSPos.Delay)) + "<br />Prędkość [km/h]: " + singleGPSPos.Speed + "<br />");
    popUpStr = popUpStr.concat("Nazwa linii: " + lineDesc.routeLongName);

    marker.bindTooltip(String(singleGPSPos.Line), {
      direction: 'top',
      permanent: true,
      offset: tooltipOffset
    });
    marker.bindPopup(String(popUpStr));
    marker.addTo(markersGroup);
  };
  markersGroup.addTo(map);
  const secondUpdateMap = performance.now();
  console.log("Map updating (markers) time(ms): "+(secondUpdateMap-firstUpdateMap))
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
  addLinesToDropdown();
  APIdata.chosenLine = "none";
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

