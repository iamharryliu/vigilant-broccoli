import os
from flask import Flask, render_template, request, redirect, url_for
import psycopg2

app = Flask(__name__)

DATABASE_URL = os.environ.get("GTA_UPDATE_ALERTS_DB")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


@app.route("/")
def index():
    return render_template("index.html")


@app.post("/submit")
def submit():
    email = request.form["email"]
    if email:
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("INSERT INTO emails (email) VALUES (%s)", (email,))
            conn.commit()
            cur.close()
            conn.close()
            return (
                f"You have successfully subscribed {email}, you can close this window."
            )
        except:
            return "Something went wrong. Have you already signed up?"
    else:
        return redirect(url_for("index"))


@app.get("/get_emails")
def alert_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT email FROM emails;"
    cursor.execute(query)
    emails = [email[0] for email in cursor.fetchall()]
    return {"emails": emails}


@app.get("/unsubscribe")
def unsubscribe():
    email = request.args.get("email")
    if email:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM emails WHERE email = %s", (email,))
            conn.commit()
            cursor.close()
            conn.close()
            return f"You have successfully unsubscribed {email}, you can close this window."
        except:
            return "Something went wrong."
    else:
        return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)
