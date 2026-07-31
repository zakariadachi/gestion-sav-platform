<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur Gestion SAV</title>
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
        .credentials {
            background-color: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
        }
        .credentials p {
            margin: 5px 0;
            font-size: 15px;
        }
        .credentials strong {
            color: #475569;
            display: inline-block;
            width: 160px;
        }
        .password-value {
            font-family: monospace;
            font-size: 16px;
            font-weight: 700;
            color: #1e40af;
            letter-spacing: 0.05em;
        }
        .warning {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 14px 20px;
            border-radius: 6px;
            font-size: 14px;
            color: #92400e;
            margin-bottom: 30px;
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
            <h1>Bienvenue sur Gestion SAV</h1>
        </div>
        <div class="content">
            <div class="greeting">Bonjour {{ $user->name }},</div>
            <p>Votre compte a été créé sur la plateforme <strong>Gestion SAV</strong>. Voici vos identifiants de connexion :</p>

            <div class="credentials">
                <p><strong>Adresse e-mail :</strong> {{ $user->email }}</p>
                <p><strong>Mot de passe temporaire :</strong> <span class="password-value">{{ $temporaryPassword }}</span></p>
            </div>

            <div class="warning">
                ⚠️ Pour des raisons de sécurité, veuillez changer votre mot de passe dès votre première connexion.
            </div>

            <div class="btn-container">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/login" class="btn">Se connecter</a>
            </div>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement par la plateforme Gestion SAV.</p>
        </div>
    </div>
</body>
</html>
