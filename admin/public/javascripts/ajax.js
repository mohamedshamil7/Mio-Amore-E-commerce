
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