Version 1.1

## Code quality changes:
- Changed href to ui-sref in order to go from one state to another in a click
- Moved all controllers to the same file www/js/controllers.js
- Moved all services to the same file www/js/services.js
- Removed ProfileService
- Refactoring of some controlleres and services

## Wordpress audio post:
- Fix embeding wordpress audio posts

## Walkthrough (login)
- Add show/hide password directive

## Others
- Refresh user avatar from Wp on device ready and on device resume
- Update Ionic version to ionicv1.0rc1
- Added DOCUMENTATION.md with the documentation link

## Bugs
- Don't allow post comments with no content
- Fix audio tag styles conflict with ionic.css by upgrading to ionicv1.0rc1
- Fix slider pager hidden due to ionicv1.0rc1 update
- Fix search results tabs list and bookmarks list style (introduced when upgrading to ionicv1.0rc1)
- Fix audio tag not displaying to 100% on iOS
