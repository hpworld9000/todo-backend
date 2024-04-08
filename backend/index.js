const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./models/userModel");
const Product = require("./models/productModel");
const formidable = require('formidable');

const Jwt = require("jsonwebtoken");
const JwtKey = "dashboard";

const app = express();
app.use(express.json());
app.use(cors());

//----------------------------USER ROUTES-----------------------------
//TESTING PATH
app.get("/", (req, res) => {
    res.send("App Is Working")
})

//CREATE USER
app.post("/register", async (req, res) => {
    let user = new User(req.body);
    let result = await user.save();
    Jwt.sign({ result }, JwtKey, {expiresIn: "5min"}, (err, token) => {
        if(err){
            res.send({result: "something went wrong"})
        }
        res.send({ result, token })
    })
})

//USER LOGIN
app.post("/login", async (req, res) => {
    if(req.body.email && req.body.password){
        let result = await User.findOne({ email: req.body.email, password: req.body.password });
        if (result) {
            Jwt.sign({result}, JwtKey, {expiresIn: "5min"}, (err, token) => {
                if(err){
                    res.send({result: "something went wrong"})
                }
                res.send({ result, token })
            })
        } else {
            res.send({ success: false, error: "User Details Not Found." })
        }
    } else {
        res.send({ success: false, error: "User Not Found." })
    }
})

// ----------------------PRODUCT ROUTES---------------------------------

//CREATE PRODUCT
app.post("/add-product", verifyToken, async (req, res) => {
    let product = new Product(req.body);
    let result = await product.save();
    console.log('result: ', result);
    if (result) {
        res.send({ ...result, success: true });
    } else {
        res.send({ result: "Product Not created." })
    }
})

//GET PRODUCT LIST
app.get("/product", verifyToken, async (req, res) => {
    let result = await Product.find();
    res.send(result);
})

//GET PRODUCT DETAILS
app.get("/get-product/:id", verifyToken, async (req, res) => {
    let result = await Product.findOne({ _id: req.params.id })
    res.send(result);
})

//UPDATE PRODUCT
app.put("/update-product/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    let result = await Product.updateOne(
            { _id: id }, 
            { $set : req.body }
        )
    res.send(result)
})

//DELETE PRODUCT
app.delete("/product/:id", verifyToken, async (req, res) => {
    let result = await Product.deleteOne({_id: req.params.id});
        res.send(result);
})

//SEARCH PRODUCT
app.get("/search/:key", verifyToken, async (req, res) => {
    let result = await Product.find({
        "$or" : [
            {productName: { $regex: req.params.key}},
            {productPrice: { $regex: req.params.key}},
            {productCompany: { $regex: req.params.key}},
            {productModel: { $regex: req.params.key}}
        ]
    })
    res.send(result);
})

function verifyToken(req, res, next) {
    let token = req.headers['authorization'];
    if(token){
        token = token.split(" ")[1];
        Jwt.verify(token, JwtKey, (err, valid) => {
            if(err){
                res.status(401).send({...err, success: false, status: 401})
            } else {
                next();
            }
        })
    } else {
        res.status(403).send({result: "Please add token with header."})
    }
}

// app.get('/file', (req, res) => {
//     res.send(`
//        <h2>With <code>"express"</code> npm package</h2>
//        <form action="/api/upload" enctype="multipart/form-data" method="post">
//        <div>Text field title: <input type="text" name="title" /></div>
//        <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
//        <input type="submit" value="Upload" />
//        </form>
//     `);
//  });
 
//  app.post('/api/upload', (req, res, next) => {
//     const form = new formidable.IncomingForm();
 
//     form.parse(req, (err, fields, files) => {
//        if (err) {
//           next(err);
//           return;
//        }
//        res.end(JSON.stringify({ fields, files }, null, 2));
//     });
//  });
 
app.listen(5000);