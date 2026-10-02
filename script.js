// ==========================================
// 1. CONFIGURAÇÃO DO CANVAS E JANELA
// ==========================================
const canvas = document.getElementById('gameCanvas') || document.createElement('canvas');
if (!canvas.parentNode) {
    canvas.id = 'gameCanvas';
    document.body.appendChild(canvas);
}
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==========================================
// 2. SISTEMA DE ÁUDIO (Web Audio API)
// ==========================================
let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}
window.addEventListener('click', initAudio, { once: true });
window.addEventListener('keydown', initAudio, { once: true });

const sounds = {
    slash: () => {
        if (!audioCtx) return;
        let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    },
    hit: () => {
        if (!audioCtx) return;
        let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.08);
    },
    dash: () => {
        if (!audioCtx) return;
        let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.15);
    },
    skill: () => {
        if (!audioCtx) return;
        let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.25);
    },
    levelUp: () => {
        if (!audioCtx) return;
        let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    }
};

// ==========================================
// 3. CARREGAMENTO DO FUNDO
// ==========================================
const bgImg = new Image();
bgImg.src = 'assets/backgrounds/fundo.png';

// ==========================================
// 4. LISTA DE MELHORIAS DISPONÍVEIS
// ==========================================
const UPGRADES_POOL = [
    { id: 'dmg', name: 'Força Bruta', desc: '+20% Dano do Ataque', apply: (p) => p.damageMultiplier *= 1.20 },
    { id: 'hp', name: 'Vitalidade', desc: '+25 Vida Máxima (Cura +25)', apply: (p) => { p.maxHp += 25; p.hp = Math.min(p.maxHp, p.hp + 25); } },
    { id: 'speed', name: 'Passo Agil', desc: '+12% Velocidade de Movimento', apply: (p) => p.speed *= 1.12 },
    { id: 'crit', name: 'Oito ou Oitenta', desc: '+10% Chance de Crítico', apply: (p) => p.critChance += 0.10 },
    { id: 'atkSpeed', name: 'Reflexos', desc: '+20% Velocidade de Ataque', apply: (p) => p.attackSpeedMultiplier *= 0.82 },
    { id: 'manaRegen', name: 'Fluxo Mágico', desc: '+50% Regeneração de Mana', apply: (p) => p.manaRegenRate *= 1.50 }
];

// ==========================================
// 5. CLASSE JOGADOR (Player)
// ==========================================
class Player {
    constructor() {
        this.imgIdle = new Image(); this.imgIdle.src = 'assets/characters/player_idle.png';
        this.imgWalk = new Image(); this.imgWalk.src = 'assets/characters/player_walk.png';
        this.imgWalkBack = new Image(); this.imgWalkBack.src = 'assets/characters/player_walk_back.png';
        this.imgAttack = new Image(); this.imgAttack.src = 'assets/characters/player_attack.png';

        this.reset();
    }

    reset() {
        this.x = 0; this.y = 0;
        this.size = 50;

        // Atributos de Nível e XP
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 50;

        // Status base
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.maxMana = 60;
        this.mana = 45;
        this.manaRegenRate = 3;
        this.speed = 3.8;
        this.damageMultiplier = 1.0;
        this.critChance = 0.10;
        this.attackSpeedMultiplier = 1.0;

        // Timers e Cooldowns
        this.dashCooldown = 0;
        this.isDashing = false;
        this.dashTimer = 0;
        this.skillQCooldown = 0;
        this.attackCooldown = 0;

        this.facingAngle = 0;
        this.swordArc = null;
        this.isMoving = false;
        this.lastDirection = 'right';
        this.animTimer = 0;
    }

