const mongoClient=require('mongodb').MongoClient
const state ={
    db:null
}

module.exports.connect=function(done){
    const url='mongodb://127.0.0.1:27017'
    const dbname='project-MioAmore'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
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