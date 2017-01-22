const mongoClient=require('mongodb').MongoClient;
var db;
var connected=false;

function startConnection(){
	mongoClient.connect("mongodb://sande96:queenrocks96@ds011228.mlab.com:11228/dear_stranger",(err,database)=>{
		if(err) return console.log(err);
		db=database;
		connected=true;
		var server=require("../server");
		server.databaseConnected();
	});
}


module.exports={
	
	connect:function(){
		startConnection();
	},

	getDB:function(){
		if(connected)
			return db;
	}
}