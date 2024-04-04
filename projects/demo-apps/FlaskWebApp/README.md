# FlaskWebApp

Flask base application for developing web apps.

### Requirements

Python3.6+

### Installing

Create config file.

```
sudo nano /etc/config.json
```

```
{
        "SECRET_KEY":"your secret key",
        "SQLALCHEMY_DATABASE_URI":"sqlite:///site.db",
        "DEBUG": true,
        "EMAIL_USERNAME":"your email",
        "EMAIL_PASSWORD":"your password",
        "EMAIL_DEFAULT_SENDER":"your email",
        "RECAPTCHA_USE_SSL": false,
        "RECAPTCHA_PUBLIC_KEY": "your pub key",
        "RECAPTCHA_PRIVATE_KEY": "your private key",
        "RECAPTCHA_OPTIONS": {
                "theme": "black"
        },
        "ADMINS":[admin usernames]
}
```

macOS / Linux

```
git clone https://github.com/iamharryliu/FlaskWebApp.git
cd FlaskWebApp
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python setup_db.py
python run.py
```

Windows

```
git clone https://github.com/iamharryliu/FlaskWebApp.git
cd FlaskWebApp
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python setup_db.py
python run.py
```
