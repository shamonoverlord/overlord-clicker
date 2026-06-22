let enemyMaxHp = 100;
let enemyHp = 100;

let gold = 0;

const tapDamage = 10;

const enemyArea = document.getElementById("enemy-area");
const hpBar = document.getElementById("enemy-hp-bar");
const hpText = document.getElementById("enemy-hp-text");
const goldText = document.getElementById("gold");

function updateEnemyUI() {
    const percent = (enemyHp / enemyMaxHp) * 100;

    hpBar.style.width = percent + "%";

    hpText.textContent = enemyHp + " / " + enemyMaxHp;
}

function showDamageText(damage) {
    const damageText = document.createElement("div");

    damageText.className = "damage-text";
    damageText.textContent = damage;

    enemyArea.appendChild(damageText);

    damageText.addEventListener("animationend", () => {
        damageText.remove();
    });
}

enemyArea.addEventListener("click", () => {
    enemyHp -= tapDamage;

    showDamageText(tapDamage);

    if (enemyHp <= 0) {
        gold += 5;

        goldText.textContent = gold;

        enemyHp = enemyMaxHp;
    }

    updateEnemyUI();
});

updateEnemyUI();

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

document.addEventListener("selectstart", (event) => {
    event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
    event.preventDefault();
});




