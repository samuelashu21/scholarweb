"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.editMessage = exports.sendMessage = exports.createOrGetChat = exports.getUserChats = void 0;
const Chat_1 = __importDefault(require("../models/Chat"));
const getUserChats = async (req, res) => {
    try {
        const chats = await Chat_1.default.find({ participants: req.user?._id })
            .populate('participants', 'name avatar')
            .populate('product', 'name images')
            .sort({ lastMessageTime: -1 });
        res.json(chats);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getUserChats = getUserChats;
const createOrGetChat = async (req, res) => {
    try {
        const { participantId, productId } = req.body;
        const userId = req.user?._id;
        let chat = await Chat_1.default.findOne({
            participants: { $all: [userId, participantId] },
            product: productId,
        });
        if (!chat) {
            chat = await Chat_1.default.create({
                participants: [userId, participantId],
                product: productId,
                messages: [],
                lastMessage: '',
                lastMessageTime: new Date(),
            });
        }
        await chat.populate('participants', 'name avatar');
        await chat.populate('product', 'name images');
        res.json(chat);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createOrGetChat = createOrGetChat;
const sendMessage = async (req, res) => {
    try {
        const chat = await Chat_1.default.findById(req.params.chatId);
        if (!chat) {
            res.status(404).json({ message: 'Chat not found' });
            return;
        }
        const { text, replyTo } = req.body;
        const message = {
            sender: req.user._id,
            text,
            isRead: false,
            isEdited: false,
            deletedBy: [],
            replyTo,
            status: 'sent',
        };
        chat.messages.push(message);
        chat.lastMessage = text;
        chat.lastMessageTime = new Date();
        await chat.save();
        res.status(201).json(chat.messages[chat.messages.length - 1]);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.sendMessage = sendMessage;
const editMessage = async (req, res) => {
    try {
        const chat = await Chat_1.default.findById(req.params.chatId);
        if (!chat) {
            res.status(404).json({ message: 'Chat not found' });
            return;
        }
        const message = chat.messages.find((m) => m._id?.toString() === req.params.messageId);
        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }
        if (message.sender.toString() !== req.user?._id.toString()) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        message.text = req.body.text;
        message.isEdited = true;
        await chat.save();
        res.json(message);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.editMessage = editMessage;
const deleteMessage = async (req, res) => {
    try {
        const chat = await Chat_1.default.findById(req.params.chatId);
        if (!chat) {
            res.status(404).json({ message: 'Chat not found' });
            return;
        }
        const message = chat.messages.find((m) => m._id?.toString() === req.params.messageId);
        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }
        message.deletedBy.push(req.user._id);
        await chat.save();
        res.json({ message: 'Message deleted for user' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteMessage = deleteMessage;
