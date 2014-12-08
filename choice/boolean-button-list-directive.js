(function (angular) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldBooleanButtonList', booleanButtonListDirective);

	function booleanButtonListDirective(l10n_fields) {
		/*
		 * element
		 *   dummy
		 *   boolean-button-select-all
		 *     select-all-button boolean-button
		 *     select-all-label boolean-button-label
		 *   boolean-button-group-container
		 *     boolean-button-select-group
		 *       select-group-button boolean-button
		 *       select-group-label boolean-button-label
		 *     boolean-items
		 *       boolean-item
		 *         boolean-button
		 *         boolean-button-label
		 *
		 * element
		 *   dummy
		 *   boolean-button-select-all
		 *     select-all-button boolean-button
		 *     select-all-label boolean-button-label
		 *   boolean-items
		 *     boolean-item
		 *       boolean-button
		 *       boolean-button-label
		 */
		var elements = {
			dummy: angular.element('<input type="checkbox" style="display:none;"/>'),
			item: angular.element('<label class="boolean-item"/>'),
			radio: angular.element('<input class="boolean-button" type="radio"/>'),
			check: angular.element('<input class="boolean-button" type="checkbox"/>'),
			label: angular.element('<span class="boolean-button-label"/>'),
			group: angular.element('<span class="boolean-button-group"/>'),
			items: angular.element('<span class="boolean-items"/>'),
			selectAll: angular.element('<label class="boolean-button-select-all"/>'),
			selectGroup: angular.element('<label class="boolean-button-select-group"/>'),
		};
		elements.selectAll
			.append(elements.check.clone().addClass('select-all-button'))
			.append(elements.label.clone().addClass('select-all-label'));
		elements.selectGroup
			.append(elements.check.clone().addClass('select-group-button'))
			.append(elements.label.clone().addClass('select-group-label'));
		var groupIndex = 0;
		return {
			restrict: 'E',
			replace: true,
			require: ['choices', '?hints'],
			template: '<div class="field-boolean-button-list"/>',
			compile: compile,
			link: link
		};

		function compile() {
			return link;
		}
		
		function link(scope, element, attrs, ctrl) {
			var choices = ctrl[0];
			var hints = ctrl[1];

			/* Choice controller */
			choices.onSelectionChanged = selectionChanged;
			choices.onChoicesChanged = choicesChanged;

			/* DOM */
			var thisGroup = 'field-boolean-button-list-' + groupIndex++;
			var buttons = [];
			var selectAllItem = elements.selectAll.clone();
			var groups = {};

			var isMulti = false;
			var showSelectGroup = false;
			var showSelectAll = false;
			
			hints
				.defaults({
					multi: false,
					'group': false,
					'all': false
				})
				.watch('multi', function (value) {
					isMulti = value;
					angular.element(buttons).attr('type', value ? 'checkbox' : 'radio');
					updateGroupButtons();
				})
				.watch('group', function (value) {
					showSelectGroup = value;
					updateGroupButtons();
				})
				.watch('all', function (value) {
					showSelectAll = value;
					updateGroupButtons();
				});

			return;

			/* Set state of multiple boolean buttons */
			function selectMultiple(buttons, selected) {
				angular.element(buttons)
					.prop({
						checked: selected,
						indeterminate: false
					});
				buttonSelected();
			}

			/* Select all options in a group */
			function selectGroup(name, selected) {
				selectMultiple(groups[name].items, selected);
			}

			/* Select all options */
			function selectAll(selected) {
				selectMultiple(buttons, selected);
				selectMultiple(_(groups).pluck('button'), selected);
			}

			/* Update the state of a group button */
			function updateGroupButton(button, items) {
				var all = true, none = true;
				if (isMulti) {
					_(items).forEach(function (item) {
						item = angular.element(item);
						all = all && item.prop('checked') && !item.prop('indeterminate');
						none = none && !item.prop('checked') && !item.prop('indeterminate');
					});
				}
				angular.element(button)
					.prop({
						checked: all,
						indeterminate: all === none
					});
			}

			/* Update the state of the "all" button */
			function updateGroupButtons() {
				_(groups).chain()
					.values()
					.each(function (group) {
						var button = group.button;
						updateGroupButton(button, group.items);
						var visible = isMulti && showSelectGroup;
						button
							.prop('disabled', !visible)
							.css('display', visible ? '' : 'none')
					});
				var button = selectAllItem
					.find('input');
				updateGroupButton(button, buttons);
				var visible = isMulti && showSelectAll;
				selectAllItem
					.css('display', visible ? '' : 'none');
				button
					.prop('disabled', !visible)
			}

			/* Button selected */
			function buttonSelected() {
				var indices = _(buttons).chain()
					.where({ checked: true })
					.pluck('value')
					.value();
				choices.viewChanged(indices, 'replace');
			}

			/* Set selected item */
			function selectionChanged(items) {
				_(buttons).forEach(function (button) {
					button.checked = _(items)
						.findWhere({ index: parseInt(button.value, 10) });
				});
				updateGroupButtons();
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
				groups = {};
				selectAllItem = elements.selectAll.clone();
				selectAllItem
					.find('span')
					.text(l10n_fields.selectAllNone);
				selectAllItem
					.find('input')
					.on('change', function () {
						var checked = this.checked;
						scope.$apply(function () {
							if (showSelectAll) {
								selectAll(checked);
							}
						});
					});
				element.append(selectAllItem);
				if (grouped) {
					appendMany(element,
						createGroups(_(items).groupBy('group')));
				} else {
					var itemsElement = elements.items.clone();
					appendMany(itemsElement, createOptions(items));
					element.append(itemsElement);
				}
				updateGroupButtons();
			}

			/* Create option groups */
			function createGroups(items) {
				return _(items).map(createGroup);
			}

			/* Create an option group */
			function createGroup(opts, name) {
				var group = elements.group.clone();
				var selectGroupItem = elements.selectGroup.clone();
				var items = elements.items.clone();
				group.append(selectGroupItem);
				group.append(items);
				selectGroupItem.find('span')
					.text(name);
				selectGroupItem
					.find('input')
					.on('change', function () {
						var checked = this.checked;
						scope.$apply(function () {
							if (showSelectGroup) {
								selectGroup(name, checked);
							}
						});
					})
				var buttons = createOptions(opts);
				appendMany(items, buttons);
				groups[name] = {
					items: _(buttons).map(function (item) {
						return angular.element(item).find('input')[0];
					}),
					header: selectGroupItem,
					button: selectGroupItem.find('input')
				};
				return group;
			}

			/* Create options */
			function createOptions(opts) {
				return _(opts).chain().map(createOption).flatten().value();
			}

			/* Create an option */
			function createOption(opt) {
				var label = elements.label.clone()
					.text(opt.label);
				var button = (isMulti ? elements.check : elements.radio).clone()
					.attr('name', thisGroup)
					.attr('value', opt.index);
				var item = elements.item.clone()
					.append(button)
					.append(label);
				button.on('change', function () {
					scope.$apply(function () {
						buttonSelected();
					});
				});
				buttons.push(button[0]);
				return item;
			}
		}
	}

})(window.angular);
