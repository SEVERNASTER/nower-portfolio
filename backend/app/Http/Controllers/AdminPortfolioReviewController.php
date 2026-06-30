<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Services\PortfolioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\PortfolioReviewMail;

class AdminPortfolioReviewController extends Controller
{
    public function __construct(
        private readonly PortfolioService $portfolioService,
    ) {}

    public function review(Request $request)
    {
        $request->validate([
            'portfolio_id' => 'required|exists:portfolios,id',
            'status' => 'required|in:approved,rejected',
            'comment' => 'required_if:status,rejected|nullable|string',
        ]);

        $portfolio = Portfolio::with('user')
            ->findOrFail($request->portfolio_id);

        if ($request->status === 'approved') {
            $portfolio = $this->portfolioService->approve($portfolio, $request->comment);
        } else {
            $portfolio = $this->portfolioService->reject($portfolio, $request->comment);
        }

        // Enviar correo automático solo si se aprueba
        if ($request->status === 'approved') {
            try {
                Mail::to($portfolio->user->email)
                    ->send(new PortfolioReviewMail(
                        $portfolio->user,
                        $request->status,
                        $request->comment
                    ));
            } catch (\Exception $e) {
                // Registrar el error pero no detener la ejecución si falla el correo
                \Log::error('Error al enviar correo de aprobación: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Portfolio reviewed successfully',
            'portfolio' => $portfolio,
        ]);
    }
}
