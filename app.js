let db
let currentLevel = 1

const tableTemplates = [

{
name:"customers",
columns:[
["id","INT"],
["name","TEXT"],
["city","TEXT"]
]
},

{
name:"orders",
columns:[
["id","INT"],
["customer_id","INT"],
["amount","INT"]
]
}

]

function generateDatabase(){

db = new SQL.Database()

db.run(`
CREATE TABLE customers(id INT,name TEXT,city TEXT);
INSERT INTO customers VALUES
(1,'Alice','NY'),
(2,'Bob','LA'),
(3,'Charlie','TX'),
(4,'David','NY');
`)

db.run(`
CREATE TABLE orders(id INT,customer_id INT,amount INT);
INSERT INTO orders VALUES
(1,1,200),
(2,1,300),
(3,2,150),
(4,3,400),
(5,3,250);
`)

}

function generateQuestion(){

if(currentLevel === 1){

return {
question:"Show all customers",
solution:"SELECT * FROM customers"
}

}

if(currentLevel === 2){

return {
question:"Find customers from NY",
solution:"SELECT * FROM customers WHERE city='NY'"
}

}

if(currentLevel === 3){

return {
question:"Count orders per customer",
solution:"SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id"
}

}

}

let currentProblem

function loadNewProblem(){

generateDatabase()

currentProblem = generateQuestion()

document.getElementById("description").innerText = currentProblem.question

renderSchema()

renderExpected()

}

function renderSchema(){

let html=""

tableTemplates[0].columns.forEach(c=>{
html+=`<tr><td>${c[0]}</td><td>${c[1]}</td></tr>`
})

document.getElementById("schema").innerHTML = html

}

function renderExpected(){

let res = db.exec(currentProblem.solution)

renderTable(res,"expected")

}

function runSQL(){

let query = editor.getValue()

try{

let res = db.exec(query)

renderTable(res,"output")

}catch(e){

document.getElementById("output").innerText = e.message

}

}

function submitQuery(){

let user = editor.getValue()

try{

let userRes = db.exec(user)
let solRes = db.exec(currentProblem.solution)

if(JSON.stringify(userRes) === JSON.stringify(solRes)){

alert("Correct!")

currentLevel++

loadNewProblem()

}else{

alert("Incorrect")

}

}catch{

alert("SQL Error")

}

}

function renderTable(res,target){

let html=""

if(res.length){

let cols=res[0].columns
let rows=res[0].values

html+="<table class='schema-table'>"

html+="<tr>"

cols.forEach(c=>html+=`<th>${c}</th>`)

html+="</tr>"

rows.forEach(r=>{

html+="<tr>"
r.forEach(v=>html+=`<td>${v}</td>`)
html+="</tr>"

})

html+="</table>"

}

document.getElementById(target).innerHTML = html

}

initSqlJs({
locateFile:file=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(SQL=>{
window.SQL = SQL
loadNewProblem()
})
