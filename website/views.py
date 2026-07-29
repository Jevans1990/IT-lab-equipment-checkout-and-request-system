from flask import Blueprint, render_template
from flask_login import current_user

from .db import get_connection

views = Blueprint("views", __name__)

@views.route("/")
def home():
    # Connect to database
    conn = get_connection()

    # Initialize student variables
    user_requests = None
    user_requested_items = None

    # Initialize admin variables
    requests = None
    requested_items = None
    reports = None

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
            if current_user.role == "Student":
                # Get requests
                cursor.execute("SELECT * FROM Requests WHERE user_id = ?", (current_user.id))
                user_requests = [
                    {
                        "request_id": row.request_id,
                        "user_id": row.user_id,
                        "request_date": row.request_date,
                        "reason_description": row.reason_description,
                        "request_status": row.request_status,
                        "approved_by": row.approved_by,
                        "approval_date": row.approval_date
                    }
                    for row in cursor.fetchall()
                ]

                # Get request items
                cursor.execute("SELECT * FROM RequestItems WHERE user_id = ?", (current_user.id))
                user_requested_items = [
                    {
                        "request_item_id": row.request_item_id,
                        "request_id": row.request_id,
                        "item_id": row.item_id,
                        "quantity_requested": row.quantity_requested,
                        "user_id": row.user_id
                    }
                    for row in cursor.fetchall()
                ]
            elif current_user.role == "Admin":
                # Get all requests
                cursor.execute("SELECT * FROM Requests")
                requests = [
                    {
                        "request_id": row.request_id,
                        "user_id": row.user_id,
                        "request_date": row.request_date,
                        "reason_description": row.reason_description,
                        "request_status": row.request_status,
                        "approved_by": row.approved_by,
                        "approval_date": row.approval_date
                    }
                    for row in cursor.fetchall()
                ]

                # Get all request items
                cursor.execute("SELECT * FROM RequestItems")
                requested_items = [
                    {
                        "request_item_id": row.request_item_id,
                        "request_id": row.request_id,
                        "item_id": row.item_id,
                        "quantity_requested": row.quantity_requested,
                        "user_id": row.user_id
                    }
                    for row in cursor.fetchall()
                ]

                # Get all reports
                cursor.execute("SELECT * FROM Reports")
                reports = [
                    {
                        "report_id": row.report_id,
                        "request_item_id": row.request_item_id,
                        "date_returned": row.date_returned,
                        "damaged_state": row.damaged_state,
                        "damage_description": row.damage_description,
                        "returned_on_time": row.returned_on_time,
                        "completion_status": row.completion_status
                    }
                    for row in cursor.fetchall()
                ]
    finally:
        cursor.close()
        conn.close()

    return render_template("index.html", user=current_user, inventory=inventory, user_requests=user_requests, user_requested_items=user_requested_items, requests=requests, requested_items=requested_items, reports=reports)
