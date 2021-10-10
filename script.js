
const canvas = document.getElementById('canvas');
// @ts-ignore
const ctx = canvas.getContext('2d');

/// game board ///

const pixelSize = 25;
const width = 12; 
const height = 18;

const backgroundColor = '#FFEEFF';

canvas.setAttribute('width', `${pixelSize * width}px`);
canvas.setAttribute('height', `${pixelSize * height}px`);

console.log(canvas);
console.log(ctx);

const shape = [
   /*
      0 | 1
      2 | 3
      4 | 5
      6 | 7
   */
   {
      shape: [0, 2, 4, 5], // L
      color: '#000BEB' // blue
   },
   {
      shape: [0, 1, 2, 4], // F
      color: '#FFA200' // orange
   },
   {
      shape: [0, 2, 3, 5], // Z
      color: '#00FFF1' // cyan 
   },
   {
      shape: [1, 3, 2, 4], // S
      color: '#3CFF00' // green
   },
   {
      shape: [0, 1, 2, 3], // O
      color: '#FFF600' // yellow
   },
   {
      shape: [0, 2, 4, 6],  // I
      color: '#F20000' // red
   },
   {
      shape: [1, 2, 3, 5], // T
      color: '#FF00EB' // pink
   }
]

/// global game object ///

const game = {
   piece: null,
   speed: 200,
   filledSpace: [], // this will contain the arrays of [x, y, color]
   countCooldown: 0, // this is for cooldown the keyboard event especially down-arrow
   cooldown: 15,
   countDelay: 0, // this is going to be the speed of a piece falling down
   delay: 15,
   moveSide: 0,

   isOver: true,
   moving: null
};

class piece {
   constructor(arr){
      this.rotation = 0;
      this.shape = [...arr.shape];
      this.color = arr.color;
      this.eachPositionX = [];
      this.eachPositionY = [];
   }
}

function init(){
   game.isOver = true;
   game.piece = null;
   game.moveSide = 0;
   game.filledSpace = [];

   ctx.fillStyle = backgroundColor;
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   ctx.fillStyle = 'black';
   ctx.font = '25px Arial';
   ctx.fillText(
      'Press enter to start...',
      35, 
      canvas.height / 2
   )

   document.addEventListener('keydown', addKeyEvent);
}
init();

function startGame(){
   game.isOver = false;

   game.moving = setInterval(ticker, 30);
}

function ticker(){
   if(!game.isOver){
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      createPiece();
      
      movePiece();
      
      drawBackground();
      drawPiece();
      
      //checkBlocks();
   }
}

function createPiece(){
   if(game.piece == null){
      const random = Math.floor(Math.random() * shape.length);
      game.piece = new piece(shape[random]);

      for(let i = 0; i < game.piece.shape.length; i++){
         game.piece.eachPositionX.push(
            game.piece.shape[i] % 2 == 0?
            (canvas.width / 2) - (pixelSize / 2) :
            (canvas.width / 2) + (pixelSize / 2)
         );
   
         game.piece.eachPositionY.push(
            Math.floor(game.piece.shape[i] / 2) * pixelSize + (pixelSize / 2) - (pixelSize * 4)
         )
      }
   }
}

function movePiece(){

   if(game.moveSide != 0){
      game.piece.eachPositionX = game.piece.eachPositionX.map(p => p + game.moveSide);
      game.moveSide = 0;
   }

   if(game.countDelay <= 0){
      let isTouchedTheFloor = false;

      game.filledSpace.forEach(f => {
         if(game.piece != null)
         for(let i = 0; i < game.piece.shape.length; i++){
            if(f[1] == game.piece.eachPositionY[i] + pixelSize &&
               f[0] == game.piece.eachPositionX[i]){
                  isTouchedTheFloor = true;
                  addToFilledSpace();
                  break;
               }
         }
      })

      if(game.piece != null){
         if(game.piece.eachPositionY.includes(canvas.height - (pixelSize / 2))){
            isTouchedTheFloor = true;
            addToFilledSpace();
         }
      }

      if(!isTouchedTheFloor){
         game.piece.eachPositionY = game.piece.eachPositionY.map(p => p + pixelSize);
      }

      game.countDelay = game.delay;
   }
   else game.countDelay--;
}

function addToFilledSpace(){
   for(let i = 0; i < game.piece.shape.length; i++){
      game.filledSpace.push([game.piece.eachPositionX[i], game.piece.eachPositionY[i], game.piece.color]);
   }
   game.piece = null;
}

function drawBackground(){
   ctx.fillStyle = backgroundColor;
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   game.filledSpace.forEach(f => {
      ctx.fillStyle = f[2];
      ctx.fillRect(
         f[0] - (pixelSize / 2),
         f[1] - (pixelSize / 2),
         pixelSize,
         pixelSize
      )
   })
}

function drawPiece(){
   if(game.piece != null)
   for(let i = 0; i < game.piece.shape.length; i++){
      ctx.fillStyle = game.piece.color;
      ctx.fillRect(
         game.piece.eachPositionX[i] - (pixelSize / 2),
         game.piece.eachPositionY[i] - (pixelSize / 2),
         pixelSize,
         pixelSize
      )
   }
}

function addKeyEvent(e){
   if(game.isOver){
      if(e.key == 'Enter') startGame();
   }
   else {
      if(e.key == 'ArrowRight'){
         if(!game.piece.eachPositionX.includes(canvas.width - (pixelSize / 2)))
         game.moveSide = pixelSize;
      }
      else if(e.key == 'ArrowLeft'){
         if(!game.piece.eachPositionX.includes(pixelSize / 2))
         game.moveSide = -pixelSize;
      }
      else if(e.key == 'ArrowDown'){
         placeToTheBottom();
      }
   }
}

function placeToTheBottom(){
   if(game.piece != null){

   const topY = Math.min(...game.piece.eachPositionY);
   for(let i = topY; i < canvas.height - (pixelSize / 2); i+=pixelSize){

      if(game.piece != null){
         if(game.piece.eachPositionY.includes(canvas.height - (pixelSize / 2))){
            addToFilledSpace();
            i = canvas.height - (pixelSize / 2);
         }
      }

      game.filledSpace.forEach(f => {
         if(game.piece != null)
         for(let i = 0; i < game.piece.shape.length; i++){
            if(f[1] == game.piece.eachPositionY[i] + pixelSize &&
               f[0] == game.piece.eachPositionX[i]){
                  addToFilledSpace();
                  i = canvas.height - (pixelSize / 2);
                  break;
               }
         }
      })

      game.piece.eachPositionY = game.piece.eachPositionY.map(y => y + pixelSize);

   }

   game.countDelay = 20;

   }
}
