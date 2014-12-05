(function (angular) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('field', fieldDirective)
		.directive('fieldAuto', fieldDirective)
		;

	/**
	 * @ngdoc directive
	 * @name field:auto
	 * @see {@link field}
	 */

	/**
	 * @ngdoc directive
	 * @name field
	 *
	 * @description
	 * Facade for creating form fields.  Completely isolates the implementation
	 * of the field from the controller.  The implementation is chosen based on
	 * two parameters, passed via attributes: a compulsory `purpose`, and some
	 * optional `hints`.
	 *
	 * `<field>` is also defined as `<field:auto>`
	 *
	 * @param {string} purpose
	 * Specifies the purpose of the field.  Examples include:
	 *
	 *  * choice
	 *  * boolean
	 *  * number
	 *  * date
	 *
	 * An unrecognised "purpose" will result in an error.
	 *
	 * You may also explicitly request a certain implementation by specifying the
	 * name of the implementation as the "purpose", e.g. "radio-button-list".
	 *
	 * @param {string} title
	 * Specifies the title of the field.  The field control is wrapped in a
	 * `<label/>` element with this title.
	 *
	 * @param {string} [hints]
	 * A comma-separated list of flags/values that are used to help choose and
	 * implementation.  The syntax is: hint,another,not negated,param=value.
	 * Most hints only need to be present (and can be explicitly "unspecified"
	 * by prefixing with "not ", e.g. "not large").  Some hints require a value,
	 * for example "size=8".
	 *
	 * Hints may be silently ignored by the facade.  Default values for various
	 * hints may also be dependent on the client's browser or device type, hence
	 * why the "not" keyword is allowed for explicitly saying "don't use this"
	 * hint.
	 *
	 * @example
	 * <field title="City" purpose="choice" hints="search" ng-model="model.city"
	 *   choices="model.cities">
	 * </field>
	 */
	function fieldDirective(directiveProxyService) {
		return directiveProxyService.generateDirective(
			'label',
			function link(scope, element, attrs) {
				var purpose = attrs.purpose;
				var title = attrs.title;
				element
					.addClass('field')
					.addClass('field-' + purpose + '-container')
					.append(
						angular.element('<div/>')
							.addClass('field-label')
							.text(title)
					);
				if (purpose === 'auto' || purpose === '' || typeof purpose !== 'string') {
					throw new Error('Field purpose cannot be "auto" or blank');
				}
				directiveProxyService('field:' + purpose, scope, element, attrs);
				return;
			});
	}

})(window.angular);
