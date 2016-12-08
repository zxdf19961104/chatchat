$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAXFgqYMyfA2TuksZM9RKDdgPuBLBEMBMg",
    authDomain: "wk11-6d897.firebaseapp.com",
    databaseURL: "https://wk11-6d897.firebaseio.com",
    storageBucket: "wk11-6d897.appspot.com",
    messagingSenderId: "672589256676"
  };
  firebase.initializeApp(config);

  // Firebase database reference
    var dbChatRoom = firebase.database().ref().child('chatroom');
    var dbUser = firebase.database().ref().child('user');

    var photoURL;
    var $img = $('img');

  // REGISTER DOM ELEMENTS
  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $hovershadow = $('.hover-shadow');
  const $btnSubmit = $('#btnSubmit');
  const $signInfo = $('#sign-info');
  const $file = $('#file');

  //profile
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $profileAge = $('#profile-age');
  const $profileWork = $('#profile-work');
  const $profileInfo = $('#profile-about');

  //chatroom
  const $messageField = $('#messageInput');
  const $messageList = $('#example-messages');
  const $message = $('#example-messages');
  // Hovershadow
    $hovershadow.hover(
      function(){
        $(this).addClass("mdl-shadow--4dp");
      },
      function(){
        $(this).removeClass("mdl-shadow--4dp");
      }
    );

    var storageRef = firebase.storage().ref();

    function handleFileSelect(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      var file = evt.target.files[0];

      var metadata = {
        'contentType': file.type
      };

      
      // Push to child path.
      // [START oncomplete]
      storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
        $("#imginfo").addClass('is-active');
        console.log('Uploaded', snapshot.totalBytes, 'bytes.');
        console.log(snapshot.metadata);
        photoURL = snapshot.metadata.downloadURLs[0];
        console.log('File available at', photoURL);
        $("#imginfo").removeClass('is-active');

      }).catch(function(error) {
        // [START onfailure]
        console.error('Upload failed:', error);
        // [END onfailure]
      });
      // [END oncomplete]
    }

    window.onload = function() {
      $file.change(handleFileSelect);
      // $file.disabled = false;
    }


    // SignIn/SignUp/SignOut Button status
      var user = firebase.auth().currentUser;
      if (user) {
        $btnSignIn.attr('disabled', 'disabled');
        $btnSignUp.attr('disabled', 'disabled');
        $btnSubmit.removeAttr('disabled')
        $btnSignOut.removeAttr('disabled')
      } else {
        $btnSignOut.attr('disabled', 'disabled');
        $btnSubmit.attr('disabled', 'disabled');
        $btnSignIn.removeAttr('disabled')
        $btnSignUp.removeAttr('disabled')
      }

      // Sign In
        $btnSignIn.click(function(e){
          const email = $email.val();
          const pass = $password.val();
          const auth = firebase.auth();
          // signIn
          const promise = auth.signInWithEmailAndPassword(email, pass);
          promise.catch(function(e){
            console.log(e.message);
            $signInfo.html(e.message);
          });
          promise.then(function(){
            console.log('SignIn User');
            $password.val("");
          });
        });

        // SignUp
          $btnSignUp.click(function(e){
            const email = $email.val();
            const pass = $password.val();
            const auth = firebase.auth();
            // signUp
            const promise = auth.createUserWithEmailAndPassword(email, pass);
            promise.catch(function(e){
              console.log(e.message);
              $signInfo.html(e.message);
            });
            promise.then(function(user){
              console.log("SignUp user is "+user.email);
              const dbUserid = dbUser.child(user.uid);
              dbUserid.child("data").push({email:user.email});
              $password.val("");
            });
          });

          // Listening Login User
            firebase.auth().onAuthStateChanged(function(user){
              if(user) {
                console.log(user);
                const dbUserid = dbUser.child(user.uid);
                const loginName = user.displayName || user.email;
                $signInfo.html(loginName+" is login...");
                $btnSignIn.attr('disabled', 'disabled');
                $btnSignUp.attr('disabled', 'disabled');
                $btnSignOut.removeAttr('disabled')
                $btnSubmit.removeAttr('disabled')
                $profileName.html(user.displayName);
                $profileEmail.html(user.email);
                $img.attr("src",user.photoURL);

                dbUserid.once('child_added',function(snapshot){
                  var data = snapshot.val();
                  $profileAge.html(data.age);
                  $profileWork.html(data.work);
                  $profileInfo.html(data.info);
                });

                // Add a callback that is triggered for each chat message.
                  dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {
                    //GET DATA
                      var data = snapshot.val();
                      var username = data.name || "anonymous";
                      var message = data.text;
                      var pic = data.pic;
                      var person =user.uid;
                      //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
                      var $messageElement = $("<li>");
                      var $nameElement = $("<strong class='example-chat-username'></strong>");
                      if(person == data.user){
                        $messageElement.addClass("mine");
                        $nameElement.addClass("usermessage");
                        $nameElement.append($('<img>',{class:'message-pic userpic',src:data.pic}));
                        $messageElement.text(message).append($nameElement);
                      }else{
                        $nameElement.text(username).prepend($('<img>',{class:'message-pic',src:data.pic}));
                        $messageElement.text(message).prepend($nameElement);
                      }
                      //ADD MESSAGE
                      $messageList.append($messageElement)

                      //SCROLL TO BOTTOM OF MESSAGE LIST
                      $messageList[0].scrollTop = $messageList[0].scrollHeight;
                    });//child_added callback

                    user.providerData.forEach(function (profile) {
                        const dbUserid = dbUser.child(user.uid);
                        console.log("Sign-in provider: "+profile.providerId);
                        console.log("  Provider-specific UID: "+profile.uid);
                        console.log("  Name: "+profile.displayName);
                        console.log("  Email: "+profile.email);
                        console.log("  Photo URL: "+profile.photoURL);
                        dbUserid.on('child_added',function(snapshot){
                          var data = snapshot.val();
                          console.log("  age: "+data.age);
                          console.log("  work: "+data.work);
                          console.log("  info: "+data.info);
                        });
                      });
                    } else {
                      console.log("not logged in");
                      $profileName.html("Not signed");
                      $profileEmail.html("");
                      $profileAge.html(" ");
                      $profileWork.html(" ");
                      $profileInfo.html(" ");
                      $img.attr("src","");
                    }
                  });
                  // SignOut
                    $btnSignOut.click(function(){
                      firebase.auth().signOut();
                      console.log('LogOut');
                      $signInfo.html('No one login...');
                      $btnSignOut.attr('disabled', 'disabled');
                      $btnSignIn.removeAttr('disabled')
                      $btnSignUp.removeAttr('disabled')
                      $btnSubmit.attr('disabled', 'disabled');
                      $message.html('');
                      $("#userName").val('');
                      $("#imginfo").html(" ");
                    });

                    // Submit
                      $btnSubmit.click(function(){
                        var user = firebase.auth().currentUser;
                        const $userName = $('#userName').val();
                        const userName = $('#userName').val();
                        const userage = $("#userAge").val();
                        const userwork = $("#userWork").val();
                        const userinfo = $("#userAbout").val();
                        const promise = user.updateProfile({
                          displayName: $userName,
                          photoURL: photoURL
                        });
                        promise.then(function() {
                            const dbUserid = dbUser.child(user.uid);
                            if(userage != "")dbUserid.child("data").update({age:userage});
                            if(userwork != "")dbUserid.child("data").update({work:userwork});
                            if(userinfo != "")dbUserid.child("data").update({info:userinfo});
                            console.log("Update successful.");
                            user = firebase.auth().currentUser;
                            if (user) {
                              $profileName.html(user.displayName);
                              $profileEmail.html(user.email);
                              $img.attr("src",user.photoURL);
                              dbUserid.once('child_added',function(snapshot){
                                var data = snapshot.val();
                                $profileAge.html(data.age);
                                $profileWork.html(data.work);
                                $profileInfo.html(data.info);
                              });
                              const loginName = user.displayName || user.email;
                              $signInfo.html(loginName+" is login...");
                              $("#userAge").val('');
                              $("#userWork").val('');
                              $("#userAbout").val('');
                            }
                          });
                        });


                        // LISTEN FOR KEYPRESS EVENT
                          $messageField.keypress(function (e) {
                            user = firebase.auth().currentUser;
                            var username = user.displayName;
                            var message = $messageField.val();
                            console.log("message : " +message);
                            if (e.keyCode == 13 && message != '') {
                              //FIELD VALUES

                              console.log("username : "+username);
                              console.log("message :"+message);
                              console.log("pic :"+user.photoURL);
                              console.log("user :"+ user.uid);
                                //SAVE DATA TO FIREBASE AND EMPTY FIELD
                              dbChatRoom.push({name:username, text:message, pic:user.photoURL ,user:user.uid});


                              $messageField.val('');
                            }

                          });

                        });
