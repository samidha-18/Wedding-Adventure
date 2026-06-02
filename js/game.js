let selectedSide = "";
let playerName = "";
let score = 0;
let lives = 3;
let cameraX = 0;

let gamePaused = false;
let event1Shown = false;

let diamondOwner = "none";
let sparkleMessageTimer = 0;

let pipeSceneActive = false;
let pipeSceneStage = "";
let pipeSceneTimer = 0;

const coupleNames = {
  groom: "John",
  bride: "Jane"
};

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

const levelWidth = 2400;

const diamond = {
  x: 430,
  y: 360,
  width: 32,
  height: 32,
  collected: false
};

const pipe = {
  x: 1550,
  y: 330,
  width: 70,
  height: 90
};

const platforms = [
  { x: 250, y: 340, width: 150, height: 25 },
  { x: 500, y: 280, width: 150, height: 25 },
  { x: 750, y: 220, width: 150, height: 25 },
  { x: 1050, y: 330, width: 160, height: 25 },
  { x: 1350, y: 270, width: 160, height: 25 }
];

let questionBlocks = [
  { x: 360, y: 260, width: 40, height: 40, used: false, reward: "coin" },
  { x: 680, y: 300, width: 40, height: 40, used: false, reward: "coin" },
  { x: 1120, y: 250, width: 40, height: 40, used: false, reward: "coin" }
];

let floatingRewards = [];

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
    id: "enemy1",
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
    id: "pipeGuard",
    x: 1380,
    y: 380,
    width: 38,
    height: 42,
    direction: -1,
    speed: 1.6,
    alive: true,
    minX: 1280,
    maxX: 1480
  }
];

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

  if (selectedSide === "groom") {
    player.width = 48;
    player.height = 70;
  } else {
    player.width = 40;
    player.height = 55;
  }

  player.y = 420 - player.height;

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
  if (gamePaused) {
    updatePipeScene();
    return;
  }

  if (keys["ArrowRight"]) player.x += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > levelWidth) player.x = levelWidth - player.width;

  blockPipeIfGuardAlive();

  player.velocityY += 0.7;
  player.y += player.velocityY;

  const ground = 420;

  if (player.y + player.height >= ground) {
    player.y = ground - player.height;
    player.velocityY = 0;
    player.jumping = false;
  }

  handlePlatformLanding();
  handleQuestionBlockHit();

  if (sparkleMessageTimer > 0) sparkleMessageTimer--;

  updateFloatingRewards();
  updateCamera();
  collectCoins();
  collectDiamond();
  updateEnemies();
  checkPipeTrigger();
}

function blockPipeIfGuardAlive() {
  const pipeGuard = enemies.find(enemy => enemy.id === "pipeGuard");

  if (pipeGuard && pipeGuard.alive) {
    const invisibleWallX = pipe.x - 4;

    if (player.x + player.width > invisibleWallX) {
      player.x = invisibleWallX - player.width;
    }
  }
}

function handlePlatformLanding() {
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

  questionBlocks.forEach(block => {
    const isFalling = player.velocityY >= 0;
    const playerBottom = player.y + player.height;
    const previousBottom = playerBottom - player.velocityY;

    const landsOnBlock =
      player.x < block.x + block.width &&
      player.x + player.width > block.x &&
      playerBottom >= block.y &&
      previousBottom <= block.y &&
      isFalling;

    if (landsOnBlock) {
      player.y = block.y - player.height;
      player.velocityY = 0;
      player.jumping = false;
    }
  });
}

function handleQuestionBlockHit() {
  questionBlocks.forEach(block => {
    if (block.used) return;

    const playerTop = player.y;
    const previousTop = playerTop - player.velocityY;

    const hitsFromBelow =
      player.x < block.x + block.width &&
      player.x + player.width > block.x &&
      playerTop <= block.y + block.height &&
      previousTop >= block.y + block.height &&
      player.velocityY < 0;

    if (hitsFromBelow) {
      block.used = true;
      player.velocityY = 3;

      score += 50;
      updateScore();

      floatingRewards.push({
        x: block.x + block.width / 2,
        y: block.y,
        startY: block.y,
        timer: 0,
        type: block.reward
      });
    }
  });
}

function updateFloatingRewards() {
  floatingRewards.forEach(reward => {
    reward.timer++;
    reward.y = reward.startY - Math.sin(Math.min(reward.timer / 35, 1) * Math.PI) * 45;

    if (reward.timer === 35) {
      score += 10;
      updateScore();
    }
  });

  floatingRewards = floatingRewards.filter(reward => reward.timer < 60);
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

    const dx = player.x + player.width / 2 - coin.x;
    const dy = player.y + player.height / 2 - coin.y;
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
    diamondOwner = "player";
    score += 250;
    updateScore();
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
        score += enemy.id === "pipeGuard" ? 200 : 100;
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
  player.y = 420 - player.height;
  player.velocityY = 0;
  cameraX = 0;
}

function updateScore() {
  document.getElementById("score").innerText = score;
}

function updateLives() {
  document.getElementById("lives").innerText = "❤️".repeat(lives);
}

