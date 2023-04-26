


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
  search,
  viewOrderDetails,
  renderReviewPage,
  addReview,
  VariationSelect,
  check_quantity

} = require("../controller/usercontroller");

/* GET home page. */
router.get('/',nocache,homeJwtCheck,redirectHome);

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

router.post('/addToCart',addToCart)

router.get('/usercart',nocache,autherization,getCart)

router.post('/removeCart',removeCart)

router.post('/changeProductQuantity',changeProductQuantity)

router.get('/checkout',nocache,autherization,checkoutPage)

router.post('/addAddress',nocache,addAddress)

router.get('/shop',nocache,autherization,shopProducts)

router.post('/placeOrder',nocache,placeOrder)
router.get('/placeOrder/:data',nocache,placeOrder)

router.post('/verifyPayment',verifyPayment)

router.get('/orderSuccess',nocache,autherization,orderSuccess)
router.get("/profile",nocache,autherization,renderProfilePage)

router.get("/loginwithOtpPage",nocache,loginWtihOtpPage),


router.post("/otpVerification",nocache,otpVerification),
router.get("/googleSignUp/:userData",nocache,googleSignupData,redirectHome)
router.get("/googleLogin/:userData",nocache,googleLoginData,redirectHome)
router.get("/otpverified/:num",nocache,otpverified,redirectHome)
router.post("/cancelOrder",nocache,autherization,cancelOrderSubmit)
router.post("/returnOrder",nocache,autherization,returnOrderSubmit)
router.get("/wallet",nocache,autherization,getWalletPage)
router.get("/renderShop",nocache,autherization,renderShop)

router.post("/sort",nocache,autherization,sortShop)
router.post("/changeCategory",nocache,autherization,filterCategory)
router.post("/checkCoupen",nocache,autherization,checkCoupen)
router.post("/search",nocache,search)
router.delete("/deleteAdd",nocache,delAddress)
router.get('/viewOrderDetails/:id',nocache,autherization,viewOrderDetails)
router.get('/gotoReview/:id',nocache,autherization,renderReviewPage)
router.post('/addReview',nocache,autherization,addReview)

router.get('/VariationSelect',nocache,autherization,VariationSelect)
router.post('/check_quantity',nocache,autherization,check_quantity)

module.exports = router;

