require("dotenv").config();
var db=require("../../../dbconnections/dbConnection")
var collection=require("../../../dbconnections/Collections")
const bcrypt=require("bcrypt")
const { resolve } = require("path")
const jwt=require("jsonwebtoken");
const { reject, promiseAllSettled } = require("firebase-tools/lib/utils");
const { ObjectId } = require("mongodb");
const { response } = require("../../app");
const mongoClient=require('mongodb').MongoClient

const crypto = require('crypto');

const MONGODB=process.env.MONGODB


require("dotenv").config();
const razorPay= require("razorpay");
const { stringify } = require("querystring");
const { stat } = require("fs");
const Key_ID=process.env.RAZORPAY_KEY_ID
const KEY_SECRET=process.env.RAZORPAY_KEY_SECRET
var instance =new razorPay({
    key_id:Key_ID,
   key_secret:KEY_SECRET
})

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
          let walletData= {
            userId:result.insertedId,
            total:0,
            transactions:{
                credits:[],
                debits:[]
            }
          }

          let wallet =await  db.get().collection(collection.WALLET_COLLECTION).insertOne(walletData)
          console.log(wallet,"//////////////////////////");
          await db.get().collection(collection.USER_COLLECTION).updateOne({_id:result.insertedId},{
            $set:{
                walletId:wallet.insertedId
            }
          })

          if (result.insertedId) {
            var users={
                username:userData.username,
                insertedId:result.insertedId

            }
            console.log("resolveeddddd");
          resolve(users)

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

            await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(prodid)}).then((response)=>{
            
                console.log(response)
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
            let outofStock= false
            console.log("workingggg");
            for(let i=0;i<cartItems.length;i++){
                console.log(cartItems.length);
                console.log(cartItems[i].cart_product.inStock,"<<<<<<<<<");
                if(cartItems[i].cart_product.inStock==false){
                    console.log("hereeeere");
                    outofStock=true
                }
            }
            console.log(outofStock);
            console.log(cartItems);
            let obj={
                cartItems:cartItems,
                outofStock:outofStock
            }
            console.log("helper obj",obj);
            resolve(obj)
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

    return new Promise(async(resolve,reject)=>{
        let stock= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(data.product)})
        stock=stock.Stock
        if(stock<(quantity + count)){
            console.log("entered reject");
            return reject()
        }else{
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
},


placeOrder:(order,cart,total)=>{

return new Promise(async(resolve,reject)=>{
console.log(order.PaymentOption);
let userId=  order.id
console.log(typeof userId);

     let order_status= 'pending'

    // console.log(order_status);

    let address= await db.get().collection(collection.USER_COLLECTION).aggregate([

        {
            $unwind:'$Address'
        },
         {
            $match:{
               'Address.id':ObjectId(order.Address)
            },
            
        },
        {
            $project:{
                _id:0,
                Address:1
            }
        },
        {
            $project:{
                deleviryDetails:{
                    fullName:'$Address.fullName',
                    mobile:'$Address.mobile',
                    houseNo:'$Address.houseNo',
                    pin:'$Address.pin',
                    landmark:'$Address.landMark',
                    useradd:'$Address.useradd',
                    town:'$Address.town',
                }
                
            }
        }
    ]).toArray()
    console.log("(((((((((",address);
    // console.log(typeof userId);
    // let user = userId

    // console.log("??????/////",user);

    let orderObj={
        deleviryDetails:address[0].deleviryDetails ,
        userId:userId,
    
        totalAmount:total,
        paymentMethod:order.PaymentOption,
        PaymentStatus: order.PaymentStatus,
        cart,
        date: new Date().toDateString(),
        fullDate: new Date(),
        status:order_status,
        btnStatus: true,
        transactionId:null,
        deliveryStatus:"Preparing",
    }
    console.log(userId);
    db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
        // db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(response.insertedId)},{
        //     $set:{  'cart.$[].deliveryStatus':'Order Confirmed'},
        // },{ multi: true })
        resolve(response.insertedId)

    }).catch((error)=>{
        console.log(error);
    })
})

},
            
        removeCartAfterOrder:(items,userId)=>{

    console.log("this is ccart",items);


    return new Promise(async(resolve,reject)=>{
        console.log("ullilkeri");
        for(let i =0;i<items.length;i++){
            console.log(";;");
            items[i].quantity=Number(items[i].quantity)
            await  db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:items[i].prod},{
                $inc: {Stock:-items[i].quantity}
                 
             })


           await  db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:items[i].prod},[{
               $set:{inStock:{$cond:{if:{$lt:["$Stock",1]},then:false,else:true}}}, 
            }]).then(()=>{
                console.log("herehhrehehhe");
                // {$set:{inStock:{$cond:{if:{$lt:["$Stock",1]},then:false,else:true}}}}
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(userId)}).then(()=>{
                    console.log("resolve stage");
                resolve()
                 }).catch((error=>{
                    reject()
                 }))
            })
        }
    


            

        
        
    })
},
    generateRazorPay:(orderId,total)=>{
    return new Promise(async(resolve,reject)=>{
        console.log(total);
        var options = {
            amount:total*100,
            currency:"INR",
            receipt:`${orderId}`
        }
        instance.orders.create(options,function(err,order){
            if(err){
                console.log(err);
            }
            else{
                console.log("order created herre",order);
                resolve(order)

            }
        })
    })
},
verifyPayment:(details)=>{
    
    return new Promise(async(resolve,reject)=>{
        const { createHmac, } = await import('node:crypto');
        let hmac = createHmac('sha256', 'xslbBw99lI0wSbcbW3c2oUkJ');
        hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
        hmac = hmac.digest('hex')
        if (hmac == details['payment[razorpay_signature]']) {
            resolve()
        } else {
            reject()
        }
    })
},

