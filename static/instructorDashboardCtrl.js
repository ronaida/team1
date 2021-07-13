app.controller("instructorDashboardCtrl", function ($scope, $http) {
    $scope.badges = null;
    $scope.completionLabel = "0/0";


    $scope.init=()=>{
        $http.get("/api/user/badges",window.getAjaxOpts())
        .then((response) => {
            $scope.badges = response.data;
        });
    }

    
      
    //redirect the user to the previous page if they got logged out
    var redirectPath = window.sessionStorage.getItem("redirectPath");
    if(redirectPath!=null && redirectPath!=="" && redirectPath.indexOf("/")===0){
        //clear the session storage
        window.sessionStorage.removeItem("redirectPath");
        $location.url(redirectPath);
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

    $scope.fetchActivity = function(){
        var filter = "";
        if(typeof nameFilter !== 'undefined'){
            filter=nameFilter.value;
        }
        $http.get("/api/activity?query="+filter,window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null){
                    $scope.activityList = response.data;
                    if(response != null && response.data != null && Array.isArray(response.data.challenges)){
                        $scope.levelNames = {};
                        var challengeDefinitions = response.data.challenges;
                        let totalChCount = 0;
                        let passedChCount = 0;
                        if(challengeDefinitions.length >= 1){
                            //update the challenge definitions to include the current user's passed challenges
                            for(let levelId in challengeDefinitions){
                                var level = challengeDefinitions[levelId];
                                $scope.levelNames[levelId] = level.name;
        
                                var challenges = level.challenges;
                                if(challenges.length>0){
                                    $scope.challengesAvailable = true;
                                }
                                if(challenges!=null){
                                    for(let ch of challenges){
                                        var passedChallenges = $scope.user.passedChallenges;
                                        totalChCount++;
                                        if(passedChallenges!=null){
                                            for(let passedCh of passedChallenges){
                                                if(ch.id===passedCh.challengeId){
                                                    ch.passed = true;
                                                    passedChCount++;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        $scope.targetUrl = response.data.targetUrl;
                        $scope.moduleChallengeDefinitions = challengeDefinitions;
        
                        $scope.percentDone = passedChCount/totalChCount * 100;
                        $scope.completionLabel = `${passedChCount}/${totalChCount}`;
                    }
                    else{
                        $scope.challengesAvailable = false;
                    }
              
                }
            })
    }

    setInterval($scope.activityHeartBeat,10*1000);
    
    $scope.updateLocalUser = function(){
        $scope.isProfileSaveError = false;
        $scope.isProfileSaveSuccess = false;
        $scope.profileSaveErrorMessage = "";
        var profileInfo = {};
        profileInfo.curPassword = currentPassword.value.trim();
        profileInfo.newPassword = newPassword.value.trim();
        
        if(vfyPassword.value.trim()!==profileInfo.newPassword){
            $scope.isProfileSaveError = true;
            $scope.profileSaveErrorMessage = "New password and verification password do not match";
            return;
        }

        $http.post("/api/localUser/updateUser",{"profileInfo":profileInfo},window.getAjaxOpts())
        .then(function(response) {
            if(response !== null && response.data !== null){
                if(response.data.status == 200){
                    $scope.isProfileSaveSuccess = true;
                    $scope.profileSaveSuccessMessage = "User updated.";
                }
                else{
                    $scope.isProfileSaveError = true;
                    $scope.profileSaveErrorMessage = response.data.statusMessage;
                }
            }
        },function(errorResponse){
            $scope.isProfileSaveError = true;
            $scope.profileSaveErrorMessage = "A http error has occurred.";
            
        });
    }

    $scope.loadData = function(){
        $http.get("/api/user",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                var user = response.data;
                console.log(response.data)

                $scope.user = user;

                $scope.fullName = user.givenName + ' ' + user.familyName;
                $scope.firstName = user.givenName;
                $scope.role__=user.role;
                        
                //do the first activity heartbeat
                $scope.activityHeartBeat();

                console.log(user.accountId)
                //fetch students
                $http.get('/api/students?user_accountId=' + user.accountId.replace('Local_', '') ,window.getAjaxOpts())
                .then(function(response) {
                    if(response != null && response.data != null){
                        $scope.studentsList = response.data;
                        console.log($scope.studentsList);
                        /////////////
                        ///////////     Get progress
                        ////////////
                        if(response != null && response.data != null && Array.isArray($scope.studentsList.challenges)){
                            $scope.levelNames = {};
                            var challengeDefinitions = response.data.challenges;
                            let totalChCount = 0;
                            let passedChCount = 0;
                            if(challengeDefinitions.length >= 1){
                                //update the challenge definitions to include the current user's passed challenges
                                for(let levelId in challengeDefinitions){
                                    var level = challengeDefinitions[levelId];
                                    $scope.levelNames[levelId] = level.name;
            
                                    var challenges = level.challenges;
                                    if(challenges.length>0){
                                        $scope.challengesAvailable = true;
                                    }
                                    if(challenges!=null){
                                        for(let ch of challenges){
                                            var passedChallenges = $scope.user.passedChallenges;
                                            totalChCount++;
                                            if(passedChallenges!=null){
                                                for(let passedCh of passedChallenges){
                                                    if(ch.id===passedCh.challengeId){
                                                        ch.passed = true;
                                                        passedChCount++;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            $scope.targetUrl = response.data.targetUrl;
                            $scope.moduleChallengeDefinitions = challengeDefinitions;
            
                            $scope.percentDone = passedChCount/totalChCount * 100;
                            $scope.completionLabel = `${passedChCount}/${totalChCount}`;
                            $scope.studentsList.completionLabel = $scope.completionLabel;
                        }
                        else{
                            $scope.challengesAvailable = false;
                        }
                    }
                })
                
                //get the code blocks definitions
                $http.get("static/codeBlocks/codeBlocksDefinitions.json").then(function(response) {
                    if(response != null && response.data != null){
                        $scope.codeBlocks = response.data;

                    }
                });
            }
        });


    }

    $scope.loadData();

//instructor functions are here 

    $scope.beltsdeff=['Yellow Belt','Orange Belt','Green Belt','Purple Belt','Blue Belt','Black Belt'];

    $scope.updateStudent = function (index){

            var new_max_limit;
            var new_disabled_sloution;
            var studentUpdates={};

            //get the value of Solution Button	chlidren[3]
            new_disabled_sloution=document.getElementsByTagName("TR")[index+1].children[4].children[0].value;
            studentUpdates.accountId=$scope.studentsList[index].accountId;
            studentUpdates.id=$scope.studentsList[index].id;
            studentUpdates.solution_disabled=new_disabled_sloution;
            studentUpdates.max_progress=new_max_limit;

            ///api submiting here
            $scope.isUpdateSaveError = false;
            $scope.isUpdateSaveSuccess = false;
            $scope.UpdateSaveErrorMessage = "";
        
            $http.post("/api/student_update",{"studentUpdates": studentUpdates,},window.getAjaxOpts())
            .then(function(response) {
                if(response !== null && response.data !== null){
                    if(response.data.status == 200){
                        $scope.isUpdateSaveSuccess = true;
                        $scope.UpdateSaveSuccessMessage = "Updated successfully.";
                    }
                    else{
                        $scope.isUpdateSaveError = true;
                        $scope.UpdateSaveErrorMessage = response.data.statusMessage;
                    }
                }
            },function(errorResponse){
                $scope.isUpdateSaveError = true;
                $scope.UpdateSaveErrorMessage = "A http error has occurred.";
            
            });
                   
    }

    $scope.loadData();
    $scope.fetchActivity();

});