import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
const Swal = window.Swal;
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  setPersistence,
  inMemoryPersistence,
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

const email = document.getElementById("s-email").value;
const password = document.getElementById("s-password1").value;

var emailError = document.getElementById("email-error");
var passwordError = document.getElementById("password-error");

const auth = getAuth();

function validateEmails() {
  // var email=document.getElementById('s-email').value;
  if (email.length == 0) {
    emailError.innerHTML = "Email is rquired";
    return false;
  }
  if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)+$/)) {
    emailError.innerHTML = "enter valied email address";
    return false;
  }
  emailError.innerHTML = "";
  return true;
}

function validatePassword() {
  // var password=document.getElementById('s-password1').value
  if (password.length == 0) {
    passwordError.innerHTML = "Enter Password";
    return false;
  }
  passwordError.innerHTML = "";
  return true;
}

function emailLogin() {
  console.log("ive etheend");
  setPersistence(auth, inMemoryPersistence).then(() => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...

        return user.getIdToken().then((idToken) => {
          try {
            $.ajax({
              url: "/user/login-submit",
              method: "POST",
              data: {
                email: email,
                password: password,
                idToken,
                // csrfToken
              },
            });
          } catch (e) {
            // console.log(e);
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: e,
            });
          }
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Swal.fire({
          icon: "error",
          title: errorCode,
          text: errorMessage,
        });
      });
  });
}
