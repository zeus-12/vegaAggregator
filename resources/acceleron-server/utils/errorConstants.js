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


/* Menu Errors */
ErrorType.item_code_is_empty_or_invalid = 'Item Code is empty or invalid format, please re-enter it correctly'
ErrorType.item_name_is_empty_or_invalid = 'Item Name is empty or invalid format, please re-enter it correctly'
ErrorType.item_price_is_empty_or_invalid = 'Item Price is empty or invalid format, please re-enter it correctly'
ErrorType.category_name_is_empty_or_invalid = 'Category Name is empty or invalid format, please re-enter it correctly'


ErrorType.category_already_exists = 'Category already exists. Please choose a different name.'
ErrorType.item_code_already_exists = 'Item Code already exists. Please choose a different code.'


ErrorType.online_flag_empty = 'Flag for Online menu updation is not provided'
ErrorType.update_token_empty = 'Token for Online menu updation is not provided'
ErrorType.avail_option_empty = 'Availability option empty. Provide value as ALL_AVAIL or ALL_NOT_AVAIL'

module.exports = ErrorType