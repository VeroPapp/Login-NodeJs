const jwt = require("jsonwebtoken")
const bcryptjs = require("bcryptjs")
const conexion = require("../database/db")
const {promisify} = require("util")
const { error } = require("console")

//register
exports.register = async(req,res)=> {

    try {
    //Pide los valores del register
    const name = req.body.name
    const user = req.body.user
    const pass = req.body.pass

    //Hashea la contraseña
    let passHash = await bcryptjs.hash(pass,8)


    //inserta los valores en db
    conexion.query("INSERT INTO user SET ?", {user:user, name:name, pass:passHash}, (error,results)=>{
        if(error){console.log(error)}
        res.redirect("/")
    })

    } catch (error) {
        console.log(error)
    }
 }


 //login
 exports.login = async (req, res) => {
    try {
        const user = req.body.user
        const pass = req.body.pass

        if( !user || !pass) {
            res.render("login", {
                alert:true,
                alertTitle:"advertencia",
                alertMessage:"Ingresar usuario y/o contraseña",
                alertIcon:"info",
                showConfirmButton: true,
                timer: false,
                ruta: "login"
            })

        }else{
            conexion.query("SELECT * FROM user WHERE user = ?", [user], async (error, results)=>{
                if(results.length == 0 || ! (await bcryptjs.compare(pass, results[0].pass )) ){
                        res.render("login", {
                            alert:true,
                            alertTitle:"advertencia",
                            alertMessage:"Usuario no reconocido",
                            alertIcon:"info",
                            showConfirmButton: true,
                            timer: false,
                            ruta: "login"
                        })
            
                    }else{
                        //inicio bien
                        const id = results[0].id
                        const token = jwt.sign({id : id}, process.env.JWT_SECRETO, {
                            expiresIn: process.env.JWT_TIEMPO_EXPIRA
                        } )

                        console.log("TOKEN: "+token +"del usuario: "+ user)

                        const cookiesOptions = {
                            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES *24 *60 *1000 ) ,
                            httpOnly: true
                        }
                        res.cookie("jwt", token, cookiesOptions)
                        res.render("login", {
                            alert:true,
                            alertTitle:"conexion exitosa :D",
                            alertMessage:"LOGIN correcto :D",
                            alertIcon:"success",
                            showConfirmButton: false,
                            timer: 800,
                            ruta: ""
                        })
                    }
            })
        }
    }


     catch (error) {
        console.log(error)
    }

}

//autenticacion
exports.isAuthenticated = async (req, res, next )=> {
    if(req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query("SELECT * FROM user WHERE id = ? ", [decodificada.id], (error, results)=> {
                if(!results){return next()}
                req.user = results[0]
                return next()
            })
         } catch (error) {
            console.log(error)
            return next()
        }
    }else {
        res.redirect("/login")
        
    }
}

exports.logout = (req, res)=> {
    res.clearCookie("jwt")
    return res.redirect("/")
}
//controller