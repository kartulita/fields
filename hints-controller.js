(function (angular, _) {
	'use strict';

	angular.module('battlesnake.fields')
		.controller('hintsController', hintsController)
		.directive('hints', hintsDirective);

	function hintsDirective() {
		return {
			restrict: 'A',
			require: ['hints'],
			controller: 'hintsController',
			priority: 1,
			link: link
		};

		function link(scope, element, attrs, hints) {
			hints.reparse(attrs.hints);
			attrs.$observe('hints', reparseHints);

			return;

			function reparseHints(value) {
				hints.reparse(value);
			}
		}

	}

	function hintsController(hintParseService) {
		var hints = {};
		var defaults = {};
		var observers = {};

		get.watch = watch;
		get.unwatch = unwatch;
		get.reparse = reparse;
		get.setDefaults = setDefaults;

		var self = get;

		return get;

		/* Get the value of a hint */
		function get(name) {
			return hints[name];
		}

		/* Register observer then call it */
		function watch(name, observer, noInitial) {
			var obs = observers[name] || [];
			obs.push(observer);
			observers[name] = obs;
			/* Call observer */
			if (!noInitial) {
				observer(hints[name], hints[name]);
			}
			return self;
		}

		/* Unregister observer */
		function unwatch(name, observer) {
			var obs = observers[name] || [];
			obs = _(obs).without(observer);
			observers[name] = obs;
			return self;
		}

		/* Hints string changed */
		function reparse(hintStr) {
			var newHints = hintParseService.parse(hintStr);
			update(newHints, defaults);
			return self;
		}

		/* Set new defaults */
		function setDefaults(extras) {
			var newDefaults = _({}).defaults(defaults, extras);
			update(hints, newDefaults);
			return self;
		}

		/* Hints changed: notify observers */
		function update(newHints, newDefaults) {
			var oldHints = _({}).defaults(hints, defaults); 
			newHints = _({}).defaults(newHints, newDefaults);
			var notify = [];
			/* New/modified hints */
			_(newHints).forEach(function (val, key) {
				if (!_(oldHints).has(key) || oldHints[key] !== val) {
					_(observers[key]).forEach(function (observer) {
						notify.push({
							oldValue: oldHints[key],
							newValue: val,
							observer: observer
						});
					});
				}
			});
			/* Removed hints */
			_(oldHints).forEach(function (val, key) {
				if (!_(newHints).has(key)) {
					_(observers[key]).forEach(function (observer) {
						notify.push({
							oldValue: val,
							newValue: undefined,
							observer: observer
						});
					});
				}
			});
			/* Store new hints and defaults */
			hints = newHints;
			defaults = newDefaults;
			/* Notify observers */
			notify.forEach(function notifyObservers(notification) {
				notification.observer(notification.oldValue,
					notification.newValue);
			});
		}

	}

})(window.angular, window._);
