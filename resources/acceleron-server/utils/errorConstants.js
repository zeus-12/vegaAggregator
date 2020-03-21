'use strict';

var ErrorType = {};

/* Generic Errors */
ErrorType.missing_required_parameters = 'Required parameters missing';
ErrorType.something_went_wrong = 'Something went wrong';
ErrorType.server_data_corrupted = 'Server data corrupted, please contact Acceleron Support.';
ErrorType.no_matching_results = 'No matching results found'
ErrorType.no_data_found = 'No data found'
ErrorType.invalid_limit = 'Invalid limit';
ErrorType.invalid_data_format = 'Invalid data format';

module.exports = ErrorType