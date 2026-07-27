<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Models\Article;
use App\Http\Resources\ArticleResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ArticleController extends Controller
{
    /**
     * List all articles (paginated) with their categories summary.
     * Accessible by all authenticated users.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $articles = Article::with('author:id,name')
            ->when($search, function ($query, $search) {
                $query->where('title', 'ilike', '%' . $search . '%')
                      ->orWhere('content', 'ilike', '%' . $search . '%');
            })
            ->orderByDesc('created_at')
            ->paginate(20);

        $categories = Article::selectRaw('category as title, icon, COUNT(*) as count')
            ->groupBy('category', 'icon')
            ->get();

        return response()->json([
            'articles'   => $articles,
            'categories' => $categories,
        ]);
    }

    /**
     * Show a single article and increment views.
     */
    public function show(int $id): JsonResponse
    {
        $article = Article::with('author:id,name')->findOrFail($id);
        
        $article->increment('views');

        return response()->json(new ArticleResource($article));
    }

    /**
     * Create a new article. Admin only.
     */
    public function store(StoreArticleRequest $request): JsonResponse
    {
        // StoreArticleRequest::authorize() already fast-fails for non-Admins.
        // Gate::authorize provides the definitive Policy-backed authorization.
        Gate::authorize('create', Article::class);

        $validated = $request->validated();

        $article            = new Article();
        $article->title     = $validated['title'];
        $article->category  = $validated['category'];
        $article->desc      = $validated['desc'] ?? null;
        $article->content   = $validated['content'];
        $article->icon      = $validated['icon'] ?? 'description';
        $article->author_id = auth()->id();
        $article->save();

        $article->load('author:id,name');

        return response()->json($article, 201);
    }

    /**
     * Update an existing article. Admin only.
     */
    public function update(UpdateArticleRequest $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);

        // UpdateArticleRequest::authorize() already fast-fails for non-Admins.
        // Gate::authorize provides the definitive Policy-backed authorization.
        Gate::authorize('update', $article);

        $validated = $request->validated();

        if (isset($validated['title']))              $article->title    = $validated['title'];
        if (isset($validated['category']))           $article->category = $validated['category'];
        if (array_key_exists('desc', $validated))    $article->desc     = $validated['desc'];
        if (isset($validated['content']))            $article->content  = $validated['content'];
        if (array_key_exists('icon', $validated))    $article->icon     = $validated['icon'];

        $article->save();
        $article->load('author:id,name');

        return response()->json($article);
    }

    /**
     * Delete an article. Admin only.
     */
    public function destroy(int $id): JsonResponse
    {
        $article = Article::findOrFail($id);

        Gate::authorize('delete', $article);

        $article->delete();

        return response()->json(null, 204);
    }
}
