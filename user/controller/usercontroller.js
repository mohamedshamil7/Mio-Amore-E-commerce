const { response } = require("../app");
require("dotenv").config();
const userHelpers = require("../models/userHelpers/userHelpers");
const jwt = require("jsonwebtoken");
const { read } = require("fs");
const { send } = require("process");
const { reset } = require("nodemon");
const { userBlockCheck } = require("../models/userHelpers/userHelpers");




// Import the functions you need from the SDKs you need
const { initializeApp } =require ("firebase/app");
const  { getAnalytics } =require ("firebase/analytics");
const  { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword ,RecaptchaVerifier,signInWithPhoneNumber} = require ("firebase/auth");
const { resolve } = require("path");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWUj1WTYvzTT1F-8cCOkI7Ip4wxupeTl4",
  authDomain: "mio-amore-abdf4.firebaseapp.com",
  projectId: "mio-amore-abdf4",
  storageBucket: "mio-amore-abdf4.appspot.com",
  messagingSenderId: "133103040937",
  appId: "1:133103040937:web:951523b5c3659c2f97acb8",
  measurementId: "G-DCHWS8YQG0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
auth.languageCode = 'it';




const MY_SECRET = process.env.MY_SECRET;

const createToken = (user) => {
  return jwt.sign({ value: user }, MY_SECRET, { expiresIn: "30m" });
};
const tokenVerify = (request) => {
  const decode = jwt.verify(request.cookies.token, MY_SECRET);
  return decode;
};


 const cartProd= async (req)=>{
  
  const decode= tokenVerify(req)
  return await userHelpers.getcart(decode.value.insertedId).then((cart)=>{
    return cart
  }).catch((error)=>{
    return error
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
    let decode = tokenVerify(req);
    console.log(decode);
    let cart =await cartProd(req)
    let count= await CartCount(req)
    console.log(cart," this was cart>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(cart[0].cart_product,"anser for my question ^^^^^^^^^^^^^^^^^^^^^^^^");
    userHelpers.getAllProducts().then((data) => {
      
        console.log("the then data is :", data);
        res.render("userView/home", {
          data,
          user: decode.value.username,
          userpar: true,
          cart,
          count
        });
      })
      .catch((err) => {
        console.log(err);
        console.log("didtn get my all Products");
      });
  },
  redirectHome: (req, res) => {
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

        userHelpers.doSignup(userData).then((response) => {
            let user = response;
            console.log( user,".."  );
            console.log( user.isBlocked);
            const token = createToken(user);

            res.cookie("token", token, {
              httpOnly: true,
            });
            res.status(201);
            console.log(token);
  
            next();
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
            res.cookie("token", token, {
              httpOnly: true,
            });
            res.status(201);
            console.log(token);
    
            next();
          }).catch((err) => {
            res.render("userView/login", {
              error: "Incorrect emailId or Password",
            });
            console.log("error ducring login");
            console.log(err);
          }).catch(() => {
            //   const errorCode = error.code;
            //   const errorMessage = error.message;
              res.render("userView/signup", {
                  errorMessage:"invalid username or password"
                })
            // console.log(errorCode);
            // console.log(errorMessage);
          });


    


   
     
  },

  otppage:((req,res)=> {
    res.render("userView/otppage")
  }),

  



  userLogout: (req, res) => {
    res.clearCookie("token");
    res.redirect("/user/login");
  },
  productPage: (req, res) => {
    let decode = tokenVerify(req);
    let user= decode.value.insertedId
    console.log(req.params.id);
    let prodId = req.params.id;
    userHelpers.inWishlist(user,prodId).then((response)=>{
      let wishlist=response
      userHelpers
      .viewProduct(prodId)
      .then((response) => {
        
        let data = response;
        res.render("userView/productPage", {
          wishlist,
          data,
          user: decode.value.username,
          userpar: true,
        });
      })
      .catch((err) => {
        console.log(err);
      });
    })
    
  },
  imageRoute: (req, res) => {
    let decode = tokenVerify(req);
    let id = req.params.id;
    console.log(id);
  },

  wishlistPage: (req, res) => {
    let decode = tokenVerify(req);

    userHelpers.wishlistProducts(decode.value.insertedId).then((response) => {
      let data = response;
      res.render("userView/wishlist", {
        data,
        user: decode.value.username,
        userpar: true,
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
      // res.redirect(req.get("referer"));
    }).catch((error)=>{
      console.log(error);
    })

  },
  
  getCart:(req,res)=>{
    let decode= tokenVerify(req)
    userHelpers.getcart(decode.value.insertedId).then((products)=>{

      res.render("userView/cart",{products,userpar:true})
    })
  },
 
  removeCart:(req,res)=>{
    let decode= tokenVerify(req)
    userHelpers.removeCart(decode.value.insertedId,req.params.id).then((response)=>{
      console.log(response);
      res.redirect(req.get("referer"));
    }).catch((error)=>{
      console.log("failed to dlete from cart");
    })
  }


};