    addXp(amount, game) {
        this.xp += amount;
        game.addFloatingText(this.x, this.y - 30, `+${amount} XP`, '#f39c12', false);

        if (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.4);
            sounds.levelUp();
            game.openLevelUpMenu();
        }
    }

    update(keys, game) {
        if (this.hp <= 0) return;

        if (this.dashCooldown > 0) this.dashCooldown -= 1 / 60;
        if (this.skillQCooldown > 0) this.skillQCooldown -= 1 / 60;
        if (this.attackCooldown > 0) this.attackCooldown -= 1 / 60;

        // Movimentação
        let dx = 0, dy = 0;
        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;

        this.isMoving = (dx !== 0 || dy !== 0);

        // Direção em relação ao Mouse
        let dxMouse = game.mouseX - canvas.width / 2;
        let dyMouse = game.mouseY - canvas.height / 2;
        this.facingAngle = Math.atan2(dyMouse, dxMouse);

        if (dx < 0) this.lastDirection = 'left';
        else if (dx > 0) this.lastDirection = 'right';
        else if (dxMouse < 0) this.lastDirection = 'left';
        else if (dxMouse > 0) this.lastDirection = 'right';

        if (this.isMoving) {
            this.animTimer += 0.2;
            if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
        } else {
            this.animTimer = 0;
        }

        // Dash
        if ((keys['Shift'] || keys[' ']) && this.dashCooldown <= 0) {
            this.isDashing = true;
            this.dashTimer = 0.18;
            this.dashCooldown = 1.2;
            sounds.dash();
        }

        let currentSpeed = this.speed * (this.isDashing ? 2.8 : 1.0);
        if (this.isDashing) {
            this.dashTimer -= 1 / 60;
            if (this.dashTimer <= 0) this.isDashing = false;
        }

        this.x += dx * currentSpeed;
        this.y += dy * currentSpeed;

        // Habilidade Q
        if ((keys['q'] || keys['Q']) && this.skillQCooldown <= 0 && this.mana >= 15) {
            this.mana -= 15;
            this.skillQCooldown = 4.0;
            sounds.skill();
            game.triggerAreaSkill(this.x, this.y);
        }

        // Ataque com botão esquerdo do mouse
        if (game.isMouseDown && this.attackCooldown <= 0) {
            this.performSwordAttack(game);
            this.attackCooldown = 0.45 * this.attackSpeedMultiplier;
        }

        if (this.swordArc) {
            this.swordArc.timer -= 1 / 60;
            if (this.swordArc.timer <= 0) this.swordArc = null;
        }

        if (this.mana < this.maxMana) {
            this.mana = Math.min(this.maxMana, this.mana + (this.manaRegenRate) / 60);
        }
    }

    performSwordAttack(game) {
        let attackAngle = this.facingAngle;
        this.swordArc = { angle: attackAngle, timer: 0.18, radius: 65 };
        sounds.slash();

        game.enemies.forEach(e => {
            let dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.swordArc.radius + e.size) {
                let angleToEnemy = Math.atan2(e.y - this.y, e.x - this.x);
                let diff = Math.atan2(Math.sin(angleToEnemy - attackAngle), Math.cos(angleToEnemy - attackAngle));

                if (Math.abs(diff) < Math.PI / 2.3) {
                    let isCrit = Math.random() < this.critChance;
                    let dmg = (20 * this.damageMultiplier) * (isCrit ? 2.0 : 1.0);
                    e.hp -= dmg;
                    game.addFloatingText(e.x, e.y, isCrit ? `${Math.round(dmg)}!` : `${Math.round(dmg)}`, isCrit ? '#f1c40f' : '#ffffff', isCrit);
                    sounds.hit();
                }
            }
        });
    }

    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        let renderSize = this.size * 2;

        if (this.isDashing) {
            ctx.fillStyle = 'rgba(0, 225, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(sx - Math.cos(this.facingAngle) * 20, sy - Math.sin(this.facingAngle) * 20, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        let walkOffsetY = (this.isMoving && !this.swordArc) ? Math.sin(this.animTimer * 2) * 4 : 0;
        let walkRotation = (this.isMoving && !this.swordArc) ? Math.cos(this.animTimer) * 0.08 : 0;

        let currentImg = this.imgIdle;
        let needFlip = false;

        if (this.swordArc) {
            currentImg = this.imgAttack;
        } else if (this.isMoving) {
            if (this.lastDirection === 'left' && this.imgWalkBack.complete && this.imgWalkBack.naturalWidth > 0) {
                currentImg = this.imgWalkBack;
            } else {
                currentImg = this.imgWalk;
            }
        }

        if (this.lastDirection === 'left' && currentImg !== this.imgWalkBack) {
            needFlip = true;
        }

        if (!currentImg.complete || currentImg.naturalWidth === 0) {
            currentImg = this.imgIdle;
        }

        if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(sx, sy + walkOffsetY);
            if (needFlip) ctx.scale(-1, 1);
            ctx.rotate(needFlip ? -walkRotation : walkRotation);
            ctx.drawImage(currentImg, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
            ctx.restore();
        } else {
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(sx, sy + walkOffsetY, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.swordArc) {
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(this.swordArc.angle);
            ctx.beginPath();
            ctx.arc(0, 0, this.swordArc.radius, -Math.PI / 3, Math.PI / 3);
            ctx.strokeStyle = '#00e1ff';
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.restore();
        }
    }
}

