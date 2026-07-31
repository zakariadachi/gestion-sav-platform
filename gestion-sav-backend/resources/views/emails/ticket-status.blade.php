<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise à jour de votre ticket</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#334155;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 16px;">
        <tr>
            <td align="center">

                {{-- Logo --}}
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <x-logo />
                        </td>
                    </tr>
                </table>

                {{-- Main Card --}}
                <table width="600" cellpadding="0" cellspacing="0"
                    style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;
                           box-shadow:0 4px 24px rgba(0,0,0,0.07);overflow:hidden;">

                    {{-- Header --}}
                    <tr>
                        <td style="background:linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%);padding:32px 40px;text-align:center;">
                            <p style="margin:0;font-size:13px;color:#bae6fd;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                                Notification de ticket
                            </p>
                            <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#ffffff;">
                                Mise à jour de statut
                            </h1>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:40px;">

                            {{-- Greeting --}}
                            <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#0f172a;">
                                Bonjour {{ $ticket->client?->name ?? 'Client' }},
                            </p>
                            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                                Le statut de votre ticket d'assistance a été mis à jour. Voici un récapitulatif :
                            </p>

                            {{-- Ticket Details Card --}}
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:32px;">
                                <tr>
                                    <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                                        <span style="font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                                            🎫 &nbsp;Ticket ID
                                        </span>
                                        <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#0f172a;">
                                            #{{ $ticket->id }}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                                        <span style="font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                                            📝 &nbsp;Titre
                                        </span>
                                        <p style="margin:4px 0 0;font-size:15px;color:#1e293b;">
                                            {{ $ticket->title }}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px 24px;">
                                        <span style="font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                                            🏷️ &nbsp;Nouveau Statut
                                        </span>
                                        <p style="margin:8px 0 0;">
                                            @php
                                                $statusValue = $ticket->status->value;
                                                $badgeStyle = match($statusValue) {
                                                    'Resolved'    => 'background-color:#dcfce7;color:#166534;',
                                                    'In_Progress' => 'background-color:#ffedd5;color:#ea580c;',
                                                    default       => 'background-color:#dbeafe;color:#2563eb;',
                                                };
                                                $statusLabel = match($statusValue) {
                                                    'Resolved'    => '✅ &nbsp;Résolu',
                                                    'In_Progress' => '⏳ &nbsp;En cours',
                                                    default       => '🆕 &nbsp;Nouveau',
                                                };
                                            @endphp
                                            <span style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:700;{{ $badgeStyle }}">
                                                {!! $statusLabel !!}
                                            </span>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            {{-- Message --}}
                            <p style="margin:0 0 32px;font-size:14px;color:#64748b;line-height:1.7;background-color:#f0f9ff;border-left:3px solid #0ea5e9;padding:14px 18px;border-radius:0 6px 6px 0;">
                                Notre équipe reste à votre disposition. Vous pouvez consulter les détails ou ajouter un commentaire via le bouton ci-dessous.
                            </p>

                            {{-- CTA Button --}}
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/client/ticket/{{ $ticket->id }}"
                                            style="display:inline-block;padding:13px 36px;background-color:#0ea5e9;color:#ffffff;
                                                   text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;
                                                   letter-spacing:0.3px;">
                                            Consulter mon ticket →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#475569;">
                                TechIntervention SAV
                            </p>
                            <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">
                                &copy; {{ date('Y') }} TechIntervention. Tous droits réservés.
                            </p>
                            <p style="margin:0;font-size:11px;color:#cbd5e1;font-style:italic;">
                                Ceci est un e-mail généré automatiquement, merci de ne pas y répondre.
                            </p>
                        </td>
                    </tr>

                </table>
                {{-- End Main Card --}}

            </td>
        </tr>
    </table>

</body>
</html>
