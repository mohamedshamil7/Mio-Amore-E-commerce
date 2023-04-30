


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
  editVariation_submit,
  homeJwtCheck
} = require("../controller/admincontroller");
const{
  // uploadMultiple
  upload,
  upload1,
  upload2,
  upload3,
}=require("../public/javascripts/multer")
/* GET home page. */
router.get('/admin/',nocache,homeJwtCheck,renderadminLogin);
router.post('/admin/login-submit',nocache,adminLoginRoute,redirectAdminDash)


router.get("/admin/adminDash",nocache,autherization,renderadminDash)
router.post('/admin/sales',autherization,salesReport)

router.get("/admin/allUsers",nocache,autherization,AllUsersPage)

router.post("/admin/blockManager",autherization,userBlock)

router.get("/admin/stocks",nocache,autherization,stockPage)

router.get("/admin/categories",nocache,autherization,categories_Page)
router.get("/admin/brands",nocache,autherization,brandsPage)


router.post("/admin/addBrand",nocache,autherization,addBrand)
router.post("/admin/addCategory",nocache,autherization,addCategoryManager)

router.post("/admin/prodAvailability/:id",autherization,availabilityCheck)

router.post("/admin/deleteCategory/:id",autherization,deleteCategory)
router.post("/admin/deleteBrand/:id",autherization,deleteBrand)

router.get("/admin/add-product",nocache,autherization,addProductForm)

router.post("/admin/addProduct-submit",autherization,upload,addNewProduct)

// router.post("/delete-Product",deleteProduct)

router.post("/admin/edit-Product",nocache,autherization,editProduct)

router.post("/admin/editProduct-submit",autherization,upload,EditProductData)



router.get("/admin/allorders",nocache,autherization,allorders)

router.post('/admin/cancelOrder',autherization, cancelOrderAdmin);

router.get('/admin/view-order-product/:id',nocache,autherization, viewOrderProduct);
router.get('/admin/returnConfirm/:id',nocache,autherization, confrimReturn);
router.post("/admin/delivery-status",autherization, deliveryStatus)

router.get("/admin/logout",nocache,autherization,adminLogout)
router.delete("/admin/deleteImage",nocache,autherization,deleteImage)

router.get("/admin/addCoupen",nocache,autherization,getAddCoupenPage)
router.get("/admin/coupen",nocache,autherization,getCoupenpage)
router.post('/admin/addcouponsubmit',nocache,autherization,addCoupenSubmit)
router.get('/admin/generatecode', autherization, codeGenerator);
router.post('/admin/deletecoupon', autherization, deletecoupon);

router.post('/admin/deliveryDateSubmit', autherization, deliveryDateSubmit);

router.get("/admin/banners",nocache,autherization,bannerPage)

router.get("/admin/scheduleOrder/:id",nocache,autherization,scheduleOrder)

router.post("/admin/banner1-submit",autherization,upload1,banner1Add)
router.post("/admin/banner2-submit",autherization,upload2,banner2Add)
router.post("/admin/banner3-submit",autherization,upload3,banner3Add)

router.delete("/admin/delBanner",nocache,autherization,delBanner)
router.get("/admin/confirmDelivery/:id",nocache,autherization,confirmDelivery)
router.get("/admin/invoice",nocache,autherization,invoice)
router.get("/admin/billLabel",nocache,autherization,renderbillLabel)
router.get("/admin/Sales",nocache,autherization,renderSalesReport)
router.post("/admin/sale-filter",nocache,autherization,salesFilter)

router.get("/admin/addVariations",nocache,autherization,addVariations)

router.delete("/admin/variationDelete",nocache,autherization,variationDelete)
router.post("/admin/addVarient-submit",nocache,autherization,addVarient_submit)
router.get("/admin/variationEdit",nocache,autherization,variationEdit)

router.post("/admin/editVariation-submit",nocache,autherization,editVariation_submit)
module.exports = router;

