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
    height: tileSize,
    width: tileSize
}; // Jet object stores its x, y coordinates and height/width

let jetImg = new Image(); // Create an img object for jet
jetImg.src = "/jet.png";
jetImg.onload = function() {
    context.drawImage(jetImg, jet.x, jet.y, jet.width, jet.height); // Draw jet once image is loaded
};

//initializing variables required to create obstacles
let objects = [];
let positionFound;
let obstacleSpeed = 1.5;
let collide = false; //initialize collide, if true stop game

function start(){
    document.removeEventListener('keydown', start); 
    document.addEventListener('keydown', move);
    setInterval(randomObjs, 1500); // Call randomObjs() every 1.5 seconds
    requestAnimationFrame(update); // This function starts the loop for frame updates
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
*/
function randomObjs() {
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
}

// Function to draw obstacles
function objDraw() {
    context.fillStyle = "green"; // Set color for obstacles
    for (let i = 0; i < objects.length; i++) {
        context.fillRect(objects[i].x, objects[i].y, objects[i].width, objects[i].height); 
        // Draw obstacle at its position
    }
}

// Function to update the canvas every frame
function update() {
    if(!collide){
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire board
        objDraw(); // Draw obstacles every frame
        context.drawImage(jetImg, jet.x, jet.y, jet.width, jet.height);// Draw jet in updated position
        obsMove(); // Move obstacles
        score+=1;
        document.getElementById("txt").textContent = `Score: ${score}`;
        if(score >= 10000) // if score above 10k inc speed
            obstacleSpeed =2;
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

function obsMove() {
    // Move obstacles down the screen
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].y < tileSize * rows) {
            objects[i].y += obstacleSpeed; 
            // Move obstacle down by above defined speed (default 1.5)
        }
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
*/
function collision(){
    for(let i = 0; i<objects.length; i++){
        if((objects[i].x == jet.x) && ((objects[i].y >= jet.y && objects[i].y <= jet.height+jet.y) || 
        objects[i].y + objects[i].height  >= jet.y && objects[i].y + objects[i].height <= jet.height+jet.y)){
            collide = true;
            console.log(`Jet X: ${jet.x} Jet Y: ${jet.y}, ${jet.y+64}`);
            console.log(`Obs X: ${objects[i].x} Obs Y: ${objects[i].y}, ${objects[i].y+64} `);
            console.log(`collision: ${collide}`);
            console.log(`Final Score: ${score}`);
            break;
        }
    }
}
