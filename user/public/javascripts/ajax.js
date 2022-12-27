

function addToCart(prodId){
    $.ajax({
        url:' http://localhost:8001/user/addToCart/'+prodId,
        method:'get',
        success:(response)=>{
            alert(response)
        }
    })
}