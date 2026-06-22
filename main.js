let stage = 1;

let enemyMaxHp = 100;
let enemyHp = 100;

let gold = 0;
let tapDamage = 10;

let isBossBattle = false;
let bossTimeLimit = 60;
let bossTimeLeft = bossTimeLimit;
let bossTimerId = null;

let bossChallengeStage = null;
let canChallengeBoss = false;

const normalEnemyPath = "img/enemies/normal/";
const bossEnemyPath = "img/enemies/boss/";

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

let normalEnemyBag = [];
let bossEnemyBag = [];

const stageDisplay = document.getElementById("stage-display");
const bossButton = document.getElementById("boss-button");

const enemyArea = document.getElementById("enemy-area");
const enemySprite = document.getElementById("enemy-sprite");
const enemyName = document.getElementById("enemy-name");
const hpBar = document.getElementById("enemy-hp-bar");
const hpText = document.getElementById("enemy-hp-text");
const bossTimeContainer = document.getElementById("boss-time-container");
const bossTimeBar = document.getElementById("boss-time-bar");
const goldText = document.getElementById("gold");
const tabGoldText = document.getElementById("tab-gold");
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

    if (canChallengeBoss) {
        bossButton.style.display = "block";
    } else {
        bossButton.style.display = "none";
    }
    }
    if (isBossBattle) {
    const timePercent = bossTimeLeft / bossTimeLimit * 100;

    bossTimeContainer.style.display = "block";
    bossTimeBar.style.width = timePercent + "%";
    } else {
        bossTimeContainer.style.display = "none";
    }
}

function createShuffledBag(files) {
    const bag = [...files];

    for (let i = bag.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        const temp = bag[i];
        bag[i] = bag[randomIndex];
        bag[randomIndex] = temp;
    }

    return bag;
}

function getNextEnemyFile(type) {
    if (type === "normal") {
        if (normalEnemyBag.length === 0) {
            normalEnemyBag = createShuffledBag(normalEnemies);
        }

        return normalEnemyBag.shift();
    }

    if (type === "boss") {
        if (bossEnemyBag.length === 0) {
            bossEnemyBag = createShuffledBag(bossEnemies);
        }

        return bossEnemyBag.shift();
    }
}

function setNormalEnemy() {
    isBossBattle = false;
    stopBossTimer();

const enemyFile = getNextEnemyFile("normal");

enemySprite.src = normalEnemyPath + enemyFile;
enemyName.textContent = enemyFile
    .replace(".png", "")
    .replace(/^e\d+_/, "");

    enemyMaxHp = Math.floor(100 * Math.pow(1.15, stage - 1));
    enemyHp = enemyMaxHp;

    updateEnemyUI();
}

function setBossEnemy() {
    isBossBattle = true;

    if (bossChallengeStage === null) {
        bossChallengeStage = stage;
    }

    stage = bossChallengeStage;

const bossFile = getNextEnemyFile("boss");

enemySprite.src = bossEnemyPath + bossFile;
enemyName.textContent = bossFile
    .replace(".png", "")
    .replace(/^b\d+_/, "");

    enemyMaxHp = Math.floor(500 * Math.pow(1.2, stage / 10 - 1));
    enemyHp = enemyMaxHp;

    bossTimeLeft = bossTimeLimit;
    startBossTimer();

    updateEnemyUI();
}

function defeatEnemy() {
    if (isBossBattle) {
        gold += bossChallengeStage * 20;
        updateGoldUI();

        stopBossTimer();

        stage = bossChallengeStage + 1;
        bossChallengeStage = null;
        canChallengeBoss = false;

        setNormalEnemy();
        return;
    }

    gold += stage * 5;
    updateGoldUI();

    if (canChallengeBoss) {
        setNormalEnemy();
        return;
    }

    if (stage % 10 === 9) {
        stage += 1;
        bossChallengeStage = stage;
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
        failBossBattle();
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

    setTimeout(() => {
        enemySprite.classList.remove("enemy-hit-left");
        enemySprite.classList.remove("enemy-hit-right");
    }, 100);
}

function playPlayerAttackAnimation() {
    playerSprite.classList.remove("player-attack");

    void playerSprite.offsetWidth;

    playerSprite.classList.add("player-attack");

    setTimeout(() => {
        playerSprite.classList.remove("player-attack");
    }, 100);
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
        failBossBattle();
    } else {
        bossChallengeStage = stage + 1;
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

updateGoldUI();
setNormalEnemy();

function failBossBattle() {
    stopBossTimer();

    stage = bossChallengeStage - 1;
    canChallengeBoss = true;

    setNormalEnemy();
}

const tabWindow = document.getElementById("tab-window");
const tabContent = document.getElementById("tab-content");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabs = document.getElementById("tabs");
const tabCloseButton = document.getElementById("tab-close-button");
const tabExpandButton = document.getElementById("tab-expand-button");

let activeTab = null;
let isTabExpanded = false;

const tabNames = {
    enri: "エンリタブ",
    allies: "仲間タブ",
    equipment: "装備タブ",
    pet: "ペットタブ",
    items: "アイテムタブ",
    other: "その他タブ"
};

function openTab(tabKey) {
    activeTab = tabKey;

    tabContent.textContent = tabNames[tabKey];

    tabWindow.classList.add("open");
    tabs.classList.add("hidden-tabs");

    tabButtons.forEach((button) => {
        button.classList.remove("active-tab");

        if (button.dataset.tab === tabKey) {
            button.classList.add("active-tab");
        }
    });
}

function closeTab() {
    activeTab = null;
    isTabExpanded = false;

    tabWindow.classList.remove("open");
    tabWindow.classList.remove("expanded");
    tabs.classList.remove("hidden-tabs");

    tabButtons.forEach((button) => {
        button.classList.remove("active-tab");
    });
}

function toggleTab(tabKey) {
    if (activeTab === tabKey) {
        closeTab();
    } else {
        openTab(tabKey);
    }
}

function toggleTabExpand() {
    isTabExpanded = !isTabExpanded;

    if (isTabExpanded) {
        tabWindow.classList.add("expanded");
    } else {
        tabWindow.classList.remove("expanded");
    }
}

tabButtons.forEach((button) => {
    button.addEventListener("pointerdown", () => {
        toggleTab(button.dataset.tab);
    });
});

tabCloseButton.addEventListener("pointerdown", () => {
    closeTab();
});

tabExpandButton.addEventListener("pointerdown", () => {
    toggleTabExpand();
});

function updateGoldUI() {
    goldText.textContent = gold;
    tabGoldText.textContent = gold;
}







