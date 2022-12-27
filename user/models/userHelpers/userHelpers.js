



var db=require("../../../dbconnections/dbConnection")
var collection=require("../../../dbconnections/Collections")
const bcrypt=require("bcrypt")
const { resolve } = require("path")
const jwt=require("jsonwebtoken");
const { reject, promiseAllSettled } = require("firebase-tools/lib/utils");
const { ObjectId } = require("mongodb");
const { response } = require("../../app");
require("dotenv").config();

var MY_SECRET = process.env.MY_SECRET


module.exports={


    doSignup: (userData) => {
        userData.createdAt= new Date().toDateString()
        userData.isBlocked=false

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
          console.log("this result>>>>>>>>>>>",result);

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
                            insertedId:user._id
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

     userBlockCheck:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
            console.log(user);
            console.log(user.isBlocked,"....");
            if(user.isBlocked==true){
                reject()
            }
            else{
                resolve()
            }
        })
     },

     getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let all = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray()

                if(all){
                    let data={
                        all:all
                    }
                    console.log(data);

                    resolve(data)
                }
                else{
                    console.log("all selse worked");
                    reject()
                }
            }
            catch(err){
                console.log(err);

            }
        })
     },
     viewProduct:(prodid)=>{
        console.log("enttered");
        return new Promise(async(resolve,reject)=>{

            let product= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(prodid)}).then((response)=>{
             resolve(response)
            }).catch((error)=>{
                 reject(error)
                })
            // try{
            //     let product= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(prodid)})
            //     if(product){
            //         console.log(product);
            //         resolve(product)   
            //         }
            //         else{
            //             reject(err)
            //         }

            // }catch(err){
            //     console.log(err);

            // }
        })
     },
     addToWishlist:(prodID,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let userwl = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
            if(userwl){
                wishlist= userwl.wishlist.findIndex(product=>{
                    return product==prodID
                })
                console.log(wishlist);
                if(wishlist !=-1){
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId)},{
                        $pull:{
                            wishlist:ObjectId(prodID)
                        }
                    }).then((response)=>{
                        resolve(response)
                    }).catch((error)=>{
                        reject(error)
                    })
                }
                else{
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId)},{
                        $push:{
                            wishlist:ObjectId(prodID)
                        }
                    }).then((response)=>{
                        resolve(response)
                    }).catch((error)=>{
                        reject(error)
                    })

                }
            }else{
                await  db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId)},{
                
                    $push:{
                        wishlist:ObjectId(prodID)
                    }
                },{upsert:true}).then((response)=>{
                    db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(prodID)},{
                        $set:{
                            inWishlist: true
                        }
                    })
                    console.log("responsed form helperass",response);
                    resolve(response)
                }).catch((err)=>{
                    console.log("got into catch");
                    reject(err)
                })
            }
           
        })
     },
    //  getAllWishist:(userId)=>{
    //     return new Promise (async(resolve,reject)=>{
    //         let userwl = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
    //         if(userwl){
    //             await db.get().collection(collection.WISHLIST_COLLECTION).find()
    //         }
    //     })
    //  }
    wishlistProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
             let userwl = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
             console.log(userwl);
             if(userwl){
                let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                    {
                        $match:{
                            user:ObjectId(userId)
                        }
                    },
                    {
                        $unwind:"$wishlist"
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTIONS,
                            localField:"wishlist",
                            foreignField:"_id",
                            as:"wishlistItems"
                        }
                    },
                    {
                        $project:{
                            wishlistItems:1,
                            ProductName:1,
                            Company:1,
                            Price:1,
                            ManufacturingDate:1,
                            category:1,
                            Description:1,
                            Product:{$arrayElemAt:["$wishlistItems",0]}
                        }
                    }

                ]).toArray()
                if(wishlist){

                    // console.log("hi",wishlist[0].Product);
                    resolve(wishlist)
                }
                else{
                    reject()
                }
    
               }
            else{
                 resolve()
            }
        })
    },

inWishlist:(userId,prodId)=>{
    return new Promise(async(resolve,reject)=>{
        let userwl = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
        if(userwl){
            let product= await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{
                        user:ObjectId(userId)
                    }
                    
                },
                {
                    $unwind:"$wishlist"
                },
                {
                    $match:{
                       wishlist: ObjectId(prodId)
                    }
                }

            ]).toArray()
            if(product){
                resolve(product)
                // console.log(product);
            }
        }else{
            reject()
        }
       
    })
},
findbynumber:(userphone)=>{
    return new Promise(async(resolve,reject)=>{
        let user= await db.get().collection(collection.USER_COLLECTION).findOne({phone:userphone})
        if(user) resolve(user)
        else reject()
    })
},

addToCart:(userId,prodId)=>{
    const prodObj = {
        item: ObjectId(prodId),
        quantity: 1,
      };
    return new Promise(async(resolve,reject)=>{
        let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)}) 
        console.log(userCart);
        if(userCart){
            // const proExist = userCart.books.findIndex((book) => book.item == proId);
           const  cart= userCart.product.findIndex(product=>{
                return product.item==prodId
            })
            console.log(cart);

            if(cart !==-1){
                db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId),'product.item':ObjectId(prodId)},{
                    $inc:{'product.$.quantity':1}
                }).then(()=>{
                    resolve()
                })
            }
            else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},{
                    $push:{
                        product:prodObj
                    }
                }).then(()=>{
                    resolve()
                })
            }
        }else{
            const newcart={
                user:ObjectId(userId),
                product:[prodObj]
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(newcart).then(()=>{
                resolve()
            }).catch((error)=>{
                reject(error)
            })
        }
    })
},


getcart:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let  cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        if(cart){
                const cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{
                        user:ObjectId(userId)
                    }
                },
                {
                    $unwind:'$product'
                },{
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTIONS,
                        localField:'item',
                        foreignField:'_id',
                        as:'cart_product'
                    }
                }

            ]).toArray()
            console.log(cartItems);
            resolve(cartItems)
        }
    })
},

removeCart:(userId,prodId)=>{
    return new Promise(async(resolve,reject)=>{
        let userCart= db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        if(userCart){
            db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(userId),})
        }
    })
}


   
}
