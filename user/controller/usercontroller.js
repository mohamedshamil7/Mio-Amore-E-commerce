const { response } = require('../app');
require("dotenv").config();
const userHelpers=require('../models/userHelpers/userHelpers')
const jwt=require("jsonwebtoken");
const { read } = require('fs');
const { send } = require('process');
const { reset } = require('nodemon');
const { userBlockCheck } = require('../models/userHelpers/userHelpers');


const MY_SECRET = process.env.MY_SECRET


        
const createToken=(user)=>{
    
   return jwt.sign({value:user},MY_SECRET,{expiresIn:"30m"})


}
const  tokenVerify=(request)=>{
    const decode = jwt.verify(request.cookies.token,MY_SECRET)
    return decode
}
module.exports={
    homeJwtCheck:(req,res,next)=>{
        const token= req.cookies.token
        console.log(token);
        if(!token){
            next()
        }
        else{
            try{
                const user =jwt.verify(token,MY_SECRET)
                console.log("userrrrr<<<<<<<<<<<<<<<<<<<>>>>>>>"+user);
                if(user){
                    res.render("userView/home")
                    // res.redirect("/user/home")
                }
            }
            catch(err){
                next()
            }
        }
    },

    autherization:(req,res,next)=>{
        console.log("entered auth");
        
const token = req.cookies.token
console.log(token);
if( ! token){
    res.render("userView/login")
}
else{
    try{
        const user = tokenVerify(req)
        // console.log(user);
        if(user){
            const decode = tokenVerify(req)
            console.log(decode,"+++++decode is here >>>>>>>>>>>>>>>>>>>>>>>");
            console.log(decode.value.insertedId);

            userHelpers.userBlockCheck(decode.value.insertedId).then((response)=>{
                next()
            }).catch(()=>{
                 res.clearCookie("token")
                res.render('userView/login',{error:'This account is blocked'})
                })
        }else{
            res.render('userView/login')
        }
    }catch{
        res.render('userView/login')
    }
    
}
    },




  renderHome:(req,res)=>{
      let decode= tokenVerify(req)
      console.log(decode);
    userHelpers.getAllProducts().then((data)=>{
        console.log("the then data is :",data);
        res.render('userView/home',{data,user:decode.value.username,userpar:true});
    }).catch((err)=>{
        console.log(err);
        console.log("didtn get my all Products");
    })
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
        console.log(user,"?????///////////////////////////////////////////////////////////////////");
        console.log("cmondt=ra"+user.isBlocked);
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
    console.log("?????????");
    userHelpers.doLogin(userData).then((response)=>{
    console.log(response);
    let user=response
        const token=createToken(user)
        res.cookie("token",token,{
            httpOnly:true,

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
userLogout:(req,res)=>{
    res.clearCookie("token")
    res.redirect("/user/login")
},
productPage:(req,res)=>{
    let decode= tokenVerify(req)
    console.log(req.params.id);
    let prodId=req.params.id
    userHelpers.viewProduct(prodId).then((response)=>{
        let data =response
        res.render("userView/productPage",{data,user:decode.value.username,userpar:true})

    }).catch((err)=>{
        console.log(err);
    })
}
,
imageRoute:(req,res)=>{
    let decode= tokenVerify(req)
    let id=req.params.id
    console.log(id);

},

wishlistPage:(req,res)=>{
    res.render('userView/wishlist',{userpar:true})
},
addToWishlist:(req,res)=>{
    console.log(req.params.id);
    let decode= tokenVerify(req)
    userHelpers.addToWishlist(req.params.id,decode.value.insertedId).then((response=>{
        console.log(response);
         res.redirect(req.get('referer'))
        // res.send("added to wishlist")
        // res.render("userView/productPage",{data,user:decode.value.username,userpar:true})
    })).catch((err)=>{
        console.log(err);
    })
}



    

}