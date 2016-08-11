'use strict';

angular.module('coursekeyApp')

.factory('GradesFunctions', function ($modal) {
    return {

        data : '',

        openGradesFilterModal : function(scope){
            var configObj = {

                title: 'hello',
                body: 'world',
                buttons: [{
                    name: 'ok',
                    class: ['successBtn'],
                    callback : function(){
                        alert('Hello World');
                      }
                  },
                {
                    name: 'Info',
                    class: ['btn-info'],
                    return : {}
                  },
                {
                    name: 'cancel',
                    class: ['cancelBtn'],
                    return : {}
                  }]
                };

            $modal.open({
                templateUrl: 'grades/components/modals/gradesFilterModal.html',
                controller: 'gradesFilterModal',
                backdrop: 'static',
                resolve: {
                    config: function () {
                        return configObj;
                      },
                    data: function () {
                        return scope;
                      }
                  }
                });
          },

        openInfoQuizDetailModal : function(courseID, quiz, questionNumber, assignment, scope, general, userID, caller, type){
            var configObj = {
              title: 'hello',
              body: 'world',
              buttons: [
                {
                  name: 'ok',
                  class: ['successBtn'],
                  callback : function(){
                    alert('Hello World');
                  }
                },
                {
                  name: 'Info',
                  class: ['btn-info'],
                  return : {}
                },
                {
                  name: 'cancel',
                  class: ['cancelBtn'],
                  return : {}
                }
              ]
            };

            $modal.open({
              templateUrl: 'infoQuizDetailModal',
              controller: 'infoQuizDetailModal',
              backdrop: 'static',
              resolve: {
                config: function () {
                  return configObj;
                },
                data: function () {
                  return scope;
                },
                questionNumber: function () {
                  return questionNumber + 1;
                },
                quiz: function () {
                  return quiz;
                },
                assignment: function () {
                  return assignment;
                },
                courseID: function () {
                  return courseID;
                },
                general: function () {
                  return general;
                },
                userID: function () {
                  return userID;
                },
                caller: function () {
                  return caller;
                },
                type: function () {
                  return type;
                }
              }
            });
          },

        openInfoQuizModal : function(courseID, quiz, questionNumber, assignment, scope, userID, users, prevID, nextID){
            var configObj = {
              title: 'hello',
              body: 'world',
              buttons: [
                {
                  name: 'ok',
                  class: ['successBtn'],
                  callback : function(){
                    alert('Hello World');
                  }
                },
                {
                  name: 'Info',
                  class: ['btn-info'],
                  return : {}
                },
                {
                  name: 'cancel',
                  class: ['cancelBtn'],
                  return : {}
                }
              ]
            };

            $modal.open({
              templateUrl: 'infoQuizModal',
              controller: 'infoQuizModal',
              backdrop: 'static',
              resolve: {
                config: function () {
                  return configObj;
                },
                data: function () {
                  return scope;
                },
                questionNumber: function () {
                  return questionNumber + 1;
                },
                quiz: function () {
                  return quiz;
                },
                assignment: function () {
                  return assignment;
                },
                courseID: function () {
                  return courseID;
                },
                userID: function () {
                  return userID;
                },
                users: function () {
                  return users;
                },
                prevID: function () {
                  return prevID;
                },
                nextID: function () {
                  return nextID;
                }
              }
            });
          },

        rowCollapsedFn : function (storeId) {
            this.rowCollapsed[storeId] = [];
            for (var i = 0; i < this.Datalength; i += 1) {
              this.rowCollapsed[storeId].push(false);
            }
          },
    
       
        selectTableRow : function (index, storeId, el) {
          var arrowClass = '';
          if (typeof this.rowCollapsed === 'undefined') {
            this.rowCollapsed = {};
          }
          if (typeof this.rowCollapsed[storeId] === 'undefined') {
            this.rowCollapsedFn(storeId);
          }

          this.rowCollapsed[storeId][index] = !this.rowCollapsed[storeId][index];

          if ($(el.currentTarget).find('#icon_arrow'+storeId).length > 0){
            arrowClass = (this.rowCollapsed[storeId][index]) ? '' : 'arrowdown';
            $('#icon_arrow'+storeId).attr('class', arrowClass);
          } else {
            arrowClass = (this.rowCollapsed[storeId][index]) ? 'fa fa-angle-up icon-angle-up' : 'fa fa-angle-down icon-angle-up';
            $(el.currentTarget).find('i').attr('class', arrowClass);
          }

        },

        changeArrow : function(){
          if ( this.controlArrow === 0){
            $('#icon_arrownw').attr('class','');
            this.controlArrow = 1;
          }
          else if ( this.controlArrow === 1){
            $('#icon_arrownw').attr('class','arrowdown');
            this.controlArrow = 0;
          }
        },
    
        changeArrown : function(idtable){
          if ( this.controlArrown === 0){
            $('#icon_arrowg'+idtable).attr('class','arrowdown');
            this.controlArrown = 1;
          }
          else if ( this.controlArrown === 1){
            $('#icon_arrowg'+idtable).attr('class','');
            this.controlArrown = 0;
          }
        },

        getFormatedPercent : function (percent) {
          return Math.round(percent * 10) / 10;
        }

      };
  });