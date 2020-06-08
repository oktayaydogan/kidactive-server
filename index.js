const http = require("http");
const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const upload = multer({ dest: __dirname + "/uploads/" });

// Creation of the Express server
const app = express();

// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Connection to the SQlite database
const db_name = path.join(__dirname, "data", "sqlite.db");
console.log(db_name);
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the " + db_name);
});

// Server startup
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

// to keep alive all the time
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

// GET /
app.get("/", (req, res) => {
  const sql = "SELECT * FROM Articles ORDER BY ID DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("index", { model: rows });
  });
});

// GET /create
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

// POST /create
app.post("/create", (req, res) => {
  const sql =
    "INSERT INTO Articles (Title, Author, Description, Content, Tags) VALUES (?, ?, ?, ?, ?)";
  const article = [
    req.body.Title,
    req.body.Author,
    req.body.Content,
    req.body.Description,
    req.body.Tags
  ];
  db.run(sql, article, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/");
  });
});

// GET /edit/5
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Articles WHERE ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", { model: row });
  });
});

// POST /edit/5
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const article = [
    req.body.Title,
    req.body.Author,
    req.body.Description,
    req.body.Content,
    req.body.Tags,
    id
  ];
  const sql =
    "UPDATE Articles SET Title = ?, Author = ?, Description = ?, Content = ?, Tags = ? WHERE (ID = ?)";
  db.run(sql, article, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/");
  });
});

// GET /delete/5
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Articles WHERE ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete", { model: row });
  });
});

// POST /delete/5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Articles WHERE ID = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/");
  });
});

// GET /image/5
app.get("/image/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Articles WHERE ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("image", { model: row });
  });
});

app.post("/image/:id", upload.any(), (req, res) => {
    res.json(req.file);
  if (req.file) {
    res.json(req.file);
  } else throw "error";
});

// GET /api
app.get("/api", (req, res) => {
  const sql = "SELECT * FROM Articles ORDER BY Title";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.json(rows);
  });
});
