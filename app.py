import os
from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.point'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128), nullable=False)
    point = db.Column(db.Integer, nullable=False)

@app.route("/", methods=["GET"])
def index():
    scores = Score.query.order_by(Score.point.desc()).all()
    for i, score in enumerate(scores, start=1):
        score.rank = i
    return render_template("index.html", scores=scores)

@app.route("/game", methods=["GET"])
def game():
    return render_template("game/index.html")

@app.route("/register", methods=["GET"])
def register_page():
    return render_template("register/index.html")

@app.route("/register", methods=["POST"])
def register_process():
    username = request.form.get("username")
    point = request.form.get("point")
    result = Score(username=username, point=point)
    db.session.add(result)
    db.session.commit()
    return redirect(url_for("index"))
    
if __name__ == '__main__':
    if not os.path.exists('instance/db.score'):
        with app.app_context():
            db.create_all()
    app.run(debug=True)
