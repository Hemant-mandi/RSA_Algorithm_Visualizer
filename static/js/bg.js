(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CHARS = '01アイウエオカキクケコABCDEF0123456789!@#$%^&*';
  const FONT_SIZE = 14;
  const COLUMNS_ARRAY = [];
  let columns = 0;
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / FONT_SIZE);
    COLUMNS_ARRAY.length = 0;
    for (let i = 0; i < columns; i++) {
      COLUMNS_ARRAY[i] = Math.random() * -canvas.height;
    }
  }

  function draw() {
    ctx.fillStyle = 'rgba(2,11,20,0.07)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = FONT_SIZE + 'px "Share Tech Mono", monospace';

    for (let i = 0; i < COLUMNS_ARRAY.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * FONT_SIZE;
      const y = COLUMNS_ARRAY[i];

      ctx.fillStyle = '#00ff9d';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ff9d';
      ctx.fillText(char, x, y);

      ctx.fillStyle = 'rgba(0,180,255,0.4)';
      ctx.shadowBlur = 0;
      ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - FONT_SIZE);

      if (y > canvas.height && Math.random() > 0.975) {
        COLUMNS_ARRAY[i] = 0;
      }
      COLUMNS_ARRAY[i] += FONT_SIZE;
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    draw();
  });

  resize();
  draw();
})();
