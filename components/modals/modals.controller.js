'use strict';


angular.module('coursekeyApp')

.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.modalData = items;
  $scope.close = function(data){
    $modalInstance.close(data);
  };
  $scope.$on('$routeChangeStart', function(){
    $modalInstance.close();
  });
})

.controller('masterModal', function ($scope, $modalInstance, config) {
  $scope.config = config;
})

.controller('gradesFilterModal', function ($scope, $modalInstance, config, data) {
  $scope.config = config;
  $scope.scopeParent = data;
})

.controller('attendanceFilterModal', function ($scope, $modalInstance, config, data) {
  $scope.config = config;
  $scope.scopeParent = data;
})

.controller('infoQuizModal', function ($scope, $modalInstance, $http, config, data, questionNumber, quiz, courseID, assignment, userID, users, prevID, nextID) {
  $scope.users = users;
  $scope.prevID = prevID;
  $scope.nextID = nextID;
  $scope.prevClass = (prevID >= 0 && nextID >= 0) ? 'btn_prev' : '';
  $scope.nextClass = (prevID >= 0 && nextID >= 0) ? 'btn_next' : '';
  $scope.config = config;
  $scope.scopeParent = data;
  $scope.questionNumber = questionNumber;
  $scope.courseID = courseID;
  $scope.userID = ($scope.scopeParent.userID) ? $scope.scopeParent.userID : userID;
  $scope.quiz = quiz;
  $scope.assignment = assignment;
  $http
  .get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/' + courseID + '/questions/' + quiz.questionID)
  .success(function (data) {
    $scope.question = data;
    $scope.user = _.filter(data.responses, function (user) {
      return user.userID === $scope.userID;
    })[0];
    $http
    .get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/' + courseID + '/' + $scope.userID + '/' + assignment.assignmentID)
    .success(function (data) {
      $scope.userQuestion = _.filter(data, function (question) {
        return question.questionID === $scope.quiz.questionID;
      })[0];
      $scope.questionNotChange = JSON.parse(JSON.stringify($scope.userQuestion));
    });
    $scope.question.correctPercent = data.correctCount * 100 / data.responses.length;
    $scope.question.incorrectPercent = data.incorrectCount * 100 / data.responses.length;
    $scope.question.notAnsweredPercent = data.notAnswered * 100 / data.responses.length;
  });

  $scope.changeIcon = function (user) {
    // if (typeof $scope.assignment['question_'+quiz.questionID] === 'undefined') {
    //   $scope.assignment['question_'+quiz.questionID] = {};
    // }

    var newNumber = Number(user.points),
        change;

    if (newNumber > user.total || newNumber < 0 || isNaN(newNumber)) {
      newNumber = user.points = $scope.questionNotChange.points;
    }

    change = newNumber !== $scope.questionNotChange.points;
    $scope.update = change;

    if (change) {
      _.forEach($('.inputm_' + quiz.questionID), function (el) {
        $(el).css({'color': 'orange'});
      });
    } else {
      _.forEach($('.inputm_' + quiz.questionID), function (el) {
        $(el).css({'color': ''});
      });
    }
  };

  $scope.updateGrade = function (quiz) {
    $http
    .put('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/'+$scope.courseID+'/questions/'+quiz.gradeID+'/'+quiz.points)
    .success(function(){
      $scope.questionNotChange.points = Number(quiz.points);
      $scope.update = false;
      _.forEach($('.inputm_' + quiz.questionID), function (el) {
        $(el).css({'color': ''});
        $scope.scopeParent.openModalNotifications('Updated student grade', 'The grade for this student has been successfully updated', true);
      });
    });
  };
})

.controller('infoQuizDetailModal', function ($scope, $modalInstance, $http, config, data, questionNumber, quiz, courseID, assignment, general, userID, caller, type) {
  $scope.caller = caller;
  $scope.type = type;
  $scope.courseID = courseID;
  $scope.userID = userID;
  $scope.general = general;
  $scope.config = config;
  $scope.scopeParent = data;
  $scope.questionNumber = questionNumber;
  $scope.quiz = quiz;
  $scope.assignment = assignment;
  $scope.countAnswers = [];
  $scope.answerCount = typeof userID === 'undefined';
  $scope.activeCount = 'active_tag_modal';
  $scope.activeList = '';
  $http
  .get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/' + courseID + '/questions/' + quiz.questionID)
  .success(function (data) {
    $scope.question = data;
    _.forEach(data.choices, function (item, pos) {
      $scope.pos = pos;
      var answers = _.filter($scope.question.responses, function (user) {
        return user.response === $scope.pos;
      });
      if (typeof userID !== 'undefined') {
        $scope.userView = _.filter($scope.question.responses, function (user) {
          return user.userID === $scope.userID;
        })[0];
      }
      $scope.countAnswers[pos] = answers.length;
    });
  });
  $scope.changeAnswerView = function (btn) {
    if (btn === 'count') {
      $scope.answerCount = true;
      $scope.activeCount = 'active_tag_modal';
      $scope.activeList = '';
    } else {
      $scope.answerCount = false;
      $scope.activeCount = '';
      $scope.activeList = 'active_tag_modal';
    }
  };
  $scope.setColor = function (general, i) {
    if (!general && i === $scope.userView.response) {
      return {color : 'orange'};
    } else  {
      return {color : ''};
    }
  };
})

.controller('attendanceModali', function ($scope, $modalInstance, $http, data, section, attendance, config) {
  $scope.config = config;
  $scope.scopeParent = data;
  section.students = (typeof section.students === 'number') ? section.students : section.students.length;
  if (typeof attendance.attended === 'undefined') {
    $http
    .get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/15/attendance')
    .success(function (data) {
      $scope.scopeAttendance = _.filter(_.filter(data, function (course) {
        return course.courseID === section.courseID;
      })[0].attendance, function (data) {
        return attendance.attendanceID === data.attendanceID;
      })[0];
    });
  } else {
    $scope.scopeAttendance = attendance;
  }
  $scope.section = section;
  $scope.update = false;
  $http
  .get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/' + section.courseID + '/attendance/' + attendance.attendanceID)
  .success(function (data) {
    $scope.attendance = data;
  });
  $scope.changeAttended = function (student, attended) {
    $http
    .put('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/' + section.courseID + '/attendance/null/' + attended, {userID:student.userID, assignmentID:attendance.attendanceID})
    .success(function () {
      $http
      .get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/' + section.courseID + '/attendance/' + attendance.attendanceID)
      .success(function (data) {
        $scope.attendance = data;
      });
      $http
      .get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/15/attendance')
      .success(function (data) {
        $scope.scopeAttendance = _.filter(_.filter(data, function (data){
          return section.courseID === data.courseID;
        })[0].attendance, function (data){
          return attendance.attendanceID === data.attendanceID;
        })[0];
      });
      $scope.update = true;
    });
  };

  $scope.updateParentData = function () {
    if ($scope.update) {
      $scope.scopeParent.updateData();
    }
  };
})

.controller('assignmentsFilterModal', function ($scope, $modalInstance, config, data) {
  $scope.config = config;
  $scope.scopeParent = data;
})

.controller('assignmentsImageA', function ($scope, $modalInstance, config, data) {
  $scope.config = config;
  $scope.scopeParent = data;
})

.controller('modalNotifications', function ($scope, $modalInstance, $http, config, title, msg, not, url, data) {
  $scope.config = config;
  $scope.scopeParent = data;
  $scope.title = title;
  $scope.msg = msg;
  $scope.not = not;
  $scope.okFunction = function () {
    $http
    .delete(url)
    .success(function () {
      $scope.scopeParent.updateData();
    });
  };
});