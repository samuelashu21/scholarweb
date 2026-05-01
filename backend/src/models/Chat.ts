import mongoose, { Document, Schema } from 'mongoose';

interface IReplyTo {
  text: string;
  senderName: string;
  messageId: mongoose.Types.ObjectId;
}

export interface IMessage {
  _id?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  isRead: boolean;
  isEdited: boolean;
  deletedBy: mongoose.Types.ObjectId[];
  replyTo?: IReplyTo;
  status: 'sent' | 'delivered' | 'read';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  product: mongoose.Types.ObjectId;
  messages: IMessage[];
  lastMessage: string;
  lastMessageTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    deletedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replyTo: {
      text: String,
      senderName: String,
      messageId: Schema.Types.ObjectId,
    },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  },
  { timestamps: true }
);

const chatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    messages: [messageSchema],
    lastMessage: { type: String, default: '' },
    lastMessageTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Chat = mongoose.model<IChat>('Chats', chatSchema);
export default Chat;
