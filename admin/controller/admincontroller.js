
const { response } = require('../app')
const adminHelper= require('../model/adminHelpers')


module.exports={
 renderadminLogin:(req,res)=>{
    res.render("adminView/adminlogin")
 },
 adminLoginRoute:(req,res,next)=>{
    let password="123"
    let username="sha"
    {(password==req.body.password && username==req.body.username)? next() : res.render("adminView/adminlogin",{error:"invalid username or password"})}
 },

 redirectAdminDash:(req,res)=>{
   res.redirect("/admin/adminDash")
 },
 renderadminDash:(req,res)=>{
   res.render("adminView/adminDash",{admin:true})
 },

 AllUsersPage:(req,res)=>{
   adminHelper.getAllUsers().then((users)=>{
      // console.log(users);
      res.render('adminView/allUsers',{admin:true,users})
   })
 },
 userBlock:(req,res)=>{

  console.log(req.body.id);
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+req.body.isBlocked);

  adminHelper.userBlockManager(req.body.id,req.body.isBlocked).then((response)=>{
    console.log(response);
   console.log("block wroked ///////////////////////////////////////////");
   res.redirect('/admin/allUsers')
  })

 },

 stockPage:(req,res)=>{
  res.render("adminView/stocks",{admin:true})
 },
 categories_Page:(req,res)=>{
  adminHelper.getAllCategories().then((categories)=>{
    console.log("found these categories",categories);
    res.render("adminView/categories",{admin:true,categories})
  }).catch((err)=>{
    console.log(err);
  })
 },


 addCategoryManager:(req,res)=>{
  console.log(req.body);

  adminHelper.addcategory(req.body.newCategory).then((response)=>{
    console.log(response);
res.redirect("/admin/categories")
  }).catch((categories)=>{
res.render("adminView/categories",{admin:true,error:"category already exists"})
  }).catch((err)=>{
    console.log("some other error ocuured whiile adding categories");
  })
 },

 deleteCategory:(req,res)=>{
  console.log(req.body); 
  adminHelper.deleteCategories(req.body.id).then((response)=>{
    res.redirect("/admin/categories")
  }).catch((error)=>{
    console.log(error);
  })
 },


 addProductForm:(req,res)=>{
  adminHelper.getAllCategories().then((categories=>{
    res.render("adminView/addProduct",{admin:true,categories})

  })).catch((error)=>{
    console.log(error);
    res.send(error)
  })

 },

addNewProduct:(req,res)=>{
  console.log(req.body);
}

}