let db
let index=0
let pinned=[]

let questions=[

{
title:"Users older than 25",
difficulty:"easy",
description:"Find users with age greater than 25",
schema:"users(id,name,age)",
setup:`
CREATE TABLE users(id INT,name TEXT,age INT);
INSERT INTO users VALUES (1,'Alice',30);
INSERT INTO users VALUES (2,'Bob',20);
INSERT INTO users VALUES (3,'Charlie',28);
`,
solution:"SELECT * FROM users WHERE age>25"
},

{
title:"Count Orders",
difficulty:"easy",
description:"Count total orders",
schema:"orders(id,user_id)",
setup:`
CREATE TABLE orders(id INT,user_id INT);
INSERT INTO orders VALUES (1,1);
INSERT INTO orders VALUES (2,1);
INSERT INTO orders VALUES (3,2);
`,
solution:"SELECT COUNT(*) FROM orders"
}

]

initSqlJs({
locateFile:file=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(SQL=>{
window.SQL=SQL
loadQuestion()
})

function loadQuestion(){

db=new SQL.Database()

let q=questions[index]

db.run(q.setup)

document.getElementById("title").innerText=q.title
document.getElementById("description").innerText=q.description
document.getElementById("schema").innerText=q.schema

let diff=document.getElementById("difficulty")
diff.className="badge "+q.difficulty
diff.innerText=q.difficulty

renderSample()

}

function renderSample(){

let table=questions[index].schema.split("(")[0]

let res=db.exec(`SELECT * FROM ${table}`)

render(res)

}

function runSQL(){

let q=editor.getValue()

try{

let res=db.exec(q)

render(res)

}catch(e){

document.getElementById("output").innerText=e.message

}

}

function render(res){

let html=""

if(res.length){

let cols=res[0].columns
let rows=res[0].values

html+="<table border='1'>"

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

function submitQuery(){

let user=editor.getValue()

let correct=questions[index].solution

try{

let r1=db.exec(user)
let r2=db.exec(correct)

if(JSON.stringify(r1)==JSON.stringify(r2))
alert("Correct 🎉")
else
alert("Wrong")

}catch{

alert("SQL Error")

}

}

function next(){
if(index<questions.length-1){
index++
loadQuestion()
}
}

function prev(){
if(index>0){
index--
loadQuestion()
}
}

function pin(){
pinned.push(index)
alert("Pinned!")
}

require.config({
paths:{vs:'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs'}
})

require(['vs/editor/editor.main'],function(){

window.editor=monaco.editor.create(
document.getElementById('editor'),
{
value:"SELECT * FROM users;",
language:"sql",
theme:"vs-dark"
}
)

})
