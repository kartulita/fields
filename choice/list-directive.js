(function (angular) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldList', listDirective);

	function listDirective() {
		var elements = {
			select: angular.element(document.createElement('select')),
			option: angular.element(document.createElement('option')),
			optgroup: angular.element(document.createElement('optgroup'))
		};
		return {
			restrict: 'E',
			replace: true,
			require: ['choices', 'hints'],
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

			hints
				.defaults({
					multi: false,
					show: 1
				})
				.watch('multi', function (value) {
					control.multiple = !!value;
				})
				.watch('show', function (value) {
					value = parseInt(value, 10);
					control.show = value > 1 ? value : 1;
				});

			/* View value changed */
			function listItemSelected() {
				var indices = _(options).chain()
					.where({ selected: true })
					.pluck('value')
					.map(function (val) {
						return parseInt(val, 10);
					})
					.value();
				scope.$apply(function () {
					choices.viewChanged(indices, 'replace');
				});
			}

			/* Set selected item */
			function selectionChanged(items) {
				_(options).forEach(function (option) {
					option.selected = !!_(items)
						.where({ index: parseInt(option.value, 10) });
				});
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
				options.push(option);
				return option;
			}
		}
	}

})(window.angular);
