const ProductNameError = document.getElementById('ProductNameError')
const MRPerror = document.getElementById('mrp-error')
const PriceError = document.getElementById('Price-error')
const ManufacturingDateError = document.getElementById('ManufacturingDateError')
const Sizeerror = document.getElementById('Size-error')
const Colorerror = document.getElementById('Color-error')
const Stockerror = document.getElementById('Stock-error')
const Descriptionerror = document.getElementById('Description-error')
const Keyword1error = document.getElementById('Keyword1-error')
const Keyword2error = document.getElementById('Keyword2-error')
const Keyword3error = document.getElementById('Keyword3-error')


function validateName(){
    const ProductName = document.getElementById('ProductName').value
    if(ProductName.length <=0){
        ProductNameError.innerHTML = 'Product Name is required'
        return false
    }
    ProductNameError.innerHTML=''
    return true
}

function validateMRP(){
    const MRP = document.getElementById('MRP').value
    if(MRP.length <=0){
        MRPerror.innerHTML = 'MRP  is required'
        return false
    }
    if(typeof MRP =='number'){
        MRPerror.innerHTML = 'MRP  should be a number'
        return false

    }
    MRPerror.innerHTML=''
    return true
}


function validatePrice(){
    const Price = document.getElementById('Price').value
    if(Price.length <=0){
        PriceError.innerHTML = 'Price  is required'
        return false
    }
    if(typeof Price =='number'){
        PriceError.innerHTML = 'Price  should be a number'
        return false

    }
    PriceError.innerHTML=''
    return true
}

function validatemanufacturingDate(){
    const ManufacturingDate = document.getElementById('ManufacturingDate').value
    if(ManufacturingDate.length <=0){
        ManufacturingDateError.innerHTML = 'Manufacturing Date is required'
        return false
        }
        ManufacturingDateError.innerHTML=''
        return true
}

function validateSize(){
    const Size = document.getElementById('Size').value
    if(Size.length <=0){
        Sizeerror.innerHTML = 'Size is required'
        return false
        }
        Sizeerror.innerHTML=''
        return true
}


function validateColor(){
    const Color = document.getElementById('Color').value
    if(Color.length <=0){
        Colorerror.innerHTML = 'color is required'
        return false
        }
        Colorerror.innerHTML=''
        return true
}


function validateStock(){
    const Stock = document.getElementById('Stock').value
    if(Stock.length <=0){
        Stockerror.innerHTML = 'Description is required'
        return false
        }
        Stockerror.innerHTML=''
        return true
}

function validateDescription(){
    const Description = document.getElementById('Description').value
    if(Description.length <=0){
        Descriptionerror.innerHTML = 'Description  is required'
        return false
        }
        Descriptionerror.innerHTML=''
        return true

}

function validatekeyWord1(){
    const KeyWord1 = document.getElementById('KeyWord1').value
    if(KeyWord1.length <=0){
        Keyword1error.innerHTML = 'KeyWord1 is required'
        return false
        }
        Keyword1error.innerHTML=''
        return true
}



function validatekeyWord2(){
    const KeyWord2 = document.getElementById('KeyWord2').value
    if(KeyWord2.length <=0){
        Keyword2error.innerHTML = 'KeyWord2 is required'
        return false
        }
        Keyword2error.innerHTML=''
        return true
}


function validatekeyWord3(){
    const KeyWord3 = document.getElementById('KeyWord3').value
    if(KeyWord3.length <=0){
        Keyword3error.innerHTML = 'KeyWord3 is required'
        return false
        }
        Keyword3error.innerHTML=''
        return true
}

function checkAll(){
    if(validateName()|| validateMRP() || validatePrice() || validatemanufacturingDate() || validateSize() || validateColor() || validateStock() || validateDescription() ||validatekeyWord1() || validatekeyWord2() || validatekeyWord3() ){
        return true
    }
    else{   
        return false
        }
}