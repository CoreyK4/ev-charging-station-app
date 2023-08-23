from os import environ
import requests
from flask import Flask, request, render_template, jsonify

app = Flask(__name__)

@app.route("/map")
def show_index():
    """Index page"""
    map_type = request.args.get("map_type", "mapbox")

    if map_type == "google_maps":
        return render_template("google_maps.html", GOOGLE_MAPS_API_KEY=environ.get("GOOGLE_MAPS_API_KEY"))
    elif map_type == "mapbox":
        return render_template("mapbox.html", MAPBOX_API_KEY=environ.get("MAPBOX_API_KEY"))

@app.route("/api/fetch_chargers", methods=["POST"])
def fetch_chargers():
    """API to fetch charging stations"""

    api_key = environ.get("OPEN_CHARGE_MAP_API_KEY")
    headers = {"X-API-Key": api_key}
    base_url = "https://api.openchargemap.io/v3/poi"
    swLat = request.json.get("swLat")
    swLng = request.json.get("swLng")
    neLat = request.json.get("neLat")
    neLng = request.json.get("neLng")
    bounding_box = f"({neLat},{neLng}),({swLat},{swLng})"
    url = f"{base_url}?boundingbox={bounding_box}&maxresults=500"

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify(error="An error occurred"), 400

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)