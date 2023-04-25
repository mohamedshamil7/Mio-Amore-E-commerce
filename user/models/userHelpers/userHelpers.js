require("dotenv").config();
var db=require("../../../dbconnections/dbConnection")
var collection=require("../../../dbconnections/Collections")
const bcrypt=require("bcrypt")


const { ObjectId } = require("mongodb");

const mongoClient=require('mongodb').MongoClient

const crypto = require('crypto');

const MONGODB=process.env.MONGODB


require("dotenv").config();
const razorPay= require("razorpay");
const Key_ID=process.env.RAZORPAY_KEY_ID
const KEY_SECRET=process.env.RAZORPAY_KEY_SECRET
var instance =new razorPay({
    key_id:Key_ID,
   key_secret:KEY_SECRET
})



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

addToCart:(userId,data)=>{
    console.log(userId,":userId");
    console.log(data.prodId,":pro");
    console.log(data.varient,":var");
    console.log(data.sizeId,":size");
    let prodObj = {
            item: ObjectId(data.prodId),
            varientId:ObjectId(data.varient),
            sizeId:ObjectId(data.sizeId),
            quantity: 1,
          };

    return new Promise(async(resolve,reject)=>{
        let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)}) 
        console.log(userCart);
        if(userCart){
            // const proExist = userCart.books.findIndex((book) => book.item == proId);
           const  cart= userCart.product.findIndex(product=>{
                return product.varientId==data.varient
            })
            console.log(cart);

            if(cart !==-1){
                db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId),'product.varientId':ObjectId(data.varient)},{
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
    let total =0
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
                    quantity:'$product.quantity',
                    varientId:'$product.varientId',
                    sizeId:'$product.sizeId'

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
                    item:1,varientId:1,sizeId:1,quantity:1,cart_product:{$arrayElemAt:['$cart_product',0]}
                }
            },
           

        ]).toArray()
        if(cartItems){
            let outofStock= false
            console.log("workingggg");
         
            console.log(cartItems);
            for(let i=0;i<cartItems.length;i++){
                console.log(cartItems.length);
                if(cartItems[i].item.equals(cartItems[i].varientId)){
                    console.log("same");
                }else{
                    console.log(cartItems[i].item,"prod id");
                    console.log(cartItems[i].varientId,"var id");
                    console.log("enterd else");
                  let vari=  await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([
                        {
                            $match:{
                                _id:ObjectId(cartItems[i].item)
                            }
                        },
                        {
                            $project:{
                                Variations:1
                            }
                        },
                        {
                            $unwind:"$Variations"
                        },
                        {
                            $match:{
                                "Variations.id":ObjectId(cartItems[i].sizeId)
                            }
                        },
                        {
                            $unwind:'$Variations.Data'
                        },
                        {
                            $match:{
                                'Variations.Data.id':ObjectId (cartItems[i].varientId)
                            }
                        }

                        // {
                        //     $group:{
                        //         _id:'$Variations'
                        //     }
                        // },
                    ]).toArray()
                    console.log(vari,"THIS IS VART");
                    console.log(vari[0].Variations.Data);
                    cartItems[i].cart_product.Color = vari[0].Variations.Data.color,
                    cartItems[i].cart_product.Size = vari[0].Variations.Data.Size
                    cartItems[i].cart_product.Price = vari[0].Variations.Data.Price
                    cartItems[i].cart_product.inStock = vari[0].Variations.Data.inStock


                }
              
                console.log(cartItems[i].cart_product.inStock,"<<<<<<<<<");
                if(cartItems[i].cart_product.inStock==false){
                    console.log("hereeeere");
                    outofStock=true
                }
                console.log(typeof (cartItems[i].quantity),"qunatity" );
                console.log(typeof (cartItems[i].cart_product.Price) , "Price");
             total =  total+(cartItems[i].quantity * cartItems[i].cart_product.Price)   
            }
            console.log(outofStock);
            console.log(cartItems);
            console.log(total,"total>>>>>>>>>>>>>>>");
            let obj={
                cartItems:cartItems,
                outofStock:outofStock,
                total:total
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

removeCart:(userId,prodId,varientId)=>{
    console.log(userId);
    
    console.log("prodd>>>>>>>>>>>>>>>>>",prodId);
    return new Promise(async(resolve,reject)=>{
        let userCart= db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        if(userCart){
            db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},{
                $pull:{
                    product:{varientId:ObjectId(varientId)}
                }
            }) 
            resolve(userCart)
        }else{
            reject()
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

        if(data.product == data.varientId){

            let stock= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(data.product)})
            stock=stock.Stock

            if(stock<(quantity + count)){
                    console.log("entered reject");
                    return reject()
                }else{
                    if(count== -1 && quantity== 1 ){
                            await db.get().collection(collection.CART_COLLECTION).updateOne({$and:[{_id:ObjectId(data.cart)},{'product.varientId':ObjectId(data.varientId)}]},{
                                $pull:{
                                    product:{varientId:ObjectId(data.varientId)}
                                }
                            }).then(()=>{
                                resolve({prodDelete:true})
                            })
                        }else{
                                    await db.get().collection(collection.CART_COLLECTION).updateOne({$and:[{_id:ObjectId(data.cart)},{'product.varientId':ObjectId(data.varientId)}]},{
                                        $inc:{'product.$.quantity':count}  
                                    }).then(()=>{
                                        resolve(true)
                                    })
                                }
                }
        }else{
            console.log("not same");

            let stock= await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([
                {
                    $match:{
                        _id:ObjectId(data.product)
                    }
                },
                {
                    $project:{
                        Variations:1
                    }
                },
                {
                    $unwind:"$Variations"
                },
                {
                    $match:{
                        "Variations.id":ObjectId(data.sizeId)
                    }
                },
                {
                    $unwind:'$Variations.Data'
                },
                {
                    $match:{
                        'Variations.Data.id':ObjectId (data.varientId)
                    }
                }
            ]).toArray()
            console.log(stock);
            stock = stock[0].Variations.Data.Stock
             if(stock<(quantity + count)){
            console.log("entered reject");
            return reject()
                 }else{
                    if(count== -1 && quantity== 1 ){
                        await db.get().collection(collection.CART_COLLECTION).updateOne({$and:[{_id:ObjectId(data.cart)},{'product.varientId':ObjectId(data.varientId)}]},{
                            $pull:{
                                product:{varientId:ObjectId(data.varientId)}
                            }
                        }).then(()=>{
                            resolve({prodDelete:true})
                        })
                    }else{
                        await db.get().collection(collection.CART_COLLECTION).updateOne({$and:[{_id:ObjectId(data.cart)},{'product.varientId':ObjectId(data.varientId)}]},{
                            $inc:{'product.$.quantity':count}  
                        }).then(()=>{
                            resolve(true)
                        })
                    }
        
                }

        }



        // stock=stock.Stock
        // if(stock<(quantity + count)){
        //     console.log("entered reject");
        //     return reject()
        // }else{
            // if(count== -1 && quantity== 1 ){
            //     await db.get().collection(collection.CART_COLLECTION).updateOne({$and:[{_id:ObjectId(data.cart)},{'product.varientId':ObjectId(data.varientId)}]},{
            //         $pull:{
            //             product:{varientId:ObjectId(data.varientId)}
            //         }
            //     }).then(()=>{
            //         resolve({prodDelete:true})
            //     })
            // }else{
        //         await db.get().collection(collection.CART_COLLECTION).updateOne({$and:[{_id:ObjectId(data.cart)},{'product.varientId':ObjectId(data.varientId)}]},{
        //             $inc:{'product.$.quantity':count}  
        //         }).then(()=>{
        //             resolve(true)
        //         })
        //     }

        // }
       
       

    })

 

},
getTotalAmount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        const total = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: {
                user: ObjectId(userId),
              },
            },
            {
              $unwind: "$product",
            },
            {
              $project: {
                item: "$product.item",
                quantity: "$product.quantity",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTIONS,
                localField: "item",
                foreignField: "_id",
                as: "cart_product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                cart_product: { $arrayElemAt: ["$cart_product", 0] },
              },
            },
            // {
            //   $set: {
            //     final:{
            //         $switch:{
            //             branches:
            //             [{
            //                 case:{$and:['$cart_product.offer',{$ne:['$cart_product.Price','']}]},
            //                 then:'$cart_product.offer'
            //             },
            //             {
            //                 case:{$and:['$cart_product.Price',{$ne:['$cart_product.offer','']}]},
            //                 then:'$cart_product.Price'
            //             }
            //         ],
            //         default:''
            //         }
            //     }
            //   },
            // },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: [
                      { $toInt: "$quantity" },
                      { $toInt: "$cart_product.Price"},
                    ],
                  },
                },
              },
            },
          ])
          .toArray();
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
    let Coupen  
    let coupens
    console.log(`order.coupen code is ${order.Coupen_code}`);
    if(order.Coupen_code){
        Coupen = order.Coupen_code
    }

