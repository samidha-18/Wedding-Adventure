/* =========================================================
   MARIO WEDDING INVITE GAME - CLEAN SEGMENTED JS
   ========================================================= */
 
/* =========================================================
   1. GAME STATE
   ========================================================= */
 
let selectedSide = "";
let playerName = "";
let score = 0;
let lives = 3;
let cameraX = 0;
let gamePaused = false;
let event1Shown = false;
let gameLoopStarted = false;
 
let diamondOwner = "none";
let sparkleMessageTimer = 0;
let diamondMessage = "";
let powerUpTimer = 0;
let isPoweredUp = false;
 
let pipeSceneActive = false;
let pipeSceneStage = "";
let pipeSceneTimer = 0;
 
const coupleNames = {
  groom: "John",
  bride: "Jane"
};
 
const PLAYER_BASE = {
  width: 34,
  height: 50
};
 
const POWER_SCALE = {
  bride: 2.0625, // 125% of normal visual scale
  groom: 2.145   // 130% of normal visual scale
};
 
const NORMAL_VISUAL_SCALE = 1.65;
const GROUND_Y = 420;
const LEVEL_WIDTH = 2500;
 
/* =========================================================
   2. CANVAS + ASSETS
   ========================================================= */
 
const canvas = () => document.getElementById("gameCanvas");
const ctx = () => canvas().getContext("2d");
 
const groomSprite = new Image();
groomSprite.src = "assets/characters/Groom.png";
 
const brideSprite = new Image();
brideSprite.src = "assets/characters/Bride.png";
 
/* =========================================================
   3. PLAYER + LEVEL DATA
   ========================================================= */
 
let player = {
  x: 80,
  y: 360,
  width: PLAYER_BASE.width,
  height: PLAYER_BASE.height,
  speed: 5,
  velocityY: 0,
  jumping: false
};
 
let keys = {};
 
const diamond = {
  x: 1115,
  y: 195,
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
  { x: 260, y: 320, width: 160, height: 40 },
  { x: 650, y: 280, width: 160, height: 40 },
  { x: 1050, y: 240, width: 160, height: 40 },
  { x: 1280, y: 340, width: 160, height: 40 }
];
 
let questionBlocks = [
  { x: 320, y: 200, width: 40, height: 40, used: false, reward: "coin" },
  { x: 710, y: 160, width: 40, height: 40, used: false, reward: "coin" },
  { x: 1110, y: 120, width: 40, height: 40, used: false, reward: "coin" }
];
 
let secretBlocks = [
  { x: 470, y: 300, width: 40, height: 40, discovered: false, used: false, reward: 150 },
  { x: 850, y: 240, width: 40, height: 40, discovered: false, used: false, reward: 200 },
  { x: 1210, y: 200, width: 40, height: 40, discovered: false, used: false, reward: 300 }
];
 
let floatingRewards = [];
 
let coins = [
  { x: 290, y: 275, radius: 12, collected: false },
  { x: 350, y: 275, radius: 12, collected: false },
  { x: 680, y: 235, radius: 12, collected: false },
  { x: 740, y: 235, radius: 12, collected: false },
  { x: 1085, y: 195, radius: 12, collected: false },
  { x: 1150, y: 195, radius: 12, collected: false },
  { x: 1320, y: 295, radius: 12, collected: false },
  { x: 1390, y: 295, radius: 12, collected: false }
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
    maxX: 800,
    hitsRemaining: 1
  },
  {
    id: "pipeGuard",
    x: 1380,
    y: 378,
    width: 42,
    height: 44,
    direction: -1,
    speed: 2.8,
    alive: true,
    minX: 1200,
    maxX: 1520,
    hitsRemaining: 2
  }
];
 
/* =========================================================
   4. SMALL HELPERS
   ========================================================= */
 
function getPlayerType() {
  return selectedSide === "groom" ? "groom" : "bride";
}
 
