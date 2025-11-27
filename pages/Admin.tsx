import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Upload, Users, Film, HardDrive, BarChart3, Search, Filter, ChevronLeft, ChevronRight, Edit, Trash2, Square, CheckSquare, X, CheckCircle, Archive, AlertCircle, Save, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../components/ui/Button';

const data = [
  { name: 'Mon', views: 4000 },
  { name: 'Tue', views: 3000 },
  { name: 'Wed', views: 2000 },
  { name: 'Thu', views: 2780 },
  { name: 'Fri', views: 1890 },
  { name: 'Sat', views: 2390 },
  { name: 'Sun', views: 3490 },
];

// Mock Data Generators
const generateMockMovies = (count: number) => {
  const genres = ['Sci-Fi', 'Action', 'Drama', 'Thriller', 'Horror', 'Adventure'];
  return Array.from({ length: count }, (_, i) => ({
    id: `MOV-${1000 + i}`,
    title: `Cinematic Masterpiece ${i + 1}`,
    description: `A gripping story of ${genres[Math.floor(Math.random() * genres.length)]} proportions that will leave you on the edge of your seat.`,
    director: `Director ${i + 1}`,
    genre: genres[Math.floor(Math.random() * genres.length)],
    year: 2020 + Math.floor(Math.random() * 5),
    quality: Math.random() > 0.3 ? '4K' : 'HD',
    rating: (3 + Math.random() * 2).toFixed(1),
    views: Math.floor(Math.random() * 50000).toLocaleString(),
    status: Math.random() > 0.1 ? 'Published' : 'Draft'
  }));
};

