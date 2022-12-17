var express = require('express');
var router = express.Router();
// import { initializeApp } from "firebase/app";
// const app = initializeApp(firebaseConfig);
// var firebase= require("firebase")
// var admin=require("firebase-admin")
// admin.auth(recap)



const {
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
  addNewProduct
} = require("../controller/admincontroller");
/* GET home page. */
router.get('/login',renderadminLogin);

router.post('/login-submit',adminLoginRoute,redirectAdminDash)

router.get("/adminDash",renderadminDash)

router.get("/allUsers",AllUsersPage)

router.post("/blockManager",userBlock)

router.get("/stocks",stockPage)

router.get("/categories",categories_Page)

router.post("/addCategory",addCategoryManager)

router.post("/deleteCategory",deleteCategory)

router.get("/add-product",addProductForm)

router.post("/addProduct-submit",addNewProduct)
module.exports = router;
