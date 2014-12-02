(function (angular) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldBooleanButtonList', booleanButtonListDirective);

	function booleanButtonListDirective() {
		var elements = {
			dummy: angular.element('<input type="checkbox" style="display:none;"/>'),
			item: angular.element('<label class="boolean-item"/>'),
			radio: angular.element('<input class="boolean-button radio-button" type="radio"/>'),
			check: angular.element('<input class="boolean-button check-button" type="check"/>'),
			group: angular.element('<span class="boolean-button-group"/>'),
			buttonLabel: angular.element('<span class="boolean-button-label"/>'),
			groupLabel: angular.element('<span class="boolean-group-label"/>')
		};
		var groupIndex = 0;
		return {
			restrict: 'E',
			replace: true,
			require: 'choices',
			template: '<div class="field-boolean-button-list"/>',
			compile: compile,
			link: link
		};

		function compile() {
			return link;
		}
		
		function link(scope, element, attrs, choicesController) {
			/* Choice controller */
			choicesController.onSelectionChanged = selectionChanged;
			choicesController.onChoicesChanged = choicesChanged;

			/* DOM */
			var thisGroup = 'field-boolean-button-list-' + groupIndex++;
			var buttons = [];

			hints
				.defaults({
					multi: false
				})
				.watch('multi', function () {
					choices.rebuildChoices();
				});

			return;

			/* Button selected */
			function buttonSelected() {
				var indices = _(buttons).chain()
					.where({ checked: true })
					.pluck('value')
					.map(function (value) { return parseInt(value, 10); })
					.value();
				scope.$apply(function () {
					choicesController.viewChanged(indices, 'replace');
				});
			}

			/* Set selected item */
			function selectionChanged(items) {
				_(buttons).forEach(function (button) {
					button.checked = _(items)
						.findWhere({ index: parseInt(button.value, 10) });
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
				element
					.empty()
					.append(elements.dummy.clone());
				buttons = [];
				appendMany(element, grouped ?
					createGroups(_(items).groupBy('group')) :
					createOptions(items));
			}

			/* Create option groups */
			function createGroups(items) {
				return _(items).map(createGroup);
			}

			/* Create an option group */
			function createGroup(opts, name) {
				var label = elements.groupLabel.clone()
					.text(name);
				var group = elements.group.clone()
					.append(label);
				appendMany(group, createOptions(opts));
				return group;
			}

			/* Create options */
			function createOptions(opts) {
				return _(opts).chain().map(createOption).flatten().value();
			}

			/* Create an option */
			function createOption(opt) {
				var label = elements.buttonLabel.clone()
					.text(opt.label);
				var button = (hints.multi ? elements.check : elements.radio).clone()
					.attr('name', thisGroup)
					.attr('value', opt.index);
				var item = elements.item.clone()
					.append(button)
					.append(label);
				button.on('change', buttonSelected);
				buttons.push(button[0]);
				return item;
			}
		}
	}

})(window.angular);
