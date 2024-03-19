import os
from flask import Flask, render_template, request, redirect, url_for
import psycopg2

app = Flask(__name__)

DATABASE_URL = os.environ.get("DB_CONNECTION_STRING")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/submit", methods=["POST"])
def submit():
    if request.method == "POST":
        email = request.form["email"]
        if email:
            try:
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute("INSERT INTO emails (email) VALUES (%s)", (email,))
                conn.commit()
                cur.close()
                conn.close()
                print("done")
                return redirect(url_for("index"))
            except Exception as e:
                return f"An error occurred: {e}"
        else:
            return "Email address cannot be empty."


if __name__ == "__main__":
    app.run(debug=True)
