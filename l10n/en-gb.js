(function (angular) {
	'use strict';

	angular.module('battlesnake.fields')
		.factory('l10n_fields_enGB', l10n_fields);

	function l10n_fields() {
		return {
			selectAllNone: 'Select all'
		};
	}

})(angular);
