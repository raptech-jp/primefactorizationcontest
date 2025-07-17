let product;
let checkPrimesExecuted = false;
let timerInterval;
let remainingTime = 60;

function startTimer() {
    clearInterval(timerInterval);
    remainingTime = 60;
    document.getElementById('timer').innerText = `残り時間: ${remainingTime}秒`;

    timerInterval = setInterval(() => {
        remainingTime--;
        document.getElementById('timer').innerText = `残り時間: ${remainingTime}秒`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
    document.getElementById("modal-container").style.display = "block";
    const resultElement = document.getElementById('result');
    const buttonContainer = document.getElementById('button-container');
    resultElement.innerText = '時間切れ！';
    buttonContainer.innerHTML = `<a href="/" class="btn btn-danger btn-lg">タイトルに戻る</a>`;
}

function fetchProduct() {
    fetch('/generate_primes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        product = data.product;
        document.getElementById('product').textContent = product;
        startTimer(); // 問題取得後にタイマー開始
    })
    .catch(error => console.error('Error:', error));
}

function checkPrimes() {
    const prime1_input = document.getElementById('prime1').value;
    const prime2_input = document.getElementById('prime2').value;

    if (!prime1_input || !prime2_input) {
        alert("両方の素数を入力してください。");
        return;
    }

    if (checkPrimesExecuted) return;
    checkPrimesExecuted = true;
    document.getElementById('checkButton').disabled = true;
    clearInterval(timerInterval);  // タイマー停止

    const p1 = parseInt(prime1_input);
    const p2 = parseInt(prime2_input);

    document.getElementById("modal-container").style.display = "block";
    const resultElement = document.getElementById('result');
    const buttonContainer = document.getElementById('button-container');

    fetch('/check_primes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prime1: p1, prime2: p2, product: product })
    })
    .then(response => response.json())
    .then(data => {
        if (data.result === '正解') {
            resultElement.innerText = '正解';
            buttonContainer.innerHTML = `<button type="button" class="btn btn-success btn-lg" onclick="nextProblem()">次の問題へ</button>`;
        } else {
            resultElement.innerHTML = `
            <div>不正解</div>
            <div style="font-size: 1.2rem; margin-top: 10px;">
            この難しさが暗号に活かされているよ
            </div>
            `;
            buttonContainer.innerHTML = `<a href="/explanation" class="btn btn-danger btn-lg">解説ページへ</a>`;
        }

        document.getElementById('score').innerText = 'スコア: ' + data.score;
    })
    .catch(error => console.error('Error:', error));
}

function nextProblem() {
    checkPrimesExecuted = false;
    fetchProduct();
    document.getElementById('result').innerText = '';
    document.getElementById('button-container').innerHTML = '';
    document.getElementById('checkButton').disabled = false;
    document.getElementById('prime1').value = '';
    document.getElementById('prime2').value = '';
    const modal = document.getElementById("modal-container");
    if (modal) { modal.style.display = "none"; }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('score').innerText = 'スコア: 0';
    fetchProduct();
});
