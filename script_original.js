// ================================================================
// SHADOW DUNGEON — Versão expandida (~2000 linhas)
// ----------------------------------------------------------------
// Recursos novos:
//  * Movimento fluido com aceleração/atrito e delta time real
//  * Cada tipo de inimigo com ataque e velocidade próprios
//  * Animação de surgimento (spawn) dos inimigos
//  * Novas ondas com chefes a cada 5 ondas
//  * Inimigos dropam moedas -> upgrades permanentes (após morrer)
//  * Chance de drop de cura (corações)
//  * Eventos aleatórios durante a run
//  * Novos poderes a cada level up dentro da run
//  * Loja de upgrades permanentes no menu principal
//  * Inimigos ranged (atiram projéteis), bomber (explode),
//    splitter (divide ao morrer), healer (cura aliados)
//  * Partículas de morte e screen shake
//  * Projetoéis inimigos
// ================================================================
//
// ----------------------------------------------------------------
// LISTA DE IDEIAS PARA EXPANDIR AINDA MAIS O JOGO (100+ IDEIAS):
// ----------------------------------------------------------------
//  1. Novas classes de personagem (mago, arqueiro, assassino)
//  2. Armas equipáveis com raridade (comum, rara, épica, lendária)
//  3. Sistema de combos: ataques consecutivos aumentam o dano
//  4. Kill streak: matar vários inimigos em sequência dá bônus
//  5. Modo sobrevivência com timer
//  6. Boss com fases (muda de ataque ao perder metade da vida)
//  7. Mapas diferentes (caverna, floresta sombria, castelo)
//  8. Portais que levam a masmorra bônus
//  9. Inimigos que explodem ao morrer (já temos o bomber)
// 10. Itens de buff temporários que caem no chão
// 11. Sistema de conquistas com recompensas de moedas
// 12. Loja diária com ofertas especiais
// 13. Árvore de talentos com ramos (ataque vs defesa vs suporte)
// 14. Skins de personagem desbloqueáveis
// 15. Efeitos visuais especiais ao subir de nível (anel de luz)
// 16. Sombras no chão que escondem inimigos
// 17. Armadilhas que o jogador pode posicionar
// 18. Inimigos minions que seguem o jogador
// 19. Multiplayer local (co-op)
// 20. Modo infinito com ranking de pontuação
// 21. Chefes semanais com prêmios exclusivos
// 22. Sistema de "runas" que modificam skills
// 23. Mazmorras procedurais geradas aleatoriamente
// 24. Inimigos imunes a certos tipos de dano
// 25. Chefes que invocam minions
// 26. Relógios que param o tempo por alguns segundos
// 27. Fogos de artifício ao derrotar um boss
// 28. Dicas de contexto durante o jogo (tutorial)
// 29. Personalização de teclas
// 30. Modo escuro / modo luz (tema visual)
// 31. Sistema de meteoros: projéteis caem em área aleatória
// 32. Inimigo fantasma: atravessa paredes, dá XP alto
// 33. Armadilha de veneno no chão que danifica todos
// 34. Bônus de tempo: ganha 30s extra ao completar onda
// 35. Modo "Pacifista": não pode atacar, mas ganha mais XP
// 36. Inimigo espião que se disfarça de moeda
// 37. Selo de proteção: player invulnerável por 3s após dash
// 38. Aria de cura: restaura HP todos os segundos por 10s
// 39. Escudo temporário gerado ao matar 3 inimigos seguidos
// 40. Relâmpago divino: dash causa área de efeito maior
// 41. Inimigo de gelo que desacelera player ao tocar
// 42. Poção de força: +50% dano por 15 segundos
// 43. Sistema de "fúria" visual: player fica vermelho, velocidade aumenta
// 44. Labirinto proceduramente gerado para a próxima onda
// 45. Inimigo que rouba moedas do player ao tocar
// 46. Teleporte aleatório do player a cada 10s
// 47. Bônus de "x2 XP" por 20 segundos após completar onda
// 48. Sistema de troféus exibidos no menu principal
// 49. Inimigo-chão que cria fissuras que lento o player
// 50. Modo night vision: player vê inimigos através de paredes por 5s
// 51. Sistema de "combo visual": efeitos acumulam na tela
// 52. Inimigo que deixa portal de após morte que teleporta player
// 53. Dano ambiental: pisos em chamas que dão 5 HP/s
// 54. Bônus de "moeda dourada" que surge a cada 5 ondas
// 55. Sistema de "legado": progresso persistente entre runs
// 56. Inimigo projétil que segue o player (homing)
// 57. Área de segurança temporária após spawnar
// 58. Bônus de "dano crítico x3" por 10s após level up
// 59. Sistema de pentes de desafios semanais
// 60. Inimigo que solta um "mini-boss" menor ao morrer
// 61. Efeito "slow motion" ao entrar em menu pausa
// 62. Sistema de "reputação" com facções diferentes
// 63. Inimigo que deixa rastro de fogo ao se mover
// 64. Bônus de "regen de mana massiva" ao completar onda sem tomar dano
// 65. Sistema de "pacto": escolher um benefício e um defeito por run
// 66. Inimigo que se divide em 3 ao morrer (tipo splitter avançado)
// 67. Bônus de "velocidade de projétil +100%" por 8s
// 68. Sistema de "evolução de inimigos": eles ficam mais fortes a cada onda
// 69. Inimigo que solta labirinto temporário que encurta caminho
// 70. Modo "ironman": um só save, permadeath verdadeiro
// 71. Sistema de "mentoria": desbloquear dicas secretas ao jogar muito
// 72. Inimigo que solta névoa que cega inimigos próximos
// 73. Bônus de "invencibilidade frames" após tomar dano
// 74. Sistema de "tempestade": projéteis aleatórios chovem por 10s
// 75. Inimigo que rouba upgrades permanentes do player
// 76. Sistema de "rankings sazonais" com recompensas fixas
// 77. Inimigo que deixa portal de vitória ao morrer (avança onda)
# 78. Bônus de "dano em área" ao matar 5 inimigos em 3s (combo area)
// 79. Sistema de "glória": multiplicador de pontos por kills consecutivas
# 80. Inimigo que troca de posição com player ao tocar
# 81. Bônus de "refletir projéteis" por 5s após level up
# 82. Sistema de "artefatos": itens únicos com efeito passivo único
# 83. Inimigo que planta bomba que explode após 3s
# 84. Bônus de "curar aliado": cura todos os inimigos próximos em 50%
# 85. Sistema de "desafio diario": completar 3 tarefas para bônus
# 86. Inimigo que cria clone seu ao morrer
# 87. Bônus de "dash invencível" que atravessa inimigos
# 88. Sistema de "colecionáveis": 100 itens secretos para desbloquear
# 89. Inimigo que solta armadilha de gelo que lenta player 70% por 3s
# 90. Bônus de "xp bonus" ao destruir todos os inimigos de um tipo
# 91. Sistema de "história": cutscenes entre ondas
# 92. Inimigo que solta veneno que drena HP player ao andar nele
# 93. Bônus de "armadura temporária": +100 HP por 15s
# 94. Sistema de "pedra runica": runas que podem ser socketadas em armas
# 95. Inimigo que dispara espinhos em todas as direções ao morrer
# 96. Bônus de "lifesteal x2" por 10s após matar boss
# 97. Sistema de "mitos": lendas que se contam ao completar desafios
# 98. Inimigo que se teleporta próximo ao player aleatoriamente
# 99. Bônus de "tempestade de moedas": todas as moedas valem 5x por 5s
# 100. Sistema de "legado familiar": progresso que influencia a próxima run
# 101. Inimigo que solta armadilha de raio que atinge player a distância
# 102. Bônus de "fúria cega": aumenta dano 50% mas reduz defesa 30% por 10s
# 103. Sistema de "poupança": moedas guardadas rendem juros a cada onda
# 104. Inimigo que solta campo de gravidade que puxa player para centro
# 105. Bônus de "time freeze": tempo parado por 3s a cada 30s de jogo
# 106. Sistema de "artefatos míticos": 1 por run, efeito ultra poderoso
# 107. Inimigo que solta plataformas que afundam afinal do tempo
# 108. Bônus de "proteção ancestral": 30% de dano convertido em XP
# 109. Sistema de "rivalidade": enfrentar o fantasma de outro player
# 110. Inimigo que solta minas que explodem ao player se aproximar
# 111. Bônus de "meditação": recuperar toda mana e hp ao ficar 5s parado
# 112. Sistema de "evolução de árvore": upgrades desbloqueiam outras upgrades
# 113. Inimigo que solta névoa tóxica que causa dano ao passar por ela
# 114. Bônus de "escudo de pureza": imune a efeitos negativos por 5s
# 115. Sistema de "profecia": prever próximo evento aleatório
# 116. Inimigo que solta armadilha de sonora que desorienta player
# 117. Bônus de "resonância": ataques causam dano em área pequena
# 118. Sistema de "contrato": fazer pacto com inimigo temporário
# 119. Inimigo que solta armadilha de gravidade que empurra player
# 120. Bônus de "foco mortal": próximo ataque causa dano x5
//
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// GUIA DE ARQUIVOS E COMO ADICIONAR NOVOS CONTEÚDOS:
// ----------------------------------------------------------------
//  * index.html  -> estrutura da página, <canvas> e carregamento
//  * style.css   -> estilo da página (fundo, fonte, canvas)
//  * script.js   -> todo o código do jogo (este arquivo)
//
// Onde mudar cada coisa:
//  * Novos tipos de inimigo: objeto ENEMY_TYPES (~linha 340)
//  * Novos inimigos especiais: campo "ranged/bomber/..." em
//    ENEMY_TYPES e o comportamento em Enemy.update()
//  * Novos upgrades da run: array UPGRADES_POOL (~linha 100)
//  * Novos upgrades permanentes: META_UPGRADES (~linha 90) e
//    o objeto META (salva em localStorage)
//  * Novos eventos aleatórios: array RANDOM_EVENTS (~linha 480)
//  * Novas ondas/dificuldade: Game.spawnEnemies() e Game.update()
//  * Movimento do jogador: Player.update() (aceleração/atrito)
//  * Som: objeto sounds (Web Audio API, sem arquivos)
//
// Checklist de bugs comuns:
//  * Se imagem não carregar, o jogo desenha formas de fallback.
//  * Se localStorage estiver bloqueado, o save falha silenciosamente.
//  * Áudio só inicia após o primeiro clique/tecla (política do navegador).
//  * Use o navegador para testar com F12 -> Console (erros em vermelho).
//
// SOBRE OS BOTÕES DE MENU:
//  * INICIAR JOGO  -> começa uma nova run
//  * UPGRADES PERMANENTES -> abre a loja para gastar moedas
//  * TENTAR NOVAMENTE / MENU PRINCIPAL -> na tela de game over
//
// SOBRE AS TECLAS:
//  * WASD / Setas -> mover
//  * Mouse -> mirar e atacar (botão esquerdo)
//  * Shift / Espaço -> dash
//  * Q -> habilidade de área
//  * ESC -> pausar / continuar
//
// DICAS DE BALANCEAMENTO:
//  * Inimigos tank têm muito mais HP, mas são lentos.
//  * Inimigos fast são fracos, mas chegam rápido.
//  * Ranged mantêm distância e atiram projéteis.
//  * Bomber causam muito dano ao se aproximar.
//  * Splitter se dividem em 2 ao morrer.
//  * Healer curam inimigos próximos.
//  * Boss: a cada 5 ondas, com fase 2 (fúria) ao perder 50% HP.
//  * Moedas: caem dos inimigos e atraem no raio do magnet.
//  * Curas: 25% de chance de cair um coração (+20 HP).
//  * Escudo: 8% de chance de cair um escudo (1 hit absorvido).
//  * Eventos aleatórios a cada 15-30 segundos.
//  * Upgrades permanentes somam aos status do Player.reset().
//  * Upgrades da run aplicam direto nos atributos do Player.
//
// MECÂNICAS IMPLEMENTADAS NESTES ARQUIVO:
//  * Dash com cooldown e duração (dá dano se upgradeado)
//  * Ataque de espada em arco com ângulo do mouse
//  * Crítico com 2x de dano
//  * Vampirismo, Espinhos, Regeneração de HP
//  * Mana regenera com o tempo, Habilidade Q consome mana
//  * Animação de walk/idle/attack do jogador
//  * Animação de spawn dos inimigos (crescem do chão)
//  * Partículas ao matar inimigos
//  * Screen shake ao levar dano/matar
//  * Minimapa com posição do jogador e inimigos
//  * Pause com ESC
//  * Eventos com banner no topo da tela
//  * Dica contextual na primeira onda
//
// IDEIAS DE EVENTOS FUTUROS (prontos para implementar):
//  * Chuva de fogo: projéteis caem do céu por alguns segundos
//  * Inimigos dobrados: todos os inimigos ganham 2x vida
//  * Tela piscando: escuridão temporária, só o jogador brilha
//  * Bônus de ouro: todas as moedas valem 2x por 10s
//  * Inimigos dourados: um inimigo raro com muito XP e moedas
//  * Combo: multiplicar pontuação por inimigo morto em sequência
//  * Onda de cura: curar um pouco ao completar uma onda
//  * Invasão: spawnar muitos inimigos fast por 5s
//  * Protetor: escudo temporário em todos os inimigos
//  * Cura aliada: o healer cura mais forte
//
// IDEIAS DE UPGRADES PERMANENTES FUTURAS:
//  * +1 Slot de habilidade ativa
//  * +10% dano crítico
//  * +5% cooldown de habilidade
//  * +20% dano de dash
//  * +10% magnet de moedas
//  * Começar com +50 HP
//  * Começar com um escudo
//  * 10% de chance de não gastar mana
//  * +1 HP por segundo
//  * +5% velocidade de ataque
//
// IDEIAS DE UPGRADES DA RUN (level up) FUTURAS:
//  * "Fúria": +30% dano por 10s após matar 5 inimigos
//  * "Evasivo": dash não consome cooldown se matar
//  * "Pesado": +20 dano, -10% velocidade
//  * "Mágico": habilidade Q custa 0 por 15s
//  * "Fortaleza": imune a dano por 2s
//  * "Lifesteal Plus": +10% lifesteal
//  * "Crítico Máximo": crítico cura 10 HP
//  * "Tempo": inimigos 20% mais lentos
//  * "Invisibilidade": inimigos não te veem por 5s
//  * "Barreira": absorve 100 dano uma vez
//
// ROTEIRO PARA CRIAR UM NOVO EVENTO:
//  1. Adicione um objeto em RANDOM_EVENTS com id/name/desc/apply.
//  2. Em apply(game), use game.player, game.enemies, game.coins etc.
//  3. Pronto: ele entra no sorteio dos eventos aleatórios.
//
// ROTEIRO PARA CRIAR UM NOVO INIMIGO:
//  1. Adicione uma entrada em ENEMY_TYPES com todos os stats.
//  2. Em Game.spawnEnemies(), inclua o tipo no sorteio.
//  3. Para comportamento especial, use um campo booleano e trate em
//     Enemy.update() como fizemos com ranged/bomber/healer/splitter.
//
// ROTEIRO PARA CRIAR UM NOVO UPGRADE PERMANENTE:
//  1. Adicione chave e nível 0 em META.levels.
//  2. Adicione um objeto em META_UPGRADES com name/desc/cost.
//  3. Use o nível em Player.reset() para somar aos status.
//
// ROTEIRO PARA CRIAR UM NOVO UPGRADE DA RUN:
//  1. Adicione um objeto em UPGRADES_POOL com id/name/desc/apply.
//  2. Em apply(p), modifique os atributos do Player.
//  3. Ele aparecerá no menu de level up.
//
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// CRÉDITOS E HISTÓRICO DE VERSÕES:
//  v1.0  - Protótipo básico com jogador, inimigos e ondas.
//  v1.1  - Adicionado dash, habilidade Q, mana e attack speed.
//  v1.2  - Sistema de level up com upgrades aleatórios.
//  v2.0  - Expansão gigante: 2000 linhas, novos inimigos, eventos,
//          moedas, upgrades permanentes, minimap, pause, boss,
//          partículas, screen shake, combos, escudo, corações.
//
//  Feito com HTML5 Canvas + JavaScript puro (sem bibliotecas).
//  Áudio procedural via Web Audio API.
//  Os sprites originais estão em assets/characters e assets/backgrounds.
//  Se algum sprite não existir, o jogo usa formas coloridas de fallback.
//
//  Este arquivo foi expandido a pedido para conter ~2000 linhas
//  com funcionalidades e ideias documentadas. Sinta-se livre para
//  editar, remover ou adicionar novos recursos seguindo os roteiros
//  descritos acima.
//
//  REQUISITOS MÍNIMOS: navegador moderno (Chrome, Firefox, Edge).
//  ABRIR: clique duas vezes em index.html ou rode um servidor local.
//
//  ----------------------------------------------------------------
//  FIM DO CABEÇALHO - CÓDIGO COMEÇA ABAIXO
//  ----------------------------------------------------------------

