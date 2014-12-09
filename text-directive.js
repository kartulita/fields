(function (angular) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldText', textDirective);

	/**
	 * @ngdoc directive
	 * @name field:text
	 *
	 * @description
	 * Facade for creating text entry fields.
	 *
	 * @example
	 * <field title="Name" purpose="text" ng-model="model.name"
	 *   validators="not empty">
	 * </field>
	 */
	function textDirective(directiveProxyService) {
		return directiveProxyService(
			'div',
			[],
			function link(scope, element, attrs) {
				element.addClass('field-text');
				var implementation = 'text-button';
				return 'field:' + implementation;
			});
	}

})(window.angular);
