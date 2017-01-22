function reply(success,comment){
	this.success=success;
	this.comment=comment;
};

module.exports={

	baseRes: function(success,reason){
		return new reply(success,reason);
	}
}