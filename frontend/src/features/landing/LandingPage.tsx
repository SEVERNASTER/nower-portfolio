import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Briefcase,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Code2,
  FolderGit2,
  Globe,
  Layers,
  LogIn,
  MapPin,
  Menu,
  Moon,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  TrendingUp,
  User,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@clerk/clerk-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortfolioCard {
  id: number;
  user: {
    id: number;
    full_name: string;
    profession: string;
    city: string;
    imagen_profile?: string;
    bio?: string;
    skills: Array<{ id: number; name: string; type: string }>;
    projects: Array<{ id: number; title: string; tags: any }>;
    experiences?: Array<{
      id: number;
      type: 'work' | 'academic';
      title: string;
      institution: string;
      start_date: string;
      end_date: string | null;
      description?: string;
    }>;
  };
  public_slug: string;
  updated_at: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';

// ─── Helper: Cumulative Work Experience Year Calculator ────────────────────────

const calculateYearsOfExperience = (experiences: any[]): number => {
  if (!experiences || experiences.length === 0) return 0;
  let totalDays = 0;
  experiences.forEach((exp) => {
    if (exp.type === 'academic') return; // only Professional Work experience
    const start = new Date(exp.start_date);
    if (isNaN(start.getTime())) return;
    const end = exp.end_date ? new Date(exp.end_date) : new Date();
    if (isNaN(end.getTime())) return;
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    totalDays += diffDays;
  });
  const years = totalDays / 365.25;
  return parseFloat(years.toFixed(1));
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="lp-card animate-pulse bg-slate-200 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700/30 rounded-2xl p-5 flex flex-col items-center">
    <div className="w-16 h-16 rounded-full bg-slate-700/50 mb-4" />
    <div className="h-4 bg-slate-700/50 rounded w-2/3 mb-2" />
    <div className="h-3 bg-slate-700/50 rounded w-1/2 mb-4" />
    <div className="flex gap-2 w-full justify-center">
      <div className="h-6 bg-slate-700/50 rounded-full w-12" />
      <div className="h-6 bg-slate-700/50 rounded-full w-16" />
      <div className="h-6 bg-slate-700/50 rounded-full w-12" />
    </div>
  </div>
);

// ─── Portfolio Card Item (Admin Approved Only) ────────────────────────────────

const PortfolioCardItem: React.FC<{ portfolio: PortfolioCard }> = ({ portfolio }) => {
  const { user, public_slug } = portfolio;
  const skills = (user.skills || []).slice(0, 5);
  const projectCount = (user.projects || []).length;
  const initials = user.full_name
    ? user.full_name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
    : '?';
  
  const experienceYears = useMemo(() => {
    return Math.round(calculateYearsOfExperience(user.experiences || []));
  }, [user.experiences]);

  return (
    <a href={`/p/${public_slug}`} target="_blank" rel="noopener noreferrer" className="lp-card group">
      <div className="lp-card-avatar-wrap relative z-10 flex items-center justify-center">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#10b981] to-[#6ee7b7] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        {user.imagen_profile
          ? <img src={user.imagen_profile} alt={user.full_name} className="lp-card-avatar" />
          : <div className="lp-card-avatar lp-card-avatar-fallback"><span>{initials}</span></div>}
      </div>
      <div className="lp-card-body">
        <h3 className="lp-card-name">{user.full_name}</h3>
        <p className="lp-card-role">{user.profession || 'Profesional'}</p>
        
        <div className="lp-card-meta">
          {user.city && (
            <span className="lp-meta-item">
              <MapPin className="lp-meta-icon" />
              {user.city}
            </span>
          )}
          <span className="lp-meta-item">
            <FolderGit2 className="lp-meta-icon" />
            {projectCount} proy
          </span>
          {experienceYears > 0 && (
            <span className="lp-meta-item">
              <Briefcase className="lp-meta-icon" />
              {experienceYears} {experienceYears === 1 ? 'año' : 'años'}
            </span>
          )}
        </div>
        
        {skills.length > 0 && (
          <div className="lp-card-skills">
            {skills.map(skill => <span key={skill.id} className="lp-skill-chip">{skill.name}</span>)}
            {user.skills.length > 5 && <span className="lp-skill-chip lp-skill-more">+{user.skills.length - 5}</span>}
          </div>
        )}
      </div>
      <div className="lp-card-arrow"><Globe className="h-4 w-4" /></div>
    </a>
  );
};

