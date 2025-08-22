const enemies = [
    {
        name: "Insectoid",
        image: "../assets/characters/enemies/enemy1.png",
        health: 120,
        attackZones: ["head", "body", "legs"],
        countAttackZones: 1,
        defenceZones: ["head", "body", "legs"],
        countDefenceZones: 1,
    },
    {
        name: "Werewolf",
        image: "../assets/characters/enemies/enemy2.png",
        health: 100,
        attackZones: ["head", "neck", "belly", "legs"],
        countAttackZones: 2,
        defenceZones: ["head", "neck", "body", "belly", "legs"],
        countDefenceZones: 3,
    },
    {
        name: "Golem",
        image: "../assets/characters/enemies/enemy3.png",
        health: 80,
        attackZones: ["head", "neck", "belly"],
        countAttackZones: 1,
        defenceZones: ["body", "belly", "legs"],
        countDefenceZones: 1,
    }
];

function getRandomZones(zones, count = 2) {
    const available = [...zones];
    const chosen = [];
    for (let i = 0; i < count && available.length > 0; i++) {
        const index = Math.floor(Math.random() * available.length);
        chosen.push(available[index]);
        available.splice(index, 1);
    }
    return chosen;
}

function baseEnemyByName(name) {
    return enemies.find(e => e.name === name);
}

function isCriticalHit(chance = 0.2) {
    return Math.random() < chance;
}

function updateProgressColor(progress) {
    const value = Number(progress.value);
    const max = Number(progress.max) || 100;
    const percent = (value / max) * 100;
    if (percent <= 30) {
        progress.style.accentColor = "red";
    } else if (percent <= 60) {
        progress.style.accentColor = "yellow";
    } else {
        progress.style.accentColor = "green";
    }
}

let state = null;

function defaultNewState() {
    const heroImage = localStorage.getItem('avatar') || '';
    const enemyTemplate = enemies[Math.floor(Math.random() * enemies.length)];

    const enemy = {
        name: enemyTemplate.name,
        image: enemyTemplate.image,
        health: enemyTemplate.health,
        maxHealth: enemyTemplate.health,
        attackZones: getRandomZones(enemyTemplate.attackZones, enemyTemplate.countAttackZones),
        defenceZones: getRandomZones(enemyTemplate.defenceZones, enemyTemplate.countDefenceZones),
        countAttackZones: enemyTemplate.countAttackZones,
        countDefenceZones: enemyTemplate.countDefenceZones,
    };

    return {
        hero: {
            name: localStorage.getItem('username') || 'Hero',
            image: heroImage,
            health: 100,
            maxHealth: 100,
        },
        enemy,
        selection: { attack: null, defence: [] },
        logs: [],
        buttonDisabled: false,
        round: 0,
    };
}

function saveState() {
    if (!state) return;
    localStorage.setItem("fightState", JSON.stringify(state));
    localStorage.setItem("hero", JSON.stringify(state.hero));

    const enemyForCompat = {
        name: state.enemy.name,
        image: state.enemy.image,
        health: state.enemy.health,
        attackZones: state.enemy.attackZones,
        countAttackZones: state.enemy.countAttackZones,
        defenceZones: state.enemy.defenceZones,
        countDefenceZones: state.enemy.countDefenceZones,
    };
    localStorage.setItem("enemy", JSON.stringify(enemyForCompat));
}

function loadState() {
    const raw = localStorage.getItem("fightState");
    if (!raw) return false;
    try {
        const parsed = JSON.parse(raw);
        if (!parsed.hero.maxHealth) parsed.hero.maxHealth = 100;
        if (!parsed.enemy.maxHealth) {
            parsed.enemy.maxHealth = baseEnemyByName(parsed.enemy.name)?.health || parsed.enemy.health || 100;
        }
        if (!parsed.selection) parsed.selection = { attack: null, defence: [] };
        if (!Array.isArray(parsed.logs)) parsed.logs = [];
        if (typeof parsed.buttonDisabled !== 'boolean') parsed.buttonDisabled = false;
        if (typeof parsed.round !== 'number') parsed.round = 0;

        state = parsed;
        return true;
    } catch {
        return false;
    }
}

const heroNameEl = document.querySelector('.hero-name');
const enemyNameEl = document.querySelector('.enemy-name');
const heroImgEl = document.querySelector('.character-hero-img');
const enemyImgEl = document.querySelector('.character-enemy-img');
const heroHealthEl = document.querySelector('.hero-health');
const enemyHealthEl = document.querySelector('.enemy-health');
const logsField = document.querySelector('.logs-field');
const attackBtn = document.querySelector('.input-zones-button');

function clearLogsUI() {
    logsField.innerHTML = '';
}

function addLog(message) {
    state.logs.push(message);
    const p = document.createElement('p');
    p.textContent = message;
    logsField.appendChild(p);
    logsField.scrollTop = logsField.scrollHeight;
    saveState();
}

function renderLogsFromState() {
    clearLogsUI();
    state.logs.forEach(m => {
        const p = document.createElement('p');
        p.textContent = m;
        logsField.appendChild(p);
    });
    logsField.scrollTop = logsField.scrollHeight;
}

function setInputsFromSelection() {
    if (state.selection.attack) {
        const r = document.querySelector(`input[name="attack"][value="${state.selection.attack}"]`);
        if (r) r.checked = true;
    }
    document.querySelectorAll('input[name="defence"]').forEach(cb => {
        cb.checked = state.selection.defence.includes(cb.value);
    });
}