function getPartnerType() {
  return selectedSide === "groom" ? "bride" : "groom";
}
 
function getCharacterColor(type) {
  return type === "groom" ? "#1f2a44" : "#ff8fab";
}
 
function getCharacterName(type) {
  return type === "groom" ? coupleNames.groom : coupleNames.bride;
}
 
function getCharacterDrawSize(type, powered = false) {
  let scale = NORMAL_VISUAL_SCALE;
 
  if (powered) {
    scale = type === "groom" ? POWER_SCALE.groom : POWER_SCALE.bride;
  }
 
  if (powered && powerUpTimer > 0) {
    scale += Math.sin(powerUpTimer * 0.35) * 0.18;
  }
 
  return {
    width: PLAYER_BASE.width * scale,
    height: PLAYER_BASE.height * scale
  };
}
 
function isPipeUnlocked() {
  const pipeGuard = enemies.find(enemy => enemy.id === "pipeGuard");
  return pipeGuard && !pipeGuard.alive;
}
 
function setPlayerCollisionSize() {
  player.width = PLAYER_BASE.width;
  player.height = PLAYER_BASE.height;
}
 
function placePlayerAtStart() {
  player.x = 80;
  player.y = GROUND_Y - player.height;
  player.velocityY = 0;
  player.jumping = false;
  cameraX = 0;
}
 
/* =========================================================
   5. START SCREEN UI
   ========================================================= */
 
function selectSide(side) {
  selectedSide = side;
  updateSideButtons();
  showStartMessage("", "normal");
}
 
function updateSideButtons() {
  const groomButton = document.getElementById("groomButton");
  const brideButton = document.getElementById("brideButton");
  const status = document.getElementById("selectionStatus");
 
  if (status) status.innerText = "";
 
  if (!groomButton || !brideButton) return;
 
  groomButton.classList.remove("selected", "dimmed", "needs-selection");
  brideButton.classList.remove("selected", "dimmed", "needs-selection");
 
  if (selectedSide === "groom") {
    groomButton.classList.add("selected");
    brideButton.classList.add("dimmed");
  }
 
  if (selectedSide === "bride") {
    brideButton.classList.add("selected");
    groomButton.classList.add("dimmed");
  }
}
 
function showStartMessage(message, type = "normal") {
  const box = document.getElementById("startMessage");
  if (!box) return;
 
  box.innerText = message;
  box.classList.remove("error", "normal");
  box.classList.add(type);
}
 
function requestSideSelection() {
  const groomButton = document.getElementById("groomButton");
  const brideButton = document.getElementById("brideButton");
 
  showStartMessage("Choose your team first!", "error");
 
  if (groomButton) groomButton.classList.add("needs-selection");
  if (brideButton) brideButton.classList.add("needs-selection");
 
  setTimeout(() => {
    if (groomButton) groomButton.classList.remove("needs-selection");
    if (brideButton) brideButton.classList.remove("needs-selection");
  }, 650);
}
 
function requestNameEntry() {
  const input = document.getElementById("playerName");
 
  showStartMessage("Enter your name to begin.", "error");
 
  if (!input) return;
 
  input.classList.add("needs-input");
  input.focus();
 
  setTimeout(() => {
    input.classList.remove("needs-input");
  }, 650);
}
 
function startGame() {
  const nameInput = document.getElementById("playerName");
  playerName = nameInput ? nameInput.value.trim() : "";
 
  if (selectedSide === "") {
    requestSideSelection();
    return;
  }
 
  if (playerName === "") {
    requestNameEntry();
    return;
  }
 
  setPlayerCollisionSize();
  placePlayerAtStart();
 
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
 
  const icon = selectedSide === "groom" ? "🤵" : "👰";
  document.getElementById("welcomeText").innerText = playerName + " " + icon;
 
  if (!gameLoopStarted) {
    gameLoopStarted = true;
    gameLoop();
  }
}
 
