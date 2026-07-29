# IT Lab Equipment Checkout and Request System

The IT Lab Equipment Checkout and Request System is a locally hosted web application for managing shared lab equipment. Students and staff can browse available inventory, submit requests for one or more items, and review their request history. Administrators can approve or deny requests, process returned equipment, and maintain inventory records.

This project was created as a classroom demonstration using a Flask backend and a Microsoft SQL Server database. It is currently intended to run locally, but its structure can be adapted for network or public deployment later.

## Main Features

- User and administrator login
- Role-based student and administrator views
- Inventory loaded from SQL Server
- Equipment categories, conditions, quantities, descriptions, and checkout periods
- Multi-item equipment requests
- Administrator approval and denial of requests
- Automatic inventory updates when requests are approved
- Return processing that restores available inventory
- Checkout history and return reports
- Overdue and damaged-equipment tracking
- Administrator tools for adding, updating, deleting, and damaging out inventory

## Technology Used

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Python
- Flask
- Flask-Login
- pyodbc

### Database

- Microsoft SQL Server Express
- SQL Server Management Studio, or another compatible database manager
- Microsoft ODBC Driver 18 for SQL Server

## Project Structure

```text
IT-lab-equipment-checkout-and-request-system/
├── database/
│   ├── schema.sql
│   ├── seed_data.sql
│   └── test_queries.sql
├── website/
│   ├── static/
│   │   ├── script.js
│   │   └── styles.css
│   ├── templates/
│   │   └── index.html
│   ├── __init__.py
│   ├── auth.py
│   ├── db.py
│   ├── inventory.py
│   ├── models.py
│   ├── requests.py
│   └── views.py
├── main.py
├── README.md
└── requirements.txt
```

## Requirements

Before running the project, install:

- Python 3
- Microsoft SQL Server Express
- Microsoft ODBC Driver 18 for SQL Server
- SQL Server Management Studio or another compatible database manager
- A modern web browser

The project currently expects:

```text
SQL Server instance: localhost\SQLEXPRESS
Database name: LabCheckoutSystem
Authentication: Windows authentication
```

If your SQL Server setup uses a different server or instance name, update the connection string in `website/db.py`.

## Installation

### 1. Download the project

Clone the repository:

```bash
git clone https://github.com/Jevans1990/IT-lab-equipment-checkout-and-request-system.git
```

Then enter the project folder:

```bash
cd IT-lab-equipment-checkout-and-request-system
```

You can also download the repository as a ZIP file and extract it.

### 2. Create a virtual environment

Creating a virtual environment is recommended so the project packages stay separate from other Python projects.

On Windows:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks the activation script, Command Prompt can use:

```cmd
.venv\Scripts\activate.bat
```

### 3. Install the Python packages

```bash
pip install -r requirements.txt
```

### 4. Create the database

1. Open SQL Server Management Studio.
2. Connect to the local `SQLEXPRESS` instance.
3. Open and run `database/schema.sql`.
4. Open and run `database/seed_data.sql`.
5. Optionally run `database/test_queries.sql` to confirm that the tables and starting data were created correctly.

`schema.sql` creates the `LabCheckoutSystem` database and its required tables. Run it only when creating a new database.

### 5. Verify the database connection

The default connection in `website/db.py` uses:

```python
connection_string = (
    "DRIVER={ODBC Driver 18 for SQL Server};"
    r"SERVER=localhost\SQLEXPRESS;"
    "DATABASE=LabCheckoutSystem;"
    "Trusted_Connection=yes;"
    "TrustServerCertificate=yes;"
)
```

Change this connection string if your SQL Server instance or authentication method is different.

## Running the Application

From the main project folder, run:

```bash
python main.py
```

Flask will display a local address, normally:

```text
http://127.0.0.1:5000
```

Open that address in a web browser.

## Demonstration Accounts

The seed data creates student and administrator accounts for local testing:

| Role | Username | Password |
| --- | --- | --- |
| Student | `jstudent` | `js123` |
| Student | `mborrower` | `mb123` |
| Administrator | `admin` | `aa123` |

These accounts are intended only for the classroom demonstration.

## Suggested Demonstration

The following process demonstrates the connection between the frontend, Flask, and SQL Server:

1. Log in as a student.
2. Add one or more available items to the request list.
3. Submit the equipment request.
4. Log out and sign in as an administrator.
5. Review and approve the pending request.
6. Confirm that the available inventory quantity decreases.
7. Process the equipment return.
8. Confirm that the available quantity increases and the return appears in the checkout history.
9. Refresh the page after major actions to confirm the information was saved in the database.

## Database Overview

The database uses the following main tables:

- `Users` stores student and administrator accounts.
- `Inventory` stores equipment information and available quantities.
- `Requests` stores each request and its approval status.
- `RequestItems` connects one or more inventory items to a request.
- `Reports` stores return, damage, completion, and on-time information.

## Deployment Notes

The current version is designed as a locally hosted demonstration. It can be prepared for network or public deployment later by:

- Moving the secret key and database settings into environment variables
- Disabling Flask debug mode
- Running Flask through a production WSGI server such as Waitress
- Hosting SQL Server somewhere accessible to the application server
- Updating the authentication method and database connection string
- Improving password storage and production error handling

These changes would prepare the existing application for deployment without requiring the project to be rebuilt from the beginning.

## Current Scope

This project demonstrates the complete equipment-checkout workflow and the connection between a browser frontend, a Python backend, and a relational database. Public hosting and production security configuration are outside the current classroom scope.

## Contributers

- Lily
- Ben
- Ethan

A special thanks to Jerrod for getting us started on the front-end!