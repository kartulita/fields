(function (angular) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldList', listDirective);

	function listDirective() {
		/*
		 * field-drop-down-list
		 *   <select>
		 */
		var elements = {
			select: angular.element(document.createElement('select')),
			option: angular.element(document.createElement('option')),
			optionInvalid: angular.element(document.createElement('option'))
				.attr({ value: -1, selected: true })
				.text(''),
			optgroup: angular.element(document.createElement('optgroup'))
		};
		return {
			restrict: 'E',
			replace: true,
			require: ['choices', '?hints'],
			template: '<div class="field-drop-down-list"/>',
			compile: compile,
			link: link
		};

		function compile(element) {
			element.append(elements.select.clone());
			return link;
		}

		function link(scope, element, attrs, ctrl) {
			var choices = ctrl[0];
			var hints = ctrl[1];

			/* Choice controller */
			choices.onSelectionChanged = selectionChanged;
			choices.onChoicesChanged = choicesChanged;

			/* DOM */
			var control = element.find('select');
			control.on('change', listItemSelected);
			var options;
			var invalidOption = elements.optionInvalid.clone();
			var isMulti = false;

			hints
				.defaults({
					multi: false,
					show: false
				})
				.watch('multi', function (value) {
					isMulti = !!value;
					control[0].multiple = isMulti;
				})
				.watch('show', function (value) {
					value = parseInt(value, 10);
					control[0].size =
						(value === false || value === true) ?
							isMulti ? 5 : 1 :
							value > 1 ? value : 1;
				});

			/* View value changed */
			function listItemSelected() {
				var indices = _(options).chain()
					.where({ selected: true })
					.pluck('value')
					.value();
				scope.$apply(function () {
					choices.viewChanged(indices, 'replace');
				});
			}

			/* Set selected item */
			function selectionChanged(items) {
				var indices = _(items).pluck('index');
				var any = false;
				_(options).forEach(function (option) {
					option.selected = _(indices)
						.contains(parseInt(option.value, 10));
					any = any || option.selected;
				});
				setInvalid(!any && !isMulti);
			}

			/* Add "invalid" option and select it / remove "invalid" option */
			function setInvalid(isInvalid) {
				var hasInvalid = invalidOption.parent().length;
				if (isInvalid) {
					if (!hasInvalid) {
						control.prepend(invalidOption);
					}
					_(options).forEach(function (option) {
						option.selected = false;
					});
					invalidOption.selected = true;
				} else if (hasInvalid) {
					invalidOption.selected = false;
					invalidOption.remove();
				}
			}

			/* ng jqLite does not support appending multiple elements */
			function appendMany(el, items) {
				_(items).forEach(function (item) {
					el.append(item);
				});
			}

			/* Rebuild list contents */
			function choicesChanged(items, grouped) {
				control.empty();
				options = [];
				appendMany(control, grouped ?
					createGroups(_(items).groupBy('group')) :
					createOptions(items));
			}

			/* Create option groups */
			function createGroups(items) {
				return _(items).map(createGroup);
			}

			/* Create an option group */
			function createGroup(opts, name) {
				var optgroup = elements.optgroup.clone()
					.attr('label', name);
				appendMany(optgroup, createOptions(opts));
				return optgroup;
			}

			/* Create options */
			function createOptions(opts) {
				return _(opts).map(createOption);
			}

			/* Create an option */
			function createOption(opt) {
				var option = elements.option.clone()
					.attr('value', opt.index)
					.text(opt.label);
				options.push(option[0]);
				return option;
			}
		}
	}

})(window.angular);
