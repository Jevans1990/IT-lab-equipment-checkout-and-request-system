from flask import Blueprint, render_template
from flask_login import current_user

from .db import get_connection

views = Blueprint("views", __name__)

@views.route("/")
def home():
    # Connect to database
    conn = get_connection()

    # Query the database
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Inventory;")
        inventory = cursor.fetchall()
    finally:
        conn.close()

    return render_template("index.html", user=current_user, inventory_list=inventory)
