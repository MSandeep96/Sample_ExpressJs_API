//requirements
const express=require('express');
const mongoClient=require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const app=express();

mongoClient.connect("mongodb://sande96:queenrocks96@ds011228.mlab.com:11228/dear_stranger",(err,database)=>{
	if(err) return console.log(err);
	db=database;
	app.listen(3000,()=>{
		console.log("Database connected. Server is up and running!");
	});
});

//Parse the body of the request for json.
app.use(bodyParser.json());

//Server setup and running. Helper functions follow
var reply(success,comment){
	this.success=success;
	this.comment=comment;
}

function baseRes(success,reason){
	return new reply(success,reason);
}

function randomString() {
	var chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var result = '';
	for (var i = 12; i > 0; --i){ 
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
}

function hasValidBody(body,res){
	if(body.name==undefined){
		res.status(400).send(baseRes(false,"Invalid name"));
		return false;
	}
	if(body.login_type!='google' && body.login_type!='facebook'){
		res.status(400).send(baseRes(false,"Invalid login type"));
		return false;
	}
	if(body.google_id==undefined && body.facebook_id==undefined){
		res.status(400).send(baseRes(false,"No valid google or facebook ID"));
		return false;
	}
	return true;
}

//HELPER FUNCTIONS END. ENDPOINTS WITH THERE CALLBACKS FOLLOW

//Send a greeting when root address is called
app.get('/',rootCall);

function rootCall(req,res) {
	res.send("Welcome to DearStranger.");
}


//Create or login a user
app.post('/createUser',[checkIfValidBody,checkIfUserExists,createUser]);

function checkIfValidBody(req,res,next){
	if(!req.body){
		res.status(400).send(baseRes(false,"No body"));
	}else if(hasValidBody(req.body,res)){
		next();
	}
}

function checkIfUserExists(req,res,next){
	var queryObj={};
	if(req.body.login_type=="google"){
		queryObj['googleID']=req.body.googleID;
	}else{
		queryObj['facebookID']=req.body.facebookID;
	}
	db.collection('users')
	.findOne(queryObj,(err,rec)=>{
		if(!rec){
			//user doesn't exist create one
			next();

		}else{

			//update session id and return it
			var sess_id=randomString();
			rec['session_id']=sess_id;
			db.collection('users').
			update({'_id':rec['_id']},rec,(err,count,status)=>{
				if(err) throw err;
				var reply=baseRes(true,"Successful");
				reply['id']=rec['_id'];
				reply['session_id']=sess_id;
				reply['new_user']=false;
				res.status(200).send(reply);
			});
		}
	});
}

function createUser(req,res,next){
	var sess_id=randomString();
	var user_obj=req.body;
	user_obj['session_id']=sess_id;
	db.collection('users')
	.insert(user_obj,(err,records)=>{
		if(err){
			res.status(500).send(baseRes(false,"Database error."));
		}else{
			var reply=baseRes(true,"Successful");
			reply['id']=records.insertedIds[0];
			reply['session_id']=sess_id;
			reply['new_user']=true;
			res.status(200).send(reply);
		}
	});
}


//Let user make a public post online
app.post('/makePublicPost',)