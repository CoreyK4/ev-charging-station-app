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
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    ocm_poi_id = db.Column(db.Integer, nullable=False)
    latitude = db.Column(db.Numeric, nullable=False)
    longitude = db.Column(db.Numeric, nullable=False)

    # Relationships
    user = db.relationship("User", back_populates="favorites")

    def __repr__(self):
        return f"<Favorite id={self.id} lat/lng={self.latitude},{self.longitude}>"
    

class Review(db.Model):
    """A review."""

    __tablename__ = "reviews"

    # Columns
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    ocm_poi_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="reviews")

    def __repr__(self):
        return f"<Review id={self.id} title={self.title}>"
    
def connect_to_db(flask_app, db_uri="postgresql:///ev_charge"):
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    flask_app.config["SQLALCHEMY_ECHO"] = False
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.app = flask_app
    db.init_app(flask_app)

    print("Connected to the db!")


if __name__ == "__main__":
    from server import app

    connect_to_db(app)