<?php

namespace App\Http\Middleware;

use App\Enums\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route middleware that only lets users whose role is listed through.
 * Usage: ->middleware('role:administrator,registrar')
 *
 * Note: this is a convenience UI/UX guard; every protected action is
 * re-checked server-side in the controllers (defense in depth).
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        abort_if($user === null, 401, 'Unauthenticated.');

        if (! in_array($user->role->value, $roles, true)) {
            abort(403, 'You are not authorized to perform this action.');
        }

        return $next($request);
    }
}