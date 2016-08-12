'use strict';

function filters (scope, val1, val2, active) {
    scope.show_ass = val1;
    scope.show_att = val2;
    $('ul.tags_options')
    .find('.active_tag')
    .removeClass('active_tag');
    $('ul.tags_options')
    .find('.'+active)
    .addClass('active_tag');
  }

angular.module('coursekeyApp')

.controller('GradesDetailsCtrl', function ($scope, $http, $timeout, $routeParams, GradesFunctions, AttendanceFunctions, AssignmentsFunctions) {
    rescalePage();

    $scope.userID = Number($routeParams.userID);
    $scope.Datalength = 0;
    $scope.controlArrow = 0;
    $scope.controlArrown = 0;
    $scope.assignments = {};
    $scope.assignmentsNotChange = {};
    $scope.show_ass = true;
    $scope.show_att = true;
    $scope.thisStudent = [];
    $scope.type = 'details';

    $scope.loadGrades = function (data) {
      GradesFunctions.data = data;
      $scope.data = data;
      $scope.Datalength = $scope.data.length;
      _.forEach(data, function (section) {
        $scope.thisStudent.push(_.filter(section.students, function (student) {
          return student.userID === $scope.userID;
        })[0]);
      });
    };

    $scope.gradesPromise = $http.get('grades/data/grades.json');

    $scope.gradesPromise.success($scope.loadGrades);

    $scope.detailsPromise = $http.get('grades/data/grades-user'+$scope.userID+'.json');

    $scope.detailsPromise.success(function (data) {
      //$scope.imgLink = 'https://www.gravatar.com/avatar/'+SparkMD5.hash(data.email.trim())+'?s=128&d=404';
      $scope.detail = data;

      $scope.Datalength = $scope.data.length;
      $scope.openGradesFilterModal = GradesFunctions.openGradesFilterModal;
      $scope.openAttendanceModali = AttendanceFunctions.openAttendanceModali;
      $scope.openAssignmentsImageA = AssignmentsFunctions.openAssignmentsImageA;
      $scope.openModalNotifications = AssignmentsFunctions.openModalNotifications;
      $scope.rowCollapsedFn = GradesFunctions.rowCollapsedFn;
      $scope.selectTableRow = GradesFunctions.selectTableRow;
      $scope.openInfoQuizModal = GradesFunctions.openInfoQuizModal;
      $scope.openInfoQuizDetailModal = GradesFunctions.openInfoQuizDetailModal;
      $scope.getFormatedPercent = GradesFunctions.getFormatedPercent;
      $scope.changeArrow = GradesFunctions.changeArrow;
      $scope.changeArrown = GradesFunctions.changeArrown;
    });

    $scope.getDate = function (d, obj) {
      var date = new Date(d);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var formatedDate = months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
      if (typeof obj !== 'undefined') {
        obj.formatedDate = formatedDate;
      }
      return formatedDate;
    };

    $scope.getHour = function (d) {
      var date = new Date(d);
      return date.getHours() + ':' + date.getMinutes();
    };

    $scope.showTableAssignment = function (courseID, id) {
      if (typeof $scope.assignments['assignment_'+id] === 'undefined') {
        $scope.assignmentPromise = $http.get('grades/data/grades-ass'+courseID+''+$scope.userID+''+id+'.json');
        $scope.assignmentPromise.success(function (data) {
          $scope.assignments['assignment_'+id] = data;
          $scope.assignmentsNotChange['assignment_'+id] = JSON.parse(JSON.stringify(data));
          $scope.assignments['assignment_'+id].show = true;
        });
      } else {
        $scope.assignments['assignment_'+id].show = !$scope.assignments['assignment_'+id].show;
      }
    };

    $scope.changeIcon = function (assignmentID, quiz, i) {
      if (typeof $scope.assignments['assignment_'+assignmentID]['question_'+quiz.questionID] === 'undefined') {
        $scope.assignments['assignment_'+assignmentID]['question_'+quiz.questionID] = {};
      }

      var newNumber = Number(quiz.points),
          change;

      if (newNumber > quiz.total || newNumber < 0 || isNaN(newNumber)) {
        newNumber = quiz.points = $scope.assignmentsNotChange['assignment_'+assignmentID][i].points;
      }

      change = newNumber !== $scope.assignmentsNotChange['assignment_'+assignmentID][i].points;
      $scope.assignments['assignment_'+assignmentID]['question_'+quiz.questionID].update = change;

      if (change) {
        _.forEach($('.input_' + quiz.questionID), function (el) {
          $(el).css({'color': 'orange'});
        });
      } else {
        _.forEach($('.input_' + quiz.questionID), function (el) {
          $(el).css({'color': ''});
        });
      }
    };

    $scope.updateGrade = function (courseID, quiz, assignmentID, i) {
      courseID = Number(courseID);
      $http
      .put('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/'+courseID+'/questions/'+quiz.gradeID+'/'+quiz.points)
      .success(function(){
        $scope.assignmentsNotChange['assignment_'+assignmentID][i].points = Number(quiz.points);
        $scope.assignments['assignment_'+assignmentID]['question_'+quiz.questionID].update = false;
        $scope.detailsPromise = $http.get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/15/'+$scope.userID);

        $scope.detailsPromise.success(function (data) {
          $scope.detail = data;
          $scope.Datalength = $scope.data.length;
          _.forEach($('.input_' + quiz.questionID), function (el) {
            $(el).css({'color': ''});
          });
          $scope.totalColor = 'orange';
          $timeout(function () {
            $scope.totalColor = '';
          }, 5000);
          $scope.openModalNotifications('Updated student grade', 'The grade for this student has been successfully updated', true);
        });
      });
    };

    $scope.filterAll = function () {
      filters($scope, true, true, 'tag_1');
    };

    $scope.filterAss = function () {
      filters($scope, true, false, 'tag_2');
    };

    $scope.filterAtt = function () {
      filters($scope, false, true, 'tag_3');
    };

    $scope.filterRange = function (item) {
      if ($scope.searchPoints === '' || typeof $scope.searchPoints === 'undefined') {
        return item.points >= 0;
      }
      var searchPoints = $scope.searchPoints.split(' ').join(''),
          comp = searchPoints.split('').shift();
      if (comp === '>') {
        return item.points > Number(searchPoints.slice(1));
      } else if (comp === '<') {
        return item.points < Number(searchPoints.slice(1));
      } else if (comp === '=') {
        return item.points === Number(searchPoints.slice(1));
      } else if (!isNaN(Number(comp))) {
        return item.points === Number(searchPoints);
      } else {
        return item.points >= 0;
      }
    };
    
    $scope.search = function(scopeChild) {
      var date = $('#datepicker').find('input')[0].value;
      $scope.searchPoints = $('#grade').val();
      $scope.searchName = $('#name').val();
      $scope.searchSection = $('#section').val();
      $scope.searchDate = (date !== '') ? $scope.getDate(date) : '';
      scopeChild.$close();
    };

    $scope.viewAll = function(scopeChild) {
      $scope.searchPoints = '';
      $scope.searchName = '';
      $scope.searchSection = '';
      $scope.searchDate = '';
      scopeChild.$close();
    };

  });