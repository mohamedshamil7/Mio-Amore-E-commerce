


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
                alert("product has been removed from cart")
                location.reload()
            }
            else{
                location.reload()
                document.getElementById(prodId).innerHTML=quantity+count
            }
        }

    })
}


