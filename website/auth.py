from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_user, logout_user, current_user

from .models import User
from .db import get_connection

auth = Blueprint("auth", __name__)

@auth.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # Get user login credentials
        username = request.form.get("login-username")
        password = request.form.get("login-password")
        role = request.form.get("login-role")

        # Connect to database
        conn = get_connection()

        # Query the database
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Users WHERE username = ?;", 
                           (username,))
            row = cursor.fetchone()
        finally:
            conn.close()

        if row is None:
            flash("Username does not exist.", category="error")
            return render_template("login.html", user=current_user)
        else:
            # Convert user tuple to a flask-login user object
            user = User(row)

            if role == "user":
                if user.role != "Student":
                    flash("Incorrect role.", category="error")
                else:
                    if user.password == password:
                        flash("Logged in successfully!", category="success")
                        login_user(user, remember=True)
                        return redirect(url_for("views.home"))
                    else:
                        flash("Incorrect password, try again.", category="error")
            elif role == "admin":
                if user.role != "Admin":
                    flash("Incorrect role.", category="error")
                else:
                    if user.password == password:
                        flash("Logged in successfully!", category="success")
                        login_user(user, remember=True)
                        return redirect(url_for("views.home"))
                    else:
                        flash("Incorrect password, try again.", category="error")

    return render_template("index.html", user=current_user)

@auth.route("/")
def logout():
    logout_user()

    return redirect(url_for("auth.login"))
