const express = require("express");
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "database"
});

const app = express();

app.use(express.static("public"))
app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.get("/tasks", function(req, res){
    pool.query(`SELECT * FROM todolist`, function(err, result, fields){
        if (err) throw err;
        res.send(result);
    });
});

app.post("/tasks", function(req, res){
    const data = req.body;
    pool.query(`INSERT INTO todolist VALUES (NULL, "${data.name}", ${data.status})`, function(err, result, fields){
        if (err) throw err;
        res.send(result.insertId.toString());
    });
})

app.patch("/tasks", function(req, res){
    const data = req.body;

    if (data.type == "name"){
        console.log(data);
        pool.query(`UPDATE todolist SET name = "${data.name}" WHERE id = ${data.id}`, function(err, result, fields){
            if (err) throw err;
            res.send(result);
        });
    } else {
        pool.query(`UPDATE todolist SET status = ${data.status} WHERE id = ${data.id}`, function(err, result, fields){
            if (err) throw err;
            res.send(result);
        });
    }
})

app.delete("/tasks/:id", function(req, res){
    const id = req.params.id;
    console.log(id);
    pool.query(`DELETE FROM todolist WHERE id = ${id}`, function(err, result, fields){
        if (err) throw err;
        res.send(result);
    });
})

app.listen(3000);