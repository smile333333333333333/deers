/* =========================================================
   PINEWOOD: THE WOODS
   FILE 2 — GAME ENGINE

   Top-down exploration + battle foundation
   ========================================================= */

"use strict";


/* =========================================================
   CANVAS
   ========================================================= */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================================================
   GAME STATE
   ========================================================= */

const Game = {

    running: false,

    mode: "menu",

    battleOpen: false,

    currentEnemy: null,

    cameraX: 0,

    cameraY: 0,

    lastTime: 0,

    keys: {},

    worldWidth: 4200,

    worldHeight: 3200,

    messageTimer: 0,

    encounterCooldown: 0

};


/* =========================================================
   PLAYER
   ========================================================= */

const Player = {

    x: 2050,

    y: 1600,

    width: 26,

    height: 30,

    speed: 185,

    health: 100,

    maxHealth: 100,

    stamina: 100,

    maxStamina: 100,

    staminaRecovery: 25,

    facing: "down",

    moving: false

};


/* =========================================================
   WORLD
   ========================================================= */

const World = {

    trees: [],

    rocks: [],

    bushes: [],

    cabins: [],

    clues: [],

    bodies: [],

    bloodSpots: [],

    paths: [],

    water: [],

    caves: [],

    initialized: false

};


/* =========================================================
   ENEMIES
   ========================================================= */

const Animals = [];


/* =========================================================
   MONSTER DEFINITIONS
   ========================================================= */

const MonsterTypes = {

    forestWolf: {

        name: "Forest Wolf",

        enemyType: "wolf",

        maxHealth: 55,

        damage: 12,

        speed: 95,

        staminaCost: 15,

        color: "#45483f"

    },


    smilingDeer: {

        name: "Smiling Deer",

        enemyType: "smilingDeer",

        maxHealth: 75,

        damage: 16,

        speed: 80,

        staminaCost: 18,

        color: "#51463b"

    },


    experimentalBoar: {

        name: "Experimental Boar",

        enemyType: "rootedBoar",

        maxHealth: 105,

        damage: 23,

        speed: 65,

        staminaCost: 24,

        color: "#473a35"

    },


    longEared: {

        name: "Long-Eared Experiment",

        enemyType: "longEared",

        maxHealth: 65,

        damage: 18,

        speed: 125,

        staminaCost: 20,

        color: "#39352f"

    },


    deerMan: {

        name: "The Deer Man",

        enemyType: "deerMan",

        maxHealth: 220,

        damage: 30,

        speed: 70,

        staminaCost: 30,

        color: "#302c29"

    }

};


/* =========================================================
   INPUT
   ========================================================= */

window.addEventListener(
    "keydown",
    event => {

        Game.keys[
            event.key.toLowerCase()
        ] = true;


        if (
            event.key === " "
        ) {

            Game.keys.space = true;

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        Game.keys[
            event.key.toLowerCase()
        ] = false;


        if (
            event.key === " "
        ) {

            Game.keys.space = false;

        }

    }
);


/* =========================================================
   START BUTTON
   ========================================================= */

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        startGame
    );


