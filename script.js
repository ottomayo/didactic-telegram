let canvas = document.getElementById('game_canvas');
let ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

let game = {};
game.bgImage = new Image();
game.bgImage.src = 'images/background2.png';
game.floorImage = new Image();
game.floorImage.src = 'images/floor.png';
game.menuImage = new Image();
game.menuImage.src = 'images/menu.png';

game.gravity = 1.5;
game.speed = 2;
game.score = 0;
game.start = true;

game.bg1x = 0;
game.bg2x = 600;
game.floor1x = 0;
game.floor2x = 1149;

game.mousePos = {x: 0, y: 0};
game.updateMousePos = function(e) {
    let rect = canvas.getBoundingClientRect();
    game.mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

game.clicking = false;
game.mouseDown = function(e) {
    game.clicking = true;
}
game.mouseUp = function(e) {
    game.clicking = false;
}

game.drawBackground = function() {
    // Draw background
    game.bg1x -= game.speed;
    game.bg2x -= game.speed;
    if(game.bg1x <= -600) {
        game.bg1x = 600;
    }
    if(game.bg2x <= -600) {
        game.bg2x = 600;
    }

    ctx.drawImage(game.bgImage, game.bg1x, 0, 600, 600);
    ctx.drawImage(game.bgImage, game.bg2x, 0, 600, 600);    
}
game.drawFloor = function() {
    // Draw floor
    game.floor1x -= game.speed;
    game.floor2x -= game.speed;
    if(game.floor1x <= -1149) {
        game.floor1x = 1149;
    }
    if(game.floor2x <= -1149) {
        game.floor2x = 1149;
    }

    ctx.drawImage(game.floorImage, game.floor1x, 550, 1149, 50);
    ctx.drawImage(game.floorImage, game.floor2x, 550, 1149, 50);
}
game.drawDeadMenu = function(score) {
    ctx.drawImage(game.menuImage, 50, 150, 300, 300);
    write('Game Over', 'black', '70px FlappyBirdy', canvas.width/2, 185);
    write(score, 'black', '90px DisposableDroidBB', canvas.width/2, 250);

    game.playButton.draw();
    game.quitButton.draw();
}
game.jump = function() {
    game.gravity = -6;
    game.start = false;
} 

function keyDownHandler(event) {
    if(event.key == ' ') {
        game.jump();
        console.log('up');
    }
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}
function write(text, colour, font, x, y) {
    ctx.font = font;
    ctx.fillStyle = colour;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);
}

class Button {
    constructor(x, y, width, height, text) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.text = text;

        this.image = new Image();
        this.image.src = 'images/button(1).png';
        this.activeImage = new Image();
        this.activeImage.src = 'images/button(active).png';

        this.currentImage = this.image;
    }
    hovering() {
        return game.mousePos["x"] > this.x && game.mousePos["x"] < this.x + this.width && game.mousePos["y"] > this.y && game.mousePos["y"] < this.y + this.height;
    }
    updateImage() {
        if(this.hovering()) {
            this.currentImage = this.activeImage;
        } else {
            this.currentImage = this.image;
        }
    }
    draw() {
        ctx.drawImage(this.currentImage, this.x, this.y, this.width, this.height);
        write(this.text, 'black', '30px DisposableDroidBB', this.x + 45, this.y + 8);
    }
}

class Pipe {
    constructor() {
        this.x = 400;
        this.y = randInt(-350, -100);
        this.width = 66;
        this.onePipeHeight = 400;

        this.imageUp = new Image();
        this.imageUp.src = 'images/pipe-up.png';
        this.imageDown = new Image();
        this.imageDown.src = 'images/pipe-down.png';

        this.passed150 = false;
        this.passed = false;
    }
    draw(rect=false) {
        ctx.drawImage(this.imageDown, this.x, this.y, this.width, this.onePipeHeight);
        ctx.drawImage(this.imageUp, this.x, this.y + 600, this.width, this.onePipeHeight);
        if(rect) {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.onePipeHeight);
            ctx.strokeStyle = 'red';
            ctx.stroke();
            ctx.closePath();
        }
    }
}

class Player {
    constructor() {
        this.width = 45;
        this.height = 30;
        this.x = 20;
        this.y = canvas.height/2 - this.height/2;

        this.image = new Image();
        this.image.src = 'images/flappy_bird.png';

        this.dead = false;
    }
    draw(rect=false) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        if(rect) {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = 'red';
            ctx.stroke();
            ctx.closePath();
        }
    }
    onFloorOrCeiling() {
        return this.y + this.height >= canvas.height-50 || this.y <= 0;
    }
    collidingWithPipe(pipe) {
        return (pipe.x <= this.x + player.width && pipe.x + pipe.width >= this.x) && (player.y <= pipe.y + 400 || player.y + player.height >= pipe.y + 600)
    }
    onDeath() {
        console.log('dead');
        this.dead = true;
    }
}

let player = new Player();
let pipes = [new Pipe()];

game.playButton = new Button(92, 350, 90, 50, 'Play');
game.quitButton = new Button(217, 350, 90, 50, 'Quit');

function mainLoop() {
    if(game.start) {
        game.drawBackground();
        game.drawFloor();
        player.draw();

        write('Flappy Bird', 'white', '80px FlappyBirdy', canvas.width/2, 175);
        write('Press SPACE to start', 'white', '50px FlappyBirdy', canvas.width/2, 350);
    }
    if(player.dead) {
        player.draw();
        game.drawDeadMenu(game.score);
        
        game.playButton.updateImage();
        game.quitButton.updateImage();
        game.playButton.draw();
        game.quitButton.draw();

        if(game.playButton.hovering() && game.clicking) {
            location.reload();
        }
        if(game.quitButton.hovering() && game.clicking) {
            window.close();
        }
    }

    if(! game.start && ! player.dead) {
        game.gravity += 0.2;

        player.y += game.gravity;

        game.drawBackground();

        for(let i = 0; i < pipes.length; i++) {
            pipes[i].x -= game.speed;
            pipes[i].draw();
            if(pipes[i].x <= 150 && ! pipes[i].passed150) {
                pipes.push(new Pipe());
                pipes[i].passed150 = true;
            }

            if(player.onFloorOrCeiling() || player.collidingWithPipe(pipes[i])) {
                player.onDeath();
            }

            if(player.x > pipes[i].x + pipes[i].width && ! pipes[i].passed) {
                game.score++;
                pipes[i].passed = true;
            }

            if(pipes[i].x < -200) {
                pipes.splice(i, 1);
            }
        }

        game.drawFloor();

        player.draw(rect=false);
        // console.log(pipes);

        write(game.score, 'white', '90px DisposableDroidBB', canvas.width/2, 30);
    }
}

setInterval(mainLoop, 12);
document.addEventListener('keypress', keyDownHandler);
document.addEventListener('mousemove', game.updateMousePos);
document.addEventListener('mouseup', game.mouseUp);
document.addEventListener('mousedown', game.mouseDown);
