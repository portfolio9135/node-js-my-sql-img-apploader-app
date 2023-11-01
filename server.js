const express = require('express');
const { engine } = require('express-handlebars');
const fileUpload = require('express-fileupload');
const app = express();
const mysql = require("mysql");
const port = 3000;

app.use(fileUpload());
app.use(express.static("upload"));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

//connection poolを作成
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "root",
  database: "image-uploader-youtube",
})

app.get('/', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    console.log("MySQLと接続中...");

    //次はデータ取得から
    connection.query("SELECT * FROM image", (err, rows) => {
      connection.release();

      if (!err) {
        res.render("home", { rows })
      }
    })
  })
});

app.post('/', (req, res) => {
  if (!req.files) {
    return res.status(400).send('何も画像がアップロードされてませんよーーーーー')
  }

  let imageFile = req.files.imgFile;
  let upLoadPath = __dirname + '/upload/' + imageFile.name

  //サーバーに画像ファイルを置く場所の指定
  imageFile.mv(upLoadPath, (err) => {
    if (err) return res.status(500).send(err);
    // res.send("画像アップロードに成功しましたーーー");
  });

  //Mysqlに画像ファイルの名前を追加して保存する。
  pool.getConnection((err, connection) => {
    if(err) throw err;

    connection.query(`INSERT INTO image (imageName) VALUES ("${imageFile.name}")`, (err, rows) => {
      connection.release();

      if (!err) {
        res.redirect("/");
      } else {
        console.log(err);
      }
    })
  })
});

app.listen(port, () => console.log('サーバーが起動しましたーーー'))