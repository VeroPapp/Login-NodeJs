//1 - invocamos a express
const express = require("express");
const app = express();

//2 - seteamos urlencoded para capturar los datos del formulario 
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//3 - invocar a dotenv
const dotenv = require("dotenv");
dotenv.config({path:'./env/.env'});

//4 - seteamos el directorio public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + 'public' ));

//5 - motor de plantillas
app.set('view engine', 'ejs');

//6 - invocamos a bcryptjs
const bcryptjs = require('bcryptjs');

//7 - configuramos las variables de sesión
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//8 - invocamos al modulo de conexión a la bs
const connection = require('./database/db');


app.get('/', (req, res)=>{
    res.send('Holis');
}) 

app.listen(3000, (req, res)=>{
    console.log("Server running on port 3000");
})