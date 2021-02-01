'use strict';

var ErrorType = {};

/* Generic Errors */
ErrorType.missing_required_parameters = 'Required parameters missing';
ErrorType.something_went_wrong = 'Something went wrong';
ErrorType.server_data_corrupted = 'Server data corrupted, please contact Acceleron Support';
ErrorType.server_cannot_handle_request = 'Server can not handle this request, please contact Acceleron Support';
ErrorType.no_matching_results = 'No matching results found'
ErrorType.no_data_found = 'No data found'
ErrorType.invalid_limit = 'Invalid limit';
ErrorType.invalid_data_format = 'Invalid data format';
ErrorType.entry_already_exists = 'Entry already exists';

module.exports = ErrorType