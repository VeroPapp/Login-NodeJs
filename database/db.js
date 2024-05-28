const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.db_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATADASE,

});

connection.connect((error)=>{
    if(error){
        console.log('El error de conexión es: '+error);
        return;
    }
    console.log('Conectado a la base de datos!')
});

module.exports = connection;