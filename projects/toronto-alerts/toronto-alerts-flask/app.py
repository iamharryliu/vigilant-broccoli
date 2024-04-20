from App import create_app
from App.config import PROD_CONFIG

app = create_app(config=PROD_CONFIG)

if __name__ == "__main__":
    app.run(debug=True)
