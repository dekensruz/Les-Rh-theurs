
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Profile } from '../types';
import { Button } from './Button';

interface ProfileModalProps {
  userId: string;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    getProfile();
  }, [userId]);

  async function getProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`username, full_name, avatar_url, bio`)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile({ 
        full_name: data?.full_name || '',
        username: data?.username || '',
        avatar_url: data?.avatar_url || '',
        bio: data?.bio || '',
        id: userId 
      } as Profile);
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: profile.full_name,
        username: profile.username || null,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      
      if (error) throw error;
      alert("Profil mis à jour !");
      onClose();
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    onClose();
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Sélectionnez une image.');
      
      const file = event.target.files[0];
      const fileName = `${userId}-${Math.random()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setProfile(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
    } catch (error: any) {
      alert("Erreur upload: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh] paper-texture">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-3xl text-stone-900">Mon Profil</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div 
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-50 bg-stone-50 shadow-inner cursor-zoom-in"
                onClick={() => profile?.avatar_url && setShowFullImage(true)}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-200 font-serif text-4xl">
                    {profile?.full_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-amber-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
              </label>
            </div>
            {uploading && <span className="text-[10px] text-amber-600 font-bold mt-2 animate-pulse uppercase">Upload...</span>}
          </div>

          <form onSubmit={updateProfile} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2">Nom Complet</label>
              <input required type="text" value={profile?.full_name || ''} onChange={e => setProfile({ ...profile!, full_name: e.target.value })} className="w-full px-5 py-3 bg-stone-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2">Bio</label>
              <textarea rows={3} value={profile?.bio || ''} onChange={e => setProfile({ ...profile!, bio: e.target.value })} className="w-full px-5 py-3 bg-stone-50 border-none rounded-2xl outline-none resize-none focus:ring-2 focus:ring-amber-500/20" placeholder="Votre passion pour les livres..." />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button type="submit" isLoading={updating} className="w-full py-4">Enregistrer les modifications</Button>
              <button 
                type="button" 
                onClick={handleLogout}
                className="w-full py-4 text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-colors mt-2"
              >
                Se déconnecter de la plateforme
              </button>
            </div>
          </form>
        </div>
      </div>

      {showFullImage && profile?.avatar_url && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur animate-in fade-in duration-300">
          <button onClick={() => setShowFullImage(false)} className="absolute top-10 right-10 text-white/50 hover:text-white">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="relative group max-w-2xl w-full text-center">
            <img src={profile.avatar_url} className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/10" alt="Full portrait" />
          </div>
        </div>
      )}
    </>
  );
};
