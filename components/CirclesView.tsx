
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Circle, CircleReading, Profile } from '../types';
import { Button } from './Button';

interface CirclesViewProps {
  currentUserId?: string;
  onAuthRequired?: () => void;
}

export const CirclesView: React.FC<CirclesViewProps> = ({ currentUserId, onAuthRequired }) => {
  const [circles, setCircles] = useState<any[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMemberships, setUserMemberships] = useState<string[]>([]);
  const [circleMembers, setCircleMembers] = useState<Profile[]>([]);
  const [circleReadings, setCircleReadings] = useState<CircleReading[]>([]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditingReading, setIsEditingReading] = useState(false);
  const [readingForm, setReadingForm] = useState({ id: '', book_title: '', book_author: '', end_date: '' });

  useEffect(() => {
    fetchCircles();
    if (currentUserId) fetchUserMemberships();
  }, [currentUserId]);

  const fetchCircles = async () => {
    setLoading(true);
    try {
      const { data: circlesData } = await supabase.from('circles').select('*, circle_members(count)').order('created_at', { ascending: false });
      setCircles(circlesData || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchUserMemberships = async () => {
    const { data } = await supabase.from('circle_members').select('circle_id').eq('user_id', currentUserId);
    setUserMemberships(data?.map(m => m.circle_id) || []);
  };

  const fetchCircleDetails = async (circle: any) => {
    setSelectedCircle(circle);
    try {
      // Pour éviter [object Object], on extrait proprement le profil de la jointure
      const { data: membersData } = await supabase
        .from('circle_members')
        .select('profiles:user_id (*)')
        .eq('circle_id', circle.id);
      
      const { data: readings } = await supabase
        .from('circle_readings')
        .select('*')
        .eq('circle_id', circle.id)
        .order('created_at', { ascending: false });
      
      // Extraction sécurisée des profils
      const members = (membersData?.map((m: any) => {
        const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
        return p;
      }) || []).filter(Boolean);
      
      setCircleMembers(members);
      setCircleReadings(readings || []);
    } catch (err) {
      console.error("Erreur chargement cercle:", err);
    }
  };

  const joinCircle = async (circleId: string) => {
    if (!currentUserId) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    const { error } = await supabase.from('circle_members').insert([{ circle_id: circleId, user_id: currentUserId }]);
    if (!error) {
      fetchUserMemberships();
      fetchCircles();
    }
  };

  const handleReadingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCircle || !currentUserId) return;

    if (readingForm.id) {
      const { error } = await supabase
        .from('circle_readings')
        .update({ 
          book_title: readingForm.book_title, 
          book_author: readingForm.book_author, 
          end_date: readingForm.end_date 
        })
        .eq('id', readingForm.id);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from('circle_readings').insert([{ 
        circle_id: selectedCircle.id, 
        book_title: readingForm.book_title,
        book_author: readingForm.book_author,
        end_date: readingForm.end_date
      }]);
      if (error) return alert(error.message);
    }
    
    setReadingForm({ id: '', book_title: '', book_author: '', end_date: '' });
    setIsEditingReading(false);
    fetchCircleDetails(selectedCircle);
  };

  const startEditReading = (reading: CircleReading) => {
    setReadingForm({
      id: reading.id,
      book_title: reading.book_title,
      book_author: reading.book_author,
      end_date: reading.end_date
    });
    setIsEditingReading(true);
  };

  if (loading) return <div className="text-center py-20 font-serif italic text-stone-400">Ouverture des portes des cercles...</div>;

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h3 className="font-serif text-3xl md:text-5xl text-stone-900 mb-3">Communautés d'Esprit</h3>
          <p className="text-stone-500">Unissez vos réflexions autour d'un thème commun.</p>
        </div>
        <Button onClick={() => currentUserId ? setShowCreateForm(true) : onAuthRequired?.()}>Fonder un Cercle</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {circles.map(circle => {
          const isMember = userMemberships.includes(circle.id);
          const memberCount = circle.circle_members?.[0]?.count || 0;

          return (
            <div key={circle.id} className="bg-white border border-stone-100 rounded-[2.5rem] overflow-hidden flex flex-col group shadow-sm hover:shadow-xl transition-all h-[450px] paper-texture">
              <div className="h-40 relative bg-stone-100">
                {circle.cover_url ? <img src={circle.cover_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-900" />}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase">{circle.theme}</div>
              </div>
              <div className="p-8 flex-grow">
                <h3 className="font-serif text-2xl text-stone-900 mb-3">{circle.name}</h3>
                <p className="text-stone-500 text-sm line-clamp-3 italic mb-6">"{circle.description}"</p>
                <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-widest">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  {memberCount} Rhéteurs
                </div>
              </div>
              <div className="px-8 pb-8 flex gap-2">
                <Button onClick={() => fetchCircleDetails(circle)} variant="outline" className="flex-1 text-xs">Consulter</Button>
                {!isMember && <Button onClick={() => joinCircle(circle.id)} className="flex-1 text-xs">Rejoindre</Button>}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCircle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#fdfbf7] w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-[3rem] shadow-2xl relative paper-texture p-8 md:p-16">
            <button onClick={() => setSelectedCircle(null)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            
            <h2 className="font-serif text-4xl text-stone-900 mb-2">{selectedCircle.name}</h2>
            <p className="text-amber-700 font-bold uppercase tracking-widest text-xs mb-8">{selectedCircle.theme}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">Lecture Commune</h4>
                  {circleReadings.length > 0 && !isEditingReading ? (
                    <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm relative group">
                      <p className="font-serif text-xl text-stone-900">"{circleReadings[0].book_title}"</p>
                      <p className="text-stone-500 text-sm mb-4">par {circleReadings[0].book_author}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         FIN LE {new Date(circleReadings[0].end_date).toLocaleDateString()}
                      </div>
                      {selectedCircle.creator_id === currentUserId && (
                        <button 
                          onClick={() => startEditReading(circleReadings[0])}
                          className="absolute top-4 right-4 text-stone-300 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    !isEditingReading && <p className="text-stone-400 italic text-sm">Aucune lecture planifiée pour le moment.</p>
                  )}

                  {(isEditingReading || (selectedCircle.creator_id === currentUserId && circleReadings.length === 0)) && (
                    <form onSubmit={handleReadingSubmit} className="mt-6 space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                      <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">{isEditingReading ? "Modifier la lecture" : "Fixer une lecture"}</p>
                      <input required placeholder="Titre du livre" className="w-full p-3 bg-white rounded-xl text-xs outline-none shadow-sm" value={readingForm.book_title} onChange={e => setReadingForm({...readingForm, book_title: e.target.value})} />
                      <input required placeholder="Nom de l'auteur" className="w-full p-3 bg-white rounded-xl text-xs outline-none shadow-sm" value={readingForm.book_author} onChange={e => setReadingForm({...readingForm, book_author: e.target.value})} />
                      <input required type="date" className="w-full p-3 bg-white rounded-xl text-xs outline-none shadow-sm" value={readingForm.end_date} onChange={e => setReadingForm({...readingForm, end_date: e.target.value})} />
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 py-2 text-xs">{isEditingReading ? "Enregistrer" : "Publier"}</Button>
                        {isEditingReading && <Button type="button" variant="ghost" className="text-xs" onClick={() => setIsEditingReading(false)}>Annuler</Button>}
                      </div>
                    </form>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">Membres ({circleMembers.length})</h4>
                <div className="grid grid-cols-2 gap-4">
                  {circleMembers.map((member, idx) => (
                    <div key={member?.id || idx} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden shrink-0 border-2 border-amber-50">
                        {member?.avatar_url ? <img src={member.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300 font-serif">{member?.full_name?.charAt(0) || '?'}</div>}
                      </div>
                      <span className="text-[10px] font-bold text-stone-800 truncate">{member?.full_name || 'Anonyme'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