function startGame() {

    const startScreen =
        document.getElementById(
            "startScreen"
        );


    startScreen.style.display =
        "none";


    Game.running =
        true;

    Game.mode =
        "explore";


    Player.health =
        Player.maxHealth;

    Player.stamina =
        Player.maxStamina;


    createWorld();

    createInitialMonsters();

    updateHUD();


    Game.lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   CREATE WORLD
   ========================================================= */

function createWorld() {

    if (
        World.initialized
    ) {

        return;

    }


    World.initialized =
        true;


    /*
       Forest trees
    */

    for (
        let i = 0;
        i < 650;
        i++
    ) {

        const tree =
            randomWorldPosition();


        if (
            distance(
                tree.x,
                tree.y,
                Player.x,
                Player.y
            ) < 230
        ) {

            i--;

            continue;

        }


        World.trees.push({

            x: tree.x,

            y: tree.y,

            size:
                24 +
                Math.random() * 30

        });

    }


    /*
       Rocks
    */

    for (
        let i = 0;
        i < 160;
        i++
    ) {

        const rock =
            randomWorldPosition();


        World.rocks.push({

            x: rock.x,

            y: rock.y,

            size:
                8 +
                Math.random() * 14

        });

    }


    /*
       Bushes
    */

    for (
        let i = 0;
        i < 220;
        i++
    ) {

        const bush =
            randomWorldPosition();


        World.bushes.push({

            x: bush.x,

            y: bush.y,

            size:
                10 +
                Math.random() * 14

        });

    }


    /*
       Blood spots.
       Environmental horror rather than active gore.
    */

    for (
        let i = 0;
        i < 30;
        i++
    ) {

        const spot =
            randomWorldPosition();


        World.bloodSpots.push({

            x: spot.x,

            y: spot.y,

            size:
                5 +
                Math.random() * 10

        });

    }


    /*
       Abandoned cabins.
    */

    World.cabins.push({

        id: "cabin1",

        x: 1050,

        y: 620,

        width: 230,

        height: 150,

        name: "Old Hunting Cabin"

    });


    World.cabins.push({

        id: "cabin2",

        x: 2980,

        y: 700,

        width: 250,

        height: 170,

        name: "Ranger Cabin"

    });


    World.cabins.push({

        id: "cabin3",

        x: 730,

        y: 2440,

        width: 280,

        height: 175,

        name: "Abandoned House"

    });


    /*
       Cave.
    */

    World.caves.push({

        id: "mainCave",

        x: 3100,

        y: 2480,

        radius: 90,

        name: "Northern Cave"

    });


    /*
       Investigation clues.
    */

    World.clues.push({

        id: "bloodyClothes",

        x: 1390,

        y: 970,

        radius: 30,

        text:
            "A torn jacket lies beside the trail. There is dried blood on the sleeve."

    });


    World.clues.push({

        id: "strangeTracks",

        x: 1700,

        y: 1260,

        radius: 35,

        text:
            "These tracks look like deer tracks... except they're far too large."

    });


    World.clues.push({

        id: "caveMarkings",

        x: 3090,

        y: 2390,

        radius: 40,

        text:
            "Deep scratches cover the stone around the cave entrance."

    });


    /*
       Bodies.
       Kept as distant environmental silhouettes.
    */

    World.bodies.push({

        x: 1160,

        y: 1020,

        rotation: -0.2

    });


    World.bodies.push({

        x: 3220,

        y: 2510,

        rotation: 0.4

    });


    /*
       Main trails.
    */

    World.paths.push({

        x1: 200,

        y1: 1600,

        x2: 4000,

        y2: 1600,

        width: 80

    });


    World.paths.push({

        x1: 2100,

        y1: 200,

        x2: 2100,

        y2: 3000,

        width: 70

    });

}


/* =========================================================
   INITIAL MONSTERS
   ========================================================= */

function createInitialMonsters() {

    Animals.length = 0;


    spawnMonster(
        "forestWolf",
        1350,
        1180
    );


    spawnMonster(
        "forestWolf",
        2520,
        1040
    );


    spawnMonster(
        "smilingDeer",
        1720,
        820
    );


    spawnMonster(
        "smilingDeer",
        2700,
        1750
    );


    spawnMonster(
        "experimentalBoar",
        1050,
        2100
    );


    spawnMonster(
        "longEared",
        3100,
        1250
    );


    spawnMonster(
        "longEared",
        3550,
        2050
    );

}


/* =========================================================
   SPAWN MONSTER
   ========================================================= */

function spawnMonster(
    type,
    x,
    y
) {

    const data =
        MonsterTypes[type];


    if (!data) {
        return null;
    }


    const monster = {

        id:
            type +
            "_" +
            Math.random()
                .toString(36)
                .slice(2),

        name:
            data.name,

        enemyType:
            data.enemyType,

        x,

        y,

        width: 42,

        height: 42,

        health:
            data.maxHealth,

        maxHealth:
            data.maxHealth,

        damage:
            data.damage,

        speed:
            data.speed,

        staminaCost:
            data.staminaCost,

        color:
            data.color,

        active: true,

        defeated: false,

        wanderAngle:
            Math.random() *
            Math.PI *
            2,

        wanderTimer:
            0

    };


    Animals.push(
        monster
    );


    return monster;

}


/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(
    timestamp
) {

    if (!Game.running) {
        return;
    }


    const delta =
        Math.min(
            0.05,
            (timestamp -
                Game.lastTime) /
            1000
        );


    Game.lastTime =
        timestamp;


    update(delta);

    draw();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   UPDATE
   ========================================================= */

function update(delta) {

    if (
        Game.mode ===
        "explore"
    ) {

        updatePlayer(
            delta
        );

        updateMonsters(
            delta
        );

        checkMonsterCollisions();

        checkClues();

        checkBuildings();

        updateCamera();

        recoverStamina(
            delta
        );

    }


    if (
        Game.messageTimer > 0
    ) {

        Game.messageTimer -=
            delta;


        if (
            Game.messageTimer <= 0
        ) {

            hideMessage();

        }

    }


    if (
        Game.encounterCooldown > 0
    ) {

        Game.encounterCooldown -=
            delta;

    }


    updateHUD();

}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function updatePlayer(
    delta
) {

    let dx = 0;

    let dy = 0;


    if (
        Game.keys.w ||
        Game.keys.arrowup
    ) {

        dy -= 1;

        Player.facing =
            "up";

    }


    if (
        Game.keys.s ||
        Game.keys.arrowdown
    ) {

        dy += 1;

        Player.facing =
            "down";

    }


    if (
        Game.keys.a ||
        Game.keys.arrowleft
    ) {

        dx -= 1;

        Player.facing =
            "left";

    }


    if (
        Game.keys.d ||
        Game.keys.arrowright
    ) {

        dx += 1;

        Player.facing =
            "right";

    }


    Player.moving =
        dx !== 0 ||
        dy !== 0;


    if (
        dx !== 0 &&
        dy !== 0
    ) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        dx /= length;

        dy /= length;

    }


    let speed =
        Player.speed;


    /*
       Holding shift makes movement faster
       but consumes stamina.
    */

    if (
        Game.keys.shift &&
        Player.stamina > 0
    ) {

        speed *= 1.45;

        Player.stamina -=
            22 * delta;

    }


    Player.x +=
        dx *
        speed *
        delta;


    Player.y +=
        dy *
        speed *
        delta;


    /*
       World boundaries.
    */

    Player.x =
        Math.max(
            30,
            Math.min(
                Game.worldWidth - 30,
                Player.x
            )
        );


    Player.y =
        Math.max(
            30,
            Math.min(
                Game.worldHeight - 30,
                Player.y
            )
        );

}


/* =========================================================
   STAMINA
   ========================================================= */

function recoverStamina(
    delta
) {

    if (
        !Game.keys.shift
    ) {

        Player.stamina +=
            Player.staminaRecovery *
            delta;

    }


    Player.stamina =
        Math.max(
            0,
            Math.min(
                Player.maxStamina,
                Player.stamina
            )
        );

}


/* =========================================================
   MONSTER AI
   ========================================================= */

function updateMonsters(
    delta
) {

    for (
        const monster
        of Animals
    ) {

        if (
            !monster.active ||
            monster.defeated
        ) {

            continue;

        }


        const d =
            distance(
                monster.x,
                monster.y,
                Player.x,
                Player.y
            );


        /*
           Chase the player when close.
        */

        if (
            d < 260
        ) {

            const angle =
                Math.atan2(
                    Player.y -
                    monster.y,

                    Player.x -
                    monster.x
                );


            monster.x +=
                Math.cos(angle) *
                monster.speed *
                delta;


            monster.y +=
                Math.sin(angle) *
                monster.speed *
                delta;

        }

        else {

            /*
               Wander.
            */

            monster.wanderTimer -=
                delta;


            if (
                monster.wanderTimer <= 0
            ) {

                monster.wanderAngle =
                    Math.random() *
                    Math.PI *
                    2;


                monster.wanderTimer =
                    1 +
                    Math.random() *
                    3;

            }


            monster.x +=
                Math.cos(
                    monster.wanderAngle
                ) *
                monster.speed *
                0.25 *
                delta;


            monster.y +=
                Math.sin(
                    monster.wanderAngle
                ) *
                monster.speed *
                0.25 *
                delta;

        }

    }

}


/* =========================================================
   MONSTER COLLISION
   ========================================================= */

function checkMonsterCollisions() {

    if (
        Game.encounterCooldown > 0
    ) {

        return;

    }


    for (
        const monster
        of Animals
    ) {

        if (
            !monster.active ||
            monster.defeated
        ) {

            continue;

        }


        const d =
            distance(
                monster.x,
                monster.y,
                Player.x,
                Player.y
            );


        if (
            d < 35
        ) {

            startBattle(
                monster
            );


            Game.encounterCooldown =
                1.5;


            break;

        }

    }

}


/* =========================================================
   START BATTLE
   ========================================================= */

function startBattle(
    enemy
) {

    if (
        !enemy ||
        enemy.defeated
    ) {

        return;

    }


    Game.mode =
        "battle";

    Game.battleOpen =
        true;

    Game.currentEnemy =
        enemy;


    const screen =
        document.getElementById(
            "battleScreen"
        );


    screen.style.display =
        "block";


    document.getElementById(
        "enemyName"
    ).textContent =
        enemy.name;


    updateBattleStats();

}


/* =========================================================
   PLAYER ATTACK
   ========================================================= */

function playerAttack(
    type
) {

    if (
        Game.mode !==
        "battle"
    ) {

        return;

    }


    const enemy =
        Game.currentEnemy;


    if (
        !enemy
    ) {

        return;

    }


    let staminaCost = 0;

    let damage = 0;


    if (
        type ===
        "quick"
    ) {

        staminaCost =
            15;

        damage =
            15 +
            Math.floor(
                Math.random() *
                8
            );

    }


    if (
        type ===
        "heavy"
    ) {

        staminaCost =
            30;

        damage =
            28 +
            Math.floor(
                Math.random() *
                13
            );

    }


    if (
        type ===
        "special"
    ) {

        staminaCost =
            50;

        damage =
            48 +
            Math.floor(
                Math.random() *
                18
            );

    }


    if (
        Player.stamina <
        staminaCost
    ) {

        setBattleMessage(
            "You're too exhausted."
        );

        return;

    }


    Player.stamina -=
        staminaCost;


    enemy.health -=
        damage;


    setBattleMessage(
        "You dealt " +
        damage +
        " damage."
    );


    updateBattleStats();


    if (
        enemy.health <= 0
    ) {

        enemy.health =
            0;

        enemy.defeated =
            true;

        enemy.active =
            false;


        if (
            typeof playEnemyDeathScene ===
            "function"
        ) {

            playEnemyDeathScene(
                enemy
            );

        }

        else {

            endBattle();

        }


        return;

    }


    /*
       Enemy attacks after player.
    */

    setTimeout(
        enemyAttack,
        550
    );

}


/* =========================================================
   ENEMY ATTACK
   ========================================================= */

function enemyAttack() {

    if (
        Game.mode !==
        "battle"
    ) {

        return;

    }


    const enemy =
        Game.currentEnemy;


    if (
        !enemy ||
        enemy.defeated
    ) {

        return;

    }


    const damage =
        enemy.damage +
        Math.floor(
            Math.random() *
            7
        );


    damagePlayer(
        damage
    );


    setBattleMessage(
        enemy.name +
        " attacked for " +
        damage +
        " damage."
    );


    updateBattleStats();

}


/* =========================================================
   REST
   ========================================================= */

function restTurn() {

    if (
        Gam
