"""CRUD Operations"""

from model import db, User, Favorite, Review, connect_to_db

# User Operations
def create_user(username, password_hash, email, first_name, last_name):
    """Create and return a new user"""

    user = User(username=username, password_hash=password_hash, email=email, first_name=first_name, last_name=last_name)

    return user


def get_user_by_username(username):
    """Return a user by email."""

    return User.query.filter(User.username == username).first()

# Favorite Operations
def add_favorite(user_id, ocm_poi_id, latitude, longitude):
    """Create and return a new favorite"""

    favorite = Favorite(user_id=user_id, ocm_poi_id=ocm_poi_id, latitude=latitude, longitude=longitude)

    return favorite


def get_favorites_by_user_id(user_id):

    return Favorite.query.filter(Favorite.user_id == user_id).all()

# Review Operations

if __name__ == "__main__":
    from server import app

    connect_to_db(app)