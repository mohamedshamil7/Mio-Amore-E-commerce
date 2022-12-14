var express = require('express');
var router = express.Router();

const{renderLogin,userLoginroute,renderSignup,userSignupRoute,cokkieJWtAuth,renderHome,redirectHome,LogincokkieJWtAuth}=require('../controller/usercontroller')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login',LogincokkieJWtAuth,renderLogin)

router.post('/login-submit',userLoginroute,redirectHome)

router.get('/signup',renderSignup,renderHome)


router.post("/signup-submit",userSignupRoute,redirectHome)

router.get("/home",cokkieJWtAuth,renderHome)


module.exports = router;
