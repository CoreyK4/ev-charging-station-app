'use strict'

function get_bounds(map) {
    const bounds = map.getBounds();
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();

    const data = {
        'swLat': southWest.lat,
        'swLng': southWest.lng,
        'neLat': northEast.lat,
        'neLng': northEast.lng
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
        for (const location of locations) {
            // create the popup
            const popup = new mapboxgl.Popup({ offset: 25 }).setText(
                location.title
            );

            const marker = new mapboxgl.Marker()
                .setLngLat([location.lng, location.lat])
                .setPopup(popup)
                .addTo(map);

            markers.push(marker);
        }
    });
}

function remove_markers() {
    if (markers) {
        for (const marker of markers) {
            marker.remove();
        }
    }
    markers = [];
}

function updateMarkers() {
    remove_markers();
    add_markers(fetch_locations(get_bounds(map)), map);
}

map.on('load', updateMarkers);
map.on('moveend', updateMarkers);
map.on('zoomend', updateMarkers);

// map.on('idle', () => {
//     remove_markers();
//     add_markers(fetch_locations(get_bounds(map)), map);
// });