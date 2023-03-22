const { response } = require("../../app")





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




// $(document.getElementById("placeorder_form")).submit((e)=>{
//     console.log(`payementMethod is clicked as ${payementMethod}`);
    
//     e.preventDefault()
//     console.log("called")
//              $.ajax({
//                  url:'http://localhost:8001/user/placeOrder',
//                  data:$('#placeorder_form').serialize(),
//                  method:'post',
//                  success:(response)=>{
//                     console.log("sucess");
//                  },
//                 //  success:(response )=> {
//                 //      if(response.status=="COD"){
//                 //          location.href="http://localhost:4000/orderSuccess"
//                 //      }   
//                 //      else   if(response.status=="wallet"){
//                 //          location.href="http://localhost:4000/orderSuccess"
//                 //      }
//                 //      else if(response.status=="razorpay") {
//                 //          console.log(response)
//                 //          razorpayPayment(response.response)
//                 //      }else if(response.status=='paypal'){
//                 //          window.location = response.forwardLink
 
 
//                 //      }
//                 //  },
//                   error:(xhr, thrownError)=>{
//                      console.log("isdda")
//                      Swal.fire({
//                  icon: 'error',
//                  title: 'Address Not Selected',
//                  text: 'Please Select one address',
                
//                })
//          }
//              })
//          })
 
        //  function razorpayPayment(order) {
            
        //      var options = {
        //          "key": "rzp_test_Sy2vxgrKq0I75D", // Enter the Key ID generated from the Dashboard
        //          "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        //          "currency": "INR",
        //          "name": "MIo Amore",
        //          "description": "Enjoy Fashion",
        //          "image": "http://localhost:4000/images/logopng.png",
        //          "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        //          "handler": function (response) {
        //              verifyPayment(response, order)
        //          },
        //          "prefill": {
        //              "name": "Mio Amore",
        //              "email": "Mioammore@gmail.com",
        //              "contact": "1234567890"
        //          },
        //          "notes": {
        //              "address": "Razorpay Corporate Office"
        //          },
        //          "theme": {
        //              "color": "#3399cc"
        //          },
        //          "modal": {
        //              "ondismiss": function () {
        //                  razorpayClose()
        //              }
        //          }
        //      };
             
        //      var rzp1 = new Razorpay(options);
        //      rzp1.on('payment.failed', function (response) {
        //          paymentFailed(response.error.description)
        //      });
        //      rzp1.open();
        //  }
 
 
        //  function verifyPayment(payment,order){
        //      console.log("entered verify")
        //      console.log(payment)
        //      console.log(order.receipt)
        //      $.ajax({
        //          url:'http://localhost:8001/user/verifyPayment',
        //          data:{
        //              payment,order
        //          },
        //          method:"post",
        // success:(response =>{
 
        //   if(response.status){
        //    location.href="http://localhost:8001/user/orderSuccess"
        //              }
 
        // })
 
        //      })
        //  }
         
