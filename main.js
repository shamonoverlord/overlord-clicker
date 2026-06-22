let enemyMaxHp = 100;
let enemyHp = 100;

let gold = 0;

const enemyArea = document.getElementById("enemy-area");
const hpBar = document.getElementById("enemy-hp-bar");
const hpText = document.getElementById("enemy-hp-text");
const goldText = document.getElementById("gold");

function updateEnemyUI() {

    const percent = (enemyHp / enemyMaxHp) * 100;

    hpBar.style.width = percent + "%";

    hpText.textContent =
        enemyHp + " / " + enemyMaxHp;
}

enemyArea.addEventListener("click", () => {

    enemyHp -= 10;

    if(enemyHp <= 0){

        gold += 5;

        goldText.textContent = gold;

        enemyHp = enemyMaxHp;
    }

    updateEnemyUI();

});

updateEnemyUI();
