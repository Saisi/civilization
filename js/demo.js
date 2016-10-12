var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var cursors;



var StateAlert = function(banner_text, button_text,callback_function){

}

/*
0 = farm
*/
var Farm = function(x,y,sprite_name){
    this.HealthDropRateInMinutes = 30;
    this.HealthDropAmount = 25;
    this.stomachAdd = 10;
    this.health = 20;


    this.nourishmentKind=0;

    this.farm = game.add.sprite(x, y, sprite_name);
    //game.physics.arcade.enable(this.home);
    game.physics.enable(this.farm, Phaser.Physics.ARCADE);

    this.farm.body.immovable=true;

    this.farm.filthyGrandFather=this;
    nourishments.push(this);
}


Farm.prototype.FeedPerson = function(person){
    person.health += this.stomachAdd;
    this.health -= this.stomachAdd;
}

// Farm.prototype.eat = function(food){
//     this.stomach += food.GetNutrition();
//     this.stomach %= this.maxStomach;
//     this.health += 5;
// }




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


var World = function(){
    this.clock=0;
    this.day=60;
    this.minute=0;
    this.second=0;


    var road_main;
    var road_rib_barrier_top;
    var road_rib_barrier_bottom;
    var road_main_barrier_left;
    var road_main_barrier_right;




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


    //overlay text
    this.stomachText = game.add.text(0, game.world.height-30, 'stomach: ' + protagonist.stomach, { font:"14px Arial",fill: '#000' });
    this.healthText = game.add.text(0, game.world.height-20, 'health: ' + protagonist.health, { font:"14px Arial",fill: '#000' });


    var stateTextX=game.world.width/4;
    var stateTextY=game.world.height/1.15;
   
    var stateBanner = game.add.tileSprite(stateTextX, stateTextY, game.world.width/2 , game.world.height/7, 'background_state');
    this.stateText = game.add.text(stateTextX, stateTextY, 'Welcome! ', { font:"16px Arial",fill: '#000' });

}

var secondsInMinute = 10;
var stomachDropRateInMinutes = 1;
var minimumHealth = 80;

World.prototype.update = function(){
    this.minuteJustArrived=false; 

    this.clock = (this.clock%60)+1;


        //one second
    if(this.clock==secondsInMinute){
        this.second=(this.second%secondsInMinute)+1;
        if(this.second == secondsInMinute){ //one minute
            this.minute=(this.minute%secondsInMinute)+1;
            console.log(+this.minute + " minute");
            this.minuteJustArrived=true;
        }
        console.log("second " + this.second);
    }
    

    this.UpdatePhysics();
    this.UpdateHealth();
    this.UpdateStateBanner();


   

}

World.prototype.UpdateHealth=function(clock){

    for(var x=0; x<cars.length;x++){
        cars[x].UpdateHealth();
    }

    for(var x=0; x<people.length;x++){
        people[x].UpdateHealth();
    }


}



World.prototype.UpdatePhysics=function(){
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


var Person = function(x, y, sprite_name){
	this.direction = 'right';

    this.maxStomach=60;

    //variables of state
    this.stomach = 30; //max is 
    this.health = 100;
    this.prev = {}
    this.prev.stomach=this.stomach;
    this.prev.health = this.health;

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


World.prototype.UpdateStateBanner=function(){

    

}

Person.prototype.tickHunger = function(){
    this.stomach -= (this.maxStomach/2);

    if(this.stomach<0){
        this.stomach = 0;
    }
}

Person.prototype.eat = function(food){
    this.stomach += food.GetNutrition();
    this.stomach %= this.maxStomach;
    this.health += 5;
}





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



    if((this.prev.health != this.health || this.prev.stomach != this.stomach) && this.health > minimumHealth){

        world.healthText.text='health: ' + this.health;
        world.stomachText.text='stomach: ' + this.stomach;
    }
}


Person.prototype.GetSprite = function(){
    return this.player;
}

//TODO: impelement game restart mechanism
Person.prototype.UpdateHealth = function(){
    if(world.minute && world.minuteJustArrived){
        this.tickHunger();
        console.log("You are now: " +this.stomach);
        
    }

    
    //if on empty, drop health every minute
    if(this.stomach == 0 && world.minuteJustArrived){
        this.health -= 5;
        
    }

    if(this.health < minimumHealth){
        this.Kill();
    }
}

Person.prototype.Kill = function(){
    world.healthText.text='Sorry you are dead';
}





var Food = function(nutrition){
    this.nutrition = nutrition;
};

Food.prototype.GetNutrition = function(){
    return this.nutrition;
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


Car.prototype.UpdateHealth = function(){
    return this.dir;
}





var people = [];
var cars = [];
var homes =[];
var protagonist;
var nourishments =[];




function preload() {


    game.load.image('car_blue', 'assets/car_blue.png');
    game.load.image('car_red', 'assets/car_red.png');

    // game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('villager', 'assets/villager.png', 16, 16);
    game.load.spritesheet('earth', 'assets/earth.png', 16, 16);
    game.load.spritesheet('road_main', 'assets/road_main.png', 16, 16);
    game.load.spritesheet('home_brown', 'assets/home_brown.png', 64, 55);

    game.load.spritesheet('background_state', 'assets/background_state.png', 16, 16);
}


function create() {
 
    world = new World();


	cursors = game.input.keyboard.createCursorKeys();
}

function update() {

    world.update();
    
}

function collider_car_person(car, person){
    console.log("ouch");
    person.filthyGrandFather.health -= .5;
    world.healthText.text='health: ' + person.filthyGrandFather.health;

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