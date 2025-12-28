
import React from 'react';
import { Post } from '../types';
import { Button } from './Button';

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  currentUserId?: string;
}

export const PostModal: React.FC<PostModalProps> = ({ post, onClose, onEdit, onDelete, currentUserId }) => {
  if (!post) return null;

  const isOwner = currentUserId && post.user_id === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fdfbf7] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative paper-texture">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 text-stone-400 hover:text-stone-900 bg-white/50 backdrop-blur-md rounded-full p-1 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {post.cover_url && (
          <div className="h-48 md:h-64 w-full">
            <img src={post.cover_url} className="w-full h-full object-cover shadow-inner" alt="Cover" />
          </div>
        )}

        <div className="p-6 md:p-12">
          <header className="mb-8 border-b border-stone-200 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-900 text-sm font-semibold rounded-full">
                {post.category}
              </span>
              
              {isOwner && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(post)}
                    className="p-2 text-stone-500 hover:text-amber-600 transition-colors bg-stone-100 rounded-lg"
                    title="Modifier"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button 
                    onClick={() => onDelete(post.id)}
                    className="p-2 text-stone-500 hover:text-red-600 transition-colors bg-stone-100 rounded-lg"
                    title="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>
            
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-2">{post.title}</h2>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-stone-500 text-base md:text-lg italic">Sur le livre</span>
              <span className="font-semibold text-stone-800 text-lg md:text-xl">"{post.book_title}"</span>
              <span className="text-stone-500">de</span>
              <span className="font-medium text-stone-800">{post.book_author}</span>
            </div>
            <div className="mt-4 flex items-center gap-3 text-stone-500 text-sm">
              <span>Par <span className="text-stone-900 font-semibold">{post.user_name}</span></span>
              <span>•</span>
              <span>Le {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </header>

          <article className="prose prose-stone max-w-none mb-10">
            <p className="text-stone-800 text-lg leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </article>

          <div className="flex justify-center mt-8">
            <Button onClick={onClose} variant="outline" className="w-full md:w-auto">Fermer la lecture</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
