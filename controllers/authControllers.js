const jwt = require("jsonwebtoken")
const bcryptjs = require("bcryptjs")
const conexion = require("../database/db")
const { promisify } = require("util")
const { error } = require("console")

exports.register = async (req, res) => {

    try {
        const name = req.body.name
        const mail = req.body.mail
        const pass = req.body.pass

        //Hashea la contraseña
        let passHash = await bcryptjs.hash(pass, 8)


        //inserta los valores en db
        conexion.query("INSERT INTO user SET ?", { mail: mail, name: name, pass: passHash }, (error, results) => {
            if (error) { console.log(error) }
            res.redirect("/")
        })

    } catch (error) {
        console.log(error)
    }
}

exports.login = async (req, res) => {
    try {
        const mail = req.body.mail
        const pass = req.body.pass

        if (!mail || !pass) {
            res.render("login", {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Ingresar usuario y/o contraseña",
                alertIcon: "info",
                showConfirmButton: true,
                timer: false,
                ruta: "login"
            })

        } else {
            conexion.query("SELECT * FROM user WHERE mail = ?", [mail], async (error, results) => {
                if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
                    res.render("login", {
                        alert: true,
                        alertTitle: "Advertencia",
                        alertMessage: "Usuario y/o contraseña incorrecta",
                        alertIcon: "info",
                        showConfirmButton: true,
                        timer: false,
                        ruta: "login"
                    })

                } else {
                    //inicio correcto
                    const id = results[0].id
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })

                    const cookiesOptions = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie("jwt", token, cookiesOptions)
                    res.render("login", {
                        alert: true,
                        alertTitle: "Conexion exitosa",
                        alertMessage: "Ingresando al perfil...",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1200,
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

exports.isAuthenticated = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
            conexion.query("SELECT * FROM user WHERE id = ?", [decodificada.id], (error, results) => {
                if (!results) return next();
                req.mail = results[0]; // Aquí es donde se define req.mail
                return next();
            });
        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        res.redirect("/login");
    }
};

exports.logout = (req, res) => {
    res.clearCookie("jwt")
    return res.redirect("/")
}

// Obtener canciones del usuario autenticado
exports.getUserSongs = async (userId) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM songs WHERE user_id = ?";
        conexion.query(query, [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Obtener álbumes del usuario autenticado
exports.getUserAlbums = async (userId) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM albums WHERE user_id = ?";
        conexion.query(query, [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};


