define(function (require) {

	require(['backbone', 'app/Router', 'rivets', 'validation'], function(Backbone, AppRouter, rivets){

		Backbone.View.prototype.close = function () {
			console.log('Closing view ' + this);
			if (this.beforeClose) {
				this.beforeClose();
			}
			this.remove();
			this.unbind();
		};

		rivets.adapters[':'] = {
			subscribe: function(obj, keypath, callback) {
				if (obj instanceof Backbone.Collection) {
					obj.on('add remove reset', callback);
				}
				obj.on('change:' + keypath, callback);
			},
			unsubscribe: function(obj, keypath, callback) {
				if (obj instanceof Backbone.Collection) {
					obj.off('add remove reset', callback);
				}
				obj.off('change:' + keypath, callback);
			},
			read: function(obj, keypath) {
				return obj instanceof Backbone.Collection ? obj.models : obj.get(keypath);
			},
			publish: function(obj, keypath, value) {
				obj.set(keypath, value);
			}
		};

		Backbone.Validation.configure({
			forceUpdate: true
		});

		_.extend(Backbone.Validation.callbacks, {
			valid: function (view, attr/* , selector */) {
				var $el = view.$('[name=' + attr + ']'), 
					$group = $el.closest('.form-group');
				
				$group.removeClass('has-error');
				$group.find('.help-block').html('');
			},
			invalid: function (view, attr, error /*, selector*/) {
				var $el = view.$('[name=' + attr + ']'), 
					$group = $el.closest('.form-group');
				
				$group.addClass('has-error');
				$group.find('.help-block').html(error).removeClass('hidden');
			}
		});
		
		_.extend(Backbone.Validation.validators, {
			validModel: function (value, attr/* , customValue, model */) {
				if (value && !value.isValid(true)) {
					return 'Invalid ' + attr;
				}
			},
			validCollection: function (value, attr/*, customValue , model */) {
				var errors = value.map(function (entry) {
					return entry.isValid(true);
				});
				if (_.indexOf(errors, false) !== -1) {
					return 'Invalid collection of ' + attr;
				}
			},
			minPlus: function (value, attr, customValue, model) {
				if (value && model.get(customValue) && value < model.get(customValue)) {
					return $.t("APP:validMsg.invalidEndDate");
				}
			}
		});

		app = new AppRouter();
		Date.prototype.sameDay = function(d) {
			return this.getFullYear() === d.getFullYear() && this.getDate() === d.getDate() && this.getMonth() === d.getMonth();
		};
		app.dialog = function(view, options){
			var dialogWidth = options.width || ($(window).width() - 180);
			var dialogHeight = options.height || ($(window).height() * 0.3);
			var diagTitle = options.title || 'Modal Dialog';
			$('#dialog').css('display', 'block');
			$('#dialogContent').css('height', dialogHeight)
						.css('width', dialogWidth);
		};
		app.removeDialog = function(){
			$('#dialog').css('display', 'none');
		};

		Backbone.history.start();
	});
});
