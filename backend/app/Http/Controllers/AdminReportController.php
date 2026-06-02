<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\ReportHistory;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    /**
     * Genera un reporte desde la base de datos y registra historial.
     *
     * GET /api/admin/reports/generate?type=users&status=admin
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:summary,users,portfolios',
            'status' => 'nullable|string',
        ]);

        $admin = $request->attributes->get('auth_user');

        if (! $admin) {
            return response()->json([
                'message' => 'No se pudo identificar al administrador autenticado.',
            ], 401);
        }

        $type = $validated['type'];
        $status = $validated['status'] ?? 'all';

        $report = match ($type) {
            'users' => $this->buildUsersReport($status),
            'portfolios' => $this->buildPortfoliosReport($status),
            default => $this->buildSummaryReport(),
        };

        ReportHistory::create([
            'admin_user_id' => $admin->id,
            'report_type' => $type,
            'filter_status' => $status,
            'rows_count' => count($report['rows']),
            'filters' => [
                'type' => $type,
                'status' => $status,
            ],
            'data_snapshot' => $report,
            'generated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Reporte generado correctamente.',
            'report' => $report,
        ]);
    }

    /**
     * Devuelve los últimos reportes generados.
     *
     * GET /api/admin/reports/history
     */
    public function history(Request $request): JsonResponse
    {
        $history = ReportHistory::with('admin:id,full_name,email')
            ->orderByDesc('generated_at')
            ->limit(10)
            ->get()
            ->map(function (ReportHistory $item) {
                return [
                    'id' => $item->id,
                    'report_type' => $item->report_type,
                    'filter_status' => $item->filter_status,
                    'generated_at' => optional($item->generated_at)
                        ?->timezone('America/La_Paz')
                        ->format('d/m/Y H:i'),
                    'admin' => [
                        'id' => $item->admin?->id,
                        'full_name' => $item->admin?->full_name,
                        'email' => $item->admin?->email,
                    ],
                ];
            });

        return response()->json([
            'data' => $history,
        ]);
    }

    private function buildUsersReport(string $status): array
    {
        $query = User::query();

        if ($status === 'admin') {
            $query->where('role', 'admin');
        }

        if ($status === 'user') {
            $query->where('role', 'user');
        }

        if ($status === 'password_pending') {
            $query->where('must_change_password', true);
        }

        $users = $query
            ->orderByDesc('created_at')
            ->get();

        return [
            'title' => 'Reporte de usuarios',
            'type' => 'users',
            'filter' => $status,
            'generatedAt' => now('America/La_Paz')->format('d/m/Y H:i'),
            'columns' => [
                'ID',
                'Nombre',
                'Correo',
                'Rol',
                'Contraseña pendiente',
                'Fecha de registro',
            ],
            'rows' => $users->map(function (User $user) {
                return [
                    $user->id,
                    $user->full_name ?: 'Sin nombre',
                    $user->email,
                    $this->formatUserRole($user->role),
                    $user->must_change_password ? 'Sí' : 'No',
                    optional($user->created_at)->format('d/m/Y H:i'),
                ];
            })->values()->toArray(),
        ];
    }

    private function buildPortfoliosReport(string $status): array
    {
        $query = Portfolio::query()
            ->with('user:id,full_name,email,profession,city');

        if ($status === 'unpublished') {
            $query->where('status', 'unpublished');
        }

        if ($status === 'pending_review') {
            $query->where('status', 'pending_review');
        }

        if ($status === 'published') {
            $query->where('status', 'published')
                ->where('is_public', true);
        }

        if ($status === 'rejected') {
            $query->where('review_status', 'rejected');
        }

        $portfolios = $query
            ->orderByDesc('updated_at')
            ->get();

        return [
            'title' => 'Reporte de portafolios',
            'type' => 'portfolios',
            'filter' => $status,
            'generatedAt' => now('America/La_Paz')->format('d/m/Y H:i'),
            'columns' => [
                'ID',
                'Usuario',
                'Correo',
                'Profesión',
                'Ciudad',
                'Estado',
                'Plantilla',
            ],
            'rows' => $portfolios->map(function (Portfolio $portfolio) {
                return [
                    $portfolio->id,
                    $portfolio->user?->full_name ?: 'Sin nombre',
                    $portfolio->user?->email ?: 'Sin correo',
                    $portfolio->user?->profession ?: 'Sin profesión',
                    $portfolio->user?->city ?: 'Sin ciudad',
                    $this->formatPortfolioStatus($portfolio),
                    $this->formatTemplate($portfolio->template_key),
                ];
            })->values()->toArray(),
        ];
    }

    private function buildSummaryReport(): array
    {
        return [
            'title' => 'Resumen general del sistema',
            'type' => 'summary',
            'filter' => 'all',
            'generatedAt' => now('America/La_Paz')->format('d/m/Y H:i'),
            'columns' => [
                'Métrica',
                'Valor',
            ],
            'rows' => [
                ['Usuarios registrados', User::count()],
                ['Usuarios administradores', User::where('role', 'admin')->count()],
                ['Usuarios normales', User::where('role', 'user')->count()],
                ['Usuarios con contraseña pendiente', User::where('must_change_password', true)->count()],
                ['Portafolios no publicados', Portfolio::where('status', 'unpublished')->count()],
                ['Portafolios pendientes de revisión', Portfolio::where('status', 'pending_review')->count()],
                ['Portafolios publicados/aprobados', Portfolio::where('status', 'published')->where('is_public', true)->count()],
                ['Portafolios rechazados', Portfolio::where('review_status', 'rejected')->count()],
            ],
        ];
    }

    private function formatUserRole(?string $role): string
    {
        return $role === 'admin' ? 'Administrador' : 'Usuario';
    }

    private function formatTemplate(?string $template): string
    {
        return match ($template) {
            'modern' => 'Moderna',
            'creative' => 'Creativa',
            default => 'Clásica',
        };
    }

    private function formatPortfolioStatus(Portfolio $portfolio): string
    {
        if ($portfolio->review_status === 'rejected') {
            return 'Rechazado';
        }

        return match ($portfolio->status) {
            'published' => 'Aprobado',
            'pending_review' => 'Pendiente',
            default => 'No publicado',
        };
    }
}