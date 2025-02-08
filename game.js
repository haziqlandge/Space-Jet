let rows = 8;
let columns = 5;
let score = 0;
const tileSize = document.getElementById('tile').offsetHeight; 
// Gets the size of 1 tile from an invisible div
console.log("Tile size: ", tileSize);

// Setting up canvas and initializing 2D context to draw 2D graphics
let canvas = document.getElementById('board');
canvas.width = columns * tileSize; 
canvas.height = rows * tileSize;
let context = canvas.getContext('2d'); 

let jet = {
    x: tileSize * parseInt(columns / 2),
    y: tileSize * (rows - 1),
    height: tileSize*3/4,
    width: tileSize
}; // Jet object stores its x, y coordinates and height/width

let jetImg = new Image(); // Create an img object for jet
jetImg.src = "jet.png";
jetImg.onload = function() {
    context.drawImage(jetImg, jet.x, jet.y, jet.width, jet.height); // Draw jet once image is loaded
};

let laserImg = new Image();
laserImg.src = "Laser_anim.png";

//initializing variables required to create obstacles
let objects = [];
let positionFound;
let obstacleSpeed = 1.5;
let collide = false; //initialize collide, if true stop game
let laser = null;
let hasLaser = false;
let randomObjsTimeout; // a variable which will store our timeout id
let objImg = new Image(); //creating obstacle img 
objImg.src = "obj.png";

const totalFrames = 14;

function start(e){
    if (e.key === 'Enter') {  
    document.removeEventListener('keydown', start); 
    document.addEventListener('keydown', move);
    document.addEventListener('keydown', shootLaser); 
    randomObjs();
    requestAnimationFrame(update); // This function starts the loop for frame updates
    }
}

document.addEventListener('keydown', start); // press any button => calls start

/*
  Function to create obstacles:
  The `occupied` array tracks whether a tile is occupied by an obstacle; initially, no tiles are occupied.
  We generate a random number `x` between 1 and 4 to determine the number of spaces/empty areas in a row, ensuring at least one space for the player to navigate through. 
  This results in creating `columns - x` obstacles in the row.
  The loop iterates to create the required number of obstacles. For each obstacle, 
  a `while` loop finds a suitable position by selecting a random tile index (`rndmTile`). 
  If the tile at `rndmTile` is unoccupied, we create an obstacle at `x: rndmTile * tileSize` and `y: -1 * tileSize` 
  (placing it just outside the visible area to slide into view). 
  The `occupied[rndmTile]` is set to `true` to mark the tile as occupied, and we exit the `while` loop for this obstacle.
  if `occupied[rndTile]` is already marked as `true` then the while loop will iterate again until a tile is found which is empty.
  The process repeats until all obstacles in the row are placed without overlapping.
  I have then set a delay variable which will add delay depending on what the score is
  so as to allow a gap between each row of obstacles, this delay will be added using the timeout fn
*/
function randomObjs() {
    if(objects.length <=30){
        let occupied = [false, false, false, false, false]; // Keep track of occupied tiles
        let x = Math.floor(Math.random() * 4 + 1); // Random number of obstacles to be generated
        for (let i = 0; i < columns - x; i++) {
            positionFound = false;
            while (!positionFound) {
                let rndmTile = Math.floor(Math.random() * 5); // Random tile selection for obstacle
                if (!occupied[rndmTile]) {
                    objects.push({
                        x: rndmTile * tileSize,
                        y: -1*tileSize,
                        width: tileSize,
                        height: tileSize/2
                    });
                    occupied[rndmTile] = true; // Mark the tile as occupied
                    positionFound = true;
                }
            }
        }
        // if there is no laser on screen then 10% chance to generate
        if (!laser && Math.random() < 0.1) {
            let rndmTile;
            do {
                rndmTile = Math.floor(Math.random() * 5);
            } while (occupied[rndmTile]);
        // find a randomtile if it is occupied then do it again until we find non occupied random one
            laser = {
                x: rndmTile * tileSize + tileSize / 2,
                y: -1 * tileSize + tileSize / 4,
                radius: 12
                }; // tileSize/2 cus we want it to be centred in the tile x coord similarly for y i did /4 
        }
        let delay;
        if (score >= 10000) {
            delay = 1000;
            } 
        else if (score > 5000 && score < 10000) {
            delay = 1200;
            } 
        else {
            delay = 1500;
            }

        // So depending upon score, randomObjsTimeout will call setTimeout which will timeout the fn by `delay`
        // It will also store the timeout ID so allowing us to clear it later when we restart
        randomObjsTimeout = setTimeout(randomObjs, delay);        
    }
}

