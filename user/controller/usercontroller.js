const { response } = require('../app');
require("dotenv").config();
const userHelpers=require('../models/userHelpers/userHelpers')
const jwt=require("jsonwebtoken");
const { read } = require('fs');
const { send } = require('process');
const { reset } = require('nodemon');

// var MY_SECRET = process.env.MY_SECRET
const MY_SECRET = process.env.MY_SECRET


// const createToken = (id)=>{
//     return jwt.sign({id},"Mio Amore Secret",{
//             expiresIn:30
//             })
//         }
//         // const token=createToken(response.insertedId)
//         // res.cookie('jwt',token,{httpOnly:true,maxAge:15})
//         // res.status(201)
//             module.exports={createToken}
        
const createToken=(user)=>{
    
   return jwt.sign({id:user.insertedId},MY_SECRET,{expiresIn:"30s"})


}
module.exports={
    LogincokkieJWtAuth:(req,res,next)=>{
        console.log("entered jwtAuth for login");
        const token =req.cookies.token
        try{
           const user = jwt.verify(token,MY_SECRET) 
           req.user=user
           console.log(user);
           console.log("ive ethaninfo avo");
           return res.redirect('/user/home')
        } catch(err){
            console.log("entererd error");
            res.clearCookie("token")
            next()
            
        }
      },


  cokkieJWtAuth:(req,res,next)=>{
    console.log("entered jwtAuth");
    const token =req.cookies.token
    try{
       const user = jwt.verify(token,MY_SECRET) 
       req.user=user
       next()
    } catch(err){
        res.clearCookie("token")
        return res.redirect('/user/login')
    }
  },
checkBlocked:(req,res,next)=>{
userHelpers.userBlockCheck(req.body._id).then(()=>{
    next()
}).catch((err)=>{
    res.render("userView/login",{error:"user is blocked"})
})
},

  renderHome:(req,res)=>{
    
    res.render('userView/home',{user:true});
 },
 redirectHome:(req,res)=>{
    res.redirect("/user/home")
 },

renderLogin:(req,res,next)=>{
    res.render('userView/login');
},

renderSignup:(req,res)=>{
    res.render("userView/signup")
},
userSignupRoute:(req,res,next)=>{
    if(!req.body.username ||!req.body.email || !req.body.password || !req.body.phone){
        res.render('userView/signup',{error:"please enter details"})
    }
    else{
        console.log(req.body);
        let  userData=req.body
     userHelpers.doSignup(userData).then((response)=>{
        let user=response
        console.log("cmondt=ra"+user);
        const token=createToken(user)
        //  const token=jwt.sign({id:user.insertedId},MY_SECRET,{expiresIn:"15m"})
        res.cookie("token",token,{
            httpOnly:true
        })
             res.status(201,)
console.log(token);
   
next()
     
     
     }).catch((user)=>{

        console.log(user+"/////// catch is working");

        res.render('userView/signup',{error:" Username or  email already exsits!!!"})
     }).catch(()=>{

        console.log("error ducring Signup");
        console.log(err);
     })

    }
   
},
  userLoginroute:(req,res,next)=>{
    let userData=req.body
    console.log("?????????????????????????????????????????");
    userHelpers.doLogin(userData).then((response)=>{
    console.log(response);
    let user=response
        const token=createToken(user)
        res.cookie("token",token,{
            httpOnly:true,
            maxAge:30000
        })
             res.status(201,)
console.log(token);
   
next()
     

    
}).catch((err)=>{
    res.render('userView/login',{error:"Incorrect emailId or Password"})
    console.log("error ducring login");
        console.log(err);
})
    
},
    

}