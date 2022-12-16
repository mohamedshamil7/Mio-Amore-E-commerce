
var db =require('../../dbconnections/dbConnection')
var collection =require('../../dbconnections/Collections')
const { resolve } = require("path")
const { ObjectId } = require('mongodb')


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

    }
}