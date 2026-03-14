function submitQuery(){

try{

let user=db.exec(editor.getValue())
let sol=db.exec(currentProblem.solution)

if(user.length===0 || sol.length===0){
alert("Incorrect")
return
}

let userRows=user[0].values
let solRows=sol[0].values

if(JSON.stringify(userRows)===JSON.stringify(solRows)){

alert("Correct!")
loadProblem()

}else{

alert("Incorrect")

}

}catch{

alert("SQL Error")

}

}
