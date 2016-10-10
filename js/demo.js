var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var cursors;
var road_main;
var dict = {};


var Home = function(x, y, sprite_name){
   
    this.home = game.add.sprite(x, y, sprite_name);
    //game.physics.arcade.enable(this.home);
    game.physics.enable(this.home, Phaser.Physics.ARCADE);

    this.home.body.immovable=true;

    this.home.filthyGrandFather=this;
    homes.push(this);
};


Home.prototype.GetSprite = function(){
    return this.home;
}




var Person = function(x, y, sprite_name){
	this.direction = 'right';
	this.player = game.add.sprite(x, y, sprite_name);
	game.physics.arcade.enable(this.player);

	this.player.scale.setTo(2, 2);
	this.player.body.velocity.x = 150;

	this.boundary_right=game.world.width-(1.5*16);
	this.boundary_bottom=game.world.height-(1.5*16);


	this.player.animations.add('left', [16, 17], 10, true);
	this.player.animations.add('right', [8, 9], 10, true);
	this.player.animations.add('up', [0, 4,5], 10, true);
	this.player.animations.add('down', [2, 12,13], 10, true);

    this.player.filthyGrandFather=this;
    people.push(this);
};




Person.prototype.update = function(){

	this.player.body.velocity.x = 0;
	this.player.body.velocity.y = 0;

	if (cursors.left.isDown && !(this.player.body.x < 0))
    {
        this.player.body.velocity.x = -150;
        this.player.animations.play("left");
    }
    if (cursors.right.isDown && !(this.player.body.x > this.boundary_right))
    {
        this.player.body.velocity.x = 150;
        this.player.animations.play("right");
    }

	
	if (cursors.up.isDown && !(this.player.body.y < 0))
    {
        this.player.body.velocity.y = -150;
        this.player.animations.play("up");
    }
    if (cursors.down.isDown && !(this.player.body.y > this.boundary_bottom))
    {
        this.player.body.velocity.y = 150;
        this.player.animations.play("down");
    }
    if(this.player.body.velocity.x == this.player.body.velocity.y){
    	this.player.animations.stop();
    } 
}


Person.prototype.GetSprite = function(){
    return this.player;
}



var Car = function(x, y, sprite_name){

    this.p=100;

    this.car = game.add.sprite(x, y, sprite_name);
    game.physics.arcade.enable(this.car);

    this.car.anchor.setTo(.5, .5);
    this.GoDown();

    this.car.body.bounce.setTo(1, 1);

    this.car.filthyGrandFather=this;
    cars.push(this);

};

Car.prototype.update = function(){

    // this.car.body.velocity.x = 0;
    // 

    // if(this.dir == 2){
    //     this.GoDown();
    // }else if(this.dir == 1){
    //     this.GoRight();
    // }else if(this.dir == 3){
    //     this.GoLeft();
    // }else if(!this.dir==0){
    //     this.GoUp();
    // }

    //ensure go right side of road
    if (this.car.body.x < -100)
    {
        this.GoRight();
    }
    if (this.car.body.x > game.world.width+150)
    {
        this.GoLeft();
    }

    
    if (this.car.body.y < -150)
    {
        this.GoDown();
    }
    if (this.car.body.y > game.world.height+150)
    {
        this.GoUp();
    }



}


Car.prototype.GoUp = function(){
    this.car.angle=0;
    this.car.body.velocity.y = -this.p;
    this.car.body.velocity.x = 0;
    this.dir=0;
}

Car.prototype.GoDown = function(){
    this.car.angle=180;
    this.car.body.velocity.y = this.p;
    this.car.body.velocity.x = 0;
    this.dir=2;
}

Car.prototype.GoLeft = function(){
    this.car.angle=270;
    this.car.body.velocity.y = 0;
    this.car.body.velocity.x = -this.p;
    this.dir=3;
}

Car.prototype.GoRight = function(){
    this.car.angle=90;
    this.car.body.velocity.y = 0;
    this.car.body.velocity.x = this.p;
    this.dir=1;
}

Car.prototype.GetSprite = function(){
    return this.car;
}

Car.prototype.GetDir = function(){
    return this.dir;
}





var people = [];
var cars = [];
var homes =[];
var protagonist;

var road_rib_barrier_top;
var road_rib_barrier_bottom;
var road_main_barrier_left;
var road_main_barrier_right;
var hadron;


