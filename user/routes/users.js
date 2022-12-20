


var express = require('express');
var router = express.Router();

const {
  renderLogin,
  userLoginroute,
  renderSignup,
  userSignupRoute,
  autherization,
  checkBlocked,
  renderHome,
  redirectHome,
  homeJwtCheck,
  userLogout,
  productPage,
  imageRoute,
  wishlistPage,
  addToWishlist
} = require("../controller/usercontroller");

/* GET home page. */
router.get('/',homeJwtCheck, function(req, res, next) {
  res.render('index', { title: 'Express' });
},);

router.get('/login',homeJwtCheck,renderLogin)

router.post('/login-submit',userLoginroute,redirectHome)
router.get("/logout",userLogout)

router.get('/signup/:id',renderSignup,renderHome)


router.post("/signup-submit",userSignupRoute,renderHome)

router.get("/home",autherization,renderHome)

router.get("/product/:id",autherization,productPage)

router.get('/getImage/:id',imageRoute)

router.get("/wishlistPage",wishlistPage)

router.get("/addToCart/:id",addToWishlist)

module.exports = router;

