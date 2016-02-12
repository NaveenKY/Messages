/** 
* @author Naveen Kumar <imnaveenyadav@gmail.com> 
* version: 1.0.0 
* https://github.com/NaveenKY/Messages/
*/ 
define(function (require) {

	var templatePage	= require('ldsh!templates/message'),
		rivets			= require('rivets');

	var MessageView = Backbone.View.extend({

		initialize: function() {
			this.template = templatePage;
			this.model = new Backbone.Model({chatMessages:''});
			this.collection = new Backbone.Collection();
			this.ws = new WebSocket("ws://localhost:7000/message?user="+app.userName);
			var that = this;
			this.ws.onmessage = function(message) {
				var data = JSON.parse(message.data);
				if (data.type === 'USER_LIST') {
					var users = data.users;
					that.collection.reset();
					users.forEach(function(user) {
						if (user !== app.userName) {
							var user = new Backbone.Model({'name': user});
							that.collection.add(user);
						}
					});
					if(that.selectedUser){
						that.$('#'+that.selectedUser).addClass('user-selected');
						that.$selectedUser = that.$('#'+that.selectedUser);
					}
				} else if (data.type === 'NEW_MESSAGE') {
					that.notifyMe(data.message);
					that.model.set("chatMessages", that.model.get("chatMessages") + " - " + data.from + " : " + data.message + "\n");
				}
			};
		},

		render: function(eventName) {
			$(this.el).html(this.template());
			this.binding = rivets.bind(this.el,{model:this.model, users:this.collection});
			return this;
		},
		events: {
			'click #send': 'sendMessage',
			'click .user-tile': 'selectUser',
			'keyup #message': 'sendMessageOnEnter'
		},
		notifyMe: function(message) {
			if (!("Notification" in window)) {
				console.log("This browser does not support system notifications");
			} else if (Notification.permission === "granted") {
				new Notification(message);
			} else if (Notification.permission !== 'denied') {
				Notification.requestPermission(function(permission) {
					if (permission === "granted") {
						new Notification(message);
					}
				});
			}
		},
		selectUser: function(e){
			e.preventDefault();
			this.selectedUser = e.currentTarget.id;
			if(this.$selectedUser) {
				$(this.$selectedUser).removeClass('user-selected ');
			}
			this.$selectedUser = e.currentTarget;
			$(e.currentTarget).addClass('user-selected ');
		},
		sendMessage: function(e){
			e.preventDefault();
			var newMessage = new Object();
			newMessage.type = "NEW_MESSAGE";
			newMessage.to = this.selectedUser;
			newMessage.message = this.model.get('message');
			this.ws.send(JSON.stringify(newMessage));
			this.model.set("chatMessages", this.model.get("chatMessages") + " - You : " + this.model.get('message') + "\n");
			this.model.set('message', '');
		},
		sendMessageOnEnter: function(e){
			if(e.originalEvent.keyCode === 13) {
				this.sendMessage(e);
			}
		}
	});
	return MessageView;
});