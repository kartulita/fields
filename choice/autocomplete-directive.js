(function (angular, _) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldAutocomplete', autocompleteDirective);

	var defaultSuggestionCount = 8;

	function autocompleteDirective(hintParseService) {
		var elements = {
			autocomplete: angular.element('<input/>')
				.attr({
					class: 'autocomplete-text-box',
					type: 'text',
					'ng-model': 'model.value',
					typeahead: 'choice as choice.label for choice in queryChoices($viewValue)',
					'typeahead-on-select': 'onSelect($item, $model, $label)',
					'typeahead-loading': 'model.loading',
					'typeahead-editable': 'editable'
				})
		};
		return {
			restrict: 'E',
			replace: true,
			require: 'choices',
			template: '<div class="field-autocomplete"/>',
			scope: { },
			compile: compile,
			link: link
		};

		function compile(element) {
			element.append(elements.autocomplete.clone());
			return link;
		}
		
		function link(scope, element, attrs, choicesController) {
			var hints = hintParseService.parse(attrs.hints,
				{
					/*custom: false,*/
					regexp: false,
					nofilter: false,
					show: defaultSuggestionCount
				});
			/* Value binding */
			scope.model = {
				value: undefined,
			};
			scope.queryChoices = queryChoices;
			scope.onSelect = onSelect;
			/* Choice controller */
			choicesController.onSelectionChanged = selectionChanged;
			/* Custom values? */
			scope.editable = false; /*hints.custom;*/

			/* DOM */
			var control = element.find('input');

			return;

			/* Get a list of suggestions */
			function queryChoices($viewValue) {
				var searchRx, searchFn;
				if (hints.nofilter || $viewValue.length === 0) {
					searchFn = function () { return true; };
				} else {
					if (hints.regexp) {
						searchRx = new RegExp($viewValue, 'i');
					} else {
						searchRx = new RegExp('(^|\\W)' + $viewValue.replace(/[\.\+\*\?\(\)\[\]\|\\\"\^\$]/g, '\\\&'), 'i');
					}
					searchFn = function (str) { return searchRx.test(str); };
				}
				return choicesController.requery({ $viewValue: $viewValue })
					.then(function (items) {
						var remaining = parseInt(hints.show) || Infinity;
						return _(items)
							.filter(function (item) {
								return remaining > 0 && searchFn(item.label) && !!(remaining--);
							});
					});
			}

			/* Selection changed for any reason, update control */
			function selectionChanged(item) {
				/*
				 * Don't update the model if this is in response to items refresh
				 */
				if (document.activeElement !== control[0]) {
					scope.model.value = item;
				}
			}

			/* Item selected in control, update viewmodel */
			function onSelect(item) {
				if (item) {
					choicesController.viewChanged(item.index);
				}
			}
		}
	}

})(window.angular, window._);
