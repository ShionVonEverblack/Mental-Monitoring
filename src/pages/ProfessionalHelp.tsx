import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PROFESSIONAL_SERVICES, SERVICE_TYPES, PROVINCES } from '../data/professionalServices';
import type { ProfessionalService } from '../data/professionalServices';

export const ProfessionalHelp: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [bpjsOnly, setBpjsOnly] = useState(false);

  const filtered = PROFESSIONAL_SERVICES.filter((service: ProfessionalService) => {
    if (search && !service.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (province && service.province !== province) return false;
    if (serviceType && service.type !== serviceType) return false;
    if (onlineOnly && !service.online) return false;
    if (bpjsOnly && !service.bpjs) return false;
    return true;
  });

  const lang = i18n.language;

  return (
    <div className="professional-page">
      <header>
        <h1>{t('professional.title', 'Bantuan Profesional')}</h1>
        <p>{t('professional.subtitle', 'Temukan layanan kesehatan mental profesional di Indonesia')}</p>
      </header>
      
      {/* Filters */}
      <div className="professional-filters">
        <div className="professional-search">
          <input 
            type="text"
            placeholder={t('professional.search', 'Cari layanan...')} 
            aria-label={t('professional.search', 'Cari layanan...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="professional-filter-row">
          <select 
            className="select" 
            value={province} 
            onChange={(e) => setProvince(e.target.value)}
            aria-label={t('professional.allProvinces', 'Semua Provinsi')}
          >
            <option value="">{t('professional.allProvinces', 'Semua Provinsi')}</option>
            {PROVINCES.map(p => (
              <option key={p.id} value={p.id}>
                {lang === 'en' ? p.labelEn : p.labelId}
              </option>
            ))}
          </select>
          <select 
            className="select" 
            value={serviceType} 
            onChange={(e) => setServiceType(e.target.value)}
            aria-label={t('professional.allTypes', 'Semua Jenis Layanan')}
          >
            <option value="">{t('professional.allTypes', 'Semua Jenis Layanan')}</option>
            {SERVICE_TYPES.map(st => (
              <option key={st.id} value={st.id}>
                {lang === 'en' ? st.labelEn : st.labelId}
              </option>
            ))}
          </select>
        </div>
        <div className="professional-toggles">
          <label>
            <input 
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
            /> {t('professional.onlineOnly', 'Online saja')}
          </label>
          <label>
            <input 
              type="checkbox"
              checked={bpjsOnly}
              onChange={(e) => setBpjsOnly(e.target.checked)}
            /> {t('professional.bpjsOnly', 'BPJS')}
          </label>
        </div>
      </div>
      
      {/* Results */}
      <div className="professional-results">
        <p className="professional-count">{filtered.length} layanan</p>
        {filtered.map((service: ProfessionalService) => (
          <div className="professional-card" key={service.id}>
            <div className="professional-card-header">
              <h3>{service.name}</h3>
              <span className="badge badge-primary">{service.type}</span>
            </div>
            <p className="professional-card-location">{service.city}, {service.province}</p>
            <p className="professional-card-desc">
              {lang === 'en' ? service.descriptionEn : service.descriptionId}
            </p>
            <div className="professional-card-badges">
              {service.online && <span className="badge badge-secondary">Online</span>}
              {service.bpjs && (
                <span className="badge badge-bpjs">
                  BPJS
                </span>
              )}
            </div>
            <div className="professional-card-actions">
              {service.phone && (
                <a href={`tel:${service.phone}`} className="btn btn-sm btn-primary">
                  📞 {t('professional.call', 'Telepon')}
                </a>
              )}
              {service.website && (
                <a href={service.website} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                  🌐 Website
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <p className="professional-disclaimer">
        {t('professional.disclaimer', 'RIMA tidak terafiliasi dengan layanan di atas. Informasi disediakan sebagai referensi umum.')}
      </p>
    </div>
  );
};
