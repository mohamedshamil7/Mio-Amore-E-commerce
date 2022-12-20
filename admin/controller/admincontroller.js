var path = require('path');
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
  adminHelper.getAllStocks().then((stock)=>{
    console.log(stock);
    res.render("adminView/stocks",{admin:true,stock})
  })
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
  var image=req.files.Image
  console.log(image);
  adminHelper.addNewProduct(req.body).then((response)=>{
    console.log(response);
    console.log(req.files);
    image.mv('./public/images/product-images/'+response+'.jpg',(err,done)=>{
      if(err){
        console.log(err);
      }else{
        res.redirect("/admin/stocks")
      }
    })
  })
  // console.log(req.body);
  // console.log(req.files.Image);
},

deleteProduct:(req,res)=>{
  adminHelper.deleteProduct(req.body.id).then((response)=>{
    console.log(response);
    res.redirect("/admin/stocks")
  }).catch((error)=>{
    console.log(error);
  })

},
editProduct:(req,res)=>{

  adminHelper.getEditProduct(req.body.id).then((product)=>{
    console.log(product);
    adminHelper.getAllCategories().then((categories)=>{
      console.log(categories);
      res.render("adminView/editProduct",{admin:true,product,categories})
    })
    
  })
  

  
},
EditProductData:(req,res)=>{
  console.log("enettererere");
  let id= req.body.id
adminHelper.editProduct(req.body).then((response)=>{
  console.log(response);
 if(req.files.Image){
  var image=req.files.Image
  image.mv('./public/images/product-images/'+id+'.jpg' )
 }
  res.redirect("/admin/stocks")
})
},

ImageSupplier:(req,res)=>{
  console.log(req.params.id);
  console.log("call coming");
  
res.sendFile(path.resolve(`public/images/product-images/${req.params.id}.jpg`))

}
}