import React, { useState, useEffect, useRef } from 'react';
import { calculateAge } from '../../utils/familyUtils.js';
import memberslabels from '../../labels/memberslabels.js';
import './personlistsidebar.css';

// Helper function to determine age pill class and label
const getAgePillClass = (age) => {
  if (age === null || age === undefined || age === '-') {
    return {
      className: 'age-pill unknown',
      label: '-'
    };
  }
  
  if (age >= 65) {
    return {
      className: 'age-pill elderly',
      label: `${age}`
    };
  } else if (age >= 18) {
    return {
      className: 'age-pill adult',
      label: `${age}`
    };
  } else if (age >= 13) {
    return {
      className: 'age-pill teen',
      label: `${age}`
    };
  } else {
    return {
      className: 'age-pill child',
      label: `${age}`
    };
  }
};


const PersonListSidebar = ({ persons, onSelect, selectedId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name'); // 'name' or 'age'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const itemsPerPage = 12;

  const filteredPersons = persons.filter(person => {
    // Show all when search is empty
    if (!searchTerm.trim()) return true;
    
    const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Sort filtered persons
  const sortedPersons = [...filteredPersons].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortBy === 'age') {
      const ageA = calculateAge(a.dob, a.dod) ?? -1;
      const ageB = calculateAge(b.dob, b.dod) ?? -1;
      return sortOrder === 'asc' ? ageA - ageB : ageB - ageA;
    }
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedPersons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPersons = sortedPersons.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortClick = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if same sort type
      setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort type with ascending order
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <aside className="person-list-sidebar">
      <h3 className="person-list-header">{memberslabels.header.title}</h3>
      <div className="person-list-search-container">
        <input
          type="text"
          placeholder={memberslabels.controls.search}
          value={searchTerm}
          onChange={handleSearchChange}
          className="person-list-search-input"
        />
      </div>
      
      {/* Sorting Options */}
      <div className="sort-container">
        <span className="sort-label">Sort by:</span>
        <div className="sort-buttons">
          <button
            onClick={() => handleSortClick('name')}
            className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
            title="Sort by Name"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h12M3 18h6"/>
            </svg>
            {sortBy === 'name' && (
              <span className="sort-arrow">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button
            onClick={() => handleSortClick('age')}
            className={`sort-btn ${sortBy === 'age' ? 'active' : ''}`}
            title="Sort by Age"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            {sortBy === 'age' && (
              <span className="sort-arrow">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="person-list-container">
        <ul className="person-list">
        {paginatedPersons.map(person => {
          const age = calculateAge(person.dob, person.dod);
          const agePill = getAgePillClass(age);
          
          // Add deceased class to age pill if person is deceased
          const agePillClassName = person.dod 
            ? `${agePill.className} deceased` 
            : agePill.className;
          
          return (
            <li
              key={person.personId}
              ref={el => { if (el) itemRefs.current.set(person.personId, el); }}
              className={`person-list-item ${selectedId === person.personId ? 'selected' : ''}`}
              onClick={() => onSelect && onSelect(person.personId)}
            >
              <span 
                className={`person-name ${person.dod ? 'deceased' : ''}`}
                title={`${person.firstName} ${person.lastName}`}
              >
                {person.firstName} {person.lastName}
              </span>
              <span className={agePillClassName}>
                {agePill.label}
              </span>
            </li>
          );
        })}
        </ul>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
            className="pagination-btn"
            aria-label="Previous page"
          >
            ‹
          </button>
          
          <span className="pagination-info">
            {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </aside>
  );
};

export default PersonListSidebar;
