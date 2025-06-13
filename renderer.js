function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  state.beams = state.beams.filter((b) => {
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.width;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    b.points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    b.frames--;
    return b.frames > 0;
  });

  ctx.fillStyle = "#444";
  ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

  if (mageImg.complete) {
    ctx.drawImage(mageImg, player.x - 40, player.y - 40, 80, 80);
  } else {
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  state.enemies.forEach((e) => {
    let img;
    if (e.type === "tanker") img = orcFrames[state.orcFrame];
    else if (e.type === "voador") img = batImg;
    else if (e.type === "troll") img = trollImg;
    else img = goblinFrames[state.goblinFrame];
    if (img.complete) {
      ctx.drawImage(img, e.x, e.y, e.size, e.size);
    } else {
      if (e.type === "tanker") ctx.fillStyle = "brown";
      else if (e.type === "voador") ctx.fillStyle = "yellow";
      else if (e.type === "troll") ctx.fillStyle = "darkgreen";
      else ctx.fillStyle = "green";
      ctx.fillRect(e.x, e.y, e.size, e.size);
    }
    if (e.flash && e.flash > 0 && state.timeFrames % 2 === 0) {
      ctx.fillStyle = "rgba(255,0,0,0.4)";
      ctx.fillRect(e.x, e.y, e.size, e.size);
      e.flash--;
    }
    const hpPct = Math.max(0, e.hp) / e.maxHp;
    ctx.fillStyle = "red";
    ctx.fillRect(e.x, e.y - 6, e.size, 4);
    ctx.fillStyle = "lime";
    ctx.fillRect(e.x, e.y - 6, e.size * hpPct, 4);
    if (e.burn > 0 && state.timeFrames % 20 < 10) {
      ctx.fillStyle = "rgba(255,100,0,0.5)";
      ctx.fillRect(e.x, e.y, e.size, e.size);
    }
  });

  state.bullets.forEach((b) => {
    if (magiaImg.complete) {
      ctx.drawImage(magiaImg, b.x - 10, b.y - 10, 20, 20);
    } else {
      ctx.fillStyle = b.color || "white";
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  state.barriers.forEach((b) => {
    if (b.image && b.image.complete) {
      ctx.drawImage(b.image, b.x, b.y, b.width, b.height);
    } else {
      ctx.fillStyle = "blue";
      ctx.fillRect(b.x, b.y, b.width, b.height);
    }
  });

  ctx.fillStyle = "orange";
  state.turrets.forEach((t) => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
    ctx.fill();
    if (state.crosshair) {
      ctx.strokeStyle = "rgba(0,255,255,0.3)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(state.crosshair.x, state.crosshair.y);
      ctx.stroke();
    }
  });

  if (state.crosshair) {
    ctx.drawImage(
      crosshairImg,
      state.crosshair.x - state.crosshair.radius,
      state.crosshair.y - state.crosshair.radius,
      state.crosshair.radius * 2,
      state.crosshair.radius * 2
    );
  }
}

if (typeof module !== "undefined") {
  module.exports = { drawGame };
} else {
  window.drawGame = drawGame;
}
