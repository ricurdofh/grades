'use strict';

/**
 * @ngdoc overview
 * @name coursekeyApp
 * @description
 * # coursekeyApp
 *
 * Main module of the application.
 */

function rescalePage(){
  var height = window.innerHeight;
  $('.pageScale').css({'min-height':height});
}
$( window ).resize(function() {
  rescalePage();
});


angular
  .module('coursekeyApp', [
    'googlechart',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'angular.filter',
    'angularMoment',
    'cgBusy',
    'ngDragDrop',
    'ngAria',
    'angular-svg-round-progress',
    'ngClipboard',
    'LocalStorageModule'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'grades/components/professor/feature/book_menu.html',
        //templateUrl: 'components/professor/feature/grades/grades_detail.html',
        controller: 'GradesProfessorCtrl'
      })
      .when('/grades', {
        templateUrl: 'grades/components/professor/feature/grades/grades_desktop.html',
        controller: 'GradesDesktopCtrl'
      })
      .when('/detail/:userID', {
        templateUrl: 'grades/components/professor/feature/grades/grades_detail.html',
        controller: 'GradesDetailsCtrl'
      })
      .when('/attendance', {
        templateUrl: 'grades/components/professor/feature/attendance/attendance_trends.html',
        controller: 'AttendanceProfessorCtrl'
      })
      .when('/assignments', {
        templateUrl: 'grades/components/professor/feature/assignments/assignments.html',
        controller: 'AssignmentsProfessorCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  }).config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath('grades/bower_components/zeroclipboard/dist/ZeroClipboard.swf');
  }])
  .config(['localStorageServiceProvider', function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('CK');
  }]);


