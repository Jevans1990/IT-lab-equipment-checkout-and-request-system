-- ============================================================
-- Lab Checkout System
-- Database Schema
-- ============================================================

CREATE DATABASE LabCheckoutSystem;
GO

USE LabCheckoutSystem;
GO

-- ============================================================
-- Users
-- ============================================================

CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,

    last_name VARCHAR(50) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,

    student_id VARCHAR(25),

    role VARCHAR(25)
        NOT NULL
        DEFAULT 'Student'
);
GO

-- ============================================================
-- Inventory
-- ============================================================

CREATE TABLE Inventory (
    item_id INT IDENTITY(1,1) PRIMARY KEY,

    item_name VARCHAR(100) NOT NULL,

    quantity_total INT NOT NULL
        CHECK (quantity_total >= 0),

    quantity_available INT NOT NULL
        CHECK (quantity_available >= 0),

    description VARCHAR(255),

    availability_status VARCHAR(25)
        NOT NULL
        DEFAULT 'Available',

    rental_period_days INT NOT NULL
        DEFAULT 7
);
GO

-- ============================================================
-- Requests
-- ============================================================

CREATE TABLE Requests (
    request_id INT IDENTITY(1,1) PRIMARY KEY,

    user_id INT NOT NULL,

    request_date DATE
        NOT NULL
        DEFAULT CAST(GETDATE() AS DATE),

    reason_description VARCHAR(255),

    request_status VARCHAR(25)
        NOT NULL
        DEFAULT 'Pending',

    approved_by INT NULL,

    approval_date DATE NULL,

    CONSTRAINT FK_Requests_User
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id),

    CONSTRAINT FK_Requests_Admin
        FOREIGN KEY (approved_by)
        REFERENCES Users(user_id)
);
GO

-- ============================================================
-- RequestItems
-- ============================================================

CREATE TABLE RequestItems (

    request_item_id INT IDENTITY(1,1) PRIMARY KEY,

    request_id INT NOT NULL,

    item_id INT NOT NULL,

    quantity_requested INT NOT NULL
        DEFAULT 1
        CHECK (quantity_requested > 0),

    CONSTRAINT FK_RequestItems_Request
        FOREIGN KEY (request_id)
        REFERENCES Requests(request_id),

    CONSTRAINT FK_RequestItems_Inventory
        FOREIGN KEY (item_id)
        REFERENCES Inventory(item_id)

);
GO

-- ============================================================
-- Reports
-- ============================================================

CREATE TABLE Reports (
    report_id INT IDENTITY(1,1) PRIMARY KEY,

    request_item_id INT NOT NULL,

    date_returned DATE NULL,

    damaged_state VARCHAR(25)
        NOT NULL
        DEFAULT 'Not Damaged',

    damage_description VARCHAR(255) NULL,

    returned_on_time BIT NULL,

    completion_status VARCHAR(25)
        NOT NULL
        DEFAULT 'Incomplete',

    CONSTRAINT FK_Reports_RequestItems
        FOREIGN KEY (request_item_id)
        REFERENCES RequestItems(request_item_id)
);
GO