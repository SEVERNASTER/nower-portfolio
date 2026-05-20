import React from 'react';

import {
  Award,
  Briefcase,
  Code,
  FolderGit2,
  GraduationCap,
  MapPin,
  Phone,
} from 'lucide-react';

interface PortfolioTemplateProps {
  user: any;
}

function getWorkExperiences(user: any) {
  return (user?.experiences || []).filter((item: any) => item.type !== 'academic');
}

function getEducation(user: any) {
  return (user?.experiences || []).filter((item: any) => item.type === 'academic');
}

function formatDate(value?: string | null) {
  if (!value) return 'Actual';

  try {
    return new Date(value).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
    });
  } catch {
    return value;
  }
}

const SectionTitle: React.FC<{ icon?: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="mb-4 flex items-center gap-2">
    {icon}
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
  </div>
);

export const ClassicPortfolioTemplate: React.FC<PortfolioTemplateProps> = ({ user }) => {
  const projects = user?.projects || [];
  const skills = user?.skills || [];
  const experiences = getWorkExperiences(user);
  const education = getEducation(user);
  const achievements = user?.achievements || [];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#17262C]">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {user?.imagen_profile && (
            <img
              src={user.imagen_profile}
              alt={user.full_name}
              className="h-28 w-28 rounded-3xl object-cover ring-4 ring-white/30"
            />
          )}

          <div>
            <h1 className="text-3xl font-black">{user?.full_name || 'Sin nombre'}</h1>
            <p className="mt-1 text-lg text-white/90">{user?.profession || 'Profesional'}</p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/80">
              {user?.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.city}
                </span>
              )}

              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10 p-8">
        {user?.bio && (
          <section>
            <SectionTitle title="Sobre mí" />
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">{user.bio}</p>
          </section>
        )}

        <section>
          <SectionTitle icon={<FolderGit2 className="h-5 w-5 text-emerald-500" />} title="Proyectos" />
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project: any) => (
              <article key={project.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                {project.images?.[0]?.url && (
                  <img
                    src={project.images[0].url}
                    alt={project.title}
                    className="mb-3 h-36 w-full rounded-xl object-cover"
                  />
                )}
                <h4 className="font-bold text-slate-900 dark:text-white">{project.title}</h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(project.tags || []).map((tag: string) => (
                    <span key={tag} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={<Code className="h-5 w-5 text-emerald-500" />} title="Habilidades" />
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: any) => (
              <span key={skill.id} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {skill.name}
              </span>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={<Briefcase className="h-5 w-5 text-emerald-500" />} title="Experiencia" />
          <div className="space-y-4">
            {experiences.map((exp: any) => (
              <article key={exp.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white">{exp.title}</h4>
                <p className="text-sm text-slate-500">{exp.institution}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                </p>
                {exp.description && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{exp.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={<GraduationCap className="h-5 w-5 text-emerald-500" />} title="Formación Académica" />
          <div className="space-y-4">
            {education.map((edu: any) => (
              <article key={edu.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white">{edu.title}</h4>
                <p className="text-sm text-slate-500">{edu.institution}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={<Award className="h-5 w-5 text-emerald-500" />} title="Logros y Certificaciones" />
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement: any) => (
              <article key={achievement.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white">{achievement.title}</h4>
                <p className="text-sm text-slate-500">{achievement.institution}</p>
                {achievement.description && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{achievement.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export const ModernPortfolioTemplate: React.FC<PortfolioTemplateProps> = ({ user }) => {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
        {user?.imagen_profile && (
          <img
            src={user.imagen_profile}
            alt={user.full_name}
            className="mb-5 h-32 w-32 rounded-full object-cover ring-4 ring-emerald-400/30"
          />
        )}

        <h1 className="text-2xl font-black">{user?.full_name || 'Sin nombre'}</h1>
        <p className="mt-1 text-emerald-300">{user?.profession || 'Profesional'}</p>

        {user?.bio && (
          <p className="mt-5 text-sm leading-relaxed text-slate-300">{user.bio}</p>
        )}

        <div className="mt-6 space-y-2 text-sm text-slate-300">
          {user?.city && <p>{user.city}</p>}
          {user?.phone && <p>{user.phone}</p>}
        </div>
      </aside>

      <main className="space-y-6">
        <ClassicPortfolioTemplate user={user} />
      </main>
    </div>
  );
};

export const CreativePortfolioTemplate: React.FC<PortfolioTemplateProps> = ({ user }) => {
  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-purple-100 via-white to-emerald-100 p-4 shadow-xl dark:from-purple-950/40 dark:via-[#17262C] dark:to-emerald-950/40">
      <div className="rounded-[1.5rem] bg-white/80 p-6 backdrop-blur dark:bg-slate-950/50">
        <div className="mb-8 text-center">
          {user?.imagen_profile && (
            <img
              src={user.imagen_profile}
              alt={user.full_name}
              className="mx-auto mb-4 h-28 w-28 rounded-full object-cover ring-4 ring-purple-300"
            />
          )}

          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            {user?.full_name || 'Sin nombre'}
          </h1>

          <p className="mt-2 text-lg font-semibold text-purple-600 dark:text-purple-300">
            {user?.profession || 'Profesional'}
          </p>

          {user?.bio && (
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
              {user.bio}
            </p>
          )}
        </div>

        <ClassicPortfolioTemplate user={user} />
      </div>
    </div>
  );
};

export function renderPortfolioTemplate(templateKey: string, user: any) {
  if (templateKey === 'modern') {
    return <ModernPortfolioTemplate user={user} />;
  }

  if (templateKey === 'creative') {
    return <CreativePortfolioTemplate user={user} />;
  }

  return <ClassicPortfolioTemplate user={user} />;
}