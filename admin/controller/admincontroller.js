var path = require("path");
const adminHelper = require("../model/adminHelpers");
const voucher_codes = require('voucher-code-generator');
const { resolve } = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { S3Client, PutObjectCommand,GetObjectCommand, DeleteObjectCommand  } = require("@aws-sdk/client-s3");
const crypto = require("crypto")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { log } = require("console");
// const PDFDocument = require('pdfkit');
// const easyinvoice = require('easyinvoice');
// const pdfjsLib = require('pdfjs-dist');
// const fs = require('fs');



const MY_SECRET = process.env.MY_SECRET;

const bucketname = process.env.BUCKET_NAME

const bucketregion = process.env.BUCKET_REGION

const accesskey = process.env.ACCESS_KEY  

const accessSecret = process.env.ACCES_KEY_SECRET


const createToken = (admin) => {
  console.log("jwt user", admin);
  // return jwt.sign({ value: admin }, MY_SECRET, { expiresIn: "30m" });
  return jwt.sign({ value: admin }, MY_SECRET, { expiresIn: "30m" });
};

const tokenVerify = (request) => {
  console.log("this is that token from cookie", request.cookies.admintoken);
  const decode = jwt.verify(request.cookies.admintoken, MY_SECRET);
  return decode;
};





const randomImgName = (bytes = 32)=>crypto.randomBytes(bytes).toString('hex')


const s3= new S3Client({
  // region: `${bucketregion}`,
  region:'ap-south-1',
  endpoint: 'https://s3.ap-south-1.amazonaws.com',
  // endpoint: `s3.${bucketregion}.amazonaws.com`,
  credentials:{
    accessKeyId: accesskey,
    secretAccessKey:accessSecret,
    
  },
})


const getImgUrl= async(imgName)=>{
  const getObjectParams={
    Bucket:bucketname,
    Key:imgName
  }
  
  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  // console.log(url);
  return url
  
}


let salesStatus = false;

