from App import create_app
from flask_cors import CORS
from App.config import PROD_CONFIG

app = create_app(PROD_CONFIG)
CORS(app)

if __name__ == "__main__":
    app.run(debug=True)
