"""Script to seed database."""

import os
import json
from random import choice, randint
from datetime import datetime

import crud
import model
import server

os.system("dropdb ev_charge")
os.system("createdb ev_charge")

model.connect_to_db(server.app)
model.db.create_all()

# Load user data from JSON file
with open("data/users.json") as f:
    user_data = json.loads(f.read())


# Create users, store them in list so we can use them
# to create fake reviews
users_in_db = []

for user in user_data:
    username, password_hash, email, first_name, last_name = (
        user["username"],
        user["password_hash"],
        user["email"],
        user["first_name"],
        user["last_name"]
    )

    db_user = crud.create_user(username, password_hash, email, first_name, last_name)
    users_in_db.append(db_user)


model.db.session.add_all(users_in_db)
model.db.session.commit()