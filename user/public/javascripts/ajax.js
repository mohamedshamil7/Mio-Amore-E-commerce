





function addToCart(prodId){
    $.ajax({
        url:' http://localhost:8001/user/addToCart/'+prodId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cartCount').html()
                count=parseInt(count)+1
                $('#cartCount').html(count)
            }
            // alert(response)  
        }
    })
};


// function wishlistCheck(prodId){
//     $.ajax({
//         url:"http://localhost:8001/user/addToWishlist/"+prodId,
//         method:'get',

//     })
// }

function quantityChange(cartId,prodId,count,quantity){
    
    count= parseInt(count) 
    quantity=parseInt(quantity)
    $.ajax({
        
        url:"http://localhost:8001/user/changeProductQuantity",
        data:{
            cart:cartId,
            product:prodId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            if(response.prodDelete){
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
            else{
                location.reload()
                document.getElementById(prodId).innerHTML=quantity+count
            }
        },
        error:(xhr, thrownError)=>{
            console.log("isdda")
            Swal.fire({
                icon: 'error',
                title: 'Stock Unavailable',
                text: 'Something went wrong!',
               
              })
        }

    })
};

function removeFromCart(prodId){
    // console.log(prodId)
    Swal.fire({
        title: 'Are you sure you want to delete this Product ?',
        // text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {

        if (result.isConfirmed) {
            $.ajax({
                url:"http://localhost:8001/user/removeCart",
                method:'post',
                data:{
                prodId
                },
                success:(response)=>{

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
            })
         
        }
      })

   
};


function loginwithOtp(){
    $.ajax({
        url:"http://localhost:8001/user/loginwithOtpPage",
        method:'get'
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
                url:"http://localhost:8001/user/cancelOrder",
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


function returnOrder(orderId){
    Swal.fire({
        title: 'Are you sure you want to return  this Order ?',
        // text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Return it!'
    }).then((result)=>{
        if(result.isConfirmed){
            console.log(orderId);
            $.ajax({
                url:"http://localhost:8001/user/returnOrder",
                method:'post',
                data:{
                    orderId
                },
                success:(response)=>{

                    Swal.fire({
                        icon: 'success',
                        title: 'Order Returned',
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


