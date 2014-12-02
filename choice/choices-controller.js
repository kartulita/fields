(function (angular, _) {
	'use strict';

	angular.module('battlesnake.fields')
		.controller('choicesController', choicesController)
		.directive('choices', choicesDirective);

	function choicesDirective($timeout) {
		return {
			restrict: 'A',
			require: ['choices', 'ngModel', 'hints'],
			controller: 'choicesController',
			priority: 1,
			scope: true,
			link: {
				pre: prelink,
				post: postlink
			}
		};

		function prelink(scope, element, attrs, ctrl) {
			var choices = ctrl[0];
			var ngModel = ctrl[1];

			/* ngModel => choices lookup */
			ngModel.$render = modelChangedChoices;

			/* Selected item */
			scope.selectionChanged = selectionChanged;

			return;

			/* Update view */
			function modelChangedChoices() {
				choices.modelChanged(ngModelController.$viewValue);
			}

			/* Seleted value changed (update model) */
			function selectionChanged(item) {
				ngModel.$setViewValue(item && item.select);
			}
		}

		function postlink(scope, element, attrs, ctrl) {
			var choices = ctrl[0];
			var ngModel = ctrl[1];
			var hints = ctrl[2];

			attrs.$observe('choices', choicesChanged);

			$timeout(initializeSelection, 0);

			return;

			/* Initialize selection (before choices have loaded) */
			function initializeSelection() {
				hints.watch('multi', choices.setMulti);
				choices.initSelection(ngModel.$viewValue);
			}
			
			/* Choices expression changed */
			function choicesChanged(expr) {
				choices.bindComprehension(expr);
			}
		}
	}

	function choicesController($scope, listComprehensionService) {
		var self = this;

		/* Call this from field directive to update model value */
		this.viewChanged = viewChanged;
		this.selectItem = selectItem;
		this.deselectItem = deselectItem;
		this.selectItems = selectItems;
		this.deselectItems = deselectItems;

		/* Called from choices directive when model value changed */
		this.modelChanged = modelChanged;

		/* Process the comprehension and bind the result */
		this.bindComprehension = bindComprehension;

		this.onSelectionChanged = undefined;
		this.onChoicesChanged = undefined;

		this.rebuildChoices = rebuildChoices;

		this.requery = requeryChoices;
		this.refresh = refreshChoices;
		this.isDynamic = getIsDynamic;

		this.setMulti = setMulti;
		this.isMulti = isMulti;

		/*
		 * Used internally to set the selection before the choices have been
		 * loaded from the underlying data source
		 */
		this.initSelection = initSelection;

		var preselect = undefined;
		var selected = [];
		var choices = undefined;
		var items = [];
		var grouped = false;
		var multi = false;

		var batch = 0;
		var pendingChange = false;

		return this;

		/*
		 * Prevents triggering of selectionChanged notification.  Tracks if an
		 * attempt to trigger the notification occurred, and if so, re-triggers
		 * it at the end of the batch operation.  Can be nested.
		 */
		function batchUpdate(fn) {
			batch++;
			try {
				fn();
			} finally {
				batch--;
				if (pendingChange && !batch) {
					notifySelectionChanged();
					pendingChange = false;
				}
			}
		}

		/*
		 * Notifies observers when the selection has changed.  During a batch
		 * operation (see batchUpdate), the notification is deferred until after
		 * the batch operation completes.  If called multiple times during a
		 * batch operation, only one notification is generated at the end of it.
		 */
		function notifySelectionChanged() {
			if (batch) {
				pendingChange = true;
				return;
			}
			$scope.selectionChanged(selected);
			if (self.onSelectionChanged) {
				self.onSelectionChanged(selected);
			}
		}

		/* Initializes the selection after link phase */
		function initSelection(select) {
			preselect = select;
		}

		/* Select an item, replacing previous selection if not in multi-mode */
		function selectItem(item) {
			if (_(selected).contains(item)) {
				return;
			}
			if (multi) {
				selected.push(item);
			} else {
				selected = [item];
			}
			notifySelectionChanged();
		}

		/* Deselect an item */
		function deselectItem(item) {
			if (!_(selected).contains(item)) {
				return;
			}
			selected.splice(selected.indexOf(item), 1);
			notifySelectionChanged();
		}

		/*
		 * Select multiple items unless in multi-mode in which case select first
		 * item in the array
		 */
		function selectItems(items) {
			if (multi) {
				batchUpdate(function () {
					_(items).forEach(selectItem);
				});
			} else {
				if (items && items.length) {
					selectItem(items[0]);
				} else {
					setSelection([]);
				}
				notifySelectionChanged();
			}
		}

		/* Deselect multiple items */
		function deselectItems(items) {
			batchUpdate(function () {
				_(items).forEach(deselectItem);
			});
		}

		/* Explicitly set the selected items */
		function setSelected(items) {
			if (_.intersection(items, selected).length === selected.length) {
				return;
			}
			if (multi) {
				selected = items ? items.slice() : [];
			} else {
				selected = (items && items.length) ? items[0] : [];
			}
			notifySelectionChanged();
		}

		function requeryChoices(/*args*/) {
			return choices.requery.apply(choices, arguments);
		}

		function refreshChoices(/*args*/) {
			return choices.refresh.apply(choices, arguments);
		}

		function getIsDynamic() {
			return choices.isDynamic;
		}

		function bindComprehension(comprehension) {
			choices = listComprehensionService(comprehension, $scope.$parent, choicesChanged);
			return choices.refresh();
		}

		function choicesChanged(newItems, isGrouped) {
			items = newItems;
			grouped = isGrouped;
			var memos = _(preselect !== undefined ? preselect : selected)
				.pluck('memo');
			preselect = undefined;
			rebuildChoices();
			setSelected(findMultipleByMemos(memos));
		}

		function rebuildChoices() {
			if (self.onChoicesChanged) {
				self.onChoicesChanged(items, grouped);
			}
		}

		function modelChanged(select) {
			if (multi) {
				setSelected(findMultipleBySelect(select));
			} else {
				setSelected(_(items).where({ select: select }));
			}
		}

		function viewChanged(indices, command) {
			var items = findMultipleByIndex(indices);
			if (command === 'replace') {
				setSelected(items);
			} else if (command === true || command === 'select') {
				if (multi) {
					selectItems(items);
				} else {
					setSelected(items.splice(1));
				}
			} else if (command === false || command === 'deselect') {
				if (multi) {
					deselectItems(items);
				} else {
					setSelected([]);
				}
			} else {
				throw new Error('Unknown selection command: ' + command);
			}
		}

		function setMulti(value) {
			value = !!value;
			if (value === multi) {
				return;
			}
			multi = value;
			if (!value) {
				selected.splice(1);
			}
			notifySelectionChanged();
		}

		function isMulti() {
			return multi;
		}

		function findMultipleByIndex(indices) {
			return _(items).filter(function (item) {
				return _(indices).contains(item.index);
			});
		}

		function findMultipleBySelect(select) {
			return _(items).filter(function (item) {
				return _(select).contains(item.select);
			});
		}

		function findMultipleByMemos(memos) {
			return _(items).filter(function (item) {
				return _(memos).contains(item.memo);
			});
		}

	}

})(window.angular, window._);
