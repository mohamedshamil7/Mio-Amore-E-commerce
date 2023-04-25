import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
  } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCNaypDDBtu3WZWta6H3MEpNOI4DSb0MWg",
    authDomain: "eccom-7f406.firebaseapp.com",
    projectId: "eccom-7f406",
    storageBucket: "eccom-7f406.appspot.com",
    messagingSenderId: "16269643748",
    appId: "1:16269643748:web:dd38f931ae7fd6b797c1f1",
  };
  

  const app = initializeApp(firebaseConfig);
  const provider = new GoogleAuthProvider();
  
  // const phoneNumber = document.getElementById("phonenumber_f");
  
  
  const loginGoogle= document.getElementById("loginGoogle")
  
  const auth = getAuth();
  
  
  
  const googlelogin= ()=>{
    signInWithPopup(auth, provider).then((result)=>{
       // This gives you a Google Access Token. You can use it to access the Google API.
       const credential = GoogleAuthProvider.credentialFromResult(result);
       const token = credential.accessToken;
       // The signed-in user info.
       const user = result.user;
       const newuser = (result._tokenResponse.isNewUser)? true :false
       console.log(newuser);
       const userData={
         email:user.email,
         username:user.displayName
        }

       console.log(user);   
       
       console.log(userData);
       var queryString = $.param(userData);
       if(newuser){
        // alert("new user")


        



        if(userData){

          location.href = `/googleSignUp/${queryString}`;

         }else{
          alert("error occured")
         }
       }else{
        // alert('old user')
        if(userData){
          // var queryString = $.param(userData);
          location.href = `/googleLogin/${queryString}`;

         }else{
          alert("error occured")
         }

       }
       
       
    }).catch((error)=>{
      const errorCode = error.code;
      const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email; 
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    })
  }
  
  // submit.addEventListener("click", sendVerificationCode);
  // validate.addEventListener("click", ValidateOTP);
  loginGoogle.addEventListener("click",googlelogin)
  