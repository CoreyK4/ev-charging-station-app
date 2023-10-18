# EV Charging Station App

## Overview
This application aims to provide an easy-to-use interface for finding electric vehicle (EV) charging stations. Built with Python, Flask, and React, it offers a comprehensive solution for users.

## Features
- **User Authentication:** Login and registration features.
- **Google Maps Integration:** Real-time location tracking of charging stations.
- **Station Details:** Easily find connection types, hours, etc for charging stations.
- **Favorites Management:** For quick access to frequently visited charging stations.

## Installation

### Prerequisites
- Python 3.x

### Steps
1. Clone the repository:
   ```
   git clone https://github.com/CoreyK4/ev-charging-station-app.git
   ```
2. Navigate to the project directory:
   ```
   cd ev-charging-station-app
   ```
3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Obtain API keys:
- **Google Maps:** https://developers.google.com/maps
- **Open Charge Map:** https://openchargemap.org/site/develop
5. Add API keys to secrets.sh:
   ```
   export GOOGLE_MAPS_API_KEY="paste your api key here"
   export OPEN_CHARGE_MAP_API_KEY="paste your api key here"
   ```
6. Add secret key to secrets.sh
   ```
   export FLASK_SECRET_KEY="paste your secret key here"
   ```
   **This can be anything, but should be secure and not easy to guess.
7. Source your secrets.sh file
   ```
   source secrets.sh
   ```
8. Run the Flask server:
   ```
   python server.py
   ```
9. Open your browser and go to http://localhost:5001

## Usage
- **For Users:** After registering and logging in, you can search for available charging stations on the map, view details, and add favorites.

## Contributing
Feel free to open issues or pull requests to improve the application.