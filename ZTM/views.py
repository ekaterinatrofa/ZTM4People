from django.shortcuts import render
import requests
import json

def index(request):
    routesDict=requests.get('https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/b15bb11c-7e06-4685-964e-3db7775f912f/download/trips.json').json()
    firstIndexData = next(iter(routesDict))
    routesRaw = routesDict[firstIndexData]["trips"]
    routes = json.dumps(routesRaw)

    linesDict=requests.get('https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/22313c56-5acf-41c7-a5fd-dc5dc72b3851/download/routes.json').json()
    firstIndexData = next(iter(linesDict))
    linesRaw = linesDict[firstIndexData]["routes"]
    lines = json.dumps(linesRaw)

    GPSposRaw=requests.get('https://ckan2.multimediagdansk.pl/gpsPositions').json()["Vehicles"]
    GPSpos = json.dumps(GPSposRaw)

    context = {
        "GPSpos" : GPSpos,
        "routes" : routes,
        "lines": lines
    }

    return render(request, "pages/index.html", context)