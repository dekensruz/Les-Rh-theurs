
import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement
// Vite et Vercel remplacent souvent import.meta.env.VITE_... statiquement lors du build.
// On vérifie aussi process.env pour les environnements qui le supportent.

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 
  '';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || 
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "ERREUR CRITIQUE : Identifiants Supabase manquants.\n" +
    "Veuillez configurer les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.\n" +
    "Sur Vercel : ajoutez-les dans Settings > Environment Variables."
  );
}

// On initialise le client même si les variables manquent pour éviter un crash au chargement,
// mais les requêtes échoueront avec un message explicite.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
