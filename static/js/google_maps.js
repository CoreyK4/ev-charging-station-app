'use strict'

// Global Variables
let map;
let infowindow;
let markers = {};
let markerCluster;
let customMarker;

function getCurrentBounds(map) {
    const bounds = map.getBounds();
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();

    const data = {
        'swLat': southWest.lat(),
        'swLng': southWest.lng(),
        'neLat': northEast.lat(),
        'neLng': northEast.lng()
    }

    return data;
}

// Fetch the location data from the server
async function fetchLocations(data) {
    const response = await fetch('/api/fetch_chargers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const results = await response.json();

    const locations = results.map(result => ({
        'id': result.ID,
        'lng': result.AddressInfo.Longitude,
        'lat': result.AddressInfo.Latitude,
        'title': result.AddressInfo.Title,
        'addressLine1': result.AddressInfo.AddressLine1,
        'addressLine2': result.AddressInfo.AddressLine2,
        'town': result.AddressInfo.Town,
        'stateOrProvince': result.AddressInfo.StateOrProvince,
        'postcode': result.AddressInfo.Postcode

    }));

    return locations;
}

function initMarkerClusterer(map) {
    markerCluster = new MarkerClusterer(map, [], {
        imagePath: 'static/img/m'
    });
}

function addMarkers(locations_promise, map, infowindow) {
    locations_promise.then((locations) => {


        for (const location of locations) {
            const key = `${location.lat},${location.lng}`;

            // Only create a new marker if one isn't already rendered on the map in that location
            if (!markers[key]) {

                const marker = new google.maps.Marker({
                    position: {
                        lat: location.lat,
                        lng: location.lng
                    },
                    map: map,
                    icon: customMarker,
                    id: location.id,
                    title: location.title,
                    addressLine1: location.addressLine1,
                    addressLine2: location.addressLine2,
                    town: location.town,
                    stateOrProvince: location.stateOrProvince,
                    postcode: location.postcode,
                    lat: location.lat,
                    lng: location.lng
                });

                const infoWindowContent = `<h2 class="infoWindowTitle">${location.title}</h2><p class="infoWindowAddress">${location.addressLine1}</p><p class="infoWindowAddress">${location.town}, ${location.stateOrProvince} ${location.postcode}</p>`

                marker.addListener("click", () => {
                    infowindow.setContent(infoWindowContent);
                    infowindow.setPosition(marker.getPosition());
                    infowindow.open({
                        anchor: marker,
                        map,
                    });
                });

                markers[key] = marker;

            }
        }

        const markerArray = Object.values(markers);

        markerCluster.clearMarkers();
        markerCluster.addMarkers(markerArray);

        // Dispatch a custom event to inform React that markers have been updated.
        const event = new Event('markersUpdated');
        document.dispatchEvent(event);
    });
};

function removeMarkers(map) {
    if (markers) {
        const bounds = map.getBounds();

        for (const key in markers) {
            const marker = markers[key];

            // Remove the marker if it falls outside the bounds
            if (!bounds.contains(marker.getPosition())) {
                marker.setMap(null);
                delete markers[key];
            }
        }
    }
};

function zoomToMarker(key) {
    const marker = markers[key];
    if (marker) {
      const position = marker.getPosition();
      map.setCenter(position);
  
      let currentZoom = map.getZoom();
      const step = 0.2;
      const interval = 50;
  
      const zoomInterval = setInterval(() => {
        if (currentZoom < 15) {
          currentZoom += step;
          map.setZoom(currentZoom);
        } else {
          clearInterval(zoomInterval);
          // Open the InfoWindow after zooming is complete
          const infoWindowContent = `<h2 class="infoWindowTitle">${marker.title}</h2><p class="infoWindowAddress">${marker.addressLine1}</p><p class="infoWindowAddress">${marker.town}, ${marker.stateOrProvince} ${marker.postcode}</p>`;
          infowindow.setContent(infoWindowContent);
          infowindow.setPosition(marker.getPosition());
          infowindow.open({
            anchor: marker,
            map,
          });
        }
      }, interval);
    }
  }

function initMap() {
    // Initial coordinates for center when map loads
    const initCoords = {
        lat: 40.59748536898963,
        lng: -73.9593543913952
    };

    customMarker = {
        url: '../static/img/default-marker.png',
    };

    map = new google.maps.Map(document.querySelector('#map'), {
        center: initCoords,
        zoom: 14,
        mapTypeControl: false
    });

    // Add the info window outside of any listeners to avoid creating more than one info window
    infowindow = new google.maps.InfoWindow();

    initMarkerClusterer(map);

    google.maps.event.addListener(map, 'idle', () => {
        removeMarkers(map);

        if (map.getZoom() >= 12) {
            const bounds = getCurrentBounds(map);
            const locations = fetchLocations(bounds);
            addMarkers(locations, map, infowindow);
        }
    });
};