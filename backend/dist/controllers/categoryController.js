"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.createCategory = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const getCategories = async (_req, res) => {
    try {
        const categories = await Category_1.default.find().sort({ categoryname: 1 });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { categoryname, image } = req.body;
        const exists = await Category_1.default.findOne({ categoryname });
        if (exists) {
            res.status(400).json({ message: 'Category already exists' });
            return;
        }
        const category = await Category_1.default.create({ categoryname, image });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createCategory = createCategory;
const deleteCategory = async (req, res) => {
    try {
        const category = await Category_1.default.findByIdAndDelete(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.json({ message: 'Category removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteCategory = deleteCategory;
