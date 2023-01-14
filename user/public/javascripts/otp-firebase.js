const { initializeApp } =require ("firebase/app");
const  { getAnalytics } =require ("firebase/analytics");
const  { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword ,RecaptchaVerifier,signInWithPhoneNumber} = require ("firebase/auth");
