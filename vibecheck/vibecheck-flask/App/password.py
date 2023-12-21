import bcrypt

salt = bcrypt.gensalt()


class PasswordService:
    @staticmethod
    def hash_password(password):
        return bcrypt.hashpw(password.encode("utf-8"), salt)