/* =========================================================
   6. KEYBOARD INPUT
   ========================================================= */
 
document.addEventListener("keydown", function(event) {
  keys[event.key] = true;
 
  const jumpPressed = event.code === "Space" || event.key === "ArrowUp";
 
  if (jumpPressed && !player.jumping && !gamePaused) {
    player.velocityY = -14;
    player.jumping = true;
  }
});
 
document.addEventListener("keyup", function(event) {
  keys[event.key] = false;
});
 
/* =========================================================
   7. GAME LOOP + PLAYER UPDATE
   ========================================================= */
 
function gameLoop() {
  updatePlayer();
  drawGame();
  requestAnimationFrame(gameLoop);
}
 
function updatePlayer() {
  if (gamePaused) {
    updatePipeScene();
    return;
  }
 
  movePlayerHorizontally();
  blockPipeIfGuardAlive();
  applyGravity();
  handlePlatformLanding();
  handleQuestionBlockHit();
  handleSecretBlockHit();
  updateTimers();
  updateFloatingRewards();
  updateCamera();
  collectCoins();
  collectDiamond();
  updateEnemies();
  checkPipeTrigger();
}
 
function movePlayerHorizontally() {
  if (keys["ArrowRight"]) player.x += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
 
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > LEVEL_WIDTH) {
    player.x = LEVEL_WIDTH - player.width;
  }
}
 
function applyGravity() {
  player.velocityY += 0.7;
  player.y += player.velocityY;
 
  if (player.y + player.height >= GROUND_Y) {
    player.y = GROUND_Y - player.height;
    player.velocityY = 0;
    player.jumping = false;
  }
}
 
function updateTimers() {
  if (sparkleMessageTimer > 0) sparkleMessageTimer--;
  if (powerUpTimer > 0) powerUpTimer--;
}
 
function updateCamera() {
  const c = canvas();
  cameraX = player.x - c.width / 2 + player.width / 2;
 
  if (cameraX < 0) cameraX = 0;
  if (cameraX > LEVEL_WIDTH - c.width) cameraX = LEVEL_WIDTH - c.width;
}
 
/* =========================================================
   8. COLLISIONS: PIPE, PLATFORMS, BLOCKS
   ========================================================= */
 
function blockPipeIfGuardAlive() {
  const pipeGuard = enemies.find(enemy => enemy.id === "pipeGuard");
 
  if (pipeGuard && pipeGuard.alive) {
    const invisibleWallX = pipe.x - 4;
 
    if (player.x + player.width > invisibleWallX) {
      player.x = invisibleWallX - player.width;
    }
  }
}
 
function isLandingOnRect(rect) {
  const isFalling = player.velocityY >= 0;
  const playerBottom = player.y + player.height;
  const previousBottom = playerBottom - player.velocityY;
 
  return (
    player.x < rect.x + rect.width &&
    player.x + player.width > rect.x &&
    playerBottom >= rect.y &&
    previousBottom <= rect.y &&
    isFalling
  );
}
 
function landOn(rect) {
  player.y = rect.y - player.height;
  player.velocityY = 0;
  player.jumping = false;
}
 
function handlePlatformLanding() {
  platforms.forEach(platform => {
    if (isLandingOnRect(platform)) landOn(platform);
  });
 
  questionBlocks.forEach(block => {
    if (isLandingOnRect(block)) landOn(block);
  });
 
  secretBlocks.forEach(block => {
    if (block.discovered && isLandingOnRect(block)) landOn(block);
  });
}
 
function didHitBlockFromBelow(block) {
  const playerTop = player.y;
  const previousTop = playerTop - player.velocityY;
 
  return (
    player.x < block.x + block.width &&
    player.x + player.width > block.x &&
    playerTop <= block.y + block.height &&
    previousTop >= block.y + block.height &&
    player.velocityY < 0
  );
}
 
