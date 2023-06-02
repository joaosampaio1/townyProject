const express = require('express');
const app = express();
app.listen(3000, () => console.log('listening at 3000' ));
app.use(express.static('client'));
app.use(express.json({limit: '1mb'}));

var towns = [];
var resourcesPerTown = [];
const game = require("./client/game.js");

//https://stackoverflow.com/questions/8011962/schedule-node-js-job-every-five-minutes
var minutes = 60, the_interval = minutes * 60 * 1000;
setInterval(async function() {
  console.log("Doing a 1 hour check");
  towns = await getTowns();
  resourcesPerTown= game.getResourcePerTurn(towns);
  await turn();
  //console.log(towns);
}, the_interval);


app.get('/getTowns', (request, response) => {
  const result = getTowns();
    result.then( (array) => {
      const towns = result;
      response.json({
        status: 'success',
        towns: array
        })
    }
    );
  
})

app.put('/changePath', (request, response) => {
  const data = request.body;
  //console.log(data);
  const result = changePath(data.townOrigin, data.townDest);
  
    result.then( () => {
      response.json({
        status: 'success',
        })
    }
    );
  
})

app.post('/insertTown', (request, response) => {
  let status = "success";
  const result = insertTown(request.body);
  result.then((data) => {
    if (data == false) status = "fail";
    console.log(request.body);
    response.json({
      status: status,
      
    });
  }) ;
})

/*

  MongoDB
  https://www.mongodb.com/docs/drivers/node/current/

*/

const { MongoClient, ServerApiVersion } = require("mongodb");

// Connection URI
const uri = "mongodb://127.0.0.1:27017/mydb";

// Create a new MongoClient
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1});

/*async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Establish and verify connection
    await client.db("world").command({ ping: 1 });
    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);*/

async function insertTown(doc) {
  if (doc.coord === undefined) return false;
  try {
    await client.connect();
    const myDB = client.db("world");
    const myColl = myDB.collection("town");

    const result = await myColl.insertOne(doc);
    console.log(
      `A document was inserted with the _id: ${result.insertedId}`,
    );
  }
  finally {
  
    await client.close();
  }
}

async function changePath(townOrigin, townDest) {
  try {
    await client.connect();
    const myDB = client.db("world");
    const myColl = myDB.collection("town");
    console.log("queradadady");
    console.log(townOrigin);
    console.log(townDest);
    result = await getSingleTown(townDest);
    query = {coord : { x : townOrigin.coord.x,
      y : townOrigin.coord.y }
}  
    const dest = {coord : result.coord, type : result.type};
    obj = {$set:{path : dest}};

      await myColl.updateOne(query, obj);
  }
    
    finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
}

async function getTowns() {
  try {
    await client.connect();
    const myDB = client.db("world");
    const myColl = myDB.collection("town");
    result = await myColl.find({});
    //await result.forEach(console.dir);
    array = await result.toArray();
    //console.log(array);
  }
  finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    return await array;
  }
}

async function getSingleTown(data) {
  //Nested function, should be run with connection already established
    const myDB = client.db("world");
    const myColl = myDB.collection("town");
   
   query = {coord : { x : data.coord.x,
            y : data.coord.y }
    }  
    result = await myColl.findOne(query);
    //console.log(query);
    //console.log(result);
  
    return result
}

async function turn() {
  try {
    await client.connect();
    const myDB = client.db("world");
    const myColl = myDB.collection("town");
    for (i=0;i<towns.length;i++) {
      //add resources
      const town = towns[i];
      const r = resourcesPerTown[i];
      query = {coord : { x : town.coord.x,
        y : town.coord.y }
      }
      //Safety reset
      if (town.resources.triangles === undefined) town.resources.triangles=0;
      if (town.resources.circles === undefined) town.resources.circles=0;
      if (town.resources.squares === undefined) town.resources.squares=0;

       t = town.resources.triangles+r.triangles;
       c = town.resources.circles+r.circles;
      s = town.resources.squares+r.squares;
      if (t>game.getCap()) t=game.getCap();
      if (c>game.getCap()) c=game.getCap();
      if (s>game.getCap()) s=game.getCap();
      const obj = {$set:{resources :{triangles : t, 
                                    circles : c,
                                    squares : s}
                      }};
    
      await myColl.updateOne(query, obj);
    }
  }
  finally {
    await client.close();
  }
}



  
  