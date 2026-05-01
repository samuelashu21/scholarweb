import { Response } from 'express';
import Chat from '../models/Chat';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getUserChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({ participants: req.user?._id })
      .populate('participants', 'name avatar')
      .populate('product', 'name images')
      .sort({ lastMessageTime: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createOrGetChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { participantId, productId } = req.body;
    const userId = req.user?._id;

    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
      product: productId,
    });

    if (!chat) {
      chat = await Chat.create({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }
    const { text, replyTo } = req.body;
    const message = {
      sender: req.user!._id as mongoose.Types.ObjectId,
      text,
      isRead: false,
      isEdited: false,
      deletedBy: [],
      replyTo,
      status: 'sent' as const,
    };
    chat.messages.push(message);
    chat.lastMessage = text;
    chat.lastMessageTime = new Date();
    await chat.save();
    res.status(201).json(chat.messages[chat.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const editMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }
    const message = chat.messages.find(
      (m) => m._id?.toString() === req.params.messageId
    );
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }
    const message = chat.messages.find(
      (m) => m._id?.toString() === req.params.messageId
    );
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }
    message.deletedBy.push(req.user!._id as mongoose.Types.ObjectId);
    await chat.save();
    res.json({ message: 'Message deleted for user' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