module.exports = {
  nocache: (req, res, next) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    next();
  },

  renderadminLogin: (req, res) => {
    res.render("adminView/adminlogin");
  },

  salesReport: async (req, res) => {
    console.log("entered >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ");
    let salesTitle = null;
    console.log(req.body, "///.......>>>");
    let reports = null;

    if (req.body.data === "daily") {

      salesTitle = "Today", 
      reports = await adminHelper.getDailyOrder();

    } else if (req.body.data == "weekly") {
      salesTitle = "Weekly",
       salesStatus = true;
      reports = await adminHelper.getWeeklyorder();
    } else if (req.body.data === "monthly") {
      salesTitle = "Monthly", 
      salesStatus = true;
      reports = await adminHelper.getMonthlyorder();

    } 
    // else if (req.body.data === "yearly") {
    //   (salesTitle = "Yearly"), (this.salesStatus = true);
    //   reports = await adminHelper.getyearlyorder();
    //   report = report.length;
    // }
    console.log(salesTitle);
    console.log(reports.length);

    res.render("adminView/adminDash", { admin: true, reports:reports.length, salesTitle });
  },

  adminLoginRoute: (req, res, next) => {
    adminHelper
      .adminLogin(req.body)
      .then((response) => {
        // req.session.admin=req.body.adminname;
        let admin = response;
        console.log(admin);
        const token = createToken(admin);
        console.log("here");
        res.cookie("admintoken", token, {
          httpOnly: true,
        });
        res.status(201);
        console.log(token);
        // req.session.loggedIn=true
        console.log("calling next");
        next();
      })
      .catch(() => {
        res.render("adminView/adminlogin", {
          error: "invalid Admin Id or Password",
        });
      });
  },

  autherization: (req, res, next) => {
    console.log("entered auth");

    const token = req.cookies.admintoken;
    console.log(token);
    if (!token) {
      res.render("adminView/adminlogin");
    } else {
      try {
        const user = tokenVerify(req);
        // console.log(user);
        if (user) {
          const decode = tokenVerify(req);
          console.log(decode, "+++++decode is here >>>>>>>>>>>>>>>>>>>>>>>");
          console.log(decode.value.insertedId);
          console.log("next going to work");
          next();
        } else {
          res.render("adminView/adminlogin");
        }
      } catch {
        res.render("adminView/adminlogin");
      }
    }
  },

  redirectAdminDash: (req, res) => {
    res.redirect("/admin/adminDash");
  },
  renderadminDash: async (req, res) => {
    let salesToday = await adminHelper.getDailyOrder()
    let salesweek = await adminHelper.getWeeklyorder()
    let salesMonth = await adminHelper.getMonthlyorder()
    let saleYear = await adminHelper.getyearlyorder()
    let dailyRevenue = await adminHelper.getDailyRevenue()
    let weeklyRevenue = await adminHelper.getWeeklyRevenue()
    let monthlyRevenue = await adminHelper.getMonthlyRevenue()
    let yearlyRevenue = await adminHelper.getYearlyRevenue()
    let totalUserCount = await adminHelper.getAllUsers()
    let chartcount = await adminHelper.getchartCount()
    let OrdersCount = await adminHelper.getOrdersCount()
console.log(chartcount);
    console.log(`today:${dailyRevenue}`);
    console.log(`week:${weeklyRevenue}`);
    console.log(`,monty:${monthlyRevenue}`);
    console.log(`uyear:${yearlyRevenue}`);

      res.render("adminView/adminDash", { admin: true, salesToday:salesToday.length,salesweek:salesweek.length ,salesMonth:salesMonth.length, saleYear:saleYear.length , dailyRevenue,weeklyRevenue,monthlyRevenue,yearlyRevenue,totalUserCount:totalUserCount.length,chartcount, OrdersCount});
  },

  AllUsersPage: (req, res) => {
    adminHelper.getAllUsers().then((users) => {
      // console.log(users);
      res.render("adminView/allUsers", { admin: true, users });
    });
  },
  userBlock: (req, res) => {
    console.log(req.body.id);
    console.log(">>" + req.body.isBlocked);

    adminHelper
      .userBlockManager(req.body.id, req.body.isBlocked)
      .then((response) => {
        console.log(response);
        console.log("block wroked ////////////");
        res.redirect("/admin/allUsers");
      });
  },

  stockPage: async (req, res) => {
    let Data = null;
    await adminHelper.getAllStocks().then((stock) => {
      Data = stock;
    });
    async function processImages(Data) {
      for (let i = 0; i < Data.length; i++) {
        if (Data[i].Image1) {
          console.log("image 1 :", Data[i].Image1);
          Data[i].urlImage1 = await getImgUrl(Data[i].Image1);
          console.log("Data[i].urlImage1:", Data[i].urlImage1);
        }

      }
      console.log("Data:", Data);
      return Data;
    }

    let Details = await processImages(Data);
    console.log("k:", Details);
    res.render("adminView/stocks", { admin: true, Details });

    // console.log(Data);
    // async function urlImg(Data){
    //   for(let i = 0;i<Data.length)
    //   console.log("data",Data);
    //    return Data
    // }

    // let k = await urlImg(Data)
    // console.log("kkkkkkkkk2k22kk2",k);
    // console.log("<<<<<",imgurl);
    // console.log(Data);

    // async function imgurl (Data){
    //   for(let i=0;i<Data.length;i++){
    //     if(Data[i].Image1){
    //        Data[i].imgUrl1 = await  getImgUrl(Data[i].Image1)
    //       // let s= await getImgUrl(Data[i].Image1)
    //       console.log("this is s////",  Data[i].imgUrl1);
    //     }
    //   }
    //   return Data
    // }

    // let k = imgurl(Data)
    // console.log( k  );
    // console.log(Data[0].imgUrl1);
    // res.render("adminView/stocks", { admin: true, stock });
  },
  brandsPage:(req,res)=>{
    adminHelper.getAllBrands().then((brands)=>{

      res.render("adminView/brands",{admin:true,brands})
    })
  },
  addBrand:(req,res)=>{
    adminHelper.addBrand(req.body.brand).then((resp)=>{
      res.json(resp)
    }).catch((errors)=>{
     let  error = "Category already exists";
        res.status(404).json({ error: error });
    })
  },
  deleteBrand:(req,res)=>{
    console.log(":::::::",req.params.id);
    adminHelper.deleteBrand(req.params.id).then((resp)=>{
      res.json({status: true})
    }).catch((error)=>{
      console.log(error);
    })
  },
  categories_Page: (req, res) => {
    adminHelper
      .getAllCategories()
      .then((categories) => {
        console.log("found these categories", categories);
        res.render("adminView/categories", { admin: true, categories });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  addCategoryManager: (req, res) => {
    console.log(req.body, ";;;;;;;;;;;;;;");

    adminHelper
      .addcategory(req.body.category)
      .then((response) => {
        console.log(response);
        res.json(response);
      })
      .catch((categories) => {
        error = "Category already exists";
        res.status(404).json({ error: error });
        // res.render('adminView/categories',{error});

        // res.render("adminView/categories",{admin:true,error:"category already exists",categories})
      })
      .catch((err) => {
        console.log("some other error ocuured whiile adding categories");
      });
  },

  deleteCategory: (req, res) => {
    console.log(req.params.id);
    adminHelper
      .deleteCategories(req.params.id)
      .then((response) => {
        res.json({ status: true });
      })
      .catch((error) => {
        console.log(error);
      });
  },

  addProductForm:async (req, res) => {
    let categories = null
    let brands= null
    await adminHelper.getAllCategories().then((categoriess) => {
      categories= categoriess
      console.log(categories);
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
    await adminHelper.getAllBrands().then((brandss)=>{

      brands= brandss
      console.log(brands);
    }).catch(()=>{
      console.log("error in fetching alll Brands");
    })
    res.render("adminView/addProduct", { admin: true,categories,brands});
  },

  addNewProduct: async (req, res) => {
    const files = req.files;

    let arr1 = Object.values(files);

    let arr2 = arr1.flat();

    console.log("arr2:", arr2);

    let data = [];

    const urls = await Promise.all(

      arr2.map(async (files) => {

        const { fieldname } = files;
        let imageName = randomImgName();
        data.push({ fieldname, img: imageName });

        const { buffer } = files;
        const { originalname } = files;
        // console.log(filename);
        const { mimetype } = files;

        const params = {
          Bucket: bucketname,
          Key: imageName,
          Body: buffer,
          ContentType: mimetype,
        };
        try {
          const command = new PutObjectCommand(params);
          const result = await s3.send(command);
          console.log(result);
          return result;
        } catch (e) {
          console.log("eror");
          console.log(e);
        }
      })
    );
    console.log(data);

    data.map((value) => {
      if (value.fieldname === "Image1" ) {
        req.body.Image1 = value?.img
      } else if (value.fieldname === "Image2") {
        req.body.Image2 = value.img
      } else if (value.fieldname === "Image3") {
        req.body.Image3 = value.img;
      } else if (value.fieldname === "Image4") {
        req.body.Image4 = value.img;
      }
    });

    let mrp = parseInt(req.body.MRP)
    let sellingprice = parseInt (req.body.Price)
    req.body.offer = parseInt(((mrp-sellingprice)/mrp)*100)

    adminHelper.addNewProduct(req.body).then((response) => {
      res.redirect("/admin/stocks");
    });
  },

  availabilityCheck: (req, res) => {
    console.log("call came");
    console.log(req.body);
    adminHelper
      .AvailProduct(req.params.id, req.body.Availability)
      .then((response) => {
        res.redirect("/admin/stocks");
      })
      .catch((error) => {
        console.log(error);
      });
  },

  editProduct: async (req, res) => {
    let Data = null;
    let categories = null;

    await adminHelper.getEditProduct(req.body.id).then((products) => {
      console.log(products);
      Data = products;
    });
   await  adminHelper.getAllCategories().then((categoriess) => {
      categories = categoriess;
      // console.log(categories);
    });
    console.log(   "...",Data);
    async function processImages(Data) {
      console.log(Data);
      if (Data.Image1) {
        Data.isImage1= true
        Data.urlImage1 = await getImgUrl(Data.Image1);
      }
      if (Data.Image2) {
        Data.isImage2= true
        Data.urlImage2 = await getImgUrl(Data.Image2);
      }
      if (Data.Image3) {
        Data.isImage3= true
        Data.urlImage3 = await getImgUrl(Data.Image3);
      }
      if (Data.Image4) {
        Data.isImage4= true
        Data.urlImage4 = await getImgUrl(Data.Image4);
      }

      console.log("Data:", Data);
      return Data;
    }
    let product = await processImages(Data);

    res.render("adminView/editProduct", {
      admin: true,
      product,
      categories,
    });
  },


  EditProductData: async (req, res) => {
    console.log("body",req.body);
    console.log("req",req.files);

    const files = req.files;

    let arr1 = Object.values(files);
    let arr2 = arr1.flat();
    console.log("arr2:", arr2);
    let name 
    let data = [];

    const urls = await Promise.all(
      arr2.map(async (files) => {
        const { fieldname } = files;
        if(fieldname === "Image1"){
          name = randomImgName();
        }else if(fieldname === "Image2"){
          name = randomImgName();
        }else if(fieldname === "Image3"){
          name = randomImgName();
        }else if(fieldname === "Image4"){
          name = randomImgName();
        }
        // let imageName = randomImgName();
        data.push({ fieldname, img: name });

        const { buffer } = files;
        const { mimetype } = files;

        const params = {
          Bucket: bucketname,
          Key: name,
          Body: buffer,
          ContentType: mimetype,
        };
        try {
          const command = new PutObjectCommand(params);
          const result = await s3.send(command);
          console.log(result);
          return result;
        } catch (e) {
          console.log("eror");
          console.log(e);
        }
      })
    );
    console.log("::::::",data);
if(data.length!==0){
  console.log("entereed");
  data.map((value) => {
    if (value.fieldname === "Image1" && value.img!=null) {
      req.body.Image1 = value?.img;
      req.body.Image2 = req.body?.imagename2;
      req.body.Image3 = req.body?.imagename3;
      req.body.Image4 = req.body?.imagename4;
    } else if (value.fieldname === "Image2"  && value.img!=null) {
      req.body.Image2 = value?.img;
      req.body.Image1 = req.body?.imagename1;
      req.body.Image3 = req.body?.imagename3;
      req.body.Image4 = req.body?.imagename4;
    } else if (value.fieldname === "Image3"  && value.img!=null) {
      req.body.Image1 = req.body?.imagename1;
      req.body.Image2 = req.body?.imagename2
      req.body.Image3 = value?.img;
      req.body.Image4 = req.body?.imagename4;
      
      req.body.Image4 = req.body.imagename4
    } else if (value.fieldname === "Image4 "  && value.img!=null) {
      req.body.Image1 = req.body?.imagename1;
      req.body.Image2 = req.body?.imagename2
      req.body.Image3 = req.body?.imagename3
      req.body.Image4 = value?.img;

    }
  });
}else{
  console.log("hrteer");
  req.body.Image1 = req.body.imagename1
  req.body.Image2 = req.body.imagename2
  req.body.Image3 = req.body.imagename3
  req.body.Image4 = req.body.imagename4
}
   let mrp = req.body.MRP
   let sellingprice = req.body.Price
  //  req.body.offer = parseInt(((mrp-sellingprice)/mrp)/100)
   req.body.offer = parseInt(((mrp-sellingprice)/mrp)*100)
    adminHelper.editProduct(req.body).then((response) => {
      console.log(response);

      res.redirect("/admin/stocks");
    });
  },

  deleteImage:async(req,res)=>{
    console.log("lll");
    console.log(req.body);
    let image = req.body.image
    if(image==''){
      return res.status(404).send("no Image");
    }
    let prodId = req.body.id
    let no= req.body.no
    const params = {
      Bucket: bucketname,
      Key: image,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command)
    let del = await adminHelper.deleteImage(image,prodId,no).then(()=>{
      res.json({status:true})

    }).catch(()=>{
      console.log("err");
    })
  },

  ImageSupplier: (req, res) => {
    console.log(req.params.Image, "??????/////////////////////");
    console.log("call coming");

    res.sendFile(
      path.resolve(`public/images/product-images/${req.params.Image}`)
    );
  },

  allorders: (req, res) => {
    adminHelper.getAllorders().then((orders) => {
      console.log(orders);
      res.render("adminView/orders", { admin: true, orders, dataTable:true });
    });
  },

  adminLogout: (req, res) => {
    res.clearCookie("admintoken");
    res.redirect("/admin/");
  },

  cancelOrderAdmin: (req, res) => {
    adminHelper.cancelOrderAdminSubmit(req.body.orderId).then((response) => {
      // res.redirect('/admin/allorders');
      res.json(response);
    });
  },

  viewOrderProduct: (req, res) => {
    // let Orderid
    adminHelper
      .viewSingleOrder(req.params.id)
      .then((products) => {
        // products.cart.Orderid=
        let cart = products.cart;
        cart.Orderid = products._id.toString();
        console.log(cart);

        let address = products.deleviryDetails.town;
        Orderid = products._id.toString();
        res.render("adminView/viewOrderProduct", { admin: true, products , dataTable:true });
      })
      .catch(() => {
        let e = "No orders";
        res.render("adminView/viewOrderProduct", { admin: true, e });
      });
  },

  deliveryStatus: (req, res) => {
    console.log(req.body);
    adminHelper
      .deliveryStatusChange(req.body.id, req.body.status)
      .then(() => {
        res.json({status:true})
      })
      .catch(() => {
        console.log("error in updating deliveryStatus");
      });
  },

  getAddCoupenPage:async(req,res)=>{
    res.render('adminView/addCoupen',{admin:true})
  },

  addCoupenSubmit:async(req,res)=>{
    console.log(req.body);

    await adminHelper.createCoupen(req.body).then(()=>{
      res.redirect('/admin/coupen')
    })

  },
  codeGenerator:(req,res)=>{
    const code = voucher_codes.generate({
      length: 8,
      count: 1,
      charset:  voucher_codes.charset("alphanumeric")
    });
    res.json(code[0]);
  },


  getCoupenpage:async(req,res)=>{
    let coupens 
    await adminHelper.getAllCoupen().then((coupen)=>{
      coupens =coupen
    })
    coupens.normalCoupens.forEach(element => {
        if(element.redeemType ==="amount"){
          element.isAmount = true
        }
    });
    console.log(coupens,"///");
    res.render('adminView/coupen',{admin: true, coupens})
  },
  deletecoupon:(req,res)=>{
    adminHelper.deleteCoupen(req.body.id).then(()=>{
      res.json({ status: true });
    })
  },

  bannerPage:async(req,res)=>{
    let products 
    // let banners
    let data
    let banner1 
    let banner2
    let banner3
    await adminHelper.getAllStocks().then((prod)=>{
      products = prod
    })
    await adminHelper.getBanners().then((datas)=>{
      data = datas
    })
    console.log("thisi sdata",data);
    async function processImages(Data) {
      console.log(Data,"ethida");
      for(let i=0;i<Data.length;i++){
        if (Data[i].name==='banner1') {
          banner1={
            name: Data[i]?.name,
            linkto:Data[i]?.linkTo,
            bannerUrl1:await getImgUrl(Data[i].img),
            isbanner1:true
          }
        }
        if (Data[i].name==='banner2') {
          banner2={
            name: Data[i]?.name,
            linkto:Data[i]?.linkTo,
            bannerUrl2:await getImgUrl(Data[i].img),
            isbanner2:true
          }
        }
        if (Data[i].name==='banner3') {
          console.log("banner 3 is here");
          banner3={
            name: Data[i]?.name,
            linkto:Data[i]?.linkTo,
            bannerUrl3:await getImgUrl(Data[i].img),
            isbanner3:true
          }
        }

  
      }
        console.log("Data:", Data);
        // return Data;
     
    }
   await processImages(data);

    // console.log(products);
    res.render('adminView/banner',{admin:true,products,banner1,banner2,banner3})
  },

  banner1Add:async(req,res)=>{
    console.log(req.body);

    console.log("filese:", req.file);
    const {fieldname} = req.file
let imageName = randomImgName();
const { buffer } = req.file;
const { mimetype } = req.file;
const params = {
  Bucket: bucketname,
  Key: imageName,
  Body: buffer,
  ContentType: mimetype,
};
try {
  const command = new PutObjectCommand(params);
  const result = await s3.send(command);
  // console.log(result);
  // return result;
} catch (e) {
  console.log("eror");
  // console.log(e);
}
console.log("lllaalla");
req.body.banner= fieldname
req.body.img= imageName
await adminHelper.updateBanner1(req.body).then(()=>{
  res.redirect('/admin/banners')
})


  },
  banner2Add:async(req,res)=>{
    console.log(req.body);

    console.log("filese:", req.file);
    const {fieldname} = req.file
let imageName = randomImgName();
const { buffer } = req.file;
const { mimetype } = req.file;
const params = {
  Bucket: bucketname,
  Key: imageName,
  Body: buffer,
  ContentType: mimetype,
};
try {
  const command = new PutObjectCommand(params);
  const result = await s3.send(command);
  // console.log(result);
  // return result;
} catch (e) {
  console.log("eror");
  // console.log(e);
}
console.log("lllaalla");
req.body.banner= fieldname
req.body.img= imageName
await adminHelper.updateBanner2(req.body).then(()=>{
  res.redirect('/admin/banners')
})


  },
  banner3Add:async(req,res)=>{
    console.log(req.body);

    console.log("filese:", req.file);
    const {fieldname} = req.file
let imageName = randomImgName();
const { buffer } = req.file;
const { mimetype } = req.file;
const params = {
  Bucket: bucketname,
  Key: imageName,
  Body: buffer,
  ContentType: mimetype,
};
try {
  const command = new PutObjectCommand(params);
  const result = await s3.send(command);
  // console.log(result);
  // return result;
} catch (e) {
  console.log("eror");
  // console.log(e);
}
console.log("lllaalla");
req.body.banner= fieldname
req.body.img= imageName
await adminHelper.updateBanner3(req.body).then(()=>{
  res.redirect('/admin/banners')
})

  },
  
  delBanner:async(req,res)=>{
      let del = await  adminHelper.delBanner(req.body.banner)
      if(del){
        res.json({status:true})
      }
  },
  confrimReturn:async(req,res)=>{
    console.log("this is the req.params",req.params.id);
    let confirm = await adminHelper.confirmReturn(req.params.id).then(()=>{

      res.redirect(req.get("referer"));
    }).catch(()=>{
      console.log("error in confirm return");
    })
  },


    
  scheduleOrder:(req,res)=>{
    console.log("?>>>>>>>>>.",req.params.id);
    adminHelper
      .viewSingleOrder(req.params.id)
      .then((products) => {
        // products.cart.Orderid=
        let cart = products.cart;
        cart.Orderid = products._id.toString();
        console.log(cart);

        let address = products.deleviryDetails.town;
        Orderid = products._id.toString();
        res.render('adminView/scheduleOrder',{admin:true,cart,address,products})
      })
      .catch(() => {
        let e = "No orders";
      });
    },

    deliveryDateSubmit:(req,res)=>{
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>x");
      console.log(req.body);
      if(new Date(req.body.deliveryDate) <= new Date()){
        return res.json({err:"deliveryDate should be greater than todays Date"})
      }else{
        adminHelper.deliveryDateSubmit(req.body).then((response)=>{

          res.json({status:true})
        })
      }
    },
    confirmDelivery:(req,res)=>{
      console.log(req.params.id);
      adminHelper.confirmDelivery(req.params.id).then((response)=>{
        res.redirect(req.get("referer"));
      }).catch(()=>{
        console.error("error in confirm delivery");
      })
    },

    invoice:async(req,res)=>{
      let orderDetails
      await adminHelper.viewSingleOrder(req.params.id).then((details)=>{
        orderDetails = details
      })

      console.log(orderDetails.cart);
      res.render("adminView/invoice",{admin:true, orderDetails, date:new Date().toLocaleString()})

},
renderbillLabel:async(req,res)=>{
  let orderDetails
      await adminHelper.viewSingleOrder(req.params.id).then((details)=>{
        orderDetails = details
      })
      console.log(orderDetails);
  res.render('adminView/shippinglabel',{ orderDetails, date:new Date().toLocaleString()})
},

renderSalesReport:async(req,res)=>{
  let sales
  await adminHelper.getAllSales().then((response)=>{
    sales = response
  })

  
  res.render("adminView/salesReport",{admin:true, sales})
},
salesFilter:(req,res)=>{
  adminHelper.filterSale(req.body.startDate,req.body.endDate).then((sales)=>{
    res.render("adminView/salesReport",{admin:true, sales})
  })
},



addVariations:(req,res)=>{
  console.log("///????????????>>>>>>>>>>>>>>>>>");
  adminHelper.getEditProduct(req.body.id).then((product)=>{
    
    
    // let Variations = [...product.Variations]
    adminHelper.getAllVariations(req.body.id).then((Variations)=>{
      console.log("....",Variations);
       res.render('adminView/VariationsPage',{product,Variations})
      }).catch(()=>{
        
        res.render('adminView/VariationsPage',{product})
    })

    })
},
addVarient_submit:(req,res)=>{
  console.log("//",req.body)

  adminHelper.AddVariation(req.body).then((data)=>{
    res.json(data)
  })
}



}