return new Promise(async(resolve,reject)=>{
console.log(order.PaymentOption);
let userId=  order.id
console.log(typeof userId);

     let order_status= 'pending'
    //bug chance...?????????????/////////////////////////////////
    if(Coupen){
         coupens= await db.get().collection(collection.COUPEN_COLLECTION).findOneAndUpdate({code:Coupen},{
           $inc: {totalCoupen:-1}
        })
        console.log("///////////////////////////",coupens);
        if(coupens) console.log(`coupen applied and and total couepen is updated`);
        let usersCoupen = await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
            $push:{usedcoupens:coupens.value._id}
        },{upsert:true})
    }   
     /////////////////////////////////////////
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
                orderCancelled:true
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
        // let fullOrder = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
        // for(let i =0;i<fullOrder.cart.length;i++){
        //     // stock incrimenting 
        //   await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(fullOrder.cart[i].item)},{$inc:{Stock : fullOrder.cart[i].quantity}})
        // }
        // let creditData={
        //     transactionId:ObjectId(),
        //    orderId:fullOrder._id,
        //    amount:fullOrder.totalAmount,
        //     amountCreditedOn:new Date().toDateString()

        // }


        // await db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:ObjectId(fullOrder.userId)},{
        //     $inc:{
        //         total:fullOrder.totalAmount
        //     },
        
        // $push:{
        //     "transactions.credits":creditData
        // }
        // })
        // updating status of return
        let status = "return applied"

        let order= await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
            $set:{
                status: status,
                btnStatus: false,
                returnplaced:true,
                returnOption:false,
            },
        })
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

                        console.log(` pay meth ${payment_method}`);
                        console.log(`razor pay trans ${transactionId}`);
                        if(transactionId!==null){
                            console.log("transiaction id is not null");
                            statuss= "placed"
                        }
                    }
                    else if(payment_method ==="paypal"){
                        if(transactionId!==null){
                            statuss= "placed"
                        }
                    }
                            console.log(statuss,"statussus");
                    const orderUpdation = await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(order)},{
                        $set:{
                            status:statuss,
                            PaymentStatus:PaymentStatus,
                            transactionId:transactionId,
                        }
                    },{session})
                    console.log(orderUpdation);
        
        
        console.log(`status i s ${statuss}`);
                    if(statuss ==="placed"){
                        for(let i = 0;i<ids.length;i++){
                            console.log(ids.length);
                            let prodId = ids[i].prodId.toString()
                            let varientId = ids[i].varientId.toString()
                            let sizeId = ids[i].sizeId.toString()
                            console.log(sizeId,">>>>> size udtrd");
                            if(prodId == varientId){
                                console.log("same");
                                await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(ids[i].prodId)},{
                                    $inc: {Stock:-ids[i].quantity}, 
                                
                                },{session})   
        
                                await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(ids[i].prodId)},[{
                                 $set:{inStock:{$cond:{if:{$lt:["$Stock",1]},then:false,else:true}}}, 
                            
                                 }],{session})
                            }else{
                                console.log("different");
                              let varint =  await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(ids[i].prodId)},{
                                    $inc: {'Variations.$[i].Data.$[j].Stock':-ids[i].quantity}, 
                                
                            },{arrayFilters:[
                                {'j.id':ObjectId(varientId)},{'i.id':ObjectId(sizeId)}
                                ],session},
                                ) 

                                if(varint){
                                    console.log("varient kjdnas",varint);
                                }else{
                                    console.log(varint);
                                    console.log("noononononononononon");
                                }
                              let varei1= await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(prodId)}, [
                                {
                                  $set: {
                                    Variations: {
                                      $map: {
                                        input: '$Variations',
                                        as: 'variation',
                                        in: {
                                          $mergeObjects: [
                                            '$$variation',
                                            {
                                              Data: {
                                                $map: {
                                                  input: '$$variation.Data',
                                                  as: 'data',
                                                  in: {
                                                    $cond: {
                                                      if: { $eq: ['$$data.id',ObjectId(varientId)] },
                                                      then: {
                                                        $mergeObjects: [
                                                          '$$data',
                                                          {
                                                            inStock: {
                                                              $cond: {
                                                                if: { $lt: ['$$data.Stock', 1] },
                                                                then: false,
                                                                else: true
                                                              }
                                                            }
                                                          }
                                                        ]
                                                      },
                                                      else: '$$data'
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          ]
                                        }
                                      }
                                    }
                                  }
                                }
                              ],{session})
                                
                                if(varei1){
                                    console.log("varie qwj ",varei1);
                                }
                            }
                            
                            
                            
                            
                            
                        }
                        
                        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
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
                console.log("entere catch ta");
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
},
getAllCategories:()=>{
    return new Promise(async(resolve,reject)=>{
        let categories= await  db.get().collection(collection.CATTEGORY_COLLECTION).find().toArray()

        if(categories){
            resolve(categories)
        }
        else{
            reject(err)
        }
    })
},
getfilteredCategory:(catname)=>{
    return new Promise(async(resolve,reject)=>{
        let categories= await db.get().collection(collection.PRODUCT_COLLECTIONS).find({category:catname}).toArray()

        if(categories){
            let datas={
                all:categories
            }
            resolve(datas)
        }
        else{
            reject(err)
        }
    })
},

findCoupen:(code,userid)=>{
    let Coupen
    let user
    return new Promise(async(resolve,reject)=>{
    Coupen = await db.get().collection(collection.COUPEN_COLLECTION).findOne({code:code})
     if(Coupen){
     user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userid),usedcoupens:Coupen._id})

     }
     console.log(user,"././,,,.");
      
        if (Coupen){
            if(user!==null){
                reject({err:"coupen already used"})
            }else{
                resolve(Coupen)
            }
        }else{
            reject({err:"Coupen Not Found"})
        }
    })
},

