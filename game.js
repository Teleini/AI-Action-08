const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('gameContainer');
const gameOver = document.getElementById('gameOver');
const levelUp = document.getElementById('levelUp');
const victory = document.getElementById('victory');

const gridSize = 20;
const canvasSize = 600;
canvas.width = canvasSize;
canvas.height = canvasSize;

const gameModes = {
    beginner: {
        name: '小白模式',
        maxLevel: 5,
        baseSpeed: 150,
        speedDecrease: 20,
        foodPerLevel: 5
    },
    expert: {
        name: '高手模式',
        maxLevel: 7,
        baseSpeed: 120,
        speedDecrease: 15,
        foodPerLevel: 8
    },
    master: {
        name: '顶级玩家模式',
        maxLevel: 10,
        baseSpeed: 100,
        speedDecrease: 8,
        foodPerLevel: 10
    }
};

let gameState = {
    mode: null,
    level: 1,
    score: 0,
    foodEaten: 0,
    speed: 150,
    isPaused: false,
    isRunning: false,
    snake: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: null,
    gameLoop: null
};

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        startGame(mode);
    });
});

document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('backBtn').addEventListener('click', backToMenu);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('menuBtn').addEventListener('click', backToMenu);
document.getElementById('continueBtn').addEventListener('click', continueToNextLevel);
document.getElementById('victoryMenuBtn').addEventListener('click', backToMenu);

document.addEventListener('keydown', handleKeyPress);

function startGame(mode) {
    gameState.mode = gameModes[mode];
    gameState.level = 1;
    gameState.score = 0;
    gameState.foodEaten = 0;
    gameState.speed = gameState.mode.baseSpeed;
    gameState.isPaused = false;
    gameState.isRunning = true;

    initSnake();
    generateFood();
    updateUI();

    menu.style.display = 'none';
    gameContainer.style.display = 'block';
    gameOver.style.display = 'none';
    levelUp.style.display = 'none';
    victory.style.display = 'none';

    startGameLoop();
}

function initSnake() {
    const startX = Math.floor(canvasSize / gridSize / 2);
    const startY = Math.floor(canvasSize / gridSize / 2);
    gameState.snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvasSize / gridSize)),
            y: Math.floor(Math.random() * (canvasSize / gridSize))
        };
    } while (gameState.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

    gameState.food = newFood;
}

function startGameLoop() {
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
    }
    gameState.gameLoop = setInterval(update, gameState.speed);
}

function update() {
    if (!gameState.isRunning || gameState.isPaused) return;

    gameState.direction = gameState.nextDirection;

    const head = {
        x: gameState.snake[0].x + gameState.direction.x,
        y: gameState.snake[0].y + gameState.direction.y
    };

    if (checkCollision(head)) {
        endGame();
        return;
    }

    gameState.snake.unshift(head);

    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10 * gameState.level;
        gameState.foodEaten++;
        generateFood();
        updateUI();

        if (gameState.foodEaten >= gameState.mode.foodPerLevel * gameState.level) {
            levelUpCheck();
        }
    } else {
        gameState.snake.pop();
    }

    draw();
}

function checkCollision(head) {
    if (head.x < 0 || head.x >= canvasSize / gridSize ||
        head.y < 0 || head.y >= canvasSize / gridSize) {
        return true;
    }

    for (let i = 0; i < gameState.snake.length; i++) {
        if (gameState.snake[i].x === head.x && gameState.snake[i].y === head.y) {
            return true;
        }
    }

    return false;
}

function levelUpCheck() {
    if (gameState.level >= gameState.mode.maxLevel) {
        winGame();
        return;
    }

    gameState.isRunning = false;
    clearInterval(gameState.gameLoop);

    gameState.level++;
    gameState.foodEaten = 0;
    gameState.speed = Math.max(50, gameState.speed - gameState.mode.speedDecrease);

    document.getElementById('levelUpText').textContent = `你已升级到等级 ${gameState.level}！速度提升！`;
    levelUp.style.display = 'block';
    gameContainer.style.display = 'none';
}

function continueToNextLevel() {
    levelUp.style.display = 'none';
    gameContainer.style.display = 'block';

    initSnake();
    generateFood();
    updateUI();

    gameState.isRunning = true;
    startGameLoop();
}

function winGame() {
    gameState.isRunning = false;
    clearInterval(gameState.gameLoop);

    document.getElementById('victoryScore').textContent = gameState.score;
    victory.style.display = 'block';
    gameContainer.style.display = 'none';
}

function endGame() {
    gameState.isRunning = false;
    clearInterval(gameState.gameLoop);

    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalLevel').textContent = gameState.level;
    gameOver.style.display = 'block';
    gameContainer.style.display = 'none';
}

function restartGame() {
    gameOver.style.display = 'none';
    const currentMode = Object.keys(gameModes).find(key => gameModes[key] === gameState.mode);
    startGame(currentMode);
}

function backToMenu() {
    gameState.isRunning = false;
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
    }

    menu.style.display = 'block';
    gameContainer.style.display = 'none';
    gameOver.style.display = 'none';
    levelUp.style.display = 'none';
    victory.style.display = 'none';
}

function togglePause() {
    if (!gameState.isRunning) return;

    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseBtn').textContent = gameState.isPaused ? '继续' : '暂停';
}

function handleKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
        return;
    }

    if (gameState.isPaused || !gameState.isRunning) return;

    switch(e.key) {
        case 'ArrowUp':
            if (gameState.direction.y === 0) {
                gameState.nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (gameState.direction.y === 0) {
                gameState.nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (gameState.direction.x === 0) {
                gameState.nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (gameState.direction.x === 0) {
                gameState.nextDirection = { x: 1, y: 0 };
            }
            break;
    }
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.fillStyle = '#4ecca3';
    gameState.snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#00ff88';
        } else {
            ctx.fillStyle = '#4ecca3';
        }
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });

    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        gameState.food.x * gridSize + gridSize / 2,
        gameState.food.y * gridSize + gridSize / 2,
        gridSize / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function updateUI() {
    document.getElementById('modeName').textContent = gameState.mode.name;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('target').textContent =
        `${gameState.foodEaten}/${gameState.mode.foodPerLevel * gameState.level}`;
}