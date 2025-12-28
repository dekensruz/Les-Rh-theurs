
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { Profile, Post } from '../types';
import { PostCard } from './PostCard';

interface PublicProfileModalProps {
  userId: string;
  onClose: () => void;
  onPostClick: (post: Post) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ userId, onClose, onPostClick }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPublicData();
  }, [userId]);

  const fetchPublicData = async () => {
    setLoading(true);
    try {
      const { data: profData } = await supabase.from('profiles').select('*').eq('id', userId).single();
      const { data: postData } = await supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      
      setProfile(profData);
      setPosts(postData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.book_title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  if (loading) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#fdfbf7] w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-[3rem] shadow-2xl relative paper-texture">
          <button onClick={onClose} className="absolute top-6 right-6 z-20 text-stone-400 hover:text-stone-900 bg-white/50 p-2 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="p-8 md:p-16">
            <div className="flex flex-col md:flex-row items-center gap-12 mb-16 border-b border-stone-100 pb-12">
              <div 
                className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-[10px] border-white shadow-2xl bg-stone-100 cursor-zoom-in hover:scale-105 transition-transform shrink-0"
                onClick={() => profile?.avatar_url && setShowFullImage(true)}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 text-5xl font-serif">
                    {profile?.full_name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-serif text-4xl md:text-7xl text-stone-900 mb-6">{profile?.full_name || 'Lecteur Rhéteur'}</h2>
                
                <div className="relative inline-block max-w-2xl group">
                   <div className="absolute -top-6 -left-6 text-amber-500/20 text-7xl font-serif select-none group-hover:text-amber-500/40 transition-colors">“</div>
                   <div className="bg-white/40 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] border-l-4 border-amber-500 shadow-sm relative z-10">
                      <p className="text-stone-600 text-lg md:text-xl font-serif italic leading-relaxed">
                        {profile?.bio || "Ce rhéteur n'a pas encore partagé sa biographie, mais ses lectures parlent pour lui."}
                      </p>
                   </div>
                   <div className="absolute -bottom-10 -right-6 text-amber-500/20 text-7xl font-serif select-none rotate-180">“</div>
                </div>

                <div className="mt-12 flex justify-center md:justify-start gap-4">
                  <div className="bg-stone-900 px-6 py-2 rounded-full text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    {posts.length} Écrits au Salon
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
              <h3 className="font-serif text-3xl text-stone-900">Expositions de l'auteur</h3>
              
              <div className="relative w-full md:w-80 group">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans ses écrits..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <p className="text-stone-400 italic text-center py-20 bg-stone-50/50 rounded-3xl border border-dashed border-stone-200">Aucune publication trouvée pour cette recherche.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} onClick={onPostClick} hideAuthor={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFullImage && profile?.avatar_url && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur animate-in fade-in duration-300">
          <button onClick={() => setShowFullImage(false)} className="absolute top-10 right-10 text-white/50 hover:text-white">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="relative group max-w-2xl w-full text-center">
            <img src={profile.avatar_url} className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/10" alt="Full profile" />
          </div>
        </div>
      )}
    </>
  );
};
