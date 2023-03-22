const mongoClient=require('mongodb').MongoClient
require("dotenv").config();
const MONGODB=process.env.MONGODB
const state ={
    db:null
}
// module.exports.Client=mongoClient(url)
module.exports.connect=async function(done){
    const url='mongodb+srv://mohamedshamil0507:qwerty123@mioamore.dwam0rq.mongodb.net/?retryWrites=true&w=majority'
    const dbname='project-MioAmore'

     mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

module.exports.connectSession=async function(done){
    const url=MONGODB
    const dbname='project-MioAmore'

     mongoClient.connect(url,(err,client)=>{
        if(err) return client(err)

        const session = client.startSession();
        
    })
}

module.exports.get=()=>{
    return state.db
}







// const mongoClient=require('mongodb').MongoClient
// const state ={
//  db:null   
// }

// module.exports.connect=function(done){
//     const url='mongodb://localhost:27017'
//     const dbname='Project-MioAmore'

//     mongoClient.connect(url,(err,data)=>{
//         if(err) return done(err)
//         state.db=data.db(dbname)
//         done()  
//     })
    

// }

// module.exports.get=()=>{
//     return state.db
// }