function getCurrentSelectionFromInputs() {
    const heroAttack = document.querySelector('input[name="attack"]:checked')?.value || null;
    const heroDefence = Array.from(document.querySelectorAll('input[name="defence"]:checked')).map(el => el.value);
    state.selection.attack = heroAttack;
    state.selection.defence = heroDefence;
}

function updateBars() {
    heroHealthEl.max = state.hero.maxHealth;
    heroHealthEl.value = state.hero.health;
    enemyHealthEl.max = state.enemy.maxHealth;
    enemyHealthEl.value = state.enemy.health;
    updateProgressColor(heroHealthEl);
    updateProgressColor(enemyHealthEl);
}

function renderAll() {
    heroNameEl.textContent = state.hero.name;
    enemyNameEl.textContent = state.enemy.name;

    if (state.hero.image) heroImgEl.src = state.hero.image;
    enemyImgEl.src = state.enemy.image;

    updateBars();
    renderLogsFromState();
    setInputsFromSelection();

    attackBtn.disabled = state.buttonDisabled;
}

function rerollEnemyZonesForNewRound() {
    const base = baseEnemyByName(state.enemy.name);
    state.enemy.attackZones = getRandomZones(base.attackZones, base.countAttackZones);
    state.enemy.defenceZones = getRandomZones(base.defenceZones, base.countDefenceZones);
}

function endFightIfNeeded() {
    if (state.hero.health <= 0 && !state.buttonDisabled) {
        addLog("💀 The hero fell in battle...");
        state.buttonDisabled = true;
        saveState();
        showFightEndModal();
        return true;
    }
    if (state.enemy.health <= 0 && !state.buttonDisabled) {
        addLog(`🏆 ${state.enemy.name} defeated!`);
        state.buttonDisabled = true;
        saveState();
        showFightEndModal();
        return true;
    }
    return false;
}

attackBtn.addEventListener('click', () => {
    if (state.buttonDisabled) return;

    getCurrentSelectionFromInputs();
    const heroAttack = state.selection.attack;
    const heroDefence = state.selection.defence;

    if (!heroAttack || heroDefence.length === 0) {
        addLog("⚠️ Choose at least one attack and defense zone!");
        return;
    }

    rerollEnemyZonesForNewRound();

    state.round += 1;
    addLog(`=== A new round (#${state.round}) ===`);

    addLog(`🗡️ The hero attacks ${state.enemy.name} in ${heroAttack}`);
    let damageHero = 20;
    const heroCrit = isCriticalHit();

    if (state.enemy.defenceZones.includes(heroAttack)) {
        if (heroCrit) {
            damageHero = Math.floor(damageHero * 1.5);
            addLog(`💥 Critical hit! Block is broken! ${state.enemy.name} loses ${damageHero} HP`);
            state.enemy.health -= damageHero;
        } else {
            addLog("🛡️ The enemy has defended himself!");
        }
    } else {
        if (heroCrit) {
            damageHero = Math.floor(damageHero * 1.5);
            addLog(`💥 Critical hit! The enemy loses ${damageHero} HP`);
        } else {
            addLog(`💥 The attack succeeded! The enemy loses ${damageHero} HP`);
        }
        state.enemy.health -= damageHero;
    }

    state.enemy.health = Math.max(0, state.enemy.health);
    updateBars();
    saveState();
    if (endFightIfNeeded()) return;

    state.enemy.attackZones.forEach(zone => {
        addLog(`⚔️ ${state.enemy.name} attacks the hero in ${zone}`);
        let damageEnemy = 15;
        const enemyCrit = isCriticalHit();

        if (heroDefence.includes(zone)) {
            if (enemyCrit) {
                damageEnemy = Math.floor(damageEnemy * 1.5);
                addLog(`💥 Critical hit! Your block is broken! You lose ${damageEnemy} HP`);
                state.hero.health -= damageEnemy;
            } else {
                addLog("🛡️ You defended yourself!");
            }
        } else {
            if (enemyCrit) {
                damageEnemy = Math.floor(damageEnemy * 1.5);
                addLog(`💥 Critical hit! You lose ${damageEnemy} HP`);
            } else {
                addLog(`🤕 A hit on you! You lose ${damageEnemy} HP`);
            }
            state.hero.health -= damageEnemy;
        }

        state.hero.health = Math.max(0, state.hero.health);
        updateBars();
        saveState();
    });

    addLog(`❤️ Hero's HP: ${state.hero.health}`);
    addLog(`💀 HP ${state.enemy.name}: ${state.enemy.health}`);
    addLog("--- End of the round ---");

    saveState();
    endFightIfNeeded();
});

(function init() {
    if (!loadState()) {
        state = defaultNewState();
        state.hero.name = localStorage.getItem('username') || state.hero.name;
        saveState();
        addLog("⚔️ Fight has started!");
    } else {
        const currentName = localStorage.getItem('username');
        if (currentName && currentName !== state.hero.name) {
            state.hero.name = currentName;
        }
        const currentAvatar = localStorage.getItem('avatar');
        if (currentAvatar && currentAvatar !== state.hero.image) {
            state.hero.image = currentAvatar;
        }
        saveState();
    }
    renderAll();
})();

function showFightEndModal() {
    const modal = document.getElementById('fight-end-modal');
    modal.style.display = 'flex';
}

document.getElementById('new-fight-btn').addEventListener('click', () => {
    localStorage.removeItem("fightState");
    location.reload();
});

document.getElementById('main-page-btn').addEventListener('click', () => {
    window.location.href = 'home.html';
});
