
function deleteCategor(id){
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
            url:' /admin/deleteCategory/'+id,
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
              url:' /admin/deleteBrand/'+id,
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
              url:"/admin/cancelOrder",
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


function addCategory (){
  const category = document.getElementById("newCategory").value
  category= category.trim()
  if(category.length<=0){
    document.getElementById('cat-error').innerHTML='please add Value '
    return 
  }
  $.ajax({
    url:"/admin/addCategory",
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
  brand= brand.trim()
  if(brand.length==0){
    document.getElementById('brand-error').innerHTML='please add Value '

    return 
  }
  $.ajax({
    url:"/admin/addBrand",
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
        url:' /admin/deletecoupon',
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
  let s = document.getElementById("select").value
  
  $.ajax({
    url:"/admin/delivery-status",
    data:{
      id,
      status:s
    },
    method:"post",
    success:(response)=>{
      if(response.status){
        location.reload()
      }else{}
    }
  })
}


function scheduleorder(orderId){

  let date = document.getElementById('deliverydate').value
  if(date.length<=0){
    return    document.getElementById('DateError').innerHTML = "enter a date"

  }
  $.ajax({
    url:"/admin/deliveryDateSubmit",
    data:{orderId:orderId, deliveryDate:date},
    method:"post",
    success:(response)=>{
      if(response.err){

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
          location.href='/admin/allorders'
        },1000)
        
      }
    }
  })
}




// $.ajax({
//   url:"/admin/sales",
//   data: {
//     data:value
//   },
//   method:'post',
//   success: (resp) => {
//     alert(resp)
//     alert(";")
//     location.reload(); 
//   },
// })