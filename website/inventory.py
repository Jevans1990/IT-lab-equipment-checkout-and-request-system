from flask import Blueprint, render_template, request, flash
from flask_login import current_user, login_required

from .db import get_connection

inventory = Blueprint("inventory", __name__)

@inventory.route("/add-item", methods=["POST"])
@login_required
def add_item():
    if current_user.role == "Student":
        flash("Unauthorized access.", category="error")
    else:
        if request.method == "POST":
            # Get new item data
            item_name = request.form.get("add-item-name")
            item_category = request.form.get("add-item-category")
            item_condition = request.form.get("add-item-condition")
            item_qty = request.form.get("add-item-qty")
            item_description = request.form.get("add-item-description")
            item_checkout_days = request.form.get("add-item-checkout-days")

            # Connect to database
            conn = get_connection()

            try:
                cursor = conn.cursor()

                # Check if the item already exists
                cursor.execute("SELECT item_id FROM Inventory WHERE item_name = ?",
                            (item_name,))
                existing_item = cursor.fetchone()

                if existing_item:
                    # Stop if the item exists
                    flash("Item already exists.", category="error")
                else:
                    # Insert the new item into the database
                    cursor.execute("INSERT INTO Inventory (item_name, quantity_total, quantity_available, item_category, item_condition, description, rental_period_days) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                (item_name, item_qty, item_qty, item_category, item_condition, item_description, item_checkout_days,))

                    conn.commit()
            except Exception as e:
                # Rollback if there is an error
                conn.rollback()
                print(e)
            finally:
                cursor.close()
                conn.close()

    return render_template("index.html", user=current_user)

@inventory.route("/update-item", methods=["POST"])
@login_required
def update_item():
    if current_user.role == "Student":
        flash("Unauthorized access.", category="error")
    else:
        if request.method == "POST":
            # Get updated data
            item_name = request.form.get("update-item-name")
            item_category = request.form.get("update-item-category")
            item_condition = request.form.get("update-item-condition")
            item_qty = request.form.get("update-item-qty")
            item_description = request.form.get("update-item-description")
            item_checkout_days = request.form.get("update-item-checkout-days")

            # Connect to database
            conn = get_connection()

            try:
                cursor = conn.cursor()

                # Get item data
                cursor.execute("SELECT item_name, item_category, item_condition, quantity_total, description, rental_period_days FROM Inventory WHERE item_name = ?",
                            (item_name,))
                inventory_item = cursor.fetchone()

                if inventory_item is None:
                    # Stop if the item does not exist
                    flash("Item does not exist.", category="error")
                    return render_template("index.html", user=current_user)
                else:
                    # Update data
                    if item_category != inventory_item[1]:
                        # Update item category
                        cursor.execute("""
                            UPDATE Inventory
                            SET item_category = ?
                            WHERE item_name = ?""",
                            (item_category, item_name,))

                        conn.commit()

                    if item_condition != inventory_item[2]:
                        #Update item condition
                        cursor.execute("""
                            UPDATE Inventory
                            SET item_condition = ?
                            WHERE item_name = ?""",
                            (item_condition, item_name,))

                        conn.commit()

                    if item_qty != inventory_item[3]:
                        # Update total quantity
                        cursor.execute("""
                            UPDATE Inventory
                            SET quantity_total = ?, quantity_available = ?
                            WHERE item_name = ?""",
                            (item_qty, item_qty, item_name,))

                        conn.commit()

                    if item_description != inventory_item[4]:
                        # Update item description
                        cursor.execute("""
                            UPDATE Inventory
                            SET description = ?
                            WHERE item_name = ?""",
                            (item_description, item_name,))

                        conn.commit()

                    if item_checkout_days != inventory_item[5]:
                        # Update number of rental days
                        cursor.execute("""
                            UPDATE Inventory
                            SET rental_period_days = ?
                            WHERE item_name = ?""",
                            (item_checkout_days, item_name,))

                        conn.commit()
            except Exception as e:
                # Rollback if there is an error
                conn.rollback()
                print(e)
            finally:
                cursor.close()
                conn.close()

    return render_template("index.html", user=current_user)

@inventory.route("/modify-item", methods=["POST"])
@login_required
def modify_item():
    if current_user.role == "Student":
        flash("Unauthorized access.", category="error")
    else:
        if request.method == "POST":
            # Get modify item data
            delete_item_id = request.form.get("delete-item-name")
            damage_item_id = request.form.get("damage-item-name")

            # Connect to database
            conn = get_connection()

            try:
                cursor = conn.cursor()

                if delete_item_id:
                    # Delete an item
                    cursor.execute("DELETE FROM Inventory WHERE item_id = ?",
                                (delete_item_id,))

                    conn.commit()
                elif damage_item_id:
                    # Damage out an item
                    cursor.execute("SELECT quantity_available FROM Inventory WHERE item_id = ?",
                                (damage_item_id,))

                    damage_item_qty_available = cursor.fetchone()[0]

                    if damage_item_qty_available <= 0:
                        flash("No inventory available.", category="error")
                    else:
                        new_qty_available = damage_item_qty_available - 1

                        cursor.execute("""
                            UPDATE Inventory
                            SET quantity_available = ?
                            WHERE item_id = ?""",
                            (new_qty_available, damage_item_id,))

                        conn.commit()
            except Exception as e:
                # Rollback if there is an error
                conn.rollback()
                print(e)
            finally:
                cursor.close()
                conn.close()

    return render_template("index.html", user=current_user)