let db
let editor
let SQL

let currentDatabase = "ecommerce"
let currentProblem = null


/* =========================
DATABASE DEFINITIONS
========================= */

const DATABASE_TEMPLATES = {

ecommerce:{
tables:{
customers:["id","name"],
orders:["id","customer_id","amount"],
products:["id","name","price"]
}
},

hr:{
tables:{
employees:["id","name","salary","dept_id"],
departments:["id","name"]
}
},

social:{
tables:{
users:["id","name"],
posts:["id","user_id","likes"],
comments:["id","post_id","user_id"]
}
}

}



/* =========================
RANDOM HELPERS
========================= */

function rand(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}

function pick(arr){
return arr[rand(0,arr.length-1)]
}



/* =========================
DATABASE GENERATOR
========================= */

function generateDatabase(){

let template = DATABASE_TEMPLATES[currentDatabase]

db = new SQL.Database()

let schemaHTML=""

for(let table in template.tables){

let cols = template.tables[table]

let createSQL = `CREATE TABLE ${table}(`

cols.forEach((c,i)=>{

createSQL += `${c} INT`

if(c==="name") createSQL = createSQL.replace("INT","TEXT")

if(i<cols.length-1) createSQL+=","

})

createSQL+=");"

db.run(createSQL)



/* insert random rows */

let rows = rand(10,30)

for(let i=1;i<=rows;i++){

let values=[]

cols.forEach(col=>{

if(col==="id") values.push(i)

else if(col.includes("name")) values.push(`'User${rand(1,999)}'`)

else values.push(rand(10,500))

})

db.run(`INSERT INTO ${table} VALUES(${values.join(",")})`)

}



/* render schema */

schemaHTML+=`<b>${table}</b>`
schemaHTML+=`<table class="schema-table">`
schemaHTML+=`<tr><th>Column</th></tr>`

cols.forEach(c=>{
schemaHTML+=`<tr><td>${c}</td></tr>`
})

schemaHTML+=`</table>`

}

document.getElementById("schema").innerHTML=schemaHTML

}



/* =========================
QUESTION ENGINE
========================= */

const QUESTION_TEMPLATES=[

{
difficulty:"easy",
question:(table,col)=>`Find highest ${col} in ${table}`,
solution:(table,col)=>`SELECT MAX(${col}) FROM ${table}`,
hint:"Use MAX() aggregate function"
},

{
difficulty:"easy",
question:(table)=>`Count rows in ${table}`,
solution:(table)=>`SELECT COUNT(*) FROM ${table}`,
hint:"Use COUNT(*)"
},

{
difficulty:"medium",
question:(table,col)=>`Find average ${col} from ${table}`,
solution:(table,col)=>`SELECT AVG(${col}) FROM ${table}`,
hint:"Use AVG()"
},

{
difficulty:"medium",
question:(table,col)=>`Find top 3 ${col} values`,
solution:(table,col)=>`SELECT ${col} FROM ${table} ORDER BY ${col} DESC LIMIT 3`,
hint:"Use ORDER BY + LIMIT"
}

]



/* =========================
PROBLEM GENERATOR
========================= */

function generateProblem(){

let template = DATABASE_TEMPLATES[currentDatabase]

let tables = Object.keys(template.tables)

let table = pick(tables)

let columns = template.tables[table]

let column = pick(columns)

let q = pick(QUESTION_TEMPLATES)

let question = q.question(table,column)
let solution = q.solution(table,column)

currentProblem={
question,
solution,
hint:q.hint,
difficulty:q.difficulty
}

document.getElementById("description").innerHTML=
`${question} <br><small>Difficulty: ${q.difficulty}</small>`

renderExpected(solution)

}



/* =========================
EXPECTED OUTPUT
========================= */

function renderExpected(sql){

let res=db.exec(sql)

renderTable(res,"expected")

}



/* =========================
RUN QUERY
========================= */

function runQuery(){

let sql=editor.getValue()

try{

let res=db.exec(sql)

renderTable(res,"output")

}catch(e){

document.getElementById("output").innerText=e.message

}

}



/* =========================
SUBMIT
========================= */

function submitQuery(){

try{

let user=db.exec(editor.getValue())
let sol=db.exec(currentProblem.solution)

let userRows=user[0]?.values
let solRows=sol[0]?.values

if(JSON.stringify(userRows)===JSON.stringify(solRows)){

alert("Correct!")

nextProblem()

}else{

alert("Incorrect. Hint: "+currentProblem.hint)

}

}catch{

alert("SQL Error")

}

}



/* =========================
TABLE RENDER
========================= */

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



/* =========================
NEXT QUESTION
========================= */

function nextProblem(){

generateDatabase()

generateProblem()

}



/* =========================
DATABASE SWITCH
========================= */

function changeDatabase(){

currentDatabase=document.getElementById("databaseSelector").value

nextProblem()

}



/* =========================
EDITOR
========================= */

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



/* =========================
INIT
========================= */

initSqlJs({
locateFile:file=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(function(SQLLib){

SQL=SQLLib

initEditor()

nextProblem()

})
