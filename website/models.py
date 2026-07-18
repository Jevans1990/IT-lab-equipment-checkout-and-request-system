from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, row):
        self.id = row[0]
        self.first_name = row[1]
        self.last_name = row[2]
        self.email = row[3]
        self.student_id = row[4]
        self.role = row[5]
        self.username = row[6]
        self.password = row[7]