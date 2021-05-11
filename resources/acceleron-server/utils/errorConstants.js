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



/* Settings Errors */
ErrorType.settings_id_is_empty_or_invalid = 'Settings ID is empty or invalid format, please re-enter it correctly'
ErrorType.invalid_settings_name = "Not valid settings name"
ErrorType.invalid_fix_key = "Not valid fix key"

ErrorType.session_name_empty_or_invalid = 'Session Name is empty or invalid format, please re-enter it correctly'
ErrorType.start_time_empty_or_invalid = 'Start Time is empty or invalid format, please re-enter it correctly'
ErrorType.end_time_empty_or_invalid = 'End Time is empty or invalid format, please re-enter it correctly'
ErrorType.reason_name_empty_or_invalid = 'Reason Name is empty or invalid format, please re-enter it correctly'
ErrorType.comment_empty_or_invalid = 'Comment is empty or invalid format, please re-enter it correctly'

ErrorType.filter_key_is_empty_or_invalid = 'Filter Key is empty or invalid format, please re-enter it correctly'
ErrorType.update_field_is_empty_or_invalid = 'Update Field is empty or invalid format, please re-enter it correctly'
ErrorType.system_name_is_empty_or_invalid = 'System Name is empty or invalid format, please re-enter it correctly'
ErrorType.fix_key_is_empty_or_invalid = 'Fix Key is empty or invalid format, please re-enter it correctly'
ErrorType.machine_name_is_empty_or_invalid = 'System Name is empty or invalid format, please re-enter it correctly'
ErrorType.select_one_more_key = 'Select one more key'

ErrorType.table_section_already_exists = 'Table Section already exists. Please choose a different name.'
ErrorType.ingredient_already_exists = 'Ingredient already exists. Please choose a different name.'
ErrorType.dine_session_already_exists = 'Dine Session already exists. Please choose a different name.'
ErrorType.reason_already_exists = 'Reason already exists. Please choose a different name.'
ErrorType.comment_already_exists = 'Comment already exists. Please choose a different name.'
ErrorType.shortcut_key_already_exists = 'Shortcut key already exists, choose a different key'


/* Table Errors */
ErrorType.table_id_is_empty_or_invalid = 'Table ID is empty or invalid format, please re-enter it correctly'
ErrorType.unique_id_is_empty_or_invalid = 'Unique ID is empty or invalid format, please re-enter it correctly'
ErrorType.section_name_empty_or_invalid = 'Section Name is empty or invalid format, please re-enter it correctly'
ErrorType.table_name_empty_or_invalid = 'Table Name is empty or invalid format, please re-enter it correctly'
ErrorType.table_empty_or_invalid = 'Table is empty or invalid format, please re-enter it correctly'
ErrorType.capacity_empty_or_invalid = 'Capacity is empty or invalid format, please re-enter it correctly'
ErrorType.sort_index_empty_or_invalid = 'Sort Index is empty or invalid format, please re-enter it correctly'
ErrorType.type_empty_or_invalid = 'Type is empty or invalid format, please re-enter it correctly'

ErrorType.all_tables_not_free = 'All the tables are not free, section can not be deleted'

ErrorType.capacity_must_be_a_number = "Capacity must be a number"
ErrorType.sort_index_must_be_a_number = "Sort Index must be a number"

ErrorType.invalid_filter = "Not valid filter"


/* User Errors */
ErrorType.name_is_empty_or_invalid = 'Table Name is empty or invalid format, please re-enter it correctly'
ErrorType.role_is_empty_or_invalid = 'Role is empty or invalid format, please re-enter it correctly'
ErrorType.code_is_empty_or_invalid = 'Code is empty or invalid format, please re-enter it correctly'
ErrorType.passcode_is_empty_or_invalid = 'Passcode is empty or invalid format, please re-enter it correctly'
ErrorType.passcode_has_to_be_four_digit = 'Passcode has to be a 4 digit number'

ErrorType.no_user_found = 'No user Found'
ErrorType.incorrect_password = 'Incorrect passcode entered, please re-enter it correctly'


/*Quick Fix Service Errors*/

ErrorType.remapping_orders_failed = "Remapping orders to tables failed"
ErrorType.live_table_reset_failed ="Resetting Live tables failed"

/*KOT Errors*/
ErrorType.kot_id_is_empty_or_invalid = 'KOT ID is empty or invalid format, please re-enter it correctly'

module.exports = ErrorType