import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Home as HomeIcon, Search, User, LogOut, Clapperboard, MonitorPlay, Play } from 'lucide-react';

import { Home } from './pages/Home';
import { AdminDashboard } from './pages/Admin';
import { VideoPlayer } from './components/VideoPlayer';
import { Button } from './components/ui/Button';
import { Movie } from './types';
import { AIChat } from './components/AIChat';

// Navbar Component
const Navbar = ({ isScrolled }: { isScrolled: boolean }) => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('admin');

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-violet-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
            <MonitorPlay size={24} className="text-white" />
          </div>
          <span className="text-xl md:text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            UMH
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/search" className="hover:text-white transition-colors">Movies</Link>
          <Link to="/series" className="hover:text-white transition-colors">Series</Link>
          <Link to="/new" className="hover:text-white transition-colors">New & Popular</Link>
          <Link to="/admin" className="text-violet-400 hover:text-violet-300 transition-colors">Admin Panel</Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-gray-300 hover:text-white transition-colors">
            <Search size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 border border-white/20 overflow-hidden cursor-pointer">
             <img src="https://picsum.photos/seed/user/100/100" alt="Profile" />
          </div>
        </div>
      </div>
    </nav>
  );
};

// Details Modal Component (simplified for single file structure)
const MovieDetailsModal = ({ movie, onClose, onPlay }: { movie: Movie, onClose: () => void, onPlay: () => void }) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <LogOut size={20} className="rotate-180" /> 
        </button>
        
        <div className="relative h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent z-10" />
          <img src={movie.bannerUrl} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
            <h2 className="text-4xl font-bold mb-2">{movie.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
               <span className="text-green-400 font-bold">{movie.rating} Match</span>
               <span>{movie.year}</span>
               <span className="border border-gray-600 px-1 rounded">{movie.quality}</span>
            </div>
            <div className="flex gap-4">
              <Button onClick={onPlay} icon={<Play size={18} fill="currentColor" />}>Play</Button>
              <Button variant="secondary">Add to Watchlist</Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
           <div className="md:col-span-2">
             <p className="text-gray-300 leading-relaxed mb-6">{movie.description}</p>
             <div className="flex gap-2 flex-wrap">
               {movie.genre.map(g => (
                 <span key={g} className="text-xs border border-white/20 px-3 py-1 rounded-full text-gray-300">{g}</span>
               ))}
             </div>
           </div>
           <div className="text-sm text-gray-400 space-y-2">
             <p><span className="text-gray-500">Cast:</span> {movie.cast.join(', ')}</p>
             <p><span className="text-gray-500">Director:</span> {movie.director}</p>
             <p><span className="text-gray-500">Duration:</span> {movie.duration}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide Navbar on player
  const showNav = !playingMovie;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-violet-600 selection:text-white">
      {showNav && <Navbar isScrolled={isScrolled} />}

      <Routes>
        <Route path="/" element={<Home onMovieSelect={setSelectedMovie} onPlay={setPlayingMovie} />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Modal Layers */}
      {selectedMovie && !playingMovie && (
        <MovieDetailsModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
          onPlay={() => {
            setPlayingMovie(selectedMovie);
            setSelectedMovie(null);
          }}
        />
      )}

      {playingMovie && (
        <VideoPlayer 
          movie={playingMovie} 
          onClose={() => setPlayingMovie(null)} 
        />
      )}

      {/* AI Assistant - Always available unless playing video */}
      {!playingMovie && <AIChat />}
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}