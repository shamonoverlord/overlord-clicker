let stage = 1;

let enemyMaxHp = 100;
let enemyHp = 100;

let gold = 0;
let tapDamage = 10;

let isBossBattle = false;
let bossTimeLimit = 60;
let bossTimeLeft = bossTimeLimit;
let bossTimerId = null;

const normalEnemies = [
    "e001_slime_green.png",
    "e002_zombie_02_green.png",
    "e003_medusa_green.png",
    "e004_troll_01_02.png",
    "e005_kyuketsuki_02_blue.png",
    "e006_kaeru_purple.png",
    "e007_jackolantern_orange.png",
    "e008_ghost_white.png",
    "e009_gargoyle_stone.png"
];

const bossEnemies = [
    "b001_slime_big_green.png"
];

const stageDisplay = document.getElementById("stage-display");
const bossButton = document.getElementById("boss-button");

const enemyArea = document.getElementById("enemy-area");
const enemySprite = document.getElementById("enemy-sprite");
const enemyName = document.getElementById("enemy-name");
const hpBar = document.getElementById("enemy-hp-bar");
const hpText = document.getElementById("enemy-hp-text");
const goldText = document.getElementById("gold");
const playerSprite = document.getElementById("player-sprite");

function updateEnemyUI() {
    const percent = enemyHp / enemyMaxHp * 100;

    hpBar.style.width = percent + "%";
    hpText.textContent = `${Math.ceil(enemyHp)} / ${enemyMaxHp}`;

    if (isBossBattle) {
        stageDisplay.textContent = `Stage ${stage} Boss ${bossTimeLeft}s`;
        bossButton.textContent = "ザコ戦へ移動";
        bossButton.style.display = "block";
    } else {
        stageDisplay.textContent = `Stage ${stage}`;
        bossButton.textContent = "ボス戦へ移動";

        if (stage % 10 === 0) {
            bossButton.style.display = "block";
        } else {
            bossButton.style.display = "none";
        }
    }
}

function getRandomFile(files) {
    const index = Math.floor(Math.random() * files.length);
    return files[index];
}

function setNormalEnemy() {
    isBossBattle = false;
    stopBossTimer();

    const enemyFile = getRandomFile(normalEnemies);

    enemySprite.src = `img/enemies/${enemyFile}`;
    enemyName.textContent = "ザコ敵";

    enemyMaxHp = Math.floor(100 * Math.pow(1.15, stage - 1));
    enemyHp = enemyMaxHp;

    updateEnemyUI();
}

function setBossEnemy() {
    isBossBattle = true;

    const bossFile = getRandomFile(bossEnemies);

    enemySprite.src = `img/enemies/${bossFile}`;
    enemyName.textContent = "ボス";

    enemyMaxHp = Math.floor(500 * Math.pow(1.2, stage / 10 - 1));
    enemyHp = enemyMaxHp;

    bossTimeLeft = bossTimeLimit;
    startBossTimer();

    updateEnemyUI();
}

function defeatEnemy() {
    if (isBossBattle) {
        gold += stage * 20;
        goldText.textContent = gold;

        stopBossTimer();

        stage += 1;

        setNormalEnemy();
        return;
    }

    gold += stage * 5;
    goldText.textContent = gold;

    if (stage % 10 === 9) {
        stage += 1;
        setBossEnemy();
    } else {
        stage += 1;
        setNormalEnemy();
    }
}

function startBossTimer() {
    stopBossTimer();

    bossTimerId = setInterval(() => {
        bossTimeLeft -= 1;

        if (bossTimeLeft <= 0) {
            bossTimeLeft = 0;
            stopBossTimer();
            setNormalEnemy();
            return;
        }

        updateEnemyUI();
    }, 1000);
}

function stopBossTimer() {
    if (bossTimerId !== null) {
        clearInterval(bossTimerId);
        bossTimerId = null;
    }
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

function playEnemyHitAnimation() {
    enemySprite.classList.remove("enemy-hit-left");
    enemySprite.classList.remove("enemy-hit-right");

    void enemySprite.offsetWidth;

    const direction = Math.random() < 0.5
        ? "enemy-hit-left"
        : "enemy-hit-right";

    enemySprite.classList.add(direction);
}

function playPlayerAttackAnimation() {
    playerSprite.classList.remove("player-attack");

    void playerSprite.offsetWidth;

    playerSprite.classList.add("player-attack");
}

enemyArea.addEventListener("pointerdown", () => {
    enemyHp -= tapDamage;

    if (enemyHp < 0) {
        enemyHp = 0;
    }

    playPlayerAttackAnimation();
    playEnemyHitAnimation();
    showDamageText(tapDamage);

    if (enemyHp <= 0) {
        defeatEnemy();
    } else {
        updateEnemyUI();
    }
});

bossButton.addEventListener("pointerdown", () => {
    if (isBossBattle) {
        setNormalEnemy();
    } else {
        setBossEnemy();
    }
});

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

document.addEventListener("selectstart", (event) => {
    event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
    event.preventDefault();
});

setNormalEnemy();
