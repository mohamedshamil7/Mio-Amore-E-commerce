


var path = require('path');
const { response } = require('../app')
const adminHelper= require('../model/adminHelpers')
const multer = require("multer");
const { functionsOrigin } = require('firebase-tools/lib/api');
const { resolve } = require('path');

const storage=multer.diskStorage({
  destination:function(request,file,cb){
    cb(null,'./public/images/product-images/')
  },
  filename:function(request,file,cb){
    cb(null,Date.now() + '-' + file.originalname)
  }
})

const upload=multer({storage:storage})



module.exports={
 renderadminLogin:(req,res)=>{
    res.render("adminView/adminlogin")
 },

// // storage:multer.diskStorage({
// //   destination:(req,file,cb)=>{
// //     cb(null,"./public/images/product-images")
// //   }

// }),






 adminLoginRoute:(req,res,next)=>{
  
  adminHelper.adminLogin(req.body).then((response)=>{
    req.session.admin=req.body.adminname;

    req.session.loggedIn=true
    next()


    }).catch(()=>{
    res.render('adminView/adminlogin',{error:'invalid Admin Id or Password'})
    })
 },
 adminSession:(req,res,next)=>{
  if(req.session.admin) next()
  else res.render('adminView/adminLogin')
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
  console.log(">>"+req.body.isBlocked);

  adminHelper.userBlockManager(req.body.id,req.body.isBlocked).then((response)=>{
    console.log(response);
   console.log("block wroked ////////////");
   res.redirect('/admin/allUsers')
  })

 },

 stockPage:(req,res)=>{
  adminHelper.getAllStocks().then((stock)=>{
    // console.log(stock);
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
    error = 'Category already exists';
      res.redirect('/admin/categories');

// res.render("adminView/categories",{admin:true,error:"category already exists",categories})
  }).catch((err)=>{
    console.log("some other error ocuured whiile adding categories");
  })
 },

 deleteCategory:(req,res)=>{
  console.log(req.params.id); 
  adminHelper.deleteCategories(req.params.id).then((response)=>{
    res.json({status:true})
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

//  Addimage:(upload.fields([{name:"Image1",maxCount:1}]),function(req,res,next){
//   console.log(req.file);
//   next()
//  }),

addNewProduct:(req,res)=>{

  // res.send("reached")
  console.log(req.files.Image1[0].filename);
  req.body.Image1=req.files.Image1[0].filename
  req.body.Image2=req.files.Image2[0].filename
  req.body.Image3=req.files.Image3[0].filename
  req.body.Image4=req.files.Image4[0].filename
  adminHelper.addNewProduct(req.body).then((response)=>{

    res.redirect("/admin/stocks")
  })
  // var image=req.files.Image
  // console.log(",this is the issue",image);
  // adminHelper.addNewProduct(req.body).then((response)=>{
  //   console.log(response);
  //   req.prod=response
  //   // console.log("this is req.prod,",req.prod);
  //   // next()
    
    
  //   // console.log(req.files);
  //   // image.mv('./public/images/product-images/'+response+'.jpg',(err,done)=>{
  //   //   if(err){
  //   //     console.log(err);
  //   //   }else{
  //   //     res.redirect("/admin/stocks")
  //   //   }
  //   // })
  // }).catch((error)=>{
  //   console.log(error);
  // })
  // console.log(req.body);
  // console.log(req.files.Image);
  
  
}, 




availabilityCheck:(req,res)=>{
  console.log("call came");
  console.log(req.body);
  adminHelper.AvailProduct(req.params.id,req.body.Availability).then((response)=>{
    res.redirect("/admin/stocks")

  }).catch((error)=>{
    console.log(error);
  })
},

// deleteProduct:(req,res)=>{
//   adminHelper.deleteProduct(req.body.id).then((response)=>{
//     console.log(response);
//     res.redirect("/admin/stocks")
//   }).catch((error)=>{
//     console.log(error);
//   })

// },
editProduct:(req,res)=>{

  adminHelper.getEditProduct(req.body.id).then((product)=>{
    console.log(product);
    adminHelper.getAllCategories().then((categories)=>{
      console.log(categories);
      res.render("adminView/editProduct",{admin:true,product,categories})
    })
    
  })
  

  
},
EditProductData:async (req,res)=>{
  console.log(req.files.Image2);
  if(req.files.Image1==null){
    Image1=await adminHelper.fetchImage1(req.body.id)
  }else{
    Image1=req.files.Image1[0].filename
  }

  if(req.files.Image2==null){
    Image2= await adminHelper.fetchImage2(req.body.id)
  }else{
    Image2= req.files.Image2[0].filename
  }
  if(req.files.Image3==null){
    Image3= await adminHelper.fetchImage3(req.body.id)
  }else{
    Image3= req.files.Image3[0].filename
  }

  if(req.files.Image4==null){
    Image4= await adminHelper.fetchImage4(req.body.id)
  }else{
    Image4= req.files.Image4[0].filename
  }

  req.body.Image1= Image1
  req.body.Image2= Image2
  req.body.Image3= Image3
  req.body.Image4= Image4

adminHelper.editProduct(req.body).then((response)=>{
  console.log(response);
 
  res.redirect("/admin/stocks")
})
},

ImageSupplier:(req,res)=>{
  console.log(req.params.Image,"??????/////////////////////");
  console.log("call coming");
  
res.sendFile(path.resolve(`public/images/product-images/${req.params.Image}`))

},

adminLogout:(req,res)=>{
  req.session.admin=null
  req.session.loggedIn=false
  console.log('admin logged Out');
  res.render('adminView/adminLogin')
},





}
