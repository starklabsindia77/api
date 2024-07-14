
var connection = require('../middlewares/database');
// var upload = require('../middlewares/blogUpload');
var upload = require('../middlewares/azureBlogUpload');

var verify = require('../middlewares/verify-token');
const express = require("express");
const app = express();
const cors = require('cors')
const _ = require('lodash');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const config = require("../key");
// const fetch = require('node-fetch');
const { isNull } = require('lodash');
const formidable = require('formidable');
var Promise = require("bluebird");
Promise.longStackTraces();
var cron = require('node-cron');
const validateUserToken = require('../middlewares/verify-token');
const verifyToken = require('../middlewares/verify-token');




serverUrl = config.serverUrl
app.use(cors());
app.set('view engine', 'ejs');
//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(cookieParser());

// Define the GET API for products
app.post('/blogs', upload, async (req, res) => {
    try {        
        const guid = uuidv4();
        const { title, description, content, cover, tags, publish, comments, metaTitle, metaDescription, metaKeywords, author } = req.body;
        const query = `INSERT INTO blogs (guid, title, description, content, cover, tags, publish, comments, metaTitle, metaDescription, metaKeywords, view, comment, share,  author, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? ,? )`;

        const results = await connection.query(query, [guid, title, description, content, cover, JSON.stringify(tags), publish, comments, metaTitle, metaDescription, JSON.stringify(metaKeywords), 0, 0, 0,  JSON.stringify(author), new Date().toJSON().slice(0, 19).replace('T', ' '), new Date().toJSON().slice(0, 19).replace('T', ' ')]);
        res.status(201).json({ id: results.insertId });
    } catch (error) {
        return res.status(500).json({ error });
    }
});

app.get('/blog/posts/all', (req, res) => {
    try {
      const query = `SELECT * FROM blogs`;
  
      connection.query(query, (error, results) => {
        if (error) {
          console.log("error", error);
          return res.status(500).json({ error });
        }
  
        res.status(200).send({posts: results});
      });
    } catch (err) {
      console.log("Server error", err);
      res.status(500).json({ error: 'An error occurred on the server' });
    }
  });
  
  // Get a single blog
  app.get('/blog/post/:id', (req, res) => {
    try {
         
      const { id } = req.params;
     
      const query = `SELECT * FROM blogs WHERE guid = ?`;
  
      connection.query(query, [id], (error, results) => {
        if (error) {
          console.log("error", error);
          return res.status(500).json({ error });
        }
  
        if (results.length > 0) {
          res.status(200).send({post: results[0]});
        } else {           
          res.status(404).json({ message: "Blog not found" });
        }
      });
  
    } catch (error) {
      console.log("Server error", error);
      return res.status(500).json({ error: 'An error occurred on the server' });
    }
  });

  app.get('/blog/posts/recent/:guid', (req, res) => {
    try {
      const { guid } = req.params;
      const query = `SELECT * FROM blogs WHERE guid <> ? ORDER BY createdAt DESC LIMIT 8`;
  
      connection.query(query, [guid], (error, results) => {
        if (error) {
          console.log("error", error);
          return res.status(500).json({ error });
        }
  
        res.status(200).send({recentPosts: results});
      });
  
    } catch (error) {
      console.log("Server error", error);
      return res.status(500).json({ error: 'An error occurred on the server' });
    }
  });
  
  
  
  // Update a blog
  app.put('/blogs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, content, cover, tags, publish, comments, metaTitle, metaDescription, metaKeywords, view, comment, share, author } = req.body;
  
      const query = `UPDATE blogs SET title = ?, description = ?, content = ?, cover = ?, tags = ?, publish = ?, comments = ?, metaTitle = ?, metaDescription = ?, metaKeywords = ?, view = ?, comment = ?, share = ?, author = ? , updated_at = ? WHERE guid = ?`;
  
      await connection.query(query, [ title, description, content, cover, JSON.stringify(tags), publish, comments, metaTitle, metaDescription, JSON.stringify(metaKeywords), view, comment, share, JSON.stringify(author), new Date().toJSON().slice(0, 19).replace('T', ' '), id]);
      res.status(200).json({ message: `Blog with id: ${id} updated` });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
  
  // Delete a single blog
  app.delete('/blogs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const query = `DELETE FROM blogs WHERE id = ?`;
  
      await connection.query(query, [id]);
      res.status(200).send({ message: `Blog with id: ${id} deleted` });
    } catch (error) {
      return res.status(500).json({ error });
    }
  });


module.exports = app;