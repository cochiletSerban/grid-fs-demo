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
    gfs = grid(conn.db,  mongoose.mongo);
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
    gfs.files.find().toArray((err, files) => {
        //  check if files exist
        if (!files || files.length === 0) {
           res.render('index', {files: false});
        } else {
            files.map(file => {
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });
            res.render('index', {files: files});
        }
    });
})

// @route POST /upload
// @desc uploads to database
app.post('/upload', upload.single('file'), (req, res) => {
    //res.json({file:req.file});
    res.redirect('/');
})

//  @route GET /files
//  @desc display all the files in json
app.get('/files',(req, res) => {
    gfs.files.find().toArray((err, files) => {
        //  check if files exist
        if (!files || files.length === 0) {
            return res.status(404).json({
                err:'no files exist'
            });
        }


        return res.json(files);
    });
});


//  @route GET /files/:filename
//  @desc display single info of a file
app.get('/files/:filename',(req, res) => {
    gfs.files.findOne({filename:req.params.filename}, (err, file) =>{
        if (!file || file.length === 0) {
            return res.status(404).json({
                err:'no file exist'
            });
        }
        return res.json(file);
    })
});


// @route GET /image/:filename
// @desc Display Image
app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
  
      // Check if image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else { 
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  });

const port = 5000;

app.listen(port, () => console.log(`app runs on ${port}`));