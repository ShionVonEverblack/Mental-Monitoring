import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShieldCheck, Lock, Trash2, Eye, FileText, Database } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="privacy-page" style={{ padding: 'var(--spacing-md) 0 var(--spacing-2xl)', animation: 'fadeInUp 0.4s ease-out' }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)' }}
      >
        <ArrowLeft size={16} /> {t('common.back', 'Kembali')}
      </button>

      <header style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'hsla(215, 65%, 55%, 0.15)', color: 'var(--color-primary)', marginBottom: '8px' }}>
          <ShieldCheck size={36} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {t('privacy.title', 'Kebijakan Privasi & Perlindungan Data')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '600px', margin: '0 auto' }}>
          {t('privacy.subtitle', 'Komitmen RIMA dalam melindungi data kesehatan mental Anda sesuai UU No. 27 Tahun 2022 (UU PDP).')}
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {/* Prinsip Utama */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Lock size={24} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '4px' }} />
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {t('privacy.offlineFirstTitle', '1. Prinsip Offline-First & Penyimpanan Lokal')}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {t('privacy.offlineFirstDesc', 'Data pribadi seperti catatan mood, jurnal, dan rencana keselamatan disimpan secara default di perangkat Anda sendiri (local device storage). Tidak ada data jurnal pribadi yang dikirim ke server pihak ketiga tanpa persetujuan eksplisit Anda.')}
              </p>
            </div>
          </div>
        </Card>

        {/* Jenis Data yang Diproses */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Database size={24} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: '4px' }} />
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {t('privacy.dataCollectedTitle', '2. Data yang Diproses')}
              </h2>
              <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
                <li><strong>{t('privacy.moodData', 'Data Emosi/Mood:')}</strong> {t('privacy.moodDataDesc', 'Skor mood (1-5), faktor penyebab, catatan, disimpan secara lokal.')}</li>
                <li><strong>{t('privacy.journalData', 'Catatan Jurnal:')}</strong> {t('privacy.journalDataDesc', 'Refleksi pribadi diproses 100% lokal di browser pengguna.')}</li>
                <li><strong>{t('privacy.communityData', 'Forum Komunitas:')}</strong> {t('privacy.communityDataDesc', 'Posting anonim dengan nama samaran acak untuk melindungi identitas Anda.')}</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Hak Pemilik Data (UU PDP) */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Eye size={24} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '4px' }} />
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {t('privacy.userRightsTitle', '3. Hak Anda Berdasarkan UU PDP')}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                {t('privacy.userRightsDesc', 'Sesuai UU Pelindungan Data Pribadi (UU No. 27/2022), Anda memiliki hak penuh untuk:')}
              </p>
              <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
                <li><strong>{t('privacy.rightAccess', 'Hak Akses & Portabilitas:')}</strong> {t('privacy.rightAccessDesc', 'Mengekspor seluruh data pribadi Anda kapan saja dalam format JSON atau CSV.')}</li>
                <li><strong>{t('privacy.rightErasure', 'Hak Penghapusan (Right to Erasure):')}</strong> {t('privacy.rightErasureDesc', 'Menghapus permanen seluruh data Anda dari perangkat dan server secara instan.')}</li>
                <li><strong>{t('privacy.rightAnonymity', 'Hak Anonimitas:')}</strong> {t('privacy.rightAnonymityDesc', 'Menggunakan RIMA tanpa perlu memberikan identitas asli atau nomor telepon pribadi.')}</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Deteksi Krisis & Keamanan */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <FileText size={24} style={{ color: 'var(--color-warm)', flexShrink: 0, marginTop: '4px' }} />
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {t('privacy.crisisSafetyTitle', '4. Privasi Deteksi Krisis')}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {t('privacy.crisisSafetyDesc', 'Algoritma pendeteksi kata kunci krisis berjalan sepenuhnya pada browser Anda (client-side NLP matching). Tidak ada teks jurnal darurat yang dikirim atau disimpan di server untuk analisis kecerdasan buatan.')}
              </p>
            </div>
          </div>
        </Card>

        {/* Hak Menghapus Data */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Trash2 size={24} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '4px' }} />
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {t('privacy.wipeTitle', '5. Menghapus Seluruh Data Anda')}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                {t('privacy.wipeDesc', 'Anda dapat menghapus seluruh riwayat mood, jurnal, pengaturan, dan identitas anonim Anda melalui halaman Profil dengan tombol "Hapus Semua Data".')}
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/profile')}>
                {t('privacy.goToProfile', 'Kunjungi Halaman Profil')}
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
        <p>{t('privacy.lastUpdated', 'Terakhir Diperbarui: September 2026')}</p>
        <p>{t('privacy.contactDPO', 'Pertanyaan mengenai privasi data: privasi@rima.app')}</p>
      </div>
    </div>
  );
};
