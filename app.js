let db
let editor
let SQL

let currentDatabase="ecommerce"
let currentProblem=null

const DATABASES={

ecommerce:{

schema:{
customers:[
["id","INT"],
["name","TEXT"]
],

orders:[
["id","INT"],
["customer_id","INT"],
["amount","INT"]
]
},

setup:`
CREATE TABLE customers(id INT,name TEXT);
INSERT INTO customers VALUES
(1,'Alice'),
(2,'Bob'),
(3,'Charlie');

CREATE TABLE orders(id INT,customer_id INT,amount INT);
INSERT INTO orders VALUES
(1,1,200),
(2,1,300),
(3,2,150),
(4,3,500);
`
},

hr:{

schema:{
employees:[
["id","INT"],
["name","TEXT"],
["salary","INT"],
["dept_id","INT"]
],

departments:[
["id","INT"],
["name","TEXT"]
]
},

setup:`
CREATE TABLE employees(id INT,name TEXT,salary INT,dept_id INT);
INSERT INTO employees VALUES
(1,'Alice',72000,1),
(2,'Bob',65000,1),
(3,'David',88000,2),
(4,'Emma',91000,3);

CREATE TABLE departments(id INT,name TEXT);
INSERT INTO departments VALUES
(1,'Engineering'),
(2,'Sales'),
(3,'Marketing');
`
}

}


/* RANDOM HELPER */

function randomItem(arr){
return arr[Math.floor(Math.random()*arr.length)]
}


/* QUESTION GENERATOR */

function generateProblem(){

let schema=DATABASES[currentDatabase].schema

let tables=Object.keys(schema)

let table=randomItem(tables)

let columns=schema[table]

let column=randomItem(columns)[0]

let tasks=["max","count"]

let task=randomItem(tasks)

let question=""
let solution=""

if(task==="max"){

question=`Find highest ${column} from ${table}`

solution=`SELECT MAX(${column}) FROM ${table}`

}

if(task==="count"){

question=`Count rows in ${table}`

solution=`SELECT COUNT(*) FROM ${table}`

}

return{
question,
solution
}

}


/* LOAD PROBLEM */

function loadProblem(){

let dbInfo=DATABASES[currentDatabase]

db=new SQL.Database()

db.run(dbInfo.setup)

currentProblem=generateProblem()

document.getElementById("description").innerText=currentProblem.question

renderSchema(dbInfo.schema)

renderExpected(currentProblem.solution)

document.getElementById("output").innerHTML=""

}


/* SCHEMA RENDER */

function renderSchema(schema){

let html=""

for(let table in schema){

html+=`<b>${table}</b>`

html+=`<table class="schema-table">`

html+=`<tr><th>Column</th><th>Type</th></tr>`

schema[table].forEach(col=>{

html+=`<tr>
<td>${col[0]}</td>
<td>${col[1]}</td>
</tr>`

})

html+=`</table>`

}

document.getElementById("schema").innerHTML=html

}


/* EXPECTED OUTPUT */

function renderExpected(sql){

let res=db.exec(sql)

renderTable(res,"expected")

}


/* RUN QUERY */

function runQuery(){

let sql=editor.getValue()

try{

let res=db.exec(sql)

renderTable(res,"output")

}catch(e){

document.getElementById("output").innerText=e.message

}

}


/* SUBMIT */

function submitQuery(){

try{

let user=db.exec(editor.getValue())

let sol=db.exec(currentProblem.solution)

if(JSON.stringify(user)===JSON.stringify(sol)){

alert("Correct!")

loadProblem()

}else{

alert("Incorrect")

}

}catch{

alert("SQL Error")

}

}


/* TABLE RENDER */

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

document.getElementById(target).innerHTML=html

}


/* DATABASE CHANGE */

function changeDatabase(){

currentDatabase=document.getElementById("databaseSelector").value

loadProblem()

}


/* NEXT */

function nextProblem(){

loadProblem()

}


/* EDITOR */

function initEditor(){

require.config({
paths:{vs:'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs'}
})

require(['vs/editor/editor.main'],function(){

editor=monaco.editor.create(
document.getElementById('editor'),
{
value:"SELECT * FROM customers;",
language:"sql",
theme:"vs",
automaticLayout:true
}
)

editor.addCommand(
monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
function(){runQuery()}
)

})

}


/* INIT */

initSqlJs({
locateFile:file=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(function(SQLLib){

SQL=SQLLib

initEditor()

loadProblem()

})
