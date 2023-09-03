"""Models for EV Charging Station Locator app."""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    """A user."""

    __tablename__ = "users"

    # Columns
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)

    # Relationships
    reviews = db.relationship("Review", back_populates="user")
    favorites = db.relationship("Favorite", back_populates="user")

    def __repr__(self):
        return f"<User id={self.id} username={self.username}>"
    

class Favorite(db.Model):
    """A favorite."""

    __tablename__ = "favorites"

    # Columns
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey("users.id"))
    latitude = db.Column(db.Double, nullable=False)
    longitude = db.Column(db.Double, nullable=False)

    # Relationships
    user = db.relationship("User", back_populates="favorites")

    def __repr__(self):
        return f"<Favorite id={self.id} lat/lng={self.latitude},{self.longitude}>"