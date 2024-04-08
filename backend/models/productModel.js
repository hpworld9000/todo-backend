const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productName: String,
    productPrice: String,
    productCompany: String,
    prodcutModel: String
})

module.exports = mongoose.model("products", productSchema);