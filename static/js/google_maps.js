'use strict'

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

let markers = {};

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
                    title: location.title,
                    addressLine1: location.addressLine1,
                    addressLine2: location.addressLine2,
                    town: location.town,
                    stateOrProvince: location.stateOrProvince,
                    postcode: location.postcode
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

function animateMarker(key) {
    const marker = markers[key];
    marker.setAnimation(google.maps.Animation.BOUNCE);
    marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);

    // Stop animation after 2 seconds
    setTimeout(() => {
        marker.setAnimation(null);
    }, 2000);
}

let map;

function initMap() {
    // Statue of Liberty Coordinates
    const solCoords = {
        lat: 40.689247,
        lng: -74.044502
    };

    map = new google.maps.Map(document.querySelector('#map'), {
        center: solCoords,
        zoom: 12
    });

    // Add the info window outside of any listeners to avoid creating more than one info window
    const infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(map, 'idle', () => {
        removeMarkers(map);

        if (map.getZoom() >= 12) {
            const bounds = getCurrentBounds(map);
            const locations = fetchLocations(bounds);
            addMarkers(locations, map, infowindow);
        }
    });
};