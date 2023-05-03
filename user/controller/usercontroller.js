const jwt = require("jsonwebtoken");
const userHelpers = require("../models/userHelpers/userHelpers");
const { ObjectId } = require("mongodb");
const {check , validationResult} = require('express-validator')

require("dotenv").config();

// const Swal = window.Swal;
// import Swal from 'sweetalert2'

const cc= require("currency-converter-lt")

var paypal= require('paypal-rest-sdk')
const { S3Client, GetObjectCommand  } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");



const PAYPAL_CLIENT_ID=process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET=process.env.PAYPAL_CLIENT_SECRET

paypal.configure({
  "mode" :'sandbox',
  "client_id" :PAYPAL_CLIENT_ID,
  "client_secret":PAYPAL_CLIENT_SECRET
})


const { stringify } = require("querystring");


const bucketname = process.env.BUCKET_NAME

const bucketregion = process.env.BUCKET_REGION

const accesskey = process.env.ACCESS_KEY  

const accessSecret = process.env.ACCES_KEY_SECRET

const MY_SECRET =process.env.MY_SECRET;

const createToken =   (user) => {
  console.log("jwt user",user);
  return jwt.sign({ value: user }, MY_SECRET, { expiresIn: '2d' });
};
const tokenVerify = (request) => {
  console.log("this is that token from cookie",request.cookies.token);
  const decode = jwt.verify(request.cookies.token, MY_SECRET);
  return decode;
};


 const cartProd= async (req)=>{
  
  const decode=  tokenVerify(req)

  return await userHelpers.getcart(decode.value.insertedId).then((obj)=>{
  
    return obj
  }).catch(()=>{
    let cartStatus= "no cart available"
    return cartStatus
  })
};

const CartCount= async (req)=>{
  let decode= tokenVerify(req)
  return await userHelpers.getCartCount(decode.value.insertedId).then((count)=>{
    return count
  }).catch((error)=>{
    return error
  })
}

const TotalAmount= async (req)=>{
  let decode= tokenVerify(req)
 return userHelpers.getTotalAmount(decode.value.insertedId).then((total)=>{
  return total
 })
}

const wallet= async(req)=>{
  let decode = tokenVerify(req)
  return userHelpers.getWallet(decode.value.insertedId).then((wallet)=>{
    return wallet
  }).catch(()=>{
    return 0
  })
}

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