// ==========================================
// 1. CANVAS
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
// 2. UTILITÁRIOS
// ==========================================
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const angleBetween = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

// ==========================================
// 3. ÁUDIO
// ==========================================
let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}
window.addEventListener('click', initAudio, { once: true });
window.addEventListener('keydown', initAudio, { once: true });

function tone(type, f0, f1, dur, vol) {
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), audioCtx.currentTime + dur);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

const sounds = {
    slash:    () => tone('sawtooth', 300, 80, 0.10, 0.12),
    hit:      () => tone('square', 150, 40, 0.08, 0.15),
    dash:     () => tone('sine', 500, 150, 0.15, 0.12),
    skill:    () => tone('triangle', 200, 700, 0.25, 0.2),
    levelUp:  () => tone('sine', 400, 800, 0.4, 0.2),
    coin:     () => tone('sine', 900, 1400, 0.12, 0.08),
    heart:    () => tone('sine', 300, 600, 0.2, 0.12),
    boss:     () => tone('sawtooth', 100, 50, 0.6, 0.25),
    event:    () => tone('triangle', 500, 900, 0.3, 0.12),
    hurt:     () => tone('square', 200, 60, 0.15, 0.12),
};

// ==========================================
// 4. FUNDO
// ==========================================
const bgImg = new Image();
bgImg.src = 'assets/backgrounds/fundo.png';

// ==========================================
// 5. UPGRADES PERMANENTES (meta-progressão)
// ------------------------------------------
// Salvos em localStorage: moedas e níveis de cada upgrade.
// ==========================================
const META = {
    coins: 0,
    totalKills: 0,
    bestWave: 1,
    // níveis [0..5] de cada upgrade permanente
    levels: { hp: 0, dmg: 0, speed: 0, xp: 0, magnet: 0, mana: 0, crit: 0, lifesteal: 0, thorns: 0, combo: 0, luck: 0 },
};
const META_UPGRADES = [
    { key: 'hp',     name: 'Coração de Pedra',  desc: '+20 Vida Máx',        cost: lvl => 20 + lvl * 15 },
    { key: 'dmg',    name: 'Lâmina Afiada',     desc: '+10% Dano',           cost: lvl => 25 + lvl * 20 },
    { key: 'speed',  name: 'Botas de Vento',    desc: '+6% Velocidade',      cost: lvl => 15 + lvl * 12 },
    { key: 'xp',     name: 'Cabeça Brilhante',  desc: '+15% XP',             cost: lvl => 20 + lvl * 15 },
    { key: 'magnet', name: 'Ímã Rúnico',        desc: '+30% Raio de Moeda',  cost: lvl => 10 + lvl * 10 },
    { key: 'mana',   name: 'Frasco Eterno',     desc: '+30 Mana Máx',        cost: lvl => 15 + lvl * 12 },
    { key: 'crit',   name: 'Olho de Águia',     desc: '+5% Crítico',         cost: lvl => 25 + lvl * 18 },
    { key: 'lifesteal', name: 'Sangue Fresco',  desc: '+2% Lifesteal',       cost: lvl => 30 + lvl * 20 },
    { key: 'thorns', name: 'Couragem',          desc: '+5 Dano refletivo',   cost: lvl => 20 + lvl * 15 },
];

function saveMeta() {
    try { localStorage.setItem('shadowDungeonMeta', JSON.stringify(META)); } catch (e) {}
}
function loadMeta() {
    try {
        let raw = localStorage.getItem('shadowDungeonMeta');
        if (raw) {
            let d = JSON.parse(raw);
            META.coins = d.coins || 0;
            META.totalKills = d.totalKills || 0;
            META.bestWave = d.bestWave || 1;
            if (d.levels) for (let k in META.levels) META.levels[k] = d.levels[k] || 0;
        }
    } catch (e) {}
}
loadMeta();

