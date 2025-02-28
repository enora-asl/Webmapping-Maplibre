// AccesToken

mapboxgl.accessToken = 'pk.eyJ1IjoiZW5vcmFhdXNzZWlsIiwiYSI6ImNtNzM2MWx0OTA1aGcya3M5Znc4dzdmNDYifQ.19q-so6ybesRMH3dXkPmpg';

// Configuration de la carte
var map = new maplibregl.Map({
container: 'map',
style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', // Fond de carte
center: [-1.68, 48.11], // lat/long
zoom: 12, // zoom
pitch: 30, // Inclinaison
bearing: -10 // Rotation
});

// Gestion du changement de style
document.getElementById('style-selector').addEventListener('change', function () {
    map.setStyle(this.value);
    map.once('style.load', addLayers); // Recharge les couches après changement de style
  });

// Boutons de navigation
var nav = new maplibregl.NavigationControl();
map.addControl(nav, 'top-right');

// Ajout Echelle cartographique
map.addControl(new maplibregl.ScaleControl({
maxWidth: 120,
unit: 'metric'}));

// Bouton de géolocalisation

map.addControl(new maplibregl.GeolocateControl
({positionOptions: {enableHighAccuracy: true},
trackUserLocation: true,
showUserHeading: true}));


// AJOUT DE COUCHE

