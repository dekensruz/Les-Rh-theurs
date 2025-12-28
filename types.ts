
export interface Post {
  id: string;
  created_at: string;
  title: string;
  book_title: string;
  book_author: string;
  content: string;
  user_name: string;
  category: string;
  cover_url?: string;
  user_id?: string;
}

export interface Reply {
  id: string;
  created_at: string;
  post_id: string;
  user_id: string;
  user_name: string;
  content: string;
  quoted_text?: string;
  parent_reply_id?: string;
}

export interface Circle {
  id: string;
  created_at: string;
  name: string;
  description: string;
  theme: string;
  is_private: boolean;
  cover_url?: string;
  creator_id: string;
}

export interface CircleReading {
  id: string;
  circle_id: string;
  book_title: string;
  book_author: string;
  end_date: string;
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export enum PostCategory {
  FICTION = 'Fiction',
  NON_FICTION = 'Non-Fiction',
  POETRY = 'Poésie',
  PHILOSOPHY = 'Philosophie',
  SCIENCE = 'Sciences',
  HISTORY = 'Histoire'
}
