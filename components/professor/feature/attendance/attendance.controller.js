'use strict';

angular.module('coursekeyApp')

.controller('AttendanceProfessorCtrl', function ($scope, $http, AttendanceFunctions, GradesFunctions, AssignmentsFunctions) {
    rescalePage();

    $scope.Datalength = 0;
    $scope.controlArrow = 0;
    $scope.controlArrown = 0;
    $scope.rowCollapsed = {};
    $scope.attendanceNotChange = {};
    $scope.parentOnly = false;
    $scope.openAttendanceFilterModal = AttendanceFunctions.openAttendanceFilterModal;
    $scope.openModalNotifications = AssignmentsFunctions.openModalNotifications;
    $scope.openAttendanceModali = AttendanceFunctions.openAttendanceModali;
    $scope.getFormatedPercent = GradesFunctions.getFormatedPercent;
    $scope.rowCollapsedFn = GradesFunctions.rowCollapsedFn;
    $scope.selectTableRow = GradesFunctions.selectTableRow;
    $scope.changeArrow = GradesFunctions.changeArrow;
    $scope.changeArrown = GradesFunctions.changeArrown;
    $scope.selectedAverage = 'Average Week';
    $scope.parentButton = 'Show parent only';

    $scope.updateData = function () {
      $scope.attendancePromise = $http.get('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/15/attendance');

      $scope.attendancePromise.success(function (data) {
        data[0].name = 'Parent Class (' + data[0].name + ')';
        $scope.data = data;
        _.forEach(data, function (section) {
          $scope.currSecStud = section.students;
          $scope.attendanceNotChange['section_'+section.courseID] = JSON.parse(JSON.stringify(section.attendance));
          section.total = _.reduce(section.attendance, function (total, n) {
            return total + (n.attended * 100 / $scope.currSecStud);
          }, 0);
          section.total /= section.attendance.length;
          section.total = $scope.getFormatedPercent(section.total);
        });
        $scope.Datalength = $scope.data.length;

        $scope.averageWeek();
      });
    };

    $scope.updateData();

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

    $scope.getPercent = function (attended, students, obj) {
      var percent = $scope.getFormatedPercent(attended * 100 / students);
      if (typeof obj !== 'undefined') {
        obj.formatedPercent = percent;
      }
      return percent;
    };
    
    $scope.changeIcon = function (section, attendance, i) {
      if (typeof attendance['attendance_'+attendance.attendanceID] === 'undefined') {
        attendance['attendance_'+attendance.attendanceID] = {};
      }

      var newNumber = Number(attendance.points),
          change;

      if (newNumber < 0 || isNaN(newNumber)) {
        newNumber = attendance.points = $scope.attendanceNotChange['section_'+section.courseID][i].points;
      }

      change = newNumber !== $scope.attendanceNotChange['section_'+section.courseID][i].points;
      attendance['attendance_'+attendance.attendanceID].update = change;

      if (change) {
        _.forEach($('.input_' + attendance.attendanceID), function (el) {
          $(el).css({'color': 'orange'});
        });
      } else {
        _.forEach($('.input_' + attendance.attendanceID), function (el) {
          $(el).css({'color': ''});
        });
      }
    };

    $scope.updatePoints = function (section, attendance, i) {
      $http
      .put('http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/15/attendance/max/'+ attendance.attendanceID + '/' + attendance.points)
      .success(function () {
        $scope.attendanceNotChange['section_' + section.courseID][i].points = Number(attendance.points);
        attendance['attendance_'+attendance.attendanceID].update = false;
        _.forEach($('.input_' + attendance.attendanceID), function (el) {
          $(el).css({'color': ''});
        });
        $scope.openModalNotifications('Updated attendance', 'The maximum points for this attendance has been successfully updated', true);
      });
    };

    $scope.filterRange = function (section) {
      return function (item) {
        var att = $scope.getPercent(item.attended, section.students);
        if ($scope.searchPoints === '' || typeof $scope.searchPoints === 'undefined') {
          return att >= 0;
        }
        var searchPoints = $scope.searchPoints.split(' ').join(''),
            comp = searchPoints.split('').shift();
        if (comp === '>') {
          return att > Number(searchPoints.slice(1));
        } else if (comp === '<') {
          return att < Number(searchPoints.slice(1));
        } else if (comp === '=') {
          return att === Number(searchPoints.slice(1));
        } else if (!isNaN(Number(comp))) {
          return att === Number(searchPoints);
        } else {
          return att >= 0;
        }
      };
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

    $scope.deleteAttendance = function (id) {
      $scope.openModalNotifications('Delete attendance','Are you sure you want to delete this attendance?', false, 'http://ckstaging.elasticbeanstalk.com/api/v1/professor/gradebook/15/attendance/' + id, $scope);
    };

    $scope.chartObject = {
        'type': 'LineChart',
        'displayed': false,
        'data': {
          'cols': '',
          'rows': ''
        },
        'options': {
          'legend' : {
            'position':'top',
            'textStyle': {
              'color': 'white',
              'fontSize': 16,
              'bold': true
            }
          },
          'title': '',
          'textStyle': {'color':'white'},
          'backgroundColor': 'transparent',
          'titleTextStyle': {'color': 'white'},
          'isStacked': 'true',
          'fill': 20,
          'displayExactValues': true,
          'vAxis': {
            'title': '',
            'titleTextStyle': {'color': 'white'},
            'textStyle': {
                'color':'white',
                'fontSize': 16,
                'bold': true
              },
              'gridlines': {
                'count': 5,
                'color': 'white'
              },
              'baselineColor': 'white'
            },
            'hAxis': {
              'title': '',
              'titleTextStyle': {'color': 'white'},
              'textStyle': {
                  'color':'white',
                  'fontSize': 16,
                  'bold': true
                },
                'lineColor':'white'
              },
              'tooltip': {
                'isHtml': false
              },
              'lineWidth': 6,
              'series': {
                0: { color: '#FDDA11' },
                1: { color: 'white' },
                2: { color: '#8F8F8F' },
                3: { color: '#229743' }
              }
            },
            'formatters': {},
            'view': {}
          };

    $scope.averageWeek = function () {
      $scope.selectedAverage = 'Average Week';
      var cols = [{
          'id': 'month',
          'label': 'Month',
          'type': 'string',
          'p': {}
        }],

        today = moment(Date.now()).format('MM/DD/YYYY'),
        sevenDays = moment(Date.now()).subtract(6,'d').format('MM/DD/YYYY'),
        daysInitials = ['S','M','T','W','T','F','S'],
        tempDate = moment(new Date(sevenDays)).add(1,'d').format('MM/DD/YYYY'),

        days = [];

      days.push([{'v': daysInitials[moment(new Date(sevenDays)).day()]}]);

      do {
        days.push([{'v': daysInitials[moment(new Date(tempDate)).day()]}]);
        tempDate = moment(new Date(tempDate)).add(1,'d').format('MM/DD/YYYY');
      } while(tempDate !== today);
      days.push([{'v': daysInitials[moment(new Date(tempDate)).day()]}]);

      _.forEach($scope.data, function(course, i) {
        var attPerDays = [];
        if (i === 0) {
          cols.push({
            'id': 'lparent-class-id',
            'label': 'Parent Class',
            'type': 'number',
            'p': {}
          });
        } else if(!$scope.parentOnly) {
          cols.push({
            'id': 'section'+course.courseID,
            'label': course.name,
            'type': 'number',
            'p': {}
          });
        }

        $scope.currCourse = course;

        _.forEach(course.attendance, function (attendance) {
          var attFormated = moment(new Date(attendance.timestamp)),
            sevenFormated = moment(new Date(sevenDays)),
            todayFormated = moment(new Date(today));
          if ((sevenFormated.isBefore(attFormated) &&  todayFormated.isAfter(attFormated)) || ((sevenFormated.isSame(attFormated, 'year') && sevenFormated.isSame(attFormated, 'month') && sevenFormated.isSame(attFormated, 'day')) || (todayFormated.isSame(attFormated, 'year') && todayFormated.isSame(attFormated, 'month') && todayFormated.isSame(attFormated, 'day')))) {
            if (typeof attPerDays[attFormated.diff(moment(new Date(sevenDays)), 'days')] === 'undefined') {
              attPerDays[attFormated.diff(moment(new Date(sevenDays)), 'days')] = [];
            }
            attPerDays[attFormated.diff(moment(new Date(sevenDays)), 'days')].push($scope.getPercent(attendance.attended, $scope.currCourse.students));
          }
        });

        _.forEach(days, function (day, i) {
          var sum;
          if (typeof attPerDays[i] !== 'undefined') {
            sum = _.reduce(attPerDays[i], function (total, n) {
              return total + n;
            });
            day.push({'v': sum / attPerDays[i].length});
          } else {
            day.push({'v': 0});
          }
        });

      });

      var rows = [];
      _.forEach(days, function (day) {
        rows.push({'c': day});
      });

      $scope.chartObject.data.cols = cols;
      $scope.chartObject.data.rows = rows;
    };

    $scope.averageMonth = function () {
      $scope.selectedAverage = 'Average Month';
      var cols = [{
          'id': 'month',
          'label': 'Month',
          'type': 'string',
          'p': {}
        }],
        
        months = [],
        today = moment(Date.now()).format('MM/DD/YYYY'),
        monthAgo = moment(Date.now()).subtract(29,'d').format('MM/DD/YYYY');

      _.forEach($scope.data, function (course, i) {
        if (i === 0) {
          cols.push({
            'id': 'lparent-class-id',
            'label': 'Parent Class',
            'type': 'number',
            'p': {}
          });
        } else if(!$scope.parentOnly) {
          cols.push({
            'id': 'section'+course.courseID,
            'label': course.name,
            'type': 'number',
            'p': {}
          });
        }

        $scope.currCourse = course;
        $scope.coursePos = i;

        _.forEach(course.attendance, function (attendance) {
          var attFormated = moment(new Date(attendance.timestamp)),
            monthAgoFormated = moment(new Date(monthAgo)),
            todayFormated = moment(new Date(today));
          if ((monthAgoFormated.isBefore(attFormated) &&  todayFormated.isAfter(attFormated)) || ((monthAgoFormated.isSame(attFormated, 'year') && monthAgoFormated.isSame(attFormated, 'month') && monthAgoFormated.isSame(attFormated, 'day')) || (todayFormated.isSame(attFormated, 'year') && todayFormated.isSame(attFormated, 'month') && todayFormated.isSame(attFormated, 'day')))) {
            if (typeof months[moment(attendance.timestamp).month()] === 'undefined') {
              months[moment(attendance.timestamp).month()] = [];
            }
            if (typeof months[moment(attendance.timestamp).month()][moment(attendance.timestamp).date()] === 'undefined') {
              months[moment(attendance.timestamp).month()][moment(attendance.timestamp).date()] = [];
            }
            if (typeof months[moment(attendance.timestamp).month()][moment(attendance.timestamp).date()][$scope.coursePos] === 'undefined') {
              months[moment(attendance.timestamp).month()][moment(attendance.timestamp).date()][$scope.coursePos] = [];
            }
            months[moment(attendance.timestamp).month()][moment(attendance.timestamp).date()][$scope.coursePos].push($scope.getPercent(attendance.attended, $scope.currCourse.students));
          }
        });


        _.forEach(months, function (dates) {
          if (typeof dates !== 'undefined') {
            _.forEach(dates, function (date, i) {
              var sum;
              if (typeof date !== 'undefined' && typeof date[$scope.coursePos] !== 'undefined') {
                sum = _.reduce(date[$scope.coursePos], function (total, n) {
                  return total + n;
                });
                dates[i][$scope.coursePos] = sum / date[$scope.coursePos].length;
              }
            });
          }
        });
      });

      var rows = [],
        i, j, k,
        feb = ((moment(new Date(today)).year()%4 === 0 && moment(new Date(today)).year() % 100 !== 0) || moment(new Date(today)).year() % 400 === 0) ? 29 : 28,
        monthsLengths = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      for (i = moment(new Date(monthAgo)).month(); i <= moment(new Date(today)).month(); ++i) {
        if (i === moment(new Date(monthAgo)).month()) {
          for (j = moment(new Date(monthAgo)).date(); j <= monthsLengths[i]; ++j) {
            $scope.nameDate = ((i + 1 < 10) ? '0' + (i + 1) : i + 1) + '/' + ((j < 10) ? '0' + j : j);
            $scope.obj = {};
            $scope.obj.c = [];
            $scope.obj.c.push({'v': $scope.nameDate});
            if (typeof months[i] !== 'undefined' && typeof months[i][j] !== 'undefined') {
              _.forEach(months[i][j], $scope.processCourse);
              if (months[i][j].length < $scope.data.length) {
                for (k = months[i][j].length - 1; k < $scope.data.length; ++k) {
                  if (typeof months[i][j][k] === 'undefined') {
                    $scope.obj.c.push({'v': 0});
                  }
                }
              }
            } else {
              $scope.obj.c.push({'v': 0}, {'v': 0});
            }
            rows.push($scope.obj);
          }
        } else if (i === moment(new Date(today)).month()) {
          for (j = 1; j <= moment(new Date(today)).date(); ++j) {
            $scope.nameDate = ((i + 1 < 10) ? '0' + (i + 1) : i + 1) + '/' + ((j < 10) ? '0' + j : j);
            $scope.obj = {};
            $scope.obj.c = [];
            $scope.obj.c.push({'v': $scope.nameDate});
            if (typeof months[i] !== 'undefined' && typeof months[i][j] !== 'undefined') {
              _.forEach(months[i][j], $scope.processCourse);
              if (months[i][j].length < $scope.data.length) {
                for (k = months[i][j].length - 1; k < $scope.data.length; ++k) {
                  if (typeof months[i][j][k] === 'undefined') {
                    $scope.obj.c.push({'v': 0});
                  }
                }
              }
            } else {
              $scope.obj.c.push({'v': 0}, {'v': 0});
            }
            rows.push($scope.obj);
          }
        } else {
          for (j = 1; j <= monthsLengths[i]; ++j) {
            $scope.nameDate = ((i + 1 < 10) ? '0' + (i + 1) : i + 1) + '/' + ((j < 10) ? '0' + j : j);
            $scope.obj = {};
            $scope.obj.c = [];
            $scope.obj.c.push({'v': $scope.nameDate});
            if (typeof months[i] !== 'undefined' && typeof months[i][j] !== 'undefined') {
              _.forEach(months[i][j], $scope.processCourse);
              if (months[i][j].length < $scope.data.length) {
                for (k = months[i][j].length - 1; k < $scope.data.length; ++k) {
                  if (typeof months[i][j][k] === 'undefined') {
                    $scope.obj.c.push({'v': 0});
                  }
                }
              }
            } else {
              $scope.obj.c.push({'v': 0}, {'v': 0});
            }
            rows.push($scope.obj);
          }
        }
      }

      $scope.chartObject.data.cols = cols;
      $scope.chartObject.data.rows = rows;
    };

    $scope.processCourse = function (course) {
      if (typeof course !== 'undefined') {
        $scope.obj.c.push({'v': course});
      } else {
        $scope.obj.c.push({'v': 0});
      }
    };

    $scope.averageYear = function () {
      $scope.selectedAverage = 'Average Year';
      var cols = [{
          'id': 'month',
          'label': 'Month',
          'type': 'string',
          'p': {}
        }],
        
        months = [];

      _.forEach($scope.data, function (course, i) {
        if (i === 0) {
          cols.push({
            'id': 'lparent-class-id',
            'label': 'Parent Class',
            'type': 'number',
            'p': {}
          });
        } else if(!$scope.parentOnly) {
          cols.push({
            'id': 'section'+course.courseID,
            'label': course.name,
            'type': 'number',
            'p': {}
          });
        }

        $scope.currCourse = course;
        $scope.coursePos = i;

        _.forEach(course.attendance, function (attendance) {
          if (typeof months[moment(attendance.timestamp).month()] === 'undefined') {
            months[moment(attendance.timestamp).month()] = [];
          }
          if (typeof months[moment(attendance.timestamp).month()][moment(attendance.timestamp).date()] === 'undefined') {
            months[moment(attendance.timestamp).month()][moment(attendance.timestamp).date()] = [];
          }
          if (typeof months[moment(attendance.timestamp).month()][moment(attendance.timestamp).date()][$scope.coursePos] === 'undefined') {
            months[moment(attendance.timestamp).month()][moment(attendance.timestamp).date()][$scope.coursePos] = [];
          }
          months[moment(attendance.timestamp).month()][moment(attendance.timestamp).date()][$scope.coursePos].push($scope.getPercent(attendance.attended, $scope.currCourse.students));
        });

        _.forEach(months, function (dates) {
          if (typeof dates !== 'undefined') {
            _.forEach(dates, function (date, i) {
              var sum;
              if (typeof date !== 'undefined' && typeof date[$scope.coursePos] !== 'undefined') {
                sum = _.reduce(date[$scope.coursePos], function (total, n) {
                  return total + n;
                });
                dates[i][$scope.coursePos] = sum / date[$scope.coursePos].length;
              }
            });
          }
        });
      });

      var rows = [];
      _.forEach(months, function (dates, i) {
        if (typeof dates !== 'undefined') {
          $scope.currMonth = i;
          _.forEach(dates, function (date, i) {
            if (typeof date !== 'undefined') {
              $scope.nameDate = (($scope.currMonth + 1 < 10) ? '0' + ($scope.currMonth + 1) : $scope.currMonth + 1) + '/' + ((i < 10) ? '0' + i : i);
              var obj = {};
              obj.c = [];
              obj.c.push({'v': $scope.nameDate});
              _.forEach(date, function (course) {
                if (typeof course !== 'undefined') {
                  obj.c.push({'v': course});
                } else {
                  obj.c.push({'v': 0});
                }
              });
              rows.push(obj);
            }
          });
        }
      });

      $scope.chartObject.data.cols = cols;
      $scope.chartObject.data.rows = rows;
    };

    $scope.enableParentOnly = function () {
      $scope.parentButton = ($scope.parentOnly) ? 'Show parent only' : 'Show all courses';
      $scope.searchSection = ($scope.parentOnly) ? '' : $scope.data[0].name;
      $scope.parentOnly = !$scope.parentOnly;
      if ($scope.selectedAverage === 'Average Week') {
        $scope.averageWeek();
      } else if ($scope.selectedAverage === 'Average Month') {
        $scope.averageMonth();
      } else {
        $scope.averageYear();
      }
    };

  });
