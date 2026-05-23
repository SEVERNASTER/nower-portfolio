<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PortfolioReviewMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $user;
    public string $status;
    public ?string $comment;

    public function __construct(
        User $user,
        string $status,
        ?string $comment = null
    ) {
        $this->user = $user;
        $this->status = $status;
        $this->comment = $comment;
    }

    public function build()
    {
        return $this->subject('Resultado de revisión del portafolio')
                    ->view('emails.portfolio-review');
    }
}