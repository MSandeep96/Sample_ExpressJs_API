#DearStranger API

Built with Node.js and MongoDB. This api uses Express.js on top of Node for API building.
This is the API documentation.
It mentions the endpoints along with the params and possible output.

###The Base Response
For better support of Retrofit, all the responses are built from the base response

	function reply(success,comment){
		this.success=success;
		this.comment=comment;
	} 

There will always be a success tag which shows whether the action was successful or not. If not,
the comment indicates the reason.

##(.../createUser) @POST
Checks whether user exists and creates a user for new credentials else logs in the user with a new Session ID.

>Params

	{
		name:"A valid name is needed",
		login_type:"Must be facebook or google",
		google_id:"Google ID",(or)
		facebook_id:"Facebook ID",
		prof_pic:"Link to profile pic",
	}

Reply

>New User

	{
  	  "success": true,
  	  "comment":"successful",
	  "id": "587e6766aa029a0f486526b6",
	  "session_id": "C0tWFnx1SENO",
	  "new_user": true
	}

>Existing User

	{
  	  "success": true,
  	  "comment":"successful",
	  "id": "587e6766aa029a0f486526b6",
	  "session_id": "C0tWFnx1SENO", (new session id)
	  "new_user": false
	}

>Errors

	{
		"success":false,
		"comment":"Invalid login type"
	}

##(.../makePublicPost) @POST
Can be used to make a public post by a user. Collection of public posts have a TTL of 24 hours.
Can't make a new post if there is a post within the last 24hrs.

>Params

	{
		'content':"Content of the post",
		'written_by':userID,
		'session_id':sessionID,
		'writtenByName':user's name,(redundancy for mongo)
		'writtenByProfPic':user's prof pic,(redundancy)
	}

>Reply
	
	{
  		"success": true,
  		"comment": "Successful",
  		"created_on": 1484719632317,
  		"posted": true,
  		"expires_on": 1484806032317
	}

>Errors

403 errors are issued when user_id(written_by) and session_id do not match. The user must be logged out
when a 403 status is sent. BaseResponses are present for other errors.

##(.../makePrivatePost) @POST
Can be used to make a private post by a user. Collection of private posts have a TTL of 24 hours.
Can't make a new post if there is a post within the last 24 hrs.

>Params

	{
		'content':"Awesome raunchy stuff",
		'written_by':userID,
		'session_id':sessionID
	}

>Reply

	{
  		"success": true,
  		"comment": "Successful",
  		"created_on": 1484722135580,
  		"posted": true,
  		"expires_on": 1484808535580
	}

>Errors

Same as public post creation.

##(.../getPublicPosts) @GET
This endpoint is used for fetching the first 20 public posts. No params are required. Truly in the public domain.

>Reply

	[
	  {
	    "_id": "587f46604f69611b7cbb87d4",
	    "content": "Nulla nisl. Nunc nisl. Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa. Donec dapibus. Duis at velit eu est congue elementum. In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo.",
	    "written_by": "4852ab92-b0f1-4fe2-9961-79aaaf26fe53",
	    "session_id": "f7ccecfc-11ea-4731-8946-a789bbc1b0ab",
	    "createdAt": "2017-01-18T10:41:36.450Z",
	    "star_count": 0
	  },
	  .
	  .
	  .
	  20 posts
	]

##(.../getPublicPosts/:last_id/:last_timestamp) @GET
This endpoint helps with pagination, send the id of the last post in the previous call along with the timestamp of that post. 
Timestamp needs to be in milliseconds. The call then returns twenty posts after those posts.

>Reply
>>Same as getPublicPosts

>Last call

	{
		'success':false,
		'comment':End of posts
	}


