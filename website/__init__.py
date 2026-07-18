from flask import Flask
from flask_login import LoginManager

from .models import User
from .db import get_connection

# Create app
def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "eklanvhoirdnhb"

    from .views import views
    from .auth import auth

    app.register_blueprint(views, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")

    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        conn = get_connection()

        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Users WHERE user_id = ?", 
                           (int(user_id),))
            row = cursor.fetchone()
        finally:
            conn.close()

        if row:
            return User(row)
        return None

    return app
