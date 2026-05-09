"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserLikes = exports.toggleLike = void 0;
const Like_1 = __importDefault(require("../models/Like"));
const toggleLike = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user?._id;
        const existing = await Like_1.default.findOne({ user: userId, product: productId });
        if (existing) {
            await Like_1.default.deleteOne({ _id: existing._id });
            res.json({ liked: false, message: 'Like removed' });
        }
        else {
            await Like_1.default.create({ user: userId, product: productId });
            res.json({ liked: true, message: 'Product liked' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.toggleLike = toggleLike;
const getUserLikes = async (req, res) => {
    try {
        const likes = await Like_1.default.find({ user: req.user?._id }).populate('product');
        res.json(likes);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getUserLikes = getUserLikes;
