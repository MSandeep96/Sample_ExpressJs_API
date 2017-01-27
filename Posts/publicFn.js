var commons=require('../Commons/commons');
var database=require('../Database/dbFn');

var schema = {
	"properties": {
		"content":{"type":"string"},
		"written_by":{"type":"string"},
		"session_id":{"type":"string"},
		"written_by_name":{"type":"string"},
		"written_by_profpic":{"type":"string"}
	},
	"additionalProperties":false,
	"required":["content","written_by","session_id","written_by_name","written_by_profpic"]
};

module.exports={

	//TODO remove this
	testingFn: function(req,res){
		var body=req.body;
		body=body.map(function(val){
			val['createdAt']=new Date();
			val['star_count']=0;
			return val;
		});
		database.getDB().collection('public_posts')
		.insertMany(body,function(err,r){
			if(err) throw err;
			res.sendStatus(400);
		});
	},

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

	addPublicPost: function(req,res){
		req.body['createdAt']=new Date();
		req.body['star_count']=0;
		delete req.body['session_id'];
		database.getDB().collection('public_posts')
		.insert(req.body,(err,recs)=>{
			if(err){
				res.status(500).send(commons.baseRes(false,"Database error"));
				throw err;
			}else{
				var reply=commons.baseRes(true,"Successful");
				reply['createdAt']=(new Date(req.body['createdAt'])).getTime();
				reply['posted']=true;
				res.status(200).send(reply);
			}
		});
	},

	getPublicPosts: function(req,res){
		var ops={
			'sort':[['createdAt','desc']],
			'limit': 20
		};
		database.getDB().collection('public_posts')
		.find({},ops,(err,cursor)=>{
			if(err) throw err;
			cursor.toArray((err,docs)=>{
				docs=docs.map((item)=>{
					item['createdAt']=new Date(item['createdAt']).getTime();
					return item;
				});
				res.status(200).send(docs);
			});
		});
	},


	getPublicPostsInden: function(req,res){
		var objectId=require('mongodb').ObjectId;
		var timStamp=new Date(Number(req.params.last_timestamp));
		var query={
			"_id":{$lt:new objectId(req.params.last_id)},
			"createdAt":{$lte:timStamp}
		};
		var ops={
			'sort':[['createdAt','desc'],['_id','desc']],
			'limit':20
		};
		database.getDB().collection('public_posts')
		.find(query,ops,(err,cursor)=>{
			if(err) throw err;

			cursor.toArray((err,docs)=>{
				//TODO change date to millis
				if(docs.length>0){
					var rep=commons.baseRes(true,"Successful");
					rep['posts']=docs;
					res.status(200).send(docs);
				}else{
					res.status(200).send(commons.baseRes(false,"End of posts"));
				}
			});
		});
	}


}