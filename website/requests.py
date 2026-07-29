from flask import Blueprint, render_template, request, jsonify, flash
from flask_login import current_user, login_required
import json
from datetime import datetime, timedelta

from .db import get_connection

requests = Blueprint("requests", __name__)

@requests.route("/submit-request", methods=["POST"])
@login_required
def submit_request():
    if current_user.role == "Student":
        flash("Unauthorized access.", category="error")
    else:
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
                    cursor.execute("SELECT item_id FROM Inventory WHERE item_name = ?", (item["item_name"]))
                    item_id = cursor.fetchone()[0]

                    if item_id is None:
                        # Stop if the item is not found
                        flash("Item not found.", category="error")
                        return jsonify({"error": "Item not found."}), 400
                    else:
                        # Append the item data to insert
                        request_item_data = (request_id, item_id, item["quantity_requested"], current_user.id)
                        request_items.append(request_item_data)

                # Insert request
                cursor.executemany("INSERT INTO RequestItems (request_id, item_id, quantity_requested, user_id) VALUES (?, ?, ?, ?);",
                                (request_items,))

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

@requests.route("/request-decision", methods=["POST"])
@login_required
def request_decision():
    if current_user.role == "Student":
        flash("Unauthorized access.", category="error")
    else:
        if request.method == "POST":
            # Get request id and decision
            request_id = request.form["request_id"]
            decision = request.form["decision"]

            # Connect to database
            conn = get_connection()

            try:
                cursor = conn.cursor()

                if decision == "approve":
                    # Get requested items
                    cursor.execute("SELECT item_id, quantity_requested FROM RequestItems WHERE request_id = ?",
                                (request_id,))

                    requested_items = cursor.fetchall()

                    for requested_item in requested_items:
                        # Get the available inventory
                        cursor.execute("SELECT quantity_available FROM Inventory WHERE item_id = ?",
                                    (requested_item[0],))

                        # Calculate the new quantity available
                        qty_available = cursor.fetchone()[0]
                        new_qty_available = qty_available - requested_item[1]

                        if new_qty_available < 0:
                            # Don't update inventory if there isn't enough items available
                            flash("Insufficient available inventory.", category="error")
                            conn.rollback()
                            return jsonify({"error": "Insufficient available inventory."}), 400
                        else:
                            # Update available inventory
                            cursor.execute("""
                                UPDATE Inventory
                                SET quantity_available = ?
                                WHERE item_id = ?""",
                                (new_qty_available, requested_item[0],))

                    # Get approval date
                    approval_date = datetime.now().date()

                    # Update request
                    cursor.execute("""
                        UPDATE Requests
                        SET request_status = ?, approved_by = ?, approval_date = ?
                        WHERE request_id = ?""",
                        ("Approved", current_user.id, approval_date, request_id,))

                    conn.commit()
                elif decision == "deny":
                    # Get approval date
                    approval_date = datetime.now().date()

                    # Update request
                    cursor.execute("""
                        UPDATE Requests
                        SET request_status = ?, approved_by = ?, approval_date = ?
                        WHERE request_id = ?""",
                        ("Denied", current_user.id, approval_date, request_id,))

                    conn.commit()
                return jsonify({"success": True})
            except Exception as e:
                # Rollback if there is an error
                conn.rollback()
                print(e)
                return jsonify({"error": str(e)}), 500
            finally:
                cursor.close()
                conn.close()

    return render_template("index.html", user=current_user)

@requests.route("/process-return", methods=["POST"])
@login_required
def process_return():
    if current_user.role == "Student":
        flash("Unauthorized access.", category="error")
    else:
        if request.method == "POST":
            # Get the request id
            request_id = request.form["request_id"]

            # Connect to database
            conn = get_connection()

            try:
                cursor = conn.cursor()

                cursor.execute("SELECT request_item_id, item_id, quantity_requested FROM RequestItems WHERE request_id = ?",
                                            (request_id,))

                requested_items = cursor.fetchall()

                for requested_item in requested_items:
                    # Get the available inventory
                    cursor.execute("SELECT quantity_available FROM Inventory WHERE item_id = ?",
                                    (requested_item[1],))

                    # Calculate the new quantity available
                    qty_available = cursor.fetchone()[0]
                    new_qty_available = qty_available + requested_item[2]

                    # Update available inventory
                    cursor.execute("""
                        UPDATE Inventory
                        SET quantity_available = ?
                        WHERE item_id = ?""",
                        (new_qty_available, requested_item[1],))

                # Update request
                cursor.execute("""
                    UPDATE Requests
                    SET request_status = ?
                    WHERE request_id = ?""",
                    ("Returned", request_id,))

                # Get the request date
                cursor.execute("SELECT approval_date FROM Requests WHERE request_id = ?",
                            (request_id,))

                approval_date = cursor.fetchone()[0]

                # Get the return date
                return_date = datetime.now().date()

                for returned_requested_item in requested_items:
                    # Get the number of rental days
                    cursor.execute("SELECT rental_period_days FROM Inventory WHERE item_id = ?",
                                (returned_requested_item[1],))

                    rental_days = cursor.fetchone()[0]

                    # Check if the item was returned on time
                    returned_on_time = 1
                    if return_date > approval_date + timedelta(days=rental_days):
                        returned_on_time = 0

                    # Create a report for each returned item
                    cursor.execute("INSERT INTO Reports (request_item_id, date_returned, returned_on_time, completion_status) VALUES (?, ?, ?, ?)",
                                (returned_requested_item[0], return_date, returned_on_time, "Complete"))

                conn.commit()
            except Exception as e:
                # Rollback if there is an error
                conn.rollback()
                print(e)
                return jsonify({"error": str(e)}), 500
            finally:
                cursor.close()
                conn.close()

    return render_template("index.html", user=current_user)