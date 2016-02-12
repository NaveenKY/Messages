/** 
* @author Naveen Kumar <imnaveenyadav@gmail.com> 
* version: 1.0.0 
* https://github.com/NaveenKY/Messages/
*/ 
define(function (require) {

	var templatePage	= require('ldsh!templates/home')
		,rivets			= require('rivets');

	var HomeView = Backbone.View.extend({

		initialize: function() {
			this.template = templatePage;
			this.model = new Backbone.Model();
		},
		render: function(eventName) {
			$(this.el).html(this.template());
			this.binding = rivets.bind(this.el,{model:this.model});
			return this;
		},
		events: {
			'click #continue': 'enterChatRoom',
			'keyup #userName': 'enterChatRoomOnEnter'
		},
		enterChatRoomOnEnter: function(e){
			if(e.originalEvent.keyCode === 13) {
				this.enterChatRoom(e);
			}
		},
		enterChatRoom: function(e){
			e.preventDefault();
			if(this.model.get('userName')) {
				app.userName = this.model.get('userName');
				require(['views/MessageView'], function(MessageView){
					$('#content').html((new MessageView()).render().el);
				});
			}
		},
		destroy: function() {
			return Backbone.View.prototype.remove.apply(this, arguments);
		}
	});
	return HomeView;
});