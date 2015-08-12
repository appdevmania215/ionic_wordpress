angular.module('your_app_name.directives', [])

.directive('recursiveMenu', function($compile) {
	return {
		restrict: 'EACM',
		priority: 100000,
		compile: function(tElement, tAttr) {
			var compiledContents, contents;
			contents = tElement.contents().remove();
			compiledContents = null;
			return function(scope, iElement, iAttr) {
				if (!compiledContents) {
					compiledContents = $compile(contents);
				}
				compiledContents(scope, function(clone, scope) {
					return iElement.append(clone);
				});
			};
		}
	};
})

.directive('pushMenu', function(){
	return {
		scope: {
			menu: '=',
			level: '='
		},
		controller: function($scope, $element, $attrs) {
			this.getMenu = function(){
				return $scope.menu;
			};
		},
		templateUrl: 'partials/main-menu.html',
		restrict: 'E',
		replace: true,
		transclude: true
	};
})

.directive('menuLevel', function(_){
	return {
		scope: {
			menu: '=',
			level: '='
		},
		link: function(scope, element, attr, menuCtrl) {
			scope.original_menu = menuCtrl.getMenu();
			scope.childrenLevel = scope.level + 1;

			scope.openSubMenu = function(item_menu, parent_menu, $event) {
				// console.log("open sub menu from child directive");
				// Check if it has sub levels
				if(!_.isUndefined(item_menu) && !_.isUndefined(item_menu.items) && item_menu.items.length > 0)
				{
					// console.log("has sub menus, OPENING!");
					$event.preventDefault();

					// Open sub menu
					var sub_level = document.querySelector('.mp-level.level-id-'+item_menu.id);
					this.$parent._openMenu(sub_level);
				}
			};

			scope.backToPreviousMenu = function(menu, $event){
				$event.preventDefault();
				$event.stopPropagation();

				// Close current menu
				var current_level = document.querySelector('.mp-level.level-id-'+menu.id);
				this.$parent._closeMenu(current_level);
			};

			scope._setTransform = function(val, el){
				el.style.WebkitTransform = val;
				el.style.MozTransform = val;
				el.style.transform = val;
			};

			scope._openMenu = function(level){
				// console.log("opening menu!");
				this._setTransform('translate3d(0,0,0)', level);
			};

			scope._closeMenu = function(level){
				// console.log("closing menu!");
				this._setTransform('translate3d(100%,0,0)', level);
			};
		},
		templateUrl: 'partials/menu-level.html',
		require: '^pushMenu',
		restrict: 'EA',
		replace: true,
		transclude: true
	};
})

.directive('wpSearch', function(_, SearchService, $q){
	return {
		scope: {
			// menu: '=',
			// shown: '='
		},
		controller: function($scope) {
			var utils = this;

			$scope.close_shown = false;

			this.showClose = function(){
				// Think i have to use apply because this function is not called from this controller ($scope)
				$scope.$apply(function () {
					$scope.close_shown = true;
				});
			};

			this.hideClose = function(){
				// This method is called from hideResultsPanel that is called from $scope.closeSearch,
				// which is triggered from within the directive so it doesn't need $scope.apply
				$scope.close_shown = false;
			};

			this.showResultsPanel = function(query){
				utils.showClose();
				// console.log("broadcast show-results-panel");
				var search_results_promise = null;
				if(!_.isUndefined(query))
				{
					// Then perform search, and returns a promise
					search_results_promise = SearchService.search(query);
				}
				$scope.$broadcast("show-results-panel", search_results_promise);
			};

			this.cleanResultsPanel = function(){
				// console.log("broadcast clean-results-panel");
				$scope.$broadcast("clean-results-panel");
			};

			this.hideResultsPanel = function(){
				// console.log("broadcast hide-results-panel");
				utils.hideClose();
				$scope.$broadcast("hide-results-panel", 1);
			};

			$scope.closeSearch = function($event) {
				$event.stopPropagation();
				$event.preventDefault();
				// console.log("close search, should hide panel");
				// console.log($event);
				utils.hideResultsPanel();
			};

			// $scope.closeSearch = function() {
			// 	utils.hideResultsPanel();
			// };
		},
		templateUrl: 'partials/wp-search.html',
		restrict: 'E',
		replace: true,
		transclude: true
	};
})

