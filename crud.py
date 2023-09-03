"""CRUD Operations"""

# User Operations
def create_user(username, password_hash, email, first_name, last_name):
    """Create and return a new user"""

    user = User(username=username, password_hash=password_hash, email=email, first_name=first_name, last_name=last_name)

    return user

# Favorite Operations

# Review Operations