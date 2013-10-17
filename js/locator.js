// MapBox Locator
// 
// Copyright (c), Development Seed
// All rights reserved.

// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

// Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
// Neither the name "Development Seed" nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// ----------------------------------------------------------------------------
// Helper functions

function getURLParameter(name) {
  return decodeURI(
    (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
}

// ----------------------------------------------------------------------------
// Icons: https://www.mapbox.com/maki

var maki = ['','circle', 'circle-stroked', 'square', 'square-stroked', 'triangle', 'triangle-stroked', 'star', 'star-stroked', 'cross', 'marker', 'marker-stroked', 'religious-jewish', 'religious-christian', 'religious-muslim', 'cemetery', 'airport', 'heliport', 'rail', 'rail-underground', 'rail-above', 'bus', 'fuel', 'parking', 'parking-garage', 'london-underground', 'airfield', 'roadblock', 'ferry', 'harbor', 'bicycle', 'park', 'park2', 'museum', 'lodging', 'monument', 'zoo', 'garden', 'campsite', 'theatre', 'art', 'pitch', 'soccer', 'america-football', 'tennis', 'basketball', 'baseball', 'golf', 'swimming', 'cricket', 'skiing', 'school', 'college', 'library', 'post', 'fire-station', 'town-hall', 'police', 'prison', 'embassy', 'beer', 'restaurant', 'cafe', 'shop', 'fast-food', 'bar', 'bank', 'grocery', 'cinema', 'pharmacy', 'hospital', 'minefield', 'industrial', 'warehouse', 'commercial', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

// ----------------------------------------------------------------------------
// Locator
// Barebones generator for widgetization of maps

(function($){

  function init() {
    var model = new Backbone.Model();

    var locator = new Locator({
        model: model,
        el: $('body')
    });
  }

  var Locator = Backbone.View.extend({    
    
    events: {
      'click #add-marker': 'toggleAddingMarker',
      'click #save-marker': 'toggleSaveMarker',
      'click #delete-marker': 'deleteMarker',
      'click #cancel-marker': 'toggleCancelMarker',
      'click .show-all': 'showAll',
      'click #generate-image': 'generateImage',
      'click #generate-embed': 'generateEmbed',
      'change .change-size': 'changeMapSize'
    },

    initialize: function(){
      _(this).bindAll(
        'addMarker',
        'initMapSize',
        'changeMapSize',
        'deleteMarker',
        'generateUrlString',
        'generateImage',
        'generateEmbed',
        'placeMarker',
        'renderMap',
        'showAll',
        'toggleError',
        'toggleAddingMarker',
        'toggleCancelMarker',
        'toggleEditScreen',
        'toggleSaveMarker',
        'updateMarker'
      );

      this.model.on('change:activeMarker', this.toggleEditScreen);

      // Insert your Map ID here
      var mapId = 'examples.map-vyofok3q';
      this.model.set('mapId', mapId);

      this.model.set('coords',{
        lat: '38.91',
        lon: '-77.0300'
      });

      // Fill in Maki options
      $markerSymbols = $('#marker-icon');
      $.each(maki, function(icon){
        $markerSymbols.append('<option value="' + maki[icon] +'">' + maki[icon] + '</option>');
      })
      
      this.initMapSize();      
      this.renderMap(mapId);
      this.placeMarker();

    },

    addMarker: function(coords) {
      var totalMarkers = this.markerLayer.features().length || 0;

      // Place marker at point
      this.markerLayer.add_feature({
        geometry: {
          coordinates: [coords.lon, coords.lat]
        },
        properties: {
          'marker-color': '000000',
          'marker-symbol': '',
          className: '',
          description: '',
          id: totalMarkers
        }
      });

      this.map.center({ lat: coords.lat, lon: coords.lon }, true);

      // Set active marker
      this.model.set('activeMarker',totalMarkers);

      // Change state back
      $('body').removeData('state');

    },

    changeMapSize: function() {
      var width = $('#map-width').val(),
          height = $('#map-height').val();

      this.model.set('mapWidth',width);
      this.model.set('mapHeight',height);

      $('#map-wrapper').css({
        'width' : width,
        'height': height
      });

      this.map.dimensions.x = width;
      this.map.dimensions.y = height;
      this.map.center();
      this.map.draw();
    },

    deleteMarker: function() {
      var markers = this.markerLayer.features(),
          markerId = this.model.get('activeMarker');

      markers[markerId].properties['className'] = ' hide';
      this.markerLayer.features(markers);

      // Reset activeMarker
      this.model.unset('activeMarker');
    },

    generateUrlString: function(includeTooltips) {

      // Map vars
      var urlString = this.model.get('mapId') + '/',
          lon = this.map.center().lon,
          lat = this.map.center().lat;
          zoom = this.map.zoom(),
          mapString = lon + ',' + lat + ',' + zoom,
          markerString = '',
          includeTooltips = includeTooltips || false;

      // Marker vars
      $.each(this.markerLayer.features(),function(){
        var marker = {
          'name':   'pin-m',
          'label':  this.properties['marker-symbol'],
          'color':  this.properties['marker-color'],
          'lon':    this.geometry.coordinates[0],
          'lat':    this.geometry.coordinates[1],
          'className': this.properties['className']
        };

        if(marker.label !== '') {
          marker['label'] = '-' + marker.label;
        }

        if(marker['className'].indexOf('hide') < 0) {
          markerString += marker.name + marker.label + '+' + marker.color + '(' + marker.lon + ',' + marker.lat + ')';

          if(includeTooltips) {
            markerString += '+' + encodeURIComponent(marker.tooltip);
          }

          markerString += ',';
        }

      });

      if(markerString) {
        urlString += markerString.slice(0,-1) + '/';
      }

      urlString += mapString;

      return urlString;

    },

    generateImage: function() {

      var apiString = 'https://api.tiles.mapbox.com/v3/',
          urlString = this.generateUrlString(),
          mapWidth = this.map.dimensions.x,
          mapHeight = this.map.dimensions.y;

      var requestString = apiString + urlString + '/' + mapWidth + 'x' + mapHeight + '.png';

      if(mapWidth > 640 || mapHeight > 640) {
        this.toggleError('<strong>Whoops!</strong> Map must be smaller than 640 x 640 to generate an image.');
        return false;
      } else this.toggleError();

      $('#share-code').slideDown('fast');
      $('#generate-result').val(requestString).select();

    },

    generateEmbed: function() {
      var mapId = this.model.get('mapId'),
          lon = this.map.center().lon,
          lat = this.map.center().lat;
          zoom = this.map.zoom(),
          mapWidth = this.model.get('mapWidth'),
          mapHeight = this.model.get('mapHeight'),
          $container = $('<div></div>'),
          $mapContainer = $('<div class="mapbox-map"></div>');

      if(mapWidth === undefined || mapWidth === '') {
        mapWidth = '100%';
      } else mapWidth += 'px';

      if(mapHeight === undefined || mapHeight === '') {
        mapHeight = '100%';
      } else mapHeight +='px';

      $mapContainer
        .attr({
          'data-mapId': mapId,
          'data-lon':   lon,
          'data-lat':   lat,
          'data-zoom':  zoom,
          'data-width': mapWidth,
          'data-height': mapHeight
        })
      
      $.each(this.markerLayer.features(),function(){

        if(this.properties['className'].indexOf('hide') < 0) {

          var $marker = $('<div class="marker"></div>');
          $marker.attr({
            'data-name'   : 'pin-m',
            'data-symbol'  : this.properties['marker-symbol'],
            'data-color'   : this.properties['marker-color'],
            'data-lon'    : this.geometry.coordinates[0],
            'data-lat'    : this.geometry.coordinates[1],
            'data-tooltip': encodeURIComponent(this.properties['description'])
          });

          $mapContainer.append($marker);
        }
      });

      $container.append($mapContainer);

      $container.append('<script async src="//mapbox.com/locator/embed.js" charset="utf-8"></script>');

      $('#share-code').slideDown('fast');
      $('#generate-result').val($container.html()).select();

    },

    initMapSize: function() {
      var model = this.model;

      $('input[name="size"]').change(function(){
        var size = $(this).data('size');

        model.set('mapWidth',size);
      });
    },

    placeMarker: function() {
      var map = this.map,
          addMarker = this.addMarker;
      
      MM.addEvent(map.parent, 'mousedown', function(e) {
          var ev = e,
              px = MM.getMousePoint(ev, map);

          place(ev,px);
      });

      var place = function(ev,px) {

          if($('body').data('state') != 'adding-marker') {
            return;
          }

          px = {
              x: px.x,
              y: px.y
          };
          var clickPosition = map.pointLocation(px);

          var $loader = $('<div id="placing"></div>');
          $('#map').append($loader);

          $loader.css({
              'left':px.x - 25 + 'px',
              'top':px.y - 25 + 'px'
          });

          // After 400ms of pressing, place pin
          var timer = setTimeout(function(){    
              
              addMarker(clickPosition);

              $loader.remove();
              
          }, 400);

          // Clear timer on mouse up

          $loader.mouseup(function() {
            clearTimeout(timer);
            $loader.remove();
          });

          MM.addEvent(ev.target, 'mouseup', function(e) {
              clearTimeout(timer);
              $loader.remove();
          });

          MM.addEvent(ev.target, 'mousemove', function(e) {
            clearTimeout(timer);
            $loader.remove();
          });
      };

    },

    renderMap: function(mapId){
      var coords = this.model.get('coords'),
          toggleEditScreen = this.toggleEditScreen,
          model = this.model;

      this.map = mapbox.map('map');
      this.map.addLayer(mapbox.layer().url('https://a.tiles.mapbox.com/v3/' + mapId + '.jsonp?secure'));

      // Create an empty markers layer
      this.markerLayer = mapbox.markers.layer().factory(function(f) {
        var elem = mapbox.markers.simplestyle_factory(f);

        elem.id = "marker-" + f.properties.id;
        elem.className = 'simplestyle-marker' + f.properties.className;
        elem['marker-symbol'] = 'circle';

        MM.addEvent(elem, 'click', function(e) {
          model.set('activeMarker', f.properties.id);
        });

        return elem;
      });

      // Overwrite extent function to account for the hiding of markers
      // as in the deleteMarker function
      this.markerLayer.extent = _(function() {
          var ext = [{
              lat: Infinity,
              lon: Infinity
          }, {
              lat: -Infinity,
              lon: -Infinity
          }];
          var ft = this.markerLayer.features();
          for (var i = 0; i < ft.length; i++) {
              var coords = ft[i].geometry.coordinates,
                  className = ft[i].properties.className;
              if(className.indexOf('hide') < 0) {
                if (coords[0] < ext[0].lon) ext[0].lon = coords[0];
                if (coords[1] < ext[0].lat) ext[0].lat = coords[1];
                if (coords[0] > ext[1].lon) ext[1].lon = coords[0];
                if (coords[1] > ext[1].lat) ext[1].lat = coords[1];
              }
          }
          return ext;
      }).bind(this);

      mapbox.markers.interaction(this.markerLayer);
      this.map.addLayer(this.markerLayer);

      // Set sorting method
      this.markerLayer.sort(function(a, b) {
          return a.properties.id -
            b.properties.id;
      });

      // Basic UI Controls
      this.map.ui.zoomer.add();
      this.map.ui.zoombox.add();
      this.map.ui.attribution.add()
          .content('<a href="https://mapbox.com/about/maps">Terms &amp; Feedback</a>');
      
      this.map.zoom(12).center(coords);
    },

    showAll: function() {
      // Adjusts zoom/extent to show all markers
      var extent = this.markerLayer.filter(function(f){

        return f.properties.className != ' hide';
      }).extent();

      if(extent[0].lat != 'Infinity') {
        this.map.setExtent(extent);
      } else {
        this.map.center(this.model.get('coords'));
      }
    },

    toggleError: function(message) {
      if( message === undefined) {
        $('#error').hide();
      } else {
        $('#error').show().html(message); 
      }
    },

    toggleAddingMarker: function() {
      // Set state to let map know we're adding the marker
      $('body').data('state','adding-marker');
      // Hide the "Add marker" button
      $('#basic-controls').hide();
      // Show the "Adding marker" info pane
      $('#adding-marker').show();
    },

    toggleCancelMarker: function(){
      // Set state to let map know we're adding the marker
      $('body').removeData('state');
      // Hide the "Add marker" button
      $('#basic-controls').show();
      // Show the "Adding marker" info pane
      $('#adding-marker').hide();
    },

    toggleEditScreen: function() {
      var $editScreen = $('#edit-marker'),
          activeMarkerId = this.model.get('activeMarker');

      if(activeMarkerId >= 0) {
        var markerProperties = this.markerLayer.features()[activeMarkerId].properties,
            $activeMarker = $('#marker-' + activeMarkerId),
            $markerColor = $editScreen.find('#marker-color'),
            $markerIcon = $editScreen.find('#marker-icon');

        $('#basic-controls').hide();
        $('#adding-marker').hide();
        $editScreen.show();

        // Update features
        $markerColor.val(markerProperties['marker-color']);
        $markerIcon.val(markerProperties['marker-symbol']);
        $editScreen.find('textarea').val(markerProperties.description);

        $editScreen.find('select').change(_(function(){
          this.updateMarker();
        }).bind(this));

      } else {
        $('#basic-controls').show();
        $('#edit-marker').hide();
      }
    },

    toggleSaveMarker: function() {
      this.updateMarker();
      this.model.unset('activeMarker');
    },

    updateMarker: function() {
      var $editScreen = $('#edit-marker'),
          markers = this.markerLayer.features(),
          activeMarkerId = this.model.get('activeMarker');

      markers[activeMarkerId].properties['description'] = $editScreen.find('textarea').val();
      markers[activeMarkerId].properties['marker-symbol'] = $editScreen.find('#marker-icon option:selected').val();
      markers[activeMarkerId].properties['marker-color'] = $editScreen.find('#marker-color option:selected').val();

      // Reset all markers
      this.markerLayer.features([]);

      // Push new markers
      this.markerLayer.features(markers);

    }

  });

  // Start the engines
  $(init);

})(jQuery);