module.exports = {
  nocache: (req, res, next) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    next();
  },

  homeJwtCheck: (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      next();
    } else {
      try {
        const user = jwt.verify(token, MY_SECRET);
        if (user) {
          res.redirect("/home")
        }
      } catch (err) {
        next();
      }
    }
  },

  autherization: (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      res.render("userView/login");
    } else {
      try {
        const user = tokenVerify(req);
        if (user) {
          const decode = tokenVerify(req);

          userHelpers
            .userBlockCheck(decode.value.insertedId)
            .then((response) => {
              next();
            })
            .catch(() => {
              res.clearCookie("token");
              res.render("userView/login", {
                errorMessage: "This account is blocked",
              });
            });
        } else {
          res.render("userView/login");
        }
      } catch {
        res.render("userView/login");
      }
    }
  },

  renderHome: async (req, res) => {
    let decode = tokenVerify(req);
    let walletData = await wallet(req);
    // let total = await TotalAmount(req);
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let datas = null;
    let banner1
    let banner2
    let banner3
    let dbQuery={Availability:true}
    // console.log(cart);
    let banner = await userHelpers.getallBanners()
    async function processImagesd(Data) {
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
            banner3={
              name: Data[i]?.name,
              linkto:Data[i]?.linkTo,
              bannerUrl3:await getImgUrl(Data[i].img),
              isbanner3:true
            }
          }
        }
     
    }
     await processImagesd(banner);
    let count = await CartCount(req);
    await userHelpers
      .getAllProducts(dbQuery)
      .then((prodData) => {
        datas = prodData;
      })
      .catch((err) => {
        console.log(err);
        console.log("didtn get my all Products");
      });
    async function processImages(data) {
      for (let i = 0; i < data.all.length; i++) {
        if (data.all[i].Image1) {
          data.all[i].urlImage1 = await getImgUrl(data.all[i].Image1);
        }
      }
      return data;
    }

    let data = await processImages(datas);
    res.render("userView/home", {
      data,
      user: decode.value.username,
      userpar: true,
      products,
      count,
      outofStock,
      walletTotal: walletData.total,
      banner1,
      banner2,banner3
    });
  },
  redirectHome: (req, res) => {
    res.redirect("/home");
  },

  renderLogin: (req, res, next) => {
    res.render("userView/login");
  },

  renderSignup: (req, res) => {
    res.render("userView/signup");
  },
  userSignupRoute: async (req, res, next) => {
    if (
      !req.body.username ||
      !req.body.email ||
      !req.body.password ||
      !req.body.phone
    ) {
      res.render("userView/signup", { errorMessage: "please enter details" });
    } else {
      let userData = req.body;

      userHelpers
        .doSignup(userData)
        .then(async (response) => {
          let user = response;

          next();

        })
        .catch((user) => {
          console.log(user + "/");

          res.render("userView/signup", {
            errorMessage: " Username or  email already exsits!!!",
          });
        })
        .catch(() => {
          console.log("error ducring Signup");
          console.log(err);
        });
    }
  },
  userLoginroute: (req, res, next) => {
    let userData = req.body;
    userHelpers
      .doLogin(userData)
      .then((response) => {
        console.log(response);
        let user = response;
        const token = createToken(user);
        res.cookie("token", token, {
          httpOnly: true,
        });
        res.status(201);

        res.json({status:true})
      })
      .catch((err) => {
        res.json({status:false, errorMessage: "Incorrect emailId or Password",})
        console.log("error ducring login");
        console.log(err);
      });
  },

  otppage: (req, res) => {
    res.render("userView/otppage");
  },

  userLogout: (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
  },

  productPage: async (req, res) => {
    let decode = tokenVerify(req);
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let count = await CartCount(req);
    let total = await TotalAmount(req);
    let user = decode.value.insertedId;
    let walletData = await wallet(req);
    let prodId = req.params.id;
    let normalCoupens
    let datas = null;
    let wishlist;
    let reviews
    let Variations
    await userHelpers
      .viewProduct(prodId)
      .then((response) => {
        datas = response;
        // console.log(`data:?????????//// ${data.inStock}`);
      })
      .catch((err) => {
        console.log(err);
      });
      await userHelpers.getAllVariations(prodId).then((data)=>{
        Variations = data
      }).catch(()=>{
        console.log("error in fetching variations");
      })

      await userHelpers.getAllReviews(prodId).then((response)=>{
        reviews = response
        let avg=0
        let sum=0
        for(let i=0;i<reviews?.length;i++){
          sum = Number( sum+(reviews[i].rating))
        }
        avg = sum/(reviews.length)
        datas.averageRating = avg
      })
      

    await userHelpers
      .inWishlist(user, prodId)
      .then((response) => {
        wishlist = response;
      })
      .catch(() => {
        wishlist = false;
      });
       await userHelpers.getAllCoupens().then((coupens)=>{
        normalCoupens = coupens.normal
      })

    async function processImages(Data) {
      if (Data.Image1) {
        Data.urlImage1 = await getImgUrl(Data.Image1);
      }
      if (Data.Image2) {
        Data.urlImage2 = await getImgUrl(Data.Image2);
      }
      if (Data.Image3) {
        Data.urlImage3 = await getImgUrl(Data.Image3);
      }
      if (Data.Image4) {
        Data.urlImage4 = await getImgUrl(Data.Image4);
      }

      return Data;
    }
    let data = await processImages(datas);

    res.render("userView/productPage", {
      wishlist,
      data,
      user: decode.value.username,
      userpar: true,
      products,
      outofStock,
      count,
      total,
      walletTotal: walletData.total,
      normalCoupens,
      reviews,
      revCount:reviews?.length,
      Variations
    });
  },

  VariationSelect:async(req,res)=>{
    let decode = tokenVerify(req);
 
    let prodId = req.body.prodId;
    let VarientId = req.body.variationId

    await userHelpers.getVarient(prodId,VarientId)


  },


  imageRoute: (req, res) => {
    let decode = tokenVerify(req);
    let id = req.params.id;

    console.log(id);
  },

  wishlistPage: async (req, res) => {
    let decode = tokenVerify(req);
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let count = await CartCount(req);
    let walletData = await wallet(req);
    let datas;
    await userHelpers
      .wishlistProducts(decode.value.insertedId)
      .then((response) => {
        datas = response;
      });
    async function processImages(Data) {
      for (let i = 0; i < Data?.length; i++) {
        if (Data[i].Product.Image1) {
          Data[i].Product.urlImage1 = await getImgUrl(Data[i].Product.Image1);
        }
      }
      return Data;
    }

    let data = await processImages(datas);

    res.render("userView/wishlist", {
      data,
      user: decode.value.username,
      userpar: true,
      products,
      outofStock,
      count,
      walletTotal: walletData.total,
    });
  },
  addToWishlist: (req, res) => {
    console.log(req.params.id);
    let decode = tokenVerify(req);
    userHelpers
      .addToWishlist(req.params.id, decode.value.insertedId)
      .then((response) => {
        res.redirect(req.get("referer"));
        // res.send("added to wishlist")
        // res.render("userView/productPage",{data,user:decode.value.username,userpar:true})
      })
      .catch((err) => {
        console.log(err);
      });
  },

  findbynumber: (req, res) => {
    global.window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          onSignInSubmit();
        },
      },
      auth
    );
    // recaptchaVerifier.render();
    const appVerifier = window.recaptchaVerifier;
    userHelpers
      .findbynumber(req.body.phone)
      .then((response) => {
        signInWithPhoneNumber(auth, req.body.phone, appVerifier)
          .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            res.render("userView/verifyOtp", { response });
            window.confirmationResult = confirmationResult;
            // ...
          })
          .catch((error) => {
            console.log(error);
            // Error; SMS not sent
            // ...
          });
      })
      .catch((error) => {
        res.render("userView/verifyOtp", { error: "user not found" });
      });
  },

  addToCart: (req, res) => {
    let decode = tokenVerify(req);
    userHelpers
      .addToCart(decode.value.insertedId,  req.body  )
      .then(() => {
        res.json({ status: true });
      })
      .catch((error) => {
        console.log(error);
      });
  },

  getCart: async (req, res) => {
    let decode = tokenVerify(req);
    let total 
    let count = await CartCount(req);
    let walletData = await wallet(req);
    let product;
    let outofStock;
    let normalCoupens
    await userHelpers.getcart(decode.value.insertedId).then((obj) => {
      product = obj.cartItems;
      outofStock = obj.outofStock;
      total = obj.total
    });
    async function processImages(Data) {
      for (let i = 0; i < Data?.length; i++) {
        if (Data[i].cart_product.Image1) {
          Data[i].cart_product.urlImage1 = await getImgUrl(
            Data[i].cart_product.Image1
          );
        }
      }
      return Data;
    }
    let products = await processImages(product);
    await userHelpers.getAllCoupens().then((coupens)=>{
      normalCoupens = coupens.normal
    })
    res.render("userView/cart", {
      products,
      userpar: true,
      user:decode.value.username,
      total,
      outofStock,
      count,
      walletTotal: walletData.total,
      normalCoupens
    });
  },

  removeCart: (req, res) => {
    let decode = tokenVerify(req);
    userHelpers
      .removeCart(decode.value.insertedId, req.body.prodId, req.body.varientId)
      .then((response) => {
        res.json(response);
      })
      .catch(() => {
        console.log("failed to dlete from cart");
      });
  },

  changeProductQuantity: (req, res, next) => {
    userHelpers
      .changeProductQuantity(req.body)
      .then((response) => {
        res.json(response);
      })
      .catch(() => {
        let error = "Stock limit Exceeded";

        res.status(404).json({ error: "Ha Ocurrido un error" });
      });
  },
  checkoutPage: async (req, res) => {
    let decode = tokenVerify(req);
    let cart = await cartProd(req);
    if(!cart.cartItems){
      return res.redirect('/usercart')
    }
    // let products= cart.cartItems
    // let outofStock= cart.outofStock
    let walletData = await wallet(req);
    let count = await CartCount(req);
    let product;
    let outofStock;
    let Address = await userHelpers.getAddress(decode.value.insertedId);
    let total 
    let normalCoupens
    // let inStock= await checkinStock(req)
    await userHelpers.getAllCoupens().then((coupens)=>{
      normalCoupens = coupens.normal
    })

    let user = decode.value.username;
    let userID = new ObjectId(decode.value.insertedId);
    await userHelpers.getcart(decode.value.insertedId).then((obj) => {
      product = obj.cartItems;
      outofStock = obj.outofStock;
      total = obj.total
    });

    let isWallet;
    if (walletData.total >= total) {
      isWallet = true;
    }
    async function processImages(Data) {
      for (let i = 0; i < Data?.length; i++) {
        if (Data[i].cart_product.Image1) {
          // console.log("image 1 :", Data[i].Image1);
          Data[i].cart_product.urlImage1 = await getImgUrl(
            Data[i].cart_product.Image1
          );
        }
      }
      return Data;
    }

    let products = await processImages(product);

    return res.render("userView/checkout", {
      Address,
      products,
      user,
      userID,
      userpar: true,
      cart,
      count,
      total,
      outofStock,
      walletTotal: walletData.total,
      isWallet,
      normalCoupens
    });
  },

  addAddress: (req, res) => {
    
        //  return  Swal.fire({
        //     title: 'Do you want to save the changes?',
        //     showDenyButton: true,
        //     showCancelButton: true,
        //     confirmButtonText: 'Save',
        //     denyButtonText: `Don't save`,
        //   })
          // .then((result) => {
          //   /* Read more about isConfirmed, isDenied below */
          //   if (result.isConfirmed) {
          //     Swal.fire('Saved!', '', 'success')
          //   } else if (result.isDenied) {
          //     Swal.fire('Changes are not saved', '', 'info')
          //   }
          // })

    let decode = tokenVerify(req);
    userHelpers
      .addAddress(decode.value.insertedId, req.body)
      .then((response) => {
        res.json(response);
      });

  },

  shopProducts: async (req, res) => {
    let decode = tokenVerify(req);
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let count = await CartCount(req);
    let total = await TotalAmount(req);
    let walletData = await wallet(req);
    let dataCount = null;
    let categories = null;
    let brands = null
    let AllProducts
    await userHelpers.getAllCategories().then((cat) => {
      categories = cat;
    });

    await userHelpers.getAllBrands().then((brand)=>{
      brands = brand;
    }).catch((err)=>{
      console.log("error");
    })

    let limit = 8
    let dbQuery={Availability:true}
    let pageNo
    let sortOrder={}
    if(req.query.p){
      pageNo = req.query.p - 1 || 0;
    }else{
      pageNo= 0
    }
    if(req.query.category){
      dbQuery.category = req.query.category;
    }
    if(req.query.brand){
      dbQuery.Company = req.query.brand;
    }if(req.query.sort){
      sortOrder = {Price:parseInt(req.query.sort)}
    }

    await userHelpers
      .getAllShopProducts(dbQuery,pageNo,sortOrder,limit)
      .then((datas) => {
        dataCount = datas;
      })
      .catch((err) => {
        console.log(err);
        console.log("didtn get my all Products");
      });

 await userHelpers.getAllProducts(dbQuery).then((data)=>{
  AllProducts = data.all
 })
    let m = AllProducts.length/limit
    let max = Math.ceil(m)
    let page = []
    for (let i =1 ; i<=max;i++){
      page.push(parseInt(i))
    }
    pageNo = parseInt(pageNo+1)

     
    async function processImages(data) {
      for (let i = 0; i < data.all.length; i++) {
        if (data.all[i].Image1) {
          data.all[i].urlImage1 = await getImgUrl(data.all[i].Image1);
        }
      }
      return data;
    }
    let data = await processImages(dataCount);
    res.render("userView/shop", {
      userpar: true,
      data,
      user: decode.value.username,
      products,
      outofStock,
      count,
      total,
      walletTotal: walletData.total,
      categories,
      page,
      pageNo,
      brands
    });
  },



  renderProfilePage: async (req, res) => {
    let decode = await  tokenVerify(req);
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let total = await TotalAmount(req);
    let count = await CartCount(req);
    let walletData = await wallet(req);
    let data;
    let orderDatas;
    let totalOrders = 0
    // console.log(decode.value.insertedId);
    await userHelpers.getUserData(decode.value.insertedId).then((response) => {
      data = response;
    });
    await userHelpers
      .getOrderDetails(decode.value.insertedId)
      .then((response) => {
        orderDatas = response;
      });
      totalOrders = orderDatas.length
    async function processImages(Data) {
      for (let i = 0; i < Data.length; i++) {
        for (let j = 0; j < Data[i].cart.length; j++) {
          if (Data[i].cart[j].cart_product.Image1) {
            Data[i].cart[j].cart_product.urlImage1 = await getImgUrl(
              Data[i].cart[j].cart_product.Image1
            );
          }
        }
      }
      return Data;
    }

    let orderData = await processImages(orderDatas);

    res.render("userView/profile", {
      userpar: true,
      user: decode.value.username,
      products,
      outofStock,
      count,
      total,
      data,
      orderData,
      walletTotal: walletData.total,
      totalOrders
    });
  },

  placeOrder: async (req, res) => {
    let decode = tokenVerify(req);

    let cart = await cartProd(req);

    let products = cart.cartItems;
    let prodIds = [];
    for (let i = 0; i < products.length; i++) {
      prodIds.push(products[i].item);
    }

    let outofStock = cart.outofStock;



    let total = cart.total
    if(req.body?.offerPrice){
      total = Number(req.body.offerPrice)
    }
    

    let PaymentStatus = "false";

    let razorpaycomplete = false;

    let paypalcomplete = false;

    let transactionId = null;

    let payment_method = req.body.PaymentOption;


    let globalorderId = null;


    function getOrderid() {
      return globalorderId;
    }

    try {
      if (req.body.order) {
        if (!req.body.Address) {
          res.status(404).json({ error: "Ha Ocurrido un error" });
          return;
        }else{
          
        
        let user = stringify(req.body.userId);

        let id =new  ObjectId(req.body.userId);


        req.body.id = id;

        let currencyConverter = new cc({
          from: "INR",
          to: "USD",
          amount: total,
        });

        let response = await currencyConverter.convert();


        var usdtotal = Math.round(response);

        req.body.PaymentStatus = PaymentStatus;

        const orderId = await userHelpers.placeOrder(req.body, products, total);
        globalorderId = orderId;
        // await userHelpers.deleteOrder(orderId)

        if (req.body.PaymentOption === "COD") {
          /// true ? false
          PaymentStatus = "pending COD";
          console.log(
            `payment option selected is COD and req.body.status is now${PaymentStatus}`
          );
        } else if (req.body.PaymentOption === "wallet") {
          await userHelpers
            .debitFromWallet(orderId, total, decode.value.insertedId)
            .then((transactionIds) => {
              transactionId = transactionIds;
              PaymentStatus = "true";
            });
        } else if (req.body.PaymentOption === "razorPay") {
          await userHelpers
            .generateRazorPay(orderId, total)
            .then((response) => {
              res.json({ status: "razorpay", response , orderId});
            });
        } else if (req.body.PaymentOption === "paypal") {
          var create_payment_json = {
            id: `${orderId}`,
            intent: "AUTHORIZE",
            payer: {
              payment_method: "paypal",
            },
            redirect_urls: {
              return_url: `https://mioamore.live/placeOrder/${orderId}`,
              cancel_url: `https://mioamore.live/placeOrder?cancel=true&orderId=${orderId}`,
            },
            transactions: [
              {
                amount: {
                  currency: "USD",
                  total: usdtotal,
                },
                description: "This is the payment description.",
              },
            ],
          };
          paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
              throw error;
            } else {
              for (var i = 0; i < payment.links.length; i++) {
                //Redirect user to this endpoint for redirect url
                if (payment.links[i].rel === "approval_url") {
                  res.json({
                    status: "paypal",
                    forwardLink: payment.links[i].href,
                  });
                  break;
                }
              }
            }
          });

        }
      }
      } else if (req.params.data) {
        // let data=  JSON.parse('{"' + decodeURI(req.params.data.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
        // console.log(data);
        payment_method = "paypal";
        paypalcomplete = true;
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        transactionId = paymentId;
        globalorderId = req.params.data
        // console.log(data);

      }else if(req.query.cancel){
        console.log(req.query.orderId);
        await userHelpers.deleteOrder(req.query.orderId).then((resp)=>{
          if(resp){
            res.json({ status: false });

          }
        }).catch(()=>{
        })
      }
       else {
        payment_method = "razorPay";
        await userHelpers
          .verifyPayment(req.body)
          .then(() => {
            globalorderId = req.body.orderId

            PaymentStatus = "true";
            razorpaycomplete = true;
            transactionId = req.body["order[receipt]"];
            // res.json({status:true})
          })
          .catch((err) => {
            PaymentStatus = "false";
            razorpaycomplete = true;
            // res.json({status:'Payment Failed'})
          });
      }
      const orderId = getOrderid();
      if (
        (payment_method === "razorPay" && razorpaycomplete == false) ||
        (payment_method === "paypal" && paypalcomplete == false)
      ) {
        // console.log(`razorypay status completeion === ${razorpaycomplete}`);
        console.log(`waiting for  confirmation...`);
      } else {
        console.log("entered else");
        function destruct(products) {
          let data = [];
          for (let i = 0; i < products.length; i++) {
            let obj = {};
            obj.prodId = products[i].item;
            obj.quantity = products[i].quantity;
            obj.varientId = products[i].varientId
            obj.sizeId = products[i].sizeId
            data.push(obj);
          }
          return data;
        }
        let ids = destruct(products);
        await userHelpers.placeOrderTrans(
            orderId,
            transactionId,
            PaymentStatus,
            payment_method,
            ids,
            decode.value.insertedId
          )
          .then((resp) => {
            //  location.href="http://localhost:8001/user/orderSuccess"
            if (payment_method === "COD" || payment_method=="razorPay" || payment_method==="wallet") {
              res.json({ status: true });
              
            }else if(payment_method ==="paypal"){
              // console.log("codedededeeeee");
              // res.render("userView/orderSuccess");
              
              res.redirect("/orderSuccess");
            }
          })
          .catch((e) => {
            console.log("ende mwonreee error adich");
            console.log(e);
          });
      }
    } catch (e) {
      if(e.err){
        await userHelpers.deleteOrder(e.orderId).then((resp)=>{
          if(resp){
            res.json({ status: false });

          }
        }).catch(()=>{
        })
      }
    }  
     
    

    
  },

  
  verifyPayment: (req, res) => {
    userHelpers
      .verifyPayment(req.body)
      .then(() => {
        console.log("herer");
        console.log(typeof req.body);
        console.log(req.body);
        //sucess pay
        res.json({ status: true });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: "Payment Failed" });
      });
  },

  orderSuccess: async(req, res) => {
    let cart = await cartProd(req);
    let count = await CartCount(req);
    let decode = tokenVerify(req);
    let walletData = await wallet(req);

    console.log("call i shere");

    res.render("userView/orderSuccess",{userpar:true,cart,count,user:decode.value.username, walletTotal: walletData.total,});
  },

  loginWtihOtpPage: (req, res) => {
    res.render("userView/loginWithOtp");
  },
  otpVerification: (req, res) => {
    const data = req.body;
  console.log(data);

    userHelpers
      .checkNumber(data.phoneNumber)
      .then((user) => {
        console.log(user);
        const responseBody = {
          status: true,
          _id:user.insertedId
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(responseBody));
      })
      .catch((error) => {
        const responseBody = {
          status: false,
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(responseBody));
      });
  },
  otpverified: (req, res, next) => {

    userHelpers
      .checkNumber(req.params.num)
      .then((response) => {
        let user = response;
        const token = createToken(user);
        res.cookie("token", token, {
          httpOnly: true,
        });
        res.status(201);

        next();
      })
      .catch((err) => {
        console.log(err);
        res.render("userView/loginWithOtp", { err });
      });
  },

  googleSignupData: (req, res, next) => {
    // console.log(req.userData)
    let data = JSON.parse(
      '{"' +
        decodeURI(
          req.params.userData.replace(/&/g, '","').replace(/=/g, '":"')
        ) +
        '"}'
    );
    userHelpers
      .googleSignup(data)
      .then((user) => {
        const token = createToken(user);
        // console.log( user.isBlocked);
        //             const token =createToken(user);
        res.cookie("token", token, {
          httpOnly: true,
        });

        next();
      })
      .catch(() => {
        alert("try not worked");
      })
      .catch((user) => {
        res.render("userView/signup", {
          errorMessage: "email id already exists in the database",
        });
      });
  },

  googleLoginData: (req, res, next) => {
    let data = JSON.parse(
      '{"' +
        decodeURI(
          req.params.userData.replace(/&/g, '","').replace(/=/g, '":"')
        ) +
        '"}'
    );
    userHelpers
      .googleLogin(data)
      .then((Data) => {
        let user = Data;
        const token = createToken(user);
        res.cookie("token", token, {
          httpOnly: true,
        });
        console.log(token);
        next();
      })
      .catch((err) => {
        res.render("userView/login", {
          errorMessage: "Some error Occured",
        });
        console.log("error ducring login");
        console.log(err);
      });
  },
  cancelOrderSubmit: (req, res) => {
    userHelpers.cancelOrderSubmit(req.body.orderId).then((response) => {
      res.json(response);
    });
  },

  returnOrderSubmit: (req, res) => {
    userHelpers.returnOrderSubmit(req.body.orderId).then((response) => {
      res.json(response);
    });
  },

  getWalletPage: async (req, res) => {
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let count = await CartCount(req);
    let total = await TotalAmount(req);

    let decode = tokenVerify(req);
    let full = null
    let allData;
    let walletTotal;
    let credits;
    let debits;
    // const
    await userHelpers.getWallet(decode.value.insertedId).then((data) => {
      full = data;
      walletTotal = full?.total;
      allData = [...full?.transactions?.credits, ...full?.transactions?.debits];
  
      credits = [...full?.transactions?.credits];
  
      debits = [...full?.transactions?.debits];
  
      console.log(credits);
  
      res.render("userView/wallet", {
        userpar: true,
        user: decode.value.username,
        products,
        outofStock,
        count,
        total,
        allData,
        credits,
        debits,
        walletTotal,
      });
    }).catch(()=>{
      res.render("userView/wallet", {
        userpar: true,
        user: decode.value.username,
        products,
        outofStock,
        count,
        total,
      });
    })


  },

  sortShop: async (req, res) => {
    let decode = tokenVerify(req);
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let count = await CartCount(req);
    let total = await TotalAmount(req);
    let walletData = await wallet(req);
    let dataCount;
    let categories;
    await userHelpers.getAllCategories().then((cat) => {
      categories = cat;
    });

    await userHelpers
      .getSortedData(req.body.opt)
      .then((data) => {
        dataCount = data;
      })
      .catch(() => {
        console.log(`error occured during sorting`);
      });
    async function processImages(data) {
      for (let i = 0; i < data.all.length; i++) {
        if (data.all[i].Image1) {
          data.all[i].urlImage1 = await getImgUrl(data.all[i].Image1);
        }
      }
      return data;
    }
    let data = await processImages(dataCount);

    res.render("userView/shop", {
      userpar: true,
      data,
      user: decode.value.username,
      products,
      outofStock,
      count,
      total,
      walletTotal: walletData.total,
      categories,
    });

    //  res.render("userView/shop",{userpar:true,data,user:decode.value.username,products,outofStock,count,total,walletTotal:walletData.total})
  },

  renderShop: async (req, res) => {
    let decode = tokenVerify(req);
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let count = await CartCount(req);
    let total = await TotalAmount(req);
    let walletData = await wallet(req);
    let dataCount;
    let categories;

    await userHelpers.getAllCategories().then((cat) => {
      categories = cat;
    });

    // if(!req.session.isCategory && !req.session.isData){
    //   console.log("entered no ");
    //   res.redirect("/user/shop")
    // }

    if (req.session.isData) {
      dataCount = req.session.data;
      req.session.isData = false;
    }
    req.session.data = {};

    if (req.session.isCategory) {
      dataCount = req.session.categoryData;
      req.session.isCategory = false;
    }
    async function processImages(data) {
      for (let i = 0; i < data.all.length; i++) {
        if (data.all[i].Image1) {
          data.all[i].urlImage1 = await getImgUrl(data.all[i].Image1);
        }
      }
      return data;
    }
    let data = await processImages(dataCount);
    req.session = {};

    res.render("userView/shop", {
      userpar: true,
      data,
      user: decode.value.username,
      products,
      outofStock,
      count,
      total,
      walletTotal: walletData.total,
      categories,
    });
  },
  filterCategory: async (req, res) => {
    let decode = tokenVerify(req);
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let count = await CartCount(req);
    let total = await TotalAmount(req);
    let walletData = await wallet(req);
    let dataCount;
    let categories;

    await userHelpers.getAllCategories().then((cat) => {
      categories = cat;
    });
    await userHelpers.getfilteredCategory(req.body.name).then((data) => {
      dataCount = data;
    });
    async function processImages(data) {
      for (let i = 0; i < data.all.length; i++) {
        if (data.all[i].Image1) {
          data.all[i].urlImage1 = await getImgUrl(data.all[i].Image1);
        }
      }
      return data;
    }
    let data = await processImages(dataCount);

    res.render("userView/shop", {
      userpar: true,
      data,
      user: decode.value.username,
      count,
      walletTotal: walletData.total,
      products,
      outofStock,
      total,
      categories,
    });
  },

  checkCoupen: async (req, res) => {
    let decode = await tokenVerify(req)
    let cart = await cartProd(req)
    let Total = cart.total
    let offerPrice=0;
    let newTotal=0;
    console.log(req.body.code);
    let coupenData;
    await userHelpers
      .findCoupen(req.body.code,decode.value.insertedId)
      .then((resp) => {
        coupenData = resp;
        console.log(coupenData);
    if (coupenData) {
      if (coupenData.type === "normal") {
        if (coupenData.startDate <= new Date()) {
          if (coupenData.endDate >= new Date()) {
            if(coupenData.totalCoupen !==0){
              if (coupenData.redeemType === "percentage") {
                offerPrice = parseInt(
                  Math.floor((Total * coupenData.percentage) / 100)
                  );
                  console.log(offerPrice);
                  if (Total >= coupenData.minLimit) {
                  if (offerPrice <= coupenData.maxLimit) {
                    newTotal = Total - offerPrice;
                  } else {
                    newTotal = Total - coupenData.maxLimit;
                  }
                  } else {
                    let d = coupenData.minLimit - offerPrice;
                    console.log(d);
                    return res.status(404).send(`Please add ₹${d} worth items more `);
                  }
                } else if(coupenData.redeemType ==="amount") {
                  console.log("entred here ta amount");
                  newTotal = parseInt(Math.floor(Total - coupenData.amount));
                  // console.log(offerPrice);
                }
            }else{
              return res.status(404).send("Coupen unavailable");
            }
            
          } else {
            return res.status(404).send("Coupon has expired");
          }
        } else {
          return res.status(404).send("Coupen Not available..Please try later");
        }
      } 
    } if(newTotal){
      console.log(coupenData);
      console.log(Total, "new total");
      res.json({ newTotal ,coupenId:coupenData._id });

    }
      }) .catch((err) => {
        return res.status(404).send(err.err);
      });

    
  },

  delAddress:(req,res)=>{
    let decode = tokenVerify(req)
    userHelpers.delAddress(req.body.id,decode.value.insertedId).then(()=>{
      res.json({status:true})
    })
  },

  
  search:async(req,res)=>{

    let payload=req.body.e.trim()

    await userHelpers.searchProduct(payload).then(async(data)=>{
      console.log(data,"///;///;.")

      async function processImages(Data) {
        for (let i = 0; i < Data.length; i++) {
  
            if (Data[i].Image1) {
    
              Data[i].urlImage1 = await getImgUrl(
                Data[i].Image1
              );
            }
            // console.log("image 1 :", Data.cart[i].Image1);
            // console.log("Data[i].urlImage1:", Data.cart[i].urlImage1);
          
        }
        return Data;
      }

      let datas =await  processImages(data)

        res.json(datas)
    })




    // userHelpers.searchProduct(req.body.data).then((products)=>{
    //   res.json(products)
    // }).catch(()=>{
    //   console.log("product not found");
    //   res.json(false)
    // })
  },




  viewOrderDetails:async(req,res)=>{
    let decode = await tokenVerify(req)
    let count = await  CartCount(req)
    let  walletData = await wallet(req)

  let data 
   await userHelpers.getsingleorderDetails(req.params.id).then((dat)=>{
    data = dat
  })
    

  async function processImages(Data) {
    for (let i = 0; i < Data.cart.length; i++) {
        if(Data.deliveredDate){
          Data.cart[i].deliveredDate = Data.deliveredDate
        }
        if (Data.cart[i].cart_product.Image1) {

          Data.cart[i].cart_product.urlImage1 = await getImgUrl(
            Data.cart[i].cart_product.Image1
          );
        }
        // console.log("image 1 :", Data.cart[i].Image1);
        // console.log("Data[i].urlImage1:", Data.cart[i].urlImage1);
      
    }
    return Data;
  }

  let orderData = await processImages(data);
  res.render('userView/viewOrderDetails',{userpar:true,orderData,    user: decode.value.username,  count,    walletTotal: walletData.total, })
  },

  renderReviewPage:async(req,res)=>{
    let decode = await tokenVerify(req)
    let count = await  CartCount(req)
    let  walletData = await wallet(req)
    let dat
    await userHelpers.checkReview(decode.value.insertedId, req.params.id).then(async()=>{

      await userHelpers.viewProduct(req.params.id).then((data)=>{
        dat= data
      })
      async function processImages(Data) {
        if (Data.Image1) {
          Data.urlImage1 = await getImgUrl(Data.Image1);
          // console.log("Data[i].urlImage1:", Data.urlImage1);
        }
        
  
        // console.log("Data:", Data);
        return Data;
      }
      let data = await processImages(dat);
      res.render("userView/review",{userpar:true,data ,user: decode.value.username,  count,    walletTotal: walletData.total,  })

    }).catch(()=>{

      res.redirect(req.get("referer"));
    })
   
  },


  addReview:async(req,res)=>{
      let decode = tokenVerify(req)
      let data
      await userHelpers.addReview(decode.value.insertedId, req.body.prodId ,req.body.star, req.body.rev).then((response)=>{
        res.json({status:true})
      }).catch(()=>{
        res.json(false)
      })


  },
  check_quantity:async(req,res)=>{
    let decode = await tokenVerify(req)
    userHelpers.check_quantity(decode.value.insertedId , req.body).then((response)=>{
      res.json({status:true})
    }).catch((response)=>{
      res.json({status:false})
    })
  },




  


  ///////checkings////

  regexCheck:(req,res,next)=>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitize = /[\$#!%^&*()+={}\|:;<>\/?`~\\]/g;
    let ok 

      if(req.body){
        if(req.body.email){
          if(emailRegex.test(req.body.email)){
            ok=true
            console.log("email ok");
          }else {
            console.log("syntax error");
            let error = 'invalid syntax '
            res.status(404).json({ error: error });
            return
          }
        }if (req.body.password ){
          console.log(req.body.password);
          if(sanitize.test(req.body.password)){
            console.log("invalid syntax ");
            let error = 'invalid syntax '
            res.status(404).json({ error: error });
            return
          }else{
            ok = true
          }
        }if(req.body.username){
          if(sanitize.test(req.body.username)){
            console.log("invalid syntax ");
            let error = 'invalid syntax '
            res.status(404).json({ error: error });
            return
          }else{
            ok = true
          }

        }if(req.body.phone){
          if(sanitize.test(req.body.phone)){
            console.log("invalid syntax ");
            let error = 'invalid syntax '
            res.status(404).json({ error: error });
            return
          }else{
            ok = true
          }
        }
        
        next()
      }
  },

  loginVal:[
    check('email').isEmail().withMessage('Email is not valid'),
    check('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long')
    .customSanitizer((value) => {
      return value.trim().replace(/[$%^!#(){}]/g, '');
    }),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
],


shopVal:[
      check('p').optional().customSanitizer((value) => {
        return value.replace(/[$%^!#(){}]/g, '');
      }),
      check('category').optional().customSanitizer((value) => {
        return value.replace(/[$%^!#(){}]/g, '');
      }),
      check('brand').optional().customSanitizer((value) => {
        return value.replace(/[$%^!#(){}]/g, '');
      }),
],

signupVal:[
  check('username').notEmpty().withMessage("ServerError :enter Fullname").customSanitizer((value) => {
    return value.replace(/[$%^!#(){}]/g, '');
  }),
  check('email').notEmpty().isEmail().withMessage('Email is not valid'),
  check('phone').notEmpty().withMessage("ServerError :enter Phone").isNumeric().withMessage("Server Error enter only number").customSanitizer((value) => {
    return value.replace(/[$%^!#(){}]/g, '');
  }),
  check('password').notEmpty().withMessage("ServerError :enter Password").blacklist('[$%^!#()]{},').withMessage("password should not contain [$%^!#()]{} "),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('userview/signup',{errorMessage:errors[0].msg});
    }
    next();
  },
],


idcheck:[
  check('id').customSanitizer((value) => {
  return value.replace(/[$%^!#(){}]/g, '')})
],

  deleteOrder:async(req,res)=>{
    // let decode = await tokenVerify(req)
    userHelpers.deleteOrder(req.body.orderId).then((response)=>{
      res.json({status:true})
    }).catch((error)=>{
      console.log("error occcured during deleting order");
    })
  },

  resetPassword:(payload)=>{

    let ids = payload._id.trim()
    console.log(ids);
    console.log(typeof ids);
    console.log("enterd");
    console.log(payload.newPassword);
    return new Promise(async(resolve,reject)=>{
        payload.newPassword = await bcrypt.hash(payload.newPassword, 10);
        console.log("???><>><><>?<><<");
        console.log(payload.newPassword);
        // console.log(userId);
        let result = await db.get().collection(collection.USER_COLLECTION).updateOne({_id:new ObjectId(ids)},{
            $set:{password:payload.newPassword}
        })
            console.log(result);
            if(result.modifiedCount){
                console.log("ewsolve");
                resolve(true)
            }else{
                console.log("reject");
                reject()
            }

    })
},
resetPassword_submit:(req,res)=>{
  let data={
    _id:req.body._id,
    newPassword:req.body.password
  }
  // req.body._id.test('[0-9a-fA-F]{24}')
  
  userHelpers.resetPassword(data).then((response)=>{
    res.redirect('/home')
  }).catch(()=>{
    console.log("error occured>>>>>>>>>>>>>>>>");
  })
},
forgotPage:(req,res)=>{
  res.render('userView/forgot')
},
resetPasswordPage:(req,res)=>{
  res.render('userView/resetPassword',{_id:req.query.id})
},





};






