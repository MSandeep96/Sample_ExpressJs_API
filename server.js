//requirements
const express=require('express');
const mongoClient=require('mongodb').MongoClient;

const app=express();

mongoClient.connect("mongodb://sande96:queenrocks96@ds011228.mlab.com:11228/dear_stranger",(err,database)=>{
	if(err) return console.log(err);
	db=database;
	app.listen(3000,()=>{
		console.log("Database connected and is up and running!");
	});
});

//Send a greeting when root address is called
app.get('/',rootCall);


function rootCall(req,res) {
	res.send("Welcome to DearStranger.");
}