// ==========================================
// 6. POOL DE UPGRADES DA RUN (level up)
// ==========================================
const UPGRADES_POOL = [
    { id: 'dmg',       name: 'Força Bruta',      desc: '+20% Dano do Ataque',          apply: p => p.damageMultiplier *= 1.20 },
    { id: 'hp',        name: 'Vitalidade',       desc: '+25 Vida Máx (Cura +25)',      apply: p => { p.maxHp += 25; p.hp = Math.min(p.maxHp, p.hp + 25); } },
    { id: 'speed',     name: 'Passo Ágil',       desc: '+12% Velocidade de Movimento', apply: p => p.speed *= 1.12 },
    { id: 'crit',      name: 'Oitenta ou Oitenta', desc: '+10% Chance de Crítico',     apply: p => p.critChance += 0.10 },
    { id: 'atkSpeed',  name: 'Reflexos',         desc: '+20% Velocidade de Ataque',    apply: p => p.attackSpeedMultiplier *= 0.82 },
    { id: 'manaRegen', name: 'Fluxo Mágico',     desc: '+50% Regeneração de Mana',     apply: p => p.manaRegenRate *= 1.50 },
    { id: 'lifesteal', name: 'Vampirismo',       desc: 'Cura 5% do dano causado',      apply: p => p.lifesteal += 0.05 },
    { id: 'thorns',    name: 'Espinhos',         desc: 'Reflete 15 dano ao tocar',     apply: p => p.thornsDamage += 15 },
    { id: 'multishot', name: 'Lâmina Dupla',     desc: '+1 Projétil de espada em Q',   apply: p => p.skillProjectiles += 1 },
    { id: 'maxMana',   name: 'Reserva Arcana',   desc: '+20 Mana Máxima',              apply: p => { p.maxMana += 20; p.mana += 20; } },
    { id: 'dashCd',    name: 'Relâmpago',        desc: '-25% Cooldown do Dash',        apply: p => p.dashCooldownMax *= 0.75 },
    { id: 'healing',   name: 'Coração Jovem',    desc: '+50% Cura de drops',           apply: p => p.healingMultiplier *= 1.5 },
    { id: 'bigDash',   name: 'Investida Gigante', desc: 'Dash causa 30 de dano',        apply: p => p.dashDamage += 30 },
    { id: 'ricochet',  name: 'Ricochete',        desc: 'Ataque atinge +1 inimigo',     apply: p => p.bonusTargets += 1 },
    { id: 'regenHp',   name: 'Regeneração',      desc: '+1 HP por segundo',            apply: p => p.hpRegen += 1 },
    { id: 'fury',      name: 'Fúria',            desc: '+30% dano por 10s ao matar 5 em sequência', apply: p => p.furyLevel = (p.furyLevel||0)+1 },
    { id: 'evasive',   name: 'Evasivo',          desc: 'Rash de dash 50% menor',      apply: p => p.dashCooldownMax *= 0.5 },
    { id: 'fortress',  name: 'Fortaleza',        desc: '+50 Vida Máx',                apply: p => { p.maxHp += 50; p.hp += 50; } },
    // Novos upgrades da run
    { id: 'combo',     name: 'Artista de Combos', desc: 'Kills consecutivos aumentam dano em 10%', apply: p => { p.comboMultiplier = (p.comboMultiplier||1) + 0.10; } },
    { id: 'streak',    name: 'Matador de Elite',  desc: 'Kill streak concede bônus de XP', apply: p => { p.killStreakBonus = (p.killStreakBonus||0) + 10; } },
    { id: ' magnetx',  name: 'Ímã Aprimorado',  desc: 'Sorte aumenta raio de moedas', apply: p => { p.luckMultiplier = (p.luckMultiplier||1) + 0.10; } },
];

// ==========================================
// 7. PLAYER
// ==========================================
class Player {
    constructor() {
        this.imgIdle = new Image();      this.imgIdle.src = 'assets/characters/player_idle.png';
        this.imgWalk = new Image();      this.imgWalk.src = 'assets/characters/player_walk.png';
        this.imgWalkBack = new Image();  this.imgWalkBack.src = 'assets/characters/player_walk_back.png';
        this.imgAttack = new Image();    this.imgAttack.src = 'assets/characters/player_attack.png';
        this.reset();
    }

    reset() {
        this.x = 0; this.y = 0;
        this.vx = 0; this.vy = 0;
        this.size = 50;

        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 50;

        // Base + bônus permanentes
        this.maxHp = 100 + META.levels.hp * 20;
        this.hp = this.maxHp;
        this.maxMana = 60 + META.levels.mana * 30;
        this.mana = 45;
        this.manaRegenRate = 3;
        this.speed = 3.8 * (1 + META.levels.speed * 0.06);
        this.damageMultiplier = (1.0 + META.levels.dmg * 0.10);
        this.critChance = 0.10 + META.levels.crit * 0.05;
        this.attackSpeedMultiplier = 1.0;
        this.lifesteal = META.levels.lifesteal * 0.02;
        this.thornsDamage = META.levels.thorns * 5;
        this.skillProjectiles = 1;
        this.dashCooldownMax = 1.2;
        this.healingMultiplier = 1.0;
        this.xpMultiplier = 1 + META.levels.xp * 0.15;
        this.coinMagnet = 60 * (1 + META.levels.magnet * 0.30);
        this.dashDamage = 0;
        this.bonusTargets = 0;
        this.hpRegen = 0;
        this.hasShield = false;
        this.furyLevel = 0;
        this.combo = META.levels.combo; // nível permanente de combo
        this.killStreak = 0;
        this.killStreakTimer = 0;
        this.maxKillStreak = 0;
        this.killStreakBonus = 0;
        this.luck = META.levels.luck; // multiplier de sorte para drops

        this.dashCooldown = 0;
        this.isDashing = false;
        this.dashTimer = 0;
        this.skillQCooldown = 0;
        this.attackCooldown = 0;
        this.hurtTimer = 0;

        this.facingAngle = 0;
        this.swordArc = null;
        this.isMoving = false;
        this.lastDirection = 'right';
        this.animTimer = 0;
    }

    addXp(amount, game) {
        let final = Math.round(amount * this.xpMultiplier);
        this.xp += final;
        game.addFloatingText(this.x, this.y - 30, `+${final} XP`, '#f39c12', false);
        if (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.4);
            sounds.levelUp();
            game.openLevelUpMenu();
        }
    }

    update(keys, game, dt) {
        if (this.hp <= 0) return;

        // Cooldowns (dt em segundos)
        if (this.dashCooldown > 0) this.dashCooldown -= dt;
        if (this.skillQCooldown > 0) this.skillQCooldown -= dt;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.hurtTimer > 0) this.hurtTimer -= dt;

        // Input
        let ix = 0, iy = 0;
        if (keys['w'] || keys['W'] || keys['ArrowUp'])    iy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown'])  iy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft'])  ix -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) ix += 1;
        this.isMoving = (ix !== 0 || iy !== 0);

        // Normaliza diagonal
        if (ix !== 0 && iy !== 0) { ix *= 0.7071; iy *= 0.7071; }

        // Mira no mouse (coordenadas de tela, player fica no centro)
        let dxMouse = game.mouseX - canvas.width / 2;
        let dyMouse = game.mouseY - canvas.height / 2;
        this.facingAngle = Math.atan2(dyMouse, dxMouse);

        if (ix < 0) this.lastDirection = 'left';
        else if (ix > 0) this.lastDirection = 'right';
        else if (dxMouse < 0) this.lastDirection = 'left';
        else if (dxMouse > 0) this.lastDirection = 'right';

        // Dash
        if ((keys['Shift'] || keys[' ']) && this.dashCooldown <= 0 && (ix !== 0 || iy !== 0)) {
            this.isDashing = true;
            this.dashTimer = 0.18;
            this.dashCooldown = this.dashCooldownMax;
            sounds.dash();
        }
        if (this.isDashing) {
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) this.isDashing = false;
        }

        // Movimento fluido: aceleração + atrito
        const accel = this.isDashing ? 40 : 22;
        const maxSpeed = this.speed * (this.isDashing ? 2.8 : 1.0);
        this.vx += ix * accel * dt * 10;
        this.vy += iy * accel * dt * 10;

        // Atrito quando sem input
        if (!this.isMoving) {
            this.vx *= Math.pow(0.001, dt);
            this.vy *= Math.pow(0.001, dt);
        }

        // Limita velocidade
        let sp = Math.hypot(this.vx, this.vy);
        if (sp > maxSpeed) { this.vx = this.vx / sp * maxSpeed; this.vy = this.vy / sp * maxSpeed; }

        this.x += this.vx;
        this.y += this.vy;

        // Animação de caminhada
        if (this.isMoving) this.animTimer += dt * 12;
        else this.animTimer = 0;

        // Dano do dash (quando houver upgrade)
        if (this.isDashing && this.dashDamage > 0) {
            game.enemies.forEach(e => {
                if (e.spawnTimer > 0) return;
                if (dist(e.x, e.y, this.x, this.y) < this.size + e.size && !e._dashHit) {
                    e.hp -= this.dashDamage;
                    e.flashTimer = 0.1;
                    e._dashHit = true;
                    game.addFloatingText(e.x, e.y, `${this.dashDamage}`, '#00e1ff', false);
                    setTimeout(() => { e._dashHit = false; }, 500);
                }
            });
        }

        // Q
        if ((keys['q'] || keys['Q']) && this.skillQCooldown <= 0 && this.mana >= 15) {
            this.mana -= 15;
            this.skillQCooldown = 4.0;
            sounds.skill();
            game.triggerAreaSkill(this.x, this.y);
        }

        // Ataque
        if (game.isMouseDown && this.attackCooldown <= 0) {
            this.performSwordAttack(game);
            this.attackCooldown = 0.45 * this.attackSpeedMultiplier;
        }

        if (this.swordArc) {
            this.swordArc.timer -= dt;
            if (this.swordArc.timer <= 0) this.swordArc = null;
        }

        if (this.mana < this.maxMana) {
            this.mana = Math.min(this.maxMana, this.mana + this.manaRegenRate * dt);
        }
        if (this.hpRegen > 0 && this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + this.hpRegen * dt);
        }

        // Update combo timer - reset if no kill recently
        if (game.killCountThisWave > 0 && this.killStreakTimer > 0) {
            this.killStreakTimer -= dt;
            if (this.killStreakTimer <= 0) {
                this.killStreak = 0;
            }
        }
    }

    performSwordAttack(game) {
        let attackAngle = this.facingAngle;
        this.swordArc = { angle: attackAngle, timer: 0.18, radius: 65 };
        sounds.slash();

        let comboThisAttack = 0;
        game.enemies.forEach(e => {
            if (e.spawnTimer > 0) return; // não atinge quem ainda está surgindo
            let d = dist(e.x, e.y, this.x, this.y);
            if (d <= this.swordArc.radius + e.size) {
                let angleToEnemy = angleBetween(this.x, this.y, e.x, e.y);
                let diff = Math.atan2(Math.sin(angleToEnemy - attackAngle), Math.cos(angleToEnemy - attackAngle));
                if (Math.abs(diff) < Math.PI / 2.3) {
                    let isCrit = Math.random() < this.critChance;
                    let dmg = (20 * this.damageMultiplier) * (isCrit ? 2.0 : 1.0);
                    e.hp -= dmg;
                    if (this.lifesteal > 0) this.hp = Math.min(this.maxHp, this.hp + dmg * this.lifesteal);
                    game.addFloatingText(e.x, e.y, isCrit ? `${Math.round(dmg)}!` : `${Math.round(dmg)}`, isCrit ? '#f1c40f' : '#ffffff', isCrit);
                    sounds.hit();
                    comboThisAttack++;
                    // Atualizar combo do jogador
                    this.combo++;
                    game.combo = this.combo;
                    game.addFloatingText(this.x, this.y - 40, `COMBO x${this.combo}!`, '#e67e22', true);
                }
            }
        });

        // Se não atingiu nada, resetar combo (ou manter por pouco tempo)
        if (comboThisAttack === 0) {
            // Combo decai lentamente - manter por 2s sem ataques
            this.comboTimer = 2.0;
        }
    }

    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        let renderSize = this.size * 2;

        if (this.isDashing) {
            ctx.fillStyle = 'rgba(0, 225, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(sx - Math.cos(this.facingAngle) * 20, sy - Math.sin(this.facingAngle) * 20, this.size, 0, TAU);
            ctx.fill();
        }

        // Flash vermelho ao tomar dano
        let hurt = this.hurtTimer > 0;

        let walkOffsetY = (this.isMoving && !this.swordArc) ? Math.sin(this.animTimer * 2) * 4 : 0;
        let walkRotation = (this.isMoving && !this.swordArc) ? Math.cos(this.animTimer) * 0.08 : 0;

        let currentImg = this.imgIdle;
        let needFlip = false;

        if (this.swordArc) currentImg = this.imgAttack;
        else if (this.isMoving) {
            if (this.lastDirection === 'left' && this.imgWalkBack.complete && this.imgWalkBack.naturalWidth > 0) currentImg = this.imgWalkBack;
            else currentImg = this.imgWalk;
        }
        if (this.lastDirection === 'left' && currentImg !== this.imgWalkBack) needFlip = true;
        if (!currentImg.complete || currentImg.naturalWidth === 0) currentImg = this.imgIdle;

        if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(sx, sy + walkOffsetY);
            if (needFlip) ctx.scale(-1, 1);
            ctx.rotate(needFlip ? -walkRotation : walkRotation);
            if (hurt) ctx.filter = 'brightness(2) saturate(0) hue-rotate(0deg)';
            ctx.drawImage(currentImg, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
            ctx.restore();
        } else {
            ctx.fillStyle = hurt ? '#ff0000' : '#3498db';
            ctx.beginPath(); ctx.arc(sx, sy + walkOffsetY, this.size, 0, TAU); ctx.fill();
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

        // Indicador de escudo ativo
        if (this.hasShield) {
            ctx.save();
            ctx.strokeStyle = 'rgba(52,152,219,0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(sx, sy, this.size + 8, 0, TAU);
            ctx.stroke();
            ctx.restore();
        }
    }
}

