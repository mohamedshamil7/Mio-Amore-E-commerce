



var express = require('express');
var router = express.Router();
// import { initializeApp } from "firebase/app";
// const app = initializeApp(firebaseConfig);
// var firebase= require("firebase")
// var admin=require("firebase-admin")
// admin.auth(recap)



const {
  adminSession,
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
  deleteProduct,
  editProduct,
  EditProductData,
  ImageSupplier
} = require("../controller/admincontroller");
/* GET home page. */
router.get('/',adminSession,renderadminLogin);

router.post('/login-submit',adminLoginRoute,redirectAdminDash)

router.get("/adminDash",adminSession,renderadminDash)

router.get("/allUsers",adminSession,AllUsersPage)

router.post("/blockManager",adminSession,userBlock)

router.get("/stocks",adminSession,stockPage)

router.get("/categories",categories_Page)

router.post("/addCategory",adminSession,addCategoryManager)

router.post("/deleteCategory",adminSession,deleteCategory)

router.get("/add-product",adminSession,addProductForm)

router.post("/addProduct-submit",adminSession,addNewProduct)

router.post("/delete-Product",deleteProduct)

router.post("/edit-Product",adminSession,editProduct)

router.post("/editProduct-submit",adminSession,EditProductData)

router.get("/ImageSupply/:id",ImageSupplier )


module.exports = router;