function preload() {


    game.load.image('car_blue', 'assets/car_blue.png');
    game.load.image('car_red', 'assets/car_red.png');

    // game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('villager', 'assets/villager.png', 16, 16);
    game.load.spritesheet('earth', 'assets/earth.png', 16, 16);
    game.load.spritesheet('road_main', 'assets/road_main.png', 16, 16);
    game.load.spritesheet('home_brown', 'assets/home_brown.png', 64, 55);
}


function create() {





	game.add.tileSprite(0, 0,game.world.width ,game.world.height, 'earth');


    var home_protagonist = new Home(0, 260, 'home_brown');


	road_main = game.add.tileSprite(32*8, 0, 128 ,game.world.height, 'road_main');
	road_rib = game.add.tileSprite(0, 32*4,game.world.width , 32*4, 'road_main');
	



    var car_red = new Car(32*8+80, 0, 'car_red');
    var car_blue = new Car(0, 32*4+100, 'car_blue');
    var car_collide = new Car(0, 0, 'car_blue');
    var car_collide_two = new Car(100, 300, 'car_red');

    car_collide.GoDown();
    car_blue.GoRight();
    car_collide_two.GoLeft();

	protagonist= new Person(32, game.world.height - 150, 'villager');




	cursors = game.input.keyboard.createCursorKeys();
}

function update() {
    //update for all objects
    var c = cars.concat(people); 
    for(var x=0;x<c.length;x++){c[x].update();};

    // //cars collide against each other
    // for(var x=0; x<cars.length;x++){
    //     for(var y=x+1;y<cars.length;y++){
    //         game.physics.arcade.collide(cars[x].GetSprite(), cars[y].GetSprite());
    //     }
    // }

    //cars collide overla[]
    for(var x=0; x<cars.length;x++){
        for(var y=x+1;y<cars.length;y++){
             game.physics.arcade.overlap(cars[x].GetSprite(), cars[y].GetSprite(),collider_car_car, null, this);
        }
    }

    //cars overlap with homes
    for(var x=0; x<cars.length;x++){
        for(var y=0;y<homes.length;y++){
            game.physics.arcade.overlap(cars[x].GetSprite(), homes[y].GetSprite(),collider_car_home, null, this);
        }
    }

    //check overlap between cars and people
    for(var x=0; x<people.length;x++){
        for(var y=0;y<cars.length;y++){
            game.physics.arcade.overlap(cars[y].GetSprite(), people[x].GetSprite(),collider_car_person, null, this);
        }
    }


    //people and cars collisions
     for(var x=0; x<cars.length;x++){
        cars[x].GetSprite().body.immovable=true;
        for(var y=0;y<people.length;y++){
            game.physics.arcade.collide(cars[x].GetSprite(), people[y].GetSprite());
        }
        cars[x].GetSprite().body.immovable=false;
    } 


    


}

function collider_car_person(car, person){
    console.log("ouch");
}


function collider_car_car(car,car_two){
    game.physics.arcade.collide(car,car_two);
    var stagnant_two = car_two.body.velocity.x == 0 && car_two.body.velocity.y == 0;
    var stagnant = car.body.velocity.x == 0 && car.body.velocity.y == 0;

    if(stagnant_two && !stagnant){  
        car_two.body.velocity.x= -car.body.velocity.x;
        car_two.body.velocity.y= -car.body.velocity.y;
    }

    if(!stagnant_two && stagnant){  
        car.body.velocity.x= -car_two.body.velocity.x;
        car.body.velocity.y= -car_two.body.velocity.y;
    }

    if(stagnant_two &&stagnant){
        if((Math.random()*10)%2){
            car.filthyGrandFather.GoUp();
        } else {
            car.filthyGrandFather.GoDown();
        }
    }


  
    
}

//on collide on sticks

function collider_car_home(car, home){
    var superCar=car.filthyGrandFather;

    game.physics.arcade.collide(car,home);

    if(car.body.velocity.x < 0){
        superCar.GoUp();
    }else if(car.body.velocity.x > 0){
        superCar.GoDown();
    }

    if(car.body.velocity.y < 0){
        superCar.GoLeft();
    }else if(car.body.velocity.y > 0){
        superCar.GoRight();
    }
}