var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var cursors;





/*
0 = farm
*/
var Farm = function(x,y,sprite_name){
    this.x=x;
    this.y=y;
    this.sprite_name=sprite_name;

    this.HealthDropRateInMinutes = 30;
    this.HealthDropAmount = 25;
    this.stomachAdd = 10;
    this.health = 20;
    this.nourishmentKind=0;

    width=image_map[sprite_name].width;
    height=image_map[sprite_name].height;


    //can be optimized
    for(var i=x;i<width+margin;i++){
        for(var j=y;j<height+margin;j++){
            if(world[i][j]){
                console.log("couldn't add " + sprite_name);
                alert("Can't add here, sorry Bieber dance");
                return null;
            }
            world.grid[i][j]=1;
        }
    }

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

var margin=5;
var stringFarm = "farm";

function BuildAFarm(){
    world.buildingKind = stringFarm;
    world.buildBuildingMode = true;
    console.log("built your fucking farm");
}


var Home = function(x, y, sprite_name){
    this.x=x;
    this.y=y;
    //do i really need this
    this.sprite_name=sprite_name;
    

    width=image_map[sprite_name].width;
    height=image_map[sprite_name].height;


    //can be optimized
    for(var i=x;i<width+margin;i++){
        for(var j=y;j<height+margin;j++){
            if(world[i][j]){
                console.log("couldn't add " + sprite_name);
                return null;
            }
            world.grid[i][j]=1;
        }
    }

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


var Road = function(x,y, width,height, sprite_name){
    this.sprite_name=sprite_name;
    this.x=x;
    this.y=y;
    this.road = game.add.tileSprite(x, y, width, height, sprite_name);




    roads.push(this);
}

Road.prototype.GetSprite = function(){
    return this.road;
}

var World = function(){

    this.buildBuildingMode = false;
    this.buildingKind = "";

    this.clock=0;
    this.day=60;
    this.minute=0;
    this.second=0;

    //create 2D grid
    this.grid = new Array(game.world.width);
    for(var i=0;i<game.world.width;i++){
        this.grid[i] = new Array(game.world.height);
    }
    for(var i=0;i<game.world.width;i++){
        for(var j=0;j<game.world.height;j++){
            this.grid[i][j]=0;
        }
    }


    //make sure global states are updated
    this.stateBannerCurrent = null;
    // this.BannerFunctionToDispatch=null;


    this.IndexPreviousBanner = -1;

    var road_main;
    var road_rib_barrier_top;
    var road_rib_barrier_bottom;
    var road_main_barrier_left;
    var road_main_barrier_right;

    //800 console.log(game.world.width);
    //600 console.log(game.world.height);


    game.add.tileSprite(0, 0,game.world.width ,game.world.height, 'earth');


    var home_protagonist = new Home(0, 260, 'home_brown');


    road_main = new Road(30*8, 0, 128 ,game.world.height, 'road_main');
    road_rib = new Road(0, 32*4,game.world.width , 32*4, 'road_main');
    


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


    this.stateBannerX=game.world.width/4;
    this.stateBannerY=game.world.height/1.15;
    this.stateBannerWidth=game.world.width/3;
    this.stateBannerHeight=game.world.height/7;
   
    this.stateBanner = game.add.tileSprite(this.stateBannerX, this.stateBannerY, this.stateBannerWidth , this.stateBannerHeight, 'background_state');
    this.stateBannerText = game.add.text(this.stateBannerX, this.stateBannerY, 'Welcome! ', { font:"16px Arial",fill: '#000' });



    //hardcoded here
    this.stateBannerButton = game.add.button(this.stateBannerX+this.stateBannerWidth-75,this.stateBannerY, 'button_banner', bannerCallbackDispatch, this);
    this.stateBannerButton.width=75;
    this.stateBannerButton.height=25;
   
}


function bannerCallbackDispatch() {
    console.log('Dispatch here mate');
    this.stateBannerCurrent.callback_function();
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
       // console.log("second " + this.second);
    }
    


    this.UpdatePhysics();
    this.UpdateHealth();
    this.UpdateStateBanner();
    this.StateMachine();
    this.UserInputDetection();

   

}


// var LookForPreExistingBanner = function(func){

//     for(var i=0;i<StateAlertObjects.length;i++){
//         if(StateAlertObjects[i].callback_function == func){
//             return StateAlertObjects[i];
//         }
//     }
//     return null;
// }
var LookForPreExistingBannerIndex = function(func){

    for(var i=0;i<StateAlertObjects.length;i++){
        if(StateAlertObjects[i].callback_function == func){
            return i;
        }
    }
    return -1;
}


var NoFoodSupply="No food supply!";
//ensure before update banner, we are sure state banner object doesn't already exist
World.prototype.StateMachine=function(){

    //do house cleaning
    if(StateAlertObjects.length == 0){this.stateBannerCurrent = null;}


    if(nourishments.length == 0){
        if(LookForPreExistingBannerIndex(BuildAFarm) < 0){
            var FarmAlert = new StateAlert("No food supply!\nBuild a farm",BuildAFarm);
            StateAlertObjects.push(FarmAlert); 
        }
    } else{
        //here, we have food source
        var bannerObjectIndex = LookForPreExistingBannerIndex(BuildAFarm);
        if(bannerObjectIndex >= 0){
            StateAlertObjects.splice(bannerObjectIndex,1);
        }
    }


    
    //do house cleaning
    if(StateAlertObjects.length == 0){
        this.stateBannerCurrent = null;
        this.stateBannerText.text = "";
    }
    
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

World.prototype.UserInputDetection=function(){
    if(this.buildBuildingMode && game.input.activePointer.isDown){
        console.log("Built a farm");
         if (this.buildingKind == stringFarm){
            var f = new Farm(game.input.mousePointer.x,game.input.mousePointer.y,"farm_new");
         }

         this.buildBuildingMode=false;
    }
}



var Person = function(x, y, sprite_name){
    this.x=x;
    this.y=y;

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



var StateAlertObjects = [];
//stateTexts
var StateAlert = function(banner_text, callback_function){
    //this.stateText 
    this.banner_text = banner_text;
    this.callback_function = callback_function;
}

World.prototype.UpdateStateBanner=function(){

    if(StateAlertObjects.length == 0) return;
    var next = (world.IndexPreviousBanner+1)%StateAlertObjects.length;
    world.IndexPreviousBanner = next;

    banner=StateAlertObjects[next];

    //console.log(StateAlertObjects);

    this.stateBannerText.text = banner.banner_text;
    this.stateBannerCurrent = banner;



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
    this.x=x;
    this.y=y;
    this.sprite_name=sprite_name;

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




var roads = [];
var people = [];
var cars = [];
var homes =[];
var protagonist;
var nourishments =[];
var stateTexts= [];

var image_map = {};

function load_image(image,width,height){
    image_map[image] = [width,height];
    game.load.image(image, 'assets/'+image+ '.png');
}

function load_sprite(image,width, height){
    image_map[image] = [width,height];
    game.load.spritesheet(image, 'assets/'+image+ '.png', width, height);
}

function preload() {


    // game.load.image('car_blue', 'assets/car_blue.png');
    // game.load.image('car_red', 'assets/car_red.png');

    load_image('car_blue',32,64);
    load_image('car_red',32,64);


    load_sprite('villager',16, 16);
    load_sprite('earth',16, 16);
    load_sprite('road_main',16, 16);
    load_sprite('home_brown',64, 55);
    load_sprite('farm_new',16, 16);

    load_sprite('background_state',16, 16);
    load_sprite('button_banner',128, 64);

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