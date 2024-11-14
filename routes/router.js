const express = require("express")
const router = express.Router()

const authControllers = require("../controllers/authControllers")

//router para las vistas
router.get("/", authControllers.isAuthenticated, (req, res)=>{
    res.render("index", {user:req.user})
})

router.get("/login", (req, res)=>{
    res.render("login", {alert:false})
})

router.get("/register", (req, res)=>{
    res.render("register")
})



//router para los metodos del controller
router.post("/register", authControllers.register)
router.post("/login", authControllers.login)
router.get("/logout", authControllers.logout)

module.exports = router