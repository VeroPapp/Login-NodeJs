// 1 - Invocamos a Express
const express = require('express');
const app = express();
const multer = require('multer');

//2 - Para poder capturar los datos del formulario (sin urlencoded nos devuelve "undefined")
app.use(express.urlencoded({extended:false}));
app.use(express.json());//además le decimos a express que vamos a usar json

//3- Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env'});

//4 -seteamos el directorio de assets
app.use('/resources',express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//5 - Establecemos el motor de plantillas
app.set('view engine','ejs');

//6 -Invocamos a bcrypt
const bcrypt = require('bcryptjs');

//7- variables de session
const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


// 8 - Invocamos a la conexion de la DB
const connection = require('./database/db');

//9 - establecemos las rutas
	app.get('/login',(req, res)=>{
		res.render('login');
	})

	app.get('/register',(req, res)=>{
		res.render('register');
	})

	app.get('/upload-profile',(req, res)=>{
		res.render('upload-profile');
	})

	app.get('/dashboard', (req, res) => {
		/*if (!req.isAuthenticated()) {
			return res.redirect('/login');
		}
		res.sendFile(path.join(__dirname, 'views', 'dashboard.ejs'));*/
		res.render('dashboard');
	});

//10 - Método para la REGISTRACIÓN
app.post('/register', async (req, res)=>{
	const name = req.body.name;
    const mail = req.body.mail;
	const pass = req.body.pass;
	let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO user SET ?',{name:name, mail:mail, pass:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{            
			res.render('register', {
				alert: true,
				alertTitle: "Registration",
				alertMessage: "¡Successful Registration!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
			});      
        }
	});
})

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
    }
});

const upload = multer({ storage: storage });

// Ruta para subir la foto de perfil
app.post('/upload-profile-pic', upload.single('profilePic'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Por favor selecciona una imagen.' });
    }

    // Aquí podrías guardar la ruta de la imagen en la base de datos si es necesario
    const profilePicUrl = `/uploads/${req.file.filename}`;

    // Auto-login o cualquier otra acción necesaria
    // Por simplicidad, asumimos que el usuario se loguea automáticamente

    res.json({ success: true, profilePicUrl: profilePicUrl });
});

// Ruta para servir el dashboard después de subir la imagen
app.get('/dashboard', (req, res) => {
    // Aquí deberías comprobar si el usuario está logueado
    res.sendFile(path.join(__dirname, 'dashboard.ejs'));
});


//11 - Metodo para la autenticacion
app.post('/auth', async (req, res)=> {
	const name = req.body.name;
	const pass = req.body.pass;    
    //let passwordHash = await bcrypt.hash(pass, 8);
	
	if (name && pass) {
		connection.query('SELECT * FROM user WHERE name = ?', [name], async (error, results, fields)=> {
			//console.log(results);

			/*if (results.length > 0) {
				const passwordMatches = await bcrypt.compare(pass, results[0].pass);
				console.log("Contraseña ingresada: ", pass);
				console.log("Hash en la base de datos: ", results[0].pass);
				console.log("Coinciden las contraseñas: ", passwordMatches);*/

			if( results.length == 0 || !(await bcrypt.compare(pass, results[0].pass)) ) {    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });
						
			} else {         
				//creamos una var de session y le asignamos true si INICIO SESSION       
				req.session.loggedin = true;                
				req.session.name = results[0].name;
				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        			
			}			
			res.end();
		});
	} else {	
		res.send('Please enter user and Password!');
		res.end();
	}
});

//12 - Método para controlar que está auth en todas las páginas
app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
});


//función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

 //Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});





app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});  