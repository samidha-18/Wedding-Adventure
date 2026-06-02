let selectedSide = "";
let playerName = "";
let score = 0;
let lives = 3;
let cameraX = 0;
let gamePaused = false;
let event1Shown = false;

const canvas = () => document.getElementById("gameCanvas");
const ctx = () => canvas().getContext("2d");

let player = {
  x: 80,
  y: 360,
  width: 40,
  height: 55,
  speed: 5,
  velocityY: 0,
  jumping: false
};

let keys = {};

const levelWidth = 2000;

const platforms = [
  { x: 250, y: 340, width: 150, height: 25 },
  { x: 500, y: 280, width: 150, height: 25 },
  { x: 750, y: 220, width: 150, height: 25 },
  { x: 1050, y: 330, width: 160, height: 25 },
  { x: 1350, y: 270, width: 160, height: 25 }
];

let coins = [
  { x: 280, y: 295, radius: 12, collected: false },
  { x: 340, y: 295, radius: 12, collected: false },
  { x: 530, y: 235, radius: 12, collected: false },
  { x: 590, y: 235, radius: 12, collected: false },
  { x: 790, y: 175, radius: 12, collected: false },
  { x: 1085, y: 285, radius: 12, collected: false },
  { x: 1150, y: 285, radius: 12, collected: false },
  { x: 1390, y: 225, radius: 12, collected: false },
  { x: 1460, y: 225, radius: 12, collected: false }
];

let enemies = [
  {
    x: 650,
    y: 380,
    width: 35,
    height: 40,
    direction: 1,
    speed: 1.5,
    alive: true,
    minX: 550,
    maxX: 750
  },
  {
    x: 1250,
    y: 380,
    width: 35,
    height: 40,
    direction: -1,
    speed: 1.5,
    alive: true,
    minX: 1180,
    maxX: 1380
  }
];

const pipe = {
  x: 1550,
  y: 330,
  width: 70,
  height: 90
};

function selectSide(side) {
  selectedSide = side;
  alert(side === "groom" ? "Groom Side selected 🤵" : "Bride Side selected 👰");
}

function startGame() {
  playerName = document.getElementById("playerName").value;

  if (selectedSide === "") {
    alert("Please select Groom Side or Bride Side first.");
    return;
  }

  if (playerName.trim() === "") {
    alert("Please enter your player name.");
    return;
  }

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";

  const icon = selectedSide === "groom" ? "🤵" : "👰";
  document.getElementById("welcomeText").innerText = playerName + " " + icon;

  gameLoop();
}

document.addEventListener("keydown", function(event) {
  keys[event.key] = true;

  if ((event.code === "Space" || event.key === "ArrowUp") && !player.jumping && !gamePaused) {
    player.velocityY = -14;
    player.jumping = true;
  }
});

document.addEventListener("keyup", function(event) {
  keys[event.key] = false;
});

function updatePlayer() {
  if (gamePaused) return;

  if (keys["ArrowRight"]) player.x += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > levelWidth) player.x = levelWidth - player.width;

  player.velocityY += 0.7;
  player.y += player.velocityY;

  const ground = 420;

  if (player.y + player.height >= ground) {
    player.y = ground - player.height;
    player.velocityY = 0;
    player.jumping = false;
  }

  platforms.forEach(platform => {
    const isFalling = player.velocityY >= 0;
    const playerBottom = player.y + player.height;
    const previousBottom = playerBottom - player.velocityY;

    const landsOnPlatform =
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      playerBottom >= platform.y &&
      previousBottom <= platform.y &&
      isFalling;

    if (landsOnPlatform) {
      player.y = platform.y - player.height;
      player.velocityY = 0;
      player.jumping = false;
    }
  });

  updateCamera();
  collectCoins();
  updateEnemies();
  checkPipeTrigger();
}

function updateCamera() {
  const c = canvas();
  cameraX = player.x - c.width / 2 + player.width / 2;

  if (cameraX < 0) cameraX = 0;
  if (cameraX > levelWidth - c.width) cameraX = levelWidth - c.width;
}

function collectCoins() {
  coins.forEach(coin => {
    if (coin.collected) return;

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const dx = playerCenterX - coin.x;
    const dy = playerCenterY - coin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < coin.radius + 25) {
      coin.collected = true;
      score += 10;
      updateScore();
    }
  });
}

function updateEnemies() {
  enemies.forEach(enemy => {
    if (!enemy.alive) return;

    enemy.x += enemy.speed * enemy.direction;

    if (enemy.x < enemy.minX) enemy.direction = 1;
    if (enemy.x > enemy.maxX) enemy.direction = -1;

    const playerBottom = player.y + player.height;

    const collision =
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      playerBottom > enemy.y;

    if (collision) {
      const stomp = player.velocityY > 0 && playerBottom < enemy.y + 20;

      if (stomp) {
        enemy.alive = false;
        score += 100;
        updateScore();
        player.velocityY = -8;
      } else {
        loseLife();
      }
    }
  });
}

function loseLife() {
  lives--;
  updateLives();

  if (lives <= 0) {
    alert("Game Over! Restarting.");
    location.reload();
    return;
  }

  player.x = 80;
  player.y = 360;
  player.velocityY = 0;
  cameraX = 0;
}

function updateScore() {
  document.getElementById("score").innerText = score;
}

function updateLives() {
  document.getElementById("lives").innerText = "❤️".repeat(lives);
}

function checkPipeTrigger() {
  if (event1Shown) return;

  const nearPipe =
    player.x + player.width > pipe.x - 10 &&
    player.x < pipe.x + pipe.width + 10 &&
    player.y + player.height >= pipe.y;

  if (nearPipe) {
    event1Shown = true;
    gamePaused = true;
    score += 300;
    updateScore();

    document.getElementById("eventTitle").innerText = "Sangeet Night";
    document.getElementById("eventDate").innerText = "12 December 2026";
    document.getElementById("eventTime").innerText = "7:00 PM onwards";
    document.getElementById("eventVenue").innerText = "Grand Ballroom";

    document.getElementById("eventOverlay").classList.remove("hidden");
  }
}

function closeEvent() {
  document.getElementById("eventOverlay").classList.add("hidden");
  gamePaused = false;
  player.x = pipe.x + pipe.width + 30;
}

function drawGame() {
  const c = canvas();
  const context = ctx();

  context.clearRect(0, 0, c.width, c.height);

  context.fillStyle = "#79c9ff";
  context.fillRect(0, 0, c.width, c.height);

  drawCloud(120, 80);
  drawCloud(500, 90);
  drawCloud(760, 70);
  drawCloud(1100, 85);
  drawCloud(1500, 75);

  context.fillStyle = "#8b5a2b";
  context.fillRect(-cameraX, 420, levelWidth, 80);

  context.fillStyle = "#3cb043";
  context.fillRect(-cameraX, 420, levelWidth, 15);

  for (let x = 0; x < levelWidth; x += 40) {
    context.strokeStyle = "#6b3f1d";
    context.strokeRect(x - cameraX, 420, 40, 40);
    context.strokeRect(x - cameraX, 460, 40, 40);
  }

  drawPlatforms();
  drawCoins();
  drawEnemies();
  drawPipe();
  drawPartner();
  drawPlayer();
}

function drawPlatforms() {
  const context = ctx();

  platforms.forEach(platform => {
    context.fillStyle = "#b5651d";
    context.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);

    context.strokeStyle = "#6b3f1d";
    context.strokeRect(platform.x - cameraX, platform.y, platform.width, platform.height);
  });
}

function drawCoins() {
  const context = ctx();

  coins.forEach(coin => {
    if (!coin.collected) {
      context.beginPath();
      context.fillStyle = "#ffd700";
      context.arc(coin.x - cameraX, coin.y, coin.radius, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "#b8860b";
      context.stroke();
    }
  });
}

function drawEnemies() {
  const context = ctx();

  enemies.forEach(enemy => {
    if (!enemy.alive) return;

    context.fillStyle = "#8b0000";
    context.fillRect(enemy.x - cameraX, enemy.y, enemy.width, enemy.height);

    context.fillStyle = "white";
    context.fillRect(enemy.x - cameraX + 5, enemy.y + 8, 6, 6);
    context.fillRect(enemy.x - cameraX + 24, enemy.y + 8, 6, 6);
  });
}

function drawPipe() {
  const context = ctx();

  context.fillStyle = "#0b8f2a";
  context.fillRect(pipe.x - cameraX, pipe.y, pipe.width, pipe.height);

  context.fillStyle = "#10b33f";
  context.fillRect(pipe.x - cameraX - 10, pipe.y, pipe.width + 20, 20);

  context.strokeStyle = "#064d18";
  context.strokeRect(pipe.x - cameraX, pipe.y, pipe.width, pipe.height);
  context.strokeRect(pipe.x - cameraX - 10, pipe.y, pipe.width + 20, 20);
}

function drawPartner() {
  if (event1Shown) return;

  const context = ctx();

  const partnerX = pipe.x + 15 - cameraX;
  const partnerY = pipe.y - 55;

  context.fillStyle = selectedSide === "groom" ? "#ff8fab" : "#1f2a44";
  context.fillRect(partnerX, partnerY, 40, 55);

  context.fillStyle = "#ffd6a5";
  context.fillRect(partnerX + 8, partnerY + 5, 24, 20);

  context.fillStyle = "#b9f2ff";
  context.beginPath();
  context.moveTo(partnerX + 20, partnerY - 15);
  context.lineTo(partnerX + 32, partnerY);
  context.lineTo(partnerX + 8, partnerY);
  context.closePath();
  context.fill();
}

function drawPlayer() {
  const context = ctx();

  context.fillStyle = selectedSide === "groom" ? "#1f2a44" : "#ff8fab";
  context.fillRect(player.x - cameraX, player.y, player.width, player.height);

  context.fillStyle = "#ffd6a5";
  context.fillRect(player.x - cameraX + 8, player.y + 5, 24, 20);
}

function drawCloud(x, y) {
  const context = ctx();

  context.fillStyle = "white";
  context.beginPath();
  context.arc(x - cameraX * 0.3, y, 22, 0, Math.PI * 2);
  context.arc(x + 25 - cameraX * 0.3, y - 10, 25, 0, Math.PI * 2);
  context.arc(x + 55 - cameraX * 0.3, y, 22, 0, Math.PI * 2);
  context.fill();
}

function gameLoop() {
  updatePlayer();
  drawGame();
  requestAnimationFrame(gameLoop);
}
