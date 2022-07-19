const socket = io()

// Define variables for game.
let time;
let cnv, ctx;
let key_pressed = {};

let score = 0;
let timer = 90;
let chickenX = 770;
let chickenY = 750;
let lanes = [[], [], [], [], [], []];
let carHeights = [70, 170, 280, 380, 480, 590]

// Defining images to display on canvas.
var chicken_img = new Image();
chicken_img.src = "images/chicken_texture.png";

var blue_car_img = new Image();
blue_car_img.src = "images/blue_car.png";

var blue_car_img_rev = new Image();
blue_car_img_rev.src = "images/blue_car_rev.png";

var red_car_img = new Image();
red_car_img.src = "images/red_car.png";

var red_car_img_rev = new Image();
red_car_img_rev.src = "images/red_car_rev.png";

var yellow_car_img = new Image();
yellow_car_img.src = "images/yellow_car.png";

var yellow_car_img_rev = new Image();
yellow_car_img_rev.src = "images/yellow_car_rev.png";

var white_van_img = new Image();
white_van_img.src = "images/white_van.png";

var white_van_rev_img = new Image();
white_van_rev_img.src = "images/white_van_rev.png";

let car_imgs = [blue_car_img, blue_car_img_rev, red_car_img, red_car_img_rev, yellow_car_img, yellow_car_img_rev, white_van_img, white_van_rev_img];


// Listen for start of key presses.
window.addEventListener('keydown', function(e) {
    if(e.key == "ArrowUp"){
        key_pressed["ArrowUp"] = true;
    }
    if(e.key == "ArrowDown"){
        key_pressed["ArrowDown"] = true;
    }
    if(e.key == "ArrowLeft"){
        key_pressed["ArrowLeft"] = true;
    }
    if(e.key == "ArrowRight"){
        key_pressed["ArrowRight"] = true;
    }
});

// Listen for end of key presses.
window.addEventListener('keyup', function(e) {
    if(e.key == "ArrowUp"){
        key_pressed["ArrowUp"] = false;
    }
    if(e.key == "ArrowDown"){
        key_pressed["ArrowDown"] = false;
    }
    if(e.key == "ArrowLeft"){
        key_pressed["ArrowLeft"] = false;
    }
    if(e.key == "ArrowRight"){
        key_pressed["ArrowRight"] = false;
    }
});

// Begin game on loadup.
window.onload = function() {  
    initCanvas();
    time = setInterval(() => {
        if(timer > 0) {
            timer--;
        }
        else {
            clearInterval(time);
        }
    }, 1000)
    window.requestAnimationFrame(gameLoop);
}

// Initialize canvas.
function initCanvas() {
    cnv = document.getElementsByClassName('game_screen')[0];
    ctx = cnv.getContext('2d');
    let scale = window.devicePixelRatio;
    cnv.width = cnv.getBoundingClientRect().width * scale;
    cnv.height = cnv.getBoundingClientRect().height * scale;
}

// Primary loop that continuously updates game state and renders the information onto the screen.
function gameLoop() {
    update();
    render();
    if(timer > 0) {
        window.requestAnimationFrame(gameLoop);
    }
}

// Change game information dynamically.
function update() {
    // Update chicken position.
    if(key_pressed["ArrowUp"] && chickenY > 0) {
        chickenY = chickenY - 2;
    }
    if(key_pressed["ArrowDown"] && chickenY < cnv.height - 100) {
        chickenY = chickenY + 2;
    }
    if(key_pressed["ArrowLeft"] && chickenX > 0) {
        chickenX = chickenX - 2;
    }
    if(key_pressed["ArrowRight"] && chickenX < cnv.width - 100) {
        chickenX = chickenX + 2;
    }

    // Update score.
    if(chickenY < 50) {
        score++;
        chickenX = 770;
        chickenY = 750;
    }

    // Check collision. 
    for(let i = 0; i < lanes.length; i++) {
        for(let j = 0; j < lanes[i].length; j++) {
            lx = lanes[i][j]["x"];
            ly = lanes[i][j]["y"];
            
            if (lx + 20 < chickenX && chickenX < lx + 250 && ly < chickenY && chickenY < ly + 130) {
                chickenX = 770;
                chickenY = 750;
            }
        }
    }

    // Update car position.
    for(let i = 0; i < lanes.length; i++) {
        for(let j = 0; j < lanes[i].length; j++) {
            dirRight = (i % 2 == 0);
            lanes[i][j]["x"] = dirRight ? lanes[i][j]["x"] + 5 : lanes[i][j]["x"] - 5;
            // If car is going right and it reaches the right end, delete it from the list.
            if(dirRight && lanes[i][j]["x"] > 1660) {
                lanes[i].pop();
            }
            // If car is going left and it reaches the left end, delete it from the list.
            if(!dirRight && lanes[i][j]["x"] < -250) {
                lanes[i].pop();
            }
        }
    } 

    // Generate more cars.
    for(let i = 0; i < lanes.length; i++) {
        // If the lane has less than 6 cars.
        dirRight = (i % 2 == 0);
        if(lanes[i].length < 6) {
            // If the most recently added car has enough space between it and the end of the lane to allow for a new car. 
            if(lanes[i].length == 0 || (dirRight && lanes[i][0]["x"] > 320) || (!dirRight && lanes[i][0]["x"] < 1370)) {
                // Generate chance to spawn car. 
                rand1 = Math.floor(Math.random() * 150);

                if(rand1 == 0) { 
                    if(dirRight) {
                        lanes[i].unshift({"x": -280, "y": carHeights[i], "car": Math.floor(Math.random() * 4) * 2});
                    }
                    else {  
                        lanes[i].unshift({"x": 1690, "y": carHeights[i], "car": Math.floor(Math.random() * 4) * 2 + 1});
                    }
                }
            }   
        }
    }
}

// Draw necessary game components onto canvas.
function render() {
    // Clear canvas and prepare to draw.
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.beginPath();
    ctx.strokeStyle = 'white';

    // Start and finish line.
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.moveTo(0, cnv.height / 8);
    ctx.lineTo(cnv.width, cnv.height / 8);
    ctx.stroke();

    ctx.moveTo(0, 7 * cnv.height / 8)
    ctx.lineTo(cnv.width,  7 * cnv.height / 8);
    ctx.stroke();

    // Roads.
    ctx.lineWidth = 2;
    ctx.setLineDash([25, 3]);
    for(i = 2; i < 7; i++) {
        ctx.moveTo(0, i * cnv.height / 8);
        ctx.lineTo(cnv.width, i * cnv.height / 8);
        ctx.stroke();
    }

    // Score display.
    ctx.font = "25px Verdana";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 50, 50);

    // Timer display.
    ctx.fillText(timer, 807, 50);

    // Chicken.
    ctx.drawImage(chicken_img, chickenX, chickenY);

    // Cars. 
    //console.log(lanes);
    for(let i = 0; i < lanes.length; i++) {
        for(let j = 0; j < lanes[i].length; j++) {
            ctx.drawImage(car_imgs[lanes[i][j]["car"]], lanes[i][j]["x"], lanes[i][j]["y"])
        }
    }

}

