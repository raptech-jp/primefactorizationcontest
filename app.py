import os
import random
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session

app = Flask(__name__)
# Configure database URI: use env variable if provided (for Docker), otherwise fallback to local SQLite
db_uri = os.environ.get('SQLALCHEMY_DATABASE_URI')
if db_uri:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.point'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')  # default for dev/test
app.config['SESSION_TYPE'] = 'filesystem'

db = SQLAlchemy(app)
Session(app)

# Database model for scores
class Score(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128), nullable=False)
    point    = db.Column(db.Integer, nullable=False)

@app.route('/explanation', methods=['GET'])
def explanation():
    return render_template('explanation/index.html')

@app.route('/', methods=['GET'])
def index():
    # Query all scores and sort by highest points
    scores = Score.query.order_by(Score.point.desc()).all()
    # Assign rank (1-indexed) for display
    for i, score in enumerate(scores, start=1):
        score.rank = i
    return render_template('index.html', scores=scores)


@app.route('/game', methods=['GET', 'POST'])
def game():
    if request.method == 'POST':
        # Starting a new game: ensure a username is provided
        username = request.form.get('username')
        if not username:
            return redirect(url_for('index'))
        # Clear any existing session and initialize new session data
        session.clear()
        session['username'] = username
        session['score'] = 0
        session['correct_count'] = 0
        # Redirect to GET /game to load the game page (PRG pattern)
        return redirect(url_for('game'))
    else:
        # GET request: serve the game page if a session (username) exists
        if 'username' not in session:
            return redirect(url_for('index'))
        # Reset score and count for a new round (in case of page refresh, ensures fresh start)
        session['score'] = 0
        session['correct_count'] = 0
        return render_template('game/index.html')

@app.route('/generate_primes', methods=['POST'])
def generate_primes():
    """Generate a new prime factorization problem (two primes multiplied)."""
    correct_count = session.get('correct_count', 0)
    # Determine the max prime value (increases with number of correct answers)
    max_num = 10 + correct_count * 2

    # Helper: check if a number is prime
    def is_prime(num):
        if num <= 1: return False
        if num == 2: return True
        if num % 2 == 0: return False
        # only check odd divisors up to sqrt(num)
        for i in range(3, int(num**0.5) + 1, 2):
            if num % i == 0:
                return False
        return True

    # Helper: generate a random prime up to max_num, biasing towards larger numbers
    def generate_prime(max_val, bias_factor=0.7):
        while True:
            if random.random() < bias_factor:
                # Pick a random number around max_val (Gaussian distribution biased high)
                num = int(random.gauss(mu=max_val - 10, sigma=max_val / 4))
                num = max(1, min(num, max_val))  # clamp within [1, max_val]
            else:
                # Uniform random pick in [1, max_val]
                num = random.randint(1, max_val)
            if is_prime(num):
                return num

    # Generate two primes and their product
    prime1 = generate_prime(max_num)
    prime2 = generate_prime(max_num)
    product = prime1 * prime2
    # Store the primes in session for later verification
    session['prime1'] = prime1
    session['prime2'] = prime2
    return jsonify({ 'product': product })

@app.route('/check_primes', methods=['POST'])
def check_primes():
    """Check the user's answer and update score/DB accordingly."""
    data = request.get_json()
    p1_input = data.get('prime1')
    p2_input = data.get('prime2')
    product  = data.get('product')
    # Retrieve the actual primes for this round from session
    prime1 = session.get('prime1')
    prime2 = session.get('prime2')
    score = session.get('score', 0)
    correct_count = session.get('correct_count', 0)

    # Verify the answer (order of primes doesn't matter)
    if (p1_input == prime1 and p2_input == prime2) or (p1_input == prime2 and p2_input == prime1):
        # Correct answer: update score and count
        score += product
        correct_count += 1
        session['score'] = score
        session['correct_count'] = correct_count
        result = '正解'
        # Save/update the score in the database
        username = session.get('username')
        if username:
            if 'score_id' in session:
                # Update existing Score record for this game session
                saved_score = Score.query.get(session['score_id'])
                if saved_score:
                    saved_score.point = score
            else:
                # First time saving for this session – create a new Score record
                new_score = Score(username=username, point=score)
                db.session.add(new_score)
                db.session.flush()            # get the new Score ID
                session['score_id'] = new_score.id
            db.session.commit()
    else:
        # Incorrect answer: game over
        result = '不正解'
        # (No score increment; the current score remains as is in session and DB)
        # We could clear session here if we wanted to invalidate the game, 
        # but keeping it until the user returns to title for potential display.

    # Return the result and updated score to the client
    return jsonify({ 'result': result, 'score': score, 'correct_count': correct_count })

if __name__ == '__main__':
    # Ensure the database and table exist before running
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