// Function to draw obstacles
function objDraw() {
    for (let i = 0; i < objects.length; i++) {
        context.drawImage(objImg, objects[i].x, objects[i].y, objects[i].width, objects[i].height);
        // Draw obstacle at its position
    }
    if (laser) {
        context.fillStyle = "blue";
        context.beginPath();
        context.arc(laser.x, laser.y, laser.radius, 0, Math.PI * 2); // x,y, radius, start angle, end angle
        context.fill();
    } // if there is a laser on screen with before mentioned coords in the randomObjs func then draw it
// beginPath resets previous canvas draw logic of squares other wise the circle would be drawn from last rectangle n stick to it
}

// Function to update the canvas every frame
function update() {
    if(!collide){
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire board
        objDraw(); // Draw obstacles every frame
        context.drawImage(jetImg, jet.x, jet.y, jet.width, jet.height);// Draw jet in updated position
        obsMove(); // Move obstacles
        score+=1; //inc score by 1
        document.getElementById("txt").textContent = `Score: ${score}`;
        if(score <10000){
            obstacleSpeed +=0.00005; //inc obstacle speed upto 2.000x
        }

        //speed up inc in score
        if(score >= 10000 && score< 20000){ 
            score+=1; 
        }
        else if(score>= 20000 && score < 30000){
            score+=2;
        }
        else if(score>= 30000){
            score += 3;
        }
        requestAnimationFrame(update); // Continue updating the frame
        collision();
    }
}

// Function to move the jet based on key presses
function move(e) {
    if(!collide){
        if (e.key === 'ArrowLeft' && jet.x > 0) {
            jet.x -= tileSize; // Move jet left
        } else if (e.key === 'ArrowRight' && jet.x < canvas.width - tileSize) {
            jet.x += tileSize; // Move jet right
        }
    }
}
let explosionImg = new Image();
explosionImg.src = "explosion.png"; // Make sure to use the correct sprite sheet

let destroyThese;
function clearColumn(columnIndex) {
    destroyThese = objects.filter(obj => obj.x / tileSize == columnIndex);
    objects = objects.filter(obj => obj.x / tileSize !== columnIndex);
    destruction(destroyThese);
} 
/*basically .filter iterates over each element of the objects array 
where obj is a name i have given to each element of objects array
so obj is the parameter i have passed and on the right side of => is the condition
so if the condition is true that obstacle is added to the objects array
so here the logic is if the x coords of the obstacles and the jet are same then
those obstacles will be removed.
*/
function destruction(n){
    let destroyThese = n;
    let startTime = performance.now(); //gets the time when space was pressed
    let lastFrameTime = startTime; //initialize the last frame's time
    let frameIndex = 0;
    const totalFramesExplode = 11;
    const frameDelayExplode = 50;
    const animationDurationExplode = totalFramesExplode * frameDelayExplode;
    let destroyTheseOnes;
    function animateDestruction(){
        let currentTime = performance.now(); 
        let elapsedTime = currentTime - startTime; 
        let timeSinceLastFrame = currentTime - lastFrameTime; 
        if (elapsedTime < animationDurationExplode) {
            if (timeSinceLastFrame >= frameDelayExplode) {
                for(let i = 0; i< destroyThese.length; i++){
                    destroyTheseOnes = destroyThese[i];
                    destroyThese[i].y += obstacleSpeed;
                    context.drawImage(explosionImg, frameIndex * 64, 0, 64, 64, destroyTheseOnes.x, destroyTheseOnes.y, 64, 64);
                }
                frameIndex = (frameIndex + 1) % totalFrames; // Cycle through frames
                lastFrameTime = currentTime;
            }
            else{
                for(let i = 0; i< destroyThese.length; i++){
                    destroyThese[i].y += obstacleSpeed;
                    destroyTheseOnes = destroyThese[i];
                    context.drawImage(explosionImg, frameIndex * 64, 0, 64, 64, destroyTheseOnes.x, destroyTheseOnes.y, 64, 64);}
            }
            // Continue the animation loop as long as animation duration has not been reached
            requestAnimationFrame(animateDestruction);
        }
    
    }
    animateDestruction();
}
function shootLaser(e) {
    if (e.key === ' ' && hasLaser) {
        hasLaser = false; // Consume the laser
        let startTime = performance.now(); //gets the time when space was pressed
        let lastFrameTime = startTime; //initialize the last frame's time
        let frameIndex = 0;
        const fastFrameDelay = 5; // Delay for the first 5 frames (faster) 
        const normalFrameDelay = 80; // Delay for the next 9 frames (current delay) 
        
        // basically i want first 5 frames to be fast animated and the remaining next involving the beam to be slower
        const animationDuration = fastFrameDelay * 5 + normalFrameDelay * 9;
        
        // so usually animation duration would be the FPS frame per sec but i want first fast then slow
        // so i had to chop it up and make first 5 frames to be at 5ms delay and next 9frame at 80ms delay

        function animateCharging() {
            let currentTime = performance.now(); //this will get time for each frame aslong as the animation is running
            let elapsedTime = currentTime - startTime; // this is getting how much time has passed since space was pressed
            let timeSinceLastFrame = currentTime - lastFrameTime; // how much dt has passed since the last frame
            let frameDelay = frameIndex < 5 ? fastFrameDelay : normalFrameDelay; //framedelay for first 5 frames fast and slow for next 9
            
            if(frameIndex >= 10)
                clearColumn(jet.x / tileSize); //when the beam finally shoots out at frame 10 and above clear the column

            //keep animating as long as the time since animation began != animation duration
            /*if the time between the frame becomes say 5ms which is what i want for first 5 frames
            then it should play the next frame, if that much time has not passed then it will keep
            drawing the same frame basically I am holding a frame until the time for next frame has come*/
            if (elapsedTime < animationDuration) {
                if (timeSinceLastFrame >= frameDelay) {
                    context.drawImage(laserImg, frameIndex * 64, 0, 64, 448, jet.x, 0, 64, 448);
                    frameIndex = (frameIndex + 1) % totalFrames; // Cycle through frames
                    lastFrameTime = currentTime;
                }
                else{
                    context.drawImage(laserImg, frameIndex*64, 0, 64, 448, jet.x, 0, 64, 448);
                }
                context.drawImage(jetImg, jet.x, jet.y, jet.width, jet.height); // make sure jet is always drawn on top of laser n not below
                // Continue the animation loop as long as animation duration has not been reached
                requestAnimationFrame(animateCharging);
            }
        }

        // Start the animation loop
        animateCharging();
    }
}//if user has a laser and presses space then call the clear fn and then use up the laser

