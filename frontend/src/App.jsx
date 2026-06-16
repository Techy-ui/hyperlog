import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from './api'; 
import ReactMarkdown from 'react-markdown';
import { 
  Terminal, Search, Layout, BookOpen, User, 
  BarChart3, LogOut, PlusCircle, ThumbsUp, 
  Filter, Grid, CheckCircle, Upload, Sun, Moon,
  ArrowLeft, Compass, Home, Key, Settings, ShieldCheck,
  Code2, ArrowRight, Lock
} from 'lucide-react';

function App() {

  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // High-quality programming fallback images for default cover cards
  const fallbackImages = [
    "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800",
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"
  ];

  // Fixed pool of guaranteed developer vector avatars assigned deterministically 
  const avatarPool = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=0d1117,161b22",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka&backgroundColor=0d1117,161b22",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Jack&backgroundColor=0d1117,161b22",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Boots&backgroundColor=0d1117,161b22",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Midnight&backgroundColor=0d1117,161b22",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Spark&backgroundColor=0d1117,161b22"
  ];

  // Helper utility to resolve a constant, random avatar from details string
  const getUserAvatar = (userObj) => {
    if (!userObj) return "https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=0d1117,161b22";
    const seedString = userObj.username || userObj.email || "default";
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatarPool.length;
    return avatarPool[index];
  };

  // Determine current view tab directly from the browser window's URL path
  const currentView = location.pathname === '/' ? 'feed' : location.pathname.substring(1);

  // Helper routing abstraction to move between tab configurations cleanly
  const setCurrentView = (viewName) => {
    if (viewName === 'feed') navigate('/');
    else navigate(`/${viewName}`);
  };

  const [darkMode, setDarkMode] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  // Authentication & Configuration States
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Strict Clap Constraint Memory Registry
  const [clappedPosts, setClappedPosts] = useState([]);

  // Baseline Content Feed Array populated with starter guides
  const [posts, setPosts] = useState([
    {
      _id: "init-1",
      title: "Mastering FCFS and SJF CPU Scheduling Algorithms in C",
      content: "### Introduction to Operating System Scheduling\nIn process management, CPU scheduling determines which process gets the CPU core execution time first.\n\n#### 1. First-Come, First-Served (FCFS)\nFCFS is non-preemptive. The process that requests the CPU first gets it first. It is simple but can cause the **Convoy Effect**.\n\n```c\n// Simple FCFS Arrival logic snapshot\nfor(int i=0; i<n; i++) {\n    waiting_time[i] = completion_time[i-1] - arrival_time[i];\n}\n```\n\n#### 2. Shortest Job First (SJF)\nSJF selects the process with the shortest execution burst time next, minimizing average waiting time drastically.",
      tags: ["c", "os", "algorithms", "beginners"],
      claps: 245,
      readingTime: "6 min read",
      category: "C Programming",
      author: { username: "system_architect" },
      coverImage: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800",
      isUserGenerated: false,
      createdAt: "2026-01-15T10:00:00.000Z"
    },
    {
      _id: "init-2",
      title: "Getting Started with React: Setting Up Your First App via Vite",
      content: "### Why avoid Create-React-App?\nLegacy compilation setups introduce heavy overhead. Modern modular workflows lean on **Vite** for light-speed browser updates.\n\n```bash\nnpm create vite@latest my-first-app -- --template react\ncd my-first-app\nnpm install\nnpm run dev\n```",
      tags: ["react", "vite", "javascript", "beginners"],
      claps: 189,
      readingTime: "4 min read",
      category: "React.js",
      author: { username: "rishabh_dev" },
      coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      isUserGenerated: false,
      createdAt: "2026-02-20T14:30:00.000Z"
    }
  ]);

  // Form Inputs and Global Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('React.js');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [inlineImageUrl, setInlineImageUrl] = useState('');

 
  const fetchLiveDbData = async () => {
    try {
      const response = await API.get('/posts');
      if (response.data && response.data.length > 0) {
        setPosts(prev => {
          const incomingUserGenerated = response.data.map(p => ({ ...p, isUserGenerated: true }));
          const combined = [...incomingUserGenerated, ...prev];
          const uniqueMap = new Map();
          combined.forEach(post => {
            if (post._id && !uniqueMap.has(post._id)) {
              uniqueMap.set(post._id, post);
            }
          });
          return Array.from(uniqueMap.values());
        });
      }
    } catch (err) {
      console.log("Database connection idle. Rendering operational cached layers.");
    }
  };
  useEffect(() => {
    const isFirstLoad = !sessionStorage.getItem('initialized');
    
    if (isFirstLoad) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      sessionStorage.setItem('initialized', 'true');
      navigate('/', { replace: true });
    } else {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    }
    
    fetchLiveDbData();
    setIsReady(true);
  }, [navigate]);

  if (!isReady) return null;
  

  // Secure Authentication Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegisterMode) {
        await API.post('/auth/register', { username: authUsername, email: authEmail, password: authPassword });
        setIsRegisterMode(false);
        setAuthUsername(''); setAuthEmail(''); setAuthPassword('');
        alert("Registration profile generated successfully! Please log in.");
      } else {
        const res = await API.post('/auth/login', { email: authEmail, password: authPassword });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        setAuthEmail(''); setAuthPassword('');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication identity configuration rejected.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsProfileSettingsOpen(false);
    setCurrentView('feed');
  };

  // Strict One-Clap per Article Execution Loop
  const handleClap = async (id, e) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      alert("Verification Error: Connection identity required before processing community score points.");
      return;
    }
    
    if (clappedPosts.includes(id)) {
      alert("System Action Refused: You have already assigned a clap vote metric to this article.");
      return;
    }

    try {
      await API.put(`/posts/${id}/clap`);
    } catch (err) {
      console.log("Local state updated dynamically.");
    }

    setPosts(posts.map(p => p._id === id ? { ...p, claps: p.claps + 1 } : p));
    setClappedPosts([...clappedPosts, id]);
    
    if (selectedPost && selectedPost._id === id) {
      setSelectedPost(prev => ({ ...prev, claps: prev.claps + 1 }));
    }
  };

  // Dynamic DB Post Ingestion Stream 
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Authentication Failed: Connect your profile before deploying content paths!");
      return;
    }

    let processedContent = content;
    if (inlineImageUrl) {
      processedContent += `\n\n### Asset Blueprint Attachment\n![Attached Blueprint Illustration](${inlineImageUrl})`;
    }

    const randomDefaultImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    const postPayload = {
      title,
      content: processedContent,
      category,
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t),
      coverImage: coverImageUrl.trim() !== '' ? coverImageUrl : randomDefaultImage,
    };

    try {
      const response = await API.post('/posts', postPayload);
      const savedPost = {
        ...response.data,
        isUserGenerated: true,
        userOwnerSignature: currentUser.email,
        createdAt: response.data.createdAt || new Date().toISOString()
      };

      setPosts(prev => {
        if (prev.some(p => p._id === savedPost._id)) return prev;
        return [savedPost, ...prev];
      });

      setTitle(''); setTags(''); setContent(''); setCoverImageUrl(''); setInlineImageUrl('');
      setCurrentView('feed');
      alert("Log verified and deployed to database successfully!");
    } catch (err) {
      const fallbackPost = {
        _id: `user-log-${Date.now()}`,
        ...postPayload,
        claps: 0,
        readingTime: `${Math.ceil(content.split(' ').length / 130)} min read`,
        author: { username: currentUser.username },
        isUserGenerated: true,
        userOwnerSignature: currentUser.email,
        createdAt: new Date().toISOString()
      };
      setPosts([fallbackPost, ...posts]);
      setTitle(''); setTags(''); setContent(''); setCoverImageUrl(''); setInlineImageUrl('');
      setCurrentView('feed');
      alert("Local sandbox stream mounted successfully.");
    }
  };

  const launchReaderMode = (post) => {
    if (!currentUser) {
      alert("🔒 [ACCESS RESTRICTED]: This deployment block is locked. Please initialize or log into your verified user node on the right to unpack full markdown files.");
      document.getElementById("auth-station-card")?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setSelectedPost(post);
    setCurrentView('read');
  };

  // Segregated Workspace Arrays
  const userPublishedLogs = posts.filter(p => p.isUserGenerated && (p.userOwnerSignature === currentUser?.email || p.author?.username === currentUser?.username));
  const globalNetworkLogs = posts; 

  // PARAMETER SEARCH CRITERIA & SORTING ENGINE
  const processFilteredLogs = (targetArray, viewType = 'feed') => {
    const filtered = targetArray.filter(post => {
      const query = searchQuery.toLowerCase();
      
      const matchText = 
        post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query) ||
        (post.author?.username && post.author.username.toLowerCase().includes(query)) || 
        post.tags.some(t => t.toLowerCase().includes(query));
        
      const matchCat = selectedCategory === 'All' || post.category === selectedCategory;
      return matchText && matchCat;
    });

    if (viewType === 'explore') {
      return filtered.sort((a, b) => (b.claps || 0) - (a.claps || 0));
    }

    return filtered;
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${darkMode ? 'bg-[#0d1117] text-[#f0f6fc]' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Platform Header */}
      <nav className={`border-b sticky top-0 z-50 px-6 py-3 flex justify-between items-center transition-colors ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
        <div className="flex items-center space-x-6">
          <h1 onClick={() => setCurrentView('feed')} className="text-xl font-black font-mono tracking-wider bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent cursor-pointer">
            ⚡ HYPERLOG
          </h1>
          
          {/* Universal Search Field */}
          <div className="relative hidden md:block w-72">
            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 font-mono text-xs ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>$ query --</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView === 'read') {
                  setCurrentView(selectedPost?.isUserGenerated ? 'feed' : 'explore');
                }
              }}
              placeholder="search title, author, text..."
              className={`w-full font-mono text-xs rounded-lg py-2 pl-20 pr-4 border focus:outline-none focus:border-cyan-500 transition ${darkMode ? 'bg-[#0d1117] border-gray-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
            />
          </div>
        </div>

        {/* Global Navigation Layout Links */}
        <div className="flex items-center space-x-3 font-mono text-xs font-semibold">
          <button onClick={() => setCurrentView('feed')} className={`px-2 py-1.5 rounded flex items-center space-x-1 cursor-pointer transition ${currentView === 'feed' ? 'text-cyan-400' : darkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
            <Home size={13} /> <span>Home</span>
          </button>
          <button onClick={() => setCurrentView('explore')} className={`px-2 py-1.5 rounded flex items-center space-x-1 cursor-pointer transition ${currentView === 'explore' ? 'text-cyan-400' : darkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
            <Compass size={13} /> <span>Explore Blogs</span>
          </button>
          <button onClick={() => setCurrentView('projects')} className={`px-2 py-1.5 rounded flex items-center space-x-1 cursor-pointer transition ${currentView === 'projects' ? 'text-cyan-400' : darkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
            <Layout size={13} /> <span>Projects Hub</span>
          </button>
          
          {/* Analytics Route Option Restricted to Logged In Session Signatures */}
          {currentUser && (
            <button onClick={() => setCurrentView('analytics')} className={`px-2 py-1.5 rounded flex items-center space-x-1 cursor-pointer transition ${currentView === 'analytics' ? 'text-cyan-400' : darkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              <BarChart3 size={13} /> <span>Analytics</span>
            </button>
          )}

          <div className={`h-4 w-px mx-1 ${darkMode ? 'bg-gray-800' : 'bg-slate-200'}`}></div>

          <button onClick={() => setDarkMode(!darkMode)} className={`transition cursor-pointer ${darkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-500'}`}>
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {currentUser && (
            <div className="flex items-center space-x-2 pl-1">
              <div 
                onClick={() => setIsProfileSettingsOpen(true)}
                className={`flex items-center space-x-2 px-2 py-1 border rounded-md cursor-pointer transition ${darkMode ? 'border-gray-800 bg-[#0d1117] text-white hover:border-gray-600' : 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
              >
                <img src={getUserAvatar(currentUser)} alt="Avatar" className="w-4 h-4 rounded-full object-cover border border-cyan-400/30" />
                <span className="text-[10px] hidden lg:inline">{currentUser.username}</span>
                <Settings size={11} className="text-gray-500" />
              </div>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 ml-1 cursor-pointer"><LogOut size={14} /></button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Container Core Router */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* VIEW 1: HOME WORKSPACE PAGE */}
        {currentView === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {currentUser ? (
                /* Authenticated State Header Banner */
                <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h2 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>My Home Workspace</h2>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Secure sandbox storage containing logs registered directly under your verified profile handle credentials.</p>
                  <button onClick={() => setCurrentView('create')} className="mt-4 flex items-center space-x-2 bg-cyan-500 text-black px-4 py-2 font-mono text-xs font-bold rounded-lg hover:bg-cyan-400 transition cursor-pointer">
                    <PlusCircle size={14} /> <span>INITIALIZE_NEW_LOG</span>
                  </button>
                </div>
              ) : (
                /* Dynamic Welcome Banner For Unsigned Guests */
                <div className={`p-8 rounded-2xl border bg-gradient-to-br ${darkMode ? 'from-[#1f293d] to-[#161b22] border-cyan-500/20' : 'from-slate-100 to-white border-slate-200 shadow-md'}`}>
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest mb-3">
                    <Code2 size={16} /> <span>SYSTEM_NODE_ONLINE</span>
                  </div>
                  <h2 className={`text-4xl font-black tracking-tight leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Welcome to Hyperlog
                  </h2>
                  <p className={`text-sm mt-3 leading-relaxed max-w-xl ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    A minimalist compiler playground built for computer science development. Track algorithms, design system templates from scratch, and maintain continuous deployment analytics.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => setCurrentView('explore')} className="flex items-center space-x-2 bg-cyan-500 text-black px-4 py-2.5 font-mono text-xs font-bold rounded-lg hover:bg-cyan-400 transition cursor-pointer shadow-sm">
                      <span>EXPLORE_PUBLIC_INDEX</span> <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Home View Logs Pipeline Container */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className={`text-xs uppercase font-mono tracking-widest ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                    {currentUser ? 'PERSONAL_SCOPE_INDEX' : 'AVAILABLE_NET_LOGS_PREVIEW'}
                  </h3>
                  {!currentUser && (
                    <span className="text-[10px] text-yellow-500 font-mono flex items-center space-x-1">
                      <Lock size={10} /> <span>SIGN_IN_TO_DECRYPT_PAYLOAD</span>
                    </span>
                  )}
                </div>

                {currentUser && processFilteredLogs(userPublishedLogs, 'feed').length === 0 ? (
                  <div className={`p-12 text-center border border-dashed rounded-xl font-mono text-xs ${darkMode ? 'bg-[#161b22] border-gray-800 text-gray-500' : 'bg-white border-slate-200 text-slate-400'}`}>
                    No active runtime entries recorded yet. Click 'INITIALIZE_NEW_LOG' to build your first log.
                  </div>
                ) : (
                  processFilteredLogs(currentUser ? userPublishedLogs : globalNetworkLogs, 'feed').map((post) => (
                    <div 
                      key={post._id} 
                      onClick={() => launchReaderMode(post)} 
                      className={`p-6 rounded-xl border cursor-pointer transition-all ${
                        darkMode 
                          ? 'bg-[#161b22] border-gray-800 hover:border-cyan-500/30' 
                          : 'bg-white border-slate-200 shadow-xs hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{post.category}</span>
                          <h4 className={`text-xl font-bold transition mt-2 flex items-center gap-1.5 ${darkMode ? 'text-white hover:text-cyan-400' : 'text-slate-900 hover:text-cyan-600'}`}>
                            {!currentUser && <Lock size={14} className="text-gray-500 inline shrink-0" />}
                            <span>{post.title}</span>
                          </h4>
                          <p className="text-xs text-slate-400 font-mono">By @{post.author?.username || 'system'} • {post.readingTime || '2 min read'}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 hidden sm:flex">
                          {post.tags.map((t, idx) => <span key={idx} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${darkMode ? 'bg-gray-800/40 text-gray-400 border-gray-700/50' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>#{t}</span>)}
                        </div>
                      </div>
                      {post.coverImage && (
                        <div className="relative mt-3 rounded-lg overflow-hidden h-40 border border-gray-800/10">
                          <img src={post.coverImage} alt="Cover" className={`w-full h-full object-cover ${!currentUser && 'blur-xs grayscale/30'}`} />
                          {!currentUser && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-mono text-xs text-white font-bold tracking-wider">
                              🔒 ENCRYPTED FIELD [SIGN IN]
                            </div>
                          )}
                        </div>
                      )}
                      
                      {currentUser && (
                        <div className={`mt-3 text-sm font-sans line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                          <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-800/20 flex justify-between items-center">
                        <button onClick={(e) => handleClap(post._id, e)} className={`px-3 py-1 rounded font-mono text-xs border transition ${clappedPosts.includes(post._id) ? 'bg-gray-800 border-cyan-500/40 text-cyan-400' : 'bg-transparent border-gray-700 text-gray-400 hover:text-cyan-400'}`}>
                          👏 {post.claps} HITS
                        </button>
                        <span className="text-xs text-cyan-500 font-mono font-bold">
                          {currentUser ? 'OPEN_READER_MODE →' : 'UNLOCK_POST_DECK 🔒'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Interactive Sidebar Column */}
            <div className="space-y-6">
              {currentUser ? (
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h4 className={`text-xs font-mono uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Workspace Node Config</h4>
                  <div className="flex items-center space-x-3 bg-[#0d1117] p-3 rounded-xl border border-gray-800/60 mb-4">
                    <img src={getUserAvatar(currentUser)} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-cyan-400" />
                    <div>
                      <div className="text-white font-bold text-xs">@{currentUser.username}</div>
                      <div className="text-[10px] text-gray-500 font-mono">Active Operator Instance</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between"><span>ACCOUNT STATE:</span><span className="text-emerald-400 font-bold">AUTHORIZED</span></div>
                    <div className="flex justify-between"><span>MY_TOTAL_LOGS:</span><span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{userPublishedLogs.length} units</span></div>
                  </div>
                  <button onClick={() => setIsProfileSettingsOpen(true)} className="w-full mt-4 flex items-center justify-center space-x-1.5 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-mono text-xs transition cursor-pointer">
                    <Settings size={12} /> <span>MANAGE_SECURITY_MATRIX</span>
                  </button>
                </div>
              ) : (
                /* RIGHT-SIDE INTEGRATED LOGIN & REGISTRATION CONSOLE */
                <div id="auth-station-card" className={`p-6 rounded-2xl border relative transition-all ${darkMode ? 'bg-[#161b22] border-cyan-500/20 shadow-xl' : 'bg-white border-slate-300 shadow-md'}`}>
                  <div className="absolute top-3 right-4 font-mono text-[9px] text-gray-500 tracking-tighter">PORTAL_V.2.06</div>
                  <h3 className={`text-sm font-black font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5 ${darkMode ? 'text-cyan-400' : 'text-slate-900'}`}>
                    <Key size={14} /> <span>{isRegisterMode ? 'INITIALIZE_IDENTITY' : 'OPERATOR_SIGN_IN'}</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono mb-4">Provide parameters to unlock internal database reader tracks.</p>
                  
                  {authError && <div className="mb-3 p-2.5 bg-red-900/20 border border-red-500/40 text-red-300 rounded text-[11px] font-mono">{authError}</div>}

                  <form onSubmit={handleAuthSubmit} className="space-y-3.5 font-mono text-xs">
                    {isRegisterMode && (
                      <div>
                        <label className="block mb-1 text-gray-400 text-[11px] uppercase">Namespace Username</label>
                        <input type="text" value={authUsername} onChange={(e)=>setAuthUsername(e.target.value)} placeholder="rishabh_dev" className={`w-full border rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 ${darkMode ? 'bg-[#0d1117] border-gray-800' : 'bg-slate-50 border-slate-300 text-slate-900'}`} required />
                      </div>
                    )}
                    <div>
                      <label className="block mb-1 text-gray-400 text-[11px] uppercase">System Network Email</label>
                      <input type="email" value={authEmail} onChange={(e)=>setAuthEmail(e.target.value)} placeholder="dev@hyperlog.net" className={`w-full border rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 ${darkMode ? 'bg-[#0d1117] border-gray-800' : 'bg-slate-50 border-slate-300 text-slate-900'}`} required />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-400 text-[11px] uppercase">Access Password</label>
                      <input type="password" value={authPassword} onChange={(e)=>setAuthPassword(e.target.value)} placeholder="••••••••" className={`w-full border rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 ${darkMode ? 'bg-[#0d1117] border-gray-800' : 'bg-slate-50 border-slate-300 text-slate-900'}`} required />
                    </div>

                    <button type="submit" className="w-full mt-2 py-2.5 bg-cyan-500 text-black font-black uppercase tracking-wider rounded-lg hover:bg-cyan-400 transition cursor-pointer text-xs">
                      {isRegisterMode ? 'COMPILE_NEW_USER' : 'LOGIN_USER'}
                    </button>

                    <div className="text-center pt-2.5 border-t border-gray-800/40 mt-3">
                      <button type="button" onClick={() => { setIsRegisterMode(!isRegisterMode); setAuthError(''); }} className="text-[10px] text-gray-500 hover:text-cyan-400 underline cursor-pointer">
                        {isRegisterMode ? 'Return directly to operator login' : 'Register new network profile'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: GLOBAL EXPLORE BLOGS INDEX FEED */}
        {currentView === 'explore' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className={`text-3xl font-black tracking-tight font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>Explore Global Tech Blogs</h2>
                <p className={`text-xs mt-1 font-mono ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Public developer index processing tutorials sorted by aggregate community clap metrics.</p>
              </div>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={`font-mono text-xs rounded-lg p-2 border focus:outline-none ${darkMode ? 'bg-[#161b22] border-gray-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
                <option value="All">All Framework Subsets</option>
                <option value="React.js">React.js</option>
                <option value="C Programming">C Programming</option>
                <option value="Tailwind">Tailwind CSS</option>
              </select>
            </div>

            {processFilteredLogs(globalNetworkLogs, 'explore').length === 0 ? (
              <div className="p-12 text-center border border-dashed rounded-xl font-mono text-xs text-gray-500">0 matched queries active inside the global repository.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {processFilteredLogs(globalNetworkLogs, 'explore').map((post) => (
                  <div key={post._id} onClick={() => launchReaderMode(post)} className={`p-6 rounded-xl border cursor-pointer transition-all hover:border-cyan-500/40 flex flex-col justify-between ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div>
                      <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4 border border-gray-800/10">
                        <img src={post.coverImage} alt="Cover Data" className={`w-full h-full object-cover ${!currentUser && 'blur-xs grayscale/30'}`} />
                        <span className="absolute top-2.5 left-2.5 text-[9px] font-mono px-2 py-0.5 rounded bg-black/80 text-cyan-400 border border-cyan-500/20">{post.category}</span>
                        {!currentUser && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-mono text-[10px] text-white">🔒 DECRYPTION REQUIRED</div>
                        )}
                      </div>
                      <h3 className={`text-lg font-bold tracking-tight line-clamp-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {!currentUser && <Lock size={12} className="text-gray-500 inline mr-1" />}
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">@compiled_by_{post.author?.username || 'admin'}</p>
                      
                      {currentUser && (
                        <div className={`text-xs mt-3 line-clamp-3 font-sans leading-relaxed ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                          <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800/20 flex justify-between items-center">
                      <button onClick={(e) => handleClap(post._id, e)} className={`px-2.5 py-1 rounded text-xs font-mono border transition ${clappedPosts.includes(post._id) ? 'bg-gray-800 text-cyan-400 border-cyan-500/40' : 'bg-transparent text-gray-400 border-gray-700'}`}>
                        👏 {post.claps} HITS
                      </button>
                      <span className="text-xs text-cyan-500 font-mono font-bold">
                        {currentUser ? 'READ_ARTICLE_CORE →' : 'UNLOCK 🔒'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: FULL ARTICLE READER WINDOW DISPLAYING MARKDOWN */}
        {currentView === 'read' && selectedPost && currentUser && (
          <div className={`max-w-3xl mx-auto p-8 rounded-2xl border ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <button onClick={() => setCurrentView(selectedPost.isUserGenerated ? 'feed' : 'explore')} className="mb-6 flex items-center space-x-1.5 text-xs font-mono text-cyan-500 hover:underline cursor-pointer">
              <ArrowLeft size={13} /> <span>CLOSE_RUN_STREAM</span>
            </button>

            {selectedPost.coverImage && <img src={selectedPost.coverImage} className="w-full h-60 object-cover rounded-xl mb-6 border border-gray-800/10 shadow-sm" alt="Feature Cover" />}

            <div className="space-y-1.5 border-b border-gray-800/20 pb-4 mb-5">
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{selectedPost.category}</span>
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedPost.title}</h2>
              <p className="text-xs text-gray-500 font-mono">By @{selectedPost.author?.username || 'system'} • {selectedPost.readingTime || '4 min read'}</p>
            </div>

            <div className={`prose max-w-none text-sm leading-relaxed space-y-4 ${darkMode ? 'text-gray-300 prose-invert' : 'text-slate-800 prose-slate'}`}>
              <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800/20 flex justify-between items-center">
              <button onClick={() => handleClap(selectedPost._id)} className={`px-4 py-2 font-mono text-xs font-bold rounded-lg transition border ${clappedPosts.includes(selectedPost._id) ? 'bg-gray-800 text-cyan-400 border-cyan-500/40' : 'bg-cyan-500 text-black hover:bg-cyan-400'}`}>
                👏 {clappedPosts.includes(selectedPost._id) ? 'CLAPPED_METRIC_LOCKED' : 'INCREMENT CLAP VOTE'} [{selectedPost.claps}]
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: INTERACTIVE BEGINNER-FRIENDLY PROJECTS MATRIX */}
        {currentView === 'projects' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-3xl font-black font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>Beginner Project Sandbox</h2>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Blogs generated on your Home tab initialize automatically here into step-by-step modular guide blocks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`p-5 rounded-xl border flex flex-col justify-between ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="space-y-2">
                  <div className="h-36 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-900/30 flex items-center justify-center border border-gray-800/20 font-mono font-bold text-lg text-emerald-400">C_SCHEDULING_CORE</div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">BEGINNER FRIENDLY</span>
                  <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>CPU Scheduling Logic Guide</h4>
                  <p className="text-xs text-gray-400 line-clamp-3 font-sans">A completely simplified trace through FCFS algorithm configurations avoiding pointer mutations or heavy arrays from scratch.</p>
                </div>
                <button onClick={() => { const t = posts.find(p => p._id === "init-1"); launchReaderMode(t); }} className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 font-mono text-xs font-bold rounded-lg transition cursor-pointer">LOAD_BLUEPRINT</button>
              </div>

              <div className={`p-5 rounded-xl border flex flex-col justify-between ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="space-y-2">
                  <div className="h-36 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-900/30 flex items-center justify-center border border-gray-800/20 font-mono font-bold text-lg text-blue-400">FRONTEND_VITE_SYS</div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block">FRONTEND SETUPS</span>
                  <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Vite Single Page Matrix Setup</h4>
                  <p className="text-xs text-gray-400 line-clamp-3 font-sans">Learn component structures with inline utilities avoiding complex nesting logics entirely.</p>
                </div>
                <button onClick={() => { const t = posts.find(p => p._id === "init-2"); launchReaderMode(t); }} className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 font-mono text-xs font-bold rounded-lg transition cursor-pointer">LOAD_BLUEPRINT</button>
              </div>

              {userPublishedLogs.map(userPost => (
                <div key={`blueprint-${userPost._id}`} className="p-5 border border-cyan-500/30 rounded-xl bg-[#161b22] flex flex-col justify-between shadow-md">
                  <div className="space-y-2">
                    <div className="h-36 rounded-lg overflow-hidden border border-gray-800/40 relative">
                      <img src={userPost.coverImage} className="w-full h-full object-cover" alt="Graphic Mapping" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center font-mono text-xs text-cyan-400">LIVE_USER_BLUEPRINT</div>
                    </div>
                    <span className="text-[9px] font-mono bg-purple-900/40 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded inline-block">GENERATED APP CODE</span>
                    <h4 className="text-base font-bold text-white">{userPost.title} Sandbox</h4>
                    <p className="text-xs text-gray-400 line-clamp-3 font-sans">{userPost.content.replace(/[#*`]/g, '')}</p>
                  </div>
                  <button onClick={() => launchReaderMode(userPost)} className="w-full mt-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-mono text-xs font-bold rounded-lg transition cursor-pointer">EXECUTE_RUN_ENVIRONMENT</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: RESTORED ORIGINAL PERSONALIZED PERFORMANCE ANALYTICS */}
        {currentView === 'analytics' && currentUser && (() => {
          const userTotalHits = userPublishedLogs.reduce((acc, curr) => acc + (curr.claps || 0), 0);
          const monthlyActivityCounts = Array(12).fill(0);
          
          userPublishedLogs.forEach(post => {
            const dateSource = post.createdAt || post.date;
            if (dateSource) {
              const monthIndex = new Date(dateSource).getMonth();
              if (monthIndex >= 0 && monthIndex < 12) {
                monthlyActivityCounts[monthIndex] += 1;
              }
            } else if (post._id && post._id.startsWith('user-log-')) {
              const timestamp = parseInt(post._id.split('-')[2]);
              if (!isNaN(timestamp)) {
                const monthIndex = new Date(timestamp).getMonth();
                monthlyActivityCounts[monthIndex] += 1;
              }
            }
          });

          const maxMonthlyCount = Math.max(...monthlyActivityCounts, 0);

          return (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Performance Analytics</h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Real-time metrics aggregated exclusively from your personal handle profile footprint.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className={`text-xs font-semibold tracking-wider uppercase ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Global Repository Logs</div>
                  <div className={`text-4xl font-extrabold mt-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{posts.length}</div>
                </div>
                
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className={`text-xs font-semibold tracking-wider uppercase ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>My Published Blueprints</div>
                  <div className="text-4xl font-extrabold text-cyan-500 mt-2">{userPublishedLogs.length}</div>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className={`text-xs font-semibold tracking-wider uppercase ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>My Accumulated Hits</div>
                  <div className="text-4xl font-extrabold text-pink-500 mt-2">
                    {userTotalHits} <span className="text-xs font-normal text-gray-500">claps</span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Article Publishing Velocity</h3>
                  <span className="text-xs text-cyan-500 flex items-center space-x-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block"></span>
                    <span>LIVE USER PRODUCTION METRICS</span>
                  </span>
                </div>
                
                <div className="h-64 flex items-end space-x-3 pt-6 px-2 border-b border-l border-gray-700/40 relative">
                  {monthlyActivityCounts.map((count, i) => {
                    const barHeightPercent = maxMonthlyCount > 0 ? (count / maxMonthlyCount) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 group relative flex flex-col justify-end items-center h-full">
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold rounded px-2 py-0.5 pointer-events-none z-10 font-mono shadow-md">
                          {count} {count === 1 ? 'Post' : 'Posts'}
                        </div>
                        <div 
                          style={{ height: `${barHeightPercent}%` }} 
                          className={`w-full transition-all duration-500 rounded-t border-t ${
                            count > 0 ? 'bg-gradient-to-t from-cyan-500/20 to-cyan-400 border-cyan-400 group-hover:to-pink-500 group-hover:from-pink-500/20' : 'bg-transparent border-transparent'
                          }`}
                        ></div>
                        <span className={`text-[10px] font-mono mt-2 uppercase ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* VIEW 6: COMPLIANCE LOG GENERATOR REGISTRATION MATRIX */}
        {currentView === 'create' && (
          <div className={`max-w-3xl mx-auto p-8 rounded-2xl border ${darkMode ? 'bg-[#161b22] border-gray-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-2xl font-mono font-black text-cyan-400 mb-6">⚡ COMPLIANCE LOG GENERATOR</h2>
            <form onSubmit={handlePublish} className="space-y-5 font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-1.5">Header Signature Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Implementing FCFS CPU Scheduler Array Models" className={`w-full p-3 border rounded-lg focus:outline-none focus:border-cyan-500 ${darkMode ? 'bg-[#0d1117] border-gray-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`} required />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5">Ecosystem Branch</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full p-3 border rounded-lg focus:outline-none focus:border-cyan-500 ${darkMode ? 'bg-[#0d1117] border-gray-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}>
                    <option value="React.js">React.js</option>
                    <option value="C Programming">C Programming</option>
                    <option value="Tailwind">Tailwind CSS</option>
                    <option value="Node.js">Node.js</option>
                  </select>
                </div>
              </div>

              <div className={`p-4 border rounded-xl space-y-3 ${darkMode ? 'bg-[#0d1117] border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-cyan-400 font-bold block">🖼️ GRAPHIC RESOURCE URL ATTACHMENTS (OPTIONAL)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 mb-1">Background Card Cover Image URL</label>
                    <input type="text" value={coverImageUrl} onChange={(e)=>setCoverImageUrl(e.target.value)} placeholder="https://images.unsplash.com/photo-..." className={`w-full p-2 border rounded focus:outline-none ${darkMode ? 'bg-[#161b22] border-gray-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Content Block Inline Image Asset URL</label>
                    <input type="text" value={inlineImageUrl} onChange={(e)=>setInlineImageUrl(e.target.value)} placeholder="https://images.unsplash.com/photo-..." className={`w-full p-2 border rounded focus:outline-none ${darkMode ? 'bg-[#161b22] border-gray-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5">Ecosystem Filter Tags (Separated by Comma)</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., c, scheduling, memory" className={`w-full p-3 border rounded-lg focus:outline-none focus:border-cyan-500 ${darkMode ? 'bg-[#0d1117] border-gray-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`} />
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5">Markdown Log Payload Content Body</label>
                <textarea rows="8" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Compile core concepts here using clean text streams or markdown blocks..." className={`w-full p-3 border rounded-lg focus:outline-none focus:border-cyan-500 ${darkMode ? 'bg-[#0d1117] border-gray-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`} required />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setCurrentView('feed')} className="px-4 py-2 text-gray-500 hover:text-white transition">[ABORT_DEPLOYMENT]</button>
                <button type="submit" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition cursor-pointer">EXECUTE_PUBLISH</button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* DETERMINISTIC PROFILE SETTINGS OVERLAY DISPLAY MATRIX */}
      {isProfileSettingsOpen && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl max-w-md w-full p-6 relative font-mono text-xs text-gray-400 shadow-2xl">
            <h3 className="text-sm font-black text-cyan-400 mb-5 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck size={16} /> <span>Security Matrix / Profile Settings</span>
            </h3>

            <div className="flex flex-col items-center text-center space-y-4 border-b border-gray-800 pb-5 mb-5">
              <div className="relative">
                <img src={getUserAvatar(currentUser)} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400 shadow-lg" />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#161b22]"></span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">@{currentUser.username}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Assigned Deterministic System Core Avatar</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between items-center bg-[#0d1117] p-2.5 rounded-lg border border-gray-800">
                <span className="text-gray-500">USER_ID IDENTITY:</span>
                <span className="text-gray-300 font-bold">{currentUser._id || "local-sandbox-token"}</span>
              </div>
              <div className="flex justify-between items-center bg-[#0d1117] p-2.5 rounded-lg border border-gray-800">
                <span className="text-gray-500">ROUTING EMAIL:</span>
                <span className="text-white font-bold">{currentUser.email}</span>
              </div>
              <div className="flex justify-between items-center bg-[#0d1117] p-2.5 rounded-lg border border-gray-800">
                <span className="text-gray-500">SANDBOX ARCHIVE:</span>
                <span className="text-cyan-400 font-bold">{userPublishedLogs.length} published blueprints</span>
              </div>
            </div>

            <div className="flex justify-end pt-5 mt-4 border-t border-gray-800/60">
              <button type="button" onClick={() => setIsProfileSettingsOpen(false)} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition cursor-pointer">DISMISS_VIEW</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;