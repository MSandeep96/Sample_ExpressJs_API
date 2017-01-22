var commons=require('../Commons/commons');
var database=require('../Database/dbFn');

var schema = {
	"properties": {
		"content":{"type":"string"},
		"written_by":{"type":"string"},
		"session_id":{"type":"string"}
	},
	"additionalProperties":false,
	"required":["content","written_by","session_id"]
};

function updateRecord(res,task,id){
	task['assigned']=true;
	task['assigned_to']=id;
	delete task['session_id'];
	database.getDB().collection('private_posts')
	.update({'_id':task['_id']},task,(err,count,status)=>{
		if(err){
			res.status(500).send(commons.baseRes(false,"Database error"));
		}else{
			sendAssignedTask(res,task,id);
		}
	});
}

function sendAssignedTask(res,task,id){
	var reply=commons.baseRes(true,"Successful");
	reply['id_of_task']=task['_id'];
	reply['task_createdAt']=task['createdAt'];
	reply['task_content']=task['content'];
	reply['task_written_by']=task['written_by'];
	res.status(200).send(reply);
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

	checkValidLogin: function(req,res,next){
		var objectId=require('mongodb').ObjectId;
		var queryObj={
			'_id':new objectId(req.body.written_by)
		};
		database.getDB().collection('users')
		.findOne(queryObj,(err,rec)=>{
			if(err) throw err;
			if(!rec){
				res.status(403).send(commons.baseRes(false,"Invalid user. Logging you out."));
			}else if(rec['session_id']!=req.body.session_id){
				res.status(403).send(commons.baseRes(false,"Invalid session. Logging you out."));
			}else{
				next();
			}
		});
	},

	hasAnotherPost: function(req,res,next){
		var queryObj={
			'written_by':req.body['written_by']
		};
		database.getDB().collection('public_posts')
		.findOne(queryObj,(err,doc)=>{
			if(err) throw err;
			if(!doc){
				server.getDB().collection('private_posts')
				.findOne(queryObj,(errp,docp)=>{
					if(errp) throw errp;
					if(!docp){
						next();
					}else{
						res.status(400).send(commons.baseRes(false,"You need to wait 24 hrs from your last post."));
					}
				});
			}else{
				res.status(400).send(commons.baseRes(false,"You need to wait 24 hrs from your last post."));
			}
		})
	},

	addPrivatePost: function(req,res){
		req.body['createdAt']=new Date();
		req.body['assigned']=false;
		req.body['replied']=false;
		delete req.body['session_id'];
		database.getDB().collection('private_posts')
		.insert(req.body,(err,recs)=>{
			if(err){
				res.status(500).send(commons.baseRes(false,"Database error"));
				throw error;
			}else{
				var reply=commons.baseRes(true,"Successful");
				reply['createdAt']=(new Date(req.body['createdAt'])).getTime();
				reply['posted']=true;
				res.status(200).send(reply);
			}
		});
	},

	checkIfAlreadyAssigned: function(req,res,next){
		var query={
			'assigned_to':new objectId(req.body['_id'])
		};
		database.getDB().collection('replies')
		.findOne(query,(err,rec)=>{
			if(err) throw err;
			if(!rec){
				next();
			}else{
				res.status(400).send(commons.baseRes(false,"Already replied to task. Please wait for 24h from previous reply."));
			}
		});
	},

	assign_task: function(req,res){
		var query={
			'assigned':false
		};
		database.getDB().collection('private_posts')
		.findOne(query,(err,rec)=>{
			if(err) throw err;
			if(!rec){
				res.status(200).send(commons.baseRes(false,'No posts available. Sorry!'));
			}else{
				updateRecord(res,rec,req.body['_id']);
			}
		});
	},


	//TODO check if it's been 36 hours since the post
	addReply: function(req,res){
		//TODO sendPushNotif();
		var replyTask=req.body;
		replyTask['createdAt']=new Date();
		delete replyTask['session_id'];
		database.getDB().collection('replies')
		.insert(replyTask,(err,doc)=>{
			if(err) throw err;
			res.status(200).send(commons.baseRes(true,"Successful"));
		});
	}


}