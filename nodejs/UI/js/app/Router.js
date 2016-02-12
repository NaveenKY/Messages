define(function (require) {

		require('routefilter');

	var Router = Backbone.Router.extend({
		initialize: function() {
			//$('#header').html((new HeaderView()).render().el);
			//$('#footer').html((new FooterView()).render().el);
		},
		before: function(route, options){
			if(!app.session && route!=='') {
				app.navigate('', {trigger: true});
				return false;
			}
		},
		routes: {
			"" : "home",
			"*actions" : "home"
		},
		home: function() {
			require(['views/HomeView'], function(HomeView){
				var view = new HomeView();
				$('#content').html(view.render().el);
				$('#header').html('');
				$('#footer').html('');
			});
		}
	});
	return Router
});