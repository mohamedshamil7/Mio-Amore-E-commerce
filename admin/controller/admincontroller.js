




module.exports={
 renderadminLogin:(req,res)=>{
    res.render("adminView/adminlogin")
 },
 adminLoginRoute:(req,res,next)=>{
    let password="123"
    let username="sha"
    {(password==req.body.password && username==req.body.username)? next() : res.render("adminView/adminlogin",{error:"invalid username or password"})}
 },

 redirectAdminDash:(req,res)=>{
   res.redirect("/admin/adminDash")
 },
 renderadminDash:(req,res)=>{
   res.render("adminView/adminDash",{admin:true})
 }

}