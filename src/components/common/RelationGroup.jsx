import React from 'react';
import SmallButton from './SmallButton.jsx';

const boxStyle = {
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 8,
  padding: '12px',
  marginTop: 12,
  background: 'rgba(255,255,255,0.02)'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8
};

const listStyle = {
  listStyle: 'none',
  paddingLeft: 0,
  margin: 0
};

const RelationGroup = ({
  title,
  items = [],
  onAdd,
  onSelectPerson,
  onEditItem, // function(item, idx)
  onDeleteItem, // function(item, idx)
  emptyText = 'None',
  renderItem,
  itemKey = 'personId',
  className = ''
  , autoSize = false,
  autoSizeItemHeight = 40,
  autoSizeMaxVisible = 8
}) => {
  // compute inline style for ul when autoSize is enabled
  const ulStyle = {};
  const ITEM_HEIGHT = autoSizeItemHeight; // px per list row including padding
  const MAX_VISIBLE = autoSizeMaxVisible; // cap to avoid huge blocks
  if (autoSize) {
    const visible = Math.max(0, Math.min(items ? items.length : 0, MAX_VISIBLE));
    if (visible > 0) {
      ulStyle.maxHeight = `${visible * ITEM_HEIGHT}px`;
      ulStyle.overflowY = 'auto';
    } else {
      ulStyle.maxHeight = '0px';
    }
  }

  return (
    <div style={boxStyle} className={`relation-group ${autoSize ? 'auto' : ''} ${className}`.trim()}>
      <div style={headerStyle}>
        <strong>{title}</strong>
        {onAdd ? (
          <SmallButton onClick={onAdd} variant="primary" title={`Add ${title}`} className="small-btn-compact small-btn-square small-btn-xs" style={{ marginLeft: 8 }}>Add</SmallButton>
        ) : null}
      </div>

      <ul style={{ ...listStyle, ...ulStyle }}>
        {items && items.length ? (
          items.map((it, idx) => (
            <li key={it[itemKey] || idx} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="relation-name">
                  {renderItem ? (
                    renderItem(it, idx)
                  ) : (
                    <button onClick={() => onSelectPerson && onSelectPerson(it[itemKey])} style={{ background: 'transparent', border: 'none', padding: 0, color: it.dod ? 'red' : '#1976d2', cursor: 'pointer', fontSize: 'inherit' }}>
                      {it.firstName} {it.lastName}
                    </button>
                  )}
                </div>
                <div className="relation-actions">
                  {onEditItem ? <SmallButton onClick={() => onEditItem(it, idx)} variant="primary" className="small-btn-compact small-btn-square small-btn-xs">Edit</SmallButton> : null}
                  {onDeleteItem ? <SmallButton onClick={() => onDeleteItem(it, idx)} variant="danger" className="small-btn-compact small-btn-square small-btn-xs">Remove</SmallButton> : null}
                </div>
              </div>
            </li>
          ))
        ) : (
          <li>{emptyText}</li>
        )}
      </ul>
    </div>
  );
};

export default RelationGroup;
