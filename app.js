/* ===============================
SMART SQL PRACTICE ENGINE
PHASE 1 : DATABASE GENERATOR
================================ */

let db
let editor
let SQL

let currentDatabase="ecommerce"

/* ===============================
DATABASE DEFINITIONS
================================ */

const DATABASES={

ecommerce:{
tables:{
customers:["id","name"],
orders:["id","customer_id","amount"],
products:["id","name","price"],
payments:["id","order_id","status"]
}
},

social:{
tables:{
users:["id","name"],
posts:["id","user_id","likes"],
comments:["id","post_id","user_id"]
}
},

hr:{
tables:{
employees:["id","name","salary","dept_id"],
departments:["id","name"]
}
}

}

/* ===============================
RANDOM DATA GENERATORS
================================ */

function randomName(){

const names=[
"Alice","Bob","David","Emma","Sophia",
"James","Daniel","Lucas","Olivia","Noah"
]

return names[Math.floor(Math.random()*names.length)]

}

function randomNumber(min,max){

return Math.floor(Math.random()*(max-min+1))+min

}

/* ===============================
BUILD DATABASE
================================ */

function buildDatabase(){

db=new SQL.Database()

let schema=DATABASES[currentDatabase].tables

for(let table in schema){

let columns=schema[table]

let columnSQL=columns.map(c=>c+" INT").join(",")

db.run(`CREATE TABLE ${table}(${columnSQL})`)

for(let i=1;i<=randomNumber(10,20);i++){

let values=[]

columns.forEach(col=>{

if(col==="id") values.push(i)
else if(col.includes("name")) values.push("'"+randomName()+"'")
else values.push(randomNumber(10,500))

})

db.run(`INSERT INTO ${table} VALUES(${values.join(",")})`)

}

}

renderSchema(schema)

}

/* ===============================
RENDER SCHEMA
================================ */

function renderSchema(schema){

let html=""

for(let table in schema){

html+=`<b>${table}</b>`

html+=`<table class="schema-table">`

html+=`<tr><th>Column</th></tr>`

schema[table].forEach(col=>{

html+=`<tr><td>${col}</td></tr>`

})

html+=`</table>`

}

document.getElementById("schema").innerHTML=html

}

/* ===============================
RUN QUERY
================================ */

function runQuery(){

let sql=editor.getValue()

try{

let res=db.exec(sql)

renderResult(res)

}catch(e){

document.getElementById("output").innerText=e.message

}

}

/* ===============================
RENDER RESULT
================================ */

function renderResult(res){

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

document.getElementById("output").innerHTML=html

}

/* ===============================
DATABASE SELECTOR
================================ */

function changeDatabase(){

currentDatabase=document.getElementById("dbSelector").value

buildDatabase()

}

/* ===============================
EDITOR
================================ */

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

/* ===============================
INIT
================================ */

initSqlJs({
locateFile:file=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(function(SQLLib){

SQL=SQLLib

buildDatabase()

initEditor()

})
