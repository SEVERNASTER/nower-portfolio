import React, {
  useEffect,
  useState,
} from 'react';

import { useParams } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

import { fetchPublicPortfolio } from './portfolioService';
import { renderPortfolioTemplate } from './templates/PortfolioTemplates';

export const PublicPortfolioPage: React.FC = () => {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    if (stored !== null) return stored === 'dark';
    return document.documentElement.classList.contains('dark') || true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setIsDark(e.newValue === 'dark');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (!slug) {
      setError('Este portafolio no está disponible públicamente.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);

      try {
        const response = await fetchPublicPortfolio(slug);
        setData(response);
      } catch (e) {
        setError('Este portafolio no está disponible públicamente.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-slate-600 dark:bg-[#10221C] dark:text-slate-300 transition-colors duration-300">
        Cargando portafolio…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-center dark:bg-[#10221C] transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Portafolio no disponible
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            El portafolio puede estar en borrador, pendiente de revisión o despublicado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-[#10221C] sm:p-8 transition-colors duration-300 relative">
      <button
        onClick={() => {
          const next = !isDark;
          setIsDark(next);
          localStorage.setItem('theme', next ? 'dark' : 'light');
        }}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-white p-3 text-slate-700 shadow-xl border border-slate-200 transition-colors hover:bg-slate-50 dark:border-[#1d4254] dark:bg-[#102637] dark:text-slate-200 dark:hover:bg-[#153248]"
        aria-label="Alternar modo oscuro"
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="mx-auto max-w-6xl">
        {renderPortfolioTemplate(data.portfolio.template_key, data.user)}
      </div>
    </div>
  );
};