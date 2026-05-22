<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Portfolio;
use App\Models\Skill;
use App\Models\Project;
use App\Models\Experience;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Prevent foreign key check errors during truncation
        Schema::disableForeignKeyConstraints();
        DB::table('experiences')->truncate();
        DB::table('projects')->truncate();
        DB::table('skills')->truncate();
        DB::table('portfolios')->truncate();
        DB::table('users')->truncate();
        Schema::enableForeignKeyConstraints();

        // 1. Andrés Mendoza - Frontend Developer
        $user1 = User::create([
            'full_name' => 'Andrés Mendoza',
            'email' => 'andres@example.com',
            'clerk_id' => 'clerk_andres_123',
            'profession' => 'Frontend Developer',
            'bio' => 'Apasionado por crear interfaces de usuario hermosas, de alto rendimiento y accesibles. Especialista en arquitectura moderna de React, animaciones interactivas y optimización SEO.',
            'role' => 'user',
            'city' => 'Cochabamba',
            'phone' => '+591 71234567',
            'imagen_profile' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        ]);

        Portfolio::create([
            'user_id' => $user1->id,
            'status' => 'published',
            'is_public' => true,
            'review_status' => 'approved',
            'template_key' => 'premium',
            'public_slug' => 'andres-mendoza',
        ]);

        Skill::create(['user_id' => $user1->id, 'name' => 'React', 'type' => 'technical', 'proficiency_level' => 'expert']);
        Skill::create(['user_id' => $user1->id, 'name' => 'Tailwind CSS', 'type' => 'technical', 'proficiency_level' => 'expert']);
        Skill::create(['user_id' => $user1->id, 'name' => 'TypeScript', 'type' => 'technical', 'proficiency_level' => 'intermediate']);
        Skill::create(['user_id' => $user1->id, 'name' => 'Next.js', 'type' => 'technical', 'proficiency_level' => 'intermediate']);
        Skill::create(['user_id' => $user1->id, 'name' => 'Git', 'type' => 'technical', 'proficiency_level' => 'expert']);

        Project::create([
            'user_id' => $user1->id,
            'title' => 'Nower Admin Dashboard',
            'description' => 'Un panel de control administrativo ultra rápido construido con React y Tailwind CSS, con gráficos analíticos y modo oscuro automático.',
            'tags' => ['React', 'Tailwind CSS', 'Vite', 'Recharts'],
            'evidence_url' => 'https://github.com/andres/nower-dashboard',
        ]);

        Project::create([
            'user_id' => $user1->id,
            'title' => 'Swift E-commerce Frontend',
            'description' => 'Tienda online completa integrada con pasarela de pagos Stripe y renderizado estático del lado del servidor (SSR) mediante Next.js.',
            'tags' => ['Next.js', 'TypeScript', 'Stripe', 'Tailwind CSS'],
            'evidence_url' => 'https://github.com/andres/swift-shop',
        ]);

        Experience::create([
            'user_id' => $user1->id,
            'type' => 'work',
            'title' => 'Desarrollador Frontend Ssr',
            'institution' => 'Digital Soluciones S.R.L.',
            'start_date' => '2024-01-10',
            'end_date' => '2025-12-20',
            'description' => 'Liderazgo en la migración de aplicaciones heredadas hacia arquitecturas modernas basadas en React y Next.js.',
        ]);

        Experience::create([
            'user_id' => $user1->id,
            'type' => 'academic',
            'title' => 'Licenciatura en Ingeniería de Sistemas',
            'institution' => 'Universidad Mayor de San Simón',
            'start_date' => '2019-02-01',
            'end_date' => '2023-11-30',
            'description' => 'Proyecto de grado enfocado en sistemas distribuidos. Graduado con honores.',
        ]);

        // 2. Mariana Vargas - Backend Developer
        $user2 = User::create([
            'full_name' => 'Mariana Vargas',
            'email' => 'mariana@example.com',
            'clerk_id' => 'clerk_mariana_456',
            'profession' => 'Backend Developer',
            'bio' => 'Ingeniera de software enfocada en el diseño de APIs REST robustas, arquitectura de microservicios y optimización de bases de datos relacionales utilizando Laravel, Node.js y PostgreSQL.',
            'role' => 'user',
            'city' => 'Santa Cruz',
            'phone' => '+591 76543210',
            'imagen_profile' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
        ]);

        Portfolio::create([
            'user_id' => $user2->id,
            'status' => 'published',
            'is_public' => true,
            'review_status' => 'approved',
            'template_key' => 'modern',
            'public_slug' => 'mariana-vargas',
        ]);

        Skill::create(['user_id' => $user2->id, 'name' => 'Laravel', 'type' => 'technical', 'proficiency_level' => 'expert']);
        Skill::create(['user_id' => $user2->id, 'name' => 'PHP', 'type' => 'technical', 'proficiency_level' => 'expert']);
        Skill::create(['user_id' => $user2->id, 'name' => 'PostgreSQL', 'type' => 'technical', 'proficiency_level' => 'expert']);
        Skill::create(['user_id' => $user2->id, 'name' => 'Docker', 'type' => 'technical', 'proficiency_level' => 'intermediate']);
        Skill::create(['user_id' => $user2->id, 'name' => 'Node.js', 'type' => 'technical', 'proficiency_level' => 'intermediate']);

        Project::create([
            'user_id' => $user2->id,
            'title' => 'API REST Catastro Municipal',
            'description' => 'Backend seguro con autenticación JWT, caché distribuida vía Redis y optimización de consultas geográficas sobre PostgreSQL.',
            'tags' => ['Laravel', 'PostgreSQL', 'Redis', 'Docker'],
            'evidence_url' => 'https://github.com/mariana/api-catastro',
        ]);

        Experience::create([
            'user_id' => $user2->id,
            'type' => 'work',
            'title' => 'Backend Developer Junior',
            'institution' => 'Sistemas Inteligentes Bolivia',
            'start_date' => '2023-03-01',
            'end_date' => '2024-05-15',
            'description' => 'Desarrollo y mantenimiento de funcionalidades internas empleando Laravel y MySQL.',
        ]);

        Experience::create([
            'user_id' => $user2->id,
            'type' => 'work',
            'title' => 'Ingeniera de Backend Ssr',
            'institution' => 'Enterprise Software Solutions',
            'start_date' => '2024-06-01',
            'end_date' => null,
            'description' => 'Arquitectura de base de datos y optimización de procesos de sincronización asíncrona mediante colas de Laravel.',
        ]);

        // 3. Bruno Siles - Fullstack Developer
        $user3 = User::create([
            'full_name' => 'Bruno Siles',
            'email' => 'bruno@example.com',
            'clerk_id' => 'clerk_bruno_789',
            'profession' => 'Fullstack Developer',
            'bio' => 'Desarrollador Fullstack apasionado por resolver problemas complejos de principio a fin. Con amplia experiencia en la pila MERN (MongoDB, Express, React, Node.js) y despliegue en la nube.',
            'role' => 'user',
            'city' => 'La Paz',
            'phone' => '+591 73344556',
            'imagen_profile' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        ]);

        Portfolio::create([
            'user_id' => $user3->id,
            'status' => 'published',
            'is_public' => true,
            'review_status' => 'approved',
            'template_key' => 'minimal',
            'public_slug' => 'bruno-siles',
        ]);

        Skill::create(['user_id' => $user3->id, 'name' => 'React', 'type' => 'technical', 'proficiency_level' => 'expert']);
        Skill::create(['user_id' => $user3->id, 'name' => 'Node.js', 'type' => 'technical', 'proficiency_level' => 'expert']);
        Skill::create(['user_id' => $user3->id, 'name' => 'MongoDB', 'type' => 'technical', 'proficiency_level' => 'intermediate']);
        Skill::create(['user_id' => $user3->id, 'name' => 'Express', 'type' => 'technical', 'proficiency_level' => 'expert']);
        Skill::create(['user_id' => $user3->id, 'name' => 'AWS', 'type' => 'technical', 'proficiency_level' => 'intermediate']);

        Project::create([
            'user_id' => $user3->id,
            'title' => 'Gestor de Tareas Colaborativo',
            'description' => 'Aplicación web colaborativa en tiempo real basada en WebSockets con control de roles y despliegue automatizado en AWS EC2.',
            'tags' => ['React', 'Node.js', 'MongoDB', 'Socket.io', 'AWS'],
            'evidence_url' => 'https://github.com/bruno/gestor-tareas',
        ]);

        Experience::create([
            'user_id' => $user3->id,
            'type' => 'work',
            'title' => 'Fullstack Developer Senior',
            'institution' => 'Soluciones Digitales La Paz',
            'start_date' => '2022-01-01',
            'end_date' => '2025-05-01',
            'description' => 'Liderazgo técnico en el diseño de arquitecturas de software de extremo a extremo e integración continua (CI/CD).',
        ]);

        // 4. Laura Gómez - Data Scientist
        $user4 = User::create([
            'full_name' => 'Laura Gómez',
            'email' => 'laura@example.com',
            'clerk_id' => 'clerk_laura_012',
            'profession' => 'Data Scientist',
            'bio' => 'Científica de datos con sólida formación en estadística y modelado predictivo. Apasionada por transformar grandes volúmenes de datos en decisiones estratégicas inteligentes.',
            'role' => 'user',
            'city' => 'La Paz',
            'phone' => '+591 79988776',
            'imagen_profile' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80',
        ]);

        Portfolio::create([
            'user_id' => $user4->id,
            'status' => 'published',
            'is_public' => true,
            'review_status' => 'approved',
            'template_key' => 'premium',
            'public_slug' => 'laura-gomez',
        ]);

        Skill::create(['user_id' => $user4->id, 'name' => 'Python', 'type' => 'technical', 'proficiency_level' => 'expert']);
        Skill::create(['user_id' => $user4->id, 'name' => 'Django', 'type' => 'technical', 'proficiency_level' => 'intermediate']);
        Skill::create(['user_id' => $user4->id, 'name' => 'FastAPI', 'type' => 'technical', 'proficiency_level' => 'intermediate']);
        Skill::create(['user_id' => $user4->id, 'name' => 'PostgreSQL', 'type' => 'technical', 'proficiency_level' => 'expert']);

        Project::create([
            'user_id' => $user4->id,
            'title' => 'Predictor de Demanda de Ventas',
            'description' => 'Modelo de Machine Learning implementado en Python y expuesto mediante una API REST en FastAPI que predice la demanda con 92% de precisión.',
            'tags' => ['Python', 'FastAPI', 'Pandas', 'Scikit-Learn'],
            'evidence_url' => 'https://github.com/laura/predictor-ventas',
        ]);

        Experience::create([
            'user_id' => $user4->id,
            'type' => 'work',
            'title' => 'Analista de Datos Senior',
            'institution' => 'Corporación Nacional',
            'start_date' => '2023-01-15',
            'end_date' => null,
            'description' => 'Creación de modelos predictivos y dashboards estratégicos interactivos.',
        ]);
    }
}
