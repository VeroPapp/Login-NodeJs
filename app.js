// 1- invocamos express
const express = require('express');
const app = express();

// 2- seteamos urlencoded para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// 3- invocamos dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

// 4- seteamos el directorio public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

// 5- establecemos el motor de plantillas
app.set('view engine', 'ejs');

// 6- modulo para el hashing de psw - bcryptjs
const bcryptjs = require('bcryptjs');

// 7- variables de sesion
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true,
}));


app.listen(3000, (req, res)=>{
    console.log('Servidor corriendo en puerto 3000');
})
