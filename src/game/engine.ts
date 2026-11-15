import {
  WIDTH, HEIGHT, GROUND_Y, DINO_X, DINO_W, DINO_H,
  GRAVITY, JUMP_VELOCITY, START_SPEED, MAX_SPEED, ACCELERATION,
} from "./constants";

const COLOR = "#535353";    
const DINO_COLOR = "#22c55e";  
const CLOUD_COLOR = "#7dd3fc";  
const CACTUS_COLOR = "#166534"; 
const PX = 2; // dino pikseli o'lchami (22x24 piksel -> 44x48)

// Dino tanasi
const BODY = [
  "...........###########",
  "..........############",
  "..........##.#########",
  "..........############",
  "..........############",
  "..........############",
  "..........########....",
  "..........#######.....",
  "#.........#######.....",
  "#........########.....",
  "#.......#########.#...",
  "##......#########.##..",
  "###....##########.....",
  "####..###########.....",
  "#####.###########.....",
  ".#################....",
  "..################....",
  "...###############....",
  "....##############....",
  ".....############.....",
  "......##########......",
];

// Oyoqlar (3 xil holat)
const LEGS_STAND = [
  "......####..####......",
  "......####..####......",
  "......###...###.......",
];
const LEGS_A = [
  "......####..####......",
  "......####...##.......",
  "......#####...........",
];
const LEGS_B = [
  "......####..####......",
  "......##...####.......",
  "........#####.........",
];

type Cactus = { x: number; unitW: number; count: number; w: number; h: number };
type Cloud = { x: number; y: number };
type Bump = { x: number; y: number; w: number };

function drawPixels(
  ctx: CanvasRenderingContext2D,
  rows: string[],
  x: number,
  y: number,
  s: number
) {
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c] === "#") ctx.fillRect(x + c * s, y + r * s, s, s);
    }
  }
}

function drawCactus(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number,
  h: number
) {
  const y = GROUND_Y - h;
  const tw = w > 20 ? 10 : 8; // tana qalinligi
  const tx = x + (w - tw) / 2;
  const arm = 4;

  // tana
  ctx.fillRect(tx, y, tw, h);
  ctx.fillRect(tx + 2, y - 2, tw - 4, 2);

  // chap qo'l
  ctx.fillRect(x, y + h * 0.3, arm, h * 0.3);
  ctx.fillRect(x, y + h * 0.56, tx - x + 2, arm);
  ctx.fillRect(x, y + h * 0.3 - 2, arm, 2);

  // o'ng qo'l
  const rx = x + w - arm;
  ctx.fillRect(rx, y + h * 0.18, arm, h * 0.3);
  ctx.fillRect(tx + tw - 2, y + h * 0.44, rx - (tx + tw) + 6, arm);
  ctx.fillRect(rx, y + h * 0.18 - 2, arm, 2);
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillRect(x + 8, y, 28, 4);
  ctx.fillRect(x + 4, y + 4, 38, 4);
  ctx.fillRect(x, y + 8, 46, 4);
}

export class DinoEngine {
  dinoY = GROUND_Y - DINO_H;
  vy = 0;
  onGround = true;
  cacti: Cactus[] = [];
  clouds: Cloud[] = [];
  bumps: Bump[] = [];
  speed = START_SPEED;
  score = 0;
  highScore = 0;
  started = false;
  gameOver = false;
  private distToNext = 300;
  private tick = 0;
  private nextCloudIn = 120;

  constructor() {
    // boshlang'ich do'ngliklar va bulutlar
    for (let x = 0; x < WIDTH; x += 40 + Math.random() * 120) {
      this.bumps.push({ x, y: 6 + Math.floor(Math.random() * 3) * 4, w: 2 + Math.floor(Math.random() * 3) * 2 });
    }
    this.clouds.push({ x: 200, y: 40 }, { x: 480, y: 65 });
  }

  jump() {
    this.started = true;
    if (this.onGround && !this.gameOver) {
      this.vy = JUMP_VELOCITY;
      this.onGround = false;
    }
  }

  reset() {
    this.dinoY = GROUND_Y - DINO_H;
    this.vy = 0;
    this.onGround = true;
    this.cacti = [];
    this.speed = START_SPEED;
    this.score = 0;
    this.gameOver = false;
    this.started = true;
    this.distToNext = 300;
  }

