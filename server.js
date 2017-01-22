//requirements
const express=require('express');
const bodyParser = require('body-parser');

const app=express();

var databaseFile=require("./Database/dbFn");

module.exports={
	databaseConnected:function(){
		startListening();
	}
}

function startListening(){
	app.listen(3000,()=>{
		console.log("Database connected. Server is up and running!");
	});
}

//start connection to database
databaseFile.connect();

//Parse the body of the request for json.
app.use(bodyParser.json());



//Send a greeting when root address is called
app.get('/',rootCall);

function rootCall(req,res) {
	res.send("Welcome to DearStranger.");
}



//USER FUNCTIONS
var userFn=require("./User/userFn");
//Create or login a user
app.post('/createUser',[userFn.checkForValidBody,userFn.checkIfUserExists,userFn.createUser]);
//Update user's token
app.post('/updateUserToken',[userFn.checkHasToken,userFn.checkValidLogin,userFn.updateRegToken]);


//PUBLIC POSTS
var pubFn=require("./Posts/publicFn");
//Let user make a public post online
app.post('/makePublicPost',[pubFn.checkForValidBody,pubFn.checkValidLogin,pubFn.hasAnotherPost,pubFn.addPublicPost]);
//TODO remove this
app.post('/makePublicPost/test',pubFn.testingFn);
//Get public posts, endpoint gives the latest twenty posts.
app.get('/getPublicPosts',pubFn.getPublicPosts);
//get public requests(with indentation), append last id and last timestamp in millis
app.get('/getpublicposts/:last_id/:last_timestamp',pubFn.getPublicPostsInden);


//PRIVATE POSTS
var priFn=require("./Posts/privateFn");
//make private posts
app.post('/makePrivatePost',[priFn.checkForValidBody,priFn.checkValidLogin,priFn.hasAnotherPost,priFn.addPrivatePost]);
//get assigned a task (user requests to be assigned a task)
//requesting for assignment decreases the number of posts without response
app.post('/assignTask',[priFn.checkValidLogin,priFn.checkIfAlreadyAssigned,priFn.assign_task]);
//add reply to a post
app.post('/addReply',[priFn.checkValidLogin,priFn.addReply]);
