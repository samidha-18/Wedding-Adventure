let selectedSide = "";

function selectSide(side) {
  selectedSide = side;

  alert(side === "groom" ? "Groom Side selected 🤵" : "Bride Side selected 👰");
}

function startGame() {
  const playerName = document.getElementById("playerName").value;

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

  document.getElementById("welcomeText").innerText =
    "Welcome " + playerName + " " + icon;
}
