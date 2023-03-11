let nameError = document.getElementById("name-error")
let phoneError = document.getElementById("phone-error")
let pinError   = document.getElementById("pin-error")
let houseError   = document.getElementById("house-error")
let landmarkError   = document.getElementById("landmark-error")
let addressError   = document.getElementById("address-error")
let townError   = document.getElementById("town-error")


function validateName(){
    let name = document.getElementById("fname").value
    if(name.length == 0){
        nameError.innerHTML='Fullname Required';
        return false
    }
    if(!name.match(/^(?!-)[a-zA-Z-]/)){
        nameError.innerHTML='entername';
        return false
    }
    nameError.innerHTML=''
    return true
}

function validatePhone(){
    var phone=document.getElementById('mobile').value
    if(phone.length == 0){
        phoneError.innerHTML='Phone number is required'
        return false
    }
    if(!phone.match(/^\d{10}$/)){
        phoneError.innerHTML='Enter valied Phone number'
        return false
    }
    phoneError.innerHTML=''
    return true
}

function validatePin(){
    var pin   = document.getElementById("pin").value
    if(pin.length< 6){
        pinError.innerHTML='Enter valied pin '
        return false 
    }
    pinError.innerHTML=''
    return true

}
function validateHouse(){
    let houseNo = document.getElementById("houseNo").value
    if(houseNo.length<0){
        houseError.innerHTML='Enter valied House / Flat Number'
    }
    houseError.innerHTML=''
    return true
}
function validateLandmark(){
    let landmark = document.getElementById("landmarkad").value
    if(landmark.length<0){
        landmarkError.innerHTML='Enter valied landmark'
    }
    landmarkError.innerHTML=''
    return true
}

function validateAddress(){
    let address = document.getElementById("useradd").value
    if(address.length==0){
        addressError.innerHTML= "enter valid address"
        return false
    }
    addressError.innerHTML=''
    return true
}

function validateTown(){
    let town = document.getElementById("town").value
    if(town.length<1){
        town.innerHTML= "enter valid town Name"
        return false
    }
    townError.innerHTML= ""
    return true
}

// function validateSubmit(){

// }