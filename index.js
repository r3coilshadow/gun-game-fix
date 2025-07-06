<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gun Game Fix</title>
<style>
  body {
    margin: 0; background: #222; overflow: hidden;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100vh; color: white; font-family: Arial, sans-serif;
    user-select: none;
  }
  #gameCanvas {
    background: #333;
    border: 2px solid white;
    display: block;
  }
  #score {
    margin-top: 10px;
    font-size: 20px;
  }
  #instructions {
    margin-bottom: 10px;
    font-size: 14px;
    color: #ccc;
  }
</style>
</head>
<body>

<div id="instructions">
  Move: WASD or Arrow keys | Shoot: Left Mouse Click
</div>
<canvas id="gameCanvas" width="600" height="400"></canvas>
<div id="score">Score: 0</div>

<audio id="gunSound" src="https://actions.google.com/sounds/v1/impacts/gunshot_1.ogg" preload="auto"></audio>
<audio id="hitSound" src="https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg" preload="auto"></audio>

<script>
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const gunSound = document.getElementById('gunSound');
  const hitSound = document.getElementById('hitSound');

  const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 4,
    color: '#00ff00',
    dx: 0,
    dy: 0
  };

  const bullets = [];
  const enemies = [];
  let score = 0;

  const keys = {};

  document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
  });

  document.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
  });

  canvas.addEventListener('mousedown', e => {
    shootBullet(e);
  });

  function shootBullet(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    const speed = 8;

    bullets.push({
      x: player.x,
      y: player.y,
      size: 6,
      speedX: Math.cos(angle) * speed,
      speedY: Math.sin(angle) * speed,
      color: 'yellow'
    });

    gunSound.currentTime = 0;
    gunSound.play();
  }

  function spawnEnemy() {
    const size = 20;
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) {
      x = Math.random() * canvas.width;
      y = -size;
    } else if (edge === 1) {
      x = canvas.width + size;
      y = Math.random() * canvas.height;
    } else if (edge === 2) {
      x = Math.random() * canvas.width;
      y = canvas.height + size;
    } else {
      x = -size;
      y = Math.random() * canvas.height;
    }
    enemies.push({
      x,
      y,
      size,
      color: '#ff4444',
      speed: 1.5
    });
  }

  setInterval(spawnEnemy, 2000);

  function update() {
    player.dx = 0; player.dy = 0;
    if (keys['w'] || keys['arrowup']) player.dy = -player.speed;
    if (keys['s'] || keys['arrowdown']) player.dy = player.speed;
    if (keys['a'] || keys['arrowleft']) player.dx = -player.speed;
    if (keys['d'] || keys['arrowright']) player.dx = player.speed;

    player.x += player.dx;
    player.y += player.dy;

    if (player.x < player.size / 2) player.x = player.size / 2;
    if (player.x > canvas.width - player.size / 2) player.x = canvas.width - player.size / 2;
    if (player.y < player.size / 2) player.y = player.size / 2;
    if (player.y > canvas.height - player.size / 2) player.y = canvas.height - player.size / 2;

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.speedX;
      b.y += b.speedY;
      if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
        bullets.splice(i, 1);
      }
    }

    enemies.forEach(enemy => {
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      enemy.x += Math.cos(angle) * enemy.speed;
      enemy.y += Math.sin(angle) * enemy.speed;
    });

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        const dist = Math.hypot(enemy.x - b.x, enemy.y - b.y);
        if (dist < enemy.size / 2 + b.size / 2) {
          enemies.splice(i, 1);
          bullets.splice(j, 1);
          score++;
          hitSound.currentTime = 0;
          hitSound.play();
          break;
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();

    bullets.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size / 2, 0, Math.PI * 2);
      ctx.fill();
    });

    enemies.forEach(enemy => {
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function gameLoop() {
    update();
    draw();
    document.getElementById('score').textContent = 'Score: ' + score;
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
</script>

</body>
</html>
