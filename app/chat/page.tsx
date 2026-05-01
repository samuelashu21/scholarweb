'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Chat {
  _id: string;
  participants: { _id: string; name: string }[];
  product: { _id: string; name: string; images: string[] };
  lastMessage: string;
  lastMessageTime: string;
}

export default function ChatListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api
        .get('/api/chats')
        .then((res) => setChats(res.data))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Messages</h1>
      {chats.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-500">No conversations yet.</p>
          <Link href="/products" className="text-indigo-600 hover:underline mt-4 block">
            Browse products to start chatting with sellers
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => {
            const other = chat.participants.find((p) => p._id !== user?._id);
            return (
              <Link key={chat._id} href={`/chat/${chat._id}`}>
                <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                    {other?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-800">{other?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">
                        {chat.lastMessageTime
                          ? new Date(chat.lastMessageTime).toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.product?.name && (
                        <span className="text-indigo-500">{chat.product.name}: </span>
                      )}
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
