let stage = 1;

let enemyMaxHp = 100;
let enemyHp = 100;

let gold = 0;
const enri = {
    level: 1,
    baseDamage: 10,
    damagePerLevel: 5,
    baseLevelUpCost: 20,
    costGrowth: 1.15
};

let tapDamage = calculateEnriTapDamage();

let isBossBattle = false;
let bossTimeLimit = 60;
let bossTimeLeft = bossTimeLimit;
let bossTimerId = null;

let bossChallengeStage = null;
let canChallengeBoss = false;
let isEnemyChanging = false;
let totalDps = 0;

const allies = [
    {
        id: "jugem",
        name: "ゴブリン・リーダー ジュゲム",
        image: "img/allies/a001_jugem.png",
        faceImage: "img/allies/a001_jugem_face.png",
        level: 1,
        baseDamage: 5,
        attackInterval: 1750,
        positionClass: "ally-left",
        idleClass: "ally-idle-a",
        isSpriteSheet: true,
        element: null,
        timerId: null
    },
    {
        id: "shuringan",
        name: "ゴブリン・アーチャー シューリンガン",
        image: "img/allies/a002_shuringan.png",
        faceImage: "img/allies/a002_shuringan_face.png",
        level: 1,
        baseDamage: 8,
        attackInterval: 2200,
        positionClass: "ally-right",
        idleClass: "ally-idle-b",
        element: null,
        timerId: null
    }
];

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
const alliesLayer = document.getElementById("allies-layer");
const dpsText = document.getElementById("dps");
const tabDpsText = document.getElementById("tab-dps");

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

