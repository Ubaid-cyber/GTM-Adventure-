'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface Author {
  name: string;
  profileImage: string | null;
  role: string;
}

interface Post {
  id: string;
  content: string;
  type: 'MESSAGE' | 'UPDATE' | 'MILESTONE' | 'IMAGE' | 'ALERT';
  mediaUrl: string | null;
  createdAt: string;
  user: Author;
}

export default function GroupChat({ 
  expeditionId, 
  apiToken 
}: { 
  expeditionId: string, 
  apiToken: string 
}) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<Post['type']>('MESSAGE');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [expeditionId, apiToken]);

  async function fetchPosts() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/active-bookings/${expeditionId}/feed`, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'x-user-email': session?.user?.email || ''
        }
      });
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch (err) {
      console.error('Feed retrieval failure:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/active-bookings/${expeditionId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
          'x-user-email': session?.user?.email || ''
        },
        body: JSON.stringify({
          content: newPost,
          type: postType
        })
      });

      if (res.ok) {
        const created = await res.json();
        setPosts([created, ...posts]);
        setNewPost('');
      }
    } catch (err) {
      console.error('Post transmission failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const getTypeStyles = (type: Post['type']) => {
    switch (type) {
      case 'ALERT': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'MILESTONE': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'UPDATE': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Create Post */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Send an update to the group..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all resize-none min-h-[100px]"
          />
          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                {(['MESSAGE', 'UPDATE', 'MILESTONE', 'ALERT'] as Post['type'][]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPostType(t)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${postType === t ? getTypeStyles(t) : 'bg-white/5 border-white/10 text-white/40 opacity-50 hover:opacity-100'}`}
                  >
                    {t}
                  </button>
                ))}
             </div>
             <button
               disabled={submitting || !newPost.trim()}
               className="bg-primary hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(30,58,138,0.3)]"
             >
               {submitting ? 'Sending...' : 'Send Message'}
             </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/[0.07] transition-all"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden flex-shrink-0">
                  <img 
                    src={post.user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.name}`} 
                    className="w-full h-full rounded-full object-cover"
                    alt={post.user.name}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black tracking-tight mr-2">{post.user.name}</span>
                      <span className="text-[10px] font-mono text-white/30">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Member</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-widest border ${getTypeStyles(post.type)}`}>
                      {post.type}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">
                    {post.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="py-10 text-center animate-pulse">
            <span className="text-primary/40 font-mono text-[10px] tracking-widest uppercase">Loading chat...</span>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
             <div className="text-white/20 font-mono text-xs uppercase tracking-tighter italic">No messages yet...</div>
          </div>
        )}
      </div>
    </div>
  );
}