function isPipeUnlocked() {
  const pipeGuard = enemies.find(enemy => enemy.id === "pipeGuard");
  return pipeGuard && !pipeGuard.alive;
}

function checkPipeTrigger() {
  if (event1Shown || pipeSceneActive) return;
  if (!isPipeUnlocked()) return;

  const nearPipe =
    player.x + player.width > pipe.x - 10 &&
    player.x < pipe.x + pipe.width + 10 &&
    player.y + player.height >= pipe.y;

  if (nearPipe) {
    gamePaused = true;
    pipeSceneActive = true;
    pipeSceneStage = "pop";
    pipeSceneTimer = 0;

    player.x = pipe.x - player.width - 10;
    player.y = pipe.y - player.height;
  }
}

function updatePipeScene() {
  if (!pipeSceneActive) return;

  pipeSceneTimer++;

  if (pipeSceneStage === "pop" && pipeSceneTimer > 100) {
    pipeSceneStage = "handoff";
    pipeSceneTimer = 0;
  }

  if (pipeSceneStage === "handoff" && pipeSceneTimer > 80) {
    diamondOwner = "partner";
    pipeSceneStage = "twirl";
    pipeSceneTimer = 0;
  }

  if (pipeSceneStage === "twirl" && pipeSceneTimer > 210) {
    pipeSceneActive = false;
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
  player.y = 420 - player.height;
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
  drawCloud(1950, 95);

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
  drawQuestionBlocks();
  drawFloatingRewards();
  drawCoins();
  drawDiamondInLevel();
  drawEnemies();

  if (pipeSceneActive && pipeSceneStage === "pop") {
    drawPartnerPopBehindPipe();
    drawPipe();
    drawPlayer();
    drawDiamondFollowingPlayer();
  } else {
    drawPipe();

    if (pipeSceneActive) {
      drawPipeScene();
    } else {
      drawPlayer();
      drawDiamondFollowingPlayer();
    }
  }

  drawPipeLockMessage();
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

function drawQuestionBlocks() {
  const context = ctx();

  questionBlocks.forEach(block => {
    context.fillStyle = block.used ? "#a06a2a" : "#f6b93b";
    context.fillRect(block.x - cameraX, block.y, block.width, block.height);

    context.strokeStyle = "#7a4b12";
    context.strokeRect(block.x - cameraX, block.y, block.width, block.height);

    context.fillStyle = block.used ? "#6b3f1d" : "#ffffff";
    context.font = "28px Arial";
    context.fillText(block.used ? "•" : "?", block.x - cameraX + 11, block.y + 30);
  });
}

function drawFloatingRewards() {
  floatingRewards.forEach(reward => {
    drawCoinShape(reward.x - cameraX, reward.y, 11);
  });
}

function drawCoins() {
  coins.forEach(coin => {
    if (!coin.collected) {
      drawCoinShape(coin.x - cameraX, coin.y, coin.radius);
    }
  });
}

function drawCoinShape(x, y, radius) {
  const context = ctx();

  context.beginPath();
  context.fillStyle = "#ffd700";
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#b8860b";
  context.stroke();
}

function drawDiamondInLevel() {
  if (diamond.collected) return;
  drawSmallDiamond(diamond.x - cameraX, diamond.y);
}

function drawDiamondFollowingPlayer() {
  if (diamondOwner !== "player") return;

  const x = player.x - cameraX + player.width / 2 - 12;
  const y = player.y - 32;

  drawSmallDiamond(x, y);
  drawBlinkGlow(player.x - cameraX + player.width / 2, player.y + player.height / 2);
}

function drawEnemies() {
  const context = ctx();

  enemies.forEach(enemy => {
    if (!enemy.alive) return;

    context.fillStyle = enemy.id === "pipeGuard" ? "#5b1a8b" : "#8b0000";
    context.fillRect(enemy.x - cameraX, enemy.y, enemy.width, enemy.height);

    context.fillStyle = "white";
    context.fillRect(enemy.x - cameraX + 5, enemy.y + 8, 6, 6);
    context.fillRect(enemy.x - cameraX + enemy.width - 11, enemy.y + 8, 6, 6);

    if (enemy.id === "pipeGuard") {
      context.fillStyle = "#ffd700";
      context.fillRect(enemy.x - cameraX + 8, enemy.y - 8, enemy.width - 16, 6);
    }
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

function drawPipeLockMessage() {
  if (isPipeUnlocked() || pipeSceneActive || event1Shown) return;

  const distanceToPipe = Math.abs((player.x + player.width) - pipe.x);

  if (distanceToPipe < 160) {
    const context = ctx();

    context.fillStyle = "rgba(0, 0, 0, 0.55)";
    context.fillRect(245, 35, 410, 50);

    context.fillStyle = "#fff7b2";
    context.font = "20px Arial";
    context.fillText("Defeat the guard to unlock the pipe!", 285, 67);
  }
}

function drawPipeScene() {
  if (pipeSceneStage === "handoff") drawHandoffScene();
  if (pipeSceneStage === "twirl") drawTwirlScene();
}

function drawPartnerPopBehindPipe() {
  const context = ctx();

  const isPartnerMale = selectedSide === "bride";
  const partnerName = isPartnerMale ? coupleNames.groom : coupleNames.bride;

  const partnerW = isPartnerMale ? 48 : 40;
  const partnerH = isPartnerMale ? 70 : 55;

  const progress = Math.min(pipeSceneTimer / 100, 1);

  const startY = pipe.y + 25;
  const endY = pipe.y - partnerH + 5;

  const partnerX = pipe.x + pipe.width / 2 - partnerW / 2 - cameraX;
  const partnerY = startY + (endY - startY) * progress;

  drawCharacter(
    partnerX,
    partnerY,
    partnerW,
    partnerH,
    isPartnerMale ? "#1f2a44" : "#ff8fab"
  );

  if (progress > 0.75) {
    context.fillStyle = "rgba(0, 0, 0, 0.55)";
    context.fillRect(partnerX - 18, partnerY - 32, partnerW + 36, 24);

    context.fillStyle = "#fff7b2";
    context.font = "16px Arial";
    context.fillText(partnerName, partnerX - 5, partnerY - 14);
  }
}

function drawHandoffScene() {
  const isPlayerMale = selectedSide === "groom";
  const isPartnerMale = selectedSide === "bride";

  const playerX = pipe.x - player.width - 10 - cameraX;
  const playerY = pipe.y - player.height;

  const partnerW = isPartnerMale ? 48 : 40;
  const partnerH = isPartnerMale ? 70 : 55;

  const partnerX = pipe.x + pipe.width / 2 - partnerW / 2 - cameraX;
  const partnerY = pipe.y - partnerH;

  drawCharacter(playerX, playerY, player.width, player.height, isPlayerMale ? "#1f2a44" : "#ff8fab");
  drawCharacter(partnerX, partnerY, partnerW, partnerH, isPartnerMale ? "#1f2a44" : "#ff8fab");

  const progress = Math.min(pipeSceneTimer / 80, 1);

  const startX = playerX + player.width / 2 - 12;
  const startY = playerY - 30;
  const endX = partnerX + partnerW / 2 - 12;
  const endY = partnerY - 30;

  const diamondX = startX + (endX - startX) * progress;
  const diamondY = startY + (endY - startY) * progress;

  drawSmallDiamond(diamondX, diamondY);
  drawBlinkGlow(diamondX + 12, diamondY + 12);
}

function drawTwirlScene() {
  const context = ctx();

  const centerX = pipe.x + pipe.width / 2 - cameraX;
  const baseY = pipe.y - 8;

  const t = pipeSceneTimer;
  const sway = Math.sin(t * 0.06) * 10;
  const bounce = Math.abs(Math.sin(t * 0.06)) * 5;

  const isPlayerMale = selectedSide === "groom";
  const isPartnerMale = selectedSide === "bride";

  const playerW = isPlayerMale ? 48 : 40;
  const playerH = isPlayerMale ? 70 : 55;

  const partnerW = isPartnerMale ? 48 : 40;
  const partnerH = isPartnerMale ? 70 : 55;

  const playerX = centerX - playerW - 4 + sway;
  const playerY = baseY - playerH + bounce;

  const partnerX = centerX + 4 - sway;
  const partnerY = baseY - partnerH + bounce;

  drawCharacter(playerX, playerY, playerW, playerH, isPlayerMale ? "#1f2a44" : "#ff8fab");
  drawCharacter(partnerX, partnerY, partnerW, partnerH, isPartnerMale ? "#1f2a44" : "#ff8fab");

  const diamondX = centerX - 12;
  const diamondY = baseY - 95 + Math.sin(t * 0.04) * 5;

  drawSmallDiamond(diamondX, diamondY);
  drawBlinkGlow(centerX, baseY - 35);

  for (let i = 0; i < 6; i++) {
    const sparkleX = centerX - 45 + i * 18;
    const sparkleY = baseY - 85 + Math.sin(t * 0.06 + i) * 8;

    context.fillStyle = i % 2 === 0 ? "#fff7b2" : "#b9f2ff";
    context.fillRect(sparkleX, sparkleY, 4, 4);
  }

  context.fillStyle = "rgba(0, 0, 0, 0.55)";
  context.fillRect(300, 35, 360, 45);

  context.fillStyle = "#fff7b2";
  context.font = "20px Arial";
  context.fillText("We’re Ringing in the Wedding Bells...", 320, 65);
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

  if (event1Shown) {
    drawConstantGlow(player.x - cameraX + player.width / 2, player.y + player.height / 2);
  }
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

function drawBlinkGlow(x, y) {
  const blink = Math.floor(Date.now() / 250) % 2 === 0;
  if (!blink) return;

  const context = ctx();
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

function drawSparkleMessage() {
  if (sparkleMessageTimer <= 0) return;
  if (pipeSceneActive || event1Shown) return;
  if (diamondOwner !== "player") return;

  const context = ctx();

  context.fillStyle = "rgba(0, 0, 0, 0.55)";
  context.fillRect(285, 35, 330, 50);

  context.fillStyle = "#fff7b2";
  context.font = "24px Arial";
  context.fillText("The Diamond Is Yours...", 320, 68);
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
