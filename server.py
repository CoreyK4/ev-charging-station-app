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
    

@app.route("/api/fetch_charger_by_id", methods=["POST"])
def fetch_charger_by_id():
    """API to fetch a single charging station by ID"""

    api_key = environ.get("OPEN_CHARGE_MAP_API_KEY")
    headers = {"X-API-Key": api_key}
    base_url = "https://api.openchargemap.io/v3/poi"
    id = request.json.get("charger_id")
    url = f"{base_url}?chargepointid={id}"

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        return data[0]
    else:
        return jsonify(error="An error occurred"), 400
    

@app.route("/add_favorite", methods=["POST"])
def add_favorite():
    """Add a favorite to the database"""

    user_id = request.json.get("user_id")
    ocm_poi_id = request.json.get("ocm_poi_id")
    latitude = request.json.get("latitude")
    longitude = request.json.get("longitude")

    favorites = crud.get_favorites_by_user_id(user_id)

    if favorites:
        for favorite in favorites:
            if favorite.ocm_poi_id == ocm_poi_id:
                return jsonify({"message": "You already added this favorite!"}), 200
    
    favorite = crud.add_favorite(user_id, ocm_poi_id, latitude, longitude)
    db.session.add(favorite)
    db.session.commit()

    return jsonify({"message": "Successfully added favorite!"}), 200

@app.route("/get_favorites", methods=["POST"])
def get_favorites():
    """Return a user's favorites"""

    user_id = request.json.get("user_id")

    db_favorites = crud.get_favorites_by_user_id(user_id)

    api_key = environ.get("OPEN_CHARGE_MAP_API_KEY")
    headers = {"X-API-Key": api_key}
    base_url = "https://api.openchargemap.io/v3/poi"

    favorites = []
    ids = ""

    # Build the ids string for the URL
    if db_favorites:
        for favorite in db_favorites:
            if ids == "":
                ids += str(favorite.ocm_poi_id)
            else:
                ids += f',{favorite.ocm_poi_id}'

        url = f"{base_url}?chargepointid={ids}"

        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            data = response.json()
        else:
            return jsonify(error="An error occurred"), 400
        
        for favorite in data:
            favorites.append({
                "id": favorite.get('ID'),
                "title": favorite.get('AddressInfo').get('Title'),
                "addressLine1": favorite.get('AddressInfo').get('AddressLine1'),
                "addressLine2": favorite.get('AddressInfo').get('AddressLine2'),
                "town": favorite.get('AddressInfo').get('Town'),
                "stateOrProvince": favorite.get('AddressInfo').get('StateOrProvince'),
                "postcode": favorite.get('AddressInfo').get('Postcode')
                              })

    if favorites:
                return jsonify({"favorites": favorites}), 200
    
    return jsonify({"favorites": []}), 200
    
    
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
    
@app.route("/login", methods=["POST"])
def process_login():
    """Process user login."""

    username = request.json.get("username")
    hashed_password = generate_sha256_hash(request.json.get("password"))
    user = crud.get_user_by_username(username)

    if not user or user.password_hash != hashed_password:
        return jsonify({'message': 'Invalid username or password.'}), 401
    else:
        return jsonify({'user_id': user.id}), 200
    

if __name__ == "__main__":
    connect_to_db(app)
    app.run(debug=True, host="0.0.0.0", port=5001)