function addLayers() {
  
    // Ajout de la source
    map.addSource('mapbox-streets-v8', {
        type: 'vector',
        url: 'https://openmaptiles.geo.data.gouv.fr/data/france-vector.json'
    });

    // Ajout de la couche
    map.addLayer({
        "id": "Routes",
        "type": "line",
        "source": "mapbox-streets-v8",
        "layout": { "visibility": "visible" },
        "source-layer": "transportation",
        "filter": ["all", ["in", "class", "motorway", "trunk", "primary"]],
        "paint": { "line-color": "#A9A9A9", "line-width": 2 },
        "maxzoom": 15.5,
    });
  
  // Hydrologie
  
map.addLayer({
  "id": "hydrologie",
  "type": "fill",
  "source": "mapbox-streets-v8",
  "source-layer": "water",
  'layout': {'visibility': 'visible'},
  "paint": {"fill-color": "#48D1CC", 'fill-opacity' : 0.3}

});
 
// Arret de bus

map.addSource('Arrets', {
type: 'vector',
url: 'mapbox://ninanoun.58widelk'});
map.addLayer({
'id': 'Arrets',
'type': 'symbol',
'source': 'Arrets',
'source-layer': 'Bus-5ypx1k',
'layout': {'visibility': 'none', 'icon-image': 'bus','icon-size': 2},
 minzoom:14
});
 

 // AJOUT DU CADASTRE ETALAB

map.addSource('Cadastre', {
type: 'vector',
url: 'https://openmaptiles.geo.data.gouv.fr/data/cadastre.json' });

map.addLayer({

'id': 'Cadastre',
'type': 'line',
'source': 'Cadastre',
'source-layer': 'parcelles',
'layout': {'visibility': 'none'},
'paint': {'line-color': '#000000'},
'minzoom':16, 'maxzoom':19 });

map.setPaintProperty('communeslimites', 'line-width', ["interpolate",["exponential",1],["zoom"],16,0.3,18,1]);
 
  
// Ajout BDTOPO
map.addSource('BDTOPO', {
type: 'vector',
url: 'https://data.geopf.fr/tms/1.0.0/BDTOPO/metadata.json',
minzoom: 15,
maxzoom: 19
});
map.addLayer({
'id': 'batiments',
'type': 'fill-extrusion',
'source': 'BDTOPO',
'source-layer': 'batiment',
'layout': {'visibility': 'none'},
'paint': {'fill-extrusion-color': {'property': 'hauteur',

'stops': [[1, '#feebe2'],
[10, '#fbb4b9'],
[20, '#f768a1'],
[50, '#c51b8a'],
[100, '#7a0177']]},


'fill-extrusion-height':{'type': 'identity','property': 'hauteur'},
'fill-extrusion-opacity': 0.90,
'fill-extrusion-base': 0}
}); 

  //Ajout de la limite communale de Rennes
dataCadastre = 'https://apicarto.ign.fr/api/cadastre/commune?code_insee=35238';
jQuery.when( jQuery.getJSON(dataCadastre)).done(function(json) {
for (i = 0; i < json.features.length; i++) {
json.features[i].geometry = json.features[i].geometry;
};
map.addLayer(
{'id': 'Contourcommune',
'type':'line',
'source': {'type': 'geojson','data': json},
'paint' : {'line-color': 'grey',
'line-width':2},
'layout': {'visibility': 'none'},
});
});  
 
  // Ajout des zones de type N 
dataPLU = 'https://apicarto.ign.fr/api/gpu/zone-urba?partition=DU_243500139';
jQuery.when(jQuery.getJSON(dataPLU)).done(function(json) {
// Filtrer les entités pour ne garder que celles avec typezone = 'N'
var filteredFeatures = json.features.filter(function(feature)
{return feature.properties.typezone === 'N';});
// Créer un objet GeoJSON avec les entités filtrées
var filteredGeoJSON = { type: 'FeatureCollection', features: filteredFeatures};
map.addLayer({
'id': 'PLU',
'type': 'fill',
'layout': {'visibility': 'none'},
'source': {'type': 'geojson',
'data': filteredGeoJSON},
'paint': {'fill-color': 'green',
'fill-opacity': 0.2},
});
}); 

  // Ajout des parking relais 
$.getJSON('https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/tco-parcsrelais-star-etat-tr/records?limit=20',
function(data) {var geojsonData4 = {
type: 'FeatureCollection',
features: data.results.map(function(element) {
return {type: 'Feature',
geometry: {type: 'Point',
coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
properties: { name: element.nom,
capacity: element.jrdinfosoliste}};

})
};
map.addLayer({ 'id': 'Parcs_relais',

'type':'circle',
'layout': {'visibility': 'visible'},
'source': {'type': 'geojson',
'data': geojsonData4},
'paint': {'circle-color': '#FF8C00',
          'circle-radius': {property: 'capacity',
          type: 'exponential',
          stops: [[10, 5],[1000, 50]]},
          'circle-opacity': 0.8,
          'circle-stroke-width' : 2,
          'circle-stroke-color' : "#e67e22"}
});
});  

 // Ajout des stations vélos STAR  
$.getJSON('https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/vls-stations-etat-tr/records?limit=60',
function(data) {var geojsonVLS = {
type: 'FeatureCollection',
features: data.results.map(function(element) {
return {type: 'Feature',
geometry: {type: 'Point',
coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
properties: { name: element.nom,
capacity: element.nombreemplacementsdisponibles, velos : element.nombrevelosdisponibles}};

})
};
map.addLayer({ 'id': 'VLS',

'type':'circle',
'layout': {'visibility': 'visible'},
'source': {'type': 'geojson',
'data': geojsonVLS},
'paint': {'circle-color': '#C71585',
          'circle-radius': {property: 'velos',
          type: 'exponential',
          stops: [[5, 4],[80, 40]]},
          'circle-opacity': 0.8}
});
}); 
  
// Ajout de données OSM
  
const ville = "Rennes";
  
$.getJSON(`https://overpass-api.de/api/interpreter?data=[out:json];area[name="${ville}"]->.searchArea;(node["amenity"="place_of_worship"](area.searchArea););out center;`,
function(data) {var geojsonCult = {
type: 'FeatureCollection',
features: data.elements.map(function(element) {
return {type: 'Feature',
geometry: { type: 'Point',coordinates: [element.lon, element.lat] },
properties: {}};
})
};
map.addSource('customCult', {
type: 'geojson',
data: geojsonCult
});
map.addLayer({
'id': 'Cults',
'type': 'circle',
'source': 'customCult',
'paint': {'circle-color': 'blue',
'circle-radius': 5},
'layout': {'visibility': 'none'}
});
                
                
                
});

  // Ajout de données OSM
  
  
$.getJSON(`https://overpass-api.de/api/interpreter?data=[out:json];area[name="${ville}"]->.searchArea;(node["highway"="bus_stop"](area.searchArea););out center;`,
function(data) {var geojsonBus = {
type: 'FeatureCollection',
features: data.elements.map(function(element) {
return {type: 'Feature',
geometry: { type: 'Point',coordinates: [element.lon, element.lat] },
properties: {}};
})
};
map.addSource('customBus', {
type: 'geojson',
data: geojsonBus
});
map.addLayer({
'id': 'Bus',
'type': 'circle',
'source': 'customBus',
'paint': {'circle-color': 'black',
'circle-radius': 3},
'layout': {'visibility': 'visible'}
});
                
                
                
});
  
        switchlayer = function (lname) {
            if (document.getElementById(lname + "CB").checked) {
                map.setLayoutProperty(lname, 'visibility', 'visible');
            } else {
                map.setLayoutProperty(lname, 'visibility', 'none');
           }
        }
  
}




// Gestion du changement de style
document.getElementById('style-selector').addEventListener('change', function () {
    map.setStyle(this.value);
    map.once('style.load', addLayers); // Recharge les couches après changement de style
});

// Chargement initial des couches
map.on('load', addLayers);

  // INTERACTIVITE

 // Pop up arrets de bus

//Interactivité CLICK sur les arrêts de bus
map.on('click', function (e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['Arrets'] });
if (!features.length) {
return;
}
var feature = features[0];
var popup = new maplibregl.Popup({className: "Mypopup3", offset: [0, -15] })
.setLngLat(feature.geometry.coordinates)
.setHTML('<h2>' + feature.properties.nom + '</h2><hr><h3>'
+"Mobilier : " + feature.properties.mobilier + '</h3>')
.addTo(map);
});
map.on('mousemove', function (e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['Arrets'] });
map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
});

