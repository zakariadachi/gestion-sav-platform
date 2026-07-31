import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import AppLayout from '../components/AppLayout';
import ClientLayout from '../components/ClientLayout';
import toast from 'react-hot-toast';
import { ROLES } from '../constants/enums';

export default function Profile() {
    const { user, getUser } = useAuth(); // Assuming getUser fetches and sets user
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [company, setCompany] = useState(user?.company || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const getInitials = (name = '') =>
        name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '??';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error("L'image est trop volumineuse (max 2MB).");
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (phone) formData.append('phone', phone);
        if (company) formData.append('company', company);
        if (password) {
            if (password !== passwordConfirmation) {
                toast.error('Les mots de passe ne correspondent pas.');
                setSaving(false);
                return;
            }
            formData.append('password', password);
            formData.append('password_confirmation', passwordConfirmation);
        }
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        try {
            await api.post('/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Profil mis à jour avec succès.');
            setPassword('');
            setPasswordConfirmation('');
            await getUser(); // Refresh user context
        } catch (err) {
            if (err.response?.status === 422) {
                toast.error(err.response?.data?.message || 'Erreur de validation.');
            }
        } finally {
            setSaving(false);
        }
    };

    const isClient = String(user?.role).toLowerCase() === String(ROLES.CLIENT).toLowerCase();
    const Layout = isClient ? ClientLayout : AppLayout;
    const layoutProps = isClient ? {} : { title: 'Mon Profil', subtitle: 'Gérez vos informations personnelles' };

    return (
        <Layout {...layoutProps}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ background: 'var(--dc-surface)', borderRadius: '16px', border: '1px solid var(--dc-border)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--dc-border)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ position: 'relative' }}>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--dc-border)' }} />
                            ) : (
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--dc-accent-subtle)', color: 'var(--dc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, border: '2px solid var(--dc-border)' }}>
                                    {getInitials(user?.name)}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'var(--dc-accent)', color: '#fff', border: '2px solid var(--dc-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>photo_camera</span>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--dc-text)', margin: 0 }}>{user?.name}</h2>
                            <p style={{ fontSize: '14px', color: 'var(--dc-text-muted)', margin: 0 }}>{user?.role}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '24px' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)', marginBottom: '6px' }}>Nom complet</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--dc-border)', background: 'var(--dc-bg)', color: 'var(--dc-text)', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)', marginBottom: '6px' }}>Adresse Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--dc-border)', background: 'var(--dc-bg)', color: 'var(--dc-text)', fontSize: '14px', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)', marginBottom: '6px' }}>Téléphone</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+212 600 000 000"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--dc-border)', background: 'var(--dc-bg)', color: 'var(--dc-text)', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)', marginBottom: '6px' }}>Entreprise</label>
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="Nom de l'entreprise"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--dc-border)', background: 'var(--dc-bg)', color: 'var(--dc-text)', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                            </div>
                            
                            <hr style={{ border: 'none', borderTop: '1px solid var(--dc-border)', margin: '8px 0' }} />
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)', marginBottom: '6px' }}>Nouveau mot de passe <span style={{ color: 'var(--dc-text-faint)', fontWeight: 400 }}>(optionnel)</span></label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Laissez vide pour ne pas changer"
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--dc-border)', background: 'var(--dc-bg)', color: 'var(--dc-text)', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                            {password && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)', marginBottom: '6px' }}>Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--dc-border)', background: 'var(--dc-bg)', color: 'var(--dc-text)', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    padding: '10px 24px', borderRadius: '10px', border: 'none',
                                    background: 'var(--dc-accent)', color: '#fff', fontSize: '13px', fontWeight: 700,
                                    cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}
                            >
                                {saving ? (
                                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                                )}
                                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </Layout>
    );
}
