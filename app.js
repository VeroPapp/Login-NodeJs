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

// 8- invocamos al modulo de conexion de la bd
const connection = require('./database/db');

// 9- establecemos las rutas
app.get('/', (req, res)=>{
    res.render('index', {msg: 'msj de prueba'})
});

app.get('/login', (req, res)=>{
    res.render('login')
});

app.get('/register', (req, res)=>{
    res.render('register')
});

// 10- registracion
app.post('/register', async (req, res)=> {
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO user SET ?', {user:user,name:name, rol:rol, pass:passwordHaash}, async(error, results)=> {
        if(error){
            console.log(error);
        } else {
            res.render('register',{
                alert: true,
                alertTitle: "Registration",
                alertMessage: "Successful Registration",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: ''
            })
        }
    })
})

app.listen(3000, (req, res)=>{
    console.log('Servidor corriendo en puerto 3000');
})
 