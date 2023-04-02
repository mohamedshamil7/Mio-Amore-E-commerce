
function deleteCategor(id){
console.log(id);
    Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
        $.ajax({
            url:' http://localhost:8001/admin/deleteCategory/'+id,
            method:'post',
            success:(response)=>{
                if(response.status){

                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted',
                        showConfirmButton: false,
                        timer: 1000
                      })
                      setTimeout(()=>{
                        location.reload()
                    },1000)
                    }
            }
        })
      
    }
  })
  
}

function deleteBrand(id){
  console.log("<<<<<<<<<<<<<",id);
      Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
          $.ajax({
              url:' http://localhost:8001/admin/deleteBrand/'+id,
              method:'post',
              success:(response)=>{
                  if(response.status){
  
                      
                      Swal.fire({
                          icon: 'success',
                          title: 'Deleted',
                          showConfirmButton: false,
                          timer: 1000
                        })
                        setTimeout(()=>{
                          location.reload()
                      },1000)
                      }
              }
          })
        
      }
    })
    
  }


function cancelOrder(orderId){
  Swal.fire({
      title: 'Are you sure you want to cancel  this Order ?',
      // text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!'
  }).then((result)=>{
      if(result.isConfirmed){
          console.log(orderId);
          $.ajax({
              url:"http://localhost:8001/admin/cancelOrder",
              method:'post',
              data:{
                  orderId
              },
              success:(response)=>{

                  Swal.fire({
                      icon: 'success',
                      title: 'Order Cancelled',
                      showConfirmButton: false,
                      timer: 1000
                    })
                    setTimeout(()=>{
                       location.reload()
                  },1000)
                  }
          })
      }
    })
}




function changeDeliveryStatus(orderid,status){
  console.log(orderid);
  console.log(status);
}

function addCategory (){
  const category = document.getElementById("newCategory").value
  $.ajax({
    url:"http://localhost:8001/admin/addCategory",
    method:'post',
    data:{
        category
    },
    success:(response)=>{

      Swal.fire({
          icon: 'success',
          title: 'new Category added',
          showConfirmButton: false,
          timer: 1000
        })
        setTimeout(()=>{
           location.reload()
      },1000)
      },
      error:(xhr, thrownError)=>{
        console.log("isdda")
        Swal.fire({
            icon: 'error',
            title: 'Category already exist',
            // text: 'Something went wrong!',
           
          })
    }

  })
}


function addBrand (){
  // const error = document.getElementById("")
  const brand = document.getElementById("newBrand").value
  if(brand.length==0){
    return error
  }
  $.ajax({
    url:"http://localhost:8001/admin/addBrand",
    method:'post',
    data:{
        brand
    },
    success:(response)=>{

      Swal.fire({
          icon: 'success',
          title: 'new Brand added',
          showConfirmButton: false,
          timer: 1000
        })
        setTimeout(()=>{
           location.reload()
      },1000)
      },
      error:(xhr, thrownError)=>{
        console.log("isdda")
        Swal.fire({
            icon: 'error',
            title: 'Brand already exist',
            // text: 'Something went wrong!',
           
          })
    }

  })
}

function sales(value){
  alert(value)
  $.ajax({
    url:"/admin/sales",
    data: {
      data:value
    },
    method:'post',
    success: () => {
      // alert(";")
      location.reload(); 
    },
  })
}




 function couponDelete(id){
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result)=>{
    if (result.isConfirmed) {
      $.ajax({
          url:' http://localhost:8001/admin/deletecoupon',
          method:'post',
          data:{
            id
          },
          success:(response)=>{
              if(response.status){

                  
                  Swal.fire({
                      icon: 'success',
                      title: 'Deleted',
                      showConfirmButton: false,
                      timer: 1000
                    })
                    setTimeout(()=>{
                      location.reload()
                  },1000)
                  }
          }
      })
    
  }
  })
 }



 
 function delivwerStatuschange(id){
  alert(id)
  let s = document.getElementById("select").value
 alert(s)

 $.ajax({
  url:"http://localhost:8001/admin/delivery-status",
  data:{
    id,
    status:s
  },
  method:"post",
  success:(response)=>{
    if(response.status){
      alert("true")
      location.reload()
    }else{alert("falese")}
  }
 })
 }


 function scheduleorder(orderId){
  alert(orderId)
  let date = document.getElementById('deliverydate').value
  alert(date)
    $.ajax({
    url:"http://localhost:8001/admin/deliveryDateSubmit",
    data:{orderId:orderId, deliveryDate:date},
    method:"post",
    success:(response)=>{
      if(response.err){
        alert(response.err)
        document.getElementById('DateError').innerHTML = response.err
      }else{
        // alert("something coming")
        Swal.fire({
          icon: 'success',
          title: 'order Scheduled',
          showConfirmButton: false,
          timer: 1000
        })
        setTimeout(()=>{
          location.href='http://localhost:8001/admin/allorders'
      },1000)
        
      }
    }
  })
 }

 

