import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ModalScreen } from '@components/conteiners/ModalScreen';
import SelectField from '@components/fields/SelectField';
import { DatePicker } from '@components/inputs';
import Button from '@components/Button';
import getRepositories from '@repositories';
import CategoryListItem from '@features/categories/CategoryListItem';
import './TimelineFilterScreen.css';

const TimelineFilterScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accounts, categories } = getRepositories();

  const [accountId, setAccountId] = useState<string | undefined>(searchParams.get('account') || undefined);
  const [from, setFrom] = useState<Date | null>(searchParams.get('from') ? new Date(String(searchParams.get('from'))) : null);
  const [to, setTo] = useState<Date | null>(searchParams.get('to') ? new Date(String(searchParams.get('to'))) : null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('c')?.split(',').filter(Boolean) ?? []
  );

  const accountsList = accounts.getCache();
  const rootCategories = categories.getAllRoots();

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedCategories.length) params.set('c', selectedCategories.join(','));
    if (from) params.set('from', from.toISOString().substring(0,10));
    if (to) params.set('to', to.toISOString().substring(0,10));
    const search = params.toString();
    navigate(`/main/timeline${accountId ? `/${accountId}` : ''}${search ? `?${search}` : ''}`);
  };

  return (
    <ModalScreen title={Lang.timeline.filters}>
      <SelectField
        label={Lang.registry.account}
        value={accountId ?? ''}
        onChange={(val) => setAccountId(val || undefined)}
        options={[{ value: '', label: Lang.commons.default }, ...accountsList.map(acc => ({ value: acc.id, label: acc.name }))]}
      />
      <DatePicker label={Lang.timeline.from} value={from} onChange={setFrom} />
      <DatePicker label={Lang.timeline.to} value={to} onChange={setTo} />
      <div className="TimelineFiltersCategories">
        <span className="TimelineFiltersLabel">{Lang.categories.title}</span>
        {rootCategories.map(root => (
          <div key={root.id} className="TimelineFiltersCategoryRoot">
            <label className="TimelineFiltersCategoryOption">
              <input
                type="checkbox"
                checked={selectedCategories.includes(root.id)}
                onChange={() => toggleCategory(root.id)}
              />
              <CategoryListItem category={root} />
            </label>
            {root.children.map(child => (
              <label key={child.id} className="TimelineFiltersCategoryOption TimelineFiltersCategoryChild">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(child.id)}
                  onChange={() => toggleCategory(child.id)}
                />
                <CategoryListItem category={child} />
              </label>
            ))}
          </div>
        ))}
      </div>
      <div className="TimelineFiltersActions">
        <Button text={Lang.commons.cancel} onClick={() => navigate(-1)} />
        <Button text={Lang.timeline.apply} onClick={applyFilters} />
      </div>
    </ModalScreen>
  );
};

export default TimelineFilterScreen;

