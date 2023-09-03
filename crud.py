"""CRUD Operations"""

from model import db, User, Favorite, Review, connect_to_db

# User Operations
def create_user(username, password_hash, email, first_name, last_name):
    """Create and return a new user"""

    user = User(username=username, password_hash=password_hash, email=email, first_name=first_name, last_name=last_name)

    return user

# Favorite Operations

# Review Operations

if __name__ == "__main__":
    from server import app

    connect_to_db(app)