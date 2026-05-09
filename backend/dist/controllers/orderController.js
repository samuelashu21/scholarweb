"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverOrder = exports.getAllOrders = exports.payOrder = exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, } = req.body;
        if (!orderItems || orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        }
        const order = await Order_1.default.create({
            user: req.user?._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createOrder = createOrder;
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order_1.default.find({ user: req.user?._id }).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getMyOrders = getMyOrders;
const getOrderById = async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (order.user._id.toString() !== req.user?._id.toString() &&
            !req.user?.isAdmin) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getOrderById = getOrderById;
const payOrder = async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = req.body;
        const updated = await order.save();
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.payOrder = payOrder;
const getAllOrders = async (_req, res) => {
    try {
        const orders = await Order_1.default.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllOrders = getAllOrders;
const deliverOrder = async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        order.isDelivered = true;
        order.deliveredAt = new Date();
        const updated = await order.save();
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deliverOrder = deliverOrder;