function handleQuestionBlockHit() {
  questionBlocks.forEach(block => {
    if (block.used || !didHitBlockFromBelow(block)) return;
 
    block.used = true;
    player.velocityY = 3;
    score += 50;
    updateScore();
 
    addFloatingReward(block.x + block.width / 2, block.y, "coin", 10);
  });
}
 
function handleSecretBlockHit() {
  secretBlocks.forEach(block => {
    if (block.used || !didHitBlockFromBelow(block)) return;
 
    block.discovered = true;
    block.used = true;
    player.velocityY = 3;
    score += block.reward;
    updateScore();
 
    addFloatingReward(block.x + block.width / 2, block.y, "bonus", block.reward);
  });
}
 
/* =========================================================
   9. COLLECTIBLES + REWARDS
   ========================================================= */
 
function addFloatingReward(x, y, type, points) {
  floatingRewards.push({
    x,
    y,
    startY: y,
    timer: 0,
    type,
    points
  });
}
 
function updateFloatingRewards() {
  floatingRewards.forEach(reward => {
    reward.timer++;
    reward.y = reward.startY - Math.sin(Math.min(reward.timer / 35, 1) * Math.PI) * 45;
  });
 
  floatingRewards = floatingRewards.filter(reward => reward.timer < 60);
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
 
  if (!collision) return;
 
  diamond.collected = true;
  diamondOwner = "player";
  isPoweredUp = true;
  powerUpTimer = 45;
  score += 250;
  updateScore();
 
  sparkleMessageTimer = 160;
  diamondMessage = "Aha! Now We're Ready.";
}
 
/* =========================================================
   10. ENEMIES + LIVES
   ========================================================= */
 
function updateEnemies() {
  enemies.forEach(enemy => {
    if (!enemy.alive) return;
 
    moveEnemy(enemy);
    handleEnemyCollision(enemy);
  });
}
 
function moveEnemy(enemy) {
  enemy.x += enemy.speed * enemy.direction;
 
  if (enemy.x < enemy.minX) enemy.direction = 1;
  if (enemy.x > enemy.maxX) enemy.direction = -1;
}
 
function handleEnemyCollision(enemy) {
  const playerBottom = player.y + player.height;
 
  const collision =
    player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    playerBottom > enemy.y;
 
  if (!collision) return;
 
  const stomp = player.velocityY > 0 && playerBottom < enemy.y + 20;
 
  if (stomp) {
    stompEnemy(enemy);
  } else {
    loseLife();
  }
}
 
function stompEnemy(enemy) {
  enemy.hitsRemaining--;
  player.velocityY = -9;
 
  if (enemy.hitsRemaining <= 0) {
    enemy.alive = false;
    score += enemy.id === "pipeGuard" ? 250 : 100;
  } else {
    score += 75;
    enemy.direction *= -1;
  }
 
  updateScore();
}
 
function loseLife() {
  lives--;
  updateLives();
 
  if (lives <= 0) {
    alert("Game Over! Restarting.");
    location.reload();
    return;
  }
 
  placePlayerAtStart();
}
 
/* =========================================================
   11. PIPE SCENES + EVENT 1
   ========================================================= */
 
function checkPipeTrigger() {
  if (event1Shown || pipeSceneActive) return;
  if (!isPipeUnlocked()) return;
 
  const touchingPipe =
    player.x + player.width > pipe.x + 5 &&
    player.x < pipe.x + pipe.width - 5 &&
    player.y + player.height >= pipe.y;
 
  if (!touchingPipe) return;
 
  gamePaused = true;
  pipeSceneActive = true;
  pipeSceneTimer = 0;
  player.x = pipe.x - player.width - 10;
  player.y = pipe.y - player.height;
 
  pipeSceneStage = diamondOwner === "player" ? "pop" : "missingPop";
}
 
function updatePipeScene() {
  if (!pipeSceneActive) return;
 
  pipeSceneTimer++;
 
  if (updateMissingDiamondScene()) return;
  updateEvent1Scene();
}
 
