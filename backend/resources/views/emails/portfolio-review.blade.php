<h2>Resultado de Revisión del Portafolio</h2>

<p>Hola {{ $user->full_name }},</p>

@if($status === 'approved')

<p>Tu portafolio ha sido aprobado y publicado correctamente.</p>

@else

<p>Tu portafolio fue rechazado.</p>

<p><strong>Comentarios del administrador:</strong></p>

<p>{{ $comment }}</p>

@endif

<p>Equipo Nower Portfolio</p>