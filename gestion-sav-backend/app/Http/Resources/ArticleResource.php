<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'title'      => $this->title,
            'category'   => $this->category,
            'desc'       => $this->desc,
            'content'    => $this->content,
            'icon'       => $this->icon,
            'views'      => $this->views,
            'author_id'  => $this->author_id,
            'author'     => $this->whenLoaded('author', fn () => [
                'id'   => $this->author->id,
                'name' => $this->author->name,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
