var db =require('../../dbconnections/dbConnection')
var collection =require('../../dbconnections/Collections')
const { ObjectId } = require('mongodb')
var bcrypt=require('bcrypt')
const Collections = require('../../dbconnections/Collections')


const {S3Client, GetObjectCommand, DeleteBucketCorsCommand  } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const mongoClient=require('mongodb').MongoClient

const MONGODB=process.env.MONGODB

const MY_SECRET = process.env.MY_SECRET;

const bucketname = process.env.BUCKET_NAME

const bucketregion = process.env.BUCKET_REGION

const accesskey = process.env.ACCESS_KEY  

const accessSecret = process.env.ACCES_KEY_SECRET


const s3= new S3Client({
    // region: `${bucketregion}`,
    region:'ap-south-1',
    endpoint: 'https://s3.ap-south-1.amazonaws.com',
    // endpoint: `s3.${bucketregion}.amazonaws.com`,
    credentials:{
      accessKeyId: accesskey,
      secretAccessKey:accessSecret,
      
    },
  })


const getImgUrl= async(imgName)=>{
    const getObjectParams={
      Bucket:bucketname,
      Key:imgName
    }
  
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    // console.log(url);
    return url
  
  }

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

    getDailyOrder:()=>{
        // const currentDate = new Date().

        return new Promise(async(resolve,reject)=>{
            const order  = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{date:new Date().toDateString()}
                }
            ]).toArray()
            console.log("order daily",order);
            resolve(order)
        })
    },


    getWeeklyorder:()=>{
        return new Promise(async(resolve,reject)=>{
            const order = await db.get().collection(collection.ORDER_COLLECTION).find({
                $and:[
                    {fullDate:{$lte:new Date ()}},
                    {fullDate:{$gte:new Date(new Date().getDate()-7)}}
                ]
            }).toArray()
            resolve(order)
        })
    },
    getMonthlyorder:()=>{
        return new Promise(async(resolve,reject)=>{
            const order = await db.get().collection(collection.ORDER_COLLECTION).find({
                $and:[
                    {fullDate:{$lte:new Date ()}},
                    {fullDate:{$gte: new Date(new Date().getDate()-30)}}
                ]
            }).toArray()
            console.log(order,"mothly");
            resolve(order)
        })
    },
    getyearlyorder:()=>{
        return new Promise(async(resolve,reject)=>{
            const order = await db.get().collection(collection.ORDER_COLLECTION).find({
                $and:[
                    {fullDate:{$lte:new Date()}},
                    {fullDate:{$gte:new Date(new Date().getFullYear()-1)}}
                ]
            }).toArray()
            resolve(order)
        })
    },


    getDailyRevenue:()=>{
        const currentDate = new Date().toDateString();
        return new Promise(async (resolve, reject) => {
          const sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match: { date: currentDate },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$totalAmount' },
              },
            },
          ]).toArray();
          console.log(sales);
          if (sales.length !== 0) {
            resolve(sales[0].total);
          } else {
            resolve(0)
          }

        });
    },

    getWeeklyRevenue:()=>{
        return new Promise(async (resolve, reject) => {
            const sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [
                          { fullDate: { $lte: new Date() } },
                          { fullDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } }
                        ]
                      }
                  },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$totalAmount' },
                },
              },
            ]).toArray();
            if (sales.length !== 0) {
                resolve(sales[0].total);
              } else {
                resolve(0)
              }
          });
    },
    getMonthlyRevenue:()=>{
        console.log('monthly called');
        return new Promise(async (resolve, reject) => {
            const sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $match: {
                    $and: [
                      { fullDate: { $lte: new Date() } },
                      { fullDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } }
                    ]
                  }
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$totalAmount' },
                },
              },
            ]).toArray();
            if (sales.length !== 0) {
                resolve(sales[0].total);
              } else {
                resolve(0)
              }
          
          });
    },

    getYearlyRevenue:()=>{
        console.log('yearly called');
        return new Promise(async (resolve, reject) => {
            const sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $match: {
                    $and: [
                      { fullDate: { $lte: new Date() } },
                      { fullDate: { $gte: new Date(new Date().setFullYear(new Date().getDate() - 365)) } }
                    ]
                  }
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$totalAmount' },
                },
              },
            ]).toArray();
            if (sales.length !== 0) {
                resolve(sales[0].total);
              } else {
                resolve(0)
              }
          });
    },

    getchartCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let data={}
            data.COD = await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"COD"}).count()
            data.wallet = await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"wallet"}).count()
            data.razorPay = await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"razorPay"}).count()
            data.paypal = await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"paypal"}).count()
            // data.paypal = await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"paypal"}).count()
            resolve(data)
        })
    },
    getOrdersCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let data={}
            data.placed = await db.get().collection(collection.ORDER_COLLECTION).find({status:"placed"}).count()
            data.cancelled = await db.get().collection(collection.ORDER_COLLECTION).find({status:"Cancelled"}).count()
            data.returned = await db.get().collection(collection.ORDER_COLLECTION).find({ $or:[{status:"return confirmed"},{status:"return applied"}]}).count()
            data.delivered = await db.get().collection(collection.ORDER_COLLECTION).find({status:"Delivered"}).count()
            resolve(data)
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
           await db.get().collection(collection.USER_COLLECTION).updateOne({_id:new ObjectId(userId)},{
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
    addBrand:(brand)=>{
        return new Promise(async(resolve,reject)=>{
            let brands= await db.get().collection(collection.BRAND_COLLECTION).findOne({brandName:brand})
            if(brands){
                reject(brands)
            }else{
                let newbrand= await db.get().collection(collection.BRAND_COLLECTION).insertOne({brandName:brand})
                if(newbrand.insertedId){
                    resolve(newbrand)
                }else{
                    reject()
                }
            }
        })
    },
    deleteBrand:(id)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.BRAND_COLLECTION).findOneAndDelete({_id:new ObjectId(id)}).then((response)=>{
                resolve(response);
            }).catch(()=>{
                reject()
            })
        })
    },

    getAllBrands:()=>{
        return new Promise(async(resolve,reject)=>{
            let brands= await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
            if(brands){
                resolve(brands)
            }else{
                reject()
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
            db.get().collection(collection.CATTEGORY_COLLECTION).findOneAndDelete({_id:new ObjectId(Id)}).then((response)=>{
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
        Data.Availability=true
        Data.Price = Number(Data.Price)
        Data.offer = Number(Data.offer)
        Data.Variations = []
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

        await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(id)},{
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
            let product= db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:new ObjectId(id)})
            if(product) resolve(product)
            else reject()
    
        })
    },

    editProduct:(id)=>{
        console.log(">>>>");
        id.Price = Number(id.Price)
        id.MRP= Number(id.MRP)
        id.Stock=Number(id.Stock)
        id.offer = Number(id.offer)
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
            let Product= await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(id)},{
                $set:{
                    ProductName:id.ProductName,
                    Company:id.Company,
                    MRP:id.MRP,
                    Price:id.Price,
                    offer:id.offer,
                    Description:id.Description,
                    category:id.category,
                    ManufacturingDate:id.ManufacturingDate,
                    COD:id.COD,
                    Stock :id.Stock,
                    inStock :id?.inStock,
                    Image1:id?.Image1,
                    Image2:id?.Image2,
                    Image3:id?.Image3,
                    Image4:id?.Image4,
                    Size:id?.Size,
                    Color:id?.Color 


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
                let data= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:new ObjectId(prodId)},{projection:{Image1:true}})
                resolve(data.Image1)
            })
        },
        fetchImage2:(prodId)=>{
            return new Promise(async(resolve,reject)=>{
                let data= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:new  ObjectId(prodId)},{projection:{Image2:true}})
                resolve(data.Image2)
            })
        },
        fetchImage3:(prodId)=>{
            return new Promise(async(resolve,reject)=>{
                let data= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:new ObjectId(prodId)},{projection:{Image3:true}})
                resolve(data.Image3)
            })
        },
        fetchImage4:(prodId)=>{
            return new Promise(async(resolve,reject)=>{
                let data= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:new ObjectId(prodId)},{projection:{Image4:true}})
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
                            'user.username':1,deleviryDetails:1,status:1,cart:1,totalAmount:1,paymentMethod:1, date:1, btnStatus:1,deliveryStatus:1,returnplaced:1,deliveryScheduled:1,deliveredDate:1,
                        }
                    }
                ]).toArray()
                console.log("all orders:", allOrders);
                allOrders = allOrders.reverse()
                if(allOrders.length ==0){
                    console.log("0");
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
                let fullOrder = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:new ObjectId(orderId)})
                for (let i = 0; i < fullOrder.cart.length; i++) {
                  await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne( { _id:new  ObjectId(fullOrder.cart[i].item) },
                      { $inc: { Stock: fullOrder.cart[i].quantity } }
                    );
                }

                if(fullOrder.paymentMethod !=="COD"){
                    let creditData={
                        transactionId:new ObjectId(),
                       orderId:fullOrder._id,
                       amount:fullOrder.totalAmount,
                        amountCreditedOn:new Date().toDateString()
            
            
            
                    }
                     await db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:new ObjectId(fullOrder.userId)},{
                            $inc:{
                                total:fullOrder.totalAmount
                            },
                        
                        $push:{
                            "transactions.credits":creditData
                        }
                    })
                }
              
              let order=  await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new ObjectId(orderId)},{
                    $set:{
                        status: 'Cancelled',
                        deliveryStatus: 'Cancelled',
                        btnStatus: false,
                        orderCancelled:true
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
                const singleOrder = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:new ObjectId(orderId)})
                if(singleOrder){
                    console.log(singleOrder);
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
           await db .get().collection(collection.ORDER_COLLECTION).updateOne({_id:new ObjectId(orderId), },{
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
        },
        createCoupen:async(coupen)=>{
            coupen.startDate = new Date(coupen?.startDate);
            coupen.endDate = new Date(coupen.endDate);
            coupen.limit = parseInt(coupen?.limit);
            coupen.minimum = Number(coupen.minimum);
            coupen.total_coupens = Number(coupen.total_coupens);
            if (coupen.redeemType === "amount") {
              coupen.amount = Number(coupen?.amount);
            } else {
              coupen.percentage = Number(parseInt(coupen?.percentage));
            }

            console.log("copen",coupen);

            return new Promise(async(resolve,reject)=>{
               
                    let data={
                        type:"normal",
                        name:coupen.name,
                        code:coupen.code,
                        redeemType:coupen.redeemType,
                        percentage:coupen?.percentage,
                        amount:coupen?.amount,
                        totalCoupen:coupen.total_coupens,
                        maxLimit:coupen.limit,
                        minLimit:coupen.minimum,
                        startDate:coupen.startDate,
                        endDate:coupen.endDate,
                    }

                    let normalCoupen = await db.get().collection(collection.COUPEN_COLLECTION).insertOne(data)
                    if(normalCoupen){
                        console.log('normal');
                    }
                

                resolve()

            })
            
        },
        getAllCoupen:()=>{
            let coupens
            return new Promise(async(resolve,reject)=>{
                const normalCoupens = await db.get().collection(collection.COUPEN_COLLECTION).find({ type: 'normal' }).toArray();
                if (normalCoupens.length != 0 ) {
                    resolve({normalCoupens});
                  } else {
                    reject();
                  }
            })
        },
        deleteCoupen:(id)=>{
            return new Promise(async(resolve,reject)=>{
                const coupen =await  db.get().collection(collection.COUPEN_COLLECTION).findOneAndDelete({_id:new ObjectId(id)})
                if(coupen.value.type =='product'){
                    await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({coupenId:new ObjectId(coupen.value._id)},{
                        $unset:{offer:1,coupenId:1,offerPercent:1}
                    })
                }
                resolve()
            })
        }   ,
        deleteImage:(image,product,no)=>{
        
            return new Promise(async(resolve,reject)=>{
                if(no==="Image1"){
                    console.log(";;hereree");
                     await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(product)},{
                        $unset:{Image1:1}
                    })
                }
              else  if(no==="Image2"){
                    console.log(";;hereree");
                     await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(product)},{
                        $set:{Image2:''}
                    })
                }
               else if(no==="Image3"){
                    console.log(";;hereree");
                    await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(product)},{
                        $unset:{Image3:1}
                    })
                }
                else if(no==="Image4"){
                    console.log(";;hereree");
                     await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(product)},{
                        $unset:{Image4:1}
                    })
                }
                resolve()
            })
        },
        updateBanner1:(body)=>{
            console.log("it is here ta");
            return new Promise(async(resolve,reject)=>{
                if(body.linkTo ==="shop"){
                    let data= {
                        name:body.banner,
                       linkTo:'http://localhost:8001/user/shop',
                       img:body.img 
                    }
                    let ban= await db.get().collection(collection.BANNER_COLLECTION).insertOne(data)
                    if(ban.insertedId){
                        resolve()
                    }
                    else reject()
                }else{
                    console.log("entered else");
                    let data= {
                        name:body.banner,
                       linkTo:'http://localhost:8001/user/product/'+body.linkTo,
                       img:body.img 
                    }
                    let ban= await db.get().collection(collection.BANNER_COLLECTION).insertOne(data)
                    if(ban.insertedId){
                        resolve()
                    }
                    else reject()
                }
            })
        },
        updateBanner2:(body)=>{
            console.log("it is here ta");
            return new Promise(async(resolve,reject)=>{
                if(body.linkTo ==="shop"){
                    let data= {
                        name:body.banner,
                       linkTo:'http://localhost:8001/user/shop',
                       img:body.img 
                    }
                    let ban= await db.get().collection(collection.BANNER_COLLECTION).insertOne(data)
                    if(ban.insertedId){
                        resolve()
                    }
                    else reject()
                }else{
                    console.log("entered else");
                    let data= {
                        name:body.banner,
                       linkTo:'http://localhost:8001/user/product/'+body.linkTo,
                       img:body.img 
                    }
                    let ban= await db.get().collection(collection.BANNER_COLLECTION).insertOne(data)
                    if(ban.insertedId){
                        resolve()
                    }
                    else reject()
                }
            })
        },
        updateBanner3:(body)=>{
            console.log("it is here ta");
            return new Promise(async(resolve,reject)=>{
                if(body.linkTo ==="shop"){
                    let data= {
                        name:body.banner,
                       linkTo:'http://localhost:8001/user/shop',
                       img:body.img 
                    }
                    let ban= await db.get().collection(collection.BANNER_COLLECTION).insertOne(data)
                    if(ban.insertedId){
                        resolve()
                    }
                    else reject()
                }else{
                    console.log("entered else");
                    let data= {
                        name:body.banner,
                       linkTo:'http://localhost:8001/user/product/'+body.linkTo,
                       img:body.img 
                    }
                    let ban= await db.get().collection(collection.BANNER_COLLECTION).insertOne(data)
                    if(ban.insertedId){
                        resolve()
                    }
                    else reject()
                }
            })
        },
        getBanners:()=>{
            return new Promise(async(resolve,reject)=>{
                let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
                if(banners){
                    resolve(banners)
                }else{
                    reject()
                }
            })
        },
        delBanner:(banner)=>{
            return new Promise(async(resolve,reject)=>{
                let del =await db.get().collection(collection.BANNER_COLLECTION).deleteOne({name:banner})
                if(del){
                    resolve(del)
                }else{
                    reject()
                }
            })
        },
        confirmReturn: (orderId) => {
            console.log("orderid:",orderId);
            return new Promise(async (resolve, reject) => {

                const url=MONGODB

                mongoClient.connect(url, async function(err, client){
                    if (err) throw err;
              
                    console.log("Connected to MongoDB database!");
                  
                    const session = client.startSession();
                    const transactionOptions={
                      readPreference:'primary',
                      readConcern:{level:'local'},
                      writeConcern:{w:'majority'}
                  }

                  try{
                    const transactionResults= await session.withTransaction(async()=>{
                        let fullOrder = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id:new  ObjectId(orderId) },{session})

                        for (let i = 0; i < fullOrder.cart.length; i++) {
                            if(fullOrder.cart[i].varientId == fullOrder.cart[i].item){
                                await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(fullOrder.cart[i].item)},{$inc:{Stock : fullOrder.cart[i].quantity}},{session})      

                            }else{
                                let varint =  await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(fullOrder.cart[i].item)},{
                                    $inc: {'Variations.$[x].Data.$[j].Stock':fullOrder.cart[i].quantity}, 
                                
                            },{arrayFilters:[
                                {'j.id':new ObjectId(fullOrder.cart[i].varientId)},{'x.id':new ObjectId(fullOrder.cart[i].sizeId)}
                                ],session},
                                ) 

                                if(varint){
                                    console.log("varient kjdnas",varint);
                                }else{
                                    console.log(varint);
                                    console.log("noononononononononon");
                                }
                            }
                            // stock incrimenting 
                        }
                        
                        let creditData={
                            transactionId:new ObjectId(),
                            orderId:fullOrder._id,
                            amount:fullOrder.totalAmount,
                            amountCreditedOn:new Date().toDateString()
                            
                        }
                        
                        console.log("fullOrder:222",fullOrder.userId);
                    let wallet=   await db.get().collection(collection.WALLET_COLLECTION).updateOne({userId:new ObjectId(fullOrder.userId)},{
                           $inc:{
                                total:fullOrder.totalAmount
                            },
                        
                        $push:{
                            "transactions.credits":creditData
                        }
                        },{session})

                        console.log(wallet);

                        let order= await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new ObjectId(orderId)},{
                                $set:{
                                    status: 'return confirmed',
                                    deliveryStatus: 'returned',
                                    btnStatus: false,
                                    returnOption:false,
                                    returnplaced:false,
                                    returnConfirmed:true,
                                    returnedDate: new Date().toDateString()
                                },
                            })

                       


                        

                    },transactionOptions)

                    if(transactionResults){
                        console.log(`transaction suceeded`);
                        resolve()
                    }
                    else{
                        console.log(`trnascaction failed`);
                        reject()
                    }
                   
                  }
                  catch(e){
                    console.log(e);
                  }
                  finally{
                    session.endSession()
                    client.close()
                    console.log(`session closed`);
                  }
                })
        


            })
        },

        deliveryDateSubmit:(data)=>{
            let id = data.orderId
            let deliveyDate = data.deliveryDate
            return new Promise(async(resolve,reject)=>{
                let order = await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new ObjectId(id)},{
                    $set:{
                        deliveryStatus:deliveyDate,
                        deliveryScheduled:true,
                        scheduledDate:deliveyDate
                    }
                })

                if(order){
                    resolve(order)
                }else{
                    reject()
                }
            })
        },
        confirmDelivery:(orderId)=>{
          let   returnOption = true;
              let   cancelOption = false;
                let deliveryDate = new Date().toDateString()
            return new Promise(async(resolve,reject)=>{
           let delivery =   await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new ObjectId(orderId)},{
                    $set:{
                        status:"Delivered",
                        deliveryStatus:'Delivered',
                        returnOption:returnOption,
                        btnStatus: cancelOption,
                        deliveredDate:deliveryDate
                    },
                       $unset:{
                            deliveryScheduled:1
                        }
                    
                })
                if(delivery.modifiedCount==1){
                    console.log(delivery);
                    resolve(delivery)
                }else{reject()}
            })
        },

        getAllSales:()=>{
            return new Promise (async(resolve,reject)=>{
    let Sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{$or:[{deliveryStatus:"Delivered"},{returnConfirmed:true}]}
                    },
                ]).toArray()
                console.log(Sales);
                resolve(Sales)
            })
        },
        filterSale:(startdate,endDate)=>{
            return new Promise(async(resolve,reject)=>{
                const sales = await db.get().collection(collection.ORDER_COLLECTION).find({$or:[{deliveryStatus:"Delivered"},{returnConfirmed:true}],$and:[{ fullDate: { $lte: new Date(endDate) } },{ fullDate: { $gte: new Date(startdate) } }]}).toArray()
                if(sales){
                    resolve(sales)
                }else{
                    reject()
                }
            })
        },




        AddVariation:(data)=>{
            console.log(data.prodId);
            let  dataToInsert={
                id:new ObjectId(),
                color:data.Color,
                Price:data.Price,
                Stock:data.Stock,
                Size:data.Size,
                inStock:true
            }
            return new Promise(async(resolve,reject)=>{
           const product =   await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:new ObjectId(data.prodId), "Variations.Size": data.Size },)
                console.log(product);
           if(product !=null){

         console.log("entereeddddddd");
                // Size: " " exists, push data into it
           const ins=   await  db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(data.prodId), "Variations.Size": data.Size },
                  { $push: { "Variations.$.Data": dataToInsert } }, )
                console.log(ins,":ins");
                console.log("Variation size already there  and nee color inserted");
                resolve(ins)
           }else{
             let ins =   await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(data.prodId)},{
             $push:{Variations:{ id:new ObjectId(),Size:data.Size, Data:[dataToInsert]}}

            })
            console.log(ins,":ins") ;
            console.log("NO size already there  and new color inserted");
            resolve(ins)
           }
            })
        },


        getAllVariations:(prodId)=>{
            return new Promise(async(resolve,reject)=>{
                let vari =  await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([
                    {
                        $match:{
                            _id:new ObjectId(prodId)
                        }
                    },
                    {
                        $unwind: "$Variations"
                    },
                    {
                        '$unwind': {
                          'path': '$Variations.Data'
                        }
                    },
                    {
                        $project:{
                            _id:1, Variations:1
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

        VariationDelete:(data)=>{
            console.log(data.prodId);
            console.log(data.varId);
            return new Promise(async(resolve,reject)=>{
                let del = await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(data.prodId)},{
                    $pull:{"Variations.$[].Data":{id:new ObjectId(data.varId)}}
                })
                if(del){
                    console.log(del);
                    resolve(del)
                }else{
                    reject()
                }
            })
        },


        getSingleVariation:(prodId, variationId)=>{
            return new Promise(async(resolve,reject)=>{
                let vari =  await db.get().collection(collection.PRODUCT_COLLECTIONS).aggregate([
                    {
                        $match:{
                            _id:new ObjectId(prodId)
                        }
                    },
                    {
                        $unwind: "$Variations"
                    },
                    {
                        '$unwind': {
                          'path': '$Variations.Data'
                        }
                    },
                    {
                        $match:{
                            "Variations.Data.id":new ObjectId(variationId)
                        }
                    },
                    {
                        $group:{
                            _id:'$Variations'
                        }
                    },
                ]).toArray()
                console.log(";;;;;;vari",vari,"/////");
                if(vari){
                    resolve(vari[0])
                }else{
                    reject()
                }
            })
        },


        editVariation_submit:(data)=>{
            console.log(data.prodId);
            console.log(data.varId,";;;");
            console.log(data.dataId);
            let stock 
            data.Stock=Number(data.Stock)
            if( data.Stock>0){
                stock = true
            }else{
                stock = false
            }
            return new Promise(async(resolve,reject)=>{

                let edit = await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(data.prodId),},{

                    $set:{
                        // "Variations.$.Data.Id":ObjectId(data.varId),
                        'Variations.$[i].Data.$[j].color': data.Color,
                        'Variations.$[i].Data.$[j].Price': Number(data.Price),
                        'Variations.$[i].Data.$[j].Stock':data.Stock,
                        'Variations.$[i].Data.$[j].inStock':stock,
                        'Variations.$[i].Data.$[j].Size':data.Size,

                    }
                },{arrayFilters:[
                    {'j.id':new ObjectId(data.dataId)},{'i.id':new ObjectId(data.varId)}
                    ]}
                )
                if(edit){
                    console.log(edit);
                    resolve(edit)
                }else{
                    reject()
                }
            })
        }

    }
    
    
  


