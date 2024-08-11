let product; // productをグローバルスコープで定義
let checkPrimesExecuted = false; // ボタンが押されたフラグ

// サーバーから素数の積を取得する関数
function fetchProduct() {
    fetch('/generate_primes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        product = data.product;
        document.getElementById('product').textContent = product;
    })
    .catch(error => console.error('Error:', error));
}

// 素数をチェックする関数
function checkPrimes() {
    let prime1_input = document.getElementById('prime1').value;
    let prime2_input = document.getElementById('prime2').value;

    // 入力欄が空の場合、エラーメッセージを表示して終了
    if (!prime1_input || !prime2_input) {
        alert("両方の素数を入力してください。");
        return;
    }

    prime1_input = parseInt(prime1_input);
    prime2_input = parseInt(prime2_input);

    checkPrimesExecuted = true;
    document.getElementById('checkButton').disabled = true;

    var resultElement = document.getElementById('result');
    var buttonContainer = document.getElementById('button-container');

    // モーダルを表示
    document.getElementById("modal-container").style.display = "block";

    // サーバーに素数をチェックしてもらう
    fetch('/check_primes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prime1: prime1_input,
            prime2: prime2_input,
            product: product
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.result === '正解') {
            resultElement.innerText = '正解';
            buttonContainer.innerHTML = '<button type="button" class="btn btn-success" onclick="nextProblem()">次の問題へ</button>';
        } else {
            resultElement.innerText = '不正解';
            buttonContainer.innerHTML = '<form id="registerForm" action="/register" method="POST">' +
                '<input type="hidden" id="scoreField" name="point" value="">' +
                '<input id="usernameField" class="m-2" type="text" name="username" placeholder="なまえを入れてください">' +
                '<button type="button" class="btn btn-success" onclick="backToTitle()">タイトルに戻る</button>' +
                '</form>';
        }
        document.getElementById('score').innerText = 'スコア: ' + data.score;
    })
    .catch(error => console.error('Error:', error));
}

function nextProblem() {
    fetchProduct();
    document.getElementById('result').innerText = '';
    document.getElementById('button-container').innerHTML = '';
    document.getElementById('checkButton').disabled = false;

    // 入力欄を空白にする
    document.getElementById('prime1').value = '';
    document.getElementById('prime2').value = '';

    var modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
        modalContainer.style.display = "none";
    } else {
        console.error("modal-containerが見つかりません。");
    }
}

function backToTitle() {
    var username = document.getElementById('usernameField').value;
    document.getElementById('scoreField').value = score;
    document.getElementById('usernameField').value = username;
    document.getElementById('registerForm').submit();
}

// ページ読み込み時に処理を行う
document.addEventListener("DOMContentLoaded", function () {
    // 素数の積を取得
    fetchProduct();
});
