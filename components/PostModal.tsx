
import React, { useRef, useState } from 'react';
import { Post } from '../types';
import { Button } from './Button';
import { ReplySection } from './ReplySection';

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  currentUserId?: string;
  currentUserName?: string;
}

export const PostModal: React.FC<PostModalProps> = ({ post, onClose, onEdit, onDelete, currentUserId, currentUserName }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedQuote, setSelectedQuote] = useState('');
  const [quoteToInsert, setQuoteToInsert] = useState('');

  if (!post) return null;

  const isOwner = currentUserId && post.user_id === currentUserId;

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 5) {
      setSelectedQuote(selection.toString().trim());
    } else {
      setSelectedQuote('');
    }
  };

  const handleCiteAction = () => {
    setQuoteToInsert(selectedQuote);
    setSelectedQuote('');
    const modalEl = document.querySelector('.modal-scroll-container');
    if (modalEl) {
      modalEl.scrollTo({ top: modalEl.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fdfbf7] w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-3xl shadow-2xl relative paper-texture modal-scroll-container">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-stone-400 hover:text-stone-900 bg-white/50 backdrop-blur-md rounded-full p-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {post.cover_url && (
          <div className="h-40 md:h-80 w-full relative">
            <img src={post.cover_url} className="w-full h-full object-cover shadow-inner" alt="Cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] to-transparent opacity-40"></div>
          </div>
        )}

        <div className="p-6 md:p-16">
          <header className="mb-8 border-b border-stone-100 pb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">{post.category}</span>
              {isOwner && (
                <div className="flex gap-1.5">
                  <button onClick={() => onEdit(post)} className="p-2 text-stone-400 hover:text-amber-600 bg-stone-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => onDelete(post.id)} className="p-2 text-stone-400 hover:text-red-600 bg-stone-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              )}
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-stone-900 mb-4 leading-tight">{post.title}</h2>
            <p className="text-stone-500 text-sm md:text-lg italic">Sur <span className="text-stone-800 font-semibold not-italic">"{post.book_title}"</span> de {post.book_author}</p>
          </header>

          <article ref={contentRef} onMouseUp={handleMouseUp} className="prose prose-stone prose-lg max-w-none mb-12 selection:bg-amber-100">
            <p className="text-stone-800 leading-[1.7] whitespace-pre-wrap font-light">{post.content}</p>
          </article>

          {/* Citation bar flottante optimisée responsive */}
          {selectedQuote && (
            <div className="fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 z-[60] p-2 md:p-3 bg-stone-900/95 backdrop-blur text-white rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-bottom-5 duration-300 w-[92vw] md:w-auto md:max-w-xl border border-white/10">
              <p className="text-[10px] md:text-xs italic text-stone-300 truncate flex-1 pl-2">"{selectedQuote}"</p>
              <button 
                onClick={handleCiteAction}
                className="whitespace-nowrap bg-amber-500 text-stone-900 px-3 py-1.5 md:px-5 md:py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95"
              >
                CITER
              </button>
              <button onClick={() => setSelectedQuote('')} className="pr-2 text-stone-500 hover:text-white">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <ReplySection 
            postId={post.id} 
            currentUserId={currentUserId} 
            userName={currentUserName}
            externalQuote={quoteToInsert}
            onQuoteUsed={() => setQuoteToInsert('')}
          />

          <div className="flex justify-center mt-12 mb-4 border-t border-stone-100 pt-8">
            <Button onClick={onClose} variant="outline" className="w-full md:w-auto px-10 rounded-2xl">Refermer l'ouvrage</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
