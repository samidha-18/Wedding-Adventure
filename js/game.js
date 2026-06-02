let selectedSide = "";
let playerName = "";
let score = 0;

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

const platforms = [
  { x: 250, y: 340, width: 150, height: 25 },
  { x: 500, y: 280, width: 150, height: 25 },
  { x: 750, y: 220, width: 150, height: 25 }
];

let coins = [
  { x: 280, y: 295, radius: 12, collected: false },
  { x: 340, y: 295, radius: 12, collected: false },
  { x: 530, y: 235, radius: 12, collected: false },
  { x: 590, y: 235, radius: 12, collected: false },
  { x: 790, y: 175, radius: 12, collected: false }
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

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";

  const icon = selectedSide === "groom" ? "🤵" : "👰";
  document.getElementById("welcomeText").innerText = playerName + " " + icon;

  gameLoop();
}

document.addEventListener("keydown", function(event) {
  keys[event.key] = true;

  if ((event.code === "Space" || event.key === "ArrowUp") && !player.jumping) {
    player.velocityY = -14;
    player.jumping = true;
  }
});

document.addEventListener("keyup", function(event) {
  keys[event.key] = false;
});

function updatePlayer() {
  if (keys["ArrowRight"]) {
    player.x += player.speed;
  }

  if (keys["ArrowLeft"]) {
    player.x -= player.speed;
  }

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

  collectCoins();
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
      document.getElementById("score").innerText = score;
    }
  });
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

  context.fillStyle = "#8b5a2b";
  context.fillRect(0, 420, c.width, 80);

  context.fillStyle = "#3cb043";
  context.fillRect(0, 420, c.width, 15);

  platforms.forEach(platform => {
    context.fillStyle = "#b5651d";
    context.fillRect(platform.x, platform.y, platform.width, platform.height);

    context.strokeStyle = "#6b3f1d";
    context.strokeRect(platform.x, platform.y, platform.width, platform.height);
  });

  coins.forEach(coin => {
    if (!coin.collected) {
      context.beginPath();
      context.fillStyle = "#ffd700";
      context.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "#b8860b";
      context.stroke();
    }
  });

  context.fillStyle = selectedSide === "groom" ? "#1f2a44" : "#ff8fab";
  context.fillRect(player.x, player.y, player.width, player.height);

  context.fillStyle = "#ffd6a5";
  context.fillRect(player.x + 8, player.y + 5, 24, 20);
}

function drawCloud(x, y) {
  const context = ctx();

  context.fillStyle = "white";
  context.beginPath();
  context.arc(x, y, 22, 0, Math.PI * 2);
  context.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
  context.arc(x + 55, y, 22, 0, Math.PI * 2);
  context.fill();
}

function gameLoop() {
  updatePlayer();
  drawGame();
  requestAnimationFrame(gameLoop);
}
