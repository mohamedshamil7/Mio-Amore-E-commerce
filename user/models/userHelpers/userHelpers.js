



var db=require("../../../dbconnections/dbConnection")
var collection=require("../../../dbconnections/Collections")
const bcrypt=require("bcrypt")
const { resolve } = require("path")
const jwt=require("jsonwebtoken");
const { reject, promiseAllSettled } = require("firebase-tools/lib/utils");
const { ObjectId } = require("mongodb");
const { response } = require("../../app");
const { async } = require("@firebase/util");
const { reload } = require("firebase/auth");
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
            var users={
                username:userData.username,
                insertedId:result.insertedId

            }
            console.log("resolveeddddd");
          resolve(users)
        //   resolve(result)
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
    //   console.log("check cart erere",cart);
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
            },
            {
                $project:{
                    item:1,quantity:1,cart_product:{$arrayElemAt:['$cart_product',0]}
                }
            }

        ]).toArray()
        if(cartItems){
            console.log("workingggg");
            resolve(cartItems)
        }
        else{
            console.log("this is woring");
            let status=0
            resolve(status)
        }

      }
      else{
        let status= 0
            resolve(status)
      }
      
      
    
          
                
            // console.log(cartItems);
         
        // }
 
    })
    // .catch(()=>{
    //     console.log("2nd reject");

    //     reject()
    // })
},

removeCart:(userId,prodId)=>{
    console.log(userId);
    
    console.log("prodd>>>>>>>>>>>>>>>>>",prodId);
    return new Promise(async(resolve,reject)=>{
        let userCart= db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        if(userCart){
            db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},{
                $pull:{
                    product:{item:ObjectId(prodId)}
                }
            }) 
            resolve(userCart)
        }
    })
},

getCartCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let count=0
        let  cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        if(cart){
           
            count=cart.product.length
            console.log(count);
            resolve(count)
        }
        else{
            resolve(count)
        }
    })
},
changeProductQuantity:(data)=>{
    let quantity=parseInt(data.quantity)
    let count=parseInt(data.count)
    console.log(data);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",data.cart);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>||",data.product);
    return new Promise(async(resolve,reject)=>{
        if(count== -1 && quantity== 1 ){
            await db.get().collection(collection.CART_COLLECTION).updateOne({$and:[{_id:ObjectId(data.cart)},{'product.item':ObjectId(data.product)}]},{
                $pull:{
                    product:{item:ObjectId(data.product)}
                }
            }).then(()=>{
                resolve({prodDelete:true})
            })
        }else{
            await db.get().collection(collection.CART_COLLECTION).updateOne({$and:[{_id:ObjectId(data.cart)},{'product.item':ObjectId(data.product)}]},{
                $inc:{'product.$.quantity':count}  
            }).then(()=>{
                resolve(true)
            })
        }
       

    })

 

},
getTotalAmount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        const total= await db.get().collection(collection.CART_COLLECTION).aggregate([
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
            },
            {
                $project:{
                    item:1,quantity:1,cart_product:{$arrayElemAt:['$cart_product',0]}
                }
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:[{$toInt:'$quantity'},{$toInt:'$cart_product.Price'}]}}
                }
            }
    
        ]).toArray()
        // console.log(total);
        resolve(total[0]?.total)
    })
    
},

addAddress:(userId,Data)=>{
    Data.id=ObjectId()
    return new Promise(async(resolve,reject)=>{
        let user= await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId),Address:{$exists:true}})
        if(user){
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                $push:{
                    Address:Data
                }
            }).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                reject(err)
            })
            // console.log(user,"is herere");
        }else{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                $push:{
                    Address:Data
                }
            }).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                reject(err)
            })
        }

    })
},
getAddress:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let user= await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId),Address:{$exists:true}})
        // resolve(user)
        if(user){
            let address= await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match:{
                        _id:ObjectId(userId)
                    }
                },
                {
                    $project:{
                        _id:0,
                        Address:1
                    }
                },
                {
                    $unwind:"$Address"
                },
                // {
                //     $project:{
                //         _id:0,
                //         "Address.fullName":1
                //     }
                // },
            ]).toArray()
            resolve(address)
        }
        else{
            resolve()
        }
    })
}









}
