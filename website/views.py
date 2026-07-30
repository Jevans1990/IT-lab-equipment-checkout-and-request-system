from flask import Blueprint, render_template
from flask_login import current_user
from datetime import timedelta

from .db import get_connection

views = Blueprint("views", __name__)

@views.route("/")
def home():
    # Connect to database
    conn = get_connection()

    # Initialize admin variables
    pending_requests = []
    rental_history = []
    reports = []

    # Query the database
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Inventory;")

        # Convert the inventory items to dicts
        inventory = [
            {
                "item_id": row.item_id,
                "item_name": row.item_name,
                "quantity_total": row.quantity_total,
                "quantity_available": row.quantity_available,
                "item_category": row.item_category,
                "item_condition": row.item_condition,
                "description": row.description,
                "rental_period_days": row.rental_period_days
            }
            for row in cursor.fetchall()
        ]

        if current_user.is_authenticated:
            # Get all pending requests
            cursor.execute("SELECT * FROM Requests WHERE request_status = ?",
                            ("Pending",))
            all_pending_requests = cursor.fetchall()

            for pending_request in all_pending_requests:
                cursor.execute("SELECT * FROM RequestItems WHERE request_id = ?",
                                (pending_request.request_id,))
                
                requested_items = cursor.fetchall()

                requested_item_data = []

                for request_item in requested_items:
                    cursor.execute("SELECT item_name, rental_period_days FROM Inventory WHERE item_id = ?",
                                    (request_item.item_id,))
                    request_item_data = cursor.fetchone()

                    cursor.execute("SELECT date_returned FROM Reports WHERE request_item_id = ?",
                                   (request_item.request_item_id,))
                    request_item_return_date = cursor.fetchone()

                    requested_item_data.append({
                        "item_name": request_item_data[0],
                        "checkout_days": request_item_data[1],
                        "return_date": request_item_return_date
                    })

                pending_request_data = {
                        "request_id": pending_request.request_id,
                        "user_id": pending_request.user_id,
                        "request_date": pending_request.request_date,
                        "reason_description": pending_request.reason_description,
                        "request_status": pending_request.request_status,
                        "approved_by": pending_request.approved_by,
                        "approval_date": pending_request.approval_date,
                        "items": [
                            {"itemId": requested_item.item_id,
                                "itemName": requested_item_data[index]["item_name"],
                                "quantity": requested_item.quantity_requested,
                                "checkoutDays": requested_item_data[index]["checkout_days"],
                                "due_date": pending_request.approval_date + timedelta(days=requested_item_data[index]["checkout_days"]),
                                "return_date": requested_item_data[index]["return_date"]
                                }
                            for index, requested_item in enumerate(requested_items)
                        ]
                    }

                pending_requests.append(pending_request_data)
            # Get all other requests
            cursor.execute("SELECT * FROM Requests WHERE request_status = ? OR request_status = ? OR request_status = ?",
                                        ("Approved", "Denied", "Returned"))
            all_request_history = cursor.fetchall()

            for request in all_request_history:
                cursor.execute("SELECT * FROM RequestItems WHERE request_id = ?",
                                (request.request_id,))
                
                requested_items_history = cursor.fetchall()

                requested_item_history_data = []

                for request_item_history in requested_items_history:
                    cursor.execute("SELECT item_name, rental_period_days FROM Inventory WHERE item_id = ?",
                                    (request_item_history.item_id,))
                    request_item_history_data = cursor.fetchone()

                    requested_item_history_data.append({
                        "item_name": request_item_history_data[0],
                        "checkout_days": request_item_history_data[1]
                    })

                request_history_data = {
                        "request_id": request.request_id,
                        "user_id": request.user_id,
                        "request_date": request.request_date,
                        "reason_description": request.reason_description,
                        "request_status": request.request_status,
                        "approved_by": request.approved_by,
                        "approval_date": request.approval_date,
                        "items": [
                            {"itemId": requested_item_history.item_id,
                                "itemName": requested_item_history_data[index]["item_name"],
                                "quantity": requested_item_history.quantity_requested,
                                "checkoutDays": requested_item_history_data[index]["checkout_days"]
                                }
                            for index, requested_item_history in enumerate(requested_items_history)
                        ]
                    }

                rental_history.append(request_history_data)
    finally:
        cursor.close()
        conn.close()

    return render_template("index.html", user=current_user, inventory=inventory, pending_requests=pending_requests, rental_history=rental_history, reports=reports)