// ==========================================
// 6. CLASSE INIMIGO (Enemy)
// ==========================================
class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.img = new Image();

        if (this.type === 'fast') {
            this.size = 45;
            this.maxHp = 22;
            this.speed = 2.8;
            this.xpValue = 15;
            this.scoreValue = 15;
            this.img.src = 'assets/characters/enemy_fast.png';
            this.color = '#f39c12';
        } else if (this.type === 'shadow') {
            this.size = 45;
            this.maxHp = 70;
            this.speed = 1.3;
            this.xpValue = 35;
            this.scoreValue = 30;
            this.img.src = 'assets/characters/enemy_shadow.png';
            this.color = '#8e44ad';
        } else {
            this.size = 45;
            this.maxHp = 40;
            this.speed = 1.9;
            this.xpValue = 20;
            this.scoreValue = 10;
            this.img.src = 'assets/characters/enemy.png';
            this.color = '#e74c3c';
        }

        this.hp = this.maxHp;
        this.animTimer = Math.random() * 10;
        this.isMovingLeft = false;
    }

    update(player) {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let dist = Math.hypot(dx, dy);

        if (dist > 0) {
            dx /= dist;
            dy /= dist;
            this.x += dx * this.speed;
            this.y += dy * this.speed;
            this.isMovingLeft = (dx < 0);
        }

        this.animTimer += 0.15;

        if (dist < this.size + player.size && player.hp > 0) {
            player.hp -= 0.35;
        }
    }

    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        let renderSize = this.size * 2;

        let walkOffsetY = Math.sin(this.animTimer * 2) * 3;
        let walkRotation = Math.cos(this.animTimer) * 0.1;

        if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
            ctx.save();
            ctx.translate(sx, sy + walkOffsetY);
            if (this.isMovingLeft) ctx.scale(-1, 1);
            ctx.rotate(walkRotation);
            ctx.drawImage(this.img, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
            ctx.restore();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(sx, sy + walkOffsetY, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.hp < this.maxHp) {
            let barW = 32;
            let barH = 4;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(sx - barW / 2, sy - renderSize / 2 - 6, barW, barH);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(sx - barW / 2, sy - renderSize / 2 - 6, barW * Math.max(0, this.hp / this.maxHp), barH);
        }
    }
}

// ==========================================
// 7. EFEITOS E TEXTOS FLUTUANTES
// ==========================================
class FloatingText {
    constructor(x, y, text, color, isCrit) {
        this.x = x; this.y = y;
        this.text = text; this.color = color;
        this.isCrit = isCrit;
        this.life = 0.8;
        this.vy = -1.5;
    }

    update() {
        this.y += this.vy;
        this.life -= 1 / 60;
    }

    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = this.isCrit ? 'bold 18px sans-serif' : 'bold 13px sans-serif';
        ctx.globalAlpha = Math.max(0, this.life / 0.8);
        ctx.fillText(this.text, sx, sy);
        ctx.restore();
    }
}

class AreaSkill {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.radius = 10;
        this.maxRadius = 140;
        this.life = 0.3;
    }

    update() {
        this.radius += (this.maxRadius - this.radius) * 0.3;
        this.life -= 1 / 60;
    }

    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
    }
}

