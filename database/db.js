const mysql = require("mysql")

const conexion = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_DATABASE,
})

conexion.connect( (error)=> {
    if(error){
        console.log("el error de conexion es: "+error)
        return
    }
    console.log("conexion a la base de datos mysql exitosa!")
})

module.exports = conexion