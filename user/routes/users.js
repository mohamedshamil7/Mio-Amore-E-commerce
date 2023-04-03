


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
  getWalletPage,
  nocache,
  sortShop,
  renderShop,
  filterCategory,
  checkCoupen,
  delAddress,
  search

} = require("../controller/usercontroller");

/* GET home page. */
router.get('/',nocache,homeJwtCheck, function(req, res, next) {
  res.render('index', { title: 'Express' });
},);

router.get('/login',nocache,homeJwtCheck,renderLogin)

// router.get("/otplogin",otppage)
// router.post("/otp-submit",otpcheck)

router.post('/login-submit',userLoginroute,redirectHome)
router.get("/logout",nocache,userLogout)

router.get('/signup',nocache,renderSignup,renderHome)


router.post("/signup-submit",userSignupRoute,renderLogin)

router.get("/home",nocache,autherization,renderHome)

router.get("/product/:id",nocache,autherization,productPage)

router.get('/getImage/:id',imageRoute)

router.get("/wishlistPage",nocache,autherization,wishlistPage)

router.get("/addToWishlist/:id",addToWishlist)

router.post('/phone-submit',findbynumber)

router.get('/addToCart/:id',addToCart)

router.get('/usercart',nocache,autherization,getCart)

router.post('/removeCart',removeCart)

router.post('/changeProductQuantity',changeProductQuantity)

router.get('/checkout',nocache,autherization,checkoutPage)

router.post('/addAddress',nocache,addAddress)

router.get('/shop',nocache,autherization,shopProducts)

router.post('/placeOrder',nocache,placeOrder)
router.get('/placeOrder/:data',nocache,placeOrder)

router.post('/verifyPayment',verifyPayment)

router.get('/orderSuccess',nocache,orderSuccess)
router.get("/profile",nocache,autherization,renderProfilePage)

router.get("/loginwithOtpPage",nocache,loginWtihOtpPage),


router.post("/otpVerification",nocache,otpVerification),
router.get("/googleSignUp/:userData",nocache,googleSignupData,redirectHome)
router.get("/googleLogin/:userData",nocache,googleLoginData,redirectHome)
router.get("/otpverified/:num",nocache,otpverified,redirectHome)
router.post("/cancelOrder",nocache,cancelOrderSubmit)
router.post("/returnOrder",nocache,returnOrderSubmit)
router.get("/wallet",nocache,getWalletPage)
router.get("/renderShop",nocache,renderShop)

router.post("/sort",nocache,sortShop)
router.post("/changeCategory",nocache,filterCategory)
router.post("/checkCoupen",nocache,checkCoupen)
router.post("/search",nocache,search)
router.delete("/deleteAdd",nocache,delAddress)

module.exports = router;

