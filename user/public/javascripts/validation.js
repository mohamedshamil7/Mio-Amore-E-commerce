
var nameError = document.getElementById('name-error');
var emailError = document.getElementById('email-error');
var phoneError = document.getElementById('phone-error');
var passwordError = document.getElementById('password-error');
var submitError = document.getElementById('submit-error');
var otpError = document.getElementById('otp-error')


function validateName(){
    var name=document.getElementById('username').value;
    if(name.length == 0){
        nameError.innerHTML='Fullname Required';
        return false
    }
    if(!name.match(/^[A-Za-z]/)){
        nameError.innerHTML='entername';
        return false
    }
    nameError.innerHTML=''
    return true
}
function validateEmail() {
    
    var email=document.getElementById('s-email').value;
    if(email.length == 0){
        emailError.innerHTML='Email is rquired'
        return false
    }
    if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)+$/)){
        emailError.innerHTML='enter valied email address'
        return false
    }
    emailError.innerHTML=''
    return true

}
function validatePhone() {
    
    var phone=document.getElementById('s-phone').value

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
function validatePhoneOtp(){
    var phoneOtp=document.getElementById('phonenumber_f').value
    if(phoneOtp.length == 0){
        phoneError.innerHTML='Phone number is required'
        return false
    }
    if(!phoneOtp.match(/^\d{10}$/)){
        phoneError.innerHTML='Enter valied Phone number'
        return false
    }
    phoneError.innerHTML=''
    return true
}
function passwordConfirmation() {
    var password1=document.getElementById('s-password1').value
    var password2=document.getElementById('s-password2').value
    if(password1 != password2){
        passwordError.innerHTML='Passwords do not match'
        return false
    }
    passwordError.innerHTML=''
}
function validatePassword(){
    var password=document.getElementById('s-password1').value
    if(password.length==0){
        passwordError.innerHTML='Enter Password'
        return false
    }
    passwordError.innerHTML=''
    return true
}
function validateOtp(){
    var otp= document.getElementById('userOtp').value
    if(otp.length==0){
        otpError.innerHTML='Enter Otp'
        return false
    }
    if(otp.length<6){
        otpError.innerHTML='Enter Valid  Otp'
        return false
    }
    otpError.innerHTML=''
    return true
}

