(function (angular) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldChoice', choiceDirective);

	/**
	 * @ngdoc directive
	 * @name field:choice
	 *
	 * @description
	 * Facade for creating choice fields.
	 *
	 * Recognised hints include:
	 *
	 *  * `many` (default): There are many possible options, choose an
	 *    implementation which requires O(<N) space for N items (e.g. drop-down
	 *    list).
	 *
	 *  * `not many`: There are not many possible options, choose an
	 *    implementation which displays all options individually (e.g.
	 *    radio-button list).
	 *
	 *  * `search`: Prefer an implementation which allows searching the list,
	 *    for example, a text-box with a fixed-list box, or an autocomplete.
	 *
	 *  * `multi`: Allow multiple choices to be selected at the same time, for
	 *    example: a check-box list, a text-box with a multi-select fixed-list
	 *    box, two linked fixed-list boxes (choices, selected) with add/remove
	 *    buttons or drag/drop.
	 *
	 * Future possible hints include:
	 * 
	 *  * `custom`: Allow user-defined custom values to be entered, for example
	 *    an autocomplete text-box which accepts values not in the list.  This
	 *    feature is currently not implemented, and should be thought out in
	 *    detail if it is to be compatible with the list comprehension patter.
	 *    This will consequently require the view to specify the name of a
	 *    function which generates `select` values from a user-specified `label`
	 *    value, or which generates entire objects for a given user `label`.
	 *
	 *  * `grouped`: Choices are grouped (i.e. `group by` clause in the
	 *    list comprehension expression).  Grouping does not require this hint
	 *    to be given, however it may be useful to have it in order to explicitly
	 *    request an implementation which supports grouping, or to disable
	 *    grouping in an implementation which supports it, even if the list
	 *    comprehension expression includes grouping.
	 *
	 * @param {list_comprehension} choices
	 * A {@link listComprehensionSyntax|list comprehension expression}
	 * specifying the data source used to generate the choice list, and
	 * optionally a data transformation or view-value<-->model-value mapping to
	 * use.
	 *
	 * @example
	 * <field title="Country" purpose="choice" ng-model="model.country"
	 *   choices="country.id as country.name group by country.continent from country in model.countries">
	 * </field>
	 */
	function choiceDirective(listComprehensionService, directiveProxyService, hintParseService) {
		return directiveProxyService.generateDirective(
			'div',
			function link(scope, element, attrs) {
				element.addClass('field-choice');
				var hints = hintParseService.parse(attrs.hints, 
					{
						many: true,
						search: false,
						multi: false
					});
				var implementation =
					hints.search ? 'autocomplete' :
					hints.many ? 'list' :
					'boolean-button-list';
				directiveProxyService('field:' + implementation, { hints: 'copy' }, scope, element, attrs);
			});
	}

})(window.angular);
