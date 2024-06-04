# VibeCheck Backend

## Commands

```
flyctl proxy 5432 --app testsql
fly deploy --ha=false
```

## Requirements

Python3.6+

## Setup Application

via macOS/Linux Bash Terminal

```
git clone https://github.com/iamharryliu/vibecheck-flask.git
cd vibecheck-flask
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python dev_manager.py setup_db
python dev_manager.py dev_db
```

via Windows Git Bash Terminal

```
git clone https://github.com/iamharryliu/vibecheck-flask.git
cd vibecheck-flask
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python dev_manager.py setup_db
python dev_manager.py dev_db
```

via Windows CMD

```
git clone https://github.com/iamharryliu/vibecheck-flask.git
cd vibecheck-flask
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python dev_manager.py setup_db
python dev_manager.py dev_db
```

## Running Application

via macOS/Linux Bash Terminal

```
cd vibecheck-flask
source venv/bin/activate
python dev_manager.py runserver --host=0.0.0.0
```

via Windows Git Bash Terminal

```
cd vibecheck-flask
source venv/Scripts/activate
python dev_manager.py runserver --host=0.0.0.0
```

via Windows CMD

```
cd vibecheck-flask
.\venv\Scripts\activate
python dev_manager.py runserver --host=0.0.0.0
```

**NOTE FOR WINDOWS USERS:** Running the server on localhost seems to have some sort of latency issue due to how Windows hosts/network are configured. The following is required to avoid this latency when running the application:

- running the frontend and backend application with `--host=0.0.0.0`
  - `python dev_manager runserver --host=0.0.0.0` for Flask app
  - `ng serve --host=0.0.0.0` for Angular app
- changing the `backendUrl` in the Angular application's `environment.ts` file to your local ip address, `192.168.X.X`

## Manager

Manager commands can be found in the `..manager.py` files. We currently have 2 managers, one for unit testing and one for a mock dev environment.

### Commands

#### Unit Tests

To run unit tests run the test server in one terminal and run the tests in another terminal. (this shoud be fixed later so that we don't have to do this..)

```
python test_manager.py runserver
```

```
python test_manager.py test
```

#### Dev Environment

Fresh database

```
python dev_manager.py setup_db
```

Setup dev mock db.

```
python dev_manager.py setup_db
python dev_manager.py dev_db
```

Creating admin account requires a username and password.

```
python dev_manager.py create_admin
```

Run server.

```
python dev_manager.py runserver
```

#### SQLAlchemy DB Command Line

To manipulate the app's database through Flask SQLAlchemy commands you can push the context of the application by entering the following lines in the Python CLI.

```
from App import create_app, db, bcrypt
from App.models import *
app = create_app()
ctx = app.app_context()
ctx.push()
```

##### Change Password Example

Here is an example of how to change a specific user's password.

```
user = User.query.filter_by(username="your_username").first()
hashed_password = bcrypt.generate_password_hash("password").decode("utf-8")
user.password = hashed_password
db.session.commit()
```
