//requirements
const express=require('express');
const mongoClient=require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const objectId=require('mongodb').ObjectId;

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
function reply(success,comment){
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

function hasValidParamsPubPost(body,res){
	if(body.content==""){
		res.status(400).send(baseRes(false,"Invalid content."));
		return false;
	}
	if(body.starCount!=undefined){
		res.status(400).send(baseRes(false,"Invalid starCount, counterfeit detected."));
		return false;
	}
	return true;
}

function hasValidParamsPrivPost(body,res){
	if(body.content==""){
		res.status(400).send(baseRes(false,"Invalid content"));
		return false;
	}
	if(body.assigned!=undefined || body.read!=undefined || body.replied!=undefined){
		res.status(400).send(baseRes(false,"Invalid options"));
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
app.post('/makePublicPost',[checkValParsPubPost,checkValidLogin,hasAnotherPost,addPublicPost]);

function checkValParsPubPost(req,res,next){
	if(!req.body){
		res.status(400).send(baseRes(false,"No body"));	
	}else if(hasValidParamsPubPost(req.body,res)){
		next();
	}
}

function checkValidLogin(req,res,next){
	var queryObj={
		'_id':new objectId(req.body.written_by)
	};
	db.collection('users')
	.findOne(queryObj,(err,rec)=>{
		if(err) throw err;
		if(!rec){
			res.status(403).send(baseRes(false,"Invalid user. Logging you out."));
		}else if(rec['session_id']!=req.body.session_id){
			res.status(403).send(baseRes(false,"Invalid session. Logging you out."));
		}else{
			next();
		}
	});
}

function hasAnotherPost(req,res,next){
	var queryObj={
		'written_by':req.body['written_by']
	};
	db.collection('public_posts')
	.findOne(queryObj,(err,doc)=>{
		if(err) throw err;
		if(!doc){
			db.collection('private_posts')
			.findOne(queryObj,(errp,docp)=>{
				if(errp) throw errp;
				if(!docp){
					next();
				}else{
					res.status(400).send(baseRes(false,"You need to wait 24 hrs from your last post."));
				}
			});
		}else{
			res.status(400).send(baseRes(false,"You need to wait 24 hrs from your last post."));
		}
	})
}

function addPublicPost(req,res){
	req.body['createdAt']=new Date();
	req.body['star_count']=0;
	delete req.body['session_id'];
	db.collection('public_posts')
	.insert(req.body,(err,recs)=>{
		if(err){
			res.status(500).send(baseRes(false,"Database error"));
			throw err;
		}else{
			var reply=baseRes(true,"Successful");
			reply['createdAt']=(new Date(req.body['createdAt'])).getTime();
			reply['posted']=true;
			res.status(200).send(reply);
		}
	});
}


//@TO-DO(remove) for testing
app.post('/makePublicPost/test',function(req,res){
	var body=req.body;
	body=body.map(function(val){
		val['createdAt']=new Date();
		val['star_count']=0;
		return val;
	});
	db.collection('public_posts')
	.insertMany(body,function(err,r){
		if(err) throw err;
		console.log(r);
		res.sendStatus(400);
	});
});


//make private posts
app.post('/makePrivatePost',[checkValParsPrivPost,checkValidLogin,hasAnotherPost,addPrivatePost]);

function checkValParsPrivPost(req,res,next){
	if(!req.body){
		res.status(400).send("No body");
	}else if(hasValidParamsPrivPost(req.body,res)){
		next();
	}
}

function addPrivatePost(req,res){
	req.body['createdAt']=new Date();
	req.body['assigned']=false;
	req.body['read']=false;
	req.body['replied']=false;
	delete req.body['session_id'];
	db.collection('private_posts')
	.insert(req.body,(err,recs)=>{
		if(err){
			res.status(500).send(baseRes(false,"Database error"));
			throw error;
		}else{
			var reply=baseRes(true,"Successful");
			reply['createdAt']=(new Date(req.body['createdAt'])).getTime();
			reply['posted']=true;
			res.status(200).send(reply);
		}
	});
}


//Get public posts, endpoint gives the latest twenty posts.
app.get('/getPublicPosts',getPublicPosts);

function getPublicPosts(req,res){
	var ops={
		'sort':[['createdAt','desc']],
		'limit': 20
	};
	db.collection('public_posts')
	.find({},ops,(err,cursor)=>{
		if(err) throw err;

		cursor.toArray((err,docs)=>{
			res.status(200).send(docs);
		});
	});
}


//get public requests(with indentation), append last id and last timestamp in millis
app.get('/getpublicposts/:last_id/:last_timestamp',getPublicPostsInden);

function getPublicPostsInden(req,res){
	var timStamp=new Date(Number(req.params.last_timestamp));
	var query={
		"_id":{$lt:new objectId(req.params.last_id)},
		"createdAt":{$lte:timStamp}
	};
	var ops={
		'sort':[['createdAt','desc'],['_id','desc']],
		'limit':20
	};
	db.collection('public_posts')
	.find(query,ops,(err,cursor)=>{
		if(err) throw err;

		cursor.toArray((err,docs)=>{
			if(docs.length>0){
				var rep=baseRes(true,"Successful");
				rep['posts']=docs;
				res.status(200).send(docs);
			}else{
				res.status(200).send(baseRes(false,"End of posts"));
			}
		});
	});
}