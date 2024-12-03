const express = require("express")
const router = express.Router()
const multer = require("multer");
const path = require("path");

const conexion = require("../database/db"); // Agregar esta línea

const authControllers = require("../controllers/authControllers")

router.get("/", authControllers.isAuthenticated, async (req, res) => {
    try {
        const userId = req.mail.id; // Obtiene el ID del usuario autenticado
        const songs = await authControllers.getUserSongs(userId);
        const albums = await authControllers.getUserAlbums(userId);

        res.render("dashboard", { 
            mail: req.mail, 
            songs: songs, 
            albums: albums 
        });
    } catch (err) {
        console.error("Error al obtener datos del usuario:", err);
        res.redirect("/login");
    }
});


//router para las vistas
router.get("/", authControllers.isAuthenticated, (req, res)=>{
    res.render("dashboard", {mail:req.mail})
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



// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/"); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Asigna un nombre único a cada archivo
    }
});

// para los archivos?
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10 MB por archivo
    fileFilter: (req, file, cb) => {
        const filetypes = /mp3|wav|flac/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error("Solo se permiten archivos de audio (mp3, wav, flac)"));
        }
    }
    
});


// Ruta para subir canciones
router.post("/upload", authControllers.isAuthenticated, upload.single("file"), async (req, res) => {
    try {
        const { title, album, genre } = req.body;
        const userId = req.mail.id; // Esto falla si req.mail no está definido
        const filePath = `uploads/${req.file.filename}`; // Ruta del archivo subido

        // Insertar la canción en la base de datos
        conexion.query(
            "INSERT INTO songs (user_id, title, album_name, track_number, genre, file_path) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, title, album, 0, genre, filePath],
            (err, result) => {
                if (err) {
                    console.error("Error al insertar canción:", err);
                    return res.status(500).send("Error al subir la canción.");
                }
                res.redirect("/"); 
            }
        );
    } catch (err) {
        console.error("Error al procesar la carga de archivos:", err);
        res.status(400).send("Hubo un problema con la carga de la canción.");
    }
});



//endpoint para POST para manejar las solicitudes de eliminación
const fs = require("fs");

// Ruta para eliminar canciones
router.post("/delete-song/:id", authControllers.isAuthenticated, (req, res) => {
    const songId = req.params.id;

    // Obtén la información de la canción para borrar el archivo
    conexion.query("SELECT file_path FROM songs WHERE id = ?", [songId], (err, results) => {
        if (err || results.length === 0) {
            console.error("Error al buscar la canción:", err || "Canción no encontrada");
            return res.status(404).send("Canción no encontrada");
        }

        const filePath = path.join(__dirname, "../public", results[0].file_path);

        // Elimina el archivo físico
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error("Error al eliminar el archivo:", unlinkErr);
                return res.status(500).send("Error al eliminar el archivo");
            }

            // Elimina el registro de la base de datos
            conexion.query("DELETE FROM songs WHERE id = ?", [songId], (deleteErr) => {
                if (deleteErr) {
                    console.error("Error al eliminar la canción de la base de datos:", deleteErr);
                    return res.status(500).send("Error al eliminar la canción");
                }

                res.redirect("/"); // Redirige al dashboard después de eliminar
            });
        });
    });
});
