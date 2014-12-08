(function (angular, _) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldAutocomplete', autocompleteDirective);

	var defaultSuggestionCount = 8;

	function autocompleteDirective() {
		/*
		 * field-autocomplete
		 *   autocomplete-text-box text-box
		 */
		var elements = {
			autocomplete: angular.element('<input/>')
				.attr({
					class: 'autocomplete-text-box text-box',
					type: 'text',
					'ng-model': 'model.value',
					'ng-disabled': 'multi',
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

		function compile(element, attrs) {
			element.append(elements.autocomplete.clone());
			if (attrs.itemTemplate) {
				control.attr('typeahead-template-url', attrs.itemTemplate);
				element.removeAttr(attrs.$attrs.itemTemplate);
			}
			return link;
		}
		
		function link(scope, element, attrs, ctrl) {
			var choices = ctrl[0];
			var hints = ctrl[1];

			/* Value binding */
			scope.model = {
				value: undefined,
			};
			scope.multi = false;
			scope.queryChoices = queryChoices;
			scope.onSelect = onSelect;
			/* Choice controller */
			choices.onSelectionChanged = selectionChanged;
			choices.onModelChanging = modelChanging;

			/* DOM */
			var control = element.find('input');

			hints
				.defaults({
					regexp: false,
					filter: true,
					show: defaultSuggestionCount
				})
				.watch('multi', function (value) {
					scope.multi = value;
				});

			return;

			/* Get a list of suggestions */
			function queryChoices(query) {
				var searchRx, searchFn;
				if (!hints('filter') || query.length === 0) {
					searchFn = function () { return true; };
				} else {
					if (hints('regexp')) {
						searchRx = new RegExp(query, 'i');
					} else {
						searchRx = new RegExp('(^|\\W)' + query.replace(/[\.\+\*\?\(\)\[\]\|\\\"\^\$]/g, '\\\&'), 'i');
					}
					searchFn = function (str) { return searchRx.test(str); };
				}
				var select = scope.model.value ? scope.model.value.select : undefined;
				return choices.requery({ $query: query, $params: { select: select } })
					.then(function (items) {
						var remaining = hints('show');
						return _(items)
							.filter(function (item) {
								return remaining > 0 && searchFn(item.label) && !!(remaining--);
							});
					});
			}

			/* Model changing, get choice list containing new item */
			function modelChanging(select) {
				return choices.requery({ $params: { select: select } })
					.then(function () {
						return select;
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
					choices.viewChanged([item.index], 'replace');
				}
			}
		}
	}

})(window.angular, window._);
