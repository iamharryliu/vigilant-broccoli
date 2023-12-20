class MOCK_USER:
    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password = password

    def get_register_json(self):
        return {
            "username": self.username,
            "email": self.email,
            "password": self.password,
        }

    def get_login_json(self):
        return {
            "identification": self.username,
            "password": self.password,
        }


class MOCK_USER_BUILDER:
    def build_user(n=0):
        return MOCK_USER(
            username=f"username{n}", email=f"email{n}", password="password"
        )