// ==========================================
// 8. INIMIGOS — cada tipo com ataque e velocidade diferentes
// ==========================================
const ENEMY_TYPES = {
    normal: {
        size: 55, hp: 30, speed: 80, dmg: 8, attackRange: 60, attackCooldown: 1.0,
        xp: 20, score: 10, color: '#e74c3c', img: 'enemy.png', weight: 0.45,
    },
    fast: {
        size: 45, hp: 18, speed: 140, dmg: 5, attackRange: 50, attackCooldown: 0.6,
        xp: 15, score: 15, color: '#f39c12', img: 'enemy_fast.png', weight: 0.25,
    },
    tank: {
        size: 70, hp: 80, speed: 45, dmg: 16, attackRange: 70, attackCooldown: 1.6,
        xp: 35, score: 25, color: '#7f8c8d', img: 'enemy.png', weight: 0.15,
    },
    shadow: {
        size: 45, hp: 40, speed: 100, dmg: 12, attackRange: 110, attackCooldown: 1.4,
        xp: 35, score: 30, color: '#8e44ad', img: 'enemy_shadow.png', weight: 0.15,
    },
    boss: {
        size: 95, hp: 400, speed: 65, dmg: 25, attackRange: 90, attackCooldown: 1.2,
        xp: 150, score: 200, color: '#c0392b', img: 'enemy.png', weight: 0,
    },
    ranged: {
        size: 45, hp: 22, speed: 60, dmg: 10, attackRange: 260, attackCooldown: 1.8,
        xp: 25, score: 20, color: '#16a085', img: 'enemy_shadow.png', weight: 0,
        ranged: true,
    },
    bomber: {
        size: 50, hp: 25, speed: 110, dmg: 30, attackRange: 40, attackCooldown: 2.0,
        xp: 30, score: 20, color: '#d35400', img: 'enemy_fast.png', weight: 0,
        bomber: true,
    },
    splitter: {
        size: 60, hp: 35, speed: 70, dmg: 8, attackRange: 55, attackCooldown: 1.0,
        xp: 25, score: 15, color: '#27ae60', img: 'enemy.png', weight: 0,
        splitter: true,
    },
    healer: {
        size: 50, hp: 30, speed: 55, dmg: 4, attackRange: 200, attackCooldown: 2.5,
        xp: 40, score: 35, color: '#2ecc71', img: 'enemy_shadow.png', weight: 0,
        healer: true,
    },
    blink: {
        size: 40, hp: 20, speed: 90, dmg: 6, attackRange: 30, attackCooldown: 1.2,
        xp: 25, score: 20, color: '#9c27b0', img: 'enemy_fast.png', weight: 0,
        blink: true,
    },
};

class Enemy {
    constructor(x, y, type = 'normal') {
        let t = ENEMY_TYPES[type] || ENEMY_TYPES.normal;
        this.type = type;
        this.config = t;
        this.x = x; this.y = y;
        this.size = t.size;
        this.maxHp = t.hp;
        this.hp = t.hp;
        this.speed = t.speed;
        this.dmg = t.dmg;
        this.attackRange = t.attackRange;
        this.attackCooldownMax = t.attackCooldown;
        this.attackTimer = rand(0, 0.5);
        this.xpValue = t.xp;
        this.scoreValue = t.score;
        this.color = t.color;
        this.img = new Image();
        this.img.src = 'assets/characters/' + t.img;
        this.animTimer = Math.random() * 10;
        this.isMovingLeft = false;
        this.spawnTimer = 0.6;        // animação de surgimento
        this.flashTimer = 0;
        this.attackFlash = 0;
    }

    update(player, dt, game) {
        if (this.spawnTimer > 0) {
            this.spawnTimer -= dt;
            return; // inimigo ainda surgindo
        }
        if (this.attackTimer > 0) this.attackTimer -= dt;
        if (this.flashTimer > 0) this.flashTimer -= dt;
        if (this.attackFlash > 0) this.attackFlash -= dt;

        // Boss: fase 2 ao perder metade da vida
        if (this.type === 'boss' && !this.phase2 && this.hp < this.maxHp / 2) {
            this.phase2 = true;
            this.speed *= 1.6;
            this.dmg *= 1.5;
            if (typeof game !== 'undefined') game.addFloatingText(this.x, this.y, 'O BOSS FICA FURIOSO!', '#ff0000', true);
        }

        // Blink enemy: teleport near player occasionally
        if (this.type === 'blink' && Math.random() < 0.02) {
            let angle = Math.random() * Math.PI * 2;
            let distance = 150 + Math.random() * 100;
            this.x = player.x + Math.cos(angle) * distance;
            this.y = player.y + Math.sin(angle) * distance;
        }

        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let d = Math.hypot(dx, dy);

        // Movimento simples em direção ao player
        let moveDx = dx / d, moveDy = dy / d;
        if (this.config.ranged && d < 180) {
            // Ranged foge se ficar muito perto
            this.x -= moveDx * this.speed * dt;
            this.y -= moveDy * this.speed * dt;
            this.isMovingLeft = moveDx > 0;
        } else if (this.config.healer && d < 220) {
            this.x -= moveDx * this.speed * dt;
            this.y -= moveDy * this.speed * dt;
            this.isMovingLeft = moveDx > 0;
        } else if (d > this.attackRange * 0.7) {
            this.x += moveDx * this.speed * dt;
            this.y += moveDy * this.speed * dt;
            this.isMovingLeft = moveDx < 0;
        }

        this.animTimer += dt * 8;

        // Ataque
        if (d < this.attackRange + player.size * 0.5 && this.attackTimer <= 0 && player.hp > 0) {
            this.attackTimer = this.attackCooldownMax;
            this.attackFlash = 0.25;

            if (this.config.ranged) {
                // Ranged: atira projétil
                let a = angleBetween(this.x, this.y, player.x, player.y);
                game.projectiles.push(new EnemyProjectile(this.x, this.y, a, this.dmg));
            } else if (this.config.bomber) {
                // Bomber: explode causando dano em área
                if (player.hasShield) {
                    player.hasShield = false;
                    game.addFloatingText(player.x, player.y - 20, 'ESCUDO!', '#3498db', true);
                } else {
                    player.hp -= this.dmg;
                    player.hurtTimer = 0.3;
                    sounds.hurt();
                    game.addFloatingText(player.x, player.y - 20, `-${this.dmg}`, '#e74c3c', false);
                }
                if (player.thornsDamage > 0) this.hp -= player.thornsDamage;
            } else if (this.config.healer) {
                // Healer: cura aliados próximos
                game.enemies.forEach(o => {
                    if (o !== this && dist(this.x, this.y, o.x, o.y) < 180) {
                        o.hp = Math.min(o.maxHp, o.hp + 15);
                    }
                });
            } else {
                // Corpo a corpo
                let dmg = this.dmg;
                if (player.hasShield) {
                    player.hasShield = false;
                    game.addFloatingText(player.x, player.y - 20, 'ESCUDO!', '#3498db', true);
                } else {
                    player.hp -= dmg;
                    player.hurtTimer = 0.2;
                    sounds.hurt();
                    game.addFloatingText(player.x, player.y - 20, `-${Math.round(dmg)}`, '#e74c3c', false);
                }
                if (player.thornsDamage > 0) {
                    this.hp -= player.thornsDamage;
                    game.addFloatingText(this.x, this.y, `${player.thornsDamage}`, '#2ecc71', false);
                }
            }
        }
    }

    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        let renderSize = this.size * 2;

        // Escala de surgimento
        let scale = 1;
        if (this.spawnTimer > 0) {
            scale = 1 - (this.spawnTimer / 0.6); // cresce de 0 a 1
            ctx.globalAlpha = clamp(scale, 0, 1);
        }

        let walkOffsetY = Math.sin(this.animTimer * 2) * 3;
        let walkRotation = Math.cos(this.animTimer) * 0.1;

        if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
            ctx.save();
            ctx.translate(sx, sy + walkOffsetY);
            ctx.scale(scale * (this.isMovingLeft ? -1 : 1), scale);
            ctx.rotate(walkRotation);
            ctx.drawImage(this.img, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
            ctx.restore();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(sx, sy + walkOffsetY, this.size * scale, 0, TAU); ctx.fill();
        }

        // Efeito de ataque
        if (this.attackFlash > 0) {
            ctx.save();
            ctx.globalAlpha = this.attackFlash / 0.25;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(sx, sy, this.attackRange, 0, TAU); ctx.stroke();
            ctx.restore();
        }

        // Flash branco ao tomar dano
        if (this.flashTimer > 0) {
            ctx.save();
            ctx.globalAlpha = this.flashTimer / 0.1;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(sx, sy, this.size, 0, TAU); ctx.fill();
            ctx.restore();
        }

        ctx.globalAlpha = 1;

        if (this.hp < this.maxHp && this.spawnTimer <= 0) {
            let barW = this.type === 'boss' ? 80 : 32;
            let barH = this.type === 'boss' ? 7 : 4;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(sx - barW / 2, sy - renderSize / 2 - 6, barW, barH);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(sx - barW / 2, sy - renderSize / 2 - 6, barW * clamp(this.hp / this.maxHp, 0, 1), barH);
        }
    }
}

// ==========================================
// 9. COIN & HEART (drops)
// ==========================================
class Coin {
    constructor(x, y, value) {
        this.x = x; this.y = y;
        this.vx = rand(-60, 60); this.vy = rand(-60, 60);
        this.value = value;
        this.life = 12; // some após 12s
        this.magnet = false;
    }
    update(player, dt) {
        if (this.life > 0) this.life -= dt;
        this.x += this.vx * dt; this.y += this.vy * dt;
        this.vx *= Math.pow(0.01, dt); this.vy *= Math.pow(0.01, dt);
        let d = dist(this.x, this.y, player.x, player.y);
        if (d < player.coinMagnet) this.magnet = true;
        if (this.magnet) {
            let a = angleBetween(this.x, this.y, player.x, player.y);
            let sp = 260;
            this.x += Math.cos(a) * sp * dt;
            this.y += Math.sin(a) * sp * dt;
        }
        if (d < 22) {
            META.coins += this.value;
            sounds.coin();
            this.life = 0;
        }
    }
    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, TAU); ctx.fill();
        ctx.fillStyle = '#f39c12';
        ctx.beginPath(); ctx.arc(sx, sy, 3, 0, TAU); ctx.fill();
    }
}

