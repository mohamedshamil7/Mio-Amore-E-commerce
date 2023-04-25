let nameError = document.getElementById("name-error")
let phoneError = document.getElementById("phone-error")
let pinError   = document.getElementById("pin-error")
let landmarkError   = document.getElementById("landmark-error")
let addressError   = document.getElementById("address-error")
let townError   = document.getElementById("town-error")
let houseError   = document.getElementById("house-error")
let submitError = document.getElementById("submit-error")


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
    var pin = document.getElementById("pin").value
    if(pin.length < 6|| pin.length > 6){
        pinError.innerHTML='Enter valied pin '
        return false 
    }
    pinError.innerHTML=''
    return true

}
function validateHouse(){
    let houseNo = document.getElementById("houseNo").value
    if(houseNo.length<1){
        houseError.innerHTML='Enter valied House / Flat Number';
        return false
    }
    houseError.innerHTML=''
    return true
}
function validateLandmark(){
    let landmark = document.getElementById("landmarkad").value
    if(landmark.length<1){
        landmarkError.innerHTML='Enter valied landmark'
        return false
    }
    landmarkError.innerHTML=''
    return true
}

function validateAddress(){
    let address = document.getElementById("address").value
    if(address.length<1){
        addressError.innerHTML= "enter valid address"
        return false
    }
    addressError.innerHTML=''
    return true
}

function validateTown(){
    let town = document.getElementById("town").value
    if(town.length<1){
        townError.innerHTML= "enter valid town Name"
        return false
    }
    townError.innerHTML= ""
    return true
}

// function submitAdd(){
//     if(validateName ()!= true|| validatePhone() || validateAddress ()|| validateHouse () || validateLandmark () || validatePin() || validateTown ()){
//         submitError.innerHTML = "Please Enter Details"
//         return false
//     }
//     submitError.innerHTML = ""

//     return true
// }


$("#address_form").submit((e)=>{
    e.preventDefault()
    if(validateName()&& validatePhone() && validateHouse() && validateAddress() && validatePin() && validateLandmark() && validateTown()){
        $.ajax({
            url:'/addAddress',
            data:$('#address_form').serialize(),
            method:'post',
            success:(response)=>{
                window.location.reload()
            }
        })
    }else{
        submitError.innerHTML='Enter all Data required'
        return false
    }
})


$("#address_Prof_form").submit((e)=>{
    e.preventDefault()
    if(validateName()&& validatePhone() && validateHouse() && validateAddress() && validatePin() && validateLandmark() && validateTown()){
        $.ajax({
            url:'/addAddress',
            data:$('#address_Prof_form').serialize(),
            method:'post',
            success:(response)=>{
                window.location.reload()
            }
        })
    }else{
        submitError.innerHTML='Enter all Data required'
        return false
    }
})