const generateMockUsers = (count: number) => {
  const plans = ['Free', 'Basic', 'Premium', 'Ultra'];
  return Array.from({ length: count }, (_, i) => ({
    id: `USR-${5000 + i}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    plan: plans[Math.floor(Math.random() * plans.length)],
    status: Math.random() > 0.95 ? 'Suspended' : 'Active',
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString()
  }));
};

const ITEMS_PER_PAGE = 20;

type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: string;
  direction: SortDirection;
}

// Extracted for performance optimization
const SortableHeader = ({ 
  label, 
  sortKey, 
  align = 'left', 
  sortConfig, 
  onSort 
}: { 
  label: string, 
  sortKey: string, 
  align?: 'left' | 'right',
  sortConfig: SortConfig | null,
  onSort: (key: string) => void
}) => (
  <th 
    className={`p-4 cursor-pointer hover:bg-white/5 transition-colors select-none group ${align === 'right' ? 'text-right' : 'text-left'}`}
    onClick={() => onSort(sortKey)}
  >
    <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      {label}
      <span className="text-gray-600 group-hover:text-gray-400">
        {sortConfig?.key === sortKey ? (
          sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-violet-500" /> : <ArrowDown size={14} className="text-violet-500" />
        ) : (
          <ArrowUpDown size={14} />
        )}
      </span>
    </div>
  </th>
);

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'movies' | 'users'>('movies');
  
  // Data State - Increased count to demonstrate efficient pagination
  const [movies, setMovies] = useState(() => generateMockMovies(125));
  const [users, setUsers] = useState(() => generateMockUsers(145));

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [moviePage, setMoviePage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Reset selection, sort, and search when tab changes
  useEffect(() => {
    setSelectedIds(new Set());
    setIsEditModalOpen(false);
    setEditingItem(null);
    setSortConfig(null);
    setSearchQuery('');
  }, [activeTab]);

  // Derived Variables
  const currentDataList = activeTab === 'movies' ? movies : users;
  const currentPage = activeTab === 'movies' ? moviePage : userPage;

  // Filter Logic
  const filteredData = useMemo(() => {
    if (!searchQuery) return currentDataList;
    const lowerQuery = searchQuery.toLowerCase();
    
    return currentDataList.filter((item: any) => {
      if (activeTab === 'movies') {
        return (
          item.title.toLowerCase().includes(lowerQuery) ||
          item.genre.toLowerCase().includes(lowerQuery) ||
          item.status.toLowerCase().includes(lowerQuery)
        );
      } else {
        return (
          item.name.toLowerCase().includes(lowerQuery) ||
          item.email.toLowerCase().includes(lowerQuery) ||
          item.plan.toLowerCase().includes(lowerQuery)
        );
      }
    });
  }, [currentDataList, searchQuery, activeTab]);

  // Reset pagination when search query changes
  useEffect(() => {
    if (activeTab === 'movies') setMoviePage(1);
    else setUserPage(1);
  }, [searchQuery, activeTab]);

  // Sorting Logic (applied on filteredData)
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric parsing for views (remove commas)
        if (sortConfig.key === 'views') {
           aValue = typeof aValue === 'string' ? parseInt(aValue.replace(/,/g, ''), 10) : aValue;
           bValue = typeof bValue === 'string' ? parseInt(bValue.replace(/,/g, ''), 10) : bValue;
        }
        
        // Handle dates
        if (sortConfig.key === 'lastLogin') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  // Auto-adjust page if out of bounds (e.g. after filtering or deleting)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      if (activeTab === 'movies') setMoviePage(totalPages);
      else setUserPage(totalPages);
    }
  }, [totalPages, currentPage, activeTab]);

  const getPaginatedData = (data: any[], page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  const currentItems = getPaginatedData(sortedData, currentPage);

  // Handlers
  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Selection Logic
  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    const allCurrentSelected = currentItems.every((item: any) => newSelected.has(item.id));
    
    if (allCurrentSelected) {
      currentItems.forEach((item: any) => newSelected.delete(item.id));
    } else {
      currentItems.forEach((item: any) => newSelected.add(item.id));
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = currentItems.length > 0 && currentItems.every((item: any) => selectedIds.has(item.id));
  
  // Bulk Actions
  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) {
      if (activeTab === 'movies') {
        setMovies(prev => prev.filter(m => !selectedIds.has(m.id)));
      } else {
        setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
      }
      setSelectedIds(new Set());
    }
  };

  const handleBulkStatusChange = (status: string) => {
    if (activeTab === 'movies') {
      setMovies(prev => prev.map(m => selectedIds.has(m.id) ? { ...m, status } : m));
    } else {
      setUsers(prev => prev.map(u => selectedIds.has(u.id) ? { ...u, status } : u));
    }
    setSelectedIds(new Set());
  };

  // Pagination Handlers
  const setPage = (newPage: number) => {
    if (activeTab === 'movies') setMoviePage(newPage);
    else setUserPage(newPage);
  };

  // Edit Handlers
  const openEditModal = (item: any) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (activeTab === 'movies') {
      setMovies(prev => prev.map(m => m.id === editingItem.id ? editingItem : m));
    } else {
      setUsers(prev => prev.map(u => u.id === editingItem.id ? editingItem : u));
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 px-6 md:px-12 pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of platform performance</p>
        </div>
        <Button variant="primary" icon={<Upload size={18} />}>Upload Movie</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: 'Total Users', value: '124.5K', icon: Users, change: '+12%', color: 'text-blue-400' },
          { title: 'Active Streams', value: '1.2K', icon: Film, change: '+5%', color: 'text-violet-400' },
          { title: 'Revenue', value: '$425K', icon: BarChart3, change: '+18%', color: 'text-green-400' },
          { title: 'Storage Used', value: '45TB', icon: HardDrive, change: '85%', color: 'text-orange-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 border border-white/5 p-6 rounded-xl hover:border-violet-500/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-gray-800 rounded-lg ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded">{stat.change}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-white/5 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-6">Viewership Analytics</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
                <YAxis stroke="#666" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }} 
                />
                <Area type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upload Form (Mini) */}
        <div className="bg-gray-900 border border-white/5 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-6">Quick Upload</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Movie Title</label>
              <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none" placeholder="Enter title" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Genre</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none">
                <option>Action</option>
                <option>Sci-Fi</option>
                <option>Drama</option>
              </select>
            </div>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-violet-500 hover:text-violet-500 cursor-pointer transition-colors">
              <Upload size={32} className="mb-2" />
              <span className="text-sm">Drag poster file here</span>
            </div>
            <Button className="w-full" variant="primary">Proceed to Upload</Button>
          </form>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden relative">
        
        {/* Bulk Action Toolbar - Overlays Header if items selected */}
        {selectedIds.size > 0 && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-violet-900/90 backdrop-blur-md p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 border-b border-violet-500/30">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-violet-600 p-1.5 rounded text-white">
                 <CheckSquare size={20} />
              </div>
              <span className="font-bold text-lg">{selectedIds.size} Selected</span>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab === 'movies' ? (
                <>
                  <button onClick={() => handleBulkStatusChange('Published')} className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg border border-green-500/20 transition-colors font-medium">
                    <CheckCircle size={18} /> Publish
                  </button>
                  <button onClick={() => handleBulkStatusChange('Draft')} className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded-lg border border-yellow-500/20 transition-colors font-medium">
                    <Archive size={18} /> Unpublish
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleBulkStatusChange('Active')} className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg border border-green-500/20 transition-colors font-medium">
                    <CheckCircle size={18} /> Activate
                  </button>
                  <button onClick={() => handleBulkStatusChange('Suspended')} className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 rounded-lg border border-orange-500/20 transition-colors font-medium">
                    <AlertCircle size={18} /> Suspend
                  </button>
                </>
              )}
              
              <div className="w-px h-8 bg-white/20 mx-1"></div>
              
              <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-900/20 transition-colors font-medium">
                <Trash2 size={18} /> Delete
              </button>
              
              <button onClick={() => setSelectedIds(new Set())} className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Tabs & Filters */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-800 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('movies')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'movies' ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Movies
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Users
            </button>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder={`Search ${activeTab}...`} 
                 className="w-full bg-gray-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-violet-500 placeholder-gray-500"
               />
               {searchQuery && (
                 <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                   <X size={14} />
                 </button>
               )}
             </div>
             <button className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white">
               <Filter size={18} />
             </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 w-10">
                  <button onClick={handleSelectAll} className="flex items-center justify-center text-gray-400 hover:text-white">
                    {isAllSelected ? <CheckSquare size={20} className="text-violet-500" /> : <Square size={20} />}
                  </button>
                </th>
                {activeTab === 'movies' ? (
                  <>
                    <SortableHeader label="Title" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Genre" sortKey="genre" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Quality" sortKey="quality" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Views" sortKey="views" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
                    <th className="p-4 text-right">Actions</th>
                  </>
                ) : (
                  <>
                    <SortableHeader label="User" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Plan" sortKey="plan" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader label="Last Login" sortKey="lastLogin" sortConfig={sortConfig} onSort={handleSort} />
                    <th className="p-4 text-right">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {activeTab === 'movies' && currentItems.map((movie: any) => (
                <tr 
                  key={movie.id} 
                  className={`hover:bg-white/5 transition-colors group ${selectedIds.has(movie.id) ? 'bg-violet-900/10' : ''}`}
                >
                  <td className="p-4">
                    <button onClick={() => handleSelectRow(movie.id)} className="flex items-center justify-center text-gray-400 hover:text-white">
                       {selectedIds.has(movie.id) ? <CheckSquare size={20} className="text-violet-500" /> : <Square size={20} />}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden">
                        <img src={`https://picsum.photos/seed/${movie.id}/100/150`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{movie.title}</div>
                        <div className="text-xs text-gray-500">{movie.year} • {movie.rating} ★</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{movie.genre}</td>
                  <td className="p-4">
                     <span className={`text-xs font-bold px-2 py-1 rounded ${movie.quality === '4K' ? 'bg-violet-900/50 text-violet-300' : 'bg-gray-800 text-gray-400'}`}>
                       {movie.quality}
                     </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{movie.views}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${movie.status === 'Published' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {movie.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(movie)}
                        className="p-1.5 hover:bg-violet-600 rounded text-gray-400 hover:text-white transition-colors"
                        title="Edit Movie"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm('Delete this movie?')) {
                             setMovies(prev => prev.filter(m => m.id !== movie.id));
                          }
                        }}
                        className="p-1.5 hover:bg-red-600 rounded text-gray-400 hover:text-white transition-colors"
                        title="Delete Movie"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {activeTab === 'users' && currentItems.map((user: any) => (
                <tr 
                  key={user.id} 
                  className={`hover:bg-white/5 transition-colors group ${selectedIds.has(user.id) ? 'bg-violet-900/10' : ''}`}
                >
                  <td className="p-4">
                    <button onClick={() => handleSelectRow(user.id)} className="flex items-center justify-center text-gray-400 hover:text-white">
                       {selectedIds.has(user.id) ? <CheckSquare size={20} className="text-violet-500" /> : <Square size={20} />}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold">
                         {user.name.charAt(0)}
                       </div>
                       <div>
                         <div className="font-medium text-white">{user.name}</div>
                         <div className="text-xs text-gray-500">{user.email}</div>
                       </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">{user.plan}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{user.lastLogin}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-1.5 hover:bg-violet-600 rounded text-gray-400 hover:text-white transition-colors"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm('Delete this user?')) {
                             setUsers(prev => prev.filter(u => u.id !== user.id));
                          }
                        }}
                        className="p-1.5 hover:bg-red-600 rounded text-gray-400 hover:text-white transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-gray-800/30">
          <span className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length)} of {sortedData.length} results
          </span>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-white/10 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="px-4 text-sm font-medium text-white">
               Page {currentPage} of {Math.max(1, totalPages)}
            </div>

            <button 
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-white/10 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <Edit size={20} className="text-violet-500" />
              Edit {activeTab === 'movies' ? 'Movie' : 'User'}
            </h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {activeTab === 'movies' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                    <input 
                      type="text" 
                      value={editingItem.title} 
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Director</label>
                    <input 
                      type="text" 
                      value={editingItem.director || ''} 
                      onChange={(e) => setEditingItem({ ...editingItem, director: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea 
                      rows={3}
                      value={editingItem.description || ''} 
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Genre</label>
                      <select 
                        value={editingItem.genre}
                        onChange={(e) => setEditingItem({ ...editingItem, genre: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                      >
                        {['Sci-Fi', 'Action', 'Drama', 'Thriller', 'Horror', 'Adventure'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
                      <input 
                        type="number"
                        value={editingItem.year}
                        onChange={(e) => setEditingItem({ ...editingItem, year: parseInt(e.target.value) })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Quality</label>
                      <select 
                        value={editingItem.quality}
                        onChange={(e) => setEditingItem({ ...editingItem, quality: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                      >
                        <option value="4K">4K</option>
                        <option value="HD">HD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                      <select 
                        value={editingItem.status}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10"
                      value={editingItem.rating} 
                      onChange={(e) => setEditingItem({ ...editingItem, rating: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <input 
                      type="text" 
                      value={editingItem.name} 
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={editingItem.email} 
                      onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Plan</label>
                      <select 
                        value={editingItem.plan}
                        onChange={(e) => setEditingItem({ ...editingItem, plan: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                      >
                        {['Free', 'Basic', 'Premium', 'Ultra'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                      <select 
                        value={editingItem.status}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-violet-500 focus:outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  className="flex-1"
                  icon={<Save size={18} />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};