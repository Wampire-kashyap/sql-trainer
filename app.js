let db
let editor
let currentProblem
let currentScenario
let problemIndex = 0

/* -----------------------
DATABASE SCENARIOS
-----------------------*/

const scenarios = [

{
name:"social",

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

schema:[
["users","id INT, name TEXT"],
["posts","id INT, user_id INT, likes INT"]
],

questions:[

{
question:"Find users with more than 1 post",
solution:`SELECT user_id,COUNT(*) FROM posts GROUP BY user_id HAVING COUNT(*)>1`
},

{
question:"Find post with highest likes",
solution:`SELECT * FROM posts ORDER BY likes DESC LIMIT 1`
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

schema:[
["customers","id INT,name TEXT"],
["orders","id INT,customer_id INT,amount INT"]
],

questions:[

{
question:"Count orders per customer",
solution:`SELECT customer_id,COUNT(*) FROM orders GROUP BY customer_id`
},

{
question:"Find highest order amount",
solution:`SELECT MAX(amount) FROM orders`
}

]

}

]

/* -----------------------
LOAD PROBLEM
-----------------------*/

function loadProblem(){

db = new SQL.Database()

currentScenario =
scenarios[Math.floor(Math.random()*scenarios.length)]

db.run(currentScenario.setup)

currentProblem =
currentScenario.questions[
Math.floor(Math.random()*currentScenario.questions.length)
]

document.getElementById("description").innerText =
currentProblem.question

renderSchema()

}

/* -----------------------
SCHEMA
-----------------------*/

function renderSchema(){

let html=""

currentScenario.schema.forEach(row=>{
html += `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`
})

document.getElementById("schema").innerHTML = html

}

/* -----------------------
RUN QUERY
-----------------------*/

function runQuery(){

let sql = editor.getValue()

try{

let res = db.exec(sql)

renderTable(res,"output")

}catch(e){

document.getElementById("output").innerText = e.message

}

}

/* -----------------------
SUBMIT
-----------------------*/

function submitQuery(){

try{

let user = db.exec(editor.getValue())
let sol = db.exec(currentProblem.solution)

if(JSON.stringify(user)===JSON.stringify(sol)){

alert("Correct!")

loadProblem()

}else{

alert("Wrong answer")

}

}catch{

alert("SQL Error")

}

}

/* -----------------------
TABLE RENDER
-----------------------*/

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