// ==========================================
// 8. INTERFACE DE USUÁRIO E MENUS (HUD & MENUS)
// ==========================================
const UI = {
    drawHUD(ctx, player, game) {
        ctx.save();

        // Barra de Vida
        ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
        ctx.fillRect(20, 20, 220, 22);
        let hpRatio = Math.max(0, player.hp / player.maxHp);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(20, 20, 220 * hpRatio, 22);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, 20, 220, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`HP: ${Math.ceil(player.hp)} / ${player.maxHp}`, 28, 36);

        // Barra de Mana
        ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
        ctx.fillRect(20, 47, 220, 14);
        let manaRatio = Math.max(0, player.mana / player.maxMana);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(20, 47, 220 * manaRatio, 14);
        ctx.strokeRect(20, 47, 220, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.fillText(`Mana: ${Math.ceil(player.mana)} / ${player.maxMana}`, 28, 58);

        // Barra de Experiência (XP) no topo central
        let barW = Math.min(400, canvas.width - 100);
        let barX = canvas.width / 2 - barW / 2;
        ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
        ctx.fillRect(barX, 15, barW, 16);
        let xpRatio = Math.max(0, player.xp / player.xpToNextLevel);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(barX, 15, barW * xpRatio, 16);
        ctx.strokeStyle = '#f1c40f';
        ctx.strokeRect(barX, 15, barW, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`NÍVEL ${player.level} (${Math.floor(player.xp)} / ${player.xpToNextLevel} XP)`, canvas.width / 2, 27);
        ctx.textAlign = 'left';

        // Score e Onda
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#f1c40f';
        ctx.fillText(`Onda: ${game.wave}`, 20, 88);
        ctx.fillText(`Pontos: ${game.score}`, 20, 110);

        // Cooldowns
        let qStatus = player.skillQCooldown > 0 ? `${player.skillQCooldown.toFixed(1)}s` : 'PRONTO';
        let dashStatus = player.dashCooldown > 0 ? `${player.dashCooldown.toFixed(1)}s` : 'PRONTO';

        ctx.font = '12px sans-serif';
        ctx.fillStyle = player.skillQCooldown > 0 ? '#bdc3c7' : '#2ecc71';
        ctx.fillText(`[Q] Habilidade: ${qStatus}`, 20, 135);

        ctx.fillStyle = player.dashCooldown > 0 ? '#bdc3c7' : '#2ecc71';
        ctx.fillText(`[SHIFT] Dash: ${dashStatus}`, 20, 155);

        ctx.restore();
    },

    drawMainMenu(ctx, game) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 15, 25, 0.92)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#3498db';
        ctx.font = 'bold 52px sans-serif';
        ctx.fillText('MEU NOVO JOGO', canvas.width / 2, canvas.height / 2 - 110);

        ctx.fillStyle = '#bdc3c7';
        ctx.font = '16px sans-serif';
        ctx.fillText('Controles: WASD (Andar) | Mouse (Mirar e Atacar)', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText('SHIFT (Dash) | Q (Habilidade de Área)', canvas.width / 2, canvas.height / 2 - 25);

        // Botão Iniciar Jogo
        let btnW = 220, btnH = 50;
        let btnX = canvas.width / 2 - btnW / 2;
        let btnY = canvas.height / 2 + 30;

        let isHover = game.mouseX >= btnX && game.mouseX <= btnX + btnW &&
                      game.mouseY >= btnY && game.mouseY <= btnY + btnH;

        ctx.fillStyle = isHover ? '#27ae60' : '#2ecc71';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('INICIAR JOGO', canvas.width / 2, btnY + 32);

        game.mainMenuBtnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };

        ctx.restore();
    },

    drawLevelUpMenu(ctx, game) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 38px sans-serif';
        ctx.fillText('NÍVEL ALCANÇADO!', canvas.width / 2, 110);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText('Escolha uma melhoria para o seu personagem:', canvas.width / 2, 145);

        let cardW = 220, cardH = 260;
        let startX = canvas.width / 2 - (3 * cardW + 2 * 30) / 2;
        let cardY = canvas.height / 2 - cardH / 2 + 30;

        game.levelUpCardBounds = [];

        for (let i = 0; i < game.currentUpgrades.length; i++) {
            let item = game.currentUpgrades[i];
            let cx = startX + i * (cardW + 30);

            let isHover = game.mouseX >= cx && game.mouseX <= cx + cardW &&
                          game.mouseY >= cardY && game.mouseY <= cardY + cardH;

            ctx.fillStyle = isHover ? 'rgba(52, 152, 219, 0.95)' : 'rgba(30, 40, 60, 0.9)';
            ctx.fillRect(cx, cardY, cardW, cardH);
            ctx.strokeStyle = isHover ? '#f1c40f' : '#34495e';
            ctx.lineWidth = isHover ? 3 : 2;
            ctx.strokeRect(cx, cardY, cardW, cardH);

            ctx.fillStyle = '#f1c40f';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(item.name, cx + cardW / 2, cardY + 50);

            ctx.fillStyle = '#ecf0f1';
            ctx.font = '15px sans-serif';
            
            // Quebra descrição em 2 linhas se necessário
            ctx.fillText(item.desc, cx + cardW / 2, cardY + 120);

            ctx.fillStyle = isHover ? '#ffffff' : '#bdc3c7';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('Clique para Selecionar', cx + cardW / 2, cardY + cardH - 30);

            game.levelUpCardBounds.push({ x: cx, y: cardY, w: cardW, h: cardH, item: item });
        }

        ctx.restore();
    },

    drawGameOver(ctx, game) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 50px sans-serif';
        ctx.fillText('VOCÊ MORREU', canvas.width / 2, canvas.height / 2 - 100);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText(`Onda Alcançada: ${game.wave}  |  Pontuação: ${game.score}  |  Nível: ${game.player.level}`, canvas.width / 2, canvas.height / 2 - 50);

        // Botão Tentar Novamente
        let btn1W = 200, btnH = 45;
        let btn1X = canvas.width / 2 - btn1W - 15;
        let btnY = canvas.height / 2 + 20;

        let isHover1 = game.mouseX >= btn1X && game.mouseX <= btn1X + btn1W &&
                       game.mouseY >= btnY && game.mouseY <= btnY + btnH;

        ctx.fillStyle = isHover1 ? '#27ae60' : '#2ecc71';
        ctx.fillRect(btn1X, btnY, btn1W, btnH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn1X, btnY, btn1W, btnH);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('TENTAR NOVAMENTE', btn1X + btn1W / 2, btnY + 28);

        // Botão Menu Principal
        let btn2X = canvas.width / 2 + 15;
        let isHover2 = game.mouseX >= btn2X && game.mouseX <= btn2X + btn1W &&
                       game.mouseY >= btnY && game.mouseY <= btnY + btnH;

        ctx.fillStyle = isHover2 ? '#c0392b' : '#e74c3c';
        ctx.fillRect(btn2X, btnY, btn1W, btnH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn2X, btnY, btn1W, btnH);

        ctx.fillStyle = '#ffffff';
        ctx.fillText('MENU PRINCIPAL', btn2X + btn1W / 2, btnY + 28);

        game.gameOverBtnBounds = {
            retry: { x: btn1X, y: btnY, w: btn1W, h: btnH },
            menu: { x: btn2X, y: btnY, w: btn1W, h: btnH }
        };

        ctx.restore();
    }
};

