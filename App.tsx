
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabase';
import { Post, Profile } from './types';
import { PostCard } from './components/PostCard';
import { PostModal } from './components/PostModal';
import { PostForm } from './components/PostForm';
import { Button } from './components/Button';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SearchBar } from './components/SearchBar';
import { Dashboard } from './components/Dashboard';

type AppView = 'salon' | 'dashboard';

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [currentView, setCurrentView] = useState<AppView>('salon');
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => setProfile(data));
    } else {
      setProfile(null);
      setCurrentView('salon');
    }
  }, [session]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSavePost = async (postData: any) => {
    try {
      if (postData.id) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postData.id);
        if (error) throw error;
      } else {
        const postToSave = {
          ...postData,
          user_id: session?.user?.id || null
        };
        const { error } = await supabase.from('posts').insert([postToSave]);
        if (error) throw error;
      }
      
      setIsFormOpen(false);
      setEditingPost(null);
      await fetchPosts();
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet exposé ?")) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      if (selectedPost?.id === postId) setSelectedPost(null);
      await fetchPosts();
    } catch (err: any) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  const startEdit = (post: Post) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtrage combiné : Vue (Salon/Mien) + Catégorie + Recherche
  const displayPosts = useMemo(() => {
    let result = posts;

    // 1. Vue
    if (currentView === 'dashboard' && session?.user?.id) {
      result = result.filter(p => p.user_id === session.user.id);
    }

    // 2. Catégorie
    if (filter !== 'all') {
      result = result.filter(p => p.category === filter);
    }

    // 3. Recherche
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.book_title.toLowerCase().includes(q) || 
        p.book_author.toLowerCase().includes(q) ||
        p.user_name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [posts, currentView, filter, searchQuery, session]);

  return (
    <div className="min-h-screen pb-20 selection:bg-amber-200 bg-[#fdfbf7]">
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 via-stone-900 to-amber-200 z-50"></div>
      
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => { setCurrentView('salon'); scrollToTop(); }}>
            <div className="w-9 h-9 md:w-11 md:h-11 bg-stone-900 rounded-xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <span className="font-serif text-xl md:text-2xl font-bold">R</span>
            </div>
            <div className="flex flex-col">
              <h1 className="font-serif text-lg md:text-2xl font-extrabold text-stone-900 tracking-tight leading-none">Les Rhéteurs</h1>
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-amber-600 mt-0.5 md:mt-1">L'Agora Littéraire</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {session ? (
              <>
                <button 
                  onClick={() => setCurrentView(currentView === 'salon' ? 'dashboard' : 'salon')}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${currentView === 'dashboard' ? 'bg-amber-100 text-amber-900' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {currentView === 'salon' ? 'Mon Espace' : 'Le Salon'}
                </button>
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-stone-200 overflow-hidden hover:scale-105 transition-transform shadow-sm"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-[10px]">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>
              </>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="text-[10px] md:text-sm font-bold text-stone-600 hover:text-stone-900 uppercase tracking-widest mr-2">
                Connexion
              </button>
            )}
            <Button variant="primary" className="text-xs md:text-base px-3 py-1.5 md:px-6 md:py-2.5" onClick={() => { setEditingPost(null); setIsFormOpen(true); }}>
              Partager
            </Button>
          </div>
        </div>
      </nav>

      <header className="relative pt-12 md:pt-20 pb-12 text-center px-4">
        <h2 className="font-serif text-4xl md:text-7xl text-stone-900 mb-6 leading-tight">
          {currentView === 'salon' ? (
            <>Le salon des <br/><span className="italic font-normal text-amber-700">belles lettres.</span></>
          ) : (
            <>Votre espace <br/><span className="italic font-normal text-amber-700">de réflexion.</span></>
          )}
        </h2>
        
        <div className="max-w-2xl mx-auto px-4 mt-8">
          <SearchBar 
            posts={posts} 
            onSearch={setSearchQuery} 
            placeholder={currentView === 'salon' ? "Chercher une œuvre au salon..." : "Chercher parmi vos exposés..."}
          />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {['all', 'Fiction', 'Non-Fiction', 'Philosophie', 'Poésie', 'Histoire'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-[10px] md:text-sm font-bold transition-all duration-300 border ${filter === cat ? 'bg-stone-900 border-stone-900 text-white shadow-lg' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'}`}
              >
                {cat === 'all' ? 'Toutes catégories' : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-stone-100 h-64 rounded-3xl"></div>)}
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            {currentView === 'salon' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {displayPosts.map(post => (
                  <PostCard key={post.id} post={post} onClick={setSelectedPost} />
                ))}
              </div>
            ) : (
              <Dashboard 
                posts={displayPosts} 
                onEdit={startEdit} 
                onDelete={handleDeletePost} 
                onView={setSelectedPost} 
              />
            )}
            
            {displayPosts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-stone-200">
                <p className="text-stone-400 font-serif italic text-xl">Aucun résultat trouvé...</p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="mt-4 text-amber-600 font-bold hover:underline">Réinitialiser la recherche</button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {selectedPost && (
        <PostModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
          onEdit={startEdit}
          onDelete={handleDeletePost}
          currentUserId={session?.user?.id}
        />
      )}
      {isFormOpen && (
        <PostForm 
          onSave={handleSavePost} 
          onCancel={() => { setIsFormOpen(false); setEditingPost(null); }} 
          initialData={editingPost}
        />
      )}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      {isProfileOpen && session && <ProfileModal userId={session.user.id} onClose={() => setIsProfileOpen(false)} />}

      <footer className="mt-24 py-16 bg-stone-900 text-white rounded-t-[3rem] text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
             <div className="w-8 h-8 bg-amber-500 rounded rotate-12"></div>
             <p className="font-serif text-2xl italic text-amber-200">"Savoir lire, c'est savoir vivre."</p>
          </div>
          <span className="text-stone-500 text-[10px] uppercase tracking-[0.4em] font-medium">Les Rhéteurs — MMXXV</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
