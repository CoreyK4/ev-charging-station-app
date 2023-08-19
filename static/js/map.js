'use strict'

function initMap() {
    const solCoords = {
        lat: 40.689247,
        lng: -74.044502,
    };

    const map = new google.maps.Map(document.querySelector('#map'), {
        center: solCoords,
        zoom: 12,
    });
};