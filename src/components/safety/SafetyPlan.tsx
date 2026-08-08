import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, AlertTriangle, Heart, Phone, LifeBuoy, ShieldCheck, Sparkles, Printer, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface PlanSection {
  id: string;
  titleKey: string;
  defaultTitle: string;
  icon: string;
  color: string;
  bg: string;
  suggestions: string[];
  items: string[];
}

const INITIAL_PLAN: PlanSection[] = [
  {
    id: 'warningSigns',
    titleKey: 'safety.warningSigns',
    defaultTitle: '1. Tanda-tanda Peringatan (Warning Signs)',
    icon: 'AlertTriangle',
    color: 'var(--color-danger)',
    bg: 'hsla(0, 65%, 55%, 0.12)',
    suggestions: ['Jantung berdebar keras', 'Sulit tidur 2 hari berturut-turut', 'Menarik diri dari teman', 'Pikiran berpacu tanpa henti'],
    items: [],
  },
  {
    id: 'copingStrategies',
    titleKey: 'safety.copingStrategies',
    defaultTitle: '2. Strategi Koping Mandiri (Internal Coping)',
    icon: 'Heart',
    color: 'var(--color-secondary)',
    bg: 'hsla(165, 45%, 50%, 0.12)',
    suggestions: ['Teknik napas 4-7-8', 'Jalan santai di luar ruangan', 'Mendengarkan musik tenang', 'Mandi air hangat'],
    items: [],
  },
  {
    id: 'socialContacts',
    titleKey: 'safety.socialContacts',
    defaultTitle: '3. Kontak Sosial untuk Pengalihan (Social Distraction)',
    icon: 'Phone',
    color: 'var(--color-primary)',
    bg: 'hsla(215, 65%, 55%, 0.12)',
    suggestions: ['Telepon/chat teman dekat', 'Duduk di tempat umum/kafe', 'Berkumpul bersama keluarga'],
    items: [],
  },
  {
    id: 'professionals',
    titleKey: 'safety.professionals',
    defaultTitle: '4. Tenaga Profesional & Layanan Krisis',
    icon: 'LifeBuoy',
    color: 'var(--color-warm)',
    bg: 'hsla(35, 75%, 60%, 0.12)',
    suggestions: ['Into The Light: 119 ext 8', 'Yayasan Pulih: 021-788-42580', 'Psikolog / Dokter Jiwa terdekat'],
    items: [],
  },
  {
    id: 'safeEnvironment',
    titleKey: 'safety.safeEnvironment',
    defaultTitle: '5. Membuat Lingkungan Aman (Safe Environment)',
    icon: 'ShieldCheck',
    color: 'var(--color-accent)',
    bg: 'hsla(270, 50%, 65%, 0.12)',
    suggestions: ['Amankan barang berbahaya', 'Minta teman menyimpan obat berlebih', 'Jauhi tempat terisolasi saat sedih'],
    items: [],
  },
  {
    id: 'reasonsToLive',
    titleKey: 'safety.reasonsToLive',
    defaultTitle: '6. Alasan untuk Tetap Ada (Reasons to Live)',
    icon: 'Sparkles',
    color: 'var(--color-warm)',
    bg: 'hsla(35, 75%, 60%, 0.15)',
    suggestions: ['Kucing/hewan peliharaan saya', 'Impian yang ingin dicapai', 'Orang-orang yang menyayangi saya', 'Masa depan yang lebih cerah'],
    items: [],
  },
];

const renderIcon = (iconName: string, color: string) => {
  switch (iconName) {
    case 'AlertTriangle': return <AlertTriangle size={18} style={{ color }} />;
    case 'Heart': return <Heart size={18} style={{ color }} />;
    case 'Phone': return <Phone size={18} style={{ color }} />;
    case 'LifeBuoy': return <LifeBuoy size={18} style={{ color }} />;
    case 'ShieldCheck': return <ShieldCheck size={18} style={{ color }} />;
    case 'Sparkles': return <Sparkles size={18} style={{ color }} />;
    default: return <Heart size={18} style={{ color }} />;
  }
};

