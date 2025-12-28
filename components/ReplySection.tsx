
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase.ts';
import { Reply } from '../types.ts';
import { Button } from './Button.tsx';
import { PublicProfileModal } from './PublicProfileModal.tsx';

interface ReplySectionProps {
  postId: string;
  currentUserId?: string;
  userName?: string;
  externalQuote?: string;
  onQuoteUsed?: () => void;
}

export const ReplySection: React.FC<ReplySectionProps> = ({ postId, currentUserId, userName, externalQuote, onQuoteUsed }) => {
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [quotedText, setQuotedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewedProfileId, setViewedProfileId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchReplies();
  }, [postId]);

  useEffect(() => {
    if (externalQuote) {
      setQuotedText(externalQuote);
      textareaRef.current?.focus();
      if (onQuoteUsed) onQuoteUsed();
    }
  }, [externalQuote]);

  const fetchReplies = async () => {
    const { data, error } = await supabase
      .from('replies')
      .select('*, profiles:user_id(avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!error) setReplies(data || []);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !newReply.trim()) return;

    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('replies')
          .update({ content: newReply })
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase.from('replies').insert([{
          post_id: postId,
          user_id: currentUserId,
          user_name: userName || 'Anonyme',
          content: newReply,
          quoted_text: quotedText || null
        }]);
        if (error) throw error;
      }

      setNewReply('');
      setQuotedText('');
      await fetchReplies();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteReply = async (id: string) => {
    if (!confirm("Supprimer cette réplique du salon ?")) return;
    const { error } = await supabase.from('replies').delete().eq('id', id);
    if (!error) fetchReplies();
  };

  const startEdit = (reply: Reply) => {
    setEditingId(reply.id);
    setNewReply(reply.content);
    setQuotedText(reply.quoted_text || '');
    textareaRef.current?.focus();
  };

  const handleReplyToReply = (reply: Reply) => {
    setQuotedText(`${reply.user_name}: "${reply.content.substring(0, 40)}..."`);
    textareaRef.current?.focus();
  };

  return (
    <div className="mt-12 border-t border-stone-100 pt-8 pb-10">
      <h3 className="font-serif text-2xl text-stone-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        Répliques
      </h3>

      <div className="space-y-4 mb-8">
        {replies.length === 0 ? (
          <p className="text-stone-400 italic text-xs">Aucune réplique. Engagez le débat.</p>
        ) : (
          replies.map(reply => {
            const profileData = Array.isArray(reply.profiles) ? reply.profiles[0] : reply.profiles;
            const avatarUrl = profileData?.avatar_url;

            return (
              <div key={reply.id} className="bg-stone-50/60 p-4 rounded-2xl border border-stone-100 relative group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden border border-amber-100 cursor-pointer shadow-sm hover:scale-110 transition-transform"
                      onClick={() => reply.user_id && setViewedProfileId(reply.user_id)}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} className="w-full h-full object-cover" alt="User" />
                      ) : (
                        <div className="w-full h-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold">
                          {reply.user_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span 
                        className="font-bold text-stone-800 text-xs cursor-pointer hover:text-amber-700 transition-colors"
                        onClick={() => reply.user_id && setViewedProfileId(reply.user_id)}
                      >
                        {reply.user_name}
                      </span>
                      <span className="text-[9px] text-stone-400 uppercase tracking-tighter">{new Date(reply.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReplyToReply(reply)} className="text-[9px] text-amber-600 font-bold uppercase hover:underline">Répondre</button>
                    {reply.user_id === currentUserId && (
                      <div className="flex gap-1.5 ml-1 border-l border-stone-200 pl-2">
                        <button onClick={() => startEdit(reply)} className="text-stone-400 hover:text-amber-600"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => deleteReply(reply.id)} className="text-stone-400 hover:text-red-600"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    )}
                  </div>
                </div>
                {reply.quoted_text && <div className="mb-2 pl-3 border-l-2 border-amber-200 italic text-stone-500 text-[11px] bg-amber-50/50 py-1.5 rounded-r-lg">"{reply.quoted_text}"</div>}
                <p className="text-stone-700 text-sm leading-snug">{reply.content}</p>
              </div>
            );
          })
        )}
      </div>

      {currentUserId ? (
        <form onSubmit={handleSendReply} className="space-y-3">
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            {quotedText && (
              <div className="bg-amber-50 p-2 flex justify-between items-center border-b border-amber-100">
                <p className="text-[9px] text-amber-800 italic truncate max-w-[80%]">Cité : "{quotedText}"</p>
                <button type="button" onClick={() => setQuotedText('')} className="text-amber-400 hover:text-amber-800"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            )}
            <textarea 
              ref={textareaRef}
              value={newReply}
              onChange={e => setNewReply(e.target.value)}
              placeholder="Votre réplique..."
              className="w-full p-4 text-sm outline-none resize-none bg-transparent"
              rows={3}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-stone-400 hidden sm:inline">Sélectionnez du texte pour citer.</span>
            <div className="flex gap-2 ml-auto">
              {editingId && <Button type="button" onClick={() => { setEditingId(null); setNewReply(''); setQuotedText(''); }} variant="ghost" className="text-[10px] px-3">Annuler</Button>}
              <Button type="submit" isLoading={loading} variant="primary" className="px-4 py-2 sm:px-6">
                <span className="hidden sm:inline">{editingId ? "Mettre à jour" : "Envoyer la réplique"}</span>
                <span className="sm:hidden"><svg className="w-4 h-4 rotate-45" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></span>
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-stone-100 p-4 rounded-xl text-center"><p className="text-stone-500 text-xs">Connectez-vous pour répondre.</p></div>
      )}

      {viewedProfileId && (
        <PublicProfileModal 
          userId={viewedProfileId} 
          onClose={() => setViewedProfileId(null)} 
          onPostClick={() => setViewedProfileId(null)} 
        />
      )}
    </div>
  );
};
