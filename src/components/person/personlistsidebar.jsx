import React, { useState, useEffect, useRef } from 'react';
import { calculateAge } from '../../utils/familyUtils.js';


const PersonListSidebar = ({ persons, onSelect, selectedId }) => {
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPersons = persons.filter(person => {
    const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());

  // when selectedId changes, scroll corresponding item into view
  useEffect(() => {
    if (!selectedId) return;
    const el = itemRefs.current.get(selectedId);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(search);
  };

  return (
  <aside style={{ width: 240, minWidth: 220, float: 'left', borderRight: '1px solid #eee', height: '100%', padding: '1rem 0.5rem', boxSizing: 'border-box', background: '#fafbfc' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Persons List </h3>
      <form onSubmit={handleSearch} style={{ marginBottom: 12, display: 'flex', gap: 4 }}>
        <input
          type="text"
          placeholder="Search person..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{
            padding: '4px 10px',
            background: '#1976d2',
            color: 'white',
            border: '1px solid #1976d2',
            borderRadius: 4,
            fontWeight: 600,
            cursor: 'pointer',
            minWidth: 60
          }}
        >
          Search
        </button>
      </form>
      <div style={{ maxHeight: 'calc(100vh - 160px)', overflow: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filteredPersons.map(person => (
          <li
            key={person.personId}
            ref={el => { if (el) itemRefs.current.set(person.personId, el); }}
            style={{
              marginBottom: 8,
              cursor: 'pointer',
              fontWeight: selectedId === person.personId ? 'bold' : 'normal',
              background: selectedId === person.personId ? '#e6f0fa' : 'transparent',
              borderRadius: 4,
              padding: '4px 8px'
            }}
            onClick={() => onSelect && onSelect(person.personId)}
          >
            <span style={{ color: person.dod ? 'red' : 'inherit' }}>{person.firstName} {person.lastName}</span>
            {' '}
            <span style={{ color: '#666' }}>[{calculateAge(person.dob, person.dod) ?? '-'}]</span>
          </li>
        ))}
        </ul>
      </div>
    </aside>
  );
};

export default PersonListSidebar;
