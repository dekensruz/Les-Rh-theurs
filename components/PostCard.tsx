
import React from 'react';
import { Post } from '../types.ts';

interface PostCardProps {
  post: Post & { profiles?: any };
  onClick: (post: Post) => void;
  onUserClick?: (userId: string) => void;
  hideAuthor?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick, onUserClick, hideAuthor = false }) => {
  const date = new Date(post.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUserClick && post.user_id) onUserClick(post.user_id);
  };

  const hasAccount = !!post.user_id;
  const profileData = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
  const avatarUrl = profileData?.avatar_url;

  return (
    <div 
      onClick={() => onClick(post)}
      className="group bg-white border border-stone-200 rounded-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full relative overflow-hidden paper-texture"
    >
      <div className="h-44 md:h-48 w-full overflow-hidden bg-stone-100 relative">
        {post.cover_url ? (
          <img 
            src={post.cover_url} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" 
            alt="Cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20 bg-stone-900 text-white font-serif text-5xl">
            {post.title.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="p-6 md:p-8 flex flex-col flex-grow">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-widest mb-4 border border-amber-100">
            {post.category}
          </span>
          <h3 className="font-serif text-xl md:text-2xl text-stone-900 mb-2 leading-tight group-hover:text-amber-800 transition-colors duration-300">
            {post.title}
          </h3>
          <p className="text-stone-500 italic text-sm">
            {post.book_title} <span className="text-stone-300 mx-1">/</span> {post.book_author}
          </p>
        </div>

        <p className="text-stone-600 line-clamp-3 flex-grow text-sm leading-relaxed mb-6 font-light">
          {post.content}
        </p>

        {!hideAuthor ? (
          <div className="mt-auto flex items-center justify-between pt-5 border-t border-stone-50">
            <div 
              className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${hasAccount ? 'hover:bg-stone-50 cursor-pointer' : ''}`}
              onClick={hasAccount ? handleUserClick : undefined}
            >
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0 border border-stone-200">
                {avatarUrl ? (
                  <img src={avatarUrl} className="w-full h-full object-cover" alt="User" />
                ) : (
                  <div className="w-full h-full bg-stone-900 flex items-center justify-center text-white text-[10px] font-bold">
                    {post.user_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-stone-800 group-hover:text-amber-700 transition-colors">{post.user_name}</span>
                {hasAccount && <span className="text-[8px] text-stone-400 uppercase tracking-tighter">Voir le profil</span>}
              </div>
            </div>
            <span className="text-[9px] text-stone-400 font-medium tracking-tighter italic">
              {date}
            </span>
          </div>
        ) : (
          <div className="mt-auto pt-5 border-t border-stone-50 text-right">
            <span className="text-[9px] text-stone-400 font-medium tracking-tighter italic">
              Publié le {date}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
