



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
  ImageSupplier,
  availabilityCheck,
  allorders,
  cancelOrderAdmin,
  viewOrderProduct,
  deliveryStatus,
  adminLogout,
} = require("../controller/admincontroller");
const{
  uploadMultiple
}=require("../public/javascripts/multer")
/* GET home page. */
router.get('/',renderadminLogin);

router.post('/login-submit',adminLoginRoute,redirectAdminDash)

router.get("/adminDash",autherization,renderadminDash)

router.get("/allUsers",autherization,AllUsersPage)

router.post("/blockManager",autherization,userBlock)

router.get("/stocks",autherization,stockPage)

router.get("/categories",autherization,categories_Page)

router.post("/addCategory",autherization,addCategoryManager)

router.post("/prodAvailability/:id",autherization,availabilityCheck)

router.post("/deleteCategory/:id",autherization,deleteCategory)

router.get("/add-product",autherization,addProductForm)

router.post("/addProduct-submit",autherization,uploadMultiple,addNewProduct)

// router.post("/delete-Product",deleteProduct)

router.post("/edit-Product",autherization,editProduct)

router.post("/editProduct-submit",autherization,uploadMultiple,EditProductData)

router.get("/ImageSupply/:Image",ImageSupplier )

router.get("/allorders",autherization,allorders)

router.post('/cancelOrder',autherization, cancelOrderAdmin);

router.get('/view-order-product/:id',autherization, viewOrderProduct);
router.post("/delivery-status/:id",autherization, deliveryStatus)

router.get("/logout",autherization,adminLogout)

module.exports = router;

