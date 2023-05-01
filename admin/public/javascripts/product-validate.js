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





const cooupenNameerr= document.getElementById('coupenName-error')
const coupenCoderr= document.getElementById('coupenCode-error')
const startDateerr= document.getElementById('startDate-error')
const endDateerr= document.getElementById('endDate-error')
const percentageerr= document.getElementById('percentage-error')
const amounterr= document.getElementById('amount-error')
const totalCoupenserr= document.getElementById('totalCoupens-error')
const minimumerr= document.getElementById('minimum-error')
const limiterr= document.getElementById('limit-error')



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
    const KeyWord1 = document.getElementById('Keyword1').value
    if(KeyWord1.length <=0){
        Keyword1error.innerHTML = 'KeyWord1 is required'
        return false
        }
        Keyword1error.innerHTML=''
        return true
}



function validatekeyWord2(){
    const KeyWord2 = document.getElementById('Keyword2').value
    if(KeyWord2.length <=0){
        Keyword2error.innerHTML = 'KeyWord2 is required'
        return false
        }
        Keyword2error.innerHTML=''
        return true
}


function validatekeyWord3(){
    const KeyWord3 = document.getElementById('Keyword3').value
    if(KeyWord3.length <=0){
        Keyword3error.innerHTML = 'KeyWord3 is required'
        return false
        }
        Keyword3error.innerHTML=''
        return true
}

function checkAll(){
    if( !validateName() || !validateMRP() || !validatePrice() || !validatemanufacturingDate() || !validateSize() || !validateColor() || !validateStock() || !validateDescription() || !validatekeyWord1() || !validatekeyWord2() || !validatekeyWord3() ){
        alert("if")
        let submiterr = document.getElementById('addProdsubm ').innerHTML='please provide all details' 
        return false
    }
    else{  
        alert("else")
        let submiterr = document.getElementById('addProdsubm ').innerHTML='' 
        return true
        }
}


function validateCoupenName(){
    let coupenName =document.getElementById('coupenName').value
    if(coupenName.length <=0){
        cooupenNameerr.innerHTML = 'coupenName is required'
        return false
        }
        cooupenNameerr.innerHTML=''
        return true
        
}
function validateCoupenCode(){
    let coupenName =document.getElementById('coupenCode').value
    if(coupencodee.length <=0){
        coupenCoderr.innerHTML = 'coupenCode is required'
        return false
        }
        coupenCoderr.innerHTML=''
        return true
        
}
function validatestartDate(){
    let startDate =document.getElementById('startDate').value
    if(startDate.length <=0){
        startDateerr.innerHTML = 'startDate is required'
        return false
        }
        startDateerr.innerHTML=''
        return true
        
}
function validateendDate(){
    let endDate =document.getElementById('endDate').value
    if(endDate.length <=0){
        endDateerr.innerHTML = 'endDate is required'
        return false
        }
        endDateerr.innerHTML=''
        return true
        
}
function validatePercentage(){
    let percentage =document.getElementById('percentage').value
    if(percentage.length <=0){
        percentageerr.innerHTML = 'percentage is required'
        return false
        }
        percentageerr.innerHTML=''
        return true
        
}

function validateAmount(){
    let amount =document.getElementById('amount').value
    if(amount.length <=0){
        amounterr.innerHTML = 'amount is required'
        return false
        }
        amounterr.innerHTML=''
        return true
        
}
function validateTotalCoupens(){
    let totalCoupens =document.getElementById('total_coupens').value
    if(totalCoupens.length <=0){
        totalCoupenserr.innerHTML = 'totalCoupens is required'
        return false
        }
        totalCoupenserr.innerHTML=''
        return true
        
}
function validateMinimum(){
    let minimum =document.getElementById('minimum').value
    if(minimum.length <=0){
        minimumerr.innerHTML = 'minimum is required'
        return false
        }
        minimumerr.innerHTML=''
        return true
        
}
function validateLimit(){
    let limit =document.getElementById('limit').value
    if(limit.length <=0){
        limiterr.innerHTML = 'limit is required'
        return false
        }
        limiterr.innerHTML=''
        return true
        
}