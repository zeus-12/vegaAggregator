"use strict";

var ErrorType = {};

/* Generic Errors */
ErrorType.missing_required_parameters = 'Required parameters missing';
ErrorType.something_went_wrong = 'Something went wrong';
ErrorType.server_cannot_verify_request = 'Server failed to verify the request';
ErrorType.server_data_corrupted =
  'Server data corrupted, please contact Acceleron Support';
ErrorType.server_cannot_handle_request =
  'Server can not handle this request, please contact Acceleron Support';
ErrorType.no_matching_results = 'No matching results found';
ErrorType.no_data_found = 'No data found';
ErrorType.invalid_limit = 'Invalid limit';
ErrorType.invalid_data_format = 'Invalid data format';
ErrorType.entry_already_exists = 'Entry already exists';

/* Menu Errors */
ErrorType.item_code_is_empty_or_invalid =
  'Item Code is empty or invalid format, please re-enter it correctly';
ErrorType.item_name_is_empty_or_invalid =
  'Item Name is empty or invalid format, please re-enter it correctly';
ErrorType.item_price_is_empty_or_invalid =
  'Item Price is empty or invalid format, please re-enter it correctly';
ErrorType.category_name_is_empty_or_invalid =
  'Category Name is empty or invalid format, please re-enter it correctly';

ErrorType.category_already_exists =
  'Category already exists. Please choose a different name.';
ErrorType.item_code_already_exists =
  'Item Code already exists. Please choose a different code.';

ErrorType.online_flag_empty = 'Flag for Online menu updation is not provided';
ErrorType.update_token_empty = 'Token for Online menu updation is not provided';
ErrorType.avail_option_empty =
  'Availability option empty. Provide value as ALL_AVAIL or ALL_NOT_AVAIL';

ErrorType.image_is_empty_or_invalid = 'Item Image is empty or invalid ';

/* Settings Errors */
ErrorType.settings_id_is_empty_or_invalid =
  'Settings ID is empty or invalid format, please re-enter it correctly';
ErrorType.invalid_settings_name = 'Not valid settings name';
ErrorType.default_settings_already_exists = 'Default settings already exists for this machine';
ErrorType.invalid_fix_key = 'Not valid fix key';
ErrorType.select_one_more_key = 'Select one more key';
ErrorType.settings_not_found_system_options = 'System Options data not found';
ErrorType.settings_not_found_personalisations = 'Personalisations data not found';
ErrorType.settings_not_found_bill_layout = 'Bill layout data not found'
ErrorType.settings_not_found_shortcuts = 'Shortcuts data not found'
ErrorType.settings_not_found_kot_relays = 'KOT relay data not found'
ErrorType.settings_not_found_dine_sessions = 'Dine sessions data not found'
ErrorType.settings_not_found_configured_printers = 'Configured Printers not found'
ErrorType.settings_not_found_order_sources = 'Order sources data not found'


ErrorType.session_name_empty_or_invalid =
  'Session Name is empty or invalid format, please re-enter it correctly';
ErrorType.start_time_empty_or_invalid =
  'Start Time is empty or invalid format, please re-enter it correctly';
ErrorType.end_time_empty_or_invalid =
  'End Time is empty or invalid format, please re-enter it correctly';
ErrorType.reason_name_empty_or_invalid =
  'Reason Name is empty or invalid format, please re-enter it correctly';
ErrorType.comment_empty_or_invalid =
  'Comment is empty or invalid format, please re-enter it correctly';
ErrorType.payment_name_is_empty_or_invalid =
  'Payment Name is empty or invalid format, please re-enter it correctly';
ErrorType.main_type_is_empty_or_invalid =
  'Main Type is empty or invalid format, please re-enter it correctly';
ErrorType.printer_name_is_empty_or_invalid =
  'Printer Name is empty or invalid format, please re-enter it correctly';
ErrorType.filter_key_is_empty_or_invalid =
  'Filter Key is empty or invalid format, please re-enter it correctly';
ErrorType.update_field_is_empty_or_invalid =
  'Update Field is empty or invalid format, please re-enter it correctly';
