import 'ol/ol.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import proj from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON.js';
import {Style, Stroke, Fill} from 'ol/Style.js';
import Overlay from 'ol/Overlay.js'
import Feature from 'ol/Feature.js'

import $ from "jquery";

var jsonData = require('../json/towns.json');
var currTown;

//Styling
$("#map").width('100%');
$("#map").height($(window).height()*0.8);

//The elements from the popup
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

//Initialize all parts of the map
var overlay = new Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
});

var townLayer = new VectorLayer({
    source: new VectorSource({
        features: (new GeoJSON()).readFeatures(jsonData, {
            featureProjection: 'EPSG:3857'
        })
    })
});

var townStyle = new Style({
    fill: new Fill({
        color: 'white'
    }),
    stroke: new Stroke({
      color: 'blue',
      width: 1
    })
});

var features = townLayer.getSource().getFeatures();
for(let i = 0; i < features.length; i++)
{
    features[i].setStyle(townStyle);
}

const map = new Map({
    target: 'map',
    layers: [townLayer],
    overlays: [overlay],
    view: new View({
      center: [-8095653.71, 5090000],
      zoom: 9
    })
  });

let townNameBank =[];
for(let i = 0; i < jsonData.features.length; i++)
{
    townNameBank[i] = jsonData.features[i].properties.town;
}

let townNameBankClone = townNameBank.slice();

let correctGuesses = 0;

function nextTown()
{
    $("#townName").text("");
    let rand = Math.floor(Math.random()*townNameBankClone.length);
    $("#townName").append(townNameBankClone[rand]);
    currTown = townNameBankClone[rand];
    townNameBankClone.splice(rand, 1);
}

//Game functionality
var timeLeft = 30; //10min*60sec

var x = setInterval(function() {
    timeLeft -= 1;
    // Time calculations for days, hours, minutes and seconds
    var minutes = Math.floor(timeLeft/60);
    var seconds = timeLeft%60;
  
    if(minutes > 0)
    {
        //Display the result in the element with id="demo"
        document.getElementById("timeLeft").innerHTML = minutes + ":" + seconds;
    }
    else
    {
        document.getElementById("timeLeft").innerHTML = seconds;
    }
  
    // If the count down is finished, write some text 
    if (timeLeft == 0) {
      clearInterval(x);
      document.getElementById("timeLeft").innerHTML = "EXPIRED";
      gameOver();
    }
  }, 1000);


function gameOver()
{
    let ratioCorrect = (correctGuesses/townNameBank.length);
    document.getElementById("timeLeft").innerHTML = "Time is up!  You got " + 
        ((ratioCorrect)*100).toFixed(2) + "%";
}

//Initialization
nextTown();

//Event Listeners
map.on('click', function(evt){
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });
    if (feature) {
        if(currTown == feature.get("town"))
        {
            let style = new Style({
                fill: new Fill({
                    color: 'blue'
                  })
            });
            feature.setStyle(style);
            correctGuesses++;
        }
        nextTown();
    }
});

map.on('pointermove', function(evt){
    var coordinate = evt.coordinate;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });
    if (feature) {
        var style = feature.getStyle();
        if(style.getFill().getColor() == 'blue')
        {
            content.innerHTML = '<code>' + feature.get("town") + '</code>';
            overlay.setPosition(coordinate);
        }
        else
        {
            closer.click();
        }
    }
    else
    {
        closer.click();
    }
});

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };

  //Event Handler Helper Functions