changePaymentStatus:(orderId)=>{
    console.log('efnriuerfvyvbbbbv',orderId);
    return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
            $set: { status: 'placed' },
        })
        resolve()
    })

},

checkNumber:(phone)=>{
    console.log("iths thheirjjej");
    let number=phone
    console.log(number,"kdkdkdkdkdn vknvnnnn");
    return new Promise(async(resolve,reject)=>{
        let user=await  db.get().collection(collection.USER_COLLECTION).findOne({phone:number})
        console.log("this is the user from the otp succes",user);
        if(user){
         if(user.isBlocked){
             reject({err:"this account is blocked"})
         }else{
            var userData={
                username:user.username,
                insertedId:user._id
            }
            resolve(userData)
         }
        }else{
         reject({err:"account not found"})
        }
    })

  
},
googleSignup:(userData)=>{
    // console.log(typeof userData);
    // console.log(userData,"userdata google signup helper")
    // const email= userData.email
    // const username= userData.username
 
    const Data={
        email:userData.email,
        username:userData.username,
        createdAt: new Date().toDateString(),
        isBlocked:false

    }
    return new Promise(async(resolve,reject)=>{
        try{
            const user= await db.get().collection(collection.USER_COLLECTION).findOne({email:Data.email})
            if(user){
                reject(user)
            }else{
                let newuser=  await db.get().collection(collection.USER_COLLECTION).insertOne(Data)
                console.log(`newuser signup using Google : ${newuser}`)
                console.log(newuser._id)
                let walletData = {
                    userId :newuser.insertedId,
                    total:0
                }
                let wallet = await db.get().collection(collection.WALLET_COLLECTION).insertOne(walletData)
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:newuser.insertedId},{
                    $set:{
                        walletId:wallet.insertedId
                    }
                })
                if(newuser.insertedId){
                    var users={
                        username:Data.username,
                        insertedId:newuser.insertedId
        
                    }
                    console.log("resolveeddddd");
                  resolve(users)
                }
            }
        }
        catch(e){
            console.log(e);
            // alert(e)
            reject()
        }
    })
},
googleLogin:(userData)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                // console.log(user)
                var Data={
                    username:user.username,
                    insertedId:user._id
                }
                resolve(Data)
            }else{
                reject()
            }
        }
        catch(e){
            reject(e)
        }
        
    })
},
inStockcheck:(userId)=>{
    console.log(userId,"//");
    return new Promise(async(resolve,reject)=>{
        let stock= await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{
                    user:ObjectId(userId)
                }
            },
            {
                $unwind:'$product'
            },
            {
                $project:{
                    item:'$product.item',
                    // inStock:'$product.inStock'
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
        console.log(stock);
    })
},
getUserData:(userId)=>{
    // console.log(userId);
    return new  Promise(async(resolve,reject)=>{
        let Data=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId) })
        console.log(Data);
        if(Data){
            resolve(Data)
        }

    })
},
getOrderDetails:(userid)=>{
    // console.log("///////",userid);
    return new Promise(async(resolve,reject)=>{
        let Data= await db.get().collection(collection.ORDER_COLLECTION).find({userId:ObjectId(userid)}).sort( { "fullDate": -1} ).toArray()
        if(Data) resolve(Data)
        // let Data= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        //     {
        //         $match:{
        //             userId:ObjectId(userid)
        //         }
        //     },
        // ]).toArray()
        // console.log("///////////////",Data);
        })
},
cancelOrderSubmit:(orderId)=>{
    console.log(orderId);
    return new Promise(async(resolve,reject)=>{
        let fullOrder = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})

        for (let i = 0; i < fullOrder.cart.length; i++) {
          await db
            .get()
            .collection(collection.PRODUCT_COLLECTIONS)
            .updateOne(
              { _id: ObjectId(fullOrder.cart[i].item) },
              { $inc: { Stock: fullOrder.cart[i].quantity } }
            );
        }

        if(fullOrder.paymentMethod !=="COD"){
            let creditData={
                transactionId:ObjectId(),
               orderId:fullOrder._id,
               amount:fullOrder.totalAmount,
                amountCreditedOn:new Date().toDateString()
            }
            await db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:ObjectId(fullOrder.userId)},{
                $inc:{
                    total:fullOrder.totalAmount
                },
            
            $push:{
                "transactions.credits":creditData
            }
        })

        }

        
        

       let order= await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
            $set:{
                status: 'Cancelled',
                deliveryStatus: 'Cancelled',
                btnStatus: false,
            },
        })
        if(order){
            resolve(order)
        }else{
            reject()
        }
        
    })
},

