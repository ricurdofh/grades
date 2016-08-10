'use strict';

angular.module('coursekeyApp')
  .controller('NavbarCtrl', function ($modal, $timeout, $scope, $location, $window,$http) {

  $scope.showBack = true;
  $scope.isCollapsed = true;
  $scope.issueSelected = 'Nothing Selected';
  $scope.supportOptions = ['General Information','Technical Support','Billing','Other','Feedback'];
  var faqLink = 'http://thecoursekey.com/?page_id=5616';
  var videoLink = 'https://www.youtube.com/channel/UCAhDFLQubzP_7VTsmJik6lw';
  var userGuideLink = 'http://thecoursekey.com/?page_id=5616';


  if( $location.$$path === '/home' ){
	   $scope.showBack = false;
  }
  $scope.setType = function(issue){
		$scope.issueSelected = issue;
  };

  $scope.goToSettings = function(){
    $location.path('/settings');
  };
  $scope.goToHome = function(){
    $location.path('/home');
  };

  $scope.openSupport = function(){

		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'support',
			controller: 'ModalInstanceCtrl',
			backdrop: 'static',
			resolve: {
			items: function () {
					return 0;
				}
			}
		});

		modalInstance.result.then(function(){

		});
  };

  $scope.isActive = function(route) {
    return route === $location.path();
  };

  $scope.backOnePage = function(){
    $window.history.back();
  };

  $scope.toFAQ = function(){
    //Redirect to FAQ page, opening a new tab
    $window.open(faqLink, '_blank');
  };

  $scope.toHelpVideo = function(){
    //Redirect to Help Videos, opening a new tab
    $window.open(videoLink, '_blank');
  };

  $scope.toUserGuide = function(){
    //Redirect to User Guides, opening a new tab
    $window.open(userGuideLink, '_blank');
  };

});
