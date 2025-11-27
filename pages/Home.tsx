import React, { useState } from 'react';
import { Play, Info } from 'lucide-react';
import { MOCK_MOVIES, CATEGORIES } from '../constants';
import { MovieCard } from '../components/MovieCard';
import { Button } from '../components/ui/Button';
import { Movie } from '../types';

interface HomeProps {
  onMovieSelect: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
}

export const Home: React.FC<HomeProps> = ({ onMovieSelect, onPlay }) => {
  const featuredMovie = MOCK_MOVIES[0];

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={featuredMovie.bannerUrl} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 pb-32 md:pb-48 flex flex-col justify-end h-full z-10">
          <div className="max-w-2xl animate-in slide-in-from-bottom-10 duration-700 fade-in">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-black bg-white rounded-full uppercase">
              #1 in Trending
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-4 leading-tight">
              {featuredMovie.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm md:text-base text-gray-300 mb-6">
              <span className="text-green-400 font-bold">{featuredMovie.rating} Match</span>
              <span>{featuredMovie.year}</span>
              <span className="border border-gray-600 px-1 rounded text-xs">4K</span>
              <span>{featuredMovie.genre.join(' • ')}</span>
            </div>

            <p className="text-gray-300 text-lg mb-8 line-clamp-3 md:line-clamp-none max-w-xl">
              {featuredMovie.description}
            </p>

            <div className="flex items-center gap-6">
              <Button 
                variant="primary" 
                size="lg" 
                icon={<Play size={20} fill="currentColor" />}
                onClick={() => onPlay(featuredMovie)}
              >
                Play Now
              </Button>
              <Button 
                variant="glass" 
                size="lg" 
                icon={<Info size={20} />}
                onClick={() => onMovieSelect(featuredMovie)}
              >
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Rows */}
      <div className="relative z-10 -mt-20 space-y-12 pl-6 md:pl-12">
        {CATEGORIES.map((category) => {
          const movies = MOCK_MOVIES.filter(category.filter);
          if (movies.length === 0) return null;

          return (
            <div key={category.id} className="animate-in slide-in-from-bottom-5 duration-700 fade-in">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-violet-600 rounded-full"></span>
                {category.name}
              </h2>
              <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar scroll-smooth">
                {movies.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onClick={onMovieSelect} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};