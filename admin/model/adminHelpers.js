



var db =require('../../dbconnections/dbConnection')
var collection =require('../../dbconnections/Collections')
const { resolve } = require("path")
const { ObjectId } = require('mongodb')
const { reject, promiseAllSettled, explainStdin } = require('firebase-tools/lib/utils')
const { response } = require('../app')
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

                        resolve(result)
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

    addcategory:(data)=>{
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
            db.get().collection(collection.CATTEGORY_COLLECTION).deleteOne({_id:ObjectId(Id)}).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    addNewProduct:(Data)=>{

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
    deleteProduct:(id)=>{
        return new Promise(async(resolve,reject)=>{
       db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({_id:ObjectId(id)}).then((response)=>{
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
        // console.log(id);
        return new Promise(async(resolve,reject)=>{
            let Product= await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(id)},{
                $set:{
                    ProductName:id.ProductName,
                    Company:id.Company,
                    Price:id.Price,
                    Description:id.Description,
                    category:id.category,
                    ManufacturingDate:id.ManufacturingDate,
                    COD:id.COD


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
    }
}