// ==========================================
// 9. CLASSE PRINCIPAL DO JOGO (Game)
// ==========================================
class Game {
    constructor() {
        this.state = 'MENU'; // 'MENU', 'PLAYING', 'LEVEL_UP', 'GAME_OVER'
        this.player = new Player();
        this.enemies = [];
        this.floatingTexts = [];
        this.areaSkills = [];
        this.keys = {};
        this.score = 0;
        this.wave = 1;
        this.spawnTimer = 0;

        this.mouseX = canvas.width / 2;
        this.mouseY = canvas.height / 2;
        this.isMouseDown = false;

        this.currentUpgrades = [];
        this.levelUpCardBounds = [];

        window.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        window.addEventListener('mousedown', e => {
            if (e.button === 0) {
                this.isMouseDown = true;
                this.handleMouseClick();
            }
        });

        window.addEventListener('mouseup', e => {
            if (e.button === 0) this.isMouseDown = false;
        });

        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);
    }

    startNewGame() {
        this.player.reset();
        this.enemies = [];
        this.floatingTexts = [];
        this.areaSkills = [];
        this.score = 0;
        this.wave = 1;
        this.spawnTimer = 0;
        this.state = 'PLAYING';
    }

    openLevelUpMenu() {
        this.state = 'LEVEL_UP';
        // Seleciona 3 opções aleatórias sem repetição
        let shuffled = [...UPGRADES_POOL].sort(() => 0.5 - Math.random());
        this.currentUpgrades = shuffled.slice(0, 3);
    }

    handleMouseClick() {
        if (this.state === 'MENU' && this.mainMenuBtnBounds) {
            let b = this.mainMenuBtnBounds;
            if (this.mouseX >= b.x && this.mouseX <= b.x + b.w &&
                this.mouseY >= b.y && this.mouseY <= b.y + b.h) {
                this.startNewGame();
            }
        } else if (this.state === 'LEVEL_UP' && this.levelUpCardBounds.length > 0) {
            this.levelUpCardBounds.forEach(card => {
                if (this.mouseX >= card.x && this.mouseX <= card.x + card.w &&
                    this.mouseY >= card.y && this.mouseY <= card.y + card.h) {
                    card.item.apply(this.player);
                    this.state = 'PLAYING';
                }
            });
        } else if (this.state === 'GAME_OVER' && this.gameOverBtnBounds) {
            let r = this.gameOverBtnBounds.retry;
            let m = this.gameOverBtnBounds.menu;

            if (this.mouseX >= r.x && this.mouseX <= r.x + r.w &&
                this.mouseY >= r.y && this.mouseY <= r.y + r.h) {
                this.startNewGame();
            } else if (this.mouseX >= m.x && this.mouseX <= m.x + m.w &&
                       this.mouseY >= m.y && this.mouseY <= m.y + m.h) {
                this.state = 'MENU';
            }
        }
    }

    triggerAreaSkill(x, y) {
        this.areaSkills.push(new AreaSkill(x, y));
        this.enemies.forEach(e => {
            let dist = Math.hypot(e.x - x, e.y - y);
            if (dist < 140) {
                let dmg = 50 * this.player.damageMultiplier;
                e.hp -= dmg;
                this.addFloatingText(e.x, e.y, `${Math.round(dmg)}`, '#9b59b6', true);
            }
        });
    }

    addFloatingText(x, y, text, color, isCrit = false) {
        this.floatingTexts.push(new FloatingText(x, y, text, color, isCrit));
    }

    spawnEnemies() {
        this.spawnTimer += 1 / 60;
        if (this.spawnTimer >= Math.max(0.5, 2.3 - this.wave * 0.15)) {
            this.spawnTimer = 0;

            let angle = Math.random() * Math.PI * 2;
            let dist = 520 + Math.random() * 100;
            let ex = this.player.x + Math.cos(angle) * dist;
            let ey = this.player.y + Math.sin(angle) * dist;

            let rand = Math.random();
            let type = 'normal';
            if (rand < 0.3) type = 'fast';
            else if (rand < 0.55) type = 'shadow';

            this.enemies.push(new Enemy(ex, ey, type));
        }
    }

    update() {
        if (this.state !== 'PLAYING') return;

        this.player.update(this.keys, this);

        if (this.player.hp <= 0) {
            this.state = 'GAME_OVER';
            return;
        }

        this.spawnEnemies();

        // Inimigos
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            e.update(this.player);

            if (e.hp <= 0) {
                this.score += e.scoreValue;
                this.player.addXp(e.xpValue, this);
                this.enemies.splice(i, 1);
            }
        }

        // Efeitos
        for (let i = this.areaSkills.length - 1; i >= 0; i--) {
            this.areaSkills[i].update();
            if (this.areaSkills[i].life <= 0) this.areaSkills.splice(i, 1);
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            this.floatingTexts[i].update();
            if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
        }

        if (this.score > this.wave * 180) {
            this.wave++;
        }
    }

    drawBackground(cameraX, cameraY) {
        if (bgImg.complete && bgImg.naturalWidth !== 0) {
            let startX = Math.floor((cameraX - canvas.width / 2) / bgImg.width) * bgImg.width;
            let startY = Math.floor((cameraY - canvas.height / 2) / bgImg.height) * bgImg.height;

            for (let x = startX; x < cameraX + canvas.width + bgImg.width; x += bgImg.width) {
                for (let y = startY; y < cameraY + canvas.height + bgImg.height; y += bgImg.height) {
                    let sx = x - cameraX + canvas.width / 2;
                    let sy = y - cameraY + canvas.height / 2;
                    ctx.drawImage(bgImg, sx, sy);
                }
            }
        } else {
            // Mosaico Fallback se imagem não existir
            ctx.fillStyle = '#1e272c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1;
            let gridSize = 64;
            let offsetX = (-cameraX + canvas.width / 2) % gridSize;
            let offsetY = (-cameraY + canvas.height / 2) % gridSize;

            for (let x = offsetX; x < canvas.width; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = offsetY; y < canvas.height; y += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }
        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let cameraX = this.player.x;
        let cameraY = this.player.y;

        this.drawBackground(cameraX, cameraY);

        if (this.state === 'PLAYING' || this.state === 'LEVEL_UP') {
            this.areaSkills.forEach(s => s.draw(cameraX, cameraY));
            this.enemies.forEach(e => e.draw(cameraX, cameraY));
            this.player.draw(cameraX, cameraY);
            this.floatingTexts.forEach(ft => ft.draw(cameraX, cameraY));
            UI.drawHUD(ctx, this.player, this);

            if (this.state === 'LEVEL_UP') {
                UI.drawLevelUpMenu(ctx, this);
            }
        } else if (this.state === 'MENU') {
            UI.drawMainMenu(ctx, this);
        } else if (this.state === 'GAME_OVER') {
            this.areaSkills.forEach(s => s.draw(cameraX, cameraY));
            this.enemies.forEach(e => e.draw(cameraX, cameraY));
            this.player.draw(cameraX, cameraY);
            UI.drawGameOver(ctx, this);
        }
    }
}

// ==========================================
// 10. INICIALIZAÇÃO E LOOP DO JOGO
// ==========================================
const game = new Game();

function loop() {
    game.update();
    game.draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);