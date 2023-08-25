'use strict'

function get_bounds(map) {
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
async function fetch_locations(data) {
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
        'title': result.AddressInfo.Title
    }));

    return locations;
}

let markers = {};

function add_markers(locations_promise, map, infowindow) {
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
                    title: location.title,
                    map: map
                });

                marker.addListener("click", () => {
                    infowindow.setContent(location.title);
                    infowindow.setPosition(marker.getPosition());
                    infowindow.open({
                        anchor: marker,
                        map,
                    });
                });

                markers[key] = marker;

            }
        }
    });
};

function remove_markers(map) {
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

function initMap() {
    const solCoords = {
        lat: 40.689247,
        lng: -74.044502
    };

    const map = new google.maps.Map(document.querySelector('#map'), {
        center: solCoords,
        zoom: 12
    });

    const infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(map, 'idle', () => {
        remove_markers(map);

        if (map.getZoom() >= 12) {
            add_markers(fetch_locations(get_bounds(map)), map, infowindow);
        }
    });
};