export const SafetyPlan: React.FC = () => {
  const { t } = useTranslation();
  const [plan, setPlan] = useLocalStorage<PlanSection[]>('rima-safety-plan', INITIAL_PLAN);
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [savedNotice, setSavedNotice] = useState(false);

  const handleAddItem = (sectionId: string, customText?: string) => {
    const text = (customText || newItems[sectionId])?.trim();
    if (!text) return;

    setPlan(prev => prev.map(section => {
      if (section.id === sectionId) {
        if (section.items.includes(text)) return section;
        return { ...section, items: [...section.items, text] };
      }
      return section;
    }));

    if (!customText) {
      setNewItems(prev => ({ ...prev, [sectionId]: '' }));
    }

    showNotice();
  };

  const handleRemoveItem = (sectionId: string, index: number) => {
    setPlan(prev => prev.map(section => {
      if (section.id === sectionId) {
        const newItemsList = [...section.items];
        newItemsList.splice(index, 1);
        return { ...section, items: newItemsList };
      }
      return section;
    }));

    showNotice();
  };

  const showNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="safety-plan-page">
      <div className="safety-plan-header">
        <h1 className="safety-plan-title">
          {t('safety.safetyPlanTitle', 'Rencana Keselamatan Personal')}
        </h1>
        <p className="safety-plan-subtitle">
          {t('safety.safetyPlanSubtitle', 'Panduan pribadi yang Anda susun saat pikiran tenang, untuk menuntun dan melindungi Anda ketika krisis emosional datang.')}
        </p>

        <div className="safety-actions">
          <Button variant="secondary" onClick={handlePrint} icon={<Printer size={18} />}>
            {t('common.print', 'Cetak / Simpan PDF')}
          </Button>
          {savedNotice && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
              <CheckCircle size={18} /> Tersimpan otomatis
            </span>
          )}
        </div>
      </div>

      <div className="safety-grid">
        {plan.map((section) => (
          <Card key={section.id} variant="glass">
            <div className="card-header">
              <div className="safety-card-header">
                <div className="safety-card-icon" style={{ backgroundColor: section.bg }}>
                  {renderIcon(section.icon, section.color)}
                </div>
                <h2 className="safety-card-title">
                  {t(section.titleKey, section.defaultTitle)}
                </h2>
              </div>
            </div>

            <div className="card-body">
              <ul className="safety-item-list">
                {section.items.map((item, idx) => (
                  <li key={idx} className="safety-item">
                    <span>{item}</span>
                    <button
                      onClick={() => handleRemoveItem(section.id, idx)}
                      className="safety-item-remove"
                      aria-label="Remove item"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
                {section.items.length === 0 && (
                  <li className="safety-empty-hint">
                    {t('safety.emptySection', 'Belum ada item. Tambahkan dari ide di bawah atau tulis milikmu.')}
                  </li>
                )}
              </ul>

              <div className="safety-input-group">
                <Input
                  placeholder={t('safety.addPlaceholder', 'Tambah item pribadi...')}
                  value={newItems[section.id] || ''}
                  onChange={(e) => setNewItems(prev => ({ ...prev, [section.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem(section.id);
                  }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddItem(section.id)}
                  icon={<Plus size={16} />}
                  aria-label="Add item"
                />
              </div>

              {section.suggestions.length > 0 && (
                <div className="safety-suggestions">
                  {section.suggestions.map((suggestion, sIdx) => {
                    const isAdded = section.items.includes(suggestion);
                    if (isAdded) return null;
                    return (
                      <button
                        key={sIdx}
                        onClick={() => handleAddItem(section.id, suggestion)}
                        className="safety-suggestion-chip"
                      >
                        + {suggestion}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
