<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $articles = [
            [
                'title' => 'Comment réinitialiser son mot de passe ?',
                'category' => 'Accès & Sécurité',
                'desc' => 'Procédure complète pour réinitialiser ou changer votre mot de passe en toute sécurité.',
                'content' => 'Pour réinitialiser votre mot de passe, allez sur la page de connexion, cliquez sur "Mot de passe oublié" et suivez les instructions envoyées à votre adresse e-mail. Assurez-vous de choisir un mot de passe fort contenant des lettres majuscules, minuscules, des chiffres et des caractères spéciaux.',
                'views' => 1240,
                'icon' => 'key',
            ],
            [
                'title' => 'Que faire en cas de surchauffe de l\'ordinateur ?',
                'category' => 'Matériel & Équipement',
                'desc' => 'Conseils pratiques pour prévenir et gérer la surchauffe de votre matériel.',
                'content' => 'Si votre ordinateur surchauffe, éteignez-le immédiatement. Vérifiez que les ventilateurs ne sont pas obstrués par la poussière. Surélevez légèrement l\'appareil pour améliorer la circulation de l\'air. Si le problème persiste, contactez le support technique.',
                'views' => 856,
                'icon' => 'memory',
            ],
            [
                'title' => 'Configurer le VPN d\'entreprise',
                'category' => 'Réseau & Internet',
                'desc' => 'Guide pas à pas pour installer et configurer le client VPN.',
                'content' => 'Téléchargez le client VPN depuis l\'intranet. Installez le logiciel en suivant l\'assistant. Lancez l\'application, entrez l\'adresse du serveur (vpn.entreprise.com) et connectez-vous avec vos identifiants réseau habituels.',
                'views' => 732,
                'icon' => 'router',
            ],
            [
                'title' => 'Résoudre l\'erreur "Écran bleu" sous Windows',
                'category' => 'Logiciels & OS',
                'desc' => 'Comment identifier et résoudre les fameux BSOD (Blue Screen of Death).',
                'content' => 'L\'écran bleu indique une erreur système grave. Notez le code d\'erreur affiché (ex: 0x0000001). Redémarrez en mode sans échec. Mettez à jour vos pilotes matériels. Si cela ne suffit pas, ouvrez un ticket avec le code d\'erreur.',
                'views' => 645,
                'icon' => 'terminal',
            ],
            [
                'title' => 'Comprendre sa facture mensuelle',
                'category' => 'Facturation',
                'desc' => 'Détail et explication de tous les frais et abonnements présents sur votre facture.',
                'content' => 'Votre facture se divise en trois parties : l\'abonnement de base, les services additionnels (licences logicielles), et les interventions hors-forfait. Vous pouvez consulter l\'historique détaillé dans l\'onglet "Mes factures".',
                'views' => 420,
                'icon' => 'receipt_long',
            ],
        ];

        foreach ($articles as $article) {
            \App\Models\Article::create($article);
        }
    }
}