// ─── Main Unified Landing Page ─────────────────────────────────────────────────

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();

  const handleAuthClick = () => {
    if (!isLoaded) return;
    navigate(isSignedIn ? '/dashboard' : '/login');
  };

  const handlePublishPortfolioClick = () => {
    if (!isLoaded) return;

    navigate(isSignedIn ? '/portfolio/visibility' : '/login');
  };

  // Dark Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // All approved student profiles from backend explore route
  const [portfolios, setPortfolios] = useState<PortfolioCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Search input & Suggestions (Navbar)
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ label: string; type: 'role' | 'tech' | 'name' }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  // Sidebar filters
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [minProjects, setMinProjects] = useState<number>(0);

  // Sidebar Layout States
  const [activeTab, setActiveTab] = useState<'skills' | 'roles' | 'city' | 'experience' | 'projects' | null>('skills');
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSidebarOpen(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [navHeight, setNavHeight] = useState(64);

  useEffect(() => {
    const updateNavHeight = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, [searchInput, sidebarOpen]);

  // Load approved portfolios on mount
  useEffect(() => {
    const loadAllPortfolios = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/explore/portfolios?per_page=1000`);
        if (!res.ok) throw new Error('Error al cargar portafolios');
        const data = await res.json();
        setPortfolios(
          (data.data || []).filter(
            (p: PortfolioCard) => Boolean(p.public_slug),
          ),
        );
      } catch (err) {
        showToast('error', 'Error al cargar los perfiles de talentos.');
      } finally {
        setLoading(false);
        setSearched(true);
      }
    };
    loadAllPortfolios();
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Dynamic Option Extraction ──────────────────────────────────────────────

  const availableCities = useMemo(() => {
    const defaults = ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Tarija', 'Oruro', 'Potosí', 'Beni', 'Pando'];
    const citiesSet = new Set<string>(defaults);
    portfolios.forEach((p) => {
      if (p.user?.city) {
        const trimmed = p.user.city.trim();
        if (trimmed) citiesSet.add(trimmed);
      }
    });
    return Array.from(citiesSet).sort((a, b) => a.localeCompare(b));
  }, [portfolios]);

  const availableRoles = useMemo(() => {
    return [
      'Frontend Developer', 'Backend Developer', 'Fullstack Developer',
      'Mobile Developer', 'UI/UX Designer', 'DevOps Engineer',
      'Data Scientist', 'QA Engineer'
    ].sort((a, b) => a.localeCompare(b));
  }, []);

  const availableSkills = useMemo(() => {
    return [
      'React', 'Vue.js', 'Angular', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS',
      'TypeScript', 'JavaScript', 'Node.js', 'Express', 'NestJS', 'Python',
      'Django', 'FastAPI', 'PHP', 'Laravel', 'Go', 'Java', 'Spring Boot',
      'Ruby on Rails', 'React Native', 'Flutter', 'PostgreSQL', 'MongoDB',
      'MySQL', 'Docker', 'AWS', 'Firebase', 'Git'
    ].sort((a, b) => a.localeCompare(b));
  }, []);

  const availableSuggestions = useMemo(() => {
    const rolesSet = new Set<string>(availableRoles);
    const skillsSet = new Set<string>(availableSkills);
    const namesSet = new Set<string>();

    portfolios.forEach((p) => {
      // Usar full_name que es el que viene de la API para portfolios
      if (p.user?.full_name) {
        namesSet.add(p.user.full_name.trim());
      }
      if (p.user?.profession) {
        const trimmed = p.user.profession.trim();
        if (trimmed) rolesSet.add(trimmed);
      }
      if (p.user?.skills) {
        p.user.skills.forEach((s) => {
          if (s.name) {
            const trimmed = s.name.trim();
            if (trimmed) skillsSet.add(trimmed);
          }
        });
      }
    });

    return [
      ...Array.from(rolesSet).map((r) => ({ label: r, type: 'role' as const })),
      ...Array.from(skillsSet).map((s) => ({ label: s, type: 'tech' as const })),
      ...Array.from(namesSet).map((n) => ({ label: n, type: 'name' as const })),
    ].sort((a, b) => a.label.localeCompare(b.label));
  }, [portfolios, availableRoles, availableSkills]);

  // ─── Autocomplete Suggestions Logic ─────────────────────────────────────────

  useEffect(() => {
    const q = searchInput.trim().toLowerCase();
    if (q.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = availableSuggestions
      .filter((s) => s.label.toLowerCase().includes(q))
      .slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setActiveSuggestionIndex(-1);
  }, [searchInput, availableSuggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSuggestionSelect = (s: typeof availableSuggestions[0]) => {
    if (s.type === 'tech') {
      setSelectedSkills((prev) => (prev.includes(s.label) ? prev : [...prev, s.label]));
      setActiveTab('skills');
    } else if (s.type === 'name') {
      setSelectedNames((prev) => (prev.includes(s.label) ? prev : [...prev, s.label]));
    } else {
      setSelectedRoles((prev) => (prev.includes(s.label) ? prev : [...prev, s.label]));
      setActiveTab('roles');
    }
    setSearchInput('');
    setShowSuggestions(false);
    setSidebarOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0) {
        handleSuggestionSelect(suggestions[activeSuggestionIndex]);
      } else {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const resetFilters = () => {
    setSearchInput('');
    setSelectedCity('');
    setSelectedRoles([]);
    setSelectedSkills([]);
    setSelectedNames([]);
    setMinExperience(0);
    setMinProjects(0);
  };

  const removeChip = (type: 'search' | 'city' | 'role' | 'skill' | 'experience' | 'projects' | 'name', val: string) => {
    if (type === 'search') setSearchInput('');
    if (type === 'city') setSelectedCity('');
    if (type === 'role') setSelectedRoles((prev) => prev.filter((r) => r !== val));
    if (type === 'skill') setSelectedSkills((prev) => prev.filter((s) => s !== val));
    if (type === 'name') setSelectedNames((prev) => prev.filter((n) => n !== val));
    if (type === 'experience') setMinExperience(0);
    if (type === 'projects') setMinProjects(0);
  };

  // ─── Real-Time Client Filtering logic ─────────────────────────────────────────

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      const { user } = p;
      if (!user) return false;

      // 1. Text Search Input (Navbar)
      if (searchInput.trim()) {
        const q = searchInput.toLowerCase();
        const matchesName = user.full_name?.toLowerCase().includes(q);
        const matchesProfession = user.profession?.toLowerCase().includes(q);
        const matchesBio = user.bio?.toLowerCase().includes(q);
        const matchesSkills = user.skills?.some((s) => s.name?.toLowerCase().includes(q));
        const matchesProjects = user.projects?.some((proj) => {
          const matchesTitle = proj.title?.toLowerCase().includes(q);
          const tags = Array.isArray(proj.tags)
            ? proj.tags
            : typeof proj.tags === 'string'
            ? [proj.tags]
            : [];
          return matchesTitle || tags.some((t) => t?.toLowerCase().includes(q));
        });

        if (!matchesName && !matchesProfession && !matchesBio && !matchesSkills && !matchesProjects) {
          return false;
        }
      }

      // 2. City
      if (selectedCity) {
        if (!user.city || user.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }

      // Names Checkboxes (OR logic)
      if (selectedNames.length > 0) {
        if (!user.full_name || !selectedNames.includes(user.full_name.trim())) {
          return false;
        }
      }

      // 3. Roles Checkboxes (OR logic)
      if (selectedRoles.length > 0) {
        if (!user.profession || !selectedRoles.includes(user.profession)) {
          return false;
        }
      }

      // 4. Skills Checkboxes (AND logic)
      if (selectedSkills.length > 0) {
        const userSkillNames = (user.skills || []).map((s) => s.name);
        const hasAllSkills = selectedSkills.every((s) => userSkillNames.includes(s));
        if (!hasAllSkills) return false;
      }

      // Filtro de experiencia
      if (minExperience > 0) {
        const expYears = Math.round(calculateYearsOfExperience(user.experiences || []));
        if (expYears < minExperience) return false;
      }

      // 6. Min Projects Range
      if (minProjects > 0) {
        const projCount = (user.projects || []).length;
        if (projCount < minProjects) return false;
      }

      return true;
    });
  }, [portfolios, searchInput, selectedCity, selectedRoles, selectedSkills, selectedNames, minExperience, minProjects]);

  const activeTabCounts = useMemo(() => {
    return {
      city: selectedCity ? 1 : 0,
      roles: selectedRoles.length,
      skills: selectedSkills.length,
      experience: minExperience > 0 ? 1 : 0,
      projects: minProjects > 0 ? 1 : 0,
    };
  }, [selectedCity, selectedRoles, selectedSkills, minExperience, minProjects]);

  const activeChips = useMemo(() => {
    const chips: Array<{ type: 'search' | 'city' | 'role' | 'skill' | 'experience' | 'projects' | 'name'; label: string }> = [];
    if (selectedCity) chips.push({ type: 'city', label: selectedCity });
    selectedRoles.forEach((r) => chips.push({ type: 'role', label: r }));
    selectedSkills.forEach((s) => chips.push({ type: 'skill', label: s }));
    selectedNames.forEach((n) => chips.push({ type: 'name', label: n }));
    if (minExperience > 0) chips.push({ type: 'experience', label: `>= ${minExperience} años exp` });
    if (minProjects > 0) chips.push({ type: 'projects', label: `>= ${minProjects} proyectos` });
    return chips;
  }, [selectedCity, selectedRoles, selectedSkills, selectedNames, minExperience, minProjects]);

  const hasActiveFilters = activeChips.length > 0 || searchInput.trim().length > 0;

  const handleTabClick = (tabName: 'skills' | 'roles' | 'city' | 'experience' | 'projects') => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setActiveTab(tabName);
    } else {
      if (activeTab === tabName) {
        setActiveTab(null);
      } else {
        setActiveTab(tabName);
      }
    }
  };

  const clearCategoryFilters = (tabName: 'skills' | 'roles' | 'city' | 'experience' | 'projects' | null) => {
    if (tabName === 'city') setSelectedCity('');
    if (tabName === 'roles') setSelectedRoles([]);
    if (tabName === 'skills') setSelectedSkills([]);
    if (tabName === 'experience') setMinExperience(0);
    if (tabName === 'projects') setMinProjects(0);
  };

  return (
    <div className="lp-root flex flex-col min-h-screen bg-slate-50 dark:bg-[#0c1825] text-slate-900 dark:text-slate-200">
      
      {/* ── TOP TOASTS ── */}
      {toast && (
        <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 px-5 py-3 rounded-2xl shadow-xl font-bold transition-all duration-300 ${
          toast.type === 'error' ? 'bg-rose-900/90 text-rose-200 border border-rose-700/50' : 'bg-emerald-900/90 text-emerald-200 border border-emerald-700/50'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav ref={navRef} className="lp-nav sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0c1825]/90 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-lg transition-colors">
        <div className="w-full mx-auto px-3 sm:px-4 py-2 sm:py-0 sm:h-16 flex flex-wrap lg:flex-nowrap items-center justify-between gap-x-3 gap-y-2">
          
          {/* Left Block: Hamburger Button + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 order-1 min-w-0">
            <button
              onClick={() => {
                if (sidebarOpen) {
                  setSidebarOpen(false);
                } else {
                  setSidebarOpen(true);
                  if (activeTab === null) {
                    setActiveTab('skills');
                  }
                }
              }}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#102030] hover:bg-slate-100 dark:hover:bg-[#162730] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm dark:shadow-md cursor-pointer shrink-0"
              title={sidebarOpen ? 'Cerrar panel' : 'Abrir panel'}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <a href="/" className="lp-logo flex items-center gap-2 text-decoration-none group min-w-0">
              <img src="/nowerLogo.png" alt="NOWER" className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105 shrink-0" />
              <div className="hidden sm:block min-w-0">
                <span className="lp-logo-name block text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">NOWER</span>
                <span className="lp-logo-tagline block text-[8px] sm:text-[9px] font-black tracking-widest text-slate-400 uppercase mt-0.5 truncate">
                  Efficient Web Performance
                </span>
              </div>
            </a>
          </div>

          {/* Right Block: Theme + Auth */}
          <div className="flex items-center gap-2 sm:gap-4 order-2 lg:order-3 shrink-0">
            <button
              onClick={() => setIsDark(!isDark)}
              className="relative inline-flex h-7 w-12 items-center rounded-full bg-slate-200 dark:bg-[#102030] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-300 dark:border-slate-800 shrink-0"
              title="Alternar modo claro/oscuro"
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
              {isDark ? <Moon className="absolute left-1.5 h-3.5 w-3.5 text-slate-400" /> : <Sun className="absolute right-1.5 h-3.5 w-3.5 text-amber-500" />}
            </button>
            <button
              type="button"
              onClick={handleAuthClick}
              disabled={!isLoaded}
              className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-[#10B981] text-[#34d399] hover:text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[0_2px_10px_rgba(16,185,129,0.05)] hover:shadow-[0_4px_18px_rgba(16,185,129,0.25)] transition-all duration-300 active:scale-[0.98] cursor-pointer group disabled:opacity-50 disabled:cursor-wait"
            >
              <LogIn className="h-4 w-4 text-[#34d399] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              <span className="hidden sm:inline">{isSignedIn ? 'Ir al panel' : 'Iniciar sesión'}</span>
            </button>
          </div>

          {/* Center Block: Search Bar (full width on mobile, inline on desktop) */}
          <div className="order-3 w-full lg:order-2 lg:w-auto lg:flex-1 lg:max-w-xl relative min-w-0" ref={searchRef}>
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchInput.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Buscar por cargo, habilidades, nombre..."
                  className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-[#102030] text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 focus:bg-slate-50 dark:focus:bg-[#0e1e2a] focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-inner"
                  autoComplete="off"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              
              <button
                onClick={() => {
                  if (inputRef.current) inputRef.current.focus();
                  showToast('success', 'Búsqueda aplicada en tiempo real.');
                }}
                className="hidden sm:flex items-center gap-2 px-4 lg:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)] transition-all transform active:scale-[0.98] cursor-pointer group shrink-0"
              >
                <Search className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">Buscar</span>
              </button>
            </div>

            {/* Floating Autocomplete Suggestions */}
            {showSuggestions && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-white dark:bg-[#12232e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 max-h-64 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <button
                    key={s.label}
                    onClick={() => handleSuggestionSelect(s)}
                    className={`w-full px-4 py-3 flex items-center gap-3 border-none bg-transparent hover:bg-slate-50 dark:hover:bg-[#162a37] text-left cursor-pointer transition-colors ${
                      idx === activeSuggestionIndex ? 'bg-slate-50 dark:bg-[#162a37]' : ''
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center min-w-[50px] px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                      s.type === 'role' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' : s.type === 'name' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}>
                      {s.type === 'role' ? 'Cargo' : s.type === 'name' ? 'User' : 'Tech'}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── TWO-COLUMN DYNAMIC EXPLORER LAYOUT ── */}
      <main className="flex-1 flex w-full relative min-h-0">

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-x-0 bottom-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            style={{ top: navHeight }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── LEFT COLUMN: Unified Collapsible Accordion Sidebar ── */}
        <aside
          className={`bg-slate-50 dark:bg-[#0c1825] border-r border-slate-200 dark:border-slate-800/80 flex flex-col select-none transition-all duration-300 ease-in-out z-50
            fixed left-0 lg:relative lg:top-0 lg:h-[calc(100vh-64px)] lg:sticky lg:shrink-0
            ${sidebarOpen
              ? 'translate-x-0 w-[min(280px,85vw)] lg:w-[260px]'
              : '-translate-x-full w-[min(280px,85vw)] lg:translate-x-0 lg:w-16'
            }`}
          style={{
            top: navHeight,
            height: `calc(100dvh - ${navHeight}px)`,
          }}
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 flex flex-col gap-4 custom-scrollbar-thin">
            
            {/* 1. TECNOLOGIAS */}
            <div className="flex flex-col w-full border-b border-slate-800/60 pb-1">
              <button
                onClick={() => handleTabClick('skills')}
                className={`w-full flex items-center px-4 py-3.5 text-left transition-colors cursor-pointer group ${
                  activeTab === 'skills' && sidebarOpen
                    ? 'text-[#34d399] font-bold bg-[#10b981]/10 border-l-2 border-[#10b981]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/20 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-center w-8 shrink-0">
                  <Code2 className="h-5 w-5" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between ml-3 overflow-hidden">
                    <span className="text-[11px] font-black tracking-widest uppercase truncate">TECNOLOGIAS</span>
                    <div className="flex items-center gap-1.5">
                      {activeTabCounts.skills > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#10B981] px-1 text-[8px] font-black text-white">
                          {activeTabCounts.skills}
                        </span>
                      )}
                      {activeTab === 'skills' ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                )}
              </button>
              
              {sidebarOpen && activeTab === 'skills' && (
                <div className="px-5 py-3 bg-slate-100 dark:bg-[#0f1d2a]/40 border-t border-slate-200 dark:border-slate-800/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-relaxed">Seleccionar habilidades:</p>
                    {selectedSkills.length > 0 && (
                      <button
                        onClick={() => clearCategoryFilters('skills')}
                        className="text-[9px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase border-none bg-transparent cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar-thin">
                    {availableSkills.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Cargando tecnologías...</span>
                    ) : (
                      availableSkills.map((skill) => {
                        const isChecked = selectedSkills.includes(skill);
                        return (
                          <label key={skill} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedSkills((prev) =>
                                  isChecked ? prev.filter((s) => s !== skill) : [...prev, skill]
                                );
                              }}
                              className="rounded border-slate-300 dark:border-slate-600 !bg-white dark:!bg-slate-800 accent-[#10B981] h-4 w-4 cursor-pointer"
                            />
                            <span>{skill}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. CARGOS */}
            <div className="flex flex-col w-full border-b border-slate-800/60 pb-1">
              <button
                onClick={() => handleTabClick('roles')}
                className={`w-full flex items-center px-4 py-3.5 text-left transition-colors cursor-pointer group ${
                  activeTab === 'roles' && sidebarOpen
                    ? 'text-[#34d399] font-bold bg-[#10b981]/10 border-l-2 border-[#10b981]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/20 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-center w-8 shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between ml-3 overflow-hidden">
                    <span className="text-[11px] font-black tracking-widest uppercase truncate">CARGOS</span>
                    <div className="flex items-center gap-1.5">
                      {activeTabCounts.roles > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#10B981] px-1 text-[8px] font-black text-white">
                          {activeTabCounts.roles}
                        </span>
                      )}
                      {activeTab === 'roles' ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                )}
              </button>
              
              {sidebarOpen && activeTab === 'roles' && (
                <div className="px-5 py-3 bg-slate-100 dark:bg-[#0f1d2a]/40 border-t border-slate-200 dark:border-slate-800/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-relaxed">Seleccionar cargos:</p>
                    {selectedRoles.length > 0 && (
                      <button
                        onClick={() => clearCategoryFilters('roles')}
                        className="text-[9px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase border-none bg-transparent cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar-thin">
                    {availableRoles.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Cargando cargos...</span>
                    ) : (
                      availableRoles.map((role) => {
                        const isChecked = selectedRoles.includes(role);
                        return (
                          <label key={role} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedRoles((prev) =>
                                  isChecked ? prev.filter((r) => r !== role) : [...prev, role]
                                );
                              }}
                              className="rounded border-slate-300 dark:border-slate-600 !bg-white dark:!bg-slate-800 accent-[#10B981] h-4 w-4 cursor-pointer"
                            />
                            <span>{role}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. UBICACION */}
            <div className="flex flex-col w-full border-b border-slate-800/60 pb-1">
              <button
                onClick={() => handleTabClick('city')}
                className={`w-full flex items-center px-4 py-3.5 text-left transition-colors cursor-pointer group ${
                  activeTab === 'city' && sidebarOpen
                    ? 'text-[#34d399] font-bold bg-[#10b981]/10 border-l-2 border-[#10b981]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/20 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-center w-8 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between ml-3 overflow-hidden">
                    <span className="text-[11px] font-black tracking-widest uppercase truncate">UBICACION</span>
                    <div className="flex items-center gap-1.5">
                      {activeTabCounts.city > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#10B981] px-1 text-[8px] font-black text-white">
                          {activeTabCounts.city}
                        </span>
                      )}
                      {activeTab === 'city' ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                )}
              </button>
              
              {sidebarOpen && activeTab === 'city' && (
                <div className="px-5 py-3 bg-slate-100 dark:bg-[#0f1d2a]/40 border-t border-slate-200 dark:border-slate-800/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-relaxed">Seleccionar procedencia:</p>
                    {selectedCity && (
                      <button
                        onClick={() => clearCategoryFilters('city')}
                        className="text-[9px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase border-none bg-transparent cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#102030] px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-[#102030] text-slate-900 dark:text-slate-200">Todas las ciudades</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city} className="bg-white dark:bg-[#102030] text-slate-900 dark:text-slate-200">{city}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 4. EXPERIENCIA */}
            <div className="flex flex-col w-full border-b border-slate-800/60 pb-1">
              <button
                onClick={() => handleTabClick('experience')}
                className={`w-full flex items-center px-4 py-3.5 text-left transition-colors cursor-pointer group ${
                  activeTab === 'experience' && sidebarOpen
                    ? 'text-[#34d399] font-bold bg-[#10b981]/10 border-l-2 border-[#10b981]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/20 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-center w-8 shrink-0">
                  <CalendarRange className="h-5 w-5" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between ml-3 overflow-hidden">
                    <span className="text-[11px] font-black tracking-widest uppercase truncate">EXPERIENCIA</span>
                    <div className="flex items-center gap-1.5">
                      {activeTabCounts.experience > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#10B981] px-1 text-[8px] font-black text-white">
                          {activeTabCounts.experience}
                        </span>
                      )}
                      {activeTab === 'experience' ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                )}
              </button>
              
              {sidebarOpen && activeTab === 'experience' && (
                <div className="px-5 py-3 bg-slate-100 dark:bg-[#0f1d2a]/40 border-t border-slate-200 dark:border-slate-800/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-relaxed">Experiencia mínima:</p>
                    {minExperience > 0 && (
                      <button
                        onClick={() => clearCategoryFilters('experience')}
                        className="text-[9px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase border-none bg-transparent cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="px-1 py-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black">Min:</span>
                      <span className="text-xs font-black text-[#34d399] bg-[#10b981]/10 px-2 py-0.5 rounded-md">
                        {minExperience === 0 ? 'Cualquiera' : `${minExperience} ${minExperience === 1 ? 'año' : 'años'}`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={minExperience}
                      onChange={(e) => setMinExperience(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-bold">
                      <span>0 años</span>
                      <span>5 años</span>
                      <span>10+ años</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. PROYECTOS */}
            <div className="flex flex-col w-full border-b border-slate-800/60 pb-1">
              <button
                onClick={() => handleTabClick('projects')}
                className={`w-full flex items-center px-4 py-3.5 text-left transition-colors cursor-pointer group ${
                  activeTab === 'projects' && sidebarOpen
                    ? 'text-[#34d399] font-bold bg-[#10b981]/10 border-l-2 border-[#10b981]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/20 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-center w-8 shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between ml-3 overflow-hidden">
                    <span className="text-[11px] font-black tracking-widest uppercase truncate">PROYECTOS</span>
                    <div className="flex items-center gap-1.5">
                      {activeTabCounts.projects > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#10B981] px-1 text-[8px] font-black text-white">
                          {activeTabCounts.projects}
                        </span>
                      )}
                      {activeTab === 'projects' ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                )}
              </button>
              
              {sidebarOpen && activeTab === 'projects' && (
                <div className="px-5 py-3 bg-slate-100 dark:bg-[#0f1d2a]/40 border-t border-slate-200 dark:border-slate-800/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-relaxed">Proyectos mínimos:</p>
                    {minProjects > 0 && (
                      <button
                        onClick={() => clearCategoryFilters('projects')}
                        className="text-[9px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase border-none bg-transparent cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="px-1 py-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black">Min:</span>
                      <span className="text-xs font-black text-[#34d399] bg-[#10b981]/10 px-2 py-0.5 rounded-md">
                        {minProjects === 0 ? 'Cualquiera' : `${minProjects} ${minProjects === 1 ? 'proy' : 'proys'}`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={minProjects}
                      onChange={(e) => setMinProjects(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-bold">
                      <span>0 proy</span>
                      <span>5 proy</span>
                      <span>10+ proy</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </aside>

        {/* ── RIGHT COLUMN: Main Content Area (Hero + Cards Grid) ── */}
        <div
          className="flex-1 min-w-0 bg-slate-50 dark:bg-[#0c1825] px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 overflow-y-auto custom-scrollbar-thin z-30"
          style={{ maxHeight: `calc(100dvh - ${navHeight}px)` }}
        >
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            
            {/* HERO SECTION - Styled dynamically to look extremely premium */}
            <section className="relative overflow-hidden rounded-2xl sm:rounded-[28px] bg-gradient-to-br from-white dark:from-[#12232e] to-slate-50 dark:to-[#0c1825] border border-slate-200 dark:border-slate-800/80 p-5 sm:p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              {/* Background luminous blobs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-purple-500 rounded-full blur-[90px] opacity-10" />
                <div className="absolute bottom-[-100px] right-[-50px] w-72 h-72 bg-emerald-500 rounded-full blur-[80px] opacity-10" />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-2xl w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 dark:text-emerald-400 mb-4 sm:mb-6">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Talento tecnológico verificado
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-3 sm:mb-4">
                    Descubre el mejor{' '}
                    <span className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 dark:from-purple-400 dark:via-indigo-300 dark:to-emerald-400 bg-clip-text text-transparent">
                      talento tech
                    </span>
                  </h1>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed mb-6 sm:mb-8 max-w-lg">
                    Explora portafolios aprobados de desarrolladores, diseñadores y científicos de datos bolivianos listos para integrarse a tu equipo.
                  </p>

                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={handlePublishPortfolioClick}
                      disabled={!isLoaded}
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-transparent hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all shadow-sm dark:shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      Publica tu portafolio
                    </button>
                  </div>
                </div>

                {/* Right Side Tech Illustration (Hidden on mobile) */}
                <div className="hidden lg:block relative mr-16 lg:mr-24 pointer-events-none transform scale-125 -translate-x-8 origin-center">
                  <div className="relative">
                    {/* Main Central Icon */}
                    <div className="bg-white dark:bg-[#102030] p-8 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 relative z-20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                      <Code2 className="h-24 w-24 text-emerald-500" />
                    </div>
                    {/* Floating Element 1 (Top Right) */}
                    <div className="absolute -top-8 -right-8 bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-[0_10px_30px_rgba(99,102,241,0.3)] animate-[bounce_4s_infinite] z-30">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    {/* Floating Element 2 (Bottom Left) */}
                    <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-[bounce_5s_infinite_reverse] z-30">
                      <FolderGit2 className="h-8 w-8 text-indigo-500" />
                    </div>
                    {/* Floating Element 3 (Bottom Right) */}
                    <div className="absolute -bottom-4 -right-12 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 animate-[pulse_3s_infinite] z-10">
                      <Briefcase className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* DYNAMIC RESULTS SUMMARY & ACTIVE CHIPS */}
            <div className="space-y-4">
              
              {/* Results status bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Portafolios: {loading ? '...' : filteredPortfolios.length}
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Limpiar Filtros</span>
                  </button>
                )}
              </div>

              {/* Selected Interactive Filter Chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 p-3 rounded-2xl shadow-inner">
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 mr-1">Activos:</span>
                  {searchInput.trim() && (
                    <button
                      onClick={() => removeChip('search', searchInput)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
                    >
                      <span>"{searchInput}"</span>
                      <XCircle className="h-3.5 w-3.5 text-slate-500 ml-1.5" />
                    </button>
                  )}
                  {activeChips.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => removeChip(c.type, c.label)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                        c.type === 'skill'
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10'
                          : c.type === 'role'
                          ? 'border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10'
                          : c.type === 'name'
                          ? 'border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10'
                          : c.type === 'city'
                          ? 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-300 hover:bg-blue-500/10'
                          : c.type === 'experience'
                          ? 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-300 hover:bg-amber-500/10'
                          : 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-300 hover:bg-rose-500/10'
                      }`}
                    >
                      {c.type === 'skill' && <Code2 className="h-3.5 w-3.5" />}
                      {c.type === 'role' && <Briefcase className="h-3.5 w-3.5" />}
                      {c.type === 'name' && <User className="h-3.5 w-3.5" />}
                      {c.type === 'city' && <MapPin className="h-3.5 w-3.5" />}
                      {c.type === 'experience' && <CalendarRange className="h-3.5 w-3.5" />}
                      {c.type === 'projects' && <Layers className="h-3.5 w-3.5" />}
                      <span>{c.label}</span>
                      <XCircle className="h-3.5 w-3.5 text-slate-500 ml-1.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PORTFOLIO GRID CONTAINER */}
            <div className="w-full">
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {!loading && searched && filteredPortfolios.length === 0 && (
                <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/10 rounded-[28px] py-20 px-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 mb-4">
                    <User className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-350">Sin perfiles encontrados</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
                    No encontramos ningún talento tecnológico que cumpla con los filtros seleccionados. Intenta limpiando los filtros actuales.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-6 inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-600 dark:text-slate-350 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-2xl transition-all cursor-pointer"
                  >
                    Ver todos los usuarios
                  </button>
                </div>
              )}

              {!loading && filteredPortfolios.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredPortfolios.map((p) => (
                    <PortfolioCardItem key={p.id} portfolio={p} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer className="lp-footer py-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0b131c]/60 z-30">
        <div className="w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-center text-xs font-semibold text-slate-500 gap-4">
          <span>© 2026 NOWER Workspaces · Bolivia HQ</span>
        </div>
      </footer>

    </div>
  );
};
