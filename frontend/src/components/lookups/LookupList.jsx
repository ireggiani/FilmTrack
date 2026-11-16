import { useState } from 'react';
import PropTypes from 'prop-types';
import GlassCheckbox from '../ui/GlassCheckbox';
import LedSwitch from '../ui/LedSwitch';
import FilterInput from '../ui/FilterInput';
import PillItem from '../ui/PillItem';
import { removeItem, useList } from '../../services/lists.js';

const LookupList = ({ lookup, onEdit }) => {
  const { list, noun, label, title, theme } = lookup;
  const { items, loading, error } = useList(list);
  const [alphabetical, setAlphabetical] = useState(true);
  const [filterText, setFilterText] = useState('');

  const sorted = alphabetical
    ? [...items].sort((a, b) => a.name.localeCompare(b.name))
    : items;
  const filtered = sorted.filter((item) =>
    item.name.toLowerCase().includes(filterText.toLowerCase()),
  );

  // A failed delete leaves the item in the list, which says enough
  const handleDelete = (id) =>
    removeItem(list, id).catch((err) => console.error(`Error deleting ${noun}:`, err));

  if (loading) return <div className="glass">{`Loading ${list}...`}</div>;

  return (
    <div className={`${noun}-list`}>
      <div className="list-header">
        <h3 className={theme.heading}>{title}</h3>
        {items.length > 0 && (
          <FilterInput
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onClear={() => setFilterText('')}
            theme={theme.filter}
            placeholder={`Filter ${list}…`}
          />
        )}
        {theme.sort === 'led' ? (
          <LedSwitch checked={alphabetical} onChange={setAlphabetical} label="Alphabetical" />
        ) : (
          <GlassCheckbox
            checked={alphabetical}
            onChange={(e) => setAlphabetical(e.target.checked)}
            label="Alphabetical"
            labelClassName={theme.sortLabel}
          />
        )}
      </div>
      {items.length === 0 ? (
        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          {error ? `Couldn't load the ${list}` : `No ${list} added yet`}
        </p>
      ) : filtered.length === 0 ? (
        <p style={theme.noMatch}>
          {`No ${list} match “`}
          {filterText}&rdquo;
        </p>
      ) : (
        <div className="list" style={theme.list}>
          {filtered.map((item) => (
            <PillItem
              itemType={label}
              key={item.id}
              id={item.id}
              name={item.name}
              icon={lookup.icon && item[lookup.icon]}
              className={theme.pill}
              onEdit={() => onEdit(item)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

LookupList.propTypes = {
  lookup: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default LookupList;