function updateMissingDiamondScene() {
  if (pipeSceneStage === "missingPop" && pipeSceneTimer > 28) {
    pipeSceneStage = "missingMessage";
    pipeSceneTimer = 0;
    return true;
  }
 
  if (pipeSceneStage === "missingMessage" && pipeSceneTimer > 90) {
    pipeSceneStage = "missingDown";
    pipeSceneTimer = 0;
    return true;
  }
 
  if (pipeSceneStage === "missingDown" && pipeSceneTimer > 28) {
    pipeSceneActive = false;
    gamePaused = false;
    pipeSceneStage = "";
    pipeSceneTimer = 0;
 
    player.x = pipe.x - player.width - 90;
    player.y = GROUND_Y - player.height;
    return true;
  }
 
  return pipeSceneStage === "missingPop" ||
         pipeSceneStage === "missingMessage" ||
         pipeSceneStage === "missingDown";
}
 
function updateEvent1Scene() {
  if (pipeSceneStage === "pop" && pipeSceneTimer > 70) {
    pipeSceneStage = "handoff";
    pipeSceneTimer = 0;
    return;
  }
 
  if (pipeSceneStage === "handoff" && pipeSceneTimer > 70) {
    diamondOwner = "partner";
    pipeSceneStage = "twirl";
    pipeSceneTimer = 0;
    return;
  }
 
  if (pipeSceneStage === "twirl" && pipeSceneTimer > 180) {
    finishEvent1Scene();
  }
}
 
