(function (angular) {
	'use strict';
	/**
	 * @ngdoc module
	 * @module battlesnake.fields
	 * @requires parsers
	 * @requires directive-proxy
	 * @requires {@link http://angular-ui.github.io/bootstrap/|UI Bootstrap}
	 * @requires {@link http://underscorejs.org|Underscore}
	 *
	 * @description
	 * Implements various field types, and also proxy directives which can
	 * automatically choose which implementation of a field type to use, based
	 * on the data to display and on optional "hint" attributes.
	 */

	angular.module('battlesnake.fields', ['battlesnake.directive-proxy', 'battlesnake.parsers', 'ui.bootstrap']);

})(window.angular);
