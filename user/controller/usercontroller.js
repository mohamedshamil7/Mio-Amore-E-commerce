const jwt = require("jsonwebtoken");
const userHelpers = require("../models/userHelpers/userHelpers");
const { ObjectId } = require("mongodb");


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
  
    // console.log("new cart:>>>",cart);
    return obj
  }).catch(()=>{
    let cartStatus= "no cart available"
    return cartStatus
  })
};

const CartCount= async (req)=>{
  let decode= tokenVerify(req)
  return await userHelpers.getCartCount(decode.value.insertedId).then((count)=>{
    console.log("count,,,,,,",count);
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
    console.log(token);
    if (!token) {
      next();
    } else {
      try {
        const user = jwt.verify(token, MY_SECRET);
        console.log("userrrrr<<<<<<<<<<<<<<<<<<<>>>>>>>" + user);
        if (user) {
          res.render("userView/home");
          // res.redirect("/user/home")
        }
      } catch (err) {
        next();
      }
    }
  },

  autherization: (req, res, next) => {
    console.log("entered auth");

    const token = req.cookies.token;
    console.log(token);
    if (!token) {
      res.render("userView/login");
    } else {
      try {
        const user = tokenVerify(req);
        // console.log(user);
        if (user) {
          const decode = tokenVerify(req);
          console.log(decode, "+++++decode is here >>>>>>>>>>>>>>>>>>>>>>>");
          console.log(decode.value.insertedId);

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
    console.log("got in here");
    let decode = tokenVerify(req);
    console.log(decode);
    let walletData = await wallet(req);
    console.log(walletData.total, "//////////");
    // let total = await TotalAmount(req);
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let datas = null;
    let banner1
    let banner2
    let banner3
    // console.log(cart);
    let banner = await userHelpers.getallBanners()
    async function processImagesd(Data) {
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
     await processImagesd(banner);
    console.log("banners ", banner3);
    let count = await CartCount(req);
    await userHelpers
      .getAllProducts()
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
          // console.log(";;;;;fjf");
          // console.log("image 1 :", data[i].Image1);
          data.all[i].urlImage1 = await getImgUrl(data.all[i].Image1);
          // console.log("Data[i].urlImage1:", data.all[i].urlImage1);
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
      // total,
      outofStock,
      walletTotal: walletData.total,
      banner1,
      banner2,banner3
    });
  },
  redirectHome: (req, res) => {
    console.log("entereddd");
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
      res.render("userView/signup", { error: "please enter details" });
    } else {
      console.log(req.body);
      let userData = req.body;

      userHelpers
        .doSignup(userData)
        .then(async (response) => {
          let user = response;

          next();
          // console.log( user.isBlocked);
          //             const token =createToken(user);
          // console.log(token);

          //               res.cookie("tokehn",token)
          //             res.status(201);
          //             console.log(token);
          //             next();
        })
        .catch((user) => {
          console.log(user + "/");

          res.render("userView/signup", {
            error: " Username or  email already exsits!!!",
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
    console.log(";.;.",userData);
    console.log("?????????");
    userHelpers
      .doLogin(userData)
      .then((response) => {
        console.log(response);
        let user = response;
        const token = createToken(user);
        console.log(token);
        res.cookie("token", token, {
          httpOnly: true,
        });
        res.status(201);
        console.log(token);

        next();
      })
      .catch((err) => {
        res.render("userView/login", {
          errorMessage: "Incorrect emailId or Password",
        });
        console.log("error ducring login");
        console.log(err);
      });
  },

  otppage: (req, res) => {
    res.render("userView/otppage");
  },

  userLogout: (req, res) => {
    res.clearCookie("token");
    res.redirect("/user/login");
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
    console.log(req.params.id);
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
        console.log(sum,"//");
        console.log(avg,"lll");
        datas.averageRating = avg
      })
      console.log("datasss after avg",datas);
      

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
      console.log(Data);
      if (Data.Image1) {
        Data.urlImage1 = await getImgUrl(Data.Image1);
        // console.log("Data[i].urlImage1:", Data.urlImage1);
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

      console.log("Data:", Data);
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
    let cart = await cartProd(req);
    let products = cart.cartItems;
    let outofStock = cart.outofStock;
    let count = await CartCount(req);
    let total = await TotalAmount(req);
    let user = decode.value.insertedId;
    let walletData = await wallet(req);
    let prodId = req.body.prodId;
    let VarientId = req.body.variationId
    let normalCoupens
    let datas = null;
    let wishlist;
    let reviews
    let Variations

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
    console.log("dataaas", datas);
    async function processImages(Data) {
      for (let i = 0; i < Data?.length; i++) {
        if (Data[i].Product.Image1) {
          console.log("image 1 :", Data[i].Product.Image1);
          Data[i].Product.urlImage1 = await getImgUrl(Data[i].Product.Image1);
          // console.log("Data[i].urlImage1:", Data[i].urlImage1);
        }
      }
      console.log("Data:", Data);
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
        console.log(response);
        res.redirect(req.get("referer"));
        // res.send("added to wishlist")
        // res.render("userView/productPage",{data,user:decode.value.username,userpar:true})
      })
      .catch((err) => {
        console.log(err);
      });
  },

  findbynumber: (req, res) => {
    console.log(req.body);
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
        console.log(response);
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
    console.log("api called");
    console.log(req.body.prodId);
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
    console.log(total);
    let product;
    let outofStock;
    let normalCoupens
    await userHelpers.getcart(decode.value.insertedId).then((obj) => {
      console.log(obj.outofStock);
      product = obj.cartItems;
      outofStock = obj.outofStock;
      total = obj.total
    });
    // console.log(products);
    async function processImages(Data) {
      for (let i = 0; i < Data?.length; i++) {
        if (Data[i].cart_product.Image1) {
          console.log("image 1 :", Data[i].cart_product.Image1);
          Data[i].cart_product.urlImage1 = await getImgUrl(
            Data[i].cart_product.Image1
          );
          // console.log("Data[i].urlImage1:", Data[i].urlImage1);
        }
      }
      console.log("Data:", Data);
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
    console.log(req.body.prodId, "this is te iddddd");
    userHelpers
      .removeCart(decode.value.insertedId, req.body.prodId, req.body.varientId)
      .then((response) => {
        console.log("this is the response", response);
        // res.redirect(req.get("referer"));
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
        console.log("here");
        let error = "Stock limit Exceeded";

        res.status(404).json({ error: "Ha Ocurrido un error" });
      });
  },
  checkoutPage: async (req, res) => {
    let decode = tokenVerify(req);
    let cart = await cartProd(req);
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
    let userID = ObjectId(decode.value.insertedId);
    console.log("uer if", userID);
    console.log("@#############@@@@@@@###", user);
    console.log("???????", Address, ">>>>>");
    await userHelpers.getcart(decode.value.insertedId).then((obj) => {
      product = obj.cartItems;
      outofStock = obj.outofStock;
      total = obj.total
    });

    let isWallet;
    if (walletData.total >= total) {
      console.log("/////is");
      isWallet = true;
    }
    async function processImages(Data) {
      for (let i = 0; i < Data?.length; i++) {
        if (Data[i].cart_product.Image1) {
          // console.log("image 1 :", Data[i].Image1);
          Data[i].cart_product.urlImage1 = await getImgUrl(
            Data[i].cart_product.Image1
          );
          // console.log("Data[i].urlImage1:", Data[i].urlImage1);
        }
      }
      console.log("Data:", Data);
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
    console.log("calhh  here");
    
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
    console.log(req.body);
    userHelpers
      .addAddress(decode.value.insertedId, req.body)
      .then((response) => {
        console.log(response);
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
    await userHelpers.getAllCategories().then((cat) => {
      categories = cat;
    });
    await userHelpers
      .getAllProducts()
      .then((datas) => {
        dataCount = datas;
      })
      .catch((err) => {
        console.log(err);
        console.log("didtn get my all Products");
      });
    console.log(dataCount);
    async function processImages(data) {
      for (let i = 0; i < data.all.length; i++) {
        if (data.all[i].Image1) {
          // console.log(";;;;;fjf");
          // console.log("image 1 :", data[i].Image1);
          data.all[i].urlImage1 = await getImgUrl(data.all[i].Image1);
          // console.log("Data[i].urlImage1:", data.all[i].urlImage1);
        }
      }
      console.log("Data:", data);
      return data;
    }
    console.log(dataCount);
    let data = await processImages(dataCount);
    console.log("came data:::::>>>>", data);
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
      console.log("/////?", response);
      data = response;
    });
    await userHelpers
      .getOrderDetails(decode.value.insertedId)
      .then((response) => {
        // console.log(response);
        orderDatas = response;
      });
      totalOrders = orderDatas.length
    console.log("orderDatas", orderDatas[0]?.cart);
    async function processImages(Data) {
      for (let i = 0; i < Data.length; i++) {
        for (let j = 0; j < Data[i].cart.length; j++) {
          if (Data[i].cart[j].cart_product.Image1) {
            Data[i].cart[j].cart_product.urlImage1 = await getImgUrl(
              Data[i].cart[j].cart_product.Image1
            );
          }
          // console.log("image 1 :", Data[i].Image1);
          // console.log("Data[i].urlImage1:", Data[i].urlImage1);
        }
      }
      console.log("Data:", Data);
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
    console.log(">>>>>>>>>>>>>>>>>>>", prodIds);

    let outofStock = cart.outofStock;



    let total = cart.total
    if(req.body?.offerPrice){
      total = Number(req.body.offerPrice)
    }
    

    console.log(req.body, "msa");
    let PaymentStatus = "false";

    let razorpaycomplete = false;

    let paypalcomplete = false;

    let transactionId = null;

    let payment_method = req.body.PaymentOption;

    console.log(`payment_method is ${payment_method}`);

    let globalorderId = null;

    function getOrderid() {
      return globalorderId;
    }

    try {
      if (req.body.order) {
        if (!req.body.Address) {
          res.status(404).json({ error: "Ha Ocurrido un error" });
          return;
        }
        let user = stringify(req.body.userId);

        let id = ObjectId(req.body.userId);

        console.log(id);

        req.body.id = id;

        let currencyConverter = new cc({
          from: "INR",
          to: "USD",
          amount: total,
        });

        let response = await currencyConverter.convert();

        console.log("response", response);

        var usdtotal = Math.round(response);

        req.body.PaymentStatus = PaymentStatus;
        console.log(req.body.PaymentOption);

        const orderId = await userHelpers.placeOrder(req.body, products, total);
        globalorderId = orderId;

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
              console.log(`${transactionId} is the transaction id wallet`);
              PaymentStatus = "true";
            });
          console.log(
            `payment option selected is wallet and req.body.status is now`
          );
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
              return_url: `http://localhost:8001/user/placeOrder/${orderId}`,
              // "return_url": "http://localhost:8001/user/o",
              cancel_url: "http://cancel.url",
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
              console.log(error.response);
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

          console.log(`payment option selected is paypal`);
        }
      } else if (req.params.data) {
        // let data=  JSON.parse('{"' + decodeURI(req.params.data.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
        // console.log(data);
        payment_method = "paypal";
        paypalcomplete = true;
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        transactionId = paymentId;
        console.log(`payrer id  :${payerId}`);
        console.log(`payrermet  id  :${paymentId}`);
        console.log(`data is coming${req.params.data}`);
        globalorderId = req.params.data
        // console.log(data);
      } else {
        payment_method = "razorPay";
        console.log(`payment meth here i s sinsncsdijcdc${payment_method}`);
        console.log(req.body);
        await userHelpers
          .verifyPayment(req.body)
          .then(() => {
            globalorderId = req.body.orderId

            PaymentStatus = "true";
            razorpaycomplete = true;
            transactionId = req.body["order[receipt]"];
            console.log(
              `order recuewso for razorpay is ${req.body["order[receipt]"]}`
            );
            // res.json({status:true})
          })
          .catch((err) => {
            PaymentStatus = "false";
            razorpaycomplete = true;
            console.log(err);
            // res.json({status:'Payment Failed'})
          });
      }
    } catch (e) {
      console.log(e, "this is theerroro ");
    } finally {
      const orderId = getOrderid();
      console.log(orderId,"orderId");
      // console.log(`${transactionId} is the transaction id wallet`);
      console.log(`payment_method is ${payment_method} 333`);
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
        console.log("ids klasm;dfkmalskfdmas;", typeof ids[0].prodId);
        await userHelpers.placeOrderTrans(
            orderId,
            transactionId,
            PaymentStatus,
            payment_method,
            ids,
            decode.value.insertedId
          )
          .then((resp) => {
            console.log("then reps  hgvytfrwrartvbkhbytdythbujhb");
            console.log(resp);
            //  location.href="http://localhost:8001/user/orderSuccess"
            if (payment_method === "COD" || payment_method=="razorPay" || payment_method==="wallet") {
              res.json({ status: true });
              
            }else if(payment_method ==="paypal"){
              // console.log("codedededeeeee");
              // res.render("userView/orderSuccess");
              
              res.redirect("/user/orderSuccess");
            }
          })
          .catch((e) => {
            console.log("ende mwonreee error adich");
            console.log(e);
          });
      }
    }

    
  },

  
  verifyPayment: (req, res) => {
    console.log(req.body);
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
    console.log(req.body.number);
    userHelpers
      .checkNumber(req.body.number)
      .then((user) => {
        res.json({ status: "found" });
      })
      .catch((error) => {
        res.json({ status: error });
      });
  },
  otpverified: (req, res, next) => {
    console.log(
      "?///////////////////..................>>>>>>>>>>>>>>>....,,,,,,,,,,,,,,,,,<<<<<<<<<<<<<"
    );
    console.log(req.params.num, "khjhkkhkkuuuu8889988989898998998");
    userHelpers
      .checkNumber(req.params.num)
      .then((response) => {
        console.log(response);
        let user = response;
        const token = createToken(user);
        res.cookie("token", token, {
          httpOnly: true,
        });
        res.status(201);
        console.log("tpoek n", token);

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
    console.log(data);
    userHelpers
      .googleSignup(data)
      .then((user) => {
        const token = createToken(user);
        // console.log( user.isBlocked);
        //             const token =createToken(user);
        res.cookie("token", token, {
          httpOnly: true,
        });
        console.log(token);

        next();
      })
      .catch(() => {
        alert("try not worked");
      })
      .catch((user) => {
        console.log("eroorroorro");
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
    console.log(data);
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

    console.log(req.body);
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
      console.log("Data:", data);
      return data;
    }
    console.log(dataCount, "sjjsjsj");
    let data = await processImages(dataCount);
    console.log("came data::>", data);

    console.log("it is hre right?");
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
    console.log("reacehed render Shop");
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
    console.log(req.session);

    // if(!req.session.isCategory && !req.session.isData){
    //   console.log("entered no ");
    //   res.redirect("/user/shop")
    // }

    if (req.session.isData) {
      console.log("enterd data");
      dataCount = req.session.data;
      req.session.isData = false;
    }
    console.log(dataCount, "llll");
    req.session.data = {};

    if (req.session.isCategory) {
      console.log("entererds acater");
      dataCount = req.session.categoryData;
      req.session.isCategory = false;
    }
    console.log("now dat is ", dataCount);
    async function processImages(data) {
      for (let i = 0; i < data.all.length; i++) {
        if (data.all[i].Image1) {
          data.all[i].urlImage1 = await getImgUrl(data.all[i].Image1);
        }
      }
      console.log("Data:", data);
      return data;
    }
    console.log(dataCount, "sjjsjsj");
    let data = await processImages(dataCount);
    console.log("came data::>", data);
    req.session = {};
    console.log(req.session);
    console.log("it is hre right?");
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
      console.log("Data:", data);
      return data;
    }
    console.log(dataCount, "sjjsjsj");
    let data = await processImages(dataCount);
    console.log("came data::>", data);

    console.log("it is hre right?");
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
    let offerPrice;
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
                    Total = Total - offerPrice;
                  } else {
                    Total = Total - coupenData.maxLimit;
                  }
                  } else {
                    let d = coupenData.minLimit - offerPrice;
                    console.log(d);
                    return res.status(404).send(`Please add ₹${d} worth items more `);
                  }
                } else if(coupenData.redeemType ==="amount") {
                  console.log("entred here ta amount");
                  Total = parseInt(Math.floor(Total - coupenData.amount));
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
      } else if (coupenData) {
      }
    } if(Total){
      console.log(Total, "new total");
      res.json({ Total });

    }
      }) .catch((err) => {
        return res.status(404).send(err.err);
      });

    
  },

  delAddress:(req,res)=>{
    let decode = tokenVerify(req)
    console.log(req.body.id);
    userHelpers.delAddress(req.body.id,decode.value.insertedId).then(()=>{
      res.json({status:true})
    })
  },
  search:(req,res)=>{
    userHelpers.searchProduct(req.body.data).then((products)=>{
      res.json(products)
    }).catch(()=>{
      console.log("product not found");
      res.json(false)
    })
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
    console.log("Data:", Data);
    return Data;
  }

  let orderData = await processImages(data);
  res.render('userView/viewOrderDetails',{userpar:true,orderData,    user: decode.value.username,  count,    walletTotal: walletData.total, })
  },

  renderReviewPage:async(req,res)=>{
    let decode = await tokenVerify(req)
    let count = await  CartCount(req)
    let  walletData = await wallet(req)
    console.log(req.params.id)
    let dat
    await userHelpers.checkReview(decode.value.insertedId, req.params.id).then(async()=>{
      console.log("new review by user");

      await userHelpers.viewProduct(req.params.id).then((data)=>{
        dat= data
      })
      async function processImages(Data) {
        console.log(Data);
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
      console.log("//..mmnnbbvv,,,,", req.body.prodId);
      await userHelpers.addReview(decode.value.insertedId, req.body.prodId ,req.body.star, req.body.rev).then((response)=>{
        res.json({status:true})
      }).catch(()=>{
        res.json(false)
      })


  },
  check_quantity:async(req,res)=>{
    console.log("....fkmslfnaoidncsddcnofinoindmckldnalnmc");
    console.log(req.body);
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
          if(emailRegex.test(req.body.email) && sanitize.test(req.body.email)){
            ok=true
          }else {

          }
        }
      }
  }





};






