var db =require('../../dbconnections/dbConnection')
var collection =require('../../dbconnections/Collections')
const { ObjectId } = require('mongodb')
var bcrypt=require('bcrypt')
const Collections = require('../../dbconnections/Collections')

module.exports={
    adminLogin:(adminData)=>{
        console.log(adminData);
        return new Promise(async(resolve,reject)=>{
            let admin= await db.get().collection(collection.ADMIN_COLLECTION).findOne({adminname:adminData.adminname})            
             if(admin){
                bcrypt.compare(adminData.password,admin.password).then((result)=>{
                    if(result){
                        var adminData={
                            adminname:admin.adminname,
                            insertedId:admin._id
                        }
                        resolve(adminData)
                    }else{
                        reject()
                    }
                })
            }else{
                reject()
            }
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users= await db.get().collection(collection.USER_COLLECTION).find().toArray()
            if(users) resolve(users)
            else reject()
        })
    },
    userBlockManager:(userId,status)=>{
        console.log(status);
        var update
        if(status=="true")
         {
            update=false
            console.log(update)
        }
        else {
            update=true
            console.log(update)
    }

        return new Promise(async(resolve,reject)=>{
           await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                $set:{
                    isBlocked:update
                }
            }).then((response)=>{
                console.log(response);
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })

    },
    getAllStocks:()=>{
        return new Promise(async(resolve,reject)=>{
            let stocks= await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray()
            if(stocks){
                resolve(stocks)
            }else{
                reject()
            }

        })
    },

    addcategory:(datas)=>{
        console.log(datas);
        const data=datas.toLowerCase();
        return new Promise(async(resolve,reject)=>{
            let category =await db.get().collection(collection.CATTEGORY_COLLECTION).findOne({categoryName:data})
            console.log(category);
            if(category){
                return reject(category)
            }
            else{

                let newcat= await db.get().collection(collection.CATTEGORY_COLLECTION).insertOne({categoryName:data})
                console.log(newcat)

                if(newcat.insertedId){
                    resolve(newcat)
                } else{
                    reject()
                }
            }
        })
    },
    getAllCategories:()=>{
        return new Promise(async(resolve,reject)=>{
            let categories= db.get().collection(collection.CATTEGORY_COLLECTION).find().toArray()

            if(categories){
                resolve(categories)
            }
            else{
                reject(err)
            }
        })
    },
    deleteCategories:(Id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATTEGORY_COLLECTION).findOneAndDelete({_id:ObjectId(Id)}).then((response)=>{
                console.log(response);
                 db.get().collection(collection.PRODUCT_COLLECTIONS).updateMany({category:response.value.categoryName},{
                    $set:{
                        Availability:false
                    }
                 })
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    addNewProduct:(Data)=>{
        Data.Stock= Number(Data.Stock)
        Data.inStock= true
        return new Promise(async(resolve,reject)=>{
            let data= await db.get().collection(collection.PRODUCT_COLLECTIONS).insertOne(Data)
            if(data){
                id=data.insertedId
                console.log("idddd",id);
                resolve(id)
            }else{
                reject(data)
            }
        })
    },
    AvailProduct:(id,Availability)=>{
        console.log(id);
        console.log(Availability);
        let status
        return new Promise(async(resolve,reject)=>{
        if(Availability== "true"){
            status= false

        }else{
            status= true
        }

        await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(id)},{
            $set:{
                Availability:status
            }
        }).then((response)=>{
            console.log(response);
            resolve(response)
        }).catch((error)=>{
         reject(error)
        })

            
        })
    },
    getEditProduct:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let product= db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(id)})
            if(product) resolve(product)
            else reject()
    
        })
    },

    editProduct:(id)=>{
        console.log(">>>>");
        id.Stock=Number(id.Stock)
        if(id.Stock<1){
            console.log(id.Stock);
            console.log("false do");
            id.inStock=false
        }else if( id.Stock>=1){
            console.log(id.Stock);
            console.log("true ");
            id.inStock=true
        }
        return new Promise(async(resolve,reject)=>{
            let Product= await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(id)},{
                $set:{
                    ProductName:id.ProductName,
                    Company:id.Company,
                    Price:id.Price,
                    Description:id.Description,
                    category:id.category,
                    ManufacturingDate:id.ManufacturingDate,
                    COD:id.COD,
                    Stock :id.Stock,
                    inStock :id?.inStock,
                    Image1:id.Image1,
                    Image2:id.Image2,
                    Image3:id.Image3,
                    Image4:id.Image4,


                }
            })
            console.log("}}}}}}}}}}}}}}}}}}}}}}}}");
            if(Product) {
                console.log("??????????????????????????????",Product.insertedId);
                resolve(Product)
            }
            else {
                console.log("else wooo");
                reject()}
        })
    },

        fetchImage1:(prodId)=>{
            return new Promise(async(resolve,reject)=>{
                let data= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(prodId)},{projection:{Image1:true}})
                resolve(data.Image1)
            })
        },
        fetchImage2:(prodId)=>{
            return new Promise(async(resolve,reject)=>{
                let data= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(prodId)},{projection:{Image2:true}})
                resolve(data.Image2)
            })
        },
        fetchImage3:(prodId)=>{
            return new Promise(async(resolve,reject)=>{
                let data= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(prodId)},{projection:{Image3:true}})
                resolve(data.Image3)
            })
        },
        fetchImage4:(prodId)=>{
            return new Promise(async(resolve,reject)=>{
                let data= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(prodId)},{projection:{Image4:true}})
                resolve(data.Image4)
            })
        },

        getAllorders:()=>{
            // date not updated
            return new Promise(async(resolve,reject)=>{
                let allOrders =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $lookup:{
                            from:'user',
                            localField:'userId',
                            foreignField:'_id',
                            as:'user'
                        }
                    },
                    {
                        $unwind:'$user'
                    },
                    {
                        $project:{
                            'user.username':1,deleviryDetails:1,status:1,cart:1,totalAmount:1,paymentMethod:1, date:1, btnStatus:1,deliveryStatus:1
                        }
                    }
                ]).toArray()
                if(allOrders.length ==0){
                    reject()
                }
                else{
                    // console.log(allOrders.length);
                    console.log(allOrders);
                    resolve(allOrders)

                }
            })
        },

        cancelOrderAdminSubmit:(orderId)=>{
            return new Promise(async(resolve,reject)=>{
                let fullOrder = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
                for (let i = 0; i < fullOrder.cart.length; i++) {
                  await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne( { _id: ObjectId(fullOrder.cart[i].item) },
                      { $inc: { Stock: fullOrder.cart[i].quantity } }
                    );
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
              let order=  await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
                    $set:{
                        status:"Cancelled",
                        deliveryStatus: 'Cancelled',
                        btnStatus:false
                    }
                })
                if(order){
                    resolve(order)
                }else{
                    reject()
                }

            })
        },

        viewSingleOrder:(orderId)=>{
            return new Promise(async(resolve,reject)=>{
                const singleOrder = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
                if(singleOrder){
                    resolve(singleOrder)
                }else{
                    reject()
                }
            })
        },
        deliveryStatusChange:(orderId,dstatus)=>{
            console.log(dstatus);
            // let status
            let returnOption
            let deliveryDate= null
            if(dstatus==="Delivered"){
                // status:"Delivered",
                returnOption = true;
                cancelOption = false;
                deliveryDate = new Date().toDateString()
            }else{
                returnOption = false;
                cancelOption = true;

            }
            return new Promise(async(resolve,reject)=>{
           await db .get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId), },{
                    $set:{
                        // status:status,
                        deliveryStatus:dstatus,
                        returnOption:returnOption,
                        btnStatus: cancelOption,
                        deliveredDate:deliveryDate

                    },
                    
                }).then(()=>{  
                    resolve()
                }).catch(()=>{
                    reject()
                })
            })
        }
        
    }
    
    
  


    ///cart:{$elemMatch:{'item':ObjectId(prodId)}}