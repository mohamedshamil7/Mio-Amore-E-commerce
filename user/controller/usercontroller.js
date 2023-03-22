require("dotenv").config();
const userHelpers = require("../models/userHelpers/userHelpers");
const jwt = require("jsonwebtoken");
const { read } = require("fs");
const { send } = require("process");
const { ObjectId } = require("mongodb");
const Swal = require('sweetalert2')

// const Swal = window.Swal;
// import Swal from 'sweetalert2'

const cc= require("currency-converter-lt")

var paypal= require('paypal-rest-sdk')
const { S3Client, PutObjectCommand,GetObjectCommand  } = require("@aws-sdk/client-s3");
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
  return jwt.sign({ value: user }, MY_SECRET, { expiresIn: "30m" });
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
  nocache:(req, res, next) =>{
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
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
    let walletData= await wallet(req)
    console.log(walletData.total,"//////////");
    let total= await TotalAmount(req)
    let cart =await cartProd(req)
      let products= cart.cartItems
    let outofStock= cart.outofStock
    let datas = null
    // console.log(cart);

    let count= await CartCount(req)
    console.log(cart," this was cart>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    // console.log(cart[0].cart_product,"anser for my question ^^^^^^^^^^^^^^^^^^^^^^^^");
     await userHelpers.getAllProducts().then((prodData) => {
       datas = prodData
      }).catch((err) => {
        console.log(err);
        console.log("didtn get my all Products");
      });

        // console.log("the then data is :", datas.all);

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
        let data = await processImages(datas);
        console.log("came data:::::>>>>",data);

        res.render("userView/home", {
          data,
          user: decode.value.username,
          userpar: true,
          products,
           count,
           total,
           outofStock,
           walletTotal: walletData.total
        });
     
      
  },
  redirectHome: (req, res) => {
    console.log("entereddd");
    res.redirect("/user/home");
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

        userHelpers.doSignup(userData).then(async(response) => {
            let user = response;

          
          next()
            // console.log( user.isBlocked);
//             const token =createToken(user);
// console.log(token);
      
//               res.cookie("tokehn",token)
//             res.status(201);
//             console.log(token);
//             next();
          }).catch((user) => {
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
    console.log("?????????");
        userHelpers .doLogin(userData).then((response) => {
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
          }).catch((err) => {
            res.render("userView/login", {
              errorMessage: "Incorrect emailId or Password",
            });
            console.log("error ducring login");
            console.log(err);
          })


    


   
     
  },

  otppage:((req,res)=> {
    res.render("userView/otppage")
  }),

  



  userLogout: (req, res) => {
    res.clearCookie("token");
    res.redirect("/user/login");
  },

  productPage: async(req, res) => {
    let decode = tokenVerify(req);
    let cart =await cartProd(req)
    let products= cart.cartItems
    let outofStock= cart.outofStock
    let count= await CartCount(req)
    let total= await TotalAmount(req)
    let user= decode.value.insertedId
    let walletData= await wallet(req)
    console.log(req.params.id);
    let prodId = req.params.id;

let datas = null
let wishlist
    await userHelpers.viewProduct(prodId).then((response) => {
      datas= response;
        console.log(`data:?????????//// ${data.inStock}`);
      })
      .catch((err) => {
        console.log(err);
      });
       await  userHelpers.inWishlist(user,prodId).then((response)=>{
        wishlist=response
      }).catch(()=>{
        wishlist=false
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
            walletTotal:walletData.total
          });

  },
  imageRoute: (req, res) => {
    let decode = tokenVerify(req);
    let id = req.params.id;
    
    console.log(id);
  },

  wishlistPage:async (req, res) => {
    let decode = tokenVerify(req);
    let cart =await cartProd(req)
    let products= cart.cartItems
    let outofStock= cart.outofStock
    let count= await CartCount(req)
    let walletData= await wallet(req)
    let datas
   await  userHelpers.wishlistProducts(decode.value.insertedId).then((response) => {
      datas = response;
    });
    console.log("dataaas",datas);
    async function processImages(Data) {
      for (let i = 0; i < Data.length; i++) {
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
        walletTotal:walletData.total
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


  findbynumber:(req,res)=>{
    console.log(req.body);
    global.window.recaptchaVerifier= new RecaptchaVerifier('recaptcha-container',
     {size: "invisible",
     'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        onSignInSubmit();
      }
    }, auth);
        // recaptchaVerifier.render();
    const appVerifier = window.recaptchaVerifier;
    userHelpers.findbynumber(req.body.phone).then((response)=>{
        console.log(response);
        signInWithPhoneNumber(auth, req.body.phone, appVerifier)
    .then((confirmationResult) => {
      // SMS sent. Prompt user to type the code from the message, then sign the
      // user in with confirmationResult.confirm(code).
      res.render("userView/verifyOtp",{response})
      window.confirmationResult = confirmationResult;
      // ...
    }).catch((error) => {
        console.log(error);
      // Error; SMS not sent
      // ...
    });



    }).catch((error)=>{
        res.render('userView/verifyOtp',{error:"user not found"})
    })
  },

  addToCart:(req,res)=>{
    console.log("api called");
    console.log(req.params.id);
    let decode = tokenVerify(req);
    userHelpers
    .addToCart( decode.value.insertedId,req.params.id).then(()=>{
      res.json({status:true})
    }).catch((error)=>{
      console.log(error);
    })

  },
  
  getCart:async (req,res)=>{
    let decode= tokenVerify(req)
    let total= await TotalAmount(req)
    let count= await CartCount(req)
    let walletData= await wallet(req)
    console.log(total);
    let product
    let outofStock 
    await userHelpers.getcart(decode.value.insertedId).then((obj)=>{
      console.log(obj.outofStock);
     product = obj.cartItems
      outofStock= obj.outofStock
    })
    // console.log(products);
    async function processImages(Data) {
      for (let i = 0; i < Data?.length; i++) {
        if (Data[i].cart_product.Image1) {
          console.log("image 1 :", Data[i].cart_product.Image1);
          Data[i].cart_product.urlImage1 = await getImgUrl(Data[i].cart_product.Image1);
          // console.log("Data[i].urlImage1:", Data[i].urlImage1);
        }

      }
      console.log("Data:", Data);
      return Data;
    }
    let products = await processImages(product);

       res.render("userView/cart",{products,userpar:true,total,outofStock,count,walletTotal:walletData.total})
  
  },
 
  removeCart:(req,res)=>{
    let decode= tokenVerify(req)
    console.log(req.body.prodId,"this is te iddddd");
    userHelpers.removeCart(decode.value.insertedId,req.body.prodId).then((response)=>{
      console.log("this is the response",response);
      // res.redirect(req.get("referer")); 
      res.json(response)
    }).catch((error)=>{
      console.log("failed to dlete from cart");
    })
  },

  changeProductQuantity:(req,res,next)=>{
    userHelpers.changeProductQuantity(req.body).then((response)=>{
      res.json(response)
    }).catch(()=>{
      console.log("here");
      let error = "Stock limit Exceeded"

    res.status(404).json({error: 'Ha Ocurrido un error'});
    })
  },
  checkoutPage:async(req,res)=>{
    let decode = tokenVerify(req);
    let cart =await cartProd(req)
    // let products= cart.cartItems
    // let outofStock= cart.outofStock
    let walletData= await wallet(req)
    let count= await CartCount(req)
    let total= await TotalAmount(req)
    let product
    let outofStock
    let Address= await userHelpers.getAddress(decode .value.insertedId)
    // let inStock= await checkinStock(req)
    let isWallet
    if(walletData.total >= total){
      console.log("/////is");
       isWallet = true
    }

    let user=decode.value.username
    let userID = ObjectId(decode.value.insertedId) 
    console.log( "uer if", userID);
    console.log("@#############@@@@@@@###",user);
    console.log("???????",Address,">>>>>");
   await  userHelpers.getcart(decode.value.insertedId).then((obj)=>{
      product = obj.cartItems
    outofStock= obj.outofStock
  })
  async function processImages(Data) {
    for (let i = 0; i < Data?.length; i++) {
      if (Data[i].cart_product.Image1) {
        // console.log("image 1 :", Data[i].Image1);
        Data[i].cart_product.urlImage1 = await getImgUrl(Data[i].cart_product.Image1);
        // console.log("Data[i].urlImage1:", Data[i].urlImage1);
      }

    }
    console.log("Data:", Data);
    return Data;
  }

  let products = await processImages(product);

  return res.render("userView/checkout",{Address,products,user,userID,userpar:true,cart,count,total,outofStock,walletTotal:walletData.total,isWallet})
  },
  


  addAddress:(req,res)=>{
    console.log("calhh  here");
    if(!req.body.fname ||
      !req.body.mobile ||
      !req.body.pin ||
      !req.body.houseNo ||
      !req.body.landMark ||
      !req.body.useradd ||
      !req.body.town){
        // res.render("userView/checkout", { error: "please enter details" });
    //    return  Swal.fire({
    //       title: 'Do you want to save the changes?',
    //       showDenyButton: true,
    //       showCancelButton: true,
    //       confirmButtonText: 'Save',
    //       denyButtonText: `Don't save`,
    //     })
    //     // .then((result) => {
    //     //   /* Read more about isConfirmed, isDenied below */
    //     //   if (result.isConfirmed) {
    //     //     Swal.fire('Saved!', '', 'success')
    //     //   } else if (result.isDenied) {
    //     //     Swal.fire('Changes are not saved', '', 'info')
    //     //   }
    //     // })

      }

    let decode = tokenVerify(req);
    console.log(req.body);
    userHelpers.addAddress(decode.value.insertedId,req.body).then((response)=>{
      console.log(response);
      res.redirect(req.get("referer"));

    })
  },

  shopProducts:async(req,res)=>{
    let decode = tokenVerify(req);
    let cart =await cartProd(req)
    let products= cart.cartItems
    let outofStock= cart.outofStock
    let count= await CartCount(req)
    let total= await TotalAmount(req)
    let walletData= await wallet(req)
    userHelpers.getAllProducts().then((data) => {
      
      console.log("the then data is :", data);
      res.render("userView/shop",{userpar:true,data,user:decode.value.username,products,outofStock,count,total,walletTotal:walletData.total})
    })
    .catch((err) => {
      console.log(err);
      console.log("didtn get my all Products");
    });
   
  },
  renderProfilePage:async(req,res)=>{
    let decode= tokenVerify(req);
    let cart= await cartProd(req)
    let products= cart.cartItems
    let outofStock= cart.outofStock
    let total= await TotalAmount(req)
    let count= await CartCount(req)
    let walletData= await wallet(req)
    let data
    let orderDatas
    // console.log(decode.value.insertedId);
     await userHelpers.getUserData(decode.value.insertedId).then((response)=>{
      console.log("/////?",response);
    data= response
    })
     await userHelpers.getOrderDetails(decode.value.insertedId).then((response)=>{
      // console.log(response);
      orderDatas = response
    })
    console.log("orderDatas",orderDatas[0].cart);
    async function processImages(Data) {
      for (let i = 0; i < Data.length; i++) {
        for(let j = 0;j<Data[i].cart.length;j++){
          if (Data[i].cart[j].cart_product.Image1) {
            Data[i].cart[j].cart_product.urlImage1 = await getImgUrl(Data[i].cart[j].cart_product.Image1);

        }
          // console.log("image 1 :", Data[i].Image1);
          // console.log("Data[i].urlImage1:", Data[i].urlImage1);
        }
  
      }
      console.log("Data:", Data);
      return Data;
    }
  
    let orderData = await processImages(orderDatas);
    
  res.render("userView/profile",{userpar:true,user:decode.value.username,products,outofStock,count,total,data,orderData,walletTotal:walletData.total})
  },


  placeOrder:async(req,res)=>{
    let decode= tokenVerify(req);

    let cart= await cartProd(req)

    let products= cart.cartItems
let prodIds = []
for( let i=0;i<products.length;i++){
    prodIds.push(products[i].item)
  }
  console.log(">>>>>>>>>>>>>>>>>>>",prodIds);

    let outofStock= cart.outofStock


    let total= await TotalAmount(req)

    console.log(req.body,"msa");
    let PaymentStatus = "false"

    let razorpaycomplete = false

    let paypalcomplete = false

    let transactionId= null

    let payment_method = req.body.PaymentOption

    console.log(`payment_method is ${payment_method}`);

    let globalorderId = null

    function getOrderid(){
      return globalorderId
  }

    try{
        if(req.body.order){
        if(!req.body.Address){
          res.status(404).json({error: 'Ha Ocurrido un error'});
          return
        }
        let user= stringify(req.body.userId)

      let id= ObjectId(req.body.userId)
  
      console.log(id);
  
      req.body.id= id
  


      let currencyConverter = new cc({from:"INR", to:"USD", amount:total});

      let response = await currencyConverter.convert();

      console.log("response",response); 
  
      var usdtotal=Math.round(response)


    req.body.PaymentStatus = PaymentStatus
    console.log(req.body.PaymentOption);

     const orderId= await userHelpers.placeOrder(req.body,products,total)
        globalorderId = orderId
  
        if (req.body.PaymentOption === "COD") {
          /// true ? false
          PaymentStatus = "pending COD"
          console.log(`payment option selected is COD and req.body.status is now${PaymentStatus}`);
        }
        else if (req.body.PaymentOption === "wallet") {
          await userHelpers
            .debitFromWallet(orderId, total, decode.value.insertedId)
            .then((transactionIds) => {
              transactionId = transactionIds;
              console.log(`${transactionId} is the transaction id wallet`);
              PaymentStatus = "true";
            
            });
             console.log(`payment option selected is wallet and req.body.status is now`);
        }else if (req.body.PaymentOption === "razorPay") {
          await userHelpers.generateRazorPay(orderId, total).then((response) => {
              res.json({status:"razorpay",response});
          });
          
        }
        else if(req.body.PaymentOption==="paypal"){
  
          var create_payment_json = {
                  "id":`${orderId}`,
                  "intent": "AUTHORIZE",
                  "payer": {
                      "payment_method": "paypal"
                  },
                  "redirect_urls": {
                      "return_url": `http://localhost:8001/user/placeOrder/paypal`,
                      // "return_url": "http://localhost:8001/user/o",
                      "cancel_url": "http://cancel.url"
                      
                  },
                  "transactions": [{
                      "amount": {
                          "currency": "USD",
                          "total": usdtotal
                      },
                      "description": "This is the payment description."
                  }]
              };
              paypal.payment.create(create_payment_json, function (error, payment) {
                    if (error) {
                        console.log(error.response);
                        throw error;
                    } else {
                        for (var i = 0; i < payment.links.length; i++) {
                        //Redirect user to this endpoint for redirect url
                            if (payment.links[i].rel ==='approval_url') {
                              res.json({status:"paypal",forwardLink: payment.links[i].href});
                           break;
                          
                            }
                        }
                    }
                }); 
          
          console.log(`payment option selected is paypal`);
        }
  
      } else if(req.params.data){
        // let data=  JSON.parse('{"' + decodeURI(req.params.data.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
        // console.log(data);
        payment_method = "paypal"
        paypalcomplete = true
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        transactionId = paymentId
        console.log(`payrer id  :${payerId}`);
        console.log(`payrermet  id  :${paymentId}`);
        console.log(`data is coming${req.params.data}`);
        // console.log(data);
      }
      else{
  
        payment_method = "razorPay"
        console.log(`payment meth here i s sinsncsdijcdc${payment_method}`);
          console.log(req.body);
         await  userHelpers.verifyPayment(req.body).then(()=>{
          PaymentStatus= "true"
          razorpaycomplete = true
          transactionId = req.body['order[receipt]']
          console.log(`order recuewso for razorpay is ${req.body['order[receipt]']}`);
            // res.json({status:true})
          }).catch((err)=>{
            PaymentStatus= "false"
            razorpaycomplete = true
            console.log(err);
            // res.json({status:'Payment Failed'})
            
          })
        
      }
        
      }
      catch(e){
        console.log(e, "this is theerroro ");
      }
      finally{
        const orderId =getOrderid()
        // console.log(`${transactionId} is the transaction id wallet`);
        console.log(`payment_method is ${payment_method} 333`);
        if((payment_method==="razorPay" && razorpaycomplete == false )|| (payment_method=== "paypal" && paypalcomplete == false)){
          // console.log(`razorypay status completeion === ${razorpaycomplete}`);
          console.log(`waiting for  confirmation...`);
        }else{
          console.log("entered else");
          function destruct(products){
            let data =[]
                    for(let i=0;i<products.length;i++){
                      let obj ={}  
                      obj.prod= products[i].item
                      obj.quantity= products[i].quantity
                      data.push(obj)
                    }
                    return data
          }
          let ids = destruct(products)
           await userHelpers.placeOrderTrans(orderId,transactionId,PaymentStatus,payment_method,ids,decode.value.insertedId).then((resp)=>{
           console.log(resp);
          //  res.json({status:true})
          //  location.href="http://localhost:8001/user/orderSuccess"
          // res.redirect("/user/orderSuccess")
          res.render("userView/orderSuccess")
  }).catch((e)=>{
    console.log(e);
  })



        }
      }

      
      

      





 


   
    
//     userHelpers. placeOrder  (req.body,products,total).then((orderId)=>{
//       /* 
//       console.log("//////////////////////////////////////////////////////",orderId);
//       function destruct(products) { 
//         let data =[]
//         for(let i=0;i<products.length;i++){
//           let obj ={}  
//           obj.prod= products[i].item
//           obj.quantity= products[i].quantity
//           data.push(obj)
//         }
//         return data
//       }
//       */

//       if(req.body.PaymentOption==='COD'){

//         console.log(cart);
       
//         let ids = destruct(products)
//         console.log(ids,"ids");
  

//         console.log(`this is the idss :: ${ids}`);
//         userHelpers.removeCartAfterOrder(ids,decode.value.insertedId)
//         .then(()=>{
//           res.json({status:"COD"})

//         }).catch(()=>{
//           console.log("error occured while removing from cart after order");
//         })
        
//       }
//       else if(req.body.PaymentOption === 'wallet'){
//         userHelpers.debitFromWallet(orderId,total,decode.value.insertedId).then((response)=>{
//           let ids  = destruct(products)
//           userHelpers.removeCartAfterOrder(ids,decode.value.insertedId).then(()=>{
//             // console.log("this.response",response);
//             res.json({status:"wallet",response})

//           })
//         })
//       }

//       else if(req.body.PaymentOption=='razorPay'){
//         console.log("entered");
//         userHelpers.generateRazorPay(orderId,total).then((response)=>{
//           let ids  = destruct(products)
//           userHelpers.removeCartAfterOrder(ids,decode.value.insertedId).then(()=>{
//             // console.log("this.response",response);
//             res.json({status:"razorpay",response})

//           })

//         })

//       }
//       else if(req.body.PaymentOption=='paypal'){
//         console.log("?????????????????/");

//         console.log(usdtotal);
//             var create_payment_json = {
//       "id":`${orderId}`,
//       "intent": "AUTHORIZE",
//       "payer": {
//           "payment_method": "paypal"
//       },
//       "redirect_urls": {
//           "return_url": "http://localhost:8001/user/orderSuccess",
//           // "return_url": "http://localhost:8001/user/o",
//           "cancel_url": "http://cancel.url"
//       },
//       "transactions": [{
//           "amount": {
//               "currency": "USD",
//               "total": usdtotal
//           },
//           "description": "This is the payment description."
//       }]
//   };
//   paypal.payment.create(create_payment_json, function (error, payment) {
//     if (error) {
//         console.log(error.response);
//         throw error;
//     } else {
//         for (var i = 0; i < payment.links.length; i++) {
//         //Redirect user to this endpoint for redirect url
//             if (payment.links[i].rel ==='approval_url') {
//               // console.log(payment.links[i].href);
//               // res.redirect(`${payment.links[i].href}`)
//               let ids = destruct(products)
//               res.json({status:"paypal",forwardLink: payment.links[i].href});
//               userHelpers.removeCartAfterOrder(ids,decode.value.insertedId)
//             }
//         }
//         changePaymentStatus(orderId)
//     }
// }); 
  
//       }
//       else{
//         res.send("nothind")
//       }
//     })
  
   
    
  },

  // paypalSucces: (req, res) => {
  //   console.log("woeking");
  //   console.log(req.query);
  //   const payerId = req.query.PayerID;
  //   const paymentId = req.query.paymentId;

  //   const execute_payment_json = {
  //     "payer_id": payerId,
  //     "transactions": [{
  //       "amount": {
  //         "currency": "USD",
  //         "total": "25.00"
  //       }
  //     }]
  //   }
  //   paypal.payment.execute(paymentId,execute_payment_json,function(err,paymemt){
  //     if (error) {
  //       console.log(error.response);
  //       throw error;
  //     }else {
  //       console.log("//////");
  //       console.log(JSON.stringify(payment));

  //       // res.redirect('http://localhost:8001/user/orderSuccess');
  //     }
  //   })
  // },
    
  

  
    
    
  verifyPayment:(req,res)=>{

    console.log(req.body);
    userHelpers.verifyPayment(req.body).then(()=>{
      console.log("herer");
console.log(typeof req.body);
console.log( req.body);
//sucess pay
      res.json({status:true})
    }).catch((err)=>{
      
      console.log(err);
      res.json({status:'Payment Failed'})
      
    })
  },
  
  orderSuccess:(req,res)=>{
   console.log("call i shere");

    res.render("userView/orderSuccess")
  },

  loginWtihOtpPage:(req,res)=>{

     res.render("userView/loginWithOtp")
  },
  otpVerification:(req,res)=>{

    console.log(req.body.number);
    userHelpers.checkNumber(req.body.number).then((user)=>{
      res.json({status:"found"})
    }).catch((error)=>{
      res.json({status:error})
    })

  },
  otpverified:(req,res,next)=>{

    console.log("?///////////////////..................>>>>>>>>>>>>>>>....,,,,,,,,,,,,,,,,,<<<<<<<<<<<<<");
console.log(req.params.num,"khjhkkhkkuuuu8889988989898998998");
    userHelpers.checkNumber(req.params.num).then((response)=>{
      console.log(response);
            let user = response;
            const token = createToken(user);
            res.cookie("token", token, {
              httpOnly: true,
            });
            res.status(201);
            console.log("tpoek n",token);
    
            next();
    }).catch((err)=>{
      console.log(err);
      res.render("userView/loginWithOtp",{err})
    })

  },


  
  googleSignupData:(req,res,next)=>{
    // console.log(req.userData)
   let data=  JSON.parse('{"' + decodeURI(req.params.userData.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
console.log(data);
    userHelpers.googleSignup(data).then((user)=>{
        const token= createToken(user)
               // console.log( user.isBlocked);
//             const token =createToken(user);
        res.cookie("token", token, {
          httpOnly: true,
        });
        console.log(token);

      next()

    }).catch(()=>{
      alert('try not worked')
    }).catch((user)=>{
      console.log("eroorroorro");
      res.render("userView/signup", {
        errorMessage: "email id already exists in the database",
      });
    })
  },

    googleLoginData:(req,res,next)=>{
      let data=  JSON.parse('{"' + decodeURI(req.params.userData.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
      console.log(data);
      userHelpers.googleLogin(data).then((Data)=>{
        let user = Data;
        const token = createToken(user);
        res.cookie("token", token, {
          httpOnly: true,
        });
        console.log(token);
      next()

      }).catch((err) => {
        res.render("userView/login", {
          errorMessage: "Some error Occured",
        });
        console.log("error ducring login");
        console.log(err);
      })
  },
  cancelOrderSubmit:(req,res)=>{
    userHelpers.cancelOrderSubmit(req.body.orderId).then((response)=>{
      res.json(response)
    })
  },

  returnOrderSubmit:(req,res)=>{
    userHelpers.returnOrderSubmit(req.body.orderId).then((response)=>{
      res.json(response)
    })
  },

  getWalletPage:async(req,res)=>{
    let cart =await cartProd(req)
    let products= cart.cartItems
    let outofStock= cart.outofStock
    let count= await CartCount(req)
    let total= await TotalAmount(req)

    let decode= tokenVerify(req);
    let full
    let allData
    let walletTotal
    let credits
    let debits
    // const 
    await userHelpers.getWallet(decode.value.insertedId).then((data)=>{
      full = data
    })

    walletTotal = full.total
      allData=[...full.transactions?.credits,...full.transactions?.debits]
      
      credits=[...full.transactions?.credits]
      
      debits=[...full.transactions?.debits]
      
    console.log(credits);

    res.render("userView/wallet",{userpar:true,user:decode.value.username,products,outofStock,count,total,allData,credits,debits,walletTotal})
  }
  
  
  

}






