"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReview = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.category)
            filter.category = req.query.category;
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice)
                filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice)
                filter.price.$lte = parseFloat(req.query.maxPrice);
        }
        const total = await Product_1.default.countDocuments(filter);
        const products = await Product_1.default.find(filter)
            .populate('category', 'categoryname')
            .populate('seller', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        res.json({ products, page, pages: Math.ceil(total / limit), total });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id)
            .populate('category', 'categoryname')
            .populate('seller', 'name')
            .populate('ratings.user', 'name avatar');
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const { name, description, price, images, category, stock } = req.body;
        const isValidUrl = (str) => {
            try {
                new URL(str);
                return true;
            }
            catch {
                return false;
            }
        };
        const validImages = (images || []).filter((img) => isValidUrl(img));
        const product = await Product_1.default.create({
            name,
            description,
            price,
            images: validImages,
            category,
            seller: req.user?._id,
            stock: stock || 0,
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        Object.assign(product, req.body);
        const updated = await product.save();
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json({ message: 'Product removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteProduct = deleteProduct;
const addReview = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const alreadyReviewed = product.ratings.find((r) => r.user.toString() === req.user?._id.toString());
        if (alreadyReviewed) {
            res.status(400).json({ message: 'Already reviewed' });
            return;
        }
        product.ratings.push({
            user: req.user._id,
            rating: Number(req.body.rating),
            comment: req.body.comment,
        });
        product.averageRating =
            product.ratings.reduce((acc, r) => acc + r.rating, 0) / product.ratings.length;
        await product.save();
        res.status(201).json({ message: 'Review added' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.addReview = addReview;