function finishEvent1Scene() {
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
 
function closeEvent() {
  document.getElementById("eventOverlay").classList.add("hidden");
  gamePaused = false;
  player.x = pipe.x + pipe.width + 30;
  player.y = GROUND_Y - player.height;
}
 
/* =========================================================
   12. HUD UPDATES
   ========================================================= */
 
function updateScore() {
  document.getElementById("score").innerText = score;
}
 
function updateLives() {
  document.getElementById("lives").innerText = "❤️".repeat(lives);
}
 
/* =========================================================
   13. MAIN DRAWING FLOW
   ========================================================= */
 
function drawGame() {
  const c = canvas();
  const context = ctx();
 
  context.clearRect(0, 0, c.width, c.height);
  drawBackground();
  drawLevel();
  drawGameObjects();
  drawPipeLayer();
  drawPipeLockMessage();
  drawSparkleMessage();
}
 
function drawBackground() {
  const c = canvas();
  const context = ctx();
 
  context.fillStyle = "#79c9ff";
  context.fillRect(0, 0, c.width, c.height);
 
  drawCloud(120, 80);
  drawCloud(500, 90);
  drawCloud(760, 70);
  drawCloud(1100, 85);
  drawCloud(1500, 75);
  drawCloud(1950, 95);
}
 
function drawLevel() {
  const context = ctx();
 
  context.fillStyle = "#8b5a2b";
  context.fillRect(-cameraX, GROUND_Y, LEVEL_WIDTH, 80);
 
  context.fillStyle = "#3cb043";
  context.fillRect(-cameraX, GROUND_Y, LEVEL_WIDTH, 15);
 
  for (let x = 0; x < LEVEL_WIDTH; x += 40) {
    drawSquareBlock(x, GROUND_Y, "#8b5a2b");
    drawSquareBlock(x, GROUND_Y + 40, "#8b5a2b");
  }
 
  drawPlatforms();
  drawQuestionBlocks();
  drawSecretBlocks();
}
 
function drawGameObjects() {
  drawFloatingRewards();
  drawCoins();
  drawDiamondInLevel();
  drawEnemies();
}
 
function drawPipeLayer() {
  const missingScene =
    pipeSceneStage === "missingPop" ||
    pipeSceneStage === "missingMessage" ||
    pipeSceneStage === "missingDown";
 
  if (pipeSceneActive && (pipeSceneStage === "pop" || missingScene)) {
    drawPartnerPopBehindPipe();
    drawPipe();
 
    if (missingScene) drawPlayer();
    if (diamondOwner === "player") drawDiamondFollowingPlayer();
    if (pipeSceneStage === "missingMessage") drawMissingDiamondMessage();
 
    return;
  }
 
  drawPipe();
 
  if (pipeSceneActive) {
    drawPipeScene();
  } else {
    drawPlayer();
    drawDiamondFollowingPlayer();
  }
}
 
/* =========================================================
   14. WORLD DRAWING HELPERS
   ========================================================= */
 
function drawSquareBlock(x, y, color) {
  const context = ctx();
 
  context.fillStyle = color;
  context.fillRect(x - cameraX, y, 40, 40);
 
  context.strokeStyle = "#6b3f1d";
  context.strokeRect(x - cameraX, y, 40, 40);
 
  context.fillStyle = "rgba(255,255,255,0.12)";
  context.fillRect(x - cameraX + 4, y + 4, 10, 10);
}
 
function drawPlatforms() {
  platforms.forEach(platform => {
    for (let x = 0; x < platform.width; x += 40) {
      drawSquareBlock(platform.x + x, platform.y, "#b5651d");
    }
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
 
function drawSecretBlocks() {
  secretBlocks.forEach(block => {
    if (block.discovered) drawSquareBlock(block.x, block.y, "#d6a040");
  });
}
 
function drawCloud(x, y) {
  const context = ctx();
  const cloudX = x - cameraX * 0.3;
 
  context.fillStyle = "white";
  context.beginPath();
  context.arc(cloudX, y, 22, 0, Math.PI * 2);
  context.arc(cloudX + 25, y - 10, 25, 0, Math.PI * 2);
  context.arc(cloudX + 55, y, 22, 0, Math.PI * 2);
  context.fill();
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
 
/* =========================================================
   15. OBJECT DRAWING
   ========================================================= */
 
function drawFloatingRewards() {
  const context = ctx();
 
  floatingRewards.forEach(reward => {
    if (reward.type === "bonus") {
      context.fillStyle = "#fff7b2";
      context.font = "18px Arial";
      context.fillText("+" + reward.points, reward.x - cameraX - 12, reward.y);
    } else {
      drawCoinShape(reward.x - cameraX, reward.y, 11);
    }
  });
}
 
function drawCoins() {
  coins.forEach(coin => {
    if (!coin.collected) drawCoinShape(coin.x - cameraX, coin.y, coin.radius);
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
 
  const t = Date.now() / 220;
  const scale = 1 + Math.sin(t) * 0.25;
 
  drawRotatingDiamond(
    diamond.x - cameraX + 12,
    diamond.y + 12,
    16 * scale
  );
 
  for (let i = 0; i < 4; i++) {
    const sparkleAngle = t + i * Math.PI / 2;
    const sx = diamond.x - cameraX + 12 + Math.cos(sparkleAngle) * 28;
    const sy = diamond.y + 12 + Math.sin(sparkleAngle) * 28;
 
    ctx().fillStyle = "#ffffff";
    ctx().fillRect(sx, sy, 3, 3);
  }
}
 
function drawDiamondFollowingPlayer() {
  if (diamondOwner !== "player") return;
 
  const t = Date.now() / 220;
  const scale = 1 + Math.sin(t) * 0.12;
  const x = player.x - cameraX + player.width / 2;
  const y = player.y - 18;
 
  drawRotatingDiamond(x, y, 13 * scale);
  drawBlinkGlow(player.x - cameraX + player.width / 2, player.y + player.height / 2);
}
 
function drawRotatingDiamond(centerX, centerY, size) {
  const context = ctx();
 
  context.save();
  context.translate(centerX, centerY);
  context.scale(1 + Math.sin(Date.now() / 180) * 0.12, 1 + Math.sin(Date.now() / 180) * 0.12);
  context.font = `${size * 2}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("💎", 0, 0);
  context.restore();
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
 
      context.fillStyle = "#fff7b2";
      context.font = "12px Arial";
      context.fillText(enemy.hitsRemaining + "x", enemy.x - cameraX + 10, enemy.y - 12);
    }
  });
}
 
/* =========================================================
   16. CHARACTER + PIPE SCENE DRAWING
   ========================================================= */
 
function drawPipeScene() {
  if (pipeSceneStage === "handoff") drawHandoffScene();
  if (pipeSceneStage === "twirl") drawTwirlScene();
}
 
function drawPartnerPopBehindPipe() {
  const context = ctx();
  const partnerType = getPartnerType();
  const partnerName = getCharacterName(partnerType);
  const size = getCharacterDrawSize(partnerType, true);
 
  let progress = Math.min(pipeSceneTimer / 28, 1);
 
  if (pipeSceneStage === "missingMessage") progress = 1;
  if (pipeSceneStage === "missingDown") progress = 1 - Math.min(pipeSceneTimer / 28, 1);
 
  const baseW = PLAYER_BASE.width;
  const baseH = PLAYER_BASE.height;
  const startY = pipe.y + 25;
  const endY = pipe.y - baseH + 5;
  const collisionX = pipe.x + pipe.width / 2 - baseW / 2;
  const collisionY = startY + (endY - startY) * progress;
  const partnerX = collisionX - cameraX + baseW / 2 - size.width / 2;
  const partnerY = collisionY + baseH - size.height;
 
  drawCharacter(
    partnerX,
    partnerY,
    size.width,
    size.height,
    getCharacterColor(partnerType),
    partnerType
  );
 
  if (progress > 0.75) {
    context.fillStyle = "rgba(0, 0, 0, 0.55)";
    context.fillRect(partnerX - 10, partnerY - 30, size.width + 20, 24);
 
    context.fillStyle = "#fff7b2";
    context.font = "16px Arial";
    context.fillText(partnerName, partnerX + 8, partnerY - 13);
  }
}
 
function drawHandoffScene() {
  const playerType = getPlayerType();
  const partnerType = getPartnerType();
  const playerSize = getCharacterDrawSize(playerType, true);
  const partnerSize = getCharacterDrawSize(partnerType, true);
 
  const playerCollisionX = pipe.x - player.width - 10;
  const playerCollisionY = pipe.y - player.height;
  const partnerCollisionX = pipe.x + pipe.width / 2 - PLAYER_BASE.width / 2;
  const partnerCollisionY = pipe.y - PLAYER_BASE.height;
 
  const playerDrawX = playerCollisionX - cameraX + player.width / 2 - playerSize.width / 2;
  const playerDrawY = playerCollisionY + player.height - playerSize.height;
  const partnerDrawX = partnerCollisionX - cameraX + PLAYER_BASE.width / 2 - partnerSize.width / 2;
  const partnerDrawY = partnerCollisionY + PLAYER_BASE.height - partnerSize.height;
 
  drawCharacter(playerDrawX, playerDrawY, playerSize.width, playerSize.height, getCharacterColor(playerType), playerType);
  drawCharacter(partnerDrawX, partnerDrawY, partnerSize.width, partnerSize.height, getCharacterColor(partnerType), partnerType);
 
  const progress = Math.min(pipeSceneTimer / 70, 1);
  const startX = playerDrawX + playerSize.width / 2;
  const startY = playerDrawY - 18;
  const endX = partnerDrawX + partnerSize.width / 2;
  const endY = partnerDrawY - 18;
 
  drawRotatingDiamond(
    startX + (endX - startX) * progress,
    startY + (endY - startY) * progress,
    13
  );
}
 
function drawTwirlScene() {
  const context = ctx();
  const centerX = pipe.x + pipe.width / 2 - cameraX;
  const baseY = pipe.y - 8;
  const t = pipeSceneTimer;
  const sway = Math.sin(t * 0.06) * 10;
  const bounce = Math.abs(Math.sin(t * 0.06)) * 5;
 
  const playerType = getPlayerType();
  const partnerType = getPartnerType();
  const playerSize = getCharacterDrawSize(playerType, true);
  const partnerSize = getCharacterDrawSize(partnerType, true);
 
  drawCharacter(centerX - playerSize.width - 4 + sway, baseY - playerSize.height + bounce, playerSize.width, playerSize.height, getCharacterColor(playerType), playerType);
  drawCharacter(centerX + 4 - sway, baseY - partnerSize.height + bounce, partnerSize.width, partnerSize.height, getCharacterColor(partnerType), partnerType);
 
  drawRotatingDiamond(centerX, baseY - 82 + Math.sin(t * 0.04) * 5, 13);
  drawBlinkGlow(centerX, baseY - 35);
 
  for (let i = 0; i < 6; i++) {
    context.fillStyle = i % 2 === 0 ? "#fff7b2" : "#b9f2ff";
    context.fillRect(centerX - 45 + i * 18, baseY - 72 + Math.sin(t * 0.06 + i) * 8, 4, 4);
  }
 
  context.fillStyle = "rgba(0, 0, 0, 0.55)";
  context.fillRect(300, 35, 360, 45);
 
  context.fillStyle = "#fff7b2";
  context.font = "20px Arial";
  context.fillText("We're Ringing in the Wedding Bells...", 320, 65);
}
 
function drawPlayer() {
  const characterType = getPlayerType();
  const size = getCharacterDrawSize(characterType, isPoweredUp || event1Shown);
  const drawX = player.x - cameraX + player.width / 2 - size.width / 2;
  const drawY = player.y + player.height - size.height;
 
  drawCharacter(drawX, drawY, size.width, size.height, getCharacterColor(characterType), characterType);
 
  if (event1Shown) {
    drawConstantGlow(player.x - cameraX + player.width / 2, player.y + player.height / 2);
  }
}
 
function drawCharacter(x, y, width, height, bodyColor, characterType = null) {
  const context = ctx();
  let sprite = null;
 
  if (characterType === "groom") sprite = groomSprite;
  if (characterType === "bride") sprite = brideSprite;
 
  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    context.drawImage(sprite, 0, 0, 128, 128, x, y, width, height);
    return;
  }
 
  context.fillStyle = bodyColor;
  context.fillRect(x, y, width, height);
 
  context.fillStyle = "#ffd6a5";
  context.fillRect(x + width * 0.2, y + 5, width * 0.6, height * 0.32);
}
 
/* =========================================================
   17. GAME MESSAGES + GLOWS
   ========================================================= */
 
function drawPipeLockMessage() {
  if (isPipeUnlocked() || pipeSceneActive || event1Shown) return;
 
  const distanceToPipe = Math.abs((player.x + player.width) - pipe.x);
  if (distanceToPipe >= 160) return;
 
  const context = ctx();
 
  context.fillStyle = "rgba(0, 0, 0, 0.55)";
  context.fillRect(245, 35, 560, 70);
 
  context.fillStyle = "#fff7b2";
  context.font = "20px Arial";
 
  const message = selectedSide === "groom"
    ? "Defeat that stupid bridesmaid to find Jane!"
    : "Defeat that stupid groomsman to find John!";
 
  context.fillText(message, 250, 72);
}
 
function drawMissingDiamondMessage() {
  const context = ctx();
 
  context.fillStyle = "rgba(0,0,0,0.65)";
  context.fillRect(260, 35, 390, 75);
 
  context.fillStyle = "#fff7b2";
  context.font = "24px Arial";
  context.fillText("Love Found...", 300, 65);
  context.fillText("Diamond Missing...", 300, 95);
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
  context.fillText(diamondMessage, 300, 68);
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
