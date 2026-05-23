import React, {
  useEffect,
  useState,
} from 'react';

import { useParams } from 'react-router-dom';

import { fetchPublicPortfolio } from './portfolioService';
import { renderPortfolioTemplate } from './templates/PortfolioTemplates';

export const PublicPortfolioPage: React.FC = () => {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-slate-50 p-8 text-slate-600 dark:bg-[#10221C] dark:text-slate-300">
        Cargando portafolio…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-center dark:bg-[#10221C]">
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
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-[#10221C] sm:p-8">
      <div className="mx-auto max-w-6xl">
        {renderPortfolioTemplate(data.portfolio.template_key, data.user)}
      </div>
    </div>
  );
};