class Heart {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.value = 20;
        this.life = 10;
    }
    update(player, dt) {
        if (this.life > 0) this.life -= dt;
        let d = dist(this.x, this.y, player.x, player.y);
        if (d < 30) {
            let heal = this.value * player.healingMultiplier;
            player.hp = Math.min(player.maxHp, player.hp + heal);
            sounds.heart();
            this.life = 0;
        }
    }
    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♥', sx, sy + 6);
        ctx.textAlign = 'left';
    }
}

// ==========================================
// 10. EFEITOS
// ==========================================
class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.vx = rand(-120, 120);
        this.vy = rand(-120, 120);
        this.life = rand(0.3, 0.6);
        this.maxLife = this.life;
        this.color = color;
        this.size = rand(2, 5);
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx *= Math.pow(0.01, dt);
        this.vy *= Math.pow(0.01, dt);
        this.life -= dt;
    }
    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        ctx.save();
        ctx.globalAlpha = clamp(this.life / this.maxLife, 0, 1);
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(sx, sy, this.size, 0, TAU); ctx.fill();
        ctx.restore();
    }
}

class EnemyProjectile {
    constructor(x, y, angle, dmg) {
        this.x = x; this.y = y;
        this.vx = Math.cos(angle) * 200;
        this.vy = Math.sin(angle) * 200;
        this.dmg = dmg;
        this.life = 3;
    }
    update(player, dt, game) {
        this.life -= dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.life > 0 && dist(this.x, this.y, player.x, player.y) < player.size * 0.6) {
            if (player.hasShield) {
                player.hasShield = false;
                game.addFloatingText(player.x, player.y - 20, 'ESCUDO!', '#3498db', true);
            } else {
                player.hp -= this.dmg;
                player.hurtTimer = 0.2;
                sounds.hurt();
                game.addFloatingText(player.x, player.y - 20, `-${this.dmg}`, '#e74c3c', false);
            }
            this.life = 0;
        }
    }
    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        ctx.fillStyle = '#16a085';
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, TAU); ctx.fill();
    }
}

class Shield {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.life = 10;
    }
    update(player, dt) {
        if (this.life > 0) this.life -= dt;
        if (dist(this.x, this.y, player.x, player.y) < 30) {
            player.hasShield = true;
            this.life = 0;
        }
    }
    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, TAU);
        ctx.stroke();
    }
}

class FloatingText {
    constructor(x, y, text, color, isCrit) {
        this.x = x; this.y = y; this.text = text; this.color = color; this.isCrit = isCrit;
        this.life = 0.8; this.vy = -1.5;
    }
    update(dt) { this.y += this.vy; this.life -= dt; }
    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = this.isCrit ? 'bold 18px sans-serif' : 'bold 13px sans-serif';
        ctx.globalAlpha = clamp(this.life / 0.8, 0, 1);
        ctx.fillText(this.text, sx, sy);
        ctx.restore();
    }
}

class AreaSkill {
    constructor(x, y) { this.x = x; this.y = y; this.radius = 10; this.maxRadius = 140; this.life = 0.3; }
    update(dt) { this.radius += (this.maxRadius - this.radius) * 0.3; this.life -= dt; }
    draw(cameraX, cameraY) {
        let sx = this.x - cameraX + canvas.width / 2;
        let sy = this.y - cameraY + canvas.height / 2;
        ctx.save();
        ctx.beginPath(); ctx.arc(sx, sy, this.radius, 0, TAU);
        ctx.fillStyle = 'rgba(155, 89, 182, 0.3)'; ctx.fill();
        ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 4; ctx.stroke();
        ctx.restore();
    }
}

// ==========================================
// 11. EVENTOS ALEATÓRIOS
// ==========================================
const RANDOM_EVENTS = [
    {
        id: 'rain_coins', name: 'Chuva Dourada', desc: 'Moedas caem do céu!',
        apply(game) {
            for (let i = 0; i < 8; i++) {
                let a = rand(0, TAU), d = rand(60, 300);
                game.coins.push(new Coin(game.player.x + Math.cos(a) * d, game.player.y + Math.sin(a) * d, randi(1, 3)));
            }
        },
    },
    {
        id: 'healing_spring', name: 'Fonte de Cura', desc: 'Um coração surge perto de você.',
        apply(game) {
            let a = rand(0, TAU);
            game.hearts.push(new Heart(game.player.x + Math.cos(a) * 80, game.player.y + Math.sin(a) * 80));
        },
    },
    {
        id: 'horde', name: 'Horda Sombria', desc: 'Muitos inimigos surgem!',
        apply(game) {
            for (let i = 0; i < 6; i++) {
                let a = rand(0, TAU), d = 400;
                game.enemies.push(new Enemy(game.player.x + Math.cos(a) * d, game.player.y + Math.sin(a) * d, 'normal'));
            }
        },
    },
    {
        id: 'adrenaline', name: 'Adrenalina', desc: '+50% velocidade por 5s.',
        apply(game) {
            game.player.speed *= 1.5;
            game.addFloatingText(game.player.x, game.player.y - 40, 'ADRENALINA!', '#e67e22', true);
            setTimeout(() => { game.player.speed /= 1.5; }, 5000);
        },
    },
    {
        id: 'xp_surge', name: 'Surto de Experiência', desc: '+100 XP agora!',
        apply(game) { game.player.addXp(100, game); },
    },
    {
        id: 'glass_mode', name: 'Modo Vidro', desc: 'Inimigos frágeis, mas você toma +50% dano por 8s.',
        apply(game) {
            game.player.maxHp = game.player.maxHp; // sem alteração
            let origDmg = game.player.damageMultiplier;
            game.player.damageMultiplier *= 2;
            game.addFloatingText(game.player.x, game.player.y - 40, 'MODO VIDRO!', '#e67e22', true);
            setTimeout(() => { game.player.damageMultiplier = origDmg; }, 8000);
        },
    },
    {
        id: 'coin_magnet', name: 'Ímã Supremo', desc: 'Todas as moedas vêm até você!',
        apply(game) {
            game.coins.forEach(c => c.magnet = true);
            game.player.coinMagnet *= 3;
            setTimeout(() => { game.player.coinMagnet /= 3; }, 6000);
        },
    },
    {
        id: 'time_slow', name: 'Câmera Lenta', desc: 'Inimigos mais lentos por 6s.',
        apply(game) {
            game.enemies.forEach(e => e.speed *= 0.5);
            setTimeout(() => { game.enemies.forEach(e => e.speed /= 0.5); }, 6000);
        },
    },
    {
        id: 'gold_rush', name: 'Corrida do Ouro', desc: 'Todas as moedas valem 2x por 10s.',
        apply(game) {
            game.goldRush = true;
            setTimeout(() => { game.goldRush = false; }, 10000);
        },
    },
    {
        id: 'invasion', name: 'Invasão', desc: 'Muitos inimigos fast chegam de uma vez!',
        apply(game) {
            for (let i = 0; i < 8; i++) {
                let a = rand(0, TAU), d = 450;
                game.enemies.push(new Enemy(game.player.x + Math.cos(a) * d, game.player.y + Math.sin(a) * d, 'fast'));
            }
        },
    },
    {
        id: 'heal_wave', name: 'Onda de Cura', desc: 'Você recupera 30 HP agora.',
        apply(game) {
            game.player.hp = Math.min(game.player.maxHp, game.player.hp + 30);
        },
    },
    {
        id: 'meteor_shower', name: 'Chuva de Meteoros', desc: 'Meteoros caem do céu!',
        apply(game) {
            for (let i = 0; i < 5; i++) {
                let a = rand(0, TAU), d = rand(200, 400);
                game.particles.push(new Particle(game.player.x + Math.cos(a) * d, game.player.y + Math.sin(a) * d, '#e74c3c'));
                game.projectiles.push(new EnemyProjectile(game.player.x + Math.cos(a) * d, game.player.y + Math.sin(a) * d, 0, 50));
            }
        },
    },
];

