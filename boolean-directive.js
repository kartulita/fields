(function (angular) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldBoolean', booleanDirective);

	/**
	 * @ngdoc directive
	 * @name field:boolean
	 *
	 * @description
	 * Facade for creating boolean fields.
	 *
	 * @param {expression} [ng-true-value]
	 * The value corresponding to `true`
	 *
	 * @param {expression} [ng-false-value]
	 * The value corresponding to `false`
	 *
	 * @example
	 * <field title="Awesome mode" purpose="boolean" ng-model="model.awesome"
	 *   ng-true-value="'This is awesome'" ng-false-value="':('">
	 * </field>
	 */
	function booleanDirective(directiveProxyService) {
		return directiveProxyService.generateDirective(
			'div',
			function link(scope, element, attrs) {
				element.addClass('field-boolean');
				var implementation = 'boolean-button';
				directiveProxyService('field:' + implementation, scope, element, attrs);
			});
	}

})(window.angular);
