import os
import random
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.point'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')  # 環境変数から読み込む
app.config['SESSION_TYPE'] = 'filesystem'

db = SQLAlchemy(app)
Session(app)

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
    session['score'] = 0
    session['correct_count'] = 0
    return render_template("game/index.html")

@app.route("/register", methods=["GET"])
def register_page():
    return render_template("register/index.html")

@app.route("/register", methods=["POST"])
def register_process():
    username = request.form.get("username")
    point = session.get('score', 0)
    result = Score(username=username, point=point)
    db.session.add(result)
    db.session.commit()
    return redirect(url_for("index"))

@app.route("/generate_primes", methods=["POST"])
def generate_primes():
    correct_count = session.get('correct_count', 0)

    def is_prime(num):
        if num <= 1:
            return False
        if num == 2:
            return True
        if num % 2 == 0:
            return False
        for i in range(3, int(num**0.5) + 1, 2):
            if num % i == 0:
                return False
        return True

    def generate_prime(max_num):
        while True:
            num = random.randint(1, max_num)
            if is_prime(num):
                return num

    max_num = 10 + correct_count
    prime1 = generate_prime(max_num)
    prime2 = generate_prime(max_num)
    product = prime1 * prime2

    session['prime1'] = prime1
    session['prime2'] = prime2

    return jsonify({'product': product})

@app.route("/check_primes", methods=["POST"])
def check_primes():
    data = request.json
    prime1_input = data['prime1']
    prime2_input = data['prime2']
    product = data['product']
    prime1 = session.get('prime1')
    prime2 = session.get('prime2')
    score = session.get('score', 0)
    correct_count = session.get('correct_count', 0)

    if (prime1_input == prime1 and prime2_input == prime2) or (prime1_input == prime2 and prime2_input == prime1):
        if score < product:
            score = product
        correct_count += 1
        result = '正解'
    else:
        result = '不正解'
    
    session['score'] = score
    session['correct_count'] = correct_count

    return jsonify({'result': result, 'score': score, 'correct_count': correct_count})

if __name__ == '__main__':
    if not os.path.exists('instance/db.point'):
        with app.app_context():
            db.create_all()
    app.run(debug=False, host="0.0.0.0")