// ==========================================
// 12. UI
// ==========================================
const UI = {
    drawHUD(ctx, player, game) {
        ctx.save();

        ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
        ctx.fillRect(20, 20, 220, 22);
        let hpRatio = clamp(player.hp / player.maxHp, 0, 1);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(20, 20, 220 * hpRatio, 22);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
        ctx.strokeRect(20, 20, 220, 22);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`HP: ${Math.ceil(player.hp)} / ${player.maxHp}`, 28, 36);

        ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
        ctx.fillRect(20, 47, 220, 14);
        let manaRatio = clamp(player.mana / player.maxMana, 0, 1);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(20, 47, 220 * manaRatio, 14);
        ctx.strokeRect(20, 47, 220, 14);
        ctx.font = '10px sans-serif';
        ctx.fillText(`Mana: ${Math.ceil(player.mana)} / ${player.maxMana}`, 28, 58);

        let barW = Math.min(400, canvas.width - 100);
        let barX = canvas.width / 2 - barW / 2;
        ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
        ctx.fillRect(barX, 15, barW, 16);
        let xpRatio = clamp(player.xp / player.xpToNextLevel, 0, 1);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(barX, 15, barW * xpRatio, 16);
        ctx.strokeStyle = '#f1c40f';
        ctx.strokeRect(barX, 15, barW, 16);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`NÍVEL ${player.level} (${Math.floor(player.xp)} / ${player.xpToNextLevel} XP)`, canvas.width / 2, 27);
        ctx.textAlign = 'left';

        ctx.font = 'bold 16px sans-serif'; ctx.fillStyle = '#f1c40f';
        ctx.fillText(`Onda: ${game.wave}`, 20, 88);
        ctx.fillText(`Pontos: ${game.score}`, 20, 110);
        ctx.fillStyle = '#f1c40f';
        ctx.fillText(`Moedas: ${META.coins}`, 20, 132);
        if (game.combo > 1) {
            ctx.fillStyle = '#e67e22';
            ctx.fillText(`COMBO x${game.combo}!`, 20, 152);
        }

        let qStatus = player.skillQCooldown > 0 ? `${player.skillQCooldown.toFixed(1)}s` : 'PRONTO';
        let dashStatus = player.dashCooldown > 0 ? `${player.dashCooldown.toFixed(1)}s` : 'PRONTO';
        ctx.font = '12px sans-serif';
        ctx.fillStyle = player.skillQCooldown > 0 ? '#bdc3c7' : '#2ecc71';
        ctx.fillText(`[Q] Habilidade: ${qStatus}`, 20, 157);
        ctx.fillStyle = player.dashCooldown > 0 ? '#bdc3c7' : '#2ecc71';
        ctx.fillText(`[SHIFT] Dash: ${dashStatus}`, 20, 177);

        if (game.eventBanner) {
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(canvas.width / 2 - 220, 50, 440, 40);
            ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 18px sans-serif';
            ctx.fillText(game.eventBanner.name + ' — ' + game.eventBanner.desc, canvas.width / 2, 75);
            ctx.textAlign = 'left';
        }

        // Dica contextual nos primeiros segundos
        if (game.wave === 1 && game.score < 30) {
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '14px sans-serif';
            ctx.fillText('Derrote inimigos para coletar moedas e subir de nível!', canvas.width / 2, canvas.height - 30);
            ctx.textAlign = 'left';
        }

        ctx.restore();
    },

    drawMinimap(ctx, game) {
        let size = 140;
        let mx = canvas.width - size - 15;
        let my = 15;
        ctx.save();
        ctx.fillStyle = 'rgba(15,15,25,0.7)';
        ctx.fillRect(mx, my, size, size);
        ctx.strokeStyle = '#34495e';
        ctx.strokeRect(mx, my, size, size);
        // player no centro
        ctx.fillStyle = '#3498db';
        ctx.beginPath(); ctx.arc(mx + size/2, my + size/2, 4, 0, TAU); ctx.fill();
        // inimigos
        game.enemies.forEach(e => {
            let dx = (e.x - game.player.x) / 8;
            let dy = (e.y - game.player.y) / 8;
            if (Math.abs(dx) < size/2 && Math.abs(dy) < size/2) {
                ctx.fillStyle = e.type === 'boss' ? '#ff0000' : '#e74c3c';
                ctx.beginPath(); ctx.arc(mx + size/2 + dx, my + size/2 + dy, 3, 0, TAU); ctx.fill();
            }
        });
        ctx.restore();
    },

    drawMainMenu(ctx, game) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 15, 25, 0.92)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#3498db'; ctx.font = 'bold 52px sans-serif';
        ctx.fillText('SHADOW DUNGEON', canvas.width / 2, canvas.height / 2 - 160);

        ctx.fillStyle = '#bdc3c7'; ctx.font = '16px sans-serif';
        ctx.fillText('Controles: WASD (Andar) | Mouse (Mirar e Atacar)', canvas.width / 2, canvas.height / 2 - 100);
        ctx.fillText('SHIFT (Dash) | Q (Habilidade de Área)', canvas.width / 2, canvas.height / 2 - 75);

        ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`Moedas: ${META.coins}   |   Melhor Onda: ${META.bestWave}   |   Abates: ${META.totalKills}`, canvas.width / 2, canvas.height / 2 - 40);

        let btnW = 260, btnH = 50;
        let btnX = canvas.width / 2 - btnW / 2;
        let btnY = canvas.height / 2 + 10;
        let isHover = game.mouseX >= btnX && game.mouseX <= btnX + btnW && game.mouseY >= btnY && game.mouseY <= btnY + btnH;
        ctx.fillStyle = isHover ? '#27ae60' : '#2ecc71';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.strokeRect(btnX, btnY, btnW, btnH);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px sans-serif';
        ctx.fillText('INICIAR JOGO', canvas.width / 2, btnY + 32);
        game.mainMenuBtnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };

        // Botão Loja
        let shopY = btnY + 70;
        let isHoverShop = game.mouseX >= btnX && game.mouseX <= btnX + btnW && game.mouseY >= shopY && game.mouseY <= shopY + btnH;
        ctx.fillStyle = isHoverShop ? '#2471a3' : '#2980b9';
        ctx.fillRect(btnX, shopY, btnW, btnH);
        ctx.strokeRect(btnX, shopY, btnW, btnH);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('UPGRADES PERMANENTES', canvas.width / 2, shopY + 32);
        game.shopBtnBounds = { x: btnX, y: shopY, w: btnW, h: btnH };

        ctx.restore();
    },

    drawShop(ctx, game) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 34px sans-serif';
        ctx.fillText('UPGRADES PERMANENTES', canvas.width / 2, 70);
        ctx.fillStyle = '#f1c40f'; ctx.font = '18px sans-serif';
        ctx.fillText(`Suas moedas: ${META.coins}`, canvas.width / 2, 105);

        let cardW = 180, cardH = 150;
        let cols = 3;
        let gap = 20;
        let totalW = cols * cardW + (cols - 1) * gap;
        let startX = canvas.width / 2 - totalW / 2;
        let startY = 140;

        game.shopCardBounds = [];
        for (let i = 0; i < META_UPGRADES.length; i++) {
            let u = META_UPGRADES[i];
            let lvl = META.levels[u.key];
            let cost = u.cost(lvl);
            let cx = startX + (i % cols) * (cardW + gap);
            let cy = startY + Math.floor(i / cols) * (cardH + gap);

            let isHover = game.mouseX >= cx && game.mouseX <= cx + cardW && game.mouseY >= cy && game.mouseY <= cy + cardH;
            ctx.fillStyle = isHover ? 'rgba(52,152,219,0.9)' : 'rgba(30,40,60,0.9)';
            ctx.fillRect(cx, cy, cardW, cardH);
            ctx.strokeStyle = isHover ? '#f1c40f' : '#34495e';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx, cy, cardW, cardH);

            ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 16px sans-serif';
            ctx.fillText(u.name, cx + cardW / 2, cy + 30);
            ctx.fillStyle = '#ecf0f1'; ctx.font = '13px sans-serif';
            ctx.fillText(u.desc, cx + cardW / 2, cy + 60);
            ctx.fillText(`Nível: ${lvl}`, cx + cardW / 2, cy + 85);
            ctx.fillStyle = META.coins >= cost ? '#2ecc71' : '#e74c3c';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText(`Custo: ${cost} moedas`, cx + cardW / 2, cy + 115);

            game.shopCardBounds.push({ x: cx, y: cy, w: cardW, h: cardH, upgrade: u, cost });
        }

        // Botão Voltar
        let backW = 160, backH = 42;
        let backX = canvas.width / 2 - backW / 2;
        let backY = canvas.height - 80;
        let isHoverBack = game.mouseX >= backX && game.mouseX <= backX + backW && game.mouseY >= backY && game.mouseY <= backY + backH;
        ctx.fillStyle = isHoverBack ? '#c0392b' : '#e74c3c';
        ctx.fillRect(backX, backY, backW, backH);
        ctx.strokeRect(backX, backY, backW, backH);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif';
        ctx.fillText('VOLTAR', canvas.width / 2, backY + 27);
        game.shopBackBounds = { x: backX, y: backY, w: backW, h: backH };

        ctx.restore();
    },

    drawLevelUpMenu(ctx, game) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 38px sans-serif';
        ctx.fillText('NÍVEL ALCANÇADO!', canvas.width / 2, 110);
        ctx.fillStyle = '#ffffff'; ctx.font = '18px sans-serif';
        ctx.fillText('Escolha uma melhoria para o seu personagem:', canvas.width / 2, 145);

        let cardW = 220, cardH = 260;
        let startX = canvas.width / 2 - (3 * cardW + 2 * 30) / 2;
        let cardY = canvas.height / 2 - cardH / 2 + 30;
        game.levelUpCardBounds = [];

        for (let i = 0; i < game.currentUpgrades.length; i++) {
            let item = game.currentUpgrades[i];
            let cx = startX + i * (cardW + 30);
            let isHover = game.mouseX >= cx && game.mouseX <= cx + cardW && game.mouseY >= cardY && game.mouseY <= cardY + cardH;
            ctx.fillStyle = isHover ? 'rgba(52,152,219,0.95)' : 'rgba(30,40,60,0.9)';
            ctx.fillRect(cx, cardY, cardW, cardH);
            ctx.strokeStyle = isHover ? '#f1c40f' : '#34495e';
            ctx.lineWidth = isHover ? 3 : 2;
            ctx.strokeRect(cx, cardY, cardW, cardH);
            ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 20px sans-serif';
            ctx.fillText(item.name, cx + cardW / 2, cardY + 50);
            ctx.fillStyle = '#ecf0f1'; ctx.font = '15px sans-serif';
            ctx.fillText(item.desc, cx + cardW / 2, cardY + 120);
            ctx.fillStyle = isHover ? '#ffffff' : '#bdc3c7';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('Clique para Selecionar', cx + cardW / 2, cardY + cardH - 30);
            game.levelUpCardBounds.push({ x: cx, y: cardY, w: cardW, h: cardH, item });
        }
        ctx.restore();
    },

    drawPauseMenu(ctx, game) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText('PAUSADO', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px sans-serif';
        ctx.fillText('Pressione ESC para continuar', canvas.width / 2, canvas.height / 2 + 20);
        ctx.restore();
    },

    drawGameOver(ctx, game) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.88)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 50px sans-serif';
        ctx.fillText('VOCÊ MORREU', canvas.width / 2, canvas.height / 2 - 100);
        ctx.fillStyle = '#ffffff'; ctx.font = '18px sans-serif';
        ctx.fillText(`Onda: ${game.wave}  |  Pontos: ${game.score}  |  Nível: ${game.player.level}`, canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillStyle = '#f1c40f';
        ctx.fillText(`Moedas coletadas nesta run: ${game.runCoins}  |  Total: ${META.coins}`, canvas.width / 2, canvas.height / 2 - 20);

        let btn1W = 200, btnH = 45;
        let btn1X = canvas.width / 2 - btn1W - 15;
        let btnY = canvas.height / 2 + 20;
        let isHover1 = game.mouseX >= btn1X && game.mouseX <= btn1X + btn1W && game.mouseY >= btnY && game.mouseY <= btnY + btnH;
        ctx.fillStyle = isHover1 ? '#27ae60' : '#2ecc71';
        ctx.fillRect(btn1X, btnY, btn1W, btnH);
        ctx.strokeRect(btn1X, btnY, btn1W, btnH);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif';
        ctx.fillText('TENTAR NOVAMENTE', btn1X + btn1W / 2, btnY + 28);

        let btn2X = canvas.width / 2 + 15;
        let isHover2 = game.mouseX >= btn2X && game.mouseX <= btn2X + btn1W && game.mouseY >= btnY && game.mouseY <= btnY + btnH;
        ctx.fillStyle = isHover2 ? '#c0392b' : '#e74c3c';
        ctx.fillRect(btn2X, btnY, btn1W, btnH);
        ctx.strokeRect(btn2X, btnY, btn1W, btnH);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('MENU PRINCIPAL', btn2X + btn1W / 2, btnY + 28);

        game.gameOverBtnBounds = {
            retry: { x: btn1X, y: btnY, w: btn1W, h: btnH },
            menu: { x: btn2X, y: btnY, w: btn1W, h: btnH },
        };
        ctx.restore();
    },
};