ErrorType.system_name_is_empty_or_invalid =
  'System Name is empty or invalid format, please re-enter it correctly';
ErrorType.fix_key_is_empty_or_invalid =
  'Fix Key is empty or invalid format, please re-enter it correctly';
ErrorType.machine_name_is_empty_or_invalid =
  'System Name is empty or invalid format, please re-enter it correctly';
ErrorType.bill_param_name_empty_or_invalid =
  'Billing parameter name is empty or invalid format, please re-enter it correctly';
ErrorType.bill_param_excludePackagedFoods_empty_or_invalid =
  'Exclude packaged foods is empty or invalid format, please re-enter it correctly';
ErrorType.bill_param_value_empty_or_invalid =
  'Billing parameter value is empty or invalid format, please re-enter it correctly';
ErrorType.bill_param_unit_empty_or_invalid =
  'Billing parameter unit is empty or invalid format, please re-enter it correctly';
ErrorType.bill_param_unit_name_empty_or_invalid =
  'Billing parameter unit name is empty or invalid format, please re-enter it correctly';
ErrorType.discount_name_empty_or_invalid =
  'Discount Name is empty or invalid format, please re-enter it correctly';
ErrorType.discount_unit_empty_or_invalid =
  'Discount Unit is empty or invalid format, please re-enter it correctly';
ErrorType.discount_value_empty_or_invalid =
  'Discount Value is empty or invalid format, please re-enter it correctly';
ErrorType.bill_mode_name_empty_or_invalid =
  'Billing Mode Name is empty or invalid format, please re-enter it correctly';
ErrorType.bill_mode_discountable_empty_or_invalid =
  'Billing Mode Name  is empty or invalid format, please re-enter it correctly';
ErrorType.bill_mode_type_empty_or_invalid =
  'Discount Value is empty or invalid format, please re-enter it correctly';
ErrorType.bill_mode_discount_empty_or_invalid =
  'Discount Value is empty or invalid format, please re-enter it correctly';
ErrorType.bill_mode_discount_is_zero =
  'Please set a non-zero maximum discount, as you have marked it Discountable';
ErrorType.payment_name_empty_or_invalid =
  'Payment Mode Name is empty or invalid format, please re-enter it correctly';
ErrorType.payment_code_empty_or_invalid =
  'Payment Mode Code is empty or invalid format, please re-enter it correctly';
ErrorType.order_source_name_empty_or_invalid =
  'Order Source Name is empty or invalid format, please re-enter it correctly';
ErrorType.order_source_code_empty_or_invalid =
  'Order Source Code is empty or invalid format, please re-enter it correctly';
ErrorType.printer_name_empty_or_invalid =
  'Printer name is empty or invalid format, set a name to easily identify the printer (Eg. Kitchen KOT)';
ErrorType.printer_type_empty_or_invalid = 'Please select a Printer type';
ErrorType.printer_width_empty_or_invalid =
  'Printer width is empty or invalid format, please re-enter it correctly';
ErrorType.printer_actions_empty_or_invalid = 'Please select atleast one action';

ErrorType.table_section_already_exists =
  'Table Section already exists. Please choose a different name.';
ErrorType.ingredient_already_exists =
  'Ingredient already exists. Please choose a different name.';
ErrorType.dine_session_already_exists =
  'Dine Session already exists. Please choose a different name.';
ErrorType.reason_already_exists =
  'Reason already exists. Please choose a different name.';
ErrorType.comment_already_exists =
  'Comment already exists. Please choose a different name.';
ErrorType.shortcut_key_already_exists =
  'Shortcut key already exists, choose a different key';
ErrorType.billing_parameter_already_exists =
  'Billing Parameter already exists with same name. Please choose a different name.';
ErrorType.discount_name_already_exists =
  'Discount Name already exists. Please set a different name.';
ErrorType.billing_mode_already_exists =
  'Billing Mode already exists with same name. Please choose a different name.';
ErrorType.payment_mode_already_exists =
  'Payment Mode already exists with same name. Please choose a different name.';