function showAllyDamageText(damage, side) {
    const damageText = document.createElement("div");

    damageText.className = "ally-damage-text";

    if (side === "left") {
        damageText.classList.add("ally-damage-left");
    } else {
        damageText.classList.add("ally-damage-right");
    }

    const randomY = Math.floor(Math.random() * 50) - 25;
    const randomX = Math.floor(Math.random() * 30) - 15;

    damageText.style.transform = `translate(${randomX}px, ${randomY}px)`;
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

function playEnemySpawnAnimation() {
    enemySprite.classList.remove("enemy-spawn");

    void enemySprite.offsetWidth;

    enemySprite.classList.add("enemy-spawn");

    setTimeout(() => {
        enemySprite.classList.remove("enemy-spawn");
    }, 200);
}

function startEnemyDefeatAnimation() {
    if (isEnemyChanging) {
        return;
    }

    isEnemyChanging = true;

    enemySprite.classList.remove("enemy-hit-left");
    enemySprite.classList.remove("enemy-hit-right");
    enemySprite.classList.remove("enemy-spawn");

    enemySprite.classList.add("enemy-defeated");

    setTimeout(() => {
        defeatEnemy();

        enemySprite.classList.remove("enemy-defeated");

        playEnemySpawnAnimation();

        isEnemyChanging = false;
    }, 200);
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
    updateEnemyUI();
    startEnemyDefeatAnimation();
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

const tabContents = {
    enri: renderEnriTab,
    allies: renderAlliesTab,
    equipment: () => "装備タブ",
    pet: () => "ペットタブ",
    items: () => "アイテムタブ",
    other: () => "その他タブ"
};

function openTab(tabKey) {
    activeTab = tabKey;

    tabContent.innerHTML = tabContents[tabKey]();

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

tabContent.addEventListener("pointerdown", (event) => {

    const enriButton = event.target.closest("#enri-level-up-button");

    if (enriButton) {
        event.stopPropagation();
        levelUpEnri();
        return;
    }

    const allyButton = event.target.closest("[data-ally]");

    if (allyButton) {
        event.stopPropagation();
        levelUpAlly(allyButton.dataset.ally);
    }

});
function updateGoldUI() {
    goldText.textContent = gold;
    tabGoldText.textContent = gold;

    refreshActiveTab();
}

function calculateEnriTapDamage() {
    return enri.baseDamage + (enri.level - 1) * enri.damagePerLevel;
}

function calculateEnriLevelUpCost() {
    return Math.floor(enri.baseLevelUpCost * Math.pow(enri.costGrowth, enri.level - 1));
}

function renderEnriTab() {
    const cost = calculateEnriLevelUpCost();
    const nextDamage = calculateEnriTapDamage() + enri.damagePerLevel;
    const canLevelUp = gold >= cost;

    return `
        <div class="character-upgrade-card">
            <div class="character-face-box">
                <img class="character-face" src="img/player/enri_face.png" alt="エンリ">
            </div>

            <div class="character-info">
                <div class="character-name">エンリ</div>
                <div class="character-level">Lv.${enri.level}</div>
                <div class="character-level">タップ ${tapDamage}</div>
            </div>

            <button
                class="level-up-button ${canLevelUp ? "" : "disabled"}"
                id="enri-level-up-button"
                ${canLevelUp ? "" : "disabled"}
            >
                <div class="level-up-cost">金貨 ${cost}</div>
                <div class="level-up-main">レベルアップ</div>
                <div class="level-up-dps">タップ ${tapDamage} → ${nextDamage}</div>
            </button>
        </div>
    `;
}

function refreshActiveTab() {
    if (activeTab === null) {
        return;
    }

    tabContent.innerHTML = tabContents[activeTab]();
}

function levelUpEnri() {
    const cost = calculateEnriLevelUpCost();

    if (gold < cost) {
        return;
    }

    gold -= cost;
    enri.level += 1;
    tapDamage = calculateEnriTapDamage();

    updateGoldUI();
    refreshActiveTab();
}

function calculateAllyLevelUpCost(ally) {
    return Math.floor(50 * Math.pow(1.15, ally.level - 1));
}

function renderAlliesTab() {

    return allies.map((ally) => {

        const cost = calculateAllyLevelUpCost(ally);
        const nextDamage = getAllyDamage(ally) + ally.baseDamage;
        const canLevelUp = gold >= cost;

        return `
            <div class="character-upgrade-card">

                <div class="character-face-box">
                    <img
                        class="character-face"
                        src="${ally.faceImage}"
                        alt="${ally.name}">
                </div>

                <div class="character-info">
                    <div class="character-name">${ally.name}</div>
                    <div class="character-level">Lv.${ally.level}</div>
                    <div class="character-level">${getAllyDamage(ally)} DPS</div>
                </div>

                <button
                    class="level-up-button ${canLevelUp ? "" : "disabled"}"
                    data-ally="${ally.id}"
                    ${canLevelUp ? "" : "disabled"}>

                    <div class="level-up-cost">
                        金貨 ${cost}
                    </div>

                    <div class="level-up-main">
                        レベルアップ
                    </div>

                    <div class="level-up-dps">
                        ${getAllyDamage(ally)}
                        →
                        ${nextDamage} DPS
                    </div>

                </button>

            </div>
        `;

    }).join("");

}

function levelUpAlly(id) {

    const ally = allies.find(a => a.id === id);

    if (!ally) {
        return;
    }

    const cost = calculateAllyLevelUpCost(ally);

    if (gold < cost) {
        return;
    }

    gold -= cost;
    ally.level++;

    startAllyAutoAttacks();

    updateGoldUI();
    refreshActiveTab();
}

function updateDpsUI() {
    dpsText.textContent = totalDps;
    tabDpsText.textContent = totalDps;
}

function getAllyDamage(ally) {
    return ally.level * ally.baseDamage;
}

function renderAllies() {
    alliesLayer.innerHTML = "";

    allies.forEach((ally) => {
        if (ally.level <= 0) {
            return;
        }

        const allyElement = document.createElement("div");
        allyElement.className = `ally-character ${ally.positionClass} ${ally.idleClass}`;

        if (ally.isSpriteSheet) {
            allyElement.innerHTML = `
                <div
                    class="ally-sprite-sheet"
                    style="background-image:url('${ally.image}')"
                    aria-label="${ally.name}"
                ></div>
            `;
        } else {
            allyElement.innerHTML = `
                <img src="${ally.image}" alt="${ally.name}">
            `;
        }

        alliesLayer.appendChild(allyElement);

        ally.element = allyElement;
    });
}

function playAllyAttackAnimation(ally) {
    if (!ally.element) {
        return;
    }

    ally.element.classList.remove("ally-attack");

    void ally.element.offsetWidth;

    ally.element.classList.add("ally-attack");

    setTimeout(() => {
        ally.element.classList.remove("ally-attack");
    }, 750);
}

function allyAttackEnemy(ally) {
    if (ally.level <= 0 || isEnemyChanging) {
        return;
    }

    const damage = getAllyDamage(ally);

    playAllyAttackAnimation(ally);

    setTimeout(() => {
        if (isEnemyChanging) {
            return;
        }

        enemyHp -= damage;

        if (enemyHp < 0) {
            enemyHp = 0;
        }

        playEnemyHitAnimation();

        const side = ally.positionClass === "ally-left" ? "left" : "right";
        showAllyDamageText(damage, side);

        if (enemyHp <= 0) {
            updateEnemyUI();
            startEnemyDefeatAnimation();
        } else {
            updateEnemyUI();
        }
    }, 250);
}

function startAllyAutoAttacks() {
    totalDps = 0;

    allies.forEach((ally) => {
        if (ally.timerId !== null) {
            clearInterval(ally.timerId);
        }

        if (ally.level <= 0) {
            return;
        }

        totalDps += getAllyDamage(ally);

        ally.timerId = setInterval(() => {
            allyAttackEnemy(ally);
        }, ally.attackInterval);
    });

    updateDpsUI();
}

updateGoldUI();
renderAllies();
startAllyAutoAttacks();
setNormalEnemy();



