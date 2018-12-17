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

app.get('/', (req, res) =>{
    res.render('index');
})

const port = 5000;

app.listen(port, () => console.log(`app runs on ${port}`));