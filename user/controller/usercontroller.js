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
                error: "This account is blocked",
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

  renderHome: (req, res) => {
    let decode = tokenVerify(req);
    console.log(decode);
    userHelpers.getAllProducts().then((data) => {
        // let wishlist=getAllWishist
        console.log("the then data is :", data);
        res.render("userView/home", {
          data,
          user: decode.value.username,
          userpar: true,
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
        await createUserWithEmailAndPassword(auth,req.body.email,req.body.password).then((userCredential)=>{
        userHelpers.doSignup(userData).then((response) => {
            let user = response;
            console.log( user,".."  );
            console.log( user.isBlocked);
            const token = createToken(user);
            //  const token=jwt.sign({id:user.insertedId},MY_SECRET,{expiresIn:"15m"})
            res.cookie("token", token, {
              httpOnly: true,
            });
            res.status(201);
            console.log(token);
  
            next();
          }).catch((user) => {
            console.log(user + "/////// catch is working");
  
            res.render("userView/signup", {
              error: " Username or  email already exsits!!!",
            });
          })
          .catch(() => {
            console.log("error ducring Signup");
            console.log(err);
          });

          const user = userCredential.user;
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.render("userView/login",{errorMessage:"invalid username or password"})
      });
      
        
    }
  },
  userLoginroute: (req, res, next) => {
    let userData = req.body;
    console.log("?????????");
    signInWithEmailAndPassword(auth,req.body.email,req.body.password).then((userCredential)=>{
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


    })


   
     
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
    console.log(req.params.id);
    let prodId = req.params.id;
    userHelpers
      .viewProduct(prodId)
      .then((response) => {
        let data = response;
        res.render("userView/productPage", {
          data,
          user: decode.value.username,
          userpar: true,
        });
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

  
 






};