delAddress:(id,user)=>{
    console.log(id,"This is id");
    return new Promise(async(resolve,reject)=>{
      let del=  await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(user)},{
            $pull:{
                Address:{id:ObjectId(id)}
            }
        })
        if(del){
            console.log(`${del.modifiedCount} was/ were delted from user collection` );
            resolve()
            console.log(del);
        }
    })
},
getallBanners:()=>{
    return new Promise(async(resolve,reject)=>{
        let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
        if(banners){
            resolve(banners)
        }else{
            reject()
        }
    })
},
getAllCoupens:()=>{
    return new Promise(async(resolve,reject)=>{
       let normal = await db.get().collection(collection.COUPEN_COLLECTION).find().toArray()
       if(normal){
        resolve({normal})
       }else{
        reject()
       }
    })
},
searchProduct:(data)=>{
    return new Promise(async(resolve,reject)=>{
        const product = await db.get().collection(collection.PRODUCT_COLLECTIONS).find({ $text: { $search: data } }).toArray()
        if(product.length!=0){
            console.log(product);
            // resolve(product)
        }else{
            reject()
        }
    })
},
getsingleorderDetails:(orderId)=>{
    console.log(orderId);

    return new Promise(async(resolve,reject)=>{
        const data = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})

        if(data){
            console.log(data);
            resolve(data)
        }else{
            console.log("rejected");
            reject()
        }
    })
},

