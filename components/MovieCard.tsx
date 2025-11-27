import React from 'react';
import { Play, Plus, Star } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  return (
    <div 
      className="group relative flex-shrink-0 w-[160px] md:w-[200px] cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10"
      onClick={() => onClick(movie)}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-xs font-bold text-yellow-400 flex items-center gap-1">
          <Star size={10} fill="currentColor" /> {movie.rating}
        </div>
        <div className="absolute top-2 left-2 bg-violet-600/80 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase">
          {movie.quality}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black via-black/50 to-transparent">
          <div className="flex gap-2 mb-3 justify-center">
            <button className="bg-white text-black p-2 rounded-full hover:bg-violet-400 transition-colors">
              <Play size={16} fill="currentColor" />
            </button>
            <button className="bg-gray-800/80 text-white p-2 rounded-full hover:bg-gray-700 border border-white/20 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <h3 className="text-white font-bold text-sm truncate">{movie.title}</h3>
          <p className="text-gray-300 text-xs mt-1 flex items-center gap-2">
            <span>{movie.year}</span>
            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
            <span className="truncate">{movie.genre[0]}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
