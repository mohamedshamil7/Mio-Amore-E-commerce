
var db =require('../../dbconnections/dbConnection')
var collection =require('../../dbconnections/Collections')
const { resolve } = require("path")
const { ObjectId } = require('mongodb')
const { reject } = require('firebase-tools/lib/utils')
const { response } = require('../app')


module.exports={
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

    addNewProduct:()=>{
        
    }
}