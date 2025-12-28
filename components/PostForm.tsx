
import React, { useState, useEffect } from 'react';
import { Post, PostCategory } from '../types';
import { Button } from './Button';
import { supabase } from '../supabase';

interface PostFormProps {
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: Post | null;
}

export const PostForm: React.FC<PostFormProps> = ({ onSave, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    book_title: initialData?.book_title || '',
    book_author: initialData?.book_author || '',
    content: initialData?.content || '',
    category: (initialData?.category as PostCategory) || PostCategory.FICTION,
    user_name: initialData?.user_name || '',
    cover_url: initialData?.cover_url || '',
  });

  useEffect(() => {
    if (!initialData) {
      async function loadUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
          if (profile?.full_name) {
            setFormData(prev => ({ ...prev, user_name: profile.full_name }));
          }
        }
      }
      loadUser();
    }
  }, [initialData]);

  const handleUploadCover = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploadingCover(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, cover_url: data.publicUrl }));
    } catch (error: any) {
      alert("Erreur d'upload couverture: " + error.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content || !formData.book_title || !formData.user_name) return;
    
    setLoading(true);
    try {
      await onSave(initialData ? { ...formData, id: initialData.id } : formData);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 max-h-[95vh] overflow-y-auto paper-texture">
        <h2 className="font-serif text-3xl text-stone-900 mb-6 border-b border-stone-100 pb-4">
          {initialData ? 'Modifier l\'exposé' : 'Nouvel exposé'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative h-40 md:h-48 w-full bg-stone-100 rounded-xl overflow-hidden border-2 border-dashed border-stone-200 group">
            {formData.cover_url ? (
              <>
                <img src={formData.cover_url} className="w-full h-full object-cover" alt="Cover" />
                <button 
                  type="button" 
                  onClick={() => setFormData(p => ({...p, cover_url: ''}))}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-stone-200/50 transition-colors">
                {uploadingCover ? (
                   <span className="text-amber-600 font-bold animate-pulse">CHARGEMENT...</span>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-stone-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-stone-500 text-sm font-medium text-center px-4">Ajouter une photo de couverture (Optionnel)</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleUploadCover} disabled={uploadingCover} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Auteur de l'exposé</label>
              <input 
                required
                type="text" 
                value={formData.user_name}
                onChange={e => setFormData({ ...formData, user_name: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Rayon littéraire</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as PostCategory })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none"
              >
                {Object.values(PostCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Titre du Livre</label>
              <input 
                required
                type="text" 
                value={formData.book_title}
                onChange={e => setFormData({ ...formData, book_title: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Auteur de l'ouvrage</label>
              <input 
                type="text" 
                value={formData.book_author}
                onChange={e => setFormData({ ...formData, book_author: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Titre de votre réflexion</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Votre partage (Résumé, analyse, émotions)</label>
            <textarea 
              required
              rows={6}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl outline-none resize-none leading-relaxed"
              placeholder="Décrivez votre expérience de lecture..."
            />
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Fermer</Button>
            <Button type="submit" isLoading={loading}>{initialData ? 'Mettre à jour' : 'Publier au salon'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
