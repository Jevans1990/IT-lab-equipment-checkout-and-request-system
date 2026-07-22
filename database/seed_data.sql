USE LabCheckoutSystem;
GO

INSERT INTO Users (first_name, last_name, email, student_id, role, username, password)
VALUES
('John', 'Student', 'john.student@school.edu', 'S1001', 'Student', 'jstudent', 'js123'),
('Maya', 'Borrower', 'maya.borrower@school.edu', 'S1002', 'Student', 'mborrower', 'mb123'),
('Amy', 'Admin', 'amy.admin@school.edu', 'A1001', 'Admin', 'admin', 'aa123');
GO

INSERT INTO Inventory
(item_name, quantity_total, quantity_available, description, availability_status, rental_period_days)
VALUES
('Dell Laptop', 5, 5, 'General use lab laptop', 'Available', 7),
('Canon Camera', 3, 3, 'Camera for photography and media projects', 'Available', 5),
('HDMI Cable', 10, 10, 'Standard HDMI cable', 'Available', 3),
('USB-C Adapter', 8, 8, 'USB-C multiport adapter', 'Available', 3),
('Tripod Kit', 4, 4, 'Adjustable tripod kit', 'Available', 5),
('Microphone Kit', 2, 2, 'Portable microphone recording kit', 'Available', 5);
GO

INSERT INTO Requests (user_id, reason_description)
VALUES
(1, 'Need equipment for a class media project.');
GO

INSERT INTO RequestItems (request_id, item_id, quantity_requested)
VALUES
(1, 1, 1),
(1, 2, 1),
(1, 3, 2);
GO
