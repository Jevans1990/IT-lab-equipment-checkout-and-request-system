from flask import Blueprint, render_template, request, jsonify
from flask_login import current_user, login_required
import json

from .db import get_connection

requests = Blueprint("requests", __name__)

@requests.route("/submit-request", methods=["POST"])
@login_required
def submit_request():
    if request.method == "POST":
        # Get the request data
        items = json.loads(request.form["request_items"])
        
        # Connect to database
        conn = get_connection()

        try:
            # Insert request
            cursor = conn.cursor()
            cursor.execute("INSERT INTO Requests (user_id) OUTPUT INSERTED.request_id VALUES (?)", (current_user.id,))

            request_id = cursor.fetchone()[0]

            # Initialize the list of items requested
            request_items = []

            # Define data to insert
            for item in items:
                request_item_data = (request_id, item["item_id"], item["quantity_requested"], current_user.id)
                request_items.append(request_item_data)

            # Insert request
            cursor.executemany("INSERT INTO RequestItems (request_id, item_id, quantity_requested, user_id) VALUES (?, ?, ?, ?);",
                            (request_items))

            conn.commit()

            return jsonify({"request_id": request_id})
        except Exception as e:
            # Rollback if there is an error
            conn.rollback()
            print(e)
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    return render_template("index.html", user=current_user)
