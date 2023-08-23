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

let markers = [];

function add_markers(locations_promise, map) {
    locations_promise.then((locations) => {
        const infowindow = new google.maps.InfoWindow({
            content: location.title,
            ariaLabel: location.title
        });

        for (const location of locations) {
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

            markers.push(marker);
        }
    });
};

function remove_markers() {
    if (markers) {
        for (const marker of markers) {
            marker.setMap(null);
        }

        markers = [];
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

    google.maps.event.addListener(map, 'idle', () => {
        remove_markers();
        add_markers(fetch_locations(get_bounds(map)), map);
    });
};