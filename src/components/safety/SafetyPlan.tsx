import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface PlanSection {
  id: string;
  titleKey: string;
  items: string[];
}

const DEFAULT_PLAN: PlanSection[] = [
  { id: 'warningSigns', titleKey: 'safety.warningSigns', items: [] },
  { id: 'copingStrategies', titleKey: 'safety.copingStrategies', items: [] },
  { id: 'socialContacts', titleKey: 'safety.socialContacts', items: [] },
  { id: 'professionals', titleKey: 'safety.professionals', items: [] },
  { id: 'safeEnvironment', titleKey: 'safety.safeEnvironment', items: [] },
  { id: 'reasonsToLive', titleKey: 'safety.reasonsToLive', items: [] },
];

export const SafetyPlan: React.FC = () => {
  const { t } = useTranslation();
  const [plan, setPlan] = useLocalStorage<PlanSection[]>('rima_safety_plan', DEFAULT_PLAN);
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const handleAddItem = (sectionId: string) => {
    const text = newItems[sectionId]?.trim();
    if (!text) return;

    setPlan(prev => prev.map(section => {
      if (section.id === sectionId) {
        return { ...section, items: [...section.items, text] };
      }
      return section;
    }));

    setNewItems(prev => ({ ...prev, [sectionId]: '' }));
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
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('safety.title', 'Safety Plan')}</h2>
        <p className="text-muted-foreground">{t('safety.description', 'Rencana keamanan personal untuk membantu Anda saat merasa krisis.')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plan.map((section) => (
          <Card key={section.id} className="flex flex-col">
            <Card.Header>
              <h3 className="font-semibold text-lg">{t(section.titleKey)}</h3>
            </Card.Header>
            <Card.Body className="space-y-3">
              <ul className="space-y-2">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start gap-2 bg-muted/40 p-2 rounded-md group">
                    <span className="text-sm text-foreground break-words flex-1">{item}</span>
                    <button
                      onClick={() => handleRemoveItem(section.id, idx)}
                      className="text-muted-foreground hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
                {section.items.length === 0 && (
                  <li className="text-sm text-muted-foreground italic text-center py-4">
                    {t('safety.emptySection', 'Belum ada item ditambahkan.')}
                  </li>
                )}
              </ul>
            </Card.Body>
            <Card.Footer>
              <div className="flex gap-2">
                <Input
                  placeholder={t('safety.addPlaceholder', 'Tambah item...')}
                  value={newItems[section.id] || ''}
                  onChange={(e) => setNewItems(prev => ({ ...prev, [section.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem(section.id);
                  }}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddItem(section.id)}
                  icon={<Plus size={16} />}
                  aria-label="Add item"
                />
              </div>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  );
};
