from flask import Flask
from os import path
from flask_login import LoginManager

# Connect to database
import sqlite3
connection = sqlite3.connect("LabCheckoutSystem.db")
cursor = connection.cursor()

# Create app
def create_app():
    app = Flask(__name__)

    from .views import views
    from .auth import auth

    app.register_blueprint(views, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")

    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return cursor.execute(f"SELECT * FROM Users WHERE user_id = {int(id)}")

    return app