var popup = new maplibregl.Popup({
className: "Mypopup3",
closeButton: false,
closeOnClick: false });


//Interactivité CLICK sur les vélos star
map.on('click', function (e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['VLS'] });
if (!features.length) {
return;
}
var feature = features[0];
var popup = new maplibregl.Popup({className: "Mypopup2", offset: [0, -15] })
.setLngLat(feature.geometry.coordinates)
.setHTML('<h2>' + feature.properties.name + '</h2><hr><h3>'
 + feature.properties.capacity +" socles libres" + '</h3><h3>'
 + feature.properties.velos +" vélos libres" + '</h3>')
.addTo(map);
});
map.on('mousemove', function (e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['VLS'] });
map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
});

var popup = new maplibregl.Popup({
className: "Mypopup2",
closeButton: false,
closeOnClick: false });


//Interactivité HOVER sur les parkings relais 
var popup = new maplibregl.Popup({
className: "Mypopup",
closeButton: false,
closeOnClick: false });
map.on('mousemove', function(e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['Parcs_relais'] });
// Change the cursor style as a UI indicator.
map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
if (!features.length) {
popup.remove();
return; }
var feature = features[0];
popup.setLngLat(feature.geometry.coordinates)
.setHTML('<h2>' + feature.properties.name + '</h2><hr><h3>'
+ feature.properties.capacity +" places disponibles"  + '</h3>')
.addTo(map);
});

var popup = new maplibregl.Popup({
className: "Mypopup",
closeButton: false,
closeOnClick: false });


// Configuration onglet Gare
document.getElementById('Gare').addEventListener('click', function ()
{ map.flyTo({zoom: 16,

center: [-1.672, 48.1043],
pitch: 60});

});

// Configuration onglet Gare
document.getElementById('Rennes1').addEventListener('click', function ()
{ map.flyTo({zoom: 17,

center: [-1.630, 48.124],
pitch: 50 });

});

// Configuration onglet Gare
document.getElementById('Rennes2').addEventListener('click', function ()
{ map.flyTo({zoom: 17,

center: [-1.7015, 48.1193],
pitch: 50});

});