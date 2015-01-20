(function (angular) {
	'use strict';
	/**
	 * @ngdoc module
	 * @module fields
	 * @requires dsl
	 * @requires directive-proxy
	 *
	 * @description
	 * Implements various field types, and also proxy directives which can
	 * automatically choose which implementation of a field type to use, based
	 * on the data to display and on optional "hint" attributes.
	 */

	angular.module('battlesnake.fields', ['battlesnake.directive-proxy', 'battlesnake.dsl', 'ui.bootstrap']);

})(window.angular);
