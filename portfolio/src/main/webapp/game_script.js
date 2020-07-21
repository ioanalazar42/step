var gameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 20);
    this.mouseControl = false;
    window.addEventListener('keydown', function (e) {
      gameArea.key = e.keyCode;
    })
    window.addEventListener('keyup', function (e) {
      const keycode_M = 77;
      if (gameArea.key == keycode_M) {
          gameArea.mouseControl = !gameArea.mouseControl;
      }
      gameArea.key = false;
    })
    window.addEventListener('mousemove', function (e) {
      gameArea.x = e.pageX;
      gameArea.y = e.pageY;
    })
  },
  clear : function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop : function() {
    clearInterval(this.interval);
  },
  updateInstructions : function() {
      instrUp.update();
      instrDown.update();
      instrMouse.update();
  }
} // gameArea

/* Returns true if the current frame number
   corresponds with the given interval */
function everyInterval(givenInterval) {
  return gameArea.frameNo % givenInterval == 0;
}

var player;
var obstacles = [];
var score;

/* multiple instruction boxes because
   canvas does not support multi-line */
var instrUp;
var instrDown;
var instrMouse;

const keyActions = {
  UP: "up",
  DOWN: "down"
}

function startGame() {
  player = new BoxComponent(30, 30, "red", 10, window.innerHeight/2);
  score = new TextComponent("SCORE: 0", "30px Consolas", "black", window.innerWidth - 200, 30);

  // unicodes for down and up arrows
  const upArrSymbol = "\u2B06";
  const downArrSymbol = "\u2B07";

  const instrUpTxt = "w/" + upArrSymbol + " > up";
  const instrDownTxt = "s/" + downArrSymbol + " > down";
  const instrMouseTxt = "m > on/off mouse control";

  // create a text component for each instruction box
  instrUp = new TextComponent(instrUpTxt, "20px Consolas", "black", window.innerWidth - 250, window.innerHeight - 90);
  instrDown = new TextComponent(instrDownTxt, "20px Consolas", "black", window.innerWidth - 250, window.innerHeight - 65);
  instrMouse = new TextComponent(instrMouseTxt, "20px Consolas", "black", window.innerWidth - 250, window.innerHeight - 40);

  gameArea.start();
}

/* Construct a text component with specific text
   font, color and coordinates where it is
   placed in the canvas */
function TextComponent(text, font, color, x, y) {
  this.text = text;
  this.x = x;
  this.y = y;
  this.update = function() {
      ctx = gameArea.context;
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.fillText(this.text, this.x, this.y);
    }
} // TextComponent

/* Construct a box component with specific width
   height, color and coordinates where it is
   placed in the canvas */
function BoxComponent(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.update = function() {
    ctx = gameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  } // update
  this.newPos = function() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (gameArea.x && gameArea.y && gameArea.mouseControl) {
      /* if mouse position exists and mouse control 
         is enabled set player y coord to mouse y coord
         - player only moves vertically*/
      this.y = gameArea.y;
    }
  } // newPos
  this.newSpeed = function() {
    this.speedX = 0;
    this.speedY = 0;

    keyPressed = getKey(gameArea.key);
    switch(keyPressed) {
      case keyActions.UP:
        this.speedY = -3;
        break;
      case keyActions.DOWN:
        this.speedY = 3;
        break;
      default:
        break;
    } // switch
  } // newSpeed
  this.crashWith = function(otherObj) {
    /* Get left, right, top, bottom for this object */
    var l = this.x;
    var r = this.x + (this.width);
    var top = this.y;
    var bttm = this.y + (this.height);

    /* Get left, right, top, bottom for other object */
    var otherL = otherObj.x;
    var otherR = otherObj.x + (otherObj.width);
    var otherTop = otherObj.y;
    var otherBttm = otherObj.y + (otherObj.height);

    return bttm >= otherTop && top <= otherBttm && r >= otherL && l <= otherR;
  } // crashWith 
} // BoxComponent

function updateGameArea() {
  if (crashOccurs()) {
    gameArea.stop();
    return;
  }

  gameArea.clear();

  /* count frames and add obstacle every 100th frame */
  gameArea.frameNo += 1;
  addObstacle();
  updateObstacles();

  score.text = "SCORE: " + gameArea.frameNo;
  score.update();

  gameArea.updateInstructions();

  player.newSpeed();
  player.newPos();
  player.update();
} // updateGameArea

/* Returns a string depending on the code of 'key' */
function getKey(key) {
  if (gameArea.key == 38 || gameArea.key == 87) {
    return keyActions.UP;
  } else if (gameArea.key == 40 || gameArea.key == 83) {
    return keyActions.DOWN;
  } else {
    return -1;
  }
} // getKey

/* Checks if player crashes with any of the obstacles */
function crashOccurs() {
  for (i = 0; i < obstacles.length; i += 1) {
    if (player.crashWith(obstacles[i])) {
      return true;
    } 
  }
  return false;
} // crashOccurs

function addObstacle() {
  var xObstacle;

  if (gameArea.frameNo == 1 || everyInterval(100)) {
    /* x coord <- width because new obstacle always spans at end of screen */
    xObstacle = gameArea.canvas.width;

    minHeight = gameArea.canvas.height/6;
    maxHeight = gameArea.canvas.height/2;
    height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

    minGap = 80;
    maxGap = gameArea.canvas.height/3;
    gap = gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

    obstacles.push(new BoxComponent(50, height, "green", xObstacle, 0));
    obstacles.push(new BoxComponent(50, xObstacle - height - gap, "green", xObstacle, height + gap));
  }
} // addObstacle

function updateObstacles() {
  for (i = 0; i < obstacles.length; i += 1) {
    obstacles[i].x += -5;
    obstacles[i].update();
  }
} // updateObstacles