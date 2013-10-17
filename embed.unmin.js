// embed.js
// 
// For use with Locator, compiles mapbox.js and mapbox.css, then converts provided HTML content to map client-side
// See embed.html for an example

// Parsing HTML data functions is a pain without jQuery – Check to see if it is present
// If not, load it. In both cases, load MapBox JS after load.
(function () {

	// Init CSS

	// Include MapBox CSS
	var mapboxCSS = 'mapbox-css';
	if (!document.getElementById(mapboxCSS)){
		var head  = document.getElementsByTagName('head')[0];
		var link  = document.createElement('link');
		link.id   = mapboxCSS;
		link.rel  = 'stylesheet';
		link.type = 'text/css';
		link.href = 'https://api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.css';
		link.media = 'all';
		head.appendChild(link);
	}

	// Init JS

	if (typeof jQuery == 'undefined') {
		loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", function () {
			loadMapbox();
		});
	} else loadMapbox();


	function loadScript(url, callback) {

		var script = document.createElement("script")
		script.type = "text/javascript";

		if (script.readyState) { //IE
			script.onreadystatechange = function () {
				if (script.readyState == "loaded" || script.readyState == "complete") {
					script.onreadystatechange = null;
					callback();
				}
			};
		} else { //Others
			script.onload = function () {
				callback();
			};
		}

		script.src = url;
		document.getElementsByTagName("head")[0].appendChild(script);
	}

	function loadMapbox() {

		// In case user embeds this file twice, prevent further instantiation
		var initialized = window.initialized;

		if(initialized === undefined) {
  		window.initialized = true;
			loadScript('//api.tiles.mapbox.com/mapbox.js/v0.6.7/mapbox.js', function () {
				
				parseMaps();

			});
		} else return;
	}

	// ------------------------------------------------------------------------------------
	// Parse function

	function parseMaps() {

		$('.mapbox-map').each(function(i, obj) {
		    
			var $m = $(this),
		    	mapid = $m.data('mapid'),
		    	$newMapContainer = $('<div style="width:' + $m.data('width') + '; height:' + $m.data('height') + '; position: relative"></div>'),
		    	$newMap = $('<div id="map-' + i + '" class="mbmap"></div>');

		  $newMap.css({'position':'absolute', 'top':'0', 'bottom':'0', 'width':'100%' });

		  $newMapContainer.append($newMap);
		  $m.after($newMapContainer);

		  // Create Mapbox map

	  	var layer = mapbox.layer().id(mapid);
		  var map = mapbox.map('map-' + i, layer);
		  var markerLayer = mapbox.markers.layer();

			map.zoom($m.data('zoom'));
			map.center({
				lon: $m.data('lon'),
				lat: $m.data('lat')
			});
			map.ui.zoomer.add();
			map.ui.attribution.add().content('<a href="https://mapbox.com/about/maps" style="font-family: Arial,sans-serif; color: #666; text-decoration:">Terms &amp; Feedback</a>');
		  mapbox.markers.interaction(markerLayer);
			
			// Add markers
			$m.find('div.marker').each(function(i, obj){
				$marker = $(this);
				// Place marker at point
	      markerLayer.add_feature({
	        geometry: {
	          coordinates: [$marker.data('lon'), $marker.data('lat')]
	        },
	        properties: {
	          'marker-color': $marker.data('color'),
	          'marker-symbol': $marker.data('symbol'),
	          className: '',
	          description: decodeURIComponent($marker.data('tooltip'))
	        }
	      });

			});

			map.addLayer(markerLayer);

		  // Destroy original copies
		  $m.remove();

			// Additional CSS - inherits most styles from body, but want to ensure tooltips look halfway decent
			$("<style>").text('' +
				'.marker-popup { font-family: Arial, sans-serif; max-width: 240px; padding: 10px; font-size: 14px; line-height: 16px; }' +
				'.marker-popup a { text-decoration: none; }' +
			'').appendTo("head");

		});
	}

})();

