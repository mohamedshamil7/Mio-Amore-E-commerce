var express = require('express');
var router = express.Router();
// import { initializeApp } from "firebase/app";
// const app = initializeApp(firebaseConfig);
// var firebase= require("firebase")
// var admin=require("firebase-admin")
// admin.auth(recap)



const{renderadminLogin,adminLoginRoute,redirectAdminDash,renderadminDash}=require("../controller/admincontroller")
/* GET home page. */
router.get('/login',renderadminLogin);

router.post('/login-submit',adminLoginRoute,redirectAdminDash)

router.get("/adminDash",renderadminDash)

router.get("/admin/allUsers")

module.exports = router;