addReview:(userId,prodId,star,review)=>{
 let data={
    userId:ObjectId(userId) ,
    productId: ObjectId(prodId) ,
    rating:Number(star),
    review : review,
    date:new Date().toDateString()
 }
    return new Promise(async(resolve,reject)=>{
        let rev=await db.get().collection(collection.REVIEW_COLLECTION).insertOne(data)
        if(rev.insertedId){
            resolve(rev)
        }else{
            reject()
        }
    })
},

checkReview:(userId, prodId)=>{
    console.log(userId,"userId");
    console.log(prodId,"prodis");
    return new Promise(async(resolve,reject)=>{
        let data = await db.get().collection(collection.REVIEW_COLLECTION).findOne({ $and: [{ productId: ObjectId(prodId) }, { userId: ObjectId(userId) }] });
        if(data){
            reject()
        }else{
            resolve()
        }
    })
    
},
getAllReviews:(prodId)=>{
    return new Promise(async(resolve,reject)=>{

        let reviews = await db.get().collection(collection.REVIEW_COLLECTION).aggregate([
            {
                $match:{
                    productId:ObjectId(prodId)
                }
            },
                
                    {
                        $lookup:{
                            from:collection.USER_COLLECTION,
                            localField:"userId",
                            foreignField:"_id",
                            as:"users"
                        }
                    },
                    {
                        $unwind:"$users"
                    },
                    {
                        $project:{rating:1,review:1,date:1, "users.username": 1}
                    }
        ]).toArray()
      if(reviews){
        console.log("this are the reviews :",reviews);
        resolve(reviews)
      }else{
        reject()
      }
    })
},




getAllVariations:(prodId)=>{
    return new Promise(async(resolve,reject)=>{
        let vari =  await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([
            {
                $match:{
                    _id:ObjectId(prodId)
                }
            },
            {
                $unwind: "$Variations"
            },
            {
                '$unwind': {
                  'path': '$Variations.Data'
                }
            }
        ]).toArray()
        console.log(vari);
        if(vari){
            resolve(vari)
        }else{
            reject()
        }
    })
},

check_quantity:(userId,data)=>{

    return new Promise(async(resolve,reject)=>{
        // let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        // if(cart){
            //     console.log(cart);
            // }

            
            
            let cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{
                        user:ObjectId(userId)
                    }
                },
                {
                    $unwind:"$product"
                },
                {
                    $match:{
                        "product.varientId":ObjectId(data.varientId)
                    }
                },
                
              
                
            ]).toArray()
            if(cart.length!=0){
                reject(false)
            }else{
                resolve(true)
            }
        
        })
}


}
