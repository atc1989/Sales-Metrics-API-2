# Swagger Metrics — API Field to UI Column Mapping

## Notes
- Mappings reflect the UI column definitions in each page script.
- For tree endpoints, responses may be `{ data: [...] }` or `[...]`.
- UI rendering uses raw field values without additional formatting (except Sales total in summary).

## 1. Users
- API: `/api/users` ? upstream `api.get.user.php`
- UI Table Columns (label ? field):
  - `Username` ? `user_name`
  - `Name` ? `name`
  - `Sponsored By` ? `sponsored`
  - `Placement` ? `placement`
  - `Group` ? `group`
  - `Account Type` ? `account_type`
  - `Date Created` ? `date_created`
  - `Region` ? `region`
  - `Province` ? `province`
  - `City` ? `city`
  - `Barangay` ? `brgy`
  - `Status` ? `status`

## 2. Codes
- API: `/api/codes` ? upstream `api.get.codes.php`
- UI Table Columns (label ? field):
  - `Owner User Name` ? `owner_user_name`
  - `Owner Name` ? `owner_name`
  - `Code Status` ? `code_status`
  - `Sponsor ID` ? `sponsor_id`
  - `Sponsor Login Name` ? `sponsor_login_name`
  - `Sponsor Name` ? `sponsor_name`
  - `Used By User Name` ? `used_by_user_name`
  - `Used By Name` ? `used_by_name`
  - `Code SKU` ? `code_sku`
  - `Code Payment` ? `code_payment`
  - `Code` ? `code`
  - `Code Amount` ? `code_amount`
  - `Code PIN` ? `code_pin`
  - `Code Date Created` ? `code_date_created`

## 3. Sales
- API: `/api/sales` ? upstream `api.get.sales.php`
- UI Table Columns (label ? field):
  - `Store Name` ? `store_name`
  - `Store Type` ? `store_type`
  - `User` ? `user`
  - `User Name` ? `user_name`
  - `Code SKU` ? `code_sku`
  - `Amount` ? `amount`
  - `Qty` ? `qty`
  - `Transdate` ? `transdate`

## 4. User Upline
- API: `/api/userUpline` ? upstream `api.get.user.upline.binary.php`
- UI Table Columns (label ? field):
  - `LEVEL` ? `lvl`
  - `ID NO` ? `idno`
  - `USER NAME` ? `user_name`
  - `USER` ? `user`
  - `PLACEMENT` ? `placement`

## 5. Sponsored Downline
- API: `/api/sponsoredDownline` ? upstream `api.get.user.sponsored.php`
- UI Table Columns (label ? field):
  - `ID NO` ? `idno`
  - `REGISTERED` ? `registered`
  - `USER NAME` ? `user_name`
  - `USER` ? `user`
  - `ACCOUNT TYPE` ? `account_type`
  - `PAYMENT` ? `payment`

## 6. Binary Downline
- API: `/api/binaryDownline` ? upstream `api.get.user.downline.binary.php`
- UI Table Columns (label ? field):
  - `ID NO` ? `idno`
  - `REGISTERED` ? `registered`
  - `USER NAME` ? `user_name`
  - `USER` ? `user`
  - `PLACEMENT` ? `placement`
  - `PLACEMENT GROUP` ? `placement_group`
  - `ACCOUNT TYPE` ? `account_type`
  - `PAYMENT` ? `payment`

## 7. Unilevel Downline
- API: `/api/unilevelDownline` ? upstream `api.get.user.downline.unilevel.php`
- UI Table Columns (label ? field):
  - `ID NO` ? `idno`
  - `REGISTERED` ? `registered`
  - `USER NAME` ? `user_name`
  - `USER` ? `user`
  - `ACCOUNT TYPE` ? `account_type`
  - `PAYMENT` ? `payment`

## 8. Unilevel Upline
- API: `/api/unilevelUpline` ? upstream `api.get.user.upline.unilevel.php`
- UI Table Columns (label ? field):
  - `ID NO` ? `idno`
  - `REGISTERED` ? `registered`
  - `USER NAME` ? `user_name`
  - `USER` ? `user`
  - `ACCOUNT TYPE` ? `account_type`
  - `PAYMENT` ? `payment`

## 9. Personal Accounts
- API: `/api/personalAccounts` ? upstream `api.get.user.accounts.php`
- UI Table Columns (label ? field):
  - `ID NO` ? `idno`
  - `REGISTERED` ? `registered`
  - `USER NAME` ? `user_name`
  - `USER` ? `user`
  - `ACCOUNT TYPE` ? `account_type`
  - `PAYMENT` ? `payment`

## 10. Network Activity
- API: `/api/networkActivity` ? upstream `api.get.user.network.activity.php`
- UI Table Columns (label ? field):
  - `REQUEST DATE` ? `requestdate`
  - `AMOUNT` ? `amount`
  - `REMARKS` ? `remarks`

