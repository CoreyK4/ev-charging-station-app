from os import environ
import requests
from flask import Flask, request, render_template, jsonify
from model import connect_to_db, db
import crud
import hashlib

app = Flask(__name__)
app.secret_key = environ.get("FLASK_SECRET_KEY")

def generate_sha256_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route("/")
def show_index():
    """Index page"""
    return render_template("google_maps.html", GOOGLE_MAPS_API_KEY=environ.get("GOOGLE_MAPS_API_KEY"))


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
    url = f"{base_url}?boundingbox={bounding_box}&maxresults=1000"

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify(error="An error occurred"), 400
    
@app.route("/register", methods=["POST"])
def register_user():
    """Register a user into the database"""

    username = request.json.get("username")
    password_hash = generate_sha256_hash(request.json.get("password"))
    email = request.json.get("email")
    first_name = request.json.get("first_name")
    last_name = request.json.get("last_name")

    user = crud.get_user_by_username(username)
    try:
        if user:
            return jsonify({"message": "An account with that username already exists."}), 409
        else:
            user = crud.create_user(username, password_hash, email, first_name, last_name)
            db.session.add(user)
            db.session.commit()

            return jsonify({"message": "Your account was created successfully and you are now logged in!"}), 201
        
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

if __name__ == "__main__":
    connect_to_db(app)
    app.run(debug=True, host="0.0.0.0", port=5001)