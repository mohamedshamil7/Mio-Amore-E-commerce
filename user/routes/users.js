var express = require('express');
var router = express.Router();

const{renderLogin,userLoginroute,renderSignup,userSignupRoute,autherization,checkBlocked,renderHome,redirectHome,homeJwtCheck}=require('../controller/usercontroller')

/* GET home page. */
router.get('/',homeJwtCheck, function(req, res, next) {
  res.render('index', { title: 'Express' });
},);

router.get('/login',homeJwtCheck,renderLogin)

router.post('/login-submit',userLoginroute,redirectHome)

router.get('/signup',renderSignup,renderHome)


router.post("/signup-submit",userSignupRoute,redirectHome)

router.get("/home",autherization,renderHome)


module.exports = router;
