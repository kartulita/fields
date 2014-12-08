(function (angular) {
	'use strict';

	angular.module('battlesnake.fields')
		.directive('fieldBooleanButton', booleanButtonDirective);

	function booleanButtonDirective() {
		/*
		 * field-boolean-button
		 *   boolean-item
		 *     boolean-button
		 *     boolean-button-label
		 */
		var elements = {
			item: angular.element('<label class="boolean-item"/>'),
			check: angular.element('<input class="boolean-button" type="checkbox"/>'),
			buttonLabel: angular.element('<span class="boolean-button-label" ng-bind="label"/>'),
		};
		return {
			restrict: 'E',
			replace: true,
			require: 'ngModel',
			template: '<div class="field-boolean-button"/>',
			scope: {
				trueValue: '=trueValue',
				falseValue: '=falseValue',
				label: '@label'
			},
			compile: compile,
			link: link
		};

		function compile(element, attrs) {
			var label = elements.buttonLabel.clone();
			var button = elements.check.clone();
			var item = elements.item.clone()
				.append(button)
				.append(label);
			element.append(item);
			return link;
		}

		function link(scope, element, attrs, ngModel) {
			var button = element.find('input');
			scope.value = null;

			ngModel.$render = modelValueChanged;
			button.on('change', viewValueChanged);

			var trueValue;
			var falseValue;

			scope.$watch('trueValue', trueValueChanged);
			scope.$watch('falseValue', falseValueChanged);

			trueValueChanged(scope.trueValue);
			falseValueChanged(scope.falseValue);

			return;

			function trueValueChanged (value) {
				trueValue = _(attrs).has('trueValue') ? value : true;
				modelValueChanged();
			}

			function falseValueChanged(value) {
				falseValue = _(attrs).has('falseValue') ? value : false;
				modelValueChanged();
			}

			function modelValueChanged() {
				var value = ngModel.$viewValue;
				if (angular.equals(value, trueValue)) {
					setChecked(true);
					setInvalid(false);
				} else if (angular.equals(value, falseValue)) {
					setChecked(false);
					setInvalid(false);
				} else {
					setInvalid(true);
				}
			}

			function viewValueChanged() {
				scope.$apply(function () {
					setInvalid(false);
					ngModel.$setViewValue(button.prop('checked') ? trueValue : falseValue);
				});
			}

			function setChecked(value) {
				button.prop('checked', value);
			}

			function setInvalid(invalid) {
				button.prop('indeterminate', invalid);
				ngModel.$setValidity('invalidModelValue', !invalid);
			}
		}
	}

})(window.angular);

