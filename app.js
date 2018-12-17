//  includes
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const gridFsStorage = require('multer-gridfs-storage');
const grid = require('gridfs-stream');
const mehtodOverrider =  require('method-override');
const bodyParser = require('body-parser');

const app = express();

//  middleware
app.use(bodyParser.json());
app.use(mehtodOverrider('_method'));
app.set('view engine', 'ejs');

//  mongo uri
const mongoUri = 'mongodb://test:test123@ds137404.mlab.com:37404/piky';

//  db connection

const conn = mongoose.createConnection(mongoUri);

// init gfs

let gfs;
conn.once('open', () => {
    gfs = grid(conn.db, mongoUri);
    gfs.collection('uploads');
})

// create storage object 
const storage = new gridFsStorage({
    url: mongoUri,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

//  @route GET / 
//  @desc Loads the inital view
app.get('/', (req, res) =>{
    res.render('index');
})

// @route POST /upload
// @desc uploads to database

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({file:req.file});
})

const port = 5000;

app.listen(port, () => console.log(`app runs on ${port}`));