let primesAndProduct; // primesAndProductをグローバルスコープで定義
let checkPrimesExecuted = false; //　ボタンが押されたフラグ
correct = 0; // カウント
score = 0; // スコア

// 素数をランダムに生成する関数
function generateRandomPrime() {
    let prime1, prime2;

    // 素数かどうかを判定する関数
    function isPrime(num) {
        if (num <= 1) return false;
        if (num === 2) return true;
        if (num % 2 === 0) return false;
        for (let i = 3; i <= Math.sqrt(num); i += 2) {
            if (num % i === 0) return false;
        }
        return true;
    }

    // 素数をランダムに生成する関数
    function generatePrime() {
        let num = Math.floor(Math.random() * (10 + correct)) + 1; // 1から100までの乱数を生成
        while (!isPrime(num)) {
            num = Math.floor(Math.random() * 10 + correct) + 1; // 素数でない場合は再度生成
        }
        return num;
    }

    // 素数を2つ生成
    prime1 = generatePrime();
    prime2 = generatePrime();

    // 積を計算
    let product = prime1 * prime2;

    primesAndProduct = {
        prime1: prime1,
        prime2: prime2,
        product: product
    };
}

// 素数をチェックする関数
function checkPrimes() {
    checkPrimesExecuted = true;
    document.getElementById('checkButton').disabled = true;
    let prime1_input = parseInt(document.getElementById('prime1').value);
    let prime2_input = parseInt(document.getElementById('prime2').value);

    var scoreElement = document.getElementById('score');
    var resultElement = document.getElementById('result');
    var buttonContainer = document.getElementById('button-container');

    //モーダルを表示
    document.getElementById("modal-container").style.display = "block";

    // 素数が入れ替わっている場合の対応
    if ((prime1_input === primesAndProduct.prime1 && prime2_input === primesAndProduct.prime2) ||
        (prime1_input === primesAndProduct.prime2 && prime2_input === primesAndProduct.prime1)) {
        if (score < primesAndProduct.product) {
            score = primesAndProduct.product;
            scoreElement.innerText = 'スコア: ' + score;
        }
        resultElement.innerText = '正解';
        buttonContainer.innerHTML = '<button type="button" class="btn btn-success" onclick="nextProblem()">次の問題へ</button>';
    } else {
        resultElement.innerText = '不正解';
        buttonContainer.innerHTML = '<form id="registerForm" action="register" method="POST">'+'<input type="hidden" id="scoreField" name="point" value="">'+'<input id="usernameField" class="m-2" type="text" name="username" placeholder="なまえを入れてください">' + '<button type="button" class="btn btn-success" onclick="backToTitle()">タイトルに戻る</button>'+'</form>';
    }
}

function nextProblem() {
    generateRandomPrime();
    document.getElementById('product').textContent = primesAndProduct.product;
    document.getElementById('result').innerText = '';
    document.getElementById('button-container').innerHTML = '';
    document.getElementById('checkButton').disabled = false;
    correct++;
    var modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
        modalContainer.style.display = "none";
    } else {
        console.error("modal-containerが見つかりません。");
    }

}

function backToTitle() {
    var username = document.getElementById('usernameField').value;
    console.log(username, score);
    document.getElementById('scoreField').value = score;
    document.getElementById('usernameField').value = username;
    document.getElementById('registerForm').addEventListener('submit', function(event) {
        event.preventDefault(); // 
        location.href = '..'; // 
    });
    document.getElementById('registerForm').submit();
}

// ページ読み込み時に処理を行う
document.addEventListener("DOMContentLoaded", function () {
    // 素数と積を取得
    generateRandomPrime();

    // HTMLに結果を表示
    document.getElementById('product').textContent = primesAndProduct.product;
});