function obsMove() {
    // Move obstacles down the screen
    
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].y < tileSize * rows) {
            objects[i].y += obstacleSpeed; 
            // Move obstacle down by above defined speed (default 1.5) increases slowly
        }
    }
    if (laser) {
        laser.y += obstacleSpeed;
        if (laser.y - laser.radius >= tileSize * rows) {
            laser = null;
        } // if gone outside screen set laser object to null so it can be created again
    }    
    // Remove obstacles that have moved outside the screen
    if (objects.length > 0 && objects[0].y >= tileSize * rows) {
        objects.shift(); // Removes one element from object array that is at 0 index
    }
}
/*
Starts a loop if there are any elements in objects array
it will then check if the element's x position = jet's x position if AND
if the top (50%)portion of the obstacle ‾‾ is in the same area as the jet's occupied area from jet.y(start of jet) to jet.y+height (end of jet in y posn)
if not then i am checking whether the bottom(50%) part is in the same area as jet.y and jet.y+height.
if the conditions are satisfied then the jet has colided.
A Div will Pop up showing users final score and the ability to restart
the second condition is for whether user has colided with a laser if he does then
user will gain a laser*/
function collision(){
    for(let i = 0; i<objects.length; i++){
        if((objects[i].x == jet.x) && ((objects[i].y >= jet.y && objects[i].y <= jet.height+jet.y) || 
        objects[i].y + objects[i].height  >= jet.y && objects[i].y + objects[i].height <= jet.height+jet.y)){
            collide = true;
            console.log(`Jet X: ${jet.x} Jet Y: ${jet.y}, ${jet.y+64}`);
            console.log(`Obs X: ${objects[i].x} Obs Y: ${objects[i].y}, ${objects[i].y+64} `);
            console.log(`collision: ${collide}`);
            console.log(`Final Score: ${score}`);
            document.getElementById(`dispScore`).textContent = `Score: ${score}`; // show the score in the pop up
            document.getElementById(`popUp`).style.display = `flex`; //enables the pop up which was hidden before
            document.getElementById(`txt`).textContent =`\u200B`; 
            // this is an empty character bcos i did not want the space above canvas to randomly dissapear
            break;
        }
    }
    if (laser && 
        laser.x >= jet.x && laser.x <= jet.x + jet.width && 
        laser.y >= jet.y && laser.y <= jet.y + jet.height) {
        hasLaser = true;
        laser = null;
    }  // if there is a laser object then check if its x coords and y coords ever collide with jet if yes then user will have laser and object laser will dispear  
}

/*when user presses restart in the pop up div 
we clear the canvas and return everything to inital condition and call the start fn again*/
function restart(){
    console.log(`restart`);
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById(`popUp`).style.display = `none`; // hide the div
    document.addEventListener(`keydown`, start); // call the start fn on any keypress
    document.getElementById(`txt`).textContent = `Press Any Button To Move`; // reset txt above canvas
    
    //Setting variables to their default conditions
    jet = {
        x: tileSize * parseInt(columns / 2),
        y: tileSize * (rows - 1),
        height: tileSize*3/4,
        width: tileSize
    };

    context.drawImage(jetImg, jet.x, jet.y, jet.width, jet.height); // draw jet at centre or default posn

    score = 0;
    objects = [];
    obstacleSpeed = 1.5;
    collide = false; 
    laser = null;
    hasLaser = false;
    clearTimeout(randomObjsTimeout);
}
