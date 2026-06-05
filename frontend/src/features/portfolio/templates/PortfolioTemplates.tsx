import React from 'react';

import {
  Award,
  Bookmark,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Code,
  FileText,
  FolderGit2,
  GraduationCap,
  Laptop,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

import { PlatformIcon } from '../../projects/components/PlatformIcon';
import {
  FaCss3Alt,
  FaFigma,
  FaHtml5,
  FaJava,
  FaReact,
} from 'react-icons/fa';
import {
  SiJavascript,
  SiNextdotjs,
  SiPostgresql,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';

const skillMetaMap: Record<
  string,
  {
    icon: any;
    iconClassName: string;
  }
> = {
  figma: {
    icon: FaFigma,
    iconClassName: 'text-pink-400',
  },
  html: {
    icon: FaHtml5,
    iconClassName: 'text-orange-500',
  },
  css: {
    icon: FaCss3Alt,
    iconClassName: 'text-blue-400',
  },
  javascript: {
    icon: SiJavascript,
    iconClassName: 'text-yellow-300',
  },
  typescript: {
    icon: SiTypescript,
    iconClassName: 'text-sky-400',
  },
  react: {
    icon: FaReact,
    iconClassName: 'text-cyan-400',
  },
  'react.js': {
    icon: FaReact,
    iconClassName: 'text-cyan-400',
  },
  next: {
    icon: SiNextdotjs,
    iconClassName: 'text-slate-200',
  },
  'next.js': {
    icon: SiNextdotjs,
    iconClassName: 'text-slate-200',
  },
  java: {
    icon: FaJava,
    iconClassName: 'text-orange-400',
  },
  postgresql: {
    icon: SiPostgresql,
    iconClassName: 'text-blue-300',
  },
  tailwind: {
    icon: SiTailwindcss,
    iconClassName: 'text-cyan-300',
  },
  'tailwind css': {
    icon: SiTailwindcss,
    iconClassName: 'text-cyan-300',
  },
};

const normalizeSkillName = (skill: string) => skill.trim().toLowerCase();

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

const PortfolioContentSections: React.FC<PortfolioTemplateProps> = ({ user }) => {
  const projects = user?.projects || [];
  const skills = user?.skills || [];
  const experiences = getWorkExperiences(user);
  const education = getEducation(user);
  const achievements = user?.achievements || [];

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle icon={<FolderGit2 className="h-5 w-5 text-emerald-500" />} title="Proyectos" />
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project: any) => (
            <article
              key={project.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
            >
              {project.images?.[0]?.url && (
                <img
                  src={project.images[0].url}
                  alt={project.title}
                  className="mb-3 h-36 w-full rounded-xl object-cover"
                />
              )}

              <h4 className="font-bold text-slate-900 dark:text-white">
                {project.title}
              </h4>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {project.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(project.tags || []).map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
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
            <span
              key={skill.id}
              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle icon={<Briefcase className="h-5 w-5 text-emerald-500" />} title="Experiencia" />
        <div className="space-y-4">
          {experiences.map((exp: any) => (
            <article
              key={exp.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <h4 className="font-bold text-slate-900 dark:text-white">
                {exp.title}
              </h4>

              <p className="text-sm text-slate-500">
                {exp.institution}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
              </p>

              {exp.description && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {exp.description}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle icon={<GraduationCap className="h-5 w-5 text-emerald-500" />} title="Formación Académica" />
        <div className="space-y-4">
          {education.map((edu: any) => (
            <article
              key={edu.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <h4 className="font-bold text-slate-900 dark:text-white">
                {edu.title}
              </h4>

              <p className="text-sm text-slate-500">
                {edu.institution}
              </p>

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
            <article
              key={achievement.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <h4 className="font-bold text-slate-900 dark:text-white">
                {achievement.title}
              </h4>

              <p className="text-sm text-slate-500">
                {achievement.institution}
              </p>

              {achievement.hours != null && achievement.hours > 0 && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  {achievement.hours} horas
                </p>
              )}

              {achievement.description && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {achievement.description}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

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

              {user?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
              )}

              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {user.phone}
                </span>
              )}

              {user?.social_links?.length > 0 && user.social_links.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  <PlatformIcon platform={link.platform_name} className="h-4 w-4" />
                  {link.platform_name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10 p-8">
        {user?.bio && (
          <section>
            <SectionTitle icon={<Award className="h-5 w-5 text-emerald-500" />} title="Sobre mí" />
            <p className="leading-relaxed text-slate-600 dark:text-slate-300 break-words whitespace-pre-wrap">{user.bio}</p>
          </section>
        )}

        <section>
          <SectionTitle icon={<FolderGit2 className="h-5 w-5 text-emerald-500" />} title="Proyectos" />
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project: any) => (
              <article key={project.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:bg-[#1e2e35] dark:border-slate-700 p-5 transition-all hover:border-emerald-300 dark:hover:border-emerald-300/30">
                {project.images?.[0]?.url && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <img src={project.images[0].url} alt={project.title} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors break-words">{project.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 break-words whitespace-pre-wrap overflow-hidden">{project.description}</p>
                
                {(project.tags || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(project.tags || []).map((tag: string) => {
                      const techMeta = skillMetaMap[normalizeSkillName(tag)];
                      const Icon = techMeta?.icon;
                      const iconClassName = techMeta?.iconClassName ?? 'text-emerald-500 dark:text-emerald-400';

                      return (
                        <span key={tag} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/15 bg-emerald-50 dark:bg-[#1a2b32] px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-slate-200">
                          {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClassName}`} />}
                          <span className="truncate max-w-full">{tag}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
                
                {Array.isArray(project.links) && project.links.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/40">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Enlaces</p>
                    <div className="flex flex-wrap gap-2">
                      {project.links.map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url?.startsWith('http') ? link.url : `https://${link.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-emerald-400/15 bg-white dark:bg-[#1a2b32] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <PlatformIcon platform={link.platform_name || ''} className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                          <span className="truncate max-w-full">{link.platform_name || link.url}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={<Code className="h-5 w-5 text-emerald-500" />} title="Habilidades" />
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: any) => {
              const techMeta = skillMetaMap[normalizeSkillName(skill.name || '')];
              const Icon = techMeta?.icon;
              const iconClassName = techMeta?.iconClassName ?? 'text-emerald-500 dark:text-emerald-400';

              return (
                <span key={skill.id} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#1e2e35] dark:text-slate-200 px-3 py-1.5 text-xs font-semibold max-w-full">
                  {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClassName}`} />}
                  <span className="truncate max-w-full">{skill.name}</span>
                </span>
              );
            })}
          </div>
        </section>

        <section>
          <SectionTitle icon={<Briefcase className="h-5 w-5 text-emerald-500" />} title="Experiencia" />
          <div className="relative border-l border-amber-200/60 dark:border-amber-800/30 ml-4 pl-6 space-y-8">
            {experiences.map((exp: any) => {
              const rawDesc: string = exp.description || '';
              let modalidad: string | undefined;
              let ubicacion: string | undefined;
              const cleanLines: string[] = [];
              rawDesc.split('\n').forEach((line: string) => {
                const t = line.trim();
                if (t.startsWith('Modalidad:')) modalidad = t.replace('Modalidad:', '').trim();
                else if (t.startsWith('Ubicación:')) ubicacion = t.replace('Ubicación:', '').trim();
                else if (!t.startsWith('Tecnologías:')) cleanLines.push(t);
              });
              const cleanDesc = cleanLines.filter(Boolean).join('\n').trim();

              return (
                <div key={exp.id} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-4 border-white dark:border-[#17262C] bg-amber-500 ring-4 ring-amber-500/10" />
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors break-words">{exp.title}</h4>
                    {!exp.end_date && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Actual
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {exp.institution && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/10">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-full">{exp.institution}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span>{formatDate(exp.start_date)} — {formatDate(exp.end_date)}</span>
                    </div>
                    {modalidad && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/10">
                        <Laptop className="h-3.5 w-3.5 shrink-0" />
                        <span>{modalidad}</span>
                      </div>
                    )}
                    {ubicacion && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/5 text-xs font-bold text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/10">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-full">{ubicacion}</span>
                      </div>
                    )}
                  </div>

                  {cleanDesc && <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 break-words whitespace-pre-wrap overflow-hidden">{cleanDesc}</p>}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <SectionTitle icon={<GraduationCap className="h-5 w-5 text-emerald-500" />} title="Formación Académica" />
          <div className="relative border-l border-violet-200/60 dark:border-violet-800/30 ml-4 pl-6 space-y-8">
            {education.map((edu: any) => (
              <div key={edu.id} className="relative group">
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-4 border-white dark:border-[#17262C] bg-violet-500 ring-4 ring-violet-500/10" />
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors break-words text-lg">
                    {edu.title}
                  </h4>
                  {edu.status && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                      edu.status === 'Pausado'
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        : edu.status === 'En curso'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                    }`}>
                      {edu.status === 'En curso' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {edu.status === 'Pausado' && <Bookmark className="h-3 w-3 shrink-0 text-amber-500" />}
                      {edu.status === 'Graduado' && <GraduationCap className="h-3 w-3 shrink-0 text-blue-500" />}
                      {edu.status}
                    </span>
                  )}
                </div>

                {edu.degree_type && (
                  <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-1 break-words">
                    {edu.degree_type}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {edu.institution && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-500/5 text-xs font-bold text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/10">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                      <span className="truncate max-w-full">{edu.institution}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                    <span>{formatDate(edu.start_date)} — {formatDate(edu.end_date)}</span>
                  </div>
                </div>

                {edu.description && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 break-words whitespace-pre-wrap overflow-hidden">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={<Award className="h-5 w-5 text-emerald-500" />} title="Logros y Certificaciones" />
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((a: any) => {
              const files: string[] = [];
              if (Array.isArray(a.files) && a.files.length > 0) {
                a.files.forEach((f: any) => { if (f?.url) files.push(f.url); });
              } else if (a.file_url) {
                files.push(a.file_url);
              }

              return (
                <div key={a.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col items-start bg-slate-50 dark:bg-[#1e2e35] transition-all hover:border-emerald-300 dark:hover:border-emerald-300/30">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base break-words w-full">{a.title}</h4>
                  <p className="text-sm text-slate-500 mt-1 break-words w-full">{a.institution}</p>
                  {a.hours != null && a.hours > 0 && (
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">{a.hours} horas</p>
                  )}
                  {a.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 break-words w-full">{a.description}</p>}
                  
                  {files.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5 w-full">
                      {files.map((url, idx) => {
                        const fileName = url.split('/').pop() || 'certificado';
                        let displayName = 'Ver certificado';
                        try {
                          const decoded = decodeURIComponent(fileName);
                          const base = decoded.split('-').slice(1).join('-') || decoded;
                          if (base.length > 25) {
                            displayName = base.substring(0, 22) + '...';
                          } else if (base.length > 4) {
                            displayName = base;
                          }
                        } catch {
                          displayName = 'Ver certificado';
                        }

                        return (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors shadow-sm"
                          >
                            <FileText className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{displayName}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export const ModernPortfolioTemplate: React.FC<PortfolioTemplateProps> = ({ user }) => {
  const projects = user?.projects || [];
  const skills = user?.skills || [];
  const workExp = getWorkExperiences(user);
  const education = getEducation(user);
  const achievements = user?.achievements || [];

  const cardClass =
    'rounded-2xl border border-slate-200 dark:border-[#1d4254] bg-white dark:bg-[linear-gradient(135deg,#102634_0%,#0b1f30_55%,#0c2236_100%)] p-5 sm:p-6 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_0_28px_rgba(20,215,163,0.05),0_10px_30px_rgba(0,0,0,0.18)]';

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-[#121c22] shadow-2xl">
      <div className="relative w-full shrink-0 bg-gradient-to-br from-teal-500 via-emerald-600 to-emerald-800 p-8 sm:p-12 overflow-hidden">
        {/* Decorative subtle glows inside the banner */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-6 z-10">
          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-xl overflow-hidden shrink-0 transition-transform hover:scale-105 duration-300">
            {user?.imagen_profile ? (
              <img src={user.imagen_profile} alt={user?.full_name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-5xl font-black text-white drop-shadow-md">
                {(user?.full_name || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-center sm:text-left flex flex-col gap-1.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight break-words drop-shadow-sm">
              {user?.full_name || 'Sin nombre'}
            </h1>
            <p className="text-base sm:text-xl font-semibold text-emerald-100 tracking-wide break-words">
              {user?.profession || 'Profesional'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-12 pt-8 pb-10">

        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4 space-y-6 min-w-0 overflow-hidden">
            <div className={cardClass}>
              <h3 className="mb-5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-emerald-400">
                <Phone className="h-4 w-4 shrink-0" />Contacto
              </h3>
              <div className="space-y-4">
                {user?.city && (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-400/10">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ubicación</p>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{user.city}</p>
                    </div>
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-400/10">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Correo</p>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{user.email}</p>
                    </div>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-400/10">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Teléfono</p>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user?.social_links?.length > 0 && user.social_links.map((link: any, idx: number) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 min-w-0 group hover:opacity-80 transition-opacity">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-400/10 transition-colors group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20">
                      <PlatformIcon platform={link.platform_name} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{link.platform_name}</p>
                      <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">{link.url.replace(/^https?:\/\/(www\.)?/, '')}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {user?.bio && (
              <div className={cardClass}>
                <h3 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-emerald-400">
                  <Award className="h-4 w-4 shrink-0" />Sobre mí
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 break-words whitespace-pre-wrap overflow-hidden">{user.bio}</p>
              </div>
            )}

            {skills.length > 0 && (
              <div className={cardClass}>
                <h3 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-emerald-400">
                  <Code className="h-4 w-4 shrink-0" />Habilidades ({skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any) => {
                    const techMeta = skillMetaMap[normalizeSkillName(skill.name || '')];
                    const Icon = techMeta?.icon;
                    const iconClassName = techMeta?.iconClassName ?? 'text-emerald-500 dark:text-emerald-400';

                    return (
                      <span key={skill.id} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-emerald-400/15 dark:bg-[#102637] dark:text-slate-200 px-3 py-1.5 text-xs font-semibold max-w-full">
                        {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClassName}`} />}
                        <span className="truncate max-w-full">{skill.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div className={cardClass}>
                <h3 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-emerald-400">
                  <Award className="h-4 w-4 shrink-0" />Logros y Certificaciones
                </h3>
                <div className="space-y-3">
                  {achievements.map((a: any) => {
                    const files: string[] = [];
                    if (Array.isArray(a.files) && a.files.length > 0) {
                      a.files.forEach((f: any) => { if (f?.url) files.push(f.url); });
                    } else if (a.file_url) {
                      files.push(a.file_url);
                    }

                    return (
                      <div key={a.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex flex-col items-start">
                        <p className="font-bold text-slate-900 dark:text-white text-sm break-words w-full">{a.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 break-words w-full">{a.institution}</p>
                        {a.hours != null && a.hours > 0 && (
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{a.hours} horas</p>
                        )}
                        {a.description && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 break-words w-full">{a.description}</p>}
                        
                        {files.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5 w-full">
                            {files.map((url, idx) => {
                              const fileName = url.split('/').pop() || 'certificado';
                              let displayName = 'Ver certificado';
                              try {
                                const decoded = decodeURIComponent(fileName);
                                const base = decoded.split('-').slice(1).join('-') || decoded;
                                if (base.length > 20) {
                                  displayName = base.substring(0, 17) + '...';
                                } else if (base.length > 4) {
                                  displayName = base;
                                }
                              } catch {
                                displayName = 'Ver certificado';
                              }

                              return (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors shadow-sm"
                                >
                                  <FileText className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                  <span>{displayName}</span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-8 space-y-6 min-w-0 overflow-hidden">
            {projects.length > 0 && (
              <div className={cardClass}>
                <h3 className="mb-6 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-emerald-400">
                  <FolderGit2 className="h-4 w-4 shrink-0" />Proyectos Destacados
                </h3>
                <div className="grid gap-4">
                  {projects.map((project: any) => (
                    <div key={project.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:bg-[linear-gradient(135deg,#102634_0%,#0b1f30_55%,#0c2236_100%)] dark:border-[#1d4254] p-5 transition-all hover:border-emerald-300 dark:hover:border-emerald-300/30">
                      {project.images?.[0]?.url && (
                        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 dark:border-[#1d4254]">
                          <img src={project.images[0].url} alt={project.title} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors break-words">{project.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 break-words whitespace-pre-wrap overflow-hidden">{project.description}</p>
                      {(project.tags || []).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(project.tags || []).map((tag: string) => {
                            const techMeta = skillMetaMap[normalizeSkillName(tag)];
                            const Icon = techMeta?.icon;
                            const iconClassName = techMeta?.iconClassName ?? 'text-emerald-500 dark:text-emerald-400';

                            return (
                              <span key={tag} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/15 bg-emerald-50 dark:bg-[#102637] px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-slate-200">
                                {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClassName}`} />}
                                <span className="truncate max-w-full">{tag}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {Array.isArray(project.links) && project.links.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/40">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Enlaces</p>
                          <div className="flex flex-wrap gap-2">
                            {project.links.map((link: any, idx: number) => (
                              <a
                                key={idx}
                                href={link.url?.startsWith('http') ? link.url : `https://${link.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-emerald-400/15 bg-white dark:bg-[#102637] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              >
                                <PlatformIcon platform={link.platform_name || ''} className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                                <span className="truncate max-w-full">{link.platform_name || link.url}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workExp.length > 0 && (
              <div className={cardClass}>
                <h3 className="mb-6 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-amber-400">
                  <Briefcase className="h-4 w-4 shrink-0" />Experiencia Laboral ({workExp.length})
                </h3>
                <div className="relative border-l border-amber-200/60 dark:border-amber-800/30 ml-4 pl-6 space-y-8">
                  {workExp.map((exp: any) => {
                    // Parse embedded metadata from description
                    const rawDesc: string = exp.description || '';
                    let modalidad: string | undefined;
                    let ubicacion: string | undefined;
                    const cleanLines: string[] = [];
                    rawDesc.split('\n').forEach((line: string) => {
                      const t = line.trim();
                      if (t.startsWith('Modalidad:')) modalidad = t.replace('Modalidad:', '').trim();
                      else if (t.startsWith('Ubicaci\u00f3n:')) ubicacion = t.replace('Ubicaci\u00f3n:', '').trim();
                      else if (!t.startsWith('Tecnolog\u00edas:')) cleanLines.push(t);
                    });
                    const cleanDesc = cleanLines.filter(Boolean).join('\n').trim();

                    return (
                      <div key={exp.id} className="relative group">
                        <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-4 border-slate-50 dark:border-[#121c22] bg-amber-500 ring-4 ring-amber-500/10" />
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors break-words">{exp.title}</h4>
                          {!exp.end_date && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Actual
                            </span>
                          )}
                        </div>

                        {/* Chips row */}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {exp.institution && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/10">
                              <Building2 className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate max-w-full">{exp.institution}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                            <span>{formatDate(exp.start_date)} — {formatDate(exp.end_date)}</span>
                          </div>
                          {modalidad && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/10">
                              <Laptop className="h-3.5 w-3.5 shrink-0" />
                              <span>{modalidad}</span>
                            </div>
                          )}
                          {ubicacion && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/5 text-xs font-bold text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/10">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate max-w-full">{ubicacion}</span>
                            </div>
                          )}
                        </div>

                        {cleanDesc && <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 break-words whitespace-pre-wrap overflow-hidden">{cleanDesc}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {education.length > 0 && (
              <div className={cardClass}>
                <h3 className="mb-6 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-violet-400">
                  <GraduationCap className="h-4 w-4 shrink-0" />Formación Académica ({education.length})
                </h3>
                <div className="relative border-l border-violet-200/60 dark:border-violet-800/30 ml-4 pl-6 space-y-8">
                  {education.map((edu: any) => (
                    <div key={edu.id} className="relative group">
                      <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-4 border-slate-50 dark:border-[#121c22] bg-violet-500 ring-4 ring-violet-500/10" />
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors break-words text-lg">
                          {edu.title}
                        </h4>
                        {edu.status && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                            edu.status === 'Pausado'
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                              : edu.status === 'En curso'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                              : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                          }`}>
                            {edu.status === 'En curso' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            {edu.status === 'Pausado' && <Bookmark className="h-3 w-3 shrink-0 text-amber-500" />}
                            {edu.status === 'Graduado' && <GraduationCap className="h-3 w-3 shrink-0 text-blue-500" />}
                            {edu.status}
                          </span>
                        )}
                      </div>

                      {edu.degree_type && (
                        <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-1 break-words">
                          {edu.degree_type}
                        </p>
                      )}

                      {/* Chips row */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {edu.institution && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-500/5 text-xs font-bold text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/10">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                            <span className="truncate max-w-full">{edu.institution}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                          <span>{formatDate(edu.start_date)} — {formatDate(edu.end_date)}</span>
                        </div>
                      </div>

                      {edu.description && (
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 break-words whitespace-pre-wrap overflow-hidden">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CreativePortfolioTemplate: React.FC<PortfolioTemplateProps> = ({ user }) => {
  const projects = user?.projects || [];
  const skills = user?.skills || [];
  const experiences = getWorkExperiences(user);
  const education = getEducation(user);
  const achievements = user?.achievements || [];

  const technicalSkills = skills.filter((s: any) => s.category === 'Técnica' || s.type === 'technical');
  const softSkills = skills.filter((s: any) => s.category === 'Blanda' || s.type === 'soft');

  return (
    <div className="overflow-hidden rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-2xl selection:bg-purple-200 dark:selection:bg-purple-600/30 selection:text-purple-900 dark:selection:text-white">
      <div className="bg-zinc-50 dark:bg-[#0B0B0C] p-8 sm:p-12 text-zinc-900 dark:text-zinc-100">
        
        {/* About Me Section: Grid Layout with beautiful mockup decorations */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-16">
          <div className="md:col-span-8">
            <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-6">About Me</h2>
            <p className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-4">
              {user?.profession || 'Profesional'}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base break-words whitespace-pre-wrap">
              {user?.bio || 'Sin descripción detallada sobre mí.'}
            </p>

            {/* Contact info tags under About Me */}
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              {user?.city && (
                <span className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#131315] border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-md">
                  <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  {user.city}
                </span>
              )}

              {user?.email && (
                <span className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#131315] border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-md">
                  <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  {user.email}
                </span>
              )}

              {user?.phone && (
                <span className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#131315] border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-md">
                  <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  {user.phone}
                </span>
              )}

              {user?.social_links?.length > 0 && user.social_links.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#131315] border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-md hover:border-purple-300 dark:hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  <PlatformIcon platform={link.platform_name} className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  {link.platform_name}
                </a>
              ))}
            </div>
          </div>

          {/* Profile Image Column (Replacing pixel cat with decorated avatar) */}
          <div className="md:col-span-4 flex justify-center md:justify-end shrink-0">
            <div className="relative group shrink-0 p-6">
              
              {/* Floating Decorative Ornaments matching the mockup exactly */}
              {/* Top Left: Plus and Circle */}
              <div className="absolute top-2 left-2 -translate-x-2 -translate-y-2 flex items-center gap-1 text-purple-500/80 select-none pointer-events-none">
                <span className="text-xl font-bold animate-pulse">+</span>
                <span className="text-sm border-2 border-purple-500/80 rounded-full w-3 h-3 inline-block"></span>
              </div>

              {/* Top Right: Circle and Plus */}
              <div className="absolute top-1 right-8 translate-x-2 -translate-y-2 flex flex-col items-center text-purple-500/80 select-none pointer-events-none">
                <span className="text-sm border-2 border-purple-500/80 rounded-full w-4 h-4 inline-block animate-pulse"></span>
                <span className="text-lg font-bold mt-0.5">+</span>
              </div>

              {/* Bottom Left: Sparkle / Stars (Mockup's pixel star style) */}
              <div className="absolute bottom-6 left-2 -translate-x-4 translate-y-4 flex flex-col items-end text-purple-500/80 select-none pointer-events-none">
                {/* 4-point Sparkle SVG */}
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-purple-500 fill-current animate-pulse duration-1000">
                  <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" />
                </svg>
                {/* Small Sparkle SVG */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-purple-400 fill-current ml-4 mt-1 animate-ping duration-1500">
                  <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" />
                </svg>
              </div>

              {/* Bottom Right: Circle and Plus */}
              <div className="absolute bottom-4 right-4 translate-x-4 translate-y-4 flex items-center gap-1.5 text-purple-500/80 select-none pointer-events-none">
                <span className="text-xl border-2 border-purple-500/80 rounded-full w-5 h-5 inline-block"></span>
                <span className="text-xl font-bold">+</span>
              </div>

              {user?.imagen_profile ? (
                <img
                  src={user.imagen_profile}
                  alt={user.full_name}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-[0_0_50px_rgba(139,92,246,0.15)] group-hover:scale-105 transition-transform duration-500 relative z-10"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-white dark:bg-[#131315] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.15)] relative z-10">
                  <span className="text-7xl font-black text-purple-500">
                    {(user?.full_name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills & Technologies Section */}
        {skills.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-8">Skills & Technologies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Technical / Hard Skills Card */}
              {technicalSkills.length > 0 && (
                <div className="bg-white dark:bg-[#131315] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Habilidades Técnicas</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {technicalSkills.map((skill: any) => {
                      const techMeta = skillMetaMap[normalizeSkillName(skill.name || '')];
                      const Icon = techMeta?.icon;
                      const iconClassName = techMeta?.iconClassName ?? 'text-purple-600 dark:text-purple-400';

                      return (
                        <span key={skill.id} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/5 text-xs font-medium text-purple-700 dark:text-purple-300 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-purple-100 dark:hover:bg-purple-500/10 hover:text-purple-900 dark:hover:text-white">
                          {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClassName}`} />}
                          <span>{skill.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Soft Skills Card */}
              {softSkills.length > 0 && (
                <div className="bg-white dark:bg-[#131315] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Habilidades Blandas</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {softSkills.map((skill: any) => (
                      <span key={skill.id} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/20 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-white">
                        <span>{skill.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experience Section (mockup year-circle timeline style) */}
        {experiences.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-8">Experience</h2>
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-8 pl-8 space-y-12">
              {experiences.map((exp: any) => {
                const expYear = exp.end_date ? new Date(exp.end_date).getFullYear() : 'Act.';
                const rawDesc: string = exp.description || '';
                let modalidad: string | undefined;
                let ubicacion: string | undefined;
                const cleanLines: string[] = [];
                rawDesc.split('\n').forEach((line: string) => {
                  const t = line.trim();
                  if (t.startsWith('Modalidad:')) modalidad = t.replace('Modalidad:', '').trim();
                  else if (t.startsWith('Ubicación:')) ubicacion = t.replace('Ubicación:', '').trim();
                  else if (!t.startsWith('Tecnologías:')) cleanLines.push(t);
                });
                const cleanDesc = cleanLines.filter(Boolean).join('\n').trim();

                return (
                  <div key={exp.id} className="relative">
                    {/* Timeline circle badge containing end year centered perfectly on the timeline border-l line */}
                    <div className="absolute -left-14 top-1 w-12 h-12 rounded-full bg-purple-600 border-4 border-zinc-50 dark:border-[#0B0B0C] flex items-center justify-center font-bold text-white text-xs z-10 shadow-lg">
                      {expYear}
                    </div>

                    {/* Card container */}
                    <div className="w-full bg-white dark:bg-[#131315] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl hover:border-purple-300 dark:hover:border-purple-500/20 transition-colors">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <h4 className="text-lg font-bold text-zinc-900 dark:text-white">{exp.title}</h4>
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mt-0.5">at {exp.institution}</p>
                        </div>

                        {/* Metadata tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {modalidad && (
                            <span className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                              {modalidad}
                            </span>
                          )}
                          {ubicacion && (
                            <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-[10px] font-bold text-purple-700 dark:text-purple-400">
                              {ubicacion}
                            </span>
                          )}
                        </div>
                      </div>

                      {cleanDesc && (
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mt-4 break-words whitespace-pre-wrap">
                          {cleanDesc}
                        </p>
                      )}
                      <p className="text-xs text-zinc-500 mt-3 font-semibold">
                        {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Education Section (mockup year-circle timeline style) */}
        {education.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-8">Formación Académica</h2>
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-8 pl-8 space-y-12">
              {education.map((edu: any) => {
                const eduYear = edu.end_date ? new Date(edu.end_date).getFullYear() : 'Act.';

                return (
                  <div key={edu.id} className="relative">
                    {/* Timeline circle badge containing year centered perfectly on timeline border-l line */}
                    <div className="absolute -left-14 top-1 w-12 h-12 rounded-full bg-emerald-600 border-4 border-zinc-50 dark:border-[#0B0B0C] flex items-center justify-center font-bold text-white text-xs z-10 shadow-lg">
                      {eduYear}
                    </div>

                    {/* Card container */}
                    <div className="w-full bg-white dark:bg-[#131315] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-500/20 transition-colors">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <h4 className="text-lg font-bold text-zinc-900 dark:text-white">{edu.title}</h4>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">at {edu.institution}</p>
                        </div>

                        {edu.status && (
                          <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold border ${
                            edu.status === 'Pausado'
                              ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                              : edu.status === 'En curso'
                              ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                              : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                          }`}>
                            {edu.status}
                          </span>
                        )}
                      </div>

                      {edu.degree_type && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold mt-2 uppercase tracking-wide">
                          {edu.degree_type}
                        </p>
                      )}
                      {edu.description && (
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mt-3 break-words whitespace-pre-wrap">
                          {edu.description}
                        </p>
                      )}
                      <p className="text-xs text-zinc-500 mt-3 font-semibold">
                        {formatDate(edu.start_date)} — {formatDate(edu.end_date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Highlighted Projects */}
        {projects.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-8">Proyectos Destacados</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project: any) => (
                <article key={project.id} className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#131315] p-6 transition-all hover:border-purple-300 dark:hover:border-purple-500/30 hover:shadow-md dark:hover:shadow-xl">
                  {project.images?.[0]?.url && (
                    <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <img src={project.images[0].url} alt={project.title} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors break-words text-lg">{project.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 break-words whitespace-pre-wrap overflow-hidden">{project.description}</p>
                  
                  {(project.tags || []).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(project.tags || []).map((tag: string) => {
                        const techMeta = skillMetaMap[normalizeSkillName(tag)];
                        const Icon = techMeta?.icon;
                        const iconClassName = techMeta?.iconClassName ?? 'text-purple-600 dark:text-purple-400';

                        return (
                          <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/5 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
                            {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClassName}`} />}
                            <span className="truncate max-w-full">{tag}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  
                  {Array.isArray(project.links) && project.links.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Enlaces</p>
                      <div className="flex flex-wrap gap-2">
                        {project.links.map((link: any, idx: number) => (
                          <a
                            key={idx}
                            href={link.url?.startsWith('http') ? link.url : `https://${link.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0B0B0C] px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-500/20 transition-colors shadow-sm"
                          >
                            <PlatformIcon platform={link.platform_name || ''} className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
                            <span className="truncate max-w-full">{link.platform_name || link.url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Achievements and Certificates */}
        {achievements.length > 0 && (
          <div>
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-8">Logros y Certificaciones</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {achievements.map((a: any) => {
                const files: string[] = [];
                if (Array.isArray(a.files) && a.files.length > 0) {
                  a.files.forEach((f: any) => { if (f?.url) files.push(f.url); });
                } else if (a.file_url) {
                  files.push(a.file_url);
                }

                return (
                  <div key={a.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#131315] p-6 shadow-sm dark:shadow-xl flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-500/20 transition-all">
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white text-base break-words w-full">{a.title}</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1 break-words w-full">{a.institution}</p>
                      {a.hours != null && a.hours > 0 && (
                        <p className="text-sm font-medium text-purple-500 dark:text-purple-300 mt-1">{a.hours} horas</p>
                      )}
                      {a.description && <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 break-words w-full leading-relaxed">{a.description}</p>}
                    </div>
                    
                    {files.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {files.map((url, idx) => {
                          const fileName = url.split('/').pop() || 'certificado';
                          let displayName = 'Ver certificado';
                          try {
                            const decoded = decodeURIComponent(fileName);
                            const base = decoded.split('-').slice(1).join('-') || decoded;
                            if (base.length > 25) {
                              displayName = base.substring(0, 22) + '...';
                            } else if (base.length > 4) {
                              displayName = base;
                            }
                          } catch {
                            displayName = 'Ver certificado';
                          }

                          return (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors shadow-sm"
                            >
                              <FileText className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
                              <span>{displayName}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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