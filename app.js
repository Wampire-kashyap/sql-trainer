let db
let editor
let SQL

let problems=[]
let currentIndex=0

/* DATABASE SCENARIOS */

const scenarios=[

{
name:"Social Media",

schema:[
["users","id INT, name TEXT"],
["posts","id INT, user_id INT, likes INT"]
],

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
q:"Find users with more than 1 post",
sql:`SELECT user_id, COUNT(*) AS total_posts
FROM posts
GROUP BY user_id
HAVING COUNT(*) > 1`
},

{
q:"Find most liked post",
sql:`SELECT * FROM posts
ORDER BY likes DESC
LIMIT 1`
}

]

},

{
name:"Ecommerce",

schema:[
["customers","id INT,name TEXT"],
["orders","id INT,customer_id INT,amount INT"]
],

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
sql:`SELECT MAX(amount) AS highest_order FROM orders`
},

{
q:"Count orders per customer",
sql:`SELECT customer_id, COUNT(*) AS total_orders
FROM orders
GROUP BY customer_id`
}

]

}

]

/* INIT SQL */

initSqlJs({
locateFile:file=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(function(SQLLib){

SQL=SQLLib

generateProblems()

loadProblem()

initEditor()

})

/* GENERATE PROBLEM LIST */

function generateProblems(){

scenarios.forEach(s=>{

s.questions.forEach(q=>{

problems.push({
scenario:s,
question:q.q,
solution:q.sql
})

})

})

}

/* LOAD PROBLEM */

function loadProblem(){

db=new SQL.Database()

let p=problems[currentIndex]

db.run(p.scenario.setup)

document.getElementById("description").innerText=p.question

renderSchema(p.scenario.schema)

renderExpected(p.solution)

document.getElementById("output").innerHTML=""

}

/* SCHEMA RENDER */

function renderSchema(schema){

let html=""

schema.forEach(table=>{

let tableName=table[0]
let columns=table[1].split(",")

html+=`<div class="schema-block">`
html+=`<h4>${tableName}</h4>`

html+=`<table class="schema-table">`
html+=`<tr><th>Column</th><th>Type</th></tr>`

columns.forEach(col=>{

let parts=col.trim().split(" ")

html+=`<tr>
<td>${parts[0]}</td>
<td>${parts[1]}</td>
</tr>`

})

html+=`</table></div>`

})

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

let p=problems[currentIndex]

try{

let user=db.exec(editor.getValue())
let sol=db.exec(p.solution)

if(JSON.stringify(user)===JSON.stringify(sol)){

alert("Correct!")

nextProblem()

}else{

alert("Incorrect result")

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

/* NAVIGATION */

function nextProblem(){

currentIndex++

if(currentIndex>=problems.length){

currentIndex=0

}

loadProblem()

}

function prevProblem(){

currentIndex--

if(currentIndex<0){

currentIndex=problems.length-1

}

loadProblem()

}

/* MONACO EDITOR */

function initEditor(){

require.config({
paths:{vs:'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs'}
})

require(['vs/editor/editor.main'],function(){

editor=monaco.editor.create(
document.getElementById('editor'),
{
value:"SELECT * FROM users;",
language:"sql",
theme:"vs",
automaticLayout:true
}
)

/* CTRL + ENTER */

editor.addCommand(
monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
function(){runQuery()}
)

/* AUTOCOMPLETE */

monaco.languages.registerCompletionItemProvider('sql',{
provideCompletionItems:()=>{

const keywords=[
"SELECT","FROM","WHERE","GROUP BY","ORDER BY",
"JOIN","LEFT JOIN","RIGHT JOIN","INNER JOIN",
"COUNT","SUM","AVG","MAX","MIN","LIMIT"
]

const suggestions=keywords.map(k=>({
label:k,
kind:monaco.languages.CompletionItemKind.Keyword,
insertText:k
}))

return {suggestions}

}
})

})

}
