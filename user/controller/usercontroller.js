
require("dotenv").config();
const userHelpers = require("../models/userHelpers/userHelpers");
const jwt = require("jsonwebtoken");
const { read } = require("fs");
const { send } = require("process");
const { reset } = require("nodemon");
const { userBlockCheck, inStockcheck, changePaymentStatus } = require("../models/userHelpers/userHelpers");
const { ObjectId } = require("mongodb");
const Swal = require('sweetalert2')
// import Swal from 'sweetalert2'

const cc= require("currency-converter-lt")

var paypal= require('paypal-rest-sdk')


const PAYPAL_CLIENT_ID=process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET=process.env.PAYPAL_CLIENT_SECRET

paypal.configure({
  "mode" :'sandbox',
  "client_id" :PAYPAL_CLIENT_ID,
  "client_secret":PAYPAL_CLIENT_SECRET
})


const { stringify } = require("querystring");









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






module.exports = {
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
    let total= await TotalAmount(req)
    let cart =await cartProd(req)
      let products= cart.cartItems
    let outofStock= cart.outofStock
    console.log(cart);

    let count= await CartCount(req)
    console.log(cart," this was cart>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    // console.log(cart[0].cart_product,"anser for my question ^^^^^^^^^^^^^^^^^^^^^^^^");
    userHelpers.getAllProducts().then((data) => {
      
        console.log("the then data is :", data);
        res.render("userView/home", {
          data,
          user: decode.value.username,
          userpar: true,
          products,
           count,
           total,
           outofStock
        });
      })
      .catch((err) => {
        console.log(err);
        console.log("didtn get my all Products");
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
    console.log(req.params.id);
    let prodId = req.params.id;
      userHelpers.viewProduct(prodId).then((response) => {
        let data = response;
        console.log(`data:?????????//// ${data.inStock}`);
        userHelpers.inWishlist(user,prodId).then((response)=>{
          let wishlist=response
          res.render("userView/productPage", {
            wishlist,
            data,
            user: decode.value.username,
            userpar: true,
            products,
            outofStock,
            count,
            total
          });
        }).catch(()=>{
          let wishlist=false
          res.render("userView/productPage", {
            wishlist,
            data,
            user: decode.value.username,
            userpar: true,
            products,
            outofStock,
            count,
            total
          });
    
        })
       
        
      })
      .catch((err) => {
        console.log(err);
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
    userHelpers.wishlistProducts(decode.value.insertedId).then((response) => {
      let data = response;
      res.render("userView/wishlist", {
        data,
        user: decode.value.username,
        userpar: true,
        products,
        outofStock,
        count
      });
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
    console.log(total);
    userHelpers.getcart(decode.value.insertedId).then((obj)=>{
      console.log(obj.outofStock);
      let products = obj.cartItems
      let outofStock= obj.outofStock
      // console.log(obj.cartItems);
      // console.log(products,"?????????///////////////////");
       res.render("userView/cart",{products,userpar:true,total,outofStock,count})
    })
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
    let count= await CartCount(req)
    let total= await TotalAmount(req)
    let Address= await userHelpers.getAddress(decode .value.insertedId)
    // let inStock= await checkinStock(req)
    let user=decode.value.username
    let userID = ObjectId(decode.value.insertedId) 
    console.log( "uer if", userID);
    console.log("@#############@@@@@@@###",user);
    console.log("???????",Address,">>>>>");
    userHelpers.getcart(decode.value.insertedId).then((obj)=>{
      let products = obj.cartItems
      let outofStock= obj.outofStock
     



   return res.render("userView/checkout",{Address,products,user,userID,userpar:true,cart,count,total,outofStock})

    })
  },


  addAddress:(req,res)=>{
    if(!req.body.fname ||
      !req.body.mobile ||
      !req.body.pin ||
      !req.body.houseNo ||
      !req.body.landMark ||
      !req.body.useradd ||
      !req.body.town){
        // res.render("userView/checkout", { error: "please enter details" });
       return  Swal.fire({
          title: 'Do you want to save the changes?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Save',
          denyButtonText: `Don't save`,
        })
        // .then((result) => {
        //   /* Read more about isConfirmed, isDenied below */
        //   if (result.isConfirmed) {
        //     Swal.fire('Saved!', '', 'success')
        //   } else if (result.isDenied) {
        //     Swal.fire('Changes are not saved', '', 'info')
        //   }
        // })

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
    userHelpers.getAllProducts().then((data) => {
      
      console.log("the then data is :", data);
      res.render("userView/shop",{userpar:true,data,user:decode.value.username,products,outofStock,count,total})
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
    let data
    let orderData
    // console.log(decode.value.insertedId);
     await userHelpers.getUserData(decode.value.insertedId).then((response)=>{
      console.log("/////?",response);
    data= response
    })
     await userHelpers.getOrderDetails(decode.value.insertedId).then((response)=>{
      // console.log(response);
      orderData = response
    })
    // for(let i= 0 ;i<orderData.length;i++)
    // console.log(";;;",orderData[0].cart[0]);
  res.render("userView/profile",{userpar:true,user:decode.value.username,products,outofStock,count,total,data,orderData})
  },


  placeOrder:async(req,res)=>{
    console.log(req.body,"msa");
    let decode= tokenVerify(req);
    let cart= await cartProd(req)
    let products= cart.cartItems
    let outofStock= cart.outofStock
    let total= await TotalAmount(req)

    let currencyConverter = new cc({from:"INR", to:"USD", amount:total});
          let response = await currencyConverter.convert();
          console.log("response",response); 
          var usdtotal=Math.round(response)
    // console.log(total);
    console.log(typeof req.body.userId,"::::::");
    let user= stringify(req.body.userId)
    console.log(user);
    let id= ObjectId(req.body.userId)
    console.log(id);
    req.body.id= id

    
    userHelpers. placeOrder  (req.body,products,total).then((orderId)=>{
      console.log("/////////////////////////////////////////////////////////",orderId);
      function destruct(products) { 
        let data =[]
        for(let i=0;i<products.length;i++){
          let obj ={}  
          obj.prod= products[i].item
          obj.quantity= products[i].quantity
          data.push(obj)
        }
        return data
      }

      if(req.body.PaymentOption==='COD'){

        console.log(cart);
       
        let ids = destruct(products)
        console.log(ids,"ids");
  

        console.log(`this is the idss :: ${ids}`);
        userHelpers.removeCartAfterOrder(ids,decode.value.insertedId)
        .then(()=>{
          res.json({status:"COD"})

        }).catch(()=>{
          console.log("error occured while removing from cart after order");
        })
        
      }
      else if(req.body.PaymentOption=='razorPay'){
        console.log("entered");
        userHelpers.generateRazorPay(orderId,total).then((response)=>{
          let ids  = destruct(products)
          userHelpers.removeCartAfterOrder(ids,decode.value.insertedId).then(()=>{
            // console.log("this.response",response);
            res.json({status:"razorpay",response})

          })

        })

      }
      else if(req.body.PaymentOption=='paypal'){
        console.log("?????????????????/");

        console.log(usdtotal);
            var create_payment_json = {
      "id":`${orderId}`,
      "intent": "AUTHORIZE",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:8001/user/orderSuccess",
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
              // console.log(payment.links[i].href);
              // res.redirect(`${payment.links[i].href}`)
              let ids = destruct(products)
              res.json({status:"paypal",forwardLink: payment.links[i].href});
              userHelpers.removeCartAfterOrder(ids,decode.value.insertedId)
            }
        }
        changePaymentStatus(orderId)
    }
}); 
  
      }
      else{
        res.send("nothind")
      }
    })
    
   
    
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
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        console.log("succes pay");
        res.json({status:true})
      })
    }).catch((err)=>{
      
      console.log(err);
      res.json({status:'Payment Failed'})
      
    })
  },
  
  orderSuccess:(req,res)=>{
    const payer=req.body.PayerID;
    const paymentId=req.body.paymentId
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
  }
  
  
  

}






