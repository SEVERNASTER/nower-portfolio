<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\PortfolioReviewMail;

class AdminPortfolioReviewController extends Controller
{
    public function review(Request $request)
    {
        $request->validate([
            'portfolio_id' => 'required|exists:portfolios,id',
            'status' => 'required|in:approved,rejected',
            'comment' => 'nullable|string',
        ]);

        $portfolio = Portfolio::with('user')
            ->findOrFail($request->portfolio_id);

        // Guardar revisión
        $portfolio->review_status = $request->status;
        $portfolio->review_comment = $request->comment;
        $portfolio->reviewed_at = now();

        // Si se aprueba → publicar automáticamente
        if ($request->status === 'approved') {

            $portfolio->status = 'published';

            $portfolio->is_public = true;
        }

        // Si se rechaza → ocultar
        if ($request->status === 'rejected') {

            $portfolio->status = 'draft';

            $portfolio->is_public = false;
        }

        $portfolio->save();

        // Enviar correo automático
        Mail::to($portfolio->user->email)
            ->send(new PortfolioReviewMail(
                $portfolio->user,
                $request->status,
                $request->comment
            ));

        return response()->json([
            'message' => 'Portfolio reviewed successfully',
        ]);
    }
}