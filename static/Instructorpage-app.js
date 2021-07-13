var app = angular.module('instructorCtrlApp', ['ngRoute','dataSvcModule']);


app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "static/instructorDashboard.html",
        controller: "instructorDashboardCtrl"
    }).when("/challenges/:moduleId?", {
        templateUrl : "static/challenges.html",
        controller: "challengesCtrl"
    })
    .when("/submitCode/:moduleId/:challengeId", {
        templateUrl : "static/submitCode.html",
        controller: "submitCodeCtrl"
    })
    .when("/codeBlocks/:codeBlockId", {
        templateUrl : "static/codeBlocks.html",
        controller: "codeBlocksCtrl"
    })
    .when("/leaderboard", {
        templateUrl : "static/leaderboard.html",
        controller: "leaderboardCtrl"
    }).when("/activity", {
        templateUrl : "static/activity.html",
        controller: "activityCtrl"
    }).when("/dashboard", {
        templateUrl : "static/dashboard.html",
        controller: "dashboardCtrl"
    }).when("/report", {
        templateUrl : "static/report.html",
        controller: "reportCtrl"
    }).when("/solution/:challengeId", {
        templateUrl : "static/solution.html",
        controller: "solutionCtrl"
    });
});

app.controller('instructorCtrl', ['$rootScope','$http','$location','dataSvc', function($scope, $http, $location, dataSvc) {
   

    //redirect the user to the previous page if they got logged out
    var redirectPath = window.sessionStorage.getItem("redirectPath");
    if(redirectPath!=null && redirectPath!=="" && redirectPath.indexOf("/")===0){
        //clear the session storage
        window.sessionStorage.removeItem("redirectPath");
        $location.url(redirectPath);
    }

    $scope.loadData = function(){
        $http.get("/api/user",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                var user = response.data;
                
                $scope.user = user;
                $scope.fullName = user.givenName + ' ' + user.familyName;
                $scope.firstName = user.givenName;
               // $scope.
                $scope.firstName = user.givenName;
                $scope.firstName = user.givenName;
              
 

                //get the code blocks definitions
                $http.get("static/codeBlocks/codeBlocksDefinitions.json").then(function(response) {
                    if(response != null && response.data != null){
                        $scope.codeBlocks = response.data;

                    }
                });
            }
        });
    }

    $scope.activityHeartBeat = function(){
        $http.get("/api/activity/heartbeat",window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null && response.status === 200){
                    if(response.data.length > 0){
                        var activity = response.data[0];
                        var message = activity.givenName + " " + activity.familyName + " has solved '" +
                        activity.challengeName + "'";
                        $scope.showActivityMessage = $scope.latestActivityMessage !== message;
                        if($scope.showActivityMessage && $scope.fetchActivity){
                            $scope.fetchActivity();
                        }
                        $scope.latestActivityMessage = message;  
                    }            
                    else if(response.data.status===401){
                        window.location = "/"; 
                    }
                }
                else{
                    window.location = "/";    
                }
            },function(){
                window.location = "/";
            });
    }
    setInterval($scope.activityHeartBeat,10*1000);

    //whether the menu is active
    $scope.isActive = function (viewLocation) { 
        if(viewLocation==="/") return $location.path()===viewLocation;
        return $location.path().indexOf(viewLocation)==0;
    };

    $scope.fetchActivity = function(){
        var filter = "";
        if(typeof nameFilter !== 'undefined'){
            filter=nameFilter.value;
        }
        $http.get("/api/instructoractivity?query="+filter,window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null){
                    $scope.activityList = response.data;
                }
            })
    }
    
    $scope.fetchStudents = function(){
        $http.get("/api/students",window.getAjaxOpts())
            .then(function(response) {
                // if(response != null && response.data != null){
                //     $scope.students = {};
                //     var studentsList = response.data;
                //     //create a map of team names to team ids
                //     for(let team of studentsList){
                //         $scope.teamNames[team.id] = team.name;
                //     }
                //     $http.get("/api/users",window.getAjaxOpts())
                //     .then(function(response) {
                //         if(response != null && response.data != null){

                //             for(let team of studentsList){
                //                 if(team.ownerId!=null && team.ownerId === $scope.user.id){// the user cannot change their team until they delete their current team
                //                     $scope.ownedTeam = team;
                //                 }
                //                 if(team.id===$scope.user.teamId){
                //                     userTeamListChoice.value = team.name;
                //                     $scope.existingTeamSelect = team.id;
                //                 }
                //             }
                //             $scope.studentsList = studentsList;

                //         }
                //     });
                // }
            });
    }

    $scope.loadData();
    //$scope.fetchStudents();
    //$scope.fetchActivity();

}]);