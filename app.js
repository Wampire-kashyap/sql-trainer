let db
let currentLevel = 1

let currentScenario
let currentProblem

/* -------------------------
DATABASE SCENARIOS
--------------------------*/

const scenarios = [

{
name:"social_media",

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

tables:[
["users","id INT, name TEXT"],
["posts","id INT, user_id INT, likes INT"]
],

questions:[

{
q:"Find users with more than 1 post",
sql:`SELECT user_id,COUNT(*) 
FROM posts 
GROUP BY user_id 
HAVING COUNT(*) > 1`
},

{
q:"Find post with highest likes",
sql:`SELECT * FROM posts 
ORDER BY likes DESC LIMIT 1`
}

]

},

{
name:"ecommerce",

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

tables:[
["customers","id INT,name TEXT"],
["orders","id INT,customer_id INT,amount INT"]
],

questions:[

{
q:"Find total orders per customer",
sql:`SELECT customer_id,COUNT(*) 
FROM orders 
GROUP BY customer_id`
},

{
q:"Find highest order amount",
sql:`SELECT MAX(amount) FROM orders`
}

]

}

]

/* -------------------------
LOAD NEW PROBLEM
--------------------------*/

function loadNewProblem(){

db = new SQL.Database()

currentScenario = scenarios[
Math.floor(Math.random()*scenarios.length)
]

db.run(currentScenario.setup)

currentProblem = currentScenario.questions[
Math.floor(Math.random()*currentScenario.questions.length)
]

document.getElementById("description").innerText =
currentProblem.q

renderSchema()

}

/* -------------------------
SCHEMA RENDER
--------------------------*/

function renderSchema(){

let html=""

currentScenario.tables.forEach(t=>{

html += `<tr>
<td>${t[0]}</td>
<td>${t[1]}</td>
</tr>`

})

document.getElementById("schema").innerHTML = html

}

/* -------------------------
RUN QUERY
--------------------------*/

function runSQL(){

let query = editor.getValue()

try{

let res = db.exec(query)

renderTable(res,"output")

}catch(e){

document.getElementById("output").innerText = e.message

}

}

/* -------------------------
VALIDATE QUERY
--------------------------*/

function submitQuery(){

let userQuery = editor.getValue()

try{

let userRes = db.exec(userQuery)
let solRes = db.exec(currentProblem.sql)

if(JSON.stringify(userRes) === JSON.stringify(solRes)){

alert("Correct!")

currentLevel++

loadNewProblem()

}else{

alert("Incorrect result")

}

}catch{

alert("SQL Error")

}

}

/* -------------------------
TABLE RENDER
--------------------------*/

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

/* -------------------------
INIT SQL
--------------------------*/

initSqlJs({
locateFile:file=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(SQL=>{
window.SQL = SQL
loadNewProblem()
})
