from App import bcrypt


def generate_password(password):
    return bcrypt.generate_password_hash(password).decode("utf-8")
