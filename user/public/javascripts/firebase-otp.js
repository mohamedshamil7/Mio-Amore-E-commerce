import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Your web app's Firebase configuration
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

const phoneNumber = document.getElementById("phonenumber_f");

const submit = document.getElementById("submitbtn");
const validate = document.getElementById("Validate");
const loginGoogle= document.getElementById("loginGoogle")

const auth = getAuth();

window.recaptchaVerifier = new RecaptchaVerifier(
  "recaptcha-container",
  {},
  auth
);

const sendVerificationCode = () => {
  const phone = `+91${phoneNumber.value}`;
  console.log("thisisthephone:", phone);
  const appVerifier = window.recaptchaVerifier;

  signInWithPhoneNumber(auth, phone, appVerifier)
    .then((confirmationResult) => {
      // SMS sent. Prompt user to type the code from the message, then sign the
      // user in with confirmationResult.confirm(code).
      let otpdiv = document.getElementById("otpDiv");
      otpdiv.style.display = "inline";
      window.confirmationResult = confirmationResult;

      // ...
    })
    .catch((error) => {
      alert(error);
    });
};

const ValidateOTP = () => {
  const code = document.getElementById("userOtp").value;

  confirmationResult
    .confirm(code)
    .then((result) => {
      const numb = phoneNumber.value;

      const user = result.user;
      // console.log(result);
      // console.log(result.user);


      location.href = `http://localhost:8001/user/otpverified/${numb}`;
      // ...
    })
    .catch((error) => {
      // User couldn't sign in (bad verification code?)
      // ...
      console.log(error);
      alert("some error occured");
    });
};

// const googlelogin= ()=>{
//   signInWithPopup(auth, provider).then((result)=>{
//      // This gives you a Google Access Token. You can use it to access the Google API.
//      const credential = GoogleAuthProvider.credentialFromResult(result);
//      const token = credential.accessToken;
//      // The signed-in user info.
//      const user = result.user;
//   }).catch((error)=>{
//     const errorCode = error.code;
//     const errorMessage = error.message;
//         // The email of the user's account used.
//         const email = error.customData.email;
//   // The AuthCredential type that was used.
//   const credential = GoogleAuthProvider.credentialFromError(error);
//   })
// }

submit.addEventListener("click", sendVerificationCode);
validate.addEventListener("click", ValidateOTP);
// loginGoogle.addEventListener("click",googlelogin)
