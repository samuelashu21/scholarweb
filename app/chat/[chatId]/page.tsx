'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Message {
  _id: string;
  sender: string;
  text: string;
  isEdited: boolean;
  deletedBy: string[];
  createdAt: string;
}

interface ChatDetail {
  _id: string;
  participants: { _id: string; name: string }[];
  product?: { _id: string; name: string };
  messages: Message[];
}

export default function ChatDetailPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [chat, setChat] = useState<ChatDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api
        .get(`/api/chats`)
        .then((res) => {
          const found = res.data.find((c: ChatDetail) => c._id === chatId);
          setChat(found || null);
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/chats/${chatId}/messages`, { text });
      const res = await api.get('/api/chats');
      const found = res.data.find((c: ChatDetail) => c._id === chatId);
      setChat(found || null);
      setText('');
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  const handleEdit = async (messageId: string) => {
    try {
      await api.put(`/api/chats/${chatId}/messages/${messageId}`, { text: editText });
      const res = await api.get('/api/chats');
      const found = res.data.find((c: ChatDetail) => c._id === chatId);
      setChat(found || null);
      setEditingId(null);
    } catch { /* ignore */ }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await api.delete(`/api/chats/${chatId}/messages/${messageId}`);
      const res = await api.get('/api/chats');
      const found = res.data.find((c: ChatDetail) => c._id === chatId);
      setChat(found || null);
    } catch { /* ignore */ }
  };

  if (loading || fetching) {
    return <div className="max-w-2xl mx-auto px-4 py-8"><div className="h-96 bg-gray-200 animate-pulse rounded-xl" /></div>;
  }

  if (!chat) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500">Chat not found.</div>;
  }

  const other = chat.participants.find((p) => p._id !== user?._id);
  const visibleMessages = chat.messages.filter((m) => !m.deletedBy.includes(user?._id || ''));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
          {other?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{other?.name || 'Unknown'}</p>
          {chat.product && <p className="text-xs text-gray-500">Re: {chat.product.name}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-xl shadow-md p-4 overflow-y-auto space-y-3 mb-4">
        {visibleMessages.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No messages yet. Say hello!</p>
        ) : (
          visibleMessages.map((msg) => {
            const isOwn = msg.sender === user?._id;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwn ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {editingId === msg._id ? (
                    <div>
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-white text-gray-800 px-2 py-1 rounded text-sm mb-2"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(msg._id)} className="text-xs bg-white text-indigo-600 px-2 py-1 rounded">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{msg.text}</p>
                      {msg.isEdited && <p className="text-xs opacity-70 mt-1">edited</p>}
                      {isOwn && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => { setEditingId(msg._id); setEditText(msg.text); }}
                            className="text-xs opacity-70 hover:opacity-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(msg._id)}
                            className="text-xs opacity-70 hover:opacity-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
