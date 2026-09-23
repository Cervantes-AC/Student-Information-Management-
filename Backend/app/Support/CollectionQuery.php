<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

/**
 * Applies search / filter / sort / pagination from query parameters
 * to an Eloquent query and returns items plus pagination metadata.
 */
class CollectionQuery
{
    /**
     * @param  Builder  $query
     * @param  array<int, string>  $searchable  columns matched with LIKE
     * @param  array<int, string>  $filterable  columns matched by exact value
     * @param  array<int, string>  $sortable    allowed sort columns
     * @return array{items: mixed, meta: array<string, mixed>}
     */
    public static function apply(Builder $query, array $searchable = [], array $filterable = [], array $sortable = []): array
    {
        $perPage = min(max((int) request('per_page', 15), 1), 100);
        $page = max((int) request('page', 1), 1);

        if ($search = trim((string) request('search', ''))) {
            $query->where(function (Builder $q) use ($searchable, $search) {
                foreach ($searchable as $index => $column) {
                    $method = $index === 0 ? 'where' : 'orWhere';
                    $q->{$method}($column, 'like', '%'.$search.'%');
                }
            });
        }

        foreach ($filterable as $column) {
            if (request()->filled($column)) {
                $query->where($column, request()->input($column));
            }
        }

        $sort = request('sort');
        $direction = strtolower(request('order', 'asc')) === 'desc' ? 'desc' : 'asc';

        if ($sort && in_array($sort, $sortable, true)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->orderByDesc('id');
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'items' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ];
    }
}