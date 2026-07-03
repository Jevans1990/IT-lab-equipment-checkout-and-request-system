from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_user, login_required, logout_user, current_user

# Connect to database
import sqlite3
connection = sqlite3.connect("LabCheckoutSystem.db")
cursor = connection.cursor()

auth = Blueprint("auth", __name__)

@auth.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("login-username")
        password = request.form.get("login-password")
        role = request.form.get("login-role")

        if role == "user":
            # Sign in a user
            user = cursor.execute(f"SELECT * FROM Users WHERE username = {username}")
            if user:
                if user.role != "User":
                    flash("Incorrect role.", category="error")
                else:
                    if user.password == password:
                        flash("Logged in successfully!", category="success")
                        login_user(user, remember=True)
                        return redirect(url_for("views.home"))
                    else:
                        flash("Incorrect password, try again.", category="error")
            else:
                flash("Username does not exist.", category="error")
        elif role == "admin":
            # Sign in an admin
            admin = cursor.execute(f"SELECT * FROM Users WHERE username = {username}")
            if admin:
                if admin.role != "Admin":
                    flash("Incorrect role.", category="error")
                else:
                    if admin.password == password:
                        flash("Logged in successfully!", category="success")
                        login_user(admin, remember=True)
                        return redirect(url_for("views.home"))
                    else:
                        flash("Incorrect password, try again.", category="error")
            else:
                flash("Username does not exist.", category="error")

    return render_template("index.html", user=current_user)

@auth.route("/")
@login_required
def logout():
    logout_user()

    return redirect(url_for("auth.login"))
