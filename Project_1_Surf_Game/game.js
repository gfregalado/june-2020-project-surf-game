class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.context = context;
    this.player = new Surfer(this);
    this.kook = new Kook(this);
    this.setKeyBindings();
    this.running = false;
    this.kooks = [];
    this.obstacleDelta = 1500;
    this.timer = 0;
    this.scoreboard = new Scoreboard(this);
    this.gameStarted = false;
    this.timeGameStarted = 0;
    //  this.waveImage = new Image();
    //  this.waveImage.src = '/images/wave_layer.png';
  }

  resetEverything() {
    this.player = new Surfer(this);
    this.kook = new Kook(this);
    this.running = false;
    this.kooks = [];
    this.obstacleDelta = 1500;
    this.timer = 0;
    this.gameStarted = false;
    this.timeGameStarted = 0;
    this.scoreboard.currentScore = 0;
    this.paintStartScreen();
  }

  paintStartScreen() {
    if (this.running === false) {
      this.context.fillStyle = 'white';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = 'salmon';
      this.context.font = '50px courier';
      this.context.fillText("Let's Shred", 350, 120);
      this.context.font = '30px courier';
      this.context.fillText('🤙🏼 🏄🏽‍♂️ ☀️', 450, 180);
      this.context.fillStyle = 'salmon';
      this.context.font = '20px courier';
      this.context.fillText('PRESS SPACE', 450, 220);
    }
  }

  paintEndGame() {
    if (this.running === false) {
      this.context.fillStyle = 'white';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = 'salmon';
      this.context.font = '50px courier';
      this.context.fillText('That was gnarly!', 275, 90);
      this.context.fillStyle = 'teal';
      this.context.font = '20px courier';
      this.context.fillText(
        'You were a surf legend for ' +
          this.scoreboard.currentScore +
          ' seconds',
        290,
        130
      );
      this.context.fillStyle = 'salmon';
      this.context.font = '30px courier';
      this.context.fillText('🤙🏼 🏄🏽‍♂️ ☀️', 440, 180);
      this.context.font = '20px courier';
      this.context.fillText('PRESS ENTER TO TRY AGAIN', 360, 220);
    }
  }

  setKeyBindings() {
    window.addEventListener('keydown', event => {
      const key = event.keyCode;
      switch (key) {
        case 38:
          this.player.surfY -= 15;
          break;
        case 40:
          this.player.surfY += 15;
          break;
        case 32:
          if (this.running === false) {
            this.running = true;
            this.gameStarted = true;
            this.loop();
          }
          break;
        case 13:
          this.resetEverything();
          this.running = true;
          this.gameStarted = true;
          this.loop();
          break;
      }
    });
  }

  addMoreKooks(timestamp) {
    if (this.timer < timestamp - this.obstacleDelta) {
      this.timer = timestamp;
      this.kooks.push(new Kook(this));
    }
  }

  increaseDifficulty() {
    if (!(this.scoreboard.currentScore % 5) && this.scoreboard.currentScore) {
      this.obstacleDelta = this.obstacleDelta / 1.002;
    }
  }

  lose() {
    this.running = false;
    clearInterval();
  }

  checkCollission() {
    for (let kook of this.kooks) {
      if (
        this.player.surfX < kook.kookX + kook.kookWidth &&
        this.player.surfX + this.player.playerWidth > kook.kookX &&
        this.player.surfY < kook.kookY + kook.kookHeight &&
        this.player.surfY + this.player.playerHeight > kook.kookY
      ) {
        this.lose();
      }
    }
  }

  checkSurfBail() {
    if (this.player.surfY + this.player.playerHeight > 300) {
      this.lose();
    }
  }

  runLogic(timestamp) {
    this.player.runLogic();
    for (let kook of this.kooks) {
      kook.runLogic();
    }
    this.checkCollission();
    this.checkSurfBail();
    if (this.gameStarted && timestamp) {
      this.timeGameStarted = timestamp;
      this.gameStarted = false;
    }
    this.addMoreKooks(timestamp - this.timeGameStarted);
    this.scoreboard.increaseScore(timestamp - this.timeGameStarted);
    this.increaseDifficulty();
  }

  clean() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  paint(timestamp) {
    if (this.running === true) {
      // this.context.drawImage(
      //   this.waveImage,
      //   0,
      //   0,
      //   this.canvas.width,
      //   this.canvas.height
      // );
      this.player.paint();
      for (let kook of this.kooks) {
        kook.paint();
      }
      this.scoreboard.paint();
    } else {
      this.paintEndGame();
    }
  }

  loop(timestamp) {
    this.runLogic(timestamp);
    this.clean();
    if (this.running === true) {
      window.requestAnimationFrame(timestamp => this.loop(timestamp));
    }
    this.paint(timestamp);
  }
}
