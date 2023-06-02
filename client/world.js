async function setup() {
    createCanvas(1200,800);
    await getTowns();
    resourcesPerTown =  getResourcePerTurn(towns);
    setTownSelected(towns[0]);
    console.log(towns);
}

var towns = [];
paths = [];
var townSelected = undefined; //coord of town selected
var figureRadius = 8;
resourcesPerTown = [];

function draw() {
    background(225);
    noFill();
    for (let i=0;i<towns.length;i++) {
        if(towns[i].type=="circle") {

            stroke('red');
            circleCentered(towns[i].coord,figureRadius);
            if (isTownSelected() && compareTown(townSelected.coord, towns[i].coord)) {
                stroke('yellow');
                circleCentered(towns[i].coord,figureRadius+1);
            }
        }

        if(towns[i].type=="triangle") {

            stroke('blue');
            triangleCentered(towns[i].coord,figureRadius);
            if (isTownSelected() && compareTown(townSelected.coord, towns[i].coord)) {
                stroke('yellow');
                triangleCentered(towns[i].coord,figureRadius+1);
 
            }
        }

        if(towns[i].type=="square") {

            stroke('green');
            squareCentered(towns[i].coord, figureRadius);
            if (isTownSelected() && compareTown(townSelected.coord, towns[i].coord)) {
                stroke('yellow');
                squareCentered(towns[i].coord, figureRadius+1);
            }  
        }

    }
    for (let i=0;i<paths.length;i++) {
        paths[i].update();
        paths[i].show();
    }
}

function compareTown(town1, town2) {
    return JSON.stringify(town1)===JSON.stringify(town2);
}

function setTownSelected(town) {
    townSelected = town; //town could be undefined
    localStorage.setItem("townSelected", JSON.stringify(townSelected));
    if (town !== undefined) {
        const index = towns.findIndex(element => JSON.stringify(element.coord) === JSON.stringify(town.coord));
        localStorage.setItem("resourcesSelected", JSON.stringify(resourcesPerTown[index]));
    }
    
    refreshTownInfo();
}

function isTownSelected() {
    if (townSelected === undefined) return false;
    return true;
}

//https://p5js.org/reference/#/p5/square
function squareCentered(coord,radius) {
    quad(coord.x-radius,coord.y-radius,coord.x-radius,coord.y+radius,coord.x+radius,coord.y+radius,coord.x+radius,coord.y-radius);
}

//https://p5js.org/reference/#/p5/circle
function circleCentered(coord,radius) {
    circle(coord.x,coord.y,radius*2);
}

//https://p5js.org/reference/#/p5/triangle
function triangleCentered(coord,radius) {
    triangle(coord.x-radius, coord.y+radius/2 ,coord.x+radius ,coord.y+radius/2 ,coord.x ,coord.y-radius-radius/2 ); 

}

function path(town1,town2) { 

    this.x=town1.x;
    this.y=town1.y;
    this.velocity=1;
    if (town1.x>town2.x) {
        this.velocity= this.velocity*-1; 
        /*tmp=town1;
        town1=town2;
        town2=tmp;*/
    }

    //y=ax+b
    this.a=(town2.y-town1.y)/(town2.x-town1.x);
    this.b=(town2.x*town1.y-town1.x*town2.y)/(town2.x-town1.x);
    this.angle=Math.atan((town2.y-town1.y)/(town2.x-town1.x));

    this.update = function() {
        //console.log(this.x);
        this.x=this.x+(Math.cos(this.angle)*this.velocity);
        this.y=this.a*this.x+this.b;
        if (!((this.x>town1.x && this.x<town2.x) || (this.x<town1.x && this.x>town2.x))) {//invert path
            //console.log(this.x+" "+town1.x+" "+town2.x);
            this.velocity= this.velocity*-1; 
        }
    }

    this.show = function() {
        stroke('gray');
        ellipse(this.x,this.y,1);
        if(!isTownSelected()) return;
        if(compareTown(town1, townSelected.coord)) { //for now its the same receving or sending
            stroke('yellow');
            ellipse(this.x,this.y,3);
        }
        else if (compareTown(town2, townSelected.coord)) {
            stroke('orange');
            ellipse(this.x,this.y,3);
        }
    }
}

//Client side to get the paths with provided towns before
function getPaths() {
    paths = new Array;
    towns.forEach(element => {
        if (element.path != undefined) paths.push(new path(element.coord, element.path.coord));
    });
    console.log(paths);
}

function refreshTownInfo() {
    document.getElementById('townInfo').contentWindow.location.reload();
}

async function getTowns() {
    const options = {
        method: 'GET',
    }
    const response = await fetch('/getTowns', options);
    const json = await response.json();
    console.log(json);
    towns = Object.values(json.towns);
    console.log(towns.length);
    //TODO: temp value for loading, its always the first town[0]
    getPaths();
    //console.log(towns);
}

function inRadius(element, data) {
    if (element.x - figureRadius+1 < data.x && element.x + figureRadius+1 > data.x &&
        element.y - figureRadius+1 < data.y && element.y + figureRadius+1 > data.y) {
        return element;
        }
    return false;
}

async function selectTown(data) {
    let p = new Promise((resolve)=> {
        towns.forEach((element) => {
            result = inRadius(element.coord, data);
            if(result!=false) {
                
                resolve(element);
            }
        });
        resolve(undefined);
    });
    return p;
    
}

async function changePath(townPath) {
    console.log(townSelected);
    console.log(townPath);
    const data = {townOrigin : townSelected, townDest : townPath};
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        } ,
        body: JSON.stringify(data)
    }
    const response = await fetch('/changePath', options);
    const json = await response.json();
    //console.log(json);
    return json.town;
}

async function insertTown(town) {
    console.log("inserting");
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        } ,
        body: JSON.stringify(town)
    }
    const response = fetch('/insertTown', options);
    response.then( (data) => {
        const json = data.json();
        //console.log(json);
        getTowns();
    }
    ) 
}

async function mouseClicked() {

    
    if (mouseX > width || mouseY > height) return; //TODO: DOESNT WORK PROPRELY

    const coord = {x:mouseX, y:mouseY};
    const townType = localStorage.getItem("townType");
    const result = await selectTown(coord);

    //Check if sideline button is clicked or not 
    if (localStorage.getItem("flagInsertTown") == "false" && localStorage.getItem("flagChangePath") == "false" ) {
        setTownSelected(result);
       // console.log(townSelected);
        return; 
    }

    //Insert town
    if (localStorage.getItem("flagInsertTown") == "true") {

        const town =  {coord : coord, path:{coord : coord, type:townType}, type:townType, resources: {triangles:0, circles:0, squares: 0}};
        //console.log(town);
        if (result != undefined) return;
        insertTown(town);
        refreshTownInfo();
        
    }

    //Change path
    if (localStorage.getItem("flagChangePath") == "true") {
        if (townSelected != undefined) {
            const townPath = await selectTown(coord);
            if (townPath != undefined) {
                await changePath(townPath);
                await getTowns();
                resourcesPerTown =  getResourcePerTurn(towns);
                refreshTownInfo();
            } 
        }
    }
    
}