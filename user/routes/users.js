


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
  renderProfilePage,
  otppage,
  // otpcheck,
  addToCart,
  getCart,
  findbynumber,
  removeCart,
  changeProductQuantity,
  checkoutPage,
  addAddress,
  shopProducts,
  placeOrder,
  verifyPayment,
  orderSuccess,
  loginWtihOtpPage,
  otpVerification,
  otpverified,
  googleSignupData,
  googleLoginData,
  cancelOrderSubmit,
  returnOrderSubmit,
  getWalletPage

} = require("../controller/usercontroller");

/* GET home page. */
router.get('/',homeJwtCheck, function(req, res, next) {
  res.render('index', { title: 'Express' });
},);

router.get('/login',homeJwtCheck,renderLogin)

// router.get("/otplogin",otppage)
// router.post("/otp-submit",otpcheck)

router.post('/login-submit',userLoginroute,redirectHome)
router.get("/logout",userLogout)

router.get('/signup',renderSignup,renderHome)


router.post("/signup-submit",userSignupRoute,renderLogin)

router.get("/home",autherization,renderHome)

router.get("/product/:id",autherization,productPage)

router.get('/getImage/:id',imageRoute)

router.get("/wishlistPage",autherization,wishlistPage)

router.get("/addToWishlist/:id",addToWishlist)

router.post('/phone-submit',findbynumber)

router.get('/addToCart/:id',addToCart)

router.get('/usercart',autherization,getCart)

router.post('/removeCart',removeCart)

router.post('/changeProductQuantity',changeProductQuantity)

router.get('/checkout',autherization,checkoutPage)

router.post('/addAddress',addAddress)

router.get('/shop',autherization,shopProducts)

router.post('/placeOrder',placeOrder)

router.post('/verifyPayment',verifyPayment)

router.get('/orderSuccess',orderSuccess)
router.get("/profile",autherization,renderProfilePage)

router.get("/loginwithOtpPage",loginWtihOtpPage),


router.post("/otpVerification",otpVerification),
router.get("/googleSignUp/:userData",googleSignupData,redirectHome)
router.get("/googleLogin/:userData",googleLoginData,redirectHome)
router.get("/otpverified/:num",otpverified,redirectHome)
router.post("/cancelOrder",cancelOrderSubmit)
router.post("/returnOrder",returnOrderSubmit)
router.get("/wallet",getWalletPage)

module.exports = router;

