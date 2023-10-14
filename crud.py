"""CRUD Operations"""

from model import db, User, Favorite, Review, connect_to_db

# User Operations
def create_user(username, password_hash, email, first_name, last_name):
    """Create and return a new user"""

    user = User(username=username, password_hash=password_hash, email=email, first_name=first_name, last_name=last_name)

    return user


def get_user_by_username(username):
    """Return a user by username."""

    return User.query.filter(User.username == username).first()

# Favorite Operations
def add_favorite(user_id, ocm_poi_id, latitude, longitude):
    """Create and return a new favorite"""

    favorite = Favorite(user_id=user_id, ocm_poi_id=ocm_poi_id, latitude=latitude, longitude=longitude)

    return favorite


def get_favorites_by_user_id(user_id):
    """Return favorites by user_id"""

    return Favorite.query.filter(Favorite.user_id == user_id).all()

# Review Operations

def add_review(user_id, ocm_poi_id, title, comment, rating):
    """Create and return a new review"""

    review = Review(user_id=user_id, ocm_poi_id=ocm_poi_id, title=title, comment=comment, rating=rating)

    return review

def get_reviews_by_station_id(ocm_poi_id):
    """Return reviews by ocm_poi_id"""

    return Review.query.filter(Review.ocm_poi_id == ocm_poi_id).all()


if __name__ == "__main__":
    from server import app

    connect_to_db(app)