let town = localStorage.getItem("townSelected");
if (town !== "undefined") {
    const json =  JSON.parse(town);
    document.getElementById("divBody").style.display = "flex";
    townImage = document.getElementById("townImage");
    switch (json.type) {
        case "circle": townImage.src="images/circle64.png";break;
        case "square": townImage.src="images/square64.png";break;
        case "triangle": townImage.src="images/triangle64.png";break;
        default :break;
    };
    document.getElementById("townCoordX").textContent=Math.floor(json.coord.x);
    document.getElementById("townCoordY").textContent=Math.floor(json.coord.y);

    document.getElementById("resourceCircle").textContent = json.resources.circles
    document.getElementById("resourceTriangle").textContent = json.resources.triangles;
    document.getElementById("resourceSquare").textContent = json.resources.squares;
}
else {
    document.getElementById("divBody").style.display = "none";;
}

let resources = localStorage.getItem("resourcesSelected");
if (resources !== "undefined") {
    const json =  JSON.parse(resources);
    document.getElementById("increaseSquare").textContent = "+"+json.squares;
    document.getElementById("increaseTriangle").textContent ="+"+ json.triangles;
    document.getElementById("increaseCircle").textContent = "+"+json.circles;
}