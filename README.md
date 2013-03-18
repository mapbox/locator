# Locator

This template demonstrates a widget for creating and sharing simple [MapBox](http://www.mapbox.com) maps with one or more markers.

To make your custom base map, [sign up for MapBox](http://mapbox.com/plans/) and [create a map](http://mapbox.com/hosting/creating/).

![Screenshot](http://i.imgur.com/CkZToYl.jpg)

## About Map Site Templates

[Map Site templates](http://mapbox.com/map-sites) from MapBox are a way to jumpstart building a map-based web feature. The map-site templates bundles common html and css formatting with reusable javascript components. 

To build a project based on this template, fork this repository, edit the html content and css, and alter the JavaScript.

## Using this template

Edit the content by adjusting, removing, or adding to `index.html`. This is
the main markup document with the content and layout for the map-site.

Adjust the design by editing the `style.css` file and adding any additional
supporting structure to `index.html`.

Set your map id, and [any additional features](http://mapbox.com/developers/mapbox.js/), inside the initialize and renderMap() functions.

```javascript
// Insert your Map ID here
var mapId = 'examples.map-vyofok3q';
```

## CSS styles

Most of the hard work on a microsite build is template design implemented through CSS. This template by default is simple and clean, and it's based on the tiles.mapbox.com full map view. This design and be completely overridden by applying new CSS styles. `style.css` contains all the layout and typographic styles as well as some overridden styles for map controls, as well as a [reset stylesheet](http://meyerweb.com/eric/tools/css/reset/). Implement your design by editing this file.

## Javascript

The map is configured in `js/locator.js` and takes advantage of many [MapBox Javascript API](http://mapbox.com/developers/mapbox.js/)
features - so the documentation for the MapBox Javascript API applies to every part
of this site.

In addition to Mapbox JS, Locator utilizes both (Backbone.js)[http://backbonejs.org/] and jQuery. 

The latest embed code is [hosted by Mapbox](http://www.mapbox.com/locator/embed.js), but the unminified version is included here in `embed.unmin.js` for any additional features you may want.

## Running Locator

To run locally, run:

> python -mSimpleHTTPServer

and go to [http://localhost:8000](http://localhost:8000)