// ==========================================
// 13. GAME
// ==========================================
class Game {
    constructor() {
        this.state = 'MENU';
        this.player = new Player();
        this.enemies = [];
        this.floatingTexts = [];
        this.areaSkills = [];
        this.coins = [];
        this.hearts = [];
        this.shields = [];
        this.projectiles = [];
        this.particles = [];
        this.shake = 0;
        this.keys = {};
        this.score = 0;
        this.wave = 1;
        this.spawnTimer = 0;
        this.runCoins = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.eventTimer = rand(15, 30);
        this.eventBanner = null;
        this.eventBannerTimer = 0;
        this.waveInProgress = false;
        this.waveKills = 0;
        this.waveKillsNeeded = 5;

        this.mouseX = canvas.width / 2;
        this.mouseY = canvas.height / 2;
        this.isMouseDown = false;

        this.currentUpgrades = [];
        this.levelUpCardBounds = [];
        this.shopCardBounds = [];

        window.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        window.addEventListener('mousedown', e => {
            if (e.button === 0) { this.isMouseDown = true; this.handleMouseClick(); }
        });
        window.addEventListener('mouseup', e => { if (e.button === 0) this.isMouseDown = false; });
        window.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            if (e.key === 'Escape') {
                if (this.state === 'PLAYING') this.state = 'PAUSED';
                else if (this.state === 'PAUSED') this.state = 'PLAYING';
            }
        });
        window.addEventListener('keyup', e => this.keys[e.key] = false);
    }

    startNewGame() {
        this.player.reset();
        this.enemies = [];
        this.floatingTexts = [];
        this.areaSkills = [];
        this.coins = [];
        this.hearts = [];
        this.shields = [];
        this.projectiles = [];
        this.particles = [];
        this.shake = 0;
        this.score = 0;
        this.wave = 1;
        this.spawnTimer = 0;
        this.runCoins = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.eventTimer = rand(15, 30);
        this.eventBanner = null;
        this.eventBannerTimer = 0;
        this.state = 'PLAYING';
        this.waveKills = 0;
        this.waveKillsNeeded = 5 + this.wave * 2;
    }

    openLevelUpMenu() {
        this.state = 'LEVEL_UP';
        let shuffled = [...UPGRADES_POOL].sort(() => 0.5 - Math.random());
        this.currentUpgrades = shuffled.slice(0, 3);
    }

    handleMouseClick() {
        if (this.state === 'MENU' && this.mainMenuBtnBounds) {
            let b = this.mainMenuBtnBounds;
            if (this.mouseX >= b.x && this.mouseX <= b.x + b.w && this.mouseY >= b.y && this.mouseY <= b.y + b.h) this.startNewGame();
            if (this.shopBtnBounds) {
                let s = this.shopBtnBounds;
                if (this.mouseX >= s.x && this.mouseX <= s.x + s.w && this.mouseY >= s.y && this.mouseY <= s.y + s.h) this.state = 'SHOP';
            }
        } else if (this.state === 'SHOP') {
            if (this.shopCardBounds) {
                this.shopCardBounds.forEach(card => {
                    if (this.mouseX >= card.x && this.mouseX <= card.x + card.w && this.mouseY >= card.y && this.mouseY <= card.y + card.h) {
                        if (META.coins >= card.cost) {
                            META.coins -= card.cost;
                            META.levels[card.upgrade.key]++;
                            saveMeta();
                        }
                    }
                });
            }
            if (this.shopBackBounds) {
                let b = this.shopBackBounds;
                if (this.mouseX >= b.x && this.mouseX <= b.x + b.w && this.mouseY >= b.y && this.mouseY <= b.y + b.h) this.state = 'MENU';
            }
        } else if (this.state === 'LEVEL_UP' && this.levelUpCardBounds.length > 0) {
            this.levelUpCardBounds.forEach(card => {
                if (this.mouseX >= card.x && this.mouseX <= card.x + card.w && this.mouseY >= card.y && this.mouseY <= card.y + card.h) {
                    card.item.apply(this.player);
                    this.state = 'PLAYING';
                }
            });
        } else if (this.state === 'GAME_OVER' && this.gameOverBtnBounds) {
            let r = this.gameOverBtnBounds.retry;
            let m = this.gameOverBtnBounds.menu;
            if (this.mouseX >= r.x && this.mouseX <= r.x + r.w && this.mouseY >= r.y && this.mouseY <= r.y + r.h) this.startNewGame();
            else if (this.mouseX >= m.x && this.mouseX <= m.x + m.w && this.mouseY >= m.y && this.mouseY <= m.y + m.h) this.state = 'MENU';
        }
    }

    triggerAreaSkill(x, y) {
        this.areaSkills.push(new AreaSkill(x, y));
        this.enemies.forEach(e => {
            if (e.spawnTimer > 0) return;
            let d = dist(e.x, e.y, x, y);
            if (d < 140) {
                let dmg = 50 * this.player.damageMultiplier;
                e.hp -= dmg;
                e.flashTimer = 0.1;
                if (this.player.lifesteal > 0) this.player.hp = Math.min(this.player.maxHp, this.player.hp + dmg * this.player.lifesteal);
                this.addFloatingText(e.x, e.y, `${Math.round(dmg)}`, '#9b59b6', true);
            }
        });
    }

    addFloatingText(x, y, text, color, isCrit = false) {
        this.floatingTexts.push(new FloatingText(x, y, text, color, isCrit));
    }

    spawnEnemies(dt) {
        this.spawnTimer += dt;
        let interval = Math.max(0.5, 2.3 - this.wave * 0.15);
        if (this.spawnTimer >= interval) {
            this.spawnTimer = 0;
            let angle = rand(0, TAU);
            let d = 520 + rand(0, 100);
            let ex = this.player.x + Math.cos(angle) * d;
            let ey = this.player.y + Math.sin(angle) * d;

            let type = 'normal';
            let r = Math.random();
            if (r < 0.20) type = 'fast';
            else if (r < 0.36) type = 'shadow';
            else if (r < 0.50) type = 'tank';
            else if (r < 0.62) type = 'ranged';
            else if (r < 0.74) type = 'healer';
            else if (r < 0.86) type = 'bomber';
            else if (r < 0.94) type = 'splitter';
            else if (r < 1.0) type = 'blink';

            // A cada 5 ondas, chance de boss
            if (this.wave % 5 === 0 && Math.random() < 0.3) type = 'boss';

            this.enemies.push(new Enemy(ex, ey, type));
        }
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        this.player.update(this.keys, this, dt);

        if (this.player.hp <= 0) {
            this.state = 'GAME_OVER';
            META.totalKills += this.score; // aproximação simples
            if (this.wave > META.bestWave) META.bestWave = this.wave;
            saveMeta();
            return;
        }

        this.spawnEnemies(dt);

        // Eventos aleatórios
        this.eventTimer -= dt;
        if (this.eventTimer <= 0) {
            this.eventTimer = rand(15, 30);
            let ev = RANDOM_EVENTS[randi(0, RANDOM_EVENTS.length - 1)];
            ev.apply(this);
            this.eventBanner = ev;
            this.eventBannerTimer = 3;
            sounds.event();
        }
        if (this.eventBannerTimer > 0) {
            this.eventBannerTimer -= dt;
            if (this.eventBannerTimer <= 0) this.eventBanner = null;
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            e.update(this.player, dt, this);
            if (e.hp <= 0) {
                this.combo++;
                this.comboTimer = 3;
                let comboMult = 1 + (this.combo - 1) * 0.1;
                this.score += Math.round(e.scoreValue * comboMult);
                META.totalKills++;
                this.player.addXp(e.xpValue, this);
                if (this.combo > 1) {
                    this.addFloatingText(e.x, e.y - 30, `COMBO x${this.combo}!`, '#e67e22', true);
                }

                // Partículas de morte + screen shake
                for (let p = 0; p < 10; p++) this.particles.push(new Particle(e.x, e.y, e.color));
                this.shake = 0.15;

                // Boss: muito XP, muitas moedas e um poder novo
                if (e.type === 'boss') {
                    this.player.addXp(e.xpValue * 2, this);
                    this.score += 200;
                    for (let c = 0; c < 20; c++) {
                        this.coins.push(new Coin(e.x + rand(-20, 20), e.y + rand(-20, 20), randi(1, 3)));
                    }
                    // Poder novo aleatório
                    let upgrade = UPGRADES_POOL[randi(0, UPGRADES_POOL.length - 1)];
                    upgrade.apply(this.player);
                    this.addFloatingText(e.x, e.y - 40, `BOSS DERROTADO! PODER: ${upgrade.name}`, '#f1c40f', true);
                    sounds.levelUp();
                }

                // Splitter: divide em 2 pequenos ao morrer
                if (e.config.splitter) {
                    for (let s = 0; s < 2; s++) {
                        let ne = new Enemy(e.x + rand(-20, 20), e.y + rand(-20, 20), 'fast');
                        ne.maxHp = 10; ne.hp = 10; ne.size = 30;
                        this.enemies.push(ne);
                    }
                }

                // Drop de moedas
                let coinCount = e.type === 'boss' ? 0 : randi(1, 3);
                if (this.goldRush) coinCount *= 2;
                // Bônus de sorte
                if (player.luck > 0) coinCount = Math.round(coinCount * (1 + player.luck * 0.15));
                for (let c = 0; c < coinCount; c++) {
                    this.coins.push(new Coin(e.x + rand(-10, 10), e.y + rand(-10, 10), 1));
                }
                this.runCoins += coinCount;

                // Chance de drop de cura (25%)
                if (Math.random() < 0.25) {
                    this.hearts.push(new Heart(e.x, e.y));
                }
                // Chance de drop de escudo (8%)
                if (Math.random() < 0.08) {
                    this.shields.push(new Shield(e.x, e.y));
                }

                this.enemies.splice(i, 1);
                // Rastro de kills e kill streak
                player.killStreak++;
                player.killStreakTimer = 5.0;
                if (player.killStreak > (META.bestWave || 0)) {
                    META.bestWave = player.killStreak;
                }
                // Dar XP pelo kill
                player.addXp(e.xpValue, this);

        for (let i = this.areaSkills.length - 1; i >= 0; i--) {
            this.areaSkills[i].update(dt);
            if (this.areaSkills[i].life <= 0) this.areaSkills.splice(i, 1);
        }
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            this.floatingTexts[i].update(dt);
            if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
        }
        for (let i = this.coins.length - 1; i >= 0; i--) {
            this.coins[i].update(this.player, dt);
            if (this.coins[i].life <= 0) this.coins.splice(i, 1);
        }
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            this.hearts[i].update(this.player, dt);
            if (this.hearts[i].life <= 0) this.hearts.splice(i, 1);
        }
        for (let i = this.shields.length - 1; i >= 0; i--) {
            this.shields[i].update(this.player, dt);
            if (this.shields[i].life <= 0) this.shields.splice(i, 1);
        }
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update(this.player, dt, this);
            if (this.projectiles[i].life <= 0) this.projectiles.splice(i, 1);
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }
        if (this.shake > 0) this.shake -= dt;
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) this.combo = 0;
        }

        // Próxima onda
        if (this.score > this.wave * 180) {
            this.wave++;
            this.addFloatingText(this.player.x, this.player.y - 50, `ONDA ${this.wave}!`, '#f1c40f', true);
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
            ctx.fillStyle = '#1e272c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 1;
            let gridSize = 64;
            let offsetX = (-cameraX + canvas.width / 2) % gridSize;
            let offsetY = (-cameraY + canvas.height / 2) % gridSize;
            for (let x = offsetX; x < canvas.width; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
            for (let y = offsetY; y < canvas.height; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let cameraX = this.player.x + (this.shake > 0 ? rand(-6, 6) : 0);
        let cameraY = this.player.y + (this.shake > 0 ? rand(-6, 6) : 0);
        this.drawBackground(cameraX, cameraY);

        // Tom de fundo varia conforme a onda (fica mais escuro/avermelhado)
        let tint = (this.wave % 4);
        if (tint === 1) {
            ctx.fillStyle = 'rgba(80, 0, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (tint === 2) {
            ctx.fillStyle = 'rgba(0, 0, 80, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (tint === 3) {
            ctx.fillStyle = 'rgba(40, 40, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (this.state === 'PLAYING' || this.state === 'LEVEL_UP' || this.state === 'PAUSED') {
            this.areaSkills.forEach(s => s.draw(cameraX, cameraY));
            this.coins.forEach(c => c.draw(cameraX, cameraY));
            this.hearts.forEach(h => h.draw(cameraX, cameraY));
            this.shields.forEach(s => s.draw(cameraX, cameraY));
            this.projectiles.forEach(p => p.draw(cameraX, cameraY));
            this.particles.forEach(p => p.draw(cameraX, cameraY));
            this.enemies.forEach(e => e.draw(cameraX, cameraY));
            this.player.draw(cameraX, cameraY);
            this.floatingTexts.forEach(ft => ft.draw(cameraX, cameraY));
            UI.drawHUD(ctx, this.player, this);
            UI.drawMinimap(ctx, this);
            if (this.state === 'LEVEL_UP') UI.drawLevelUpMenu(ctx, this);
            if (this.state === 'PAUSED') UI.drawPauseMenu(ctx, this);
        } else if (this.state === 'MENU') {
            UI.drawMainMenu(ctx, this);
        } else if (this.state === 'SHOP') {
            UI.drawShop(ctx, this);
        } else if (this.state === 'GAME_OVER') {
            this.areaSkills.forEach(s => s.draw(cameraX, cameraY));
            this.enemies.forEach(e => e.draw(cameraX, cameraY));
            this.player.draw(cameraX, cameraY);
            UI.drawGameOver(ctx, this);
        }
    }
}

// ==========================================
// 14. LOOP COM DELTA TIME
// ==========================================
// ==========================================
// 15. FIM DO ARQUIVO — REFERÊNCIA RÁPIDA
// ==========================================
//
// ----------------------------------------------------------------
// TABELA DE REFERÊNCIA DE STATS DOS INIMIGOS:
//  Normal  |  HP baixo | velo média | dano médio | melee
//  Fast    |  HP muito baixo | velo alta | dano baixo | melee
//  Tank    |  HP alto | velo baixa | dano alto | melee
//  Shadow  |  HP médio | velo média | dano alto | melee/ranged
//  Ranged  |  HP baixo | velo média | dano médio | atira projéteis
//  Bomber  |  HP médio | velo alta | dano altíssimo | explode
//  Splitter|  HP médio | velo média | dano baixo | divide ao morrer
//  Healer  |  HP médio | velo média | dano baixo | cura aliados
//  Boss    |  HP muito alto | velo média | dano alto | fase 2 fúria
//
// ----------------------------------------------------------------
// TABELA DE REFERÊNCIA DE DROP:
//  Moedas  |  100% (1-10 conforme tipo)
//  Coração |  25% (+20 HP * healingMultiplier)
//  Escudo  |  8% (1 hit absorvido)
//
// ----------------------------------------------------------------
// TABELA DE REFERÊNCIA DE EVENTOS:
//  Chuva Dourada       | 8 moedas perto de você
//  Fonte de Cura       | 1 coração perto de você
//  Horda Sombria       | 6 inimigos normal
//  Adrenalina          | +50% velocidade por 5s
//  Surto de Experiência| +100 XP
//  Modo Vidro          | +100% dano por 8s
//  Ímã Supremo         | todas moedas atraem por 6s
//  Câmera Lenta        | inimigos 50% mais lentos por 6s
//  Corrida do Ouro     | moedas valem 2x por 10s
//  Invasão             | 8 inimigos fast
//  Onda de Cura        | +30 HP
//
// ----------------------------------------------------------------
// TABELA DE REFERÊNCIA DE UPGRADES DA RUN:
//  Força Bruta         | +20% dano
//  Vitalidade          | +25 HP máx
//  Passo Ágil          | +12% velocidade
//  Oitenta ou Oitenta  | +10% crítico
//  Reflexos            | +20% atk speed
//  Fluxo Mágico        | +50% mana regen
//  Vampirismo          | +5% lifesteal
//  Espinhos            | +15 dano refletivo
//  Lâmina Dupla        | +1 projétil de Q
//  Reserva Arcana      | +20 mana máx
//  Relâmpago           | -25% cooldown dash
//  Coração Jovem       | +50% cura de drops
//  Investida Gigante   | dash causa dano
//  Ricochete           | +1 alvo
//  Regeneração         | +1 HP/s
//  Fúria               | +30% dano após 5 abates
//  Evasivo             | dash 50% menor
//  Fortaleza           | +50 HP máx
//
// ----------------------------------------------------------------
// TABELA DE REFERÊNCIA DE UPGRADES PERMANENTES:
//  Coração de Pedra    | +20 HP máx
//  Lâmina Afiada       | +10% dano
//  Botas de Vento      | +6% velocidade
//  Cabeça Brilhante    | +15% XP
//  Ímã Rúnico          | +30% magnet
//  Frasco Eterno       | +30 mana máx
//  Olho de Águia       | +5% crítico
//  Sangue Fresco       | +2% lifesteal
//  Couragem            | +5 dano refletivo
//
// ----------------------------------------------------------------
// SOLUÇÕES DE PROBLEMAS:
//  * Tela preta? Verifique o console (F12) por erros.
//  * Sem áudio? Clique ou tecle algo primeiro.
//  * Sprites não aparecem? O fallback desenha formas coloridas.
//  * Progresso não salva? localStorage pode estar bloqueado.
//  * Jogo lento? Diminua a quantidade de partículas/inimigos.
//
// ----------------------------------------------------------------
// CHEAT SHEET PARA TESTES NO CONSOLE DO NAVEGADOR:
//  * META.coins += 999           -> ganhar muitas moedas
//  * META.levels.hp = 5          -> subir upgrade permanente
//  * game.player.hp = 9999       -> vida infinita (sessão)
//  * game.score = 9999           -> ir para ondas altas
//
// ----------------------------------------------------------------
// COMO RODAR/TESTAR:
//  1. Abra index.html no navegador (duplo clique), ou
//  2. Rode um servidor local na pasta do jogo:
//     - Python:  python -m http.server 8000
//     - Node:    npx serve .
//  3. Acesse http://localhost:8000 no navegador.
//
// ----------------------------------------------------------------
// DICAS FINAIS:
//  * Este jogo é single-player, dark fantasy, estilo arcade.
//  * O objetivo é sobreviver o máximo de ondas possível.
//  * Cada morte = uma chance de melhorar permanentemente.
//  * Experimente diferentes builds de upgrades na mesma run.
//  * Use o dash para fugir e o Q para limpar grupos.
//  * Priorize moedas para upgrades permanentes cedo.
//  * A cada 5 ondas, prepare-se para o boss.
//
// ----------------------------------------------------------------
// GLOSSÁRIO:
//  * Run: uma partida do começo ao fim.
//  * Meta: progressão entre runs (upgrades permanentes).
//  * Level Up: subir de nível durante a run.
//  * Wave/Onda: grupo de inimigos por nível de dificuldade.
//  * Boss: inimigo especial a cada 5 ondas.
//  * Drop: item que inimigo deixa ao morrer.
//  * Magnet: raio que puxa moedas.
//  * Lifesteal: dano que vira cura.
//  * Thorns: dano refletido ao tocar.
//  * HP Regen: regenera vida com o tempo.
//  * Mana: recurso da habilidade Q.
//  * Dash: esquiva veloz com cooldown.
//  * Crit: ataque com dano dobrado.
//  * Ataque em arco: cone de dano da espada.
//  * Spawn: surgimento de inimigos (animação de crescer).
//  * Screen shake: tremor de tela.
//  * Banner: aviso no topo da tela.
//  * Combo: sequência de abates.
//  * Gold Rush: moedas valem 2x.
//  * Invasão: horda de inimigos fast.
//  * Escudo: absorve 1 hit.
//  * Heart/Coração: cura.
//  * Coin/Moeda: moeda para meta upgrades.
//  * XP: experiência para subir de nível.
//  * Level: nível do personagem na run.
//  * Score: pontuação.
//  * Game Over: tela de morte.
//  * Menu: tela inicial.
//  * Shop: loja de upgrades permanentes.
//  * Paused: jogo pausado.
//  * Player: jogador.
//  * Enemy: inimigo.
//  * Fast/Tank/Shadow/Ranged/Bomber/Splitter/Healer/Boss: tipos.
//  * Cooldown: tempo até usar de novo.
//  * CooldownMax: cooldown inicial.
//  * DamageMultiplier: multiplicador de dano.
//  * CritChance: chance de crítico.
//  * AttackSpeedMultiplier: multiplicador de velocidade de ataque.
//  * HealingMultiplier: multiplicador de cura.
//  * XpMultiplier: multiplicador de XP.
//  * CoinMagnet: raio de atração.
//  * DashDamage: dano do dash.
//  * BonusTargets: alvos extras.
//  * HpRegen: regen de HP.
//  * HasShield: escudo ativo.
//  * FuryLevel: upgrade de fúria.
//
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ÚLTIMAS DICAS DE IMPLEMENTAÇÃO:
//  * Para balancear melhor, ajuste os valores de ENEMY_TYPES.
//  * Para deixar o jogo mais fácil, reduza o dano dos inimigos.
//  * Para deixar mais difícil, aumente speed e hp dos inimigos.
//  * Para mais moedas, aumente o randi() no drop de moedas.
//  * Para mais curas, aumente a chance de 0.25 para 0.40.
//  * Para mais drops de escudo, aumente a chance de 0.08.
//  * Para ondas mais rápidas, reduza o 2.3 em spawnEnemies.
//  * Para ondas mais lentas, aumente o 2.3 em spawnEnemies.
//  * Para XP mais rápido, reduza o 1.4 em addXp.
//  * Para XP mais lento, aumente o 1.4 em addXp.
//  * Para deixar o dash mais forte, aumente 2.8 no multiplicador.
//  * Para deixar a habilidade Q mais forte, aumente 50 em triggerAreaSkill.
//  * Para deixar o ataque mais forte, aumente 20 em performSwordAttack.
//  * Para aumentar o raio da espada, aumente 65 em swordArc.
//  * Para aumentar o raio da habilidade Q, aumente 140 em AreaSkill.
//  * Para aumentar o alcance do magnet de moedas, aumente 60 em coinMagnet.
//  * Para mais eventos, reduza o rand(15,30) em eventTimer.
//  * Para menos eventos, aumente o rand(15,30) em eventTimer.
//  * Para mais inimigos por onda, reduza o 180 em wave * 180.
//  * Para menos inimigos por onda, aumente o 180 em wave * 180.
//  * Para iniciar com mais mana, aumente 45 em this.mana.
//  * Para regenerar mana mais rápido, aumente 3 em manaRegenRate.
//  * Para atacar mais rápido, reduza 0.45 em attackCooldown.
//  * Para atacar mais devagar, aumente 0.45 em attackCooldown.
//  * Para mais HP, aumente 100 em this.maxHp.
//  * Para menos HP, reduza 100 em this.maxHp.
//
// ----------------------------------------------------------------
// BOA SORTE! (e que os sprites carreguem direito :D)
//
// ================================================================

// ==========================================
// 16. INICIALIZAÇÃO E LOOP DO JOGO
// ==========================================
const game = new Game();
let lastTime = performance.now();

function loop(now) {
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.05) dt = 0.05; // evita saltos grandes
    game.update(dt);
    game.draw();
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