.directive('searchInput', function($timeout, SearchService, $ionicLoading){
	return {
		require: '^wpSearch',
		link: function(scope, element, attr, wpSearchCtrl) {
			var timeout = null;

			scope.$on("hide-results-panel", function(event, value){
				// console.log("Broadcast received, value: ", value);
				$timeout.cancel(timeout);
				// console.log("CANCEL because of hide panel");
				element[0].value = "";
			});

			element.on('focus', function(event) {
				// event.preventDefault();
				// event.stopPropagation();
				// console.log("FOCUS on (current target): ", event.currentTarget);
				// console.log("FOCUS on (target): ", event.target);
				// maybe emit event here so the serch results directive can update itself
				wpSearchCtrl.showResultsPanel();
			});

			element.on('keyup', function(event) {
				event.preventDefault();
				event.stopPropagation();
				// console.log("KEYUP!");

				var target = this;

				if(timeout !== null)
				{
					// console.log("canceling search");
					$timeout.cancel(timeout);
				}

				var query = target.value;

				timeout = $timeout(function(){

					if(query.trim().length>0)
					{

						$ionicLoading.show({
							template: 'Searching...'
						});

						// Perform search
						wpSearchCtrl.showResultsPanel(query);
						// console.log("searching for query: ", query);
					}
					else
					{
						// Clean previous search results
						wpSearchCtrl.cleanResultsPanel();
					}
				}, 800);
			});

		},
		restrict: 'A'
	};
})

.directive('searchResults', function(_, $ionicLoading){
	return {
		require: '^wpSearch',
		link: function(scope, element, attr, wpSearchCtrl) {
			var _setTransform = function(val, el){
						el.style.WebkitTransform = val;
						el.style.MozTransform = val;
						el.style.transform = val;
					};

			scope.$on("show-results-panel", function(event, search_results_promise){
				// console.log("Broadcast received, value: ", search_results_promise);

				_setTransform('translate3d(0,0,0)', element[0]);

				// search_results_promise is null when we the search query was empty
				if(search_results_promise)
				{
					// Then show search results in tabs
					search_results_promise.then(function(results){
						// console.log("promise DONE, search OK: ", results);

						$ionicLoading.hide();

						scope.loadSearchResults(results);
					}, function(error){
						// console.log("search ERROR: ", error);
					});
				}
			});

			scope.$on("clean-results-panel", function(event, value){
				// Clean previous search results
				scope.cleanSearchResults();
			});

			scope.$on("hide-results-panel", function(event, value){
				// console.log("Broadcast received, value: ", value);
				_setTransform('translate3d(0,100%,0)', element[0]);
			});
		},
		controller: function($scope) {
			var tabs = $scope.tabs = [];
			$scope.query = "";

			$scope.select = function(tab) {
				angular.forEach(tabs, function(tab) {
					tab.selected = false;
				});
				tab.selected = true;
			};

			$scope.loadSearchResults = function(results){
				_.each(tabs, function(tab){
					var tab_search = _.findWhere(results, {_id : tab.tabid});
					tab.results = tab_search.results;
				});
			};

			$scope.cleanSearchResults = function(){
				_.each(tabs, function(tab){
					tab.results = [];
				});
			};

			this.addTab = function(tab) {
				if (tabs.length === 0) {
					$scope.select(tab);
				}
				tabs.push(tab);
			};
		},
		templateUrl: 'partials/search-results.html',
		restrict: 'E',
		replace: true,
		transclude: true
	};
})

.directive('myTab', function($state, $ionicHistory) {
	return {
		require: '^searchResults',
		restrict: 'E',
		transclude: true,
		scope: {
			title: '@',
			tabid: '@',
			query: '@query',
		},
		link: function(scope, element, attrs, tabsCtrl) {
			// This helped me understand scope inheritance between directives in angular: https://github.com/angular/angular.js/wiki/Understanding-Scopes
			scope.results = [];
			tabsCtrl.addTab(scope);

			scope.goToPost = function(post){
				$ionicHistory.nextViewOptions({
					disableAnimate: true
				});
				$state.go('app.post', {postId: post.id});
			};
		},
		templateUrl: 'partials/my-tab.html'
	};
})


.directive('postCard', function() {
	return {
		templateUrl: 'partials/post-card.html'
	};
})


.directive('showHideContainer', function(){
	return {
		scope: {

		},
		controller: function($scope, $element, $attrs) {
			$scope.show = false;

			$scope.toggleType = function($event){
				$event.stopPropagation();
				$event.preventDefault();

				$scope.show = !$scope.show;

				// Emit event
				$scope.$broadcast("toggle-type", $scope.show);
			};
		},
		templateUrl: 'partials/show-hide-password.html',
		restrict: 'A',
		replace: false,
		transclude: true
	};
})


.directive('showHideInput', function(){
	return {
		scope: {

		},
		link: function(scope, element, attrs) {
			// listen to event
			scope.$on("toggle-type", function(event, show){
				var password_input = element[0],
						input_type = password_input.getAttribute('type');

				if(!show)
				{
					password_input.setAttribute('type', 'password');
				}

				if(show)
				{
					password_input.setAttribute('type', 'text');
				}
			});
		},
		require: '^showHideContainer',
		restrict: 'A',
		replace: false,
		transclude: false
	};
})



;
