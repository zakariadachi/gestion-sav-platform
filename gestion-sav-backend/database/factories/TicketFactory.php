<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    private const TITRES = [
        'Écran cassé suite à une chute',
        'Appareil ne démarre plus',
        'Surchauffe anormale du matériel',
        'Clavier défectueux',
        'Batterie qui ne charge plus',
        'Panne réseau - connexion impossible',
        'Imprimante hors service',
        'Livraison endommagée',
        'Logiciel qui ne répond plus',
        'Disque dur non reconnu',
        'Fuite d\'eau sur le matériel',
        'Téléphone bloqué sur logo',
        'Câble d\'alimentation brûlé',
        'Carte mère défaillante',
        'Ventilateur bruyant',
    ];

    private const DESCRIPTIONS = [
        'Le client signale que l\'appareil est tombé et l\'écran présente des fissures importantes.',
        'L\'appareil refuse de démarrer malgré plusieurs tentatives. Aucun voyant lumineux.',
        'Le matériel chauffe excessivement après quelques minutes d\'utilisation.',
        'Plusieurs touches du clavier sont coincées ou ne répondent plus.',
        'La batterie ne dépasse pas 5% de charge malgré une nuit entière branchée.',
        'Impossible de se connecter au réseau local ou à Internet.',
        'L\'imprimante affiche une erreur et refuse d\'imprimer les documents.',
        'Le colis est arrivé avec des dommages visibles, matériel possiblement cassé.',
        'L\'application se fige et nécessite un redémarrage forcé en permanence.',
        'Le disque dur externe n\'est pas détecté lors du branchement USB.',
    ];

    public function definition(): array
    {
        $status = fake()->randomElement(['New', 'In_Progress', 'Resolved']);
        $priority = fake()->randomElement(['Low', 'Medium', 'High', 'Critical']);

        return [
            'client_id'      => User::where('role', 'Client')->inRandomOrder()->first()?->id
                                ?? User::factory()->create(['role' => 'Client'])->id,
            'technician_id'  => null,
            'title'          => fake()->randomElement(self::TITRES),
            'description'    => fake()->randomElement(self::DESCRIPTIONS),
            'status'         => $status,
            'priority'       => $priority,
            // We set due_date later in configure() because observer sets it on 'creating', 
            // but since we want to override for demo, we'll do it there.
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (Ticket $ticket): void {
            if (in_array($ticket->status, ['In_Progress', 'Resolved'], true)) {
                $technician = User::where('role', 'Technician')->inRandomOrder()->first();
                $ticket->technician_id = $technician?->id;
            }

            // SLA Simulation: Make some In_Progress tickets overdue
            if ($ticket->status === 'In_Progress' && fake()->boolean(30)) {
                $ticket->due_date = now()->subHours(rand(1, 48));
            }

            // CSAT Simulation: Random rating and feedback for some Resolved tickets
            if (in_array($ticket->status, ['Resolved'], true) && fake()->boolean(60)) {
                $ticket->rating = fake()->numberBetween(1, 5);
                $feedbacks = [
                    'Intervention très rapide, merci !',
                    'Technicien très compétent et professionnel.',
                    'Le problème a été résolu, mais cela a pris un peu de temps.',
                    'Parfait, rien à redire.',
                    'Service au top, je recommande.',
                    'Merci pour votre réactivité.',
                    'C\'était acceptable, mais on peut faire mieux.',
                    'Très satisfait de l\'intervention de votre technicien.'
                ];
                $ticket->feedback = fake()->boolean(80) ? fake()->randomElement($feedbacks) : null;
            }
        });
    }
}
