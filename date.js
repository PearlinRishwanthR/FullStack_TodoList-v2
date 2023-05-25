
const getDate = ()=>{
    let option = {
        weekday:'long', 
        year:'numeric', 
        month:'long', 
        day:'numeric'
    }
    let today = new Date();
    let day = today.toLocaleDateString("en-US",option);
    
    return day; 
}


module.exports = getDate;