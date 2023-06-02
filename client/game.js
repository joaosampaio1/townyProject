
var RESOURCE_PER_DISTANCE = 1000;
var CAP = 100000;

function getCap() {
    return CAP;
}

function getResourcePerTurn(towns) {
    let resourcesPerTown = [];
    
    towns.forEach(element => {
      const resources = {triangles: 0, circles: 0, squares: 0};
      resourcesPerTown.push(resources);
    });
    for (i=0; i<towns.length; i++) {
        makeResources(resourcesPerTown[i],towns[i]);
        const resourceFromOwnPath = resourcePath(towns[i]);
        if (towns[i].path !== undefined) {
            resourcesPerTown[i] = sumResources(resourcesPerTown[i],resourceFromOwnPath);
            const index = towns.findIndex(element => JSON.stringify(element.coord) === JSON.stringify(towns[i].path.coord));
            const resourceFromOtherPath = invertResource(towns[i],resourceFromOwnPath);
            resourcesPerTown[index] = sumResources(resourcesPerTown[index],resourceFromOtherPath);
            capResources(resourcesPerTown[i]);
            capResources(resourcesPerTown[index]);
            flooring(resourcesPerTown[i]);
            flooring(resourcesPerTown[index]);        
        }
        
    }

    return resourcesPerTown;
}

function invertResource(town, r) {
    const resources = {triangles: 0, circles: 0, squares: 0};
    const sum = r.circles + r.squares + r.triangles;
    const type = town.type;
    switch (type) {
        case "circle" : 
            resources.circles = sum;
            break;
        case "square" :
            resources.squares = sum;
            break;
        case "triangle" : 
            resources.triangles = sum;
            break;
        default: 
            break;
    }
    return resources;

}

function makeResources(r, town) {
    const type = town.type;
    switch (type) {
        case "circle" : 
            r.circles = CAP;
            break;
        case "square" :
            r.squares = CAP;
            break;
        case "triangle" : 
            r.triangles = CAP;
            break;
        default: 
            break;
    }
}

function capResources(r) {
    if (r.circles > CAP) r.circles = CAP;
    if (r.squares > CAP) r.squares = CAP;
    if (r.triangles > CAP) r.triangles = CAP;
}

function flooring(r) {
    r.circles = Math.floor(r.circles);
    r.squares = Math.floor(r.squares);
    r.triangles = Math.floor(r.triangles);
}

function resourcePath(town) {
    const resources = {triangles: 0, circles: 0, squares: 0};
    if (town.path === undefined) return resources;
    const destType = town.path.type;
    switch (destType) {
        case "circle" : 
            resources.circles = resources.circles+ (RESOURCE_PER_DISTANCE/distance(town));
            break;
        case "square" :
            resources.squares = resources.squares+ (RESOURCE_PER_DISTANCE/distance(town));
            break;
        case "triangle" : 
            resources.triangles = resources.triangles+ (RESOURCE_PER_DISTANCE/distance(town));
            break;
        default: 
            break;
    }
    return resources;
}

function sumResources(r1,r2) {

    const resources = {triangles: r1.triangles+r2.triangles, circles: r1.circles+r2.circles, squares: r1.squares+r2.squares};
    return resources;
}

function distance(town) {
    if (town !== undefined) {
        const x1 = town.coord.x;
        const y1 = town.coord.y;
        if (town.path !== undefined) {
        const x2 = town.path.coord.x;
        const y2 = town.path.coord.y;
        const a = x1-x2;
        const b = y1-y2
        return Math.sqrt(a*a +b*b);
        }
        
    }
    return undefined

}

module.exports = {distance,sumResources,resourcePath,flooring,capResources,makeResources,invertResource,getResourcePerTurn, getCap};