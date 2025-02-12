class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        
        // Variáveis do jogo
        this.player; // Jogador
        this.obstacles; // Grupo de obstáculos
        this.powerUps; // Grupo de power-ups
        this.cursors; // Controles do jogador
        this.lives = 3; // Vidas iniciais
        this.score = 0; // Pontuação inicial
        this.scoreText; // Texto de pontuação
        this.livesText; // Texto de vidas
        this.gameOver = false; // Controle do estado do jogo
    }

    preload() {
        // Carregamento de assets (imagens e sons)
        this.load.image('player', 'assets/player.png');
        this.load.image('obstacle', 'assets/obstacle.png');
        this.load.image('powerUp', 'assets/powerUp.png');
        this.load.audio('bgMusic', 'assets/bgMusic.mp3');
        this.load.audio('collect', 'assets/collect.wav');
        this.load.audio('hit', 'assets/hit.wav');
        this.load.audio('gameOver', 'assets/gameOver.wav');
        this.load.audio('victory', 'assets/victory.wav');
    }

    create() {
        // Adiciona e toca a música de fundo
        this.bgMusic = this.sound.add('bgMusic', { loop: true });
        this.bgMusic.play();

        // Criação do jogador
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true); // Evita que o jogador saia da tela

        // Criação dos grupos de obstáculos e power-ups
        this.obstacles = this.physics.add.group();
        this.powerUps = this.physics.add.group();

        // Configuração dos controles
        this.cursors = this.input.keyboard.createCursorKeys();

        // Adiciona textos na tela
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        this.livesText = this.add.text(16, 50, 'Lives: 3', { fontSize: '32px', fill: '#000' });

        // Configuração de colisões
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);

        // Eventos para spawn de obstáculos e power-ups
        this.time.addEvent({ delay: 2000, callback: this.addObstacle, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 5000, callback: this.addPowerUp, callbackScope: this, loop: true });
    }

    update() {
        if (this.gameOver) return;

        const speed = 200;
        const deceleration = 0.95; // Redução gradual da velocidade para um movimento mais suave

        // Movimentação do jogador com desaceleração
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(this.player.body.velocity.x * deceleration);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        } else {
            this.player.setVelocityY(this.player.body.velocity.y * deceleration);
        }
    }

    addObstacle() {
        // Adiciona um obstáculo em uma posição aleatória e dá movimento a ele
        const x = Phaser.Math.Between(0, 800);
        const y = Phaser.Math.Between(0, 600);
        const obstacle = this.obstacles.create(x, y, 'obstacle');
        obstacle.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
        obstacle.setCollideWorldBounds(true);
        obstacle.setBounce(1); // Faz o obstáculo quicar nas bordas
    }

    addPowerUp() {
        let x, y;
        do {
            // Garante que os power-ups não apareçam sobre obstáculos
            x = Phaser.Math.Between(0, 800);
            y = Phaser.Math.Between(0, 600);
        } while (this.obstacles.getChildren().some(obstacle => Phaser.Math.Distance.Between(x, y, obstacle.x, obstacle.y) < 50));
        
        this.powerUps.create(x, y, 'powerUp');
    }

    hitObstacle(player, obstacle) {
        if (this.gameOver) return;
        
        this.sound.play('hit'); // Reproduz som de colisão
        this.lives -= 1; // Diminui uma vida
        this.livesText.setText('Lives: ' + this.lives); // Atualiza o texto das vidas

        if (this.lives <= 0) {
            this.endGame('Game Over', '#f00', 'gameOver'); // Encerra o jogo se as vidas chegarem a zero
        }
    }

    collectPowerUp(player, powerUp) {
        if (this.gameOver) return;
        
        this.sound.play('collect'); // Reproduz som de coleta
        powerUp.destroy(); // Remove o power-up da cena

        this.score += 1; // Aumenta a pontuação
        this.scoreText.setText('Score: ' + this.score); // Atualiza o texto da pontuação

        if (this.score >= 20) {
            this.endGame('Victory!', '#0f0', 'victory'); // Encerra o jogo se a pontuação atingir 20
        }
    }

    endGame(message, color, sound) {
        this.gameOver = true;
        this.sound.play(sound); // Reproduz som de fim de jogo
        this.bgMusic.stop(); // Para a música de fundo
        this.add.text(400, 300, message, { fontSize: '64px', fill: color }).setOrigin(0.5); // Exibe a mensagem
        this.physics.pause(); // Pausa a física do jogo
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Sem gravidade
            debug: false
        }
    },
    scene: MainScene
};

const game = new Phaser.Game(config); // Inicializa o jogo Phaser