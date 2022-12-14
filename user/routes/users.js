


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
  addToWishlist,
  otppage,
  // otpcheck,
  addToCart,
  getCart,
  findbynumber,
  removeCart,
  changeProductQuantity,
  checkoutPage,
  addAddress,
  shopProducts

} = require("../controller/usercontroller");

/* GET home page. */
router.get('/',homeJwtCheck, function(req, res, next) {
  res.render('index', { title: 'Express' });
},);

router.get('/login',homeJwtCheck,renderLogin)

router.get("/otplogin",otppage)
// router.post("/otp-submit",otpcheck)

router.post('/login-submit',userLoginroute,redirectHome)
router.get("/logout",userLogout)

router.get('/signup',renderSignup,renderHome)


router.post("/signup-submit",userSignupRoute,renderHome)

router.get("/home",autherization,renderHome)

router.get("/product/:id",autherization,productPage)

router.get('/getImage/:id',imageRoute)

router.get("/wishlistPage",autherization,wishlistPage)

router.get("/addToWishlist/:id",addToWishlist)

router.post('/phone-submit',findbynumber)

router.get('/addToCart/:id',addToCart)

router.get('/usercart',autherization,getCart)

router.get('/removeCart/:id',removeCart)

router.post('/changeProductQuantity',changeProductQuantity)

router.get('/checkout',autherization,checkoutPage)

router.post('/addAddress',addAddress)

router.get('/shop',autherization,shopProducts)

module.exports = router;