  // dt = 60 FPS dagi kadrlar soni (1 = bitta kadr)
  update(dt: number) {
    if (!this.started || this.gameOver) return;

    this.tick += dt;

    // Dino harakati
    this.vy += GRAVITY * dt;
    this.dinoY += this.vy * dt;
    if (this.dinoY >= GROUND_Y - DINO_H) {
      this.dinoY = GROUND_Y - DINO_H;
      this.vy = 0;
      this.onGround = true;
    }

    // Tezlik va ball
    this.speed = Math.min(MAX_SPEED, this.speed + ACCELERATION * dt);
    this.score += this.speed * dt * 0.05;

    // Kaktuslar
    for (const c of this.cacti) c.x -= this.speed * dt;
    this.cacti = this.cacti.filter((c) => c.x + c.w > 0);

    this.distToNext -= this.speed * dt;
    if (this.distToNext <= 0) {
      const large = Math.random() < 0.5;
      const unitW = large ? 25 : 17;
      const h = large ? 50 : 35;
      const r = Math.random();
      const count = r < 0.6 ? 1 : r < 0.85 ? 2 : 3;
      const w = unitW * count + (count - 1) * 4;
      this.cacti.push({ x: WIDTH, unitW, count, w, h });
      this.distToNext = 280 + Math.random() * 300;
    }

    // Yer do'ngliklari
    for (const b of this.bumps) b.x -= this.speed * dt;
    this.bumps = this.bumps.filter((b) => b.x + b.w > 0);
    const lastBump = this.bumps[this.bumps.length - 1];
    if (!lastBump || lastBump.x < WIDTH - 40 - Math.random() * 100) {
      this.bumps.push({
        x: WIDTH + Math.random() * 20,
        y: 6 + Math.floor(Math.random() * 3) * 4,
        w: 2 + Math.floor(Math.random() * 3) * 2,
      });
    }

    // Bulutlar (sekinroq suzadi)
    for (const c of this.clouds) c.x -= this.speed * 0.25 * dt;
    this.clouds = this.clouds.filter((c) => c.x + 46 > 0);
    this.nextCloudIn -= dt;
    if (this.nextCloudIn <= 0) {
      this.clouds.push({ x: WIDTH, y: 25 + Math.random() * 50 });
      this.nextCloudIn = 150 + Math.random() * 250;
    }

    // To'qnashuv
    const pad = 6;
    const dx1 = DINO_X + pad;
    const dx2 = DINO_X + DINO_W - pad;
    const dy2 = this.dinoY + DINO_H;
    for (const c of this.cacti) {
      const cx1 = c.x + 3;
      const cx2 = c.x + c.w - 3;
      const cy1 = GROUND_Y - c.h;
      if (dx2 > cx1 && dx1 < cx2 && dy2 > cy1) {
        this.gameOver = true;
        this.highScore = Math.max(this.highScore, Math.floor(this.score));
        break;
      }
    }
  }

    draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Bulutlar
    ctx.fillStyle = CLOUD_COLOR;
    for (const c of this.clouds) drawCloud(ctx, c.x, c.y);

    // Yer chizig'i va do'ngliklar
    ctx.fillStyle = COLOR;
    ctx.fillRect(0, GROUND_Y, WIDTH, 2);
    for (const b of this.bumps) ctx.fillRect(b.x, GROUND_Y + b.y, b.w, 2);

    // Kaktuslar
    ctx.fillStyle = CACTUS_COLOR;
    for (const c of this.cacti) {
      for (let i = 0; i < c.count; i++) {
        drawCactus(ctx, c.x + i * (c.unitW + 4), c.unitW, c.h);
      }
    }

    // Dino
    ctx.fillStyle = DINO_COLOR;
    let legs = LEGS_STAND;
    if (this.started && !this.gameOver && this.onGround) {
      legs = Math.floor(this.tick / 6) % 2 === 0 ? LEGS_A : LEGS_B;
    }
    const dy = Math.round(this.dinoY);
    drawPixels(ctx, [...BODY, ...legs], DINO_X, dy, PX);

    // Ball
    ctx.fillStyle = COLOR;
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.textAlign = "right";
    const hi = String(this.highScore).padStart(5, "0");
    const sc = String(Math.floor(this.score)).padStart(5, "0");
    ctx.fillText(`HI ${hi} ${sc}`, WIDTH, 28);

    // Game over
    if (this.gameOver) {
      ctx.textAlign = "center";
      ctx.font = "bold 18px 'Courier New', monospace";
      ctx.fillText("G A M E   O V E R", WIDTH / 2, 70);

      // qayta boshlash belgisi
      const cx = WIDTH / 2;
      const cy = 102;
      ctx.strokeStyle = COLOR;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 13, -0.4 * Math.PI, 1.5 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy - 21);
      ctx.lineTo(cx + 3, cy - 7);
      ctx.lineTo(cx + 15, cy - 14);
      ctx.closePath();
      ctx.fill();
    }
  }
}