const express= require("express")
const gateway= require("fast-gateway")
const axios = require("axios")

const port=8001


const server=
 gateway(
    {
        routes:[{
            
            prefix:"/",
            target:"http://localhost:4000/"
        },
        {
            prefix:"/admin",
            target:"http://localhost:4001/"
        }
    
    
    ]
    }
)

server.get('/',(req,res)=>{
    res.send('gateway')
})

server.start(port).then(()=>{
    console.log(`gateway is running on ${port}`);
})