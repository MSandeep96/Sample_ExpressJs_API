//requirements
const express=require('express');
const mongoClient=require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const app=express();

var fileSys=require('fs');
var dataID=JSON.parse(fileSys.readFileSync('unique_ids.json'));
console.log(dataID);

mongoClient.connect("mongodb://sande96:queenrocks96@ds011228.mlab.com:11228/dear_stranger",(err,database)=>{
	if(err) return console.log(err);
	db=database;
	app.listen(3000,()=>{
		console.log("Database connected. Server is up and running!");
	});
});

//Parse the body of the request for json.
app.use(bodyParser.json());

//Send a greeting when root address is called
app.get('/',rootCall);

app.post('/createUser',createUser);


function genericReply(success,reason){
	var reply={
		'success':success,
		'comment':reason
	};
	return reply;
}

function writeDataID(id_var){
	dataID[id_var]++;
	fileSys.writeFile('unique_ids.json',JSON.stringify(dataID),(err)=>{
		if(err) throw err;
	});
}

function randomString() {
	var chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = 12; i > 0; --i){ 
    	result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function rootCall(req,res) {
	res.send("Welcome to DearStranger.");
}

function createUser(req,res){
	if(!req.body){
		
		res.sendStatus(400).send(genericReply(false,"Invalid body"));
	
	}else{
		
		var user_obj=req.body;
		user_obj['_id']=dataID['user_id'];
		user_obj['session_id']=randomString();
		db.collection('users')
		.insert(user_obj,(err,records)=>{
			if(err){
				res.sendStatus(500).send(genericReply(false,"Database error (ID probably already exists)"));
			}else{
				var reply={
					"success":true,
					"_id":user_obj['_id'],
					"session_id":user_obj['session_id']
				}
				res.sendStatus(200).send(reply);
				writeDataID('user_id');
			}
		});

	}
}