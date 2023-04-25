import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
// const Swal = require('sweetalert2')
// import {Swal} from '"https://cdn.jsdelivr.net/npm/sweetalert2@11"'
// import Swal from 'sweetalert2';
const Swal = window.Swal;
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
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
var submitError = document.getElementById('submit-error');
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
  if(!phoneNumber.value.match(/^\d{10}$/)){
    submitError.innerHTML='Enter valied Phone number'
    return false
}
  if(!phoneNumber.value== 10){
    submitError.innerHTML= "Enter Valid Data 11"
    return false
  }
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

      try{
        location.href = `/user/otpverified/${numb}`;

      }
      catch(e){
        // console.log(e);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: e,
          
        })
      }
      // ...
    })
    .catch((error) => {
      // User couldn't sign in (bad verification code?)
      // ...
      console.log(error);
      // alert("some error occured");
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'OTP you entered mismatched',
        
      })
    });
};



submit.addEventListener("click", sendVerificationCode);
validate.addEventListener("click", ValidateOTP);

