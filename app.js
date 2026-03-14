let db
let editor
let SQL

let currentIndex=0
let currentDatabase="ecommerce"

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
`,

questions:[
{
q:"Find highest order amount",
sql:"SELECT MAX(amount) FROM orders"
},
{
q:"Count orders per customer",
sql:"SELECT customer_id,COUNT(*) FROM orders GROUP BY customer_id"
}
]

},

social:{

schema:{
users:[
["id","INT"],
["name","TEXT"]
],

posts:[
["id","INT"],
["user_id","INT"],
["likes","INT"]
]
},

setup:`
CREATE TABLE users(id INT,name TEXT);
INSERT INTO users VALUES
(1,'Alice'),
(2,'Bob'),
(3,'Charlie');

CREATE TABLE posts(id INT,user_id INT,likes INT);
INSERT INTO posts VALUES
(1,1,10),
(2,1,5),
(3,2,7),
(4,3,20);
`,

questions:[
{
q:"Find most liked post",
sql:"SELECT MAX(likes) FROM posts"
}
]

}

}

/* INIT */

initSqlJs({
locateFile:file=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(function(SQLLib){

SQL=SQLLib

initEditor()

loadProblem()

})

/* LOAD PROBLEM */

function loadProblem(){

let database=DATABASES[currentDatabase]

db=new SQL.Database()

db.run(database.setup)

let problem=database.questions[currentIndex]

document.getElementById("description").innerText=problem.q

renderSchema(database.schema)

renderExpected(problem.sql)

document.getElementById("output").innerHTML=""

}

/* RENDER SCHEMA */

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

let problem=DATABASES[currentDatabase].questions[currentIndex]

try{

let user=db.exec(editor.getValue())
let sol=db.exec(problem.sql)

if(JSON.stringify(user)===JSON.stringify(sol)){

alert("Correct")

nextProblem()

}else{

alert("Incorrect")

}

}catch{

alert("SQL Error")

}

}

/* RENDER TABLE */

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

/* NAVIGATION */

function nextProblem(){

currentIndex++

if(currentIndex>=DATABASES[currentDatabase].questions.length){

currentIndex=0

}

loadProblem()

}

function prevProblem(){

currentIndex--

if(currentIndex<0){

currentIndex=DATABASES[currentDatabase].questions.length-1

}

loadProblem()

}

/* DATABASE CHANGE */

function changeDatabase(){

currentDatabase=document.getElementById("databaseSelector").value

currentIndex=0

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