ErrorType.order_source_name_already_exists =
  'Order Source already exists with same name. Please choose a different name.';
ErrorType.printer_name_already_exists =
  'Printer Name already taken. Please set a different name.';

/* Table Errors */
ErrorType.table_id_is_empty_or_invalid =
  'Table ID is empty or invalid format, please re-enter it correctly';
ErrorType.unique_id_is_empty_or_invalid =
  'Unique ID is empty or invalid format, please re-enter it correctly';
ErrorType.section_name_empty_or_invalid =
  'Section Name is empty or invalid format, please re-enter it correctly';
ErrorType.table_name_empty_or_invalid =
  'Table Name is empty or invalid format, please re-enter it correctly';
ErrorType.table_empty_or_invalid =
  'Table is empty or invalid format, please re-enter it correctly';
ErrorType.capacity_empty_or_invalid =
  'Capacity is empty or invalid format, please re-enter it correctly';
ErrorType.sort_index_empty_or_invalid =
  'Sort Index is empty or invalid format, please re-enter it correctly';
ErrorType.type_empty_or_invalid =
  'Type is empty or invalid format, please re-enter it correctly';

ErrorType.all_tables_not_free =
  'All the tables are not free, section can not be deleted';

ErrorType.capacity_must_be_a_number = 'Capacity must be a number';
ErrorType.sort_index_must_be_a_number = 'Sort Index must be a number';

ErrorType.invalid_filter = 'Not valid filter';

/* User Errors */
ErrorType.name_is_empty_or_invalid =
  'Table Name is empty or invalid format, please re-enter it correctly';
ErrorType.role_is_empty_or_invalid =
  'Role is empty or invalid format, please re-enter it correctly';
ErrorType.code_is_empty_or_invalid =
  'Code is empty or invalid format, please re-enter it correctly';
ErrorType.passcode_is_empty_or_invalid =
  'Passcode is empty or invalid format, please re-enter it correctly';
ErrorType.passcode_has_to_be_four_digit = 'Passcode has to be a 4 digit number';

ErrorType.no_user_found = 'No user Found';
ErrorType.incorrect_password =
  'Incorrect passcode entered, please re-enter it correctly';

/* Summary Errors */
ErrorType.bills_not_settled =
  'Please settle all the pending bills on the given dates to continue';

/*Quick Fix Service Errors*/

ErrorType.remapping_orders_failed = 'Remapping orders to tables failed';
ErrorType.live_table_reset_failed = 'Resetting Live tables failed';

/*KOT Errors*/
ErrorType.kot_id_is_empty_or_invalid =
  'KOT ID is empty or invalid format, please re-enter it correctly';
ErrorType.order_not_dine = 'Order is not a Dine-In order';
ErrorType.same_table = 'Same Table';

/*Manage Menu Errors*/
ErrorType.mapped_menu_type_is_empty_or_invalid =
  'Mapped Menu Type is empty or invalid';

/*License Errors*/
ErrorType.machine_not_in_license =
  'Licence Error: Machine Name not issued in Licence.';
ErrorType.license_already_used = 'Activation Error: Licence already used.';
ErrorType.license_validation_failed = 'Failed to validate the licence';

// Settled & Pending Bill Errors
ErrorType.start_and_end_date_empty = 'Please provide Start and End dates.';
ErrorType.filter_key_and_filter_method_empty =
  'Please provide Filter method and Search key.';
ErrorType.bill_number_empty = 'Please provide the Bill number to be searched.';
ErrorType.invalid_filter_method = "Filter method doesn't exist.";

// login errors
ErrorType.incomplete_login_credentials = "Please provide both username and password";


//custom
// Refund Issued orders can not be moved back to Unsettled.
ErrorType.unsettle_refunded_orders = "ERROR-R1"; 

// Requires Admin Access.
ErrorType.admin_access_required = "ERROR-R2"

//maxtolerance error
ErrorType.maxTolerance_error = 'ERROR-R3'


module.exports = ErrorType;
