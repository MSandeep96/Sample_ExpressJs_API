#DearStranger API

Built with Node.js and MongoDB. This api uses Express.js on top of Node for API building.
This is the API documentation.
It mentions the endpoints along with the params and possible output.

###The Base Response
For better support of Retrofit, all the responses are built from the base response

	var reply(success,comment){
		this.success=success;
		this.comment=comment;
	} 

There will always be a success tag which shows whether the action was successful or not. If not,
the comment indicates the reason.

##(.../createUser)
Checks whether user exists and creates a user for new credentials else logs in the user with a new Session ID.

Params
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