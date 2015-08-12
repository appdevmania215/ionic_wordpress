angular.module('your_app_name.controllers', [])

// APP - RIGHT MENU
.controller('AppCtrl', function($scope, AuthService) {

  $scope.$on('$ionicView.enter', function(){
    // Refresh user data & avatar
    $scope.user = AuthService.getUser();
  });
})

// CATEGORIES MENU
.controller('PushMenuCtrl', function($scope, CategoryService) {

  var getItems = function(parents, categories){

    if(parents.length > 0){

      _.each(parents, function(parent){
        parent.name = parent.title;
        parent.link = parent.slug;

        var items = _.filter(categories, function(category){ return category.parent===parent.id; });

        if(items.length > 0){
          parent.menu = {
            title: parent.title,
            id: parent.id,
            items:items
          };
          getItems(parent.menu.items, categories);
        }
      });
    }
    return parents;
  };

  CategoryService.getCategories()
  .then(function(data){


    var sorted_categories = _.sortBy(data.categories, function(category){ return category.title; });
    var parents = _.filter(sorted_categories, function(category){ return category.parent===0; });
    var result = getItems(parents, sorted_categories);

    $scope.menu = {
      title: 'All Categories',
      id: '0',
      items: result
    };
  });
})


// BOOKMARKS
.controller('BookMarksCtrl', function($scope, $rootScope, BookMarkService) {

  $scope.bookmarks = BookMarkService.getBookmarks();

  // When a new post is bookmarked, we should update bookmarks list
  $rootScope.$on("new-bookmark", function(event, post_id){
    $scope.bookmarks = BookMarkService.getBookmarks();
  });
})


// CONTACT
.controller('ContactCtrl', function($scope) {

  //map
  $scope.position = {
    lat: 43.07493,
    lng: -89.381388
  };

  $scope.$on('mapInitialized', function(event, map) {
    $scope.map = map;
  });

})

// SETTINGS
.controller('SettingCtrl', function($scope, $ionicActionSheet, $ionicModal, $state, AuthService) {
  $scope.notifications = true;
  $scope.sendLocation = false;

  $ionicModal.fromTemplateUrl('partials/terms.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.terms_modal = modal;
  });

  $ionicModal.fromTemplateUrl('partials/faqs.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.faqs_modal = modal;
  });

  $ionicModal.fromTemplateUrl('partials/credits.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.credits_modal = modal;
  });

  $scope.showTerms = function() {
    $scope.terms_modal.show();
  };

  $scope.showFAQS = function() {
    $scope.faqs_modal.show();
  };

  $scope.showCredits = function() {
    $scope.credits_modal.show();
  };

  // Triggered on a the logOut button click
  $scope.showLogOutMenu = function() {

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      //Here you can add some more buttons
      // buttons: [
      // { text: '<b>Share</b> This' },
      // { text: 'Move' }
      // ],
      destructiveText: 'Logout',
      titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
      cancelText: 'Cancel',
      cancel: function() {
        // add cancel code..
      },
      buttonClicked: function(index) {
        //Called when one of the non-destructive buttons is clicked,
        //with the index of the button that was clicked and the button object.
        //Return true to close the action sheet, or false to keep it opened.
        return true;
      },
      destructiveButtonClicked: function(){
        //Called when the destructive button is clicked.
        //Return true to close the action sheet, or false to keep it opened.
        AuthService.logOut();
        $state.go('login');
      }
    });
  };
})

//EMAIL SENDER
.controller('EmailSenderCtrl', function($scope) {

  $scope.sendFeedback = function(){
    cordova.plugins.email.isAvailable(
      function (isAvailable) {
        // alert('Service is not available') unless isAvailable;
        cordova.plugins.email.open({
          to:      'john@doe.com',
          cc:      'jane@doe.com',
          subject: 'Feedback',
          body:    'This app is awesome'
        });
      }
    );
  };

  $scope.sendContactMail = function(){
    cordova.plugins.email.isAvailable(
      function (isAvailable) {
        // alert('Service is not available') unless isAvailable;
        cordova.plugins.email.open({
          to:      'john@doe.com',
          cc:      'jane@doe.com',
          subject: 'Contact',
          body:    'Contact from ionWordpress app'
        });
      }
    );
  };
})


// RATE THIS APP
.controller('RateAppCtrl', function($scope) {

  $scope.rateApp = function(){
    if(ionic.Platform.isIOS()){
      AppRate.preferences.storeAppURL.ios = '<my_app_id>';
      AppRate.promptForRating(true);
    }else if(ionic.Platform.isAndroid()){
      AppRate.preferences.storeAppURL.android = 'market://details?id=<package_name>';
      AppRate.promptForRating(true);
    }
  };
})


//ADMOB
.controller('AdmobCtrl', function($scope, $ionicActionSheet, AdMob) {

  $scope.manageAdMob = function() {

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      //Here you can add some more buttons
      buttons: [
      { text: 'Show AdMob Banner' },
      { text: 'Show AdMob Interstitial' }
      ],
      destructiveText: 'Remove Ads',
      titleText: 'Choose the ad to show',
      cancelText: 'Cancel',
      cancel: function() {
        // add cancel code..
      },
      destructiveButtonClicked: function() {
        console.log("removing ads");
        AdMob.removeAds();
        return true;
      },
      buttonClicked: function(index, button) {
        if(button.text == 'Show AdMob Banner')
        {
          console.log("show AdMob banner");
          AdMob.showBanner();
        }
        if(button.text == 'Show AdMob Interstitial')
        {
          console.log("show AdMob interstitial");
          AdMob.showInterstitial();
        }
        return true;
      }
    });
  };
})


//IAD
.controller('iAdCtrl', function($scope, $ionicActionSheet, iAd) {

  $scope.manageiAd = function() {

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      //Here you can add some more buttons
      buttons: [
      { text: 'Show iAd Banner' },
      { text: 'Show iAd Interstitial' }
      ],
      destructiveText: 'Remove Ads',
      titleText: 'Choose the ad to show - Interstitial only works in iPad',
      cancelText: 'Cancel',
      cancel: function() {
        // add cancel code..
      },
      destructiveButtonClicked: function() {
        console.log("removing ads");
        iAd.removeAds();
        return true;
      },
      buttonClicked: function(index, button) {
        if(button.text == 'Show iAd Banner')
        {
          console.log("show iAd banner");
          iAd.showBanner();
        }
        if(button.text == 'Show iAd Interstitial')
        {
          console.log("show iAd interstitial");
          iAd.showInterstitial();
        }
        return true;
      }
    });
  };
})


// WALKTHROUGH
.controller('WalkthroughCtrl', function($scope, $state, $ionicSlideBoxDelegate) {

  $scope.$on('$ionicView.enter', function(){
    //this is to fix ng-repeat slider width:0px;
    $ionicSlideBoxDelegate.$getByHandle('walkthrough-slider').update();
  });
})

//LOGIN
.controller('LoginCtrl', function($scope, $state, $ionicLoading, AuthService, PushNotificationsService) {
  $scope.user = {};

  $scope.doLogin = function(){

    $ionicLoading.show({
      template: 'Loging in...'
    });

    var user = {
      userName: $scope.user.userName,
      password: $scope.user.password
    };

    AuthService.doLogin(user)
    .then(function(user){
      //success
      $state.go('app.home');

      $ionicLoading.hide();
    },function(err){
      //err
      $scope.error = err;
      $ionicLoading.hide();
    });
  };
})


// FORGOT PASSWORD
.controller('ForgotPasswordCtrl', function($scope, $state, $ionicLoading, AuthService) {
  $scope.user = {};

  $scope.recoverPassword = function(){

    $ionicLoading.show({
      template: 'Recovering password...'
    });

    AuthService.forgotPassword($scope.user.userName)
    .then(function(data){
      if(data.status == "error"){
        $scope.error = data.error;
      }else{
        $scope.message ="Link for password reset has been emailed to you. Please check your email.";
      }
      $ionicLoading.hide();
    });
  };
})


// REGISTER
.controller('RegisterCtrl', function($scope, $state, $ionicLoading, AuthService, PushNotificationsService) {
  $scope.user = {};

  $scope.doRegister = function(){

    $ionicLoading.show({
      template: 'Registering user...'
    });

    var user = {
      userName: $scope.user.userName,
      password: $scope.user.password,
      email: $scope.user.email,
      displayName: $scope.user.displayName
    };

    AuthService.doRegister(user)
    .then(function(user){
      //success
      $state.go('app.home');
      $ionicLoading.hide();
    },function(err){
      //err
      $scope.error = err;
      $ionicLoading.hide();
    });
  };
})

// HOME - GET RECENT POSTS
.controller('HomeCtrl', function($scope, $rootScope, $state, $ionicLoading, PostService) {
  $scope.posts = [];
  $scope.page = 1;
  $scope.totalPages = 1;

  $scope.doRefresh = function() {
    $ionicLoading.show({
      template: 'Loading posts...'
    });

    //Always bring me the latest posts => page=1
    PostService.getRecentPosts(1)
    .then(function(data){

      $scope.totalPages = data.pages;
      $scope.posts = PostService.shortenPosts(data.posts);

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.loadMoreData = function(){
    $scope.page += 1;

    PostService.getRecentPosts($scope.page)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.pages;
      var new_posts = PostService.shortenPosts(data.posts);
      $scope.posts = $scope.posts.concat(new_posts);

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.moreDataCanBeLoaded = function(){
    return $scope.totalPages > $scope.page;
  };

  $scope.sharePost = function(link){
    PostService.sharePost(link);
  };

  $scope.bookmarkPost = function(post){
    $ionicLoading.show({ template: 'Post Saved!', noBackdrop: true, duration: 1000 });
    PostService.bookmarkPost(post);
  };

  $scope.doRefresh();

})


// POST
.controller('PostCtrl', function($scope, $state, $ionicLoading, PostService, $stateParams, AuthService, $ionicScrollDelegate) {
  $ionicLoading.show({
    template: 'Loading post...'
  });

  var postId = $stateParams.postId;
  PostService.getPost(postId)
  .then(function(data){
    $scope.post = data.post;
    $scope.comments = _.map(data.post.comments, function(comment){
      if(comment.author){
        PostService.getUserGravatar(comment.author.id)
        .then(function(data){
          comment.user_gravatar = data.avatar;
        });
        return comment;
      }else{
        return comment;
      }
    });
    $ionicLoading.hide();
  });

  $scope.sharePost = function(link){
    window.plugins.socialsharing.share('Check this post here: ', null, null, link);
  };

  $scope.addComment = function(){

    $ionicLoading.show({
      template: 'Submiting comment...'
    });

    PostService.submitComment($scope.post.id, $scope.new_comment)
    .then(function(data){
      if(data.status=="ok"){
        var user = AuthService.getUser();
        var comment = {
          author: {name: user.data.username},
          content:$scope.new_comment,
          date: Date.now(),
          user_gravatar : user.data.avatar,
          id: data.comment_id
        };
        $scope.comments.push(comment);
        $scope.new_comment = "";
        $scope.new_comment_id = data.comment_id;
        $ionicLoading.hide();
        // Scroll to new post
        $ionicScrollDelegate.scrollBottom(true);
      }
    });
  };
})


// CATEGORY
.controller('PostCategoryCtrl', function($scope, $rootScope, $state, $ionicLoading, $stateParams, PostService) {

  $scope.category = {};
  $scope.category.id = $stateParams.categoryId;
  $scope.category.title = $stateParams.categoryTitle;

  $scope.posts = [];
  $scope.page = 1;
  $scope.totalPages = 1;

  $scope.doRefresh = function() {
    $ionicLoading.show({
      template: 'Loading posts...'
    });

    PostService.getPostsFromCategory($scope.category.id, 1)
    .then(function(data){
      $scope.totalPages = data.pages;
      $scope.posts = PostService.shortenPosts(data.posts);

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.loadMoreData = function(){
    $scope.page += 1;

    PostService.getRecentPosts($scope.category.id, $scope.page)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.pages;
      var new_posts = PostService.shortenPosts(data.posts);
      $scope.posts = $scope.posts.concat(new_posts);

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.moreDataCanBeLoaded = function(){
    return $scope.totalPages > $scope.page;
  };

  $scope.sharePost = function(link){
    PostService.sharePost(link);
  };

  $scope.bookmarkPost = function(post){
    $ionicLoading.show({ template: 'Post Saved!', noBackdrop: true, duration: 1000 });
    PostService.bookmarkPost(post);
  };

  $scope.doRefresh();
})

;
