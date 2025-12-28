
import React, { useState, useEffect } from 'react';
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

  const handleDownload = async () => {
    if (!profile?.avatar_url) return;
    try {
      const response = await fetch(profile.avatar_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `portrait-${profile.full_name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Erreur lors du téléchargement");
    }
  };

  if (loading) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#fdfbf7] w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-[3rem] shadow-2xl relative paper-texture">
          <button onClick={onClose} className="absolute top-6 right-6 z-20 text-stone-400 hover:text-stone-900 bg-white/50 p-2 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="p-8 md:p-16">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-16 border-b border-stone-100 pb-12">
              <div 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-stone-100 cursor-zoom-in hover:scale-105 transition-transform"
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
              <div className="text-center md:text-left">
                <h2 className="font-serif text-4xl md:text-6xl text-stone-900 mb-4">{profile?.full_name || 'Lecteur Rhéteur'}</h2>
                <p className="text-stone-500 text-lg max-w-2xl italic leading-relaxed">
                  {profile?.bio || "Ce rhéteur n'a pas encore partagé sa biographie, mais ses lectures parlent pour lui."}
                </p>
                <div className="mt-6 flex justify-center md:justify-start gap-4">
                  <div className="bg-amber-100 px-4 py-2 rounded-full text-amber-900 text-xs font-bold uppercase tracking-widest">
                    {posts.length} Publications
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-serif text-3xl text-stone-900 mb-8">Ses expositions au Salon</h3>
            {posts.length === 0 ? (
              <p className="text-stone-400 italic">Aucune publication pour le moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onClick={onPostClick} />
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
            <button 
              onClick={handleDownload}
              className="mt-8 mx-auto flex items-center gap-3 bg-white text-stone-900 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Télécharger l'image
            </button>
          </div>
        </div>
      )}
    </>
  );
};
