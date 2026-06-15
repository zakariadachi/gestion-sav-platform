<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;

use App\Models\TicketComment;
use App\Models\Rapport;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ArticleSeeder::class,
        ]);

        // 1 Admin
        User::factory()->configureAdmin()->create([
            'name'  => 'Admin Principal',
            'email' => 'admin@techintervention.ma',
        ]);

        // 3 Techniciens
        for ($i = 1; $i <= 3; $i++) {
            User::factory()->configureTechnicien()->create([
                'email' => "tech{$i}@techintervention.ma",
            ]);
        }

        // 10 Clients (with realistic Moroccan/French company names and phone numbers via UserFactory)
        User::factory(10)->create();

        // 40-50 Tickets
        $tickets = Ticket::factory(45)->create();

        // RELATIONS (Comments & Rapports)
        foreach ($tickets as $ticket) {
            // Add a 'Rapport' to all resolved tickets
            if (in_array($ticket->status->value, ['Resolved'], true)) {
                Rapport::create([
                    'ticket_id' => $ticket->id,
                    'contenu'   => fake()->realText(150),
                ]);
            }

            // Add 1-2 comments to a few open tickets
            if (in_array($ticket->status->value, ['New', 'In_Progress'], true) && fake()->boolean(40)) {
                $numComments = rand(1, 2);
                for ($j = 0; $j < $numComments; $j++) {
                    TicketComment::create([
                        'ticket_id' => $ticket->id,
                        'user_id'   => fake()->boolean() ? $ticket->client_id : ($ticket->technician_id ?? User::where('role', 'Admin')->first()->id),
                        'message'   => fake()->realText(100),
                    ]);
                }
            }
        }
    }
}
