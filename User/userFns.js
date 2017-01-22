var commons=require('../Commons/commons');
var database=require('../Database/dbFn');

var schema = {
  "properties": {
    "name": { "type": "string","minLength":1 },
    "email": { "type": "string","format":"email"},
    "login_type":{"enum":["google","facebook"]},
    "google_id":{"type":"string"},
    "facebook_id":{"type":"string"},
    "prof_pic":{"type":"string"}
  },
    "required":["name","email","login_type","prof_pic"],
    "oneOf": [
    { "required": [ "google_id" ] },
    { "required": [ "facebook_id" ] }
    ],
  "additionalProperties":false
};


function randomString() {
	var chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var result = '';
	for (var i = 12; i > 0; --i){ 
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
}

module.exports={

	checkForValidBody: function(req,res,next){
		var Ajv=require('ajv');
		var ajv=new Ajv();
		var validate=ajv.compile(schema);
		var valid=validate(req.body);
		if(valid){
			next();
		}else{
			var reply=commons.baseRes(false,"Failed");
			reply['error']=validate.errors;
			res.status(400).send(reply);
		}
	},

	checkIfUserExists: function(req,res,next){
		var queryObj={};
		if(req.body.login_type=="google"){
			queryObj['google_id']=req.body.google_id;
		}else{
			queryObj['facebook_id']=req.body.facebook_id;
		}
		database.getDB().collection('users')
		.findOne(queryObj,(err,rec)=>{
			if(!rec){
				//user doesn't exist create one
				next();

			}else{
				//update session id and return it
				var sess_id=randomString();
				rec['session_id']=sess_id;
				database.getDB().collection('users').
				update({'_id':rec['_id']},rec,(err,count,status)=>{
					if(err) throw err;
					var reply=commons.baseRes(true,"Successful");
					reply['id']=rec['_id'];
					reply['session_id']=sess_id;
					reply['new_user']=false;
					res.status(200).send(reply);
				});
			}
		});
	},

	createUser: function(req,res){
		var sess_id=randomString();
		var user_obj=req.body;
		user_obj['session_id']=sess_id;
		database.getDB().collection('users')
		.insert(user_obj,(err,records)=>{
			if(err){
				res.status(500).send(baseRes(false,"Database error."));
			}else{
				console.log("Inserted");
				var reply=commons.baseRes(true,"Successful");
				reply['id']=records.insertedIds[0];
				reply['session_id']=sess_id;
				reply['new_user']=true;
				res.status(200).send(reply);
			}
		});
	}

}