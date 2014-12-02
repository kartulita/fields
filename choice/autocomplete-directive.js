(function (angular, _) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldAutocomplete', autocompleteDirective);

	var defaultSuggestionCount = 8;

	function autocompleteDirective() {
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
			require: ['choices', '?hints'],
			template: '<div class="field-autocomplete"/>',
			scope: { },
			compile: compile,
			link: link
		};

		function compile(element) {
			element.append(elements.autocomplete.clone());
			return link;
		}
		
		function link(scope, element, attrs, ctrl) {
			var choices = ctrl[0];
			var hints = ctrl[1];

			/* Value binding */
			scope.model = {
				value: undefined,
			};
			scope.queryChoices = queryChoices;
			scope.onSelect = onSelect;
			/* Choice controller */
			choices.onSelectionChanged = selectionChanged;

			/* DOM */
			var control = element.find('input');

			hints.defaults({
				regexp: false,
				filter: true,
				show: defaultSuggestionCount
			});

			return;

			/* Get a list of suggestions */
			function queryChoices($viewValue) {
				var searchRx, searchFn;
				if (hints('filter') || $viewValue.length === 0) {
					searchFn = function () { return true; };
				} else {
					if (hints.regexp) {
						searchRx = new RegExp($viewValue, 'i');
					} else {
						searchRx = new RegExp('(^|\\W)' + $viewValue.replace(/[\.\+\*\?\(\)\[\]\|\\\"\^\$]/g, '\\\&'), 'i');
					}
					searchFn = function (str) { return searchRx.test(str); };
				}
				return choices.requery({ $viewValue: $viewValue })
					.then(function (items) {
						var remaining = parseInt(hints('show')) || Infinity;
						return _(items)
							.filter(function (item) {
								return remaining > 0 && searchFn(item.label) && !!(remaining--);
							});
					});
			}

			/* Selection changed for any reason, update control */
			function selectionChanged(items) {
				/*
				 * Don't update the model if this is in response to items refresh
				 */
				if (document.activeElement !== control[0]) {
					scope.model.value = items.length ? items[0] : undefined;
				}
			}

			/* Item selected in control, update viewmodel */
			function onSelect(item) {
				if (item) {
					choices.selectItem(item);
				}
			}
		}
	}

})(window.angular, window._);