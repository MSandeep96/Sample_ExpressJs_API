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

##(.../createUser)
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

##(.../makePublicPost)
Can be used to make a public post by a user

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

##(.../makePrivatePost)
Can be used to make a private post by a user

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