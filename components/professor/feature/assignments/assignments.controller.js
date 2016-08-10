'use strict';

angular.module('coursekeyApp')

.controller('AssignmentsProfessorCtrl', function ($scope, $http, $timeout, AssignmentsFunctions, GradesFunctions) {
    rescalePage();

    $scope.Datalength = 0;
    $scope.controlArrow = 0;
    $scope.controlArrown = 0;
    $scope.date1 = '';
    $scope.date2 = '';
    $scope.assignments = {};
    $scope.rowCollapsed = {};
    $scope.assignmentsNotChange = {};
    $scope.openAssignmentsFilterModal = AssignmentsFunctions.openAssignmentsFilterModal;
    $scope.openAssignmentsImageA = AssignmentsFunctions.openAssignmentsImageA;
    $scope.openInfoQuizDetailModal = GradesFunctions.openInfoQuizDetailModal;
    $scope.openModalNotifications = AssignmentsFunctions.openModalNotifications;
    $scope.getFormatedPercent = GradesFunctions.getFormatedPercent;
    $scope.openInfoQuizModal = GradesFunctions.openInfoQuizModal;
    $scope.rowCollapsedFn = GradesFunctions.rowCollapsedFn;
    $scope.selectTableRow = GradesFunctions.selectTableRow;
    $scope.changeArrow = GradesFunctions.changeArrow;
    $scope.changeArrown = GradesFunctions.changeArrown;

    $scope.updateData = function () {

      $scope.assignmentsPromise = $http.get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/15/assignments');

      $scope.assignmentsPromise.success(function (data) {
        _.forEach(data, function (course) {
          course.total = _.reduce(course.assignments, function (total, n) {
            return total + n.percent;
          }, 0);
          course.total /= course.assignments.length;
          course.total = $scope.getFormatedPercent(course.total);
        });

        data[0].name = 'Parent Class (' + data[0].name + ')';
        $scope.data = data;
        $scope.Datalength = $scope.data.length;
      });

    };

    $scope.updateData();

    $scope.getDate = function (d, obj) {
      var date = new Date(d);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var formatedDate = months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
      if (obj) {
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
        $scope.assignmentPromise = $http.get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/'+courseID+'/assignments/'+id);
        $scope.assignmentPromise.success(function (data) {
          $scope.assignments['assignment_'+id] = data;
          $scope.assignmentsNotChange['assignment_'+id] = JSON.parse(JSON.stringify(data));
          $scope.assignments['assignment_'+id].show = true;
          _.forEach(data, function (quiz) {
            var total = quiz.correct + quiz.incorrect + quiz.notAnswered;
            quiz.correctPercent = quiz.correct * 100 / total;
            quiz.incorrectPercent = quiz.incorrect * 100 / total;
            quiz.notAnsweredPercent = quiz.notAnswered * 100 / total;
          });
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
      .put('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/'+courseID+'/assignments/max/'+quiz.questionID+'/'+quiz.points)
      .success(function(){
        $scope.assignmentsNotChange['assignment_'+assignmentID][i].points = Number(quiz.points);
        $scope.assignments['assignment_'+assignmentID]['question_'+quiz.questionID].update = false;
        $scope.updateData();
        _.forEach($('.input_' + quiz.questionID), function (el) {
          $(el).css({'color': ''});
        });
        $scope.totalColor = 'orange';
        $timeout(function () {
          $scope.totalColor = '';
        }, 5000);
        $scope.openModalNotifications('Updated assignment', 'The maximum points for this assignment has been successfully updated', true);
      });
    };

    $scope.deleteAssignment = function (courseID, assignment) {
      $scope.openModalNotifications('Delete assignment', 'Are you sure you want to delete this assignment?', false, 'http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/' + courseID + '/assignments/' + assignment.assignmentID, $scope);
    };

    $scope.deleteQuestion = function (courseID, question) {
      $scope.openModalNotifications('Delete question', 'Are you sure you want to delete this question?', false, 'http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/' +courseID + '/questions/' + question.questionID, $scope);
    };

    $scope.dateRange = function (item) {
      var date1, date2,
        itemDate = new Date(item.timestamp).getTime();
      if ($scope.date1 !== '' && $scope.date2 !== '') {
        if ($scope.date1 === $scope.date2) {
          date1 = new Date($scope.date1);
          date2 = new Date(item.timestamp);
          return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth();
        } else {
          date1 = new Date($scope.date1).getTime();
          date2 = new Date($scope.date2).getTime();
          return date1 <= itemDate && itemDate <= date2;
        }
      } else if ($scope.date1 !== '') {
        date1 = new Date($scope.date1).getTime();
        return date1 <= itemDate;
      } else if ($scope.date2 !== '') {
        date2 = new Date($scope.date2).getTime();
        return itemDate <= date2;
      } else {
        return true;
      }
      
    };
    
    $scope.search = function(scopeChild) {
      $scope.date1 = $('#datepicker').find('input')[0].value;
      $scope.date2 = $('#datepicker').find('input')[1].value;
      $scope.searchType = $('#assignment_type').val();
      $scope.searchSection = $('#section').val();
      scopeChild.$close();
    };

    $scope.viewAll = function(scopeChild) {
      $scope.date1 = '';
      $scope.date2 = '';
      $scope.searchType = '';
      $scope.searchSection = '';
      scopeChild.$close();
    };

  });