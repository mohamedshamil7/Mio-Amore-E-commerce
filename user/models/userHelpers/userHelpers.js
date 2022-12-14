var db=require("../dbconnections/dbConnection")
var collection=require("../dbconnections/Collections")
const bcrypt=require("bcrypt")
const { resolve } = require("path")
const jwt=require("jsonwebtoken");
require("dotenv").config();

var MY_SECRET = process.env.MY_SECRET


module.exports={


    doSignup: (userData) => {


        return new Promise(async(resolve, reject) => {
            console.log("user data before fiindone :",userData);
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                console.log(user,"indo illeyo");
                reject(user)
            }
            else{
          userData.password = await bcrypt.hash(userData.password, 10);
          const result = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);

          if (result.insertedId) {
            
          resolve(result)
        }
          else {
            console.log("second if working or ");
            reject()}
         }});
  
      },

      doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                await bcrypt.compare(userData.password,user.password).then((result)=>{
    
    
    
                    if(result) {
                        
                        var userData={
                            username:user.username,
                            userid:user._id
                        }
                        resolve(userData)}
                    else reject()
                })
            }
            else{
                reject()
            }
        })
     },

   
}