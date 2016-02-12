/** 
* @author Naveen Kumar <imnaveenyadav@gmail.com> 
* version: 1.0.0 
* https://github.com/NaveenKY/Messages/
*/ 

define(function (require) {
	var User = Backbone.Model.extend({
		defaults: {
			salutation: 'Mr.',
			profileType: 'USER'
		},
		validation: {
			salutation:{
				required: true
			}
			,firstName:{
				required: true
			}
			,lastName:{
				required: true
			}
			,role:{
				required: true
			}
			,userName:{
				required: true
			}
			,email:{
				required: true,
				pattern: 'email'
			}
			,password:{
				required: true,
				minLength: 8
			}
			,confirmPassword:{
				equalTo: 'password',
				msg: 'The passwords does not match'
			}
		}
	});
	return User;
});