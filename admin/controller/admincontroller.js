
const adminHelper= require('../model/adminHelpers')


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
 },

 AllUsersPage:(req,res)=>{
   adminHelper.getAllUsers().then((users)=>{
      // console.log(users);
      res.render('adminView/allUsers',{admin:true,users})
   })
 },
 userBlock:(req,res)=>{

  console.log(req.body.id);
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+req.body.isBlocked);

  adminHelper.userBlockManager(req.body.id,req.body.isBlocked).then((response)=>{
    console.log(response);
   console.log("block wroked ///////////////////////////////////////////");
   res.redirect('/admin/allUsers')
  })

 }

}