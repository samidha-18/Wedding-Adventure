let selectedSide = "";
let playerName = "";
let score = 0;
let lives = 3;
let cameraX = 0;
let gamePaused = false;
let event1Shown = false;
let diamondCollected = false;
let sparkleMessageTimer = 0;

let twirlActive = false;
let twirlTimer = 0;

const canvas = () => document.getElementById("gameCanvas");
const ctx = () => canvas().getContext("2d");

let player = {
  x: 80,
  y: 360,
  width: 40,
  height: 55,
  speed: 5,
  velocityY: 0,
  jumping: false,
  isBig: false
};

let keys = {};

const levelWidth = 2000;

const diamond = {
  x: 430,
  y: 360,
  width: 32,
  height: 32,
  collected: false
};

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

if (selectedSide === "groom") {
  player.width = 48;
  player.height = 70;
} else {
  player.width = 40;
  player.height = 55;
}

player.y = 420 - player.height;
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
  if (gamePaused) {
    updateTwirl();
    return;
  }

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

  if (sparkleMessageTimer > 0) sparkleMessageTimer--;

  updateCamera();
  collectCoins();
  collectDiamond();
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

function collectDiamond() {
  if (diamond.collected) return;

  const collision =
    player.x < diamond.x + diamond.width &&
    player.x + player.width > diamond.x &&
    player.y < diamond.y + diamond.height &&
    player.y + player.height > diamond.y;

  if (collision) {
    diamond.collected = true;
    diamondCollected = true;
    score += 250;
    updateScore();

    const oldHeight = player.height;

    player.isBig = true;

if (selectedSide === "groom") {
  player.width = 58;
  player.height = 84;
} else {
  player.width = 44;
  player.height = 61;
}

    player.y -= player.height - oldHeight;

    sparkleMessageTimer = 160;
  }
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
  if (event1Shown || twirlActive) return;

  const nearPipe =
    player.x + player.width > pipe.x - 10 &&
    player.x < pipe.x + pipe.width + 10 &&
    player.y + player.height >= pipe.y;

  if (nearPipe) {
    gamePaused = true;
    twirlActive = true;
    twirlTimer = 150;
    player.x = pipe.x - 55;
    player.y = 420 - player.height;
  }
}

function updateTwirl() {
  if (!twirlActive) return;

  twirlTimer--;

  if (twirlTimer <= 0) {
    twirlActive = false;
    event1Shown = true;
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
  drawDiamond();
  drawEnemies();
  drawPipe();

  if (twirlActive) {
    drawTwirlScene();
  } else {
    drawPartner();
    drawPlayer();
  }

  drawSparkleMessage();
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

function drawDiamond() {
  if (diamond.collected) return;

  const context = ctx();
  const x = diamond.x - cameraX;
  const y = diamond.y;

  context.fillStyle = "#b9f2ff";
  context.beginPath();
  context.moveTo(x + diamond.width / 2, y);
  context.lineTo(x + diamond.width, y + 12);
  context.lineTo(x + diamond.width / 2, y + diamond.height);
  context.lineTo(x, y + 12);
  context.closePath();
  context.fill();

  context.strokeStyle = "#ffffff";
  context.stroke();

  context.fillStyle = "white";
  context.fillRect(x + 12, y + 8, 8, 4);
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
  if (event1Shown || twirlActive) return;

  const partnerIsVisible = player.x > pipe.x - 260;
  if (!partnerIsVisible) return;

  const context = ctx();

  const isPartnerMale = selectedSide === "bride";

  const partnerWidth = isPartnerMale ? 48 : 40;
  const partnerHeight = isPartnerMale ? 70 : 55;

  const partnerX = pipe.x + pipe.width / 2 - partnerWidth / 2 - cameraX;
  const partnerY = pipe.y - partnerHeight;

  drawCharacter(
    partnerX,
    partnerY,
    partnerWidth,
    partnerHeight,
    isPartnerMale ? "#1f2a44" : "#ff8fab"
  );

  if (diamondCollected) {
    drawSmallDiamond(partnerX + partnerWidth / 2 - 12, partnerY - 28);
    drawBlinkGlow(partnerX + partnerWidth / 2, partnerY + partnerHeight / 2);
  }

function drawPlayer() {
  const isPlayerMale = selectedSide === "groom";

  drawCharacter(
    player.x - cameraX,
    player.y,
    player.width,
    player.height,
    isPlayerMale ? "#1f2a44" : "#ff8fab"
  );

  if (diamondCollected && !event1Shown) {
    drawBlinkGlow(
      player.x - cameraX + player.width / 2,
      player.y + player.height / 2
    );
  }

  if (event1Shown) {
    drawConstantGlow(
      player.x - cameraX + player.width / 2,
      player.y + player.height / 2
    );
  }
}

function drawTwirlScene() {
  const context = ctx();

  const centerX = pipe.x + pipe.width / 2 - cameraX;
  const centerY = pipe.y - 45;

  const angle = twirlTimer * 0.18;
  const radius = 26;

  const isPlayerMale = selectedSide === "groom";
  const isPartnerMale = selectedSide === "bride";

  const playerW = isPlayerMale ? 58 : 44;
  const playerH = isPlayerMale ? 84 : 61;

  const partnerW = isPartnerMale ? 48 : 40;
  const partnerH = isPartnerMale ? 70 : 55;

  const x1 = centerX + Math.cos(angle) * radius - playerW / 2;
  const y1 = centerY + Math.sin(angle) * 8 - playerH / 2;

  const x2 = centerX + Math.cos(angle + Math.PI) * radius - partnerW / 2;
  const y2 = centerY + Math.sin(angle + Math.PI) * 8 - partnerH / 2;

  drawCharacter(x1, y1, playerW, playerH, isPlayerMale ? "#1f2a44" : "#ff8fab");
  drawCharacter(x2, y2, partnerW, partnerH, isPartnerMale ? "#1f2a44" : "#ff8fab");

  drawSmallDiamond(centerX - 12, centerY - 60);
  drawBlinkGlow(centerX, centerY);

  for (let i = 0; i < 10; i++) {
    const sparkleAngle = angle + i * 0.7;
    const sx = centerX + Math.cos(sparkleAngle) * (45 + i);
    const sy = centerY + Math.sin(sparkleAngle) * (25 + i / 2);

    context.fillStyle = i % 2 === 0 ? "#fff7b2" : "#b9f2ff";
    context.fillRect(sx, sy, 5, 5);
  }

  context.fillStyle = "rgba(0, 0, 0, 0.55)";
  context.fillRect(300, 35, 300, 45);

  context.fillStyle = "#fff7b2";
  context.font = "22px Arial";
  context.fillText("A Wedding Moment...", 340, 65);
}

function drawCharacter(x, y, width, height, bodyColor) {
  const context = ctx();

  context.fillStyle = bodyColor;
  context.fillRect(x, y, width, height);

  context.fillStyle = "#ffd6a5";
  context.fillRect(x + width * 0.2, y + 5, width * 0.6, height * 0.32);

  context.fillStyle = "#222";
  context.fillRect(x + width * 0.33, y + 15, 4, 4);
  context.fillRect(x + width * 0.62, y + 15, 4, 4);
}

function drawSmallDiamond(x, y) {
  const context = ctx();

  context.fillStyle = "#b9f2ff";
  context.beginPath();
  context.moveTo(x + 12, y);
  context.lineTo(x + 24, y + 10);
  context.lineTo(x + 12, y + 24);
  context.lineTo(x, y + 10);
  context.closePath();
  context.fill();

  context.strokeStyle = "#ffffff";
  context.stroke();
}

function drawSparkleMessage() {
  if (sparkleMessageTimer <= 0) return;

  const context = ctx();

  context.fillStyle = "rgba(0, 0, 0, 0.55)";
  context.fillRect(285, 35, 330, 50);

  context.fillStyle = "#fff7b2";
  context.font = "24px Arial";
  context.fillText("The Sparkle Begins...", 330, 68);
}
function drawBlinkGlow(x, y) {
  const context = ctx();

  const blink = Math.floor(Date.now() / 250) % 2 === 0;
  if (!blink) return;

  context.beginPath();
  context.fillStyle = "rgba(185, 242, 255, 0.28)";
  context.arc(x, y, 42, 0, Math.PI * 2);
  context.fill();
}

function drawConstantGlow(x, y) {
  const context = ctx();

  context.beginPath();
  context.fillStyle = "rgba(255, 247, 178, 0.25)";
  context.arc(x, y, 45, 0, Math.PI * 2);
  context.fill();
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