returnOrderSubmit:(orderId)=>{

    return new Promise(async(resolve,reject)=>{
        // full Order details with all Product
        let fullOrder = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
        for(let i =0;i<fullOrder.cart.length;i++){
            // stock incrimenting 
          await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(fullOrder.cart[i].item)},{$inc:{Stock : fullOrder.cart[i].quantity}})
        }
        let creditData={
            transactionId:ObjectId(),
           orderId:fullOrder._id,
           amount:fullOrder.totalAmount,
            amountCreditedOn:new Date().toDateString()

        }


        await db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:ObjectId(fullOrder.userId)},{
            $inc:{
                total:fullOrder.totalAmount
            },
        
        $push:{
            "transactions.credits":creditData
        }
        })
        // updating status of return
        let order= await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
            $set:{
                status: 'returned',
                deliveryStatus: 'returned',
                btnStatus: false,
                returnOption:false,
                returnedDate: new Date().toDateString()
            },
        },{multi:true})
        if(order){
            resolve(order)
        }else{
            reject()
        }


    })
},

getWallet:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let total  = await db.get().collection(collection.WALLET_COLLECTION).findOne({userId:ObjectId(userId)})
        if(total){
            resolve(total)
        }else{
            reject()
        }
    })
},
debitFromWallet:(orderId,total,user)=>{
    let debitData={
        transactionId:ObjectId(),
       orderId:orderId,
       amount:total,
        amountDebitedOn:new Date().toDateString()

    }
    return new Promise(async(resolve,reject)=>{
       let wallet= await db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:ObjectId(user)},{
            $inc:{
                total:-total
            },
             $push:{
                "transactions.debits":debitData
            }
        })
        if(wallet){
            resolve(debitData.transactionId)
        }else{
            reject()
        }
    })
},

