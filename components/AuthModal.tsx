
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Button } from './Button';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const translateError = (error: string) => {
    if (error.includes('Invalid login credentials')) return "Identifiants incorrects. Veuillez vérifier votre email et mot de passe.";
    if (error.includes('Email not confirmed')) return "Veuillez confirmer votre adresse email avant de vous connecter.";
    if (error.includes('User already registered')) return "Cet email est déjà utilisé par un autre Rhéteur.";
    if (error.includes('Password should be at least')) return "Le mot de passe doit contenir au moins 6 caractères.";
    return "Une erreur est survenue lors de l'authentification.";
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        setSuccessMsg("Inscription réussie ! Veuillez vérifier votre boîte mail pour valider votre compte.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      }
    } catch (error: any) {
      setErrorMsg(translateError(error.message));
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white w-full max-md rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="font-serif text-2xl text-stone-900 mb-4">Vérifiez vos emails</h2>
          <p className="text-stone-600 mb-8 leading-relaxed">{successMsg}</p>
          <Button onClick={onClose} className="w-full">J'ai compris</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 overflow-hidden relative paper-texture">
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h2 className="font-serif text-3xl text-stone-900 mb-2 text-center">
          {isSignUp ? 'Rejoindre le Salon' : 'Se Connecter'}
        </h2>
        <p className="text-stone-500 text-center text-sm mb-8">Participez à la vie littéraire des Rhéteurs.</p>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-3 animate-in shake duration-300">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Nom Complet</label>
              <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-5 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Mot de passe</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all" />
          </div>

          <Button type="submit" isLoading={loading} className="w-full mt-6 py-4 shadow-xl">
            {isSignUp ? "Créer mon accès" : "Entrer au Salon"}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-stone-500">
          {isSignUp ? "Déjà membre ?" : "Nouveau Rhéteur ?"} 
          <button onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }} className="ml-2 text-amber-600 font-bold hover:underline">
            {isSignUp ? "Se connecter" : "S'inscrire gratuitement"}
          </button>
        </p>
      </div>
    </div>
  );
};
