
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
        var update
        if(status=='true') update=false
        else update=true

        return new Promise(async(resolve,reject)=>{
           await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                $set:{
                    isBlocked:status
                }
            }).then(()=>{
                console.log();
                resolve()
            }).catch((err)=>{
                console.log(err);
            })
        })

    }
}