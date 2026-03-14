/* =========================================
SMART SQL PRACTICE ENGINE
AUTO QUESTION GENERATOR
========================================= */

let db
let editor
let SQL

let currentDatabase="ecommerce"
let currentProblem=null

/* =========================================
DATABASE DEFINITIONS
========================================= */

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

/* =========================================
QUESTION LOGIC TASKS
========================================= */

const TASKS=[

"find_max",
"find_min",
"count_rows",
"group_count"

]

/* =========================================
RANDOM HELPERS
========================================= */

function randomItem(arr){

return arr[Math.floor(Math.random()*arr.length)]

}

/* =========================================
PROBLEM GENERATOR
========================================= */

function generateProblem(){

let schema=DATABASES[currentDatabase].schema

let tables=Object.keys(schema)

let table=randomItem(tables)

let columns=schema[table]

let column=randomItem(columns)[0]

let task=randomItem(TASKS)

let question=""
let solution=""

/* MAX */

if(task==="find_max"){

question=`Find the highest value of ${column} from ${table}.`

solution=`SELECT MAX(${column}) FROM ${table}`

}

/* MIN */

if(task==="find_min"){

question=`Find the lowest value of ${column} from ${table}.`

solution=`SELECT MIN(${column}) FROM ${table}`

}

/* COUNT */

if(task==="count_rows"){

question=`Count total rows in the ${table} table.`

solution=`SELECT COUNT(*) FROM ${table}`

}

/* GROUP COUNT */

if(task==="group_count"){

question=`Count how many records exist for each ${column} in ${table}.`

solution=`SELECT ${column}, COUNT(*) 
FROM ${table}
GROUP BY ${column}`

}

return{
question,
solution
}

}

/* =========================================
LOAD PROBLEM
========================================= */

function loadProblem(){

db=new SQL.Database()

db.run(DATABASES[currentDatabase].setup)

currentProblem=generateProblem()

document.getElementById("description").innerText=currentProblem.question

renderSchema(DATABASES[currentDatabase].schema)

renderExpected(currentProblem.solution)

document.getElementById("output").innerHTML=""

}

/* =========================================
RENDER SCHEMA
========================================= */

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

/* =========================================
EXPECTED OUTPUT
========================================= */

function renderExpected(sql){

let res=db.exec(sql)

renderTable(res,"expected")

}

/* =========================================
RUN QUERY
========================================= */

function runQuery(){

let sql=editor.getValue()

try{

let res=db.exec(sql)

renderTable(res,"output")

}catch(e){

document.getElementById("output").innerText=e.message

}

}

/* =========================================
SUBMIT ANSWER
========================================= */

function submitQuery(){

try{

let user=db.exec(editor.getValue())
let sol=db.exec(currentProblem.solution)

if(JSON.stringify(user)===JSON.stringify(sol)){

alert("Correct Answer!")

loadProblem()

}else{

alert("Incorrect result")

}

}catch{

alert("SQL Error")

}

}

/* =========================================
TABLE RENDER
========================================= */

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

/* =========================================
DATABASE SWITCH
========================================= */

function changeDatabase(){

currentDatabase=document.getElementById("databaseSelector").value

loadProblem()

}

/* =========================================
EDITOR
========================================= */

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

/* =========================================
INIT
========================================= */

initSqlJs({
locateFile:file=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(function(SQLLib){

SQL=SQLLib

initEditor()

loadProblem()

})
