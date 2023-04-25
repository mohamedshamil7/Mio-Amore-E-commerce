


var express = require('express');
var router = express.Router();

// import { initializeApp } from "firebase/app";
// const app = initializeApp(firebaseConfig);
// var firebase= require("firebase")
// var admin=require("firebase-admin")
// admin.auth(recap)



const {
  autherization,
  renderadminLogin,
  adminLoginRoute,
  redirectAdminDash,
  renderadminDash,
  AllUsersPage,
  userBlock,
  stockPage,
  categories_Page,
  addCategoryManager,
  deleteCategory,
  addProductForm,
  addNewProduct,
  // deleteProduct,
  editProduct,
  EditProductData,

  availabilityCheck,
  allorders,
  cancelOrderAdmin,
  viewOrderProduct,
  deliveryStatus,
  adminLogout,
  nocache,
  salesReport,
  deleteImage,
  brandsPage,
  addBrand,
  deleteBrand,
  getAddCoupenPage,
  addCoupenSubmit,
  codeGenerator,
  getCoupenpage,
  deletecoupon,
  bannerPage,
  banner1Add,
  banner2Add,
  banner3Add,
  delBanner,
  confrimReturn,
  scheduleOrder,
  deliveryDateSubmit,
  confirmDelivery,
  invoice,
  renderbillLabel,
  renderSalesReport,
  salesFilter,
  addVariations,
  addVarient_submit,
  variationDelete,
  variationEdit,
  editVariation_submit
} = require("../controller/admincontroller");
const{
  // uploadMultiple
  upload,
  upload1,
  upload2,
  upload3,
}=require("../public/javascripts/multer")
/* GET home page. */
router.get('/',renderadminLogin);

router.post('/sales',autherization,salesReport)
router.post('/login-submit',nocache,adminLoginRoute,redirectAdminDash)

router.get("/adminDash",nocache,autherization,renderadminDash)

router.get("/allUsers",nocache,autherization,AllUsersPage)

router.post("/blockManager",autherization,userBlock)

router.get("/stocks",nocache,autherization,stockPage)

router.get("/categories",nocache,autherization,categories_Page)
router.get("/brands",nocache,autherization,brandsPage)


router.post("/addBrand",nocache,autherization,addBrand)
router.post("/addCategory",nocache,autherization,addCategoryManager)

router.post("/prodAvailability/:id",autherization,availabilityCheck)

router.post("/deleteCategory/:id",autherization,deleteCategory)
router.post("/deleteBrand/:id",autherization,deleteBrand)

router.get("/add-product",nocache,autherization,addProductForm)

router.post("/addProduct-submit",autherization,upload,addNewProduct)

// router.post("/delete-Product",deleteProduct)

router.post("/edit-Product",nocache,autherization,editProduct)

router.post("/editProduct-submit",autherization,upload,EditProductData)



router.get("/allorders",nocache,autherization,allorders)

router.post('/cancelOrder',autherization, cancelOrderAdmin);

router.get('/view-order-product/:id',nocache,autherization, viewOrderProduct);
router.get('/returnConfirm/:id',nocache,autherization, confrimReturn);
router.post("/delivery-status",autherization, deliveryStatus)

router.get("/logout",nocache,autherization,adminLogout)
router.delete("/deleteImage",nocache,autherization,deleteImage)

router.get("/addCoupen",nocache,autherization,getAddCoupenPage)
router.get("/coupen",nocache,autherization,getCoupenpage)
router.post('/addcouponsubmit',nocache,autherization,addCoupenSubmit)
router.get('/generatecode', autherization, codeGenerator);
router.post('/deletecoupon', autherization, deletecoupon);

router.post('/deliveryDateSubmit', autherization, deliveryDateSubmit);

router.get("/banners",nocache,autherization,bannerPage)

router.get("/scheduleOrder/:id",nocache,autherization,scheduleOrder)

router.post("/banner1-submit",autherization,upload1,banner1Add)
router.post("/banner2-submit",autherization,upload2,banner2Add)
router.post("/banner3-submit",autherization,upload3,banner3Add)

router.delete("/delBanner",nocache,autherization,delBanner)
router.get("/confirmDelivery/:id",nocache,autherization,confirmDelivery)
router.get("/invoice",nocache,autherization,invoice)
router.get("/billLabel",nocache,autherization,renderbillLabel)
router.get("/Sales",nocache,autherization,renderSalesReport)
router.post("/sale-filter",nocache,autherization,salesFilter)

router.get("/addVariations",nocache,autherization,addVariations)

router.delete("/variationDelete",nocache,autherization,variationDelete)
router.post("/addVarient-submit",nocache,autherization,addVarient_submit)
router.get("/variationEdit",nocache,autherization,variationEdit)

router.post("/editVariation-submit",nocache,autherization,editVariation_submit)
module.exports = router;

