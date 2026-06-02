let selectedSide = "";
let playerName = "";
let score = 0;

const canvas = () => document.getElementById("gameCanvas");
const ctx = () => canvas().getContext("2d");

let player = {
  x: 80,
  y: 380,
  width: 40,
  height: 55,
  speed: 5,
  velocityY: 0,
  jumping: false
};

let keys = {};

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

  if (event.code === "Space" && !player.jumping) {
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
}

function drawGame() {
  const c = canvas();
  const context = ctx();

  context.clearRect(0, 0, c.width, c.height);

  // sky
  context.fillStyle = "#79c9ff";
  context.fillRect(0, 0, c.width, c.height);

  // ground
  context.fillStyle = "#8b5a2b";
  context.fillRect(0, 420, c.width, 80);

  context.fillStyle = "#3cb043";
  context.fillRect(0, 420, c.width, 15);

  // player
  context.fillStyle = selectedSide === "groom" ? "#1f2a44" : "#ff8fab";
  context.fillRect(player.x, player.y, player.width, player.height);

  // player face
  context.fillStyle = "#ffd6a5";
  context.fillRect(player.x + 8, player.y + 5, 24, 20);
}

function gameLoop() {
  updatePlayer();
  drawGame();
  requestAnimationFrame(gameLoop);
}
