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



function randomItem(arr){
return arr[Math.floor(Math.random()*arr.length)]
}



function generateProblem(){

let schema=DATABASES[currentDatabase].schema

let tables=Object.keys(schema)

let table=randomItem(tables)

let columns=schema[table]

let column=randomItem(columns)[0]

let task=randomItem(["max","count"])

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



function renderExpected(sql){

let res=db.exec(sql)

renderTable(res,"expected")

}



function runQuery(){

let sql=editor.getValue()

try{

let res=db.exec(sql)

renderTable(res,"output")

}catch(e){

document.getElementById("output").innerText=e.message

}

}



function submitQuery(){

try{

let user=db.exec(editor.getValue())
let sol=db.exec(currentProblem.solution)

let userRows=user[0]?.values
let solRows=sol[0]?.values

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



function changeDatabase(){

currentDatabase=document.getElementById("databaseSelector").value

loadProblem()

}



function nextProblem(){

loadProblem()

}



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



monaco.languages.registerCompletionItemProvider('sql',{

provideCompletionItems:()=>{

const suggestions=[

{label:'SELECT',kind:1,insertText:'SELECT '},
{label:'FROM',kind:1,insertText:'FROM '},
{label:'WHERE',kind:1,insertText:'WHERE '},
{label:'GROUP BY',kind:1,insertText:'GROUP BY '},
{label:'ORDER BY',kind:1,insertText:'ORDER BY '},
{label:'COUNT()',kind:2,insertText:'COUNT(*)'},
{label:'MAX()',kind:2,insertText:'MAX()'},
{label:'MIN()',kind:2,insertText:'MIN()'},
{label:'SUM()',kind:2,insertText:'SUM()'},
{label:'AVG()',kind:2,insertText:'AVG()'}

]

return{suggestions}

}

})

editor.addCommand(
monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
function(){runQuery()}
)

})

}



initSqlJs({
locateFile:file=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(function(SQLLib){

SQL=SQLLib

initEditor()

loadProblem()

})
