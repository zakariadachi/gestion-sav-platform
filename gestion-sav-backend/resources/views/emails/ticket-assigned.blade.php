<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau Ticket Assigné</title>
    <style>
        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #ffffff;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #0f172a;
        }
        .ticket-details {
            background-color: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
        }
        .ticket-details p {
            margin: 5px 0;
            font-size: 15px;
        }
        .ticket-details strong {
            color: #475569;
            display: inline-block;
            width: 90px;
        }
        .btn-container {
            text-align: center;
            margin: 40px 0 20px;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background-color: #3b82f6;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #2563eb;
        }
        .footer {
            background-color: #f8fafc;
            text-align: center;
            padding: 24px;
            font-size: 13px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Nouveau Ticket Assigné</h1>
        </div>
        <div class="content">
            <div class="greeting">Bonjour {{ $ticket->technician?->name ?? 'Technicien' }},</div>
            <p>Un nouveau ticket vous a été assigné et nécessite votre attention. Voici les détails de l'intervention :</p>
            
            <div class="ticket-details">
                <p><strong>Ticket ID:</strong> #{{ $ticket->id }}</p>
                <p><strong>Titre:</strong> {{ $ticket->title }}</p>
                <p><strong>Client:</strong> {{ $ticket->client?->name ?? 'N/A' }}</p>
                <p><strong>Priorité:</strong> {{ match($ticket->priority) {
                    'Low' => 'Basse',
                    'Medium' => 'Moyenne',
                    'High' => 'Haute',
                    'Urgent' => 'Urgente',
                    default => $ticket->priority
                } }}</p>
            </div>
            
            <p>Merci de prendre en charge ce ticket dans les plus brefs délais.</p>
            
            <div class="btn-container">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/tickets/{{ $ticket->id }}" class="btn">Voir le ticket</a>
            </div>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement par la plateforme Gestion SAV.</p>
        </div>
    </div>
</body>
</html>