placeOrderTrans:async(order,transactionId,PaymentStatus,payment_method,ids,userId)=>{
        console.log(`paymetn motjog on trans ss  ${payment_method}`)
        let error
        let success
        return new Promise(async(resolve,reject)=>{
           const url=MONGODB

            mongoClient.connect(url, async function(err, client) {
              if (err) throw err;
              
              console.log("Connected to MongoDB database!");
            
              const session = client.startSession();
              const transactionOptions={
                readPreference:'primary',
                readConcern:{level:'local'},
                writeConcern:{w:'majority'}
            }
            try{
                let statuss 
                console.log("here");
                const transactionResults= await session.withTransaction(async()=>{
               
                    if(payment_method==="COD"){
                        statuss= "placed"
                    }else if(payment_method ==="wallet"){
                        if(transactionId!==null){
                            statuss= "placed"
                        }
                    } else if(payment_method ==="razorPay"){
                        console.log(`razor pay trans ${transactionId}`);
                        if(transactionId!==null){
                            statuss= "placed"
                        }
                    }
                    else if(payment_method ==="paypal"){
                        if(transactionId!==null){
                            statuss= "placed"
                        }
                    }
        
                    const orderUpdation = await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(order)},{
                        $set:{
                            status:statuss,
                            PaymentStatus:PaymentStatus,
                            transactionId:transactionId,
                        }
                    },{session})
        
        
        console.log(`status i s ${statuss}`);
                    if(statuss ==="placed"){
                        for(let i = 0;i<ids.length;i++){
                            await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(ids[i].prod)},{
                                    $inc: {Stock:-ids[i].quantity}, 
                                
                            },{session})   
        
                            await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(ids[i].prod)},[{
                                 $set:{inStock:{$cond:{if:{$lt:["$Stock",1]},then:false,else:true}}}, 
                            
                        }],{session})
        
                        }
        
                      let deletecart =  await  db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(userId)},{session})
                        console.log(`${deletecart.deletedCount} was /were deleted from cart collection `);
        
                    }else{
                        const orderCancelation = await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(order)},{
                            $set:{
                                status:"Cancelled",
                                PaymentStatus:"Payment not done ",
        
                            }
                        },{session})
                        console.log(`${orderCancelation.updatedCount} was/were cancelld due to transaction issues`);
                    }
                    
        
                },transactionOptions)
        
        
                if(transactionResults && statuss=="placed" ){
                    // console.log(transactionResults);
                    console.log(`transaction suceeded`);
                    return success = true
                }else if(transactionResults && statuss!="placed"){
                    console.log(`transaction not completed payment failed or other issue `);
                    error = `transaction not completed payment failed or other issue `
                    return error
                }
                else{
                    console.log(`transaction failed`)
                    error = `transaction failed`
                    return error
                }
            }
            catch(e){
                console.log(`${e}    error`);
            }
            finally{
                session.endSession()
                client.close()
                console.log(`session closed`);
                if(success){
                    console.log(success);
                    resolve (success)
                }else{
                    console.log(error);
                    reject (error)
                    console.log("erro retun com");
                }
            }
            })
        })
    
},

getSortedData:(option)=>{
    console.log("call is heere");
    console.log(option);
    if(option ==="low"){
        return new Promise(async(resolve,reject)=>{
            let data  = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().sort({ Price: 1 }).toArray()
            if(data){
                let datas={
                    all:data
                }
                resolve(datas)
            }else{
                console.log("entererd this reject");
                reject()
            }
        })
    }else if(option==='high'){
        return new Promise(async(resolve,reject)=>{
            let data  = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().sort({ Price: -1 }).toArray()
            if(data){
                let datas={
                    all:data
                }
                resolve(datas)
            }else{
                console.log("entererd this reject");
                reject()
            }
        })
    } else if(option==='aToz'){
        return new Promise(async(resolve,reject)=>{
            let data  = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().sort({ ProductName: 1 }).toArray()
            if(data){
                let datas={
                    all:data
                }
                resolve(datas)
            }else{
                console.log("entererd this reject");
                reject()
            }
        })
    } else if(option==='zToa'){
        return new Promise(async(resolve,reject)=>{
            let data  = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().sort({ ProductName: -1 }).toArray()
            if(data){
                let datas={
                    all:data
                }
                resolve(datas)
            }else{
                console.log("entererd this reject");
                reject()
            }
        })
}
}


}
