SELECT
    r.request_id,
    u.first_name,
    u.last_name,
    r.request_date,
    r.reason_description,
    r.request_status,
    i.item_name,
    ri.quantity_requested
FROM Requests r
JOIN Users u
    ON r.user_id = u.user_id
JOIN RequestItems ri
    ON r.request_id = ri.request_id
JOIN Inventory i
    ON ri.item_id = i.item_id;