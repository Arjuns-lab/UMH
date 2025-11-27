export interface Movie {
  id: string;
  title: string;
  description: string;
  year: number;
  rating: number;
  duration: string;
  genre: string[];
  posterUrl: string;
  bannerUrl: string;
  videoUrl: string; // Using a placeholder for demo
  cast: string[];
  director: string;
  quality: 'HD' | '4K' | '8K';
  language: string;
  trending?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
  watchlist: string[];
}

export interface Category {
  id: string;
  name: string;
  filter: (movie: Movie) => boolean;
}

export type AppView = 'splash' | 'auth' | 'home' | 'details' | 'player' | 'admin' | 'profile' | 'search';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}
