'use strict';

angular.module('coursekeyApp')

.controller('GradesDesktopCtrl', function ($scope, $http, GradesFunctions) {
    rescalePage();

    $scope.getFormatedPercent = GradesFunctions.getFormatedPercent;
    $scope.Datalength = 0;
    $scope.controlArrow = 0;
    $scope.controlArrown = 0;
    $scope.type = 'grades';

    $scope.loadGrades = function (data) {

      _.forEach(data, function (course) {
        course.total = _.reduce(course.students, function (total, n) {
          return total + n.percent;
        }, 0);
        course.total /= course.students.length;
        course.total = $scope.getFormatedPercent(course.total);
      });

      data[0].name = 'Parent Class (' + data[0].name + ')';

      GradesFunctions.data = data;
      $scope.data = data;
      $scope.Datalength = $scope.data.length;
      $scope.openGradesFilterModal = GradesFunctions.openGradesFilterModal;
      $scope.rowCollapsedFn = GradesFunctions.rowCollapsedFn;
      $scope.selectTableRow = GradesFunctions.selectTableRow;
      $scope.changeArrow = GradesFunctions.changeArrow;
      $scope.changeArrown = GradesFunctions.changeArrown;
    };

    $scope.filterRange = function (item) {
      var points = item.attendance + item.questions;
      if ($scope.searchPoints === '' || typeof $scope.searchPoints === 'undefined') {
        return points >= 0;
      }
      var searchPoints = $scope.searchPoints.split(' ').join(''),
          comp = searchPoints.split('').shift();
      if (comp === '>') {
        return points > Number(searchPoints.slice(1));
      } else if (comp === '<') {
        return points < Number(searchPoints.slice(1));
      } else if (comp === '=') {
        return points === Number(searchPoints.slice(1));
      } else if (!isNaN(Number(comp))) {
        return points === Number(searchPoints);
      } else {
        return points >= 0;
      }
    };

    $scope.filterNames = function (item) {
      if ($scope.searchFirst !== '' && typeof $scope.searchFirst !== 'undefined') {
        var firstItem = item.firstname.toLowerCase(),
          firstScope = $scope.searchFirst.toLowerCase(),
          lastItem = item.lastname.toLowerCase(),
          lastScope = $scope.searchLast.toLowerCase();
        return firstItem === firstScope || lastItem === lastScope;
      }
      else {
        return true;
      }
    };

    $scope.search = function(scopeChild) {
      var grade = $('#grade').val(),
        name = $('#name').val();
      if (name !== '') {
        name = name.split(' ');
        $scope.searchFirst = name[0];
        $scope.searchLast = (name[1]) ? name[1] : name[0];
      }
      $scope.searchPoints = grade;
      $scope.searchSection = $('#section').val();
      scopeChild.$close();
    };

    $scope.viewAll = function(scopeChild) {
      $scope.searchPoints = '';
      $scope.searchSection = '';
      $scope.searchFirst = '';
      $scope.searchLast = '';
      scopeChild.$close();
    };

    $scope.gradesPromise = $http.get('/data/grades.json');

    $scope.gradesPromise.success($scope.loadGrades);


  });