(function (angular) {
	'use strict';

	/* i18n core for battlesnake.fields */
	angular.module('battlesnake.fields')
		.factory('l10n_fields', l10n_fields)
		.constant('fields_lang', 'enGB');

	/* l10n provided by other factories */
	function l10n_fields($injector, fields_lang) {
		return $injector.get('l10n_fields_' + fields_lang);
	}


})(angular);
