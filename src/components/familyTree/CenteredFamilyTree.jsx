// src/components/familyTree/CenteredFamilyTree.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { getAncestors, getDescendants } from "../../utils/familyUtils";

/*
  Manual SVG-centered family tree
  - Renders the selected `person` at center
  - Ancestors appear above (levels: parents, grandparents, ...)
  - Descendants appear below (children, grandchildren, ...)
  - No wrapper nodes labeled "Ancestors" or "Descendants"
  - Props: { person, people, width=1000, height=800, onSelect, onViewPerson }
*/
function CenteredFamilyTree({ person, people, width = 1000, height = null, onSelect = () => {}, onViewPerson = () => {} }) {
  if (!person) return <div style={{ padding: 20 }}>Select a person to view the family tree</div>;

  // local center state so clicks can re-center without waiting for parent
  const [centerPerson, setCenterPerson] = useState(person);
  const treeContainerRef = useRef(null);
  
  // Tree view type state
  const [treeViewType, setTreeViewType] = useState('normal'); // 'normal' or 'siblings'
  
  useEffect(() => {
    setCenterPerson(person);
  }, [person]);

  // Scroll to center person when they change (from sidebar selection)
  useEffect(() => {
    if (centerPerson && treeContainerRef.current) {
      // Calculate where the center person is positioned
      const actualAncestorLevels = buildAncestorLevels(centerPerson, 6).length;
      const topPadding = 10;
      const levelGap = 140;
      const nodeHeight = 48;
      const centerY = topPadding + (actualAncestorLevels * levelGap) + (nodeHeight / 2);
      
      // Scroll to show the center person with some offset from top
      const scrollOffset = Math.max(0, centerY - 200); // Show person 200px from top of viewport
      
      window.scrollTo({
        top: scrollOffset,
        behavior: 'smooth'
      });
    }
  }, [centerPerson]);

  const getPersonById = id => people.find(p => p.personId === id) || null;

  const getSiblingsForPerson = (person) => {
    if (!person.motherId && !person.fatherId) return [];
    
    return people.filter(p => 
      p.personId !== person.personId && 
      ((person.motherId && p.motherId === person.motherId) || 
       (person.fatherId && p.fatherId === person.fatherId))
    );
  };

  const buildAncestorLevels = (root, maxLevels) => {
    const levels = [];
    const visited = new Set([root.personId]);
    let current = [root];

    for (let i = 0; i < maxLevels; i++) {
      const next = [];
      const levelPeople = [];
      
      current.forEach(p => {
        if (p.motherId) {
          const mom = getPersonById(p.motherId);
          if (mom && !visited.has(mom.personId)) { 
            levelPeople.push(mom); 
            visited.add(mom.personId); 
          }
        }
        if (p.fatherId) {
          const dad = getPersonById(p.fatherId);
          if (dad && !visited.has(dad.personId)) { 
            levelPeople.push(dad); 
            visited.add(dad.personId); 
          }
        }
      });

      // If in siblings view mode, add siblings for each person in this level
      if (treeViewType === 'siblings') {
        const levelWithSiblings = [];
        levelPeople.forEach(person => {
          const siblings = getSiblingsForPerson(person).filter(s => !visited.has(s.personId));
          siblings.forEach(sibling => {
            visited.add(sibling.personId);
          });
          
          // Position ALL siblings based on the main person's gender
          const mainPersonGender = (person.gender || '').toLowerCase();
          const siblingPosition = mainPersonGender === 'female' ? 'left' : 'right';
          
          if (mainPersonGender === 'female') {
            // Female person: show all siblings on left side, then main person
            levelWithSiblings.push(...siblings.map(s => ({ ...s, isSibling: true, mainPerson: person.personId, siblingPosition: 'left' })));
            levelWithSiblings.push({ ...person, isSibling: false, mainPerson: person.personId });
          } else {
            // Male person (or unknown gender): show main person first, then all siblings on right side
            levelWithSiblings.push({ ...person, isSibling: false, mainPerson: person.personId });
            levelWithSiblings.push(...siblings.map(s => ({ ...s, isSibling: true, mainPerson: person.personId, siblingPosition: 'right' })));
          }
        });
        next.push(...levelWithSiblings);
      } else {
        next.push(...levelPeople.map(p => ({ ...p, isSibling: false })));
      }
      
      if (next.length === 0) break;
      levels.push(next);
      current = levelPeople; // Use original level people for next iteration
    }
    return levels;
  };

  const buildDescendantLevels = (rootId, maxLevels) => {
    const levels = [];
    const visited = new Set([rootId]);
    let currentIds = [rootId];

    for (let i = 0; i < maxLevels; i++) {
      const next = [];
      currentIds.forEach(id => {
        people.forEach(p => {
          if (!visited.has(p.personId) && (p.motherId === id || p.fatherId === id)) {
            next.push(p);
            visited.add(p.personId);
          }
        });
      });
      if (next.length === 0) break;
      levels.push(next);
      currentIds = next.map(p => p.personId);
    }
    return levels;
  };

  // compute ancestor/descendant levels first (outside layout useMemo)
  const maxAnc = 6; // show up to 6 ancestor levels
  const maxDesc = 6; // show up to 6 descendant levels
  const levelGap = 140; // increase vertical spacing so tall trees are visible
  const nodeWidth = 140;
  const nodeHeight = 48;
  const MAX_NAME_LENGTH = 21; // Maximum characters before truncation
  const ELLIPSIS_START_POS = 17; // Position to start ellipsis when name exceeds max length
  
  // Recalculate levels when tree view type changes
  const ancestorLevels = useMemo(() => buildAncestorLevels(centerPerson, maxAnc), [centerPerson, treeViewType, people]);
  const descendantLevels = buildDescendantLevels(centerPerson.personId, maxDesc);

  // compute dynamic height based on actual levels used (not reserved max)
  const topPadding = 10;
  const actualAncestorLevels = ancestorLevels.length;
  const actualDescendantLevels = descendantLevels.length;
  
  // height = top padding + ancestor levels + center person + descendant levels + bottom padding
  const computedHeight = height || (topPadding + (actualAncestorLevels * levelGap) + nodeHeight + (actualDescendantLevels * levelGap) + topPadding);

  const { nodes, links, treeWidth } = useMemo(() => {
    if (!centerPerson) return { nodes: [], links: [], treeWidth: width };

    // Create center level with siblings if in siblings mode
    let centerLevel = [centerPerson];
    if (treeViewType === 'siblings') {
      const centerSiblings = getSiblingsForPerson(centerPerson);
      const mainPersonGender = (centerPerson.gender || '').toLowerCase();
      
      if (mainPersonGender === 'female') {
        // Female person: show all siblings on left side, then main person
        centerLevel = [
          ...centerSiblings.map(s => ({ ...s, isSibling: true, mainPerson: centerPerson.personId, siblingPosition: 'left' })),
          { ...centerPerson, isSibling: false, mainPerson: centerPerson.personId }
        ];
      } else {
        // Male person (or unknown gender): show main person first, then all siblings on right side
        centerLevel = [
          { ...centerPerson, isSibling: false, mainPerson: centerPerson.personId },
          ...centerSiblings.map(s => ({ ...s, isSibling: true, mainPerson: centerPerson.personId, siblingPosition: 'right' }))
        ];
      }
    }

    // Calculate required width for all levels
    const allLevels = [
      ...ancestorLevels,
      centerLevel, // center person with siblings if in siblings mode
      ...descendantLevels
    ];
    
    const minMargin = 20;
    const maxLevelWidth = Math.max(...allLevels.map(levelArray => {
      const n = levelArray.length;
      const totalNodeWidth = n * nodeWidth;
      const totalMarginWidth = (n - 1) * minMargin;
      return totalNodeWidth + totalMarginWidth + (2 * minMargin); // add padding on sides
    }));
    
    const actualTreeWidth = Math.max(width, maxLevelWidth);
    const centerX = actualTreeWidth / 2;
    
    // Position center person based on actual ancestor levels, not in middle of computed height
    const centerY = topPadding + (actualAncestorLevels * levelGap) + (nodeHeight / 2);

    const nodesMap = new Map();
    
    // Place center level (person + siblings if in siblings mode)
    const n = centerLevel.length;
    if (n === 1) {
      // Single center person (normal mode)
      nodesMap.set(centerPerson.personId, { person: centerLevel[0], x: centerX, y: centerY });
    } else {
      // Center person with siblings (siblings mode) - group them closer together
      const siblingMargin = 10; // Smaller margin between siblings
      const totalGroupWidth = n * nodeWidth + (n - 1) * siblingMargin;
      const groupStartX = centerX - (totalGroupWidth / 2);
      
      centerLevel.forEach((p, j) => {
        const x = groupStartX + (j * (nodeWidth + siblingMargin)) + (nodeWidth / 2);
        nodesMap.set(p.personId, { person: p, x, y: centerY });
      });
    }

    // place ancestor levels above center
    ancestorLevels.forEach((levelArray, idx) => {
      const level = idx + 1;
      const y = centerY - level * levelGap;
      
      if (treeViewType === 'siblings') {
        // Group siblings closer to their main person and center the entire level
        
        // Group people by their mainPerson property
        const groups = new Map();
        levelArray.forEach(p => {
          const mainPersonId = p.mainPerson || p.personId;
          if (!groups.has(mainPersonId)) {
            groups.set(mainPersonId, []);
          }
          groups.get(mainPersonId).push(p);
        });
        
        // Calculate total width needed for all groups
        let totalRequiredWidth = 0;
        const groupWidths = [];
        groups.forEach(group => {
          const groupWidth = group.length * nodeWidth + (group.length - 1) * 10; // 10px between siblings
          groupWidths.push(groupWidth);
          totalRequiredWidth += groupWidth;
        });
        
        // Add gaps between groups (60px each)
        const numGaps = groups.size - 1;
        totalRequiredWidth += numGaps * 60;
        
        // Start from center and work outward
        let currentX = centerX - (totalRequiredWidth / 2);
        
        let groupIndex = 0;
        groups.forEach(group => {
          const groupStartX = currentX;
          
          group.forEach((p, j) => {
            const x = groupStartX + (j * (nodeWidth + 10)) + (nodeWidth / 2);
            nodesMap.set(p.personId, { person: p, x, y });
          });
          
          currentX += groupWidths[groupIndex] + 60; // Move to next group position
          groupIndex++;
        });
      } else {
        // Normal spacing for regular ancestor view
        const n = levelArray.length;
        const minMargin = 20;
        const totalNodeWidth = n * nodeWidth;
        const totalMarginWidth = (n - 1) * minMargin;
        const requiredWidth = totalNodeWidth + totalMarginWidth;
        const effectiveWidth = Math.max(requiredWidth, actualTreeWidth);
        const spacing = effectiveWidth / (n + 1);
        
        levelArray.forEach((p, j) => {
          const x = spacing * (j + 1);
          nodesMap.set(p.personId, { person: p, x, y });
        });
      }
    });

    // place descendant levels below center
    descendantLevels.forEach((levelArray, idx) => {
      const level = idx + 1;
      const y = centerY + level * levelGap;
      const n = levelArray.length;
      
      // Calculate spacing with minimum margin between nodes
      const minMargin = 20; // minimum space between nodes
      const totalNodeWidth = n * nodeWidth;
      const totalMarginWidth = (n - 1) * minMargin;
      const requiredWidth = totalNodeWidth + totalMarginWidth;
      
      // Use larger of: required width or actual tree width
      const effectiveWidth = Math.max(requiredWidth, actualTreeWidth);
      const spacing = effectiveWidth / (n + 1);
      
      levelArray.forEach((p, j) => {
        const x = spacing * (j + 1);
        nodesMap.set(p.personId, { person: p, x, y });
      });
    });

    // links: parent -> child when both on map, but exclude siblings
    const linksArr = [];
    nodesMap.forEach((node, pid) => {
      const p = node.person;
      
      // Skip creating parent links for siblings
      if (p.isSibling) return;
      
      const parentIds = [];
      if (p.motherId) parentIds.push(p.motherId);
      if (p.fatherId) parentIds.push(p.fatherId);
      parentIds.forEach(parentId => {
        if (nodesMap.has(parentId)) {
          const parentNode = nodesMap.get(parentId);
          linksArr.push({ from: { x: parentNode.x, y: parentNode.y }, to: { x: node.x, y: node.y }, parentId, childId: pid });
        }
      });
    });

    // Add horizontal sibling connections
    if (treeViewType === 'siblings') {
      // Group nodes by level and mainPerson to connect siblings
      const nodesByLevel = new Map();
      
      nodesMap.forEach((node, pid) => {
        const level = node.y; // Use Y coordinate as level identifier
        if (!nodesByLevel.has(level)) {
          nodesByLevel.set(level, []);
        }
        nodesByLevel.get(level).push(node);
      });
      
      nodesByLevel.forEach(levelNodes => {
        // Group by mainPerson at each level
        const groupsByMainPerson = new Map();
        levelNodes.forEach(node => {
          const mainPersonId = node.person.mainPerson || node.person.personId;
          if (!groupsByMainPerson.has(mainPersonId)) {
            groupsByMainPerson.set(mainPersonId, []);
          }
          groupsByMainPerson.get(mainPersonId).push(node);
        });
        
        // Connect siblings within each group with horizontal lines
        groupsByMainPerson.forEach(group => {
          if (group.length > 1) {
            // Sort by x position to connect from left to right
            group.sort((a, b) => a.x - b.x);
            
            for (let i = 0; i < group.length - 1; i++) {
              const fromNode = group[i];
              const toNode = group[i + 1];
              
              linksArr.push({ 
                from: { x: fromNode.x, y: fromNode.y }, 
                to: { x: toNode.x, y: toNode.y }, 
                isSiblingConnection: true 
              });
            }
          }
        });
      });
    }

    return { nodes: Array.from(nodesMap.values()), links: linksArr, treeWidth: actualTreeWidth };
  }, [centerPerson, people, width, computedHeight, ancestorLevels, descendantLevels, actualAncestorLevels, topPadding, levelGap, nodeHeight, nodeWidth, treeViewType]);

  // draw a curved link for parent-child or straight horizontal line for siblings
  const renderLink = (link, i) => {
    const { from, to, isSiblingConnection } = link;
    
    if (isSiblingConnection) {
      // Draw straight horizontal line for sibling connections
      const path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
      return <path key={i} d={path} stroke="#bbb" fill="none" strokeWidth={2} strokeDasharray="5,3" />;
    } else {
      // Draw curved line for parent-child connections
      const midY = (from.y + to.y) / 2;
      const path = `M ${from.x} ${from.y} C ${from.x} ${midY} ${to.x} ${midY} ${to.x} ${to.y}`;
      return <path key={i} d={path} stroke="#ffb366" fill="none" strokeWidth={1} />;
    }
  };

  // (computedHeight already calculated above from ancestor/desc counts)

  const renderNode = (node) => {
    const { person: p, x, y } = node;
    const isCenter = centerPerson && p.personId === centerPerson.personId;
    const isSibling = p.isSibling;
    
    // Different colors for siblings vs main ancestors
    const fillColor = isSibling 
      ? '#f5f5f5' // Light gray for siblings
      : (p.gender || '').toLowerCase() === 'male' ? '#e6f2ff' : ( (p.gender || '').toLowerCase() === 'female' ? '#ffe6f0' : '#fff' );
    
    const textColor = p.dod ? '#757575' : (isSibling ? '#666' : '#000'); // Slightly muted for siblings
    const fontStyle = p.dod ? 'italic' : 'normal'; // Italic for deceased
    
    // Truncate name if longer than MAX_NAME_LENGTH characters
    const fullName = `${p.firstName} ${p.lastName}`;
    const displayName = fullName.length > MAX_NAME_LENGTH ? `${fullName.substring(0, ELLIPSIS_START_POS)}..` : fullName;
    
    return (
      <g key={p.personId} transform={`translate(${x - nodeWidth/2}, ${y - nodeHeight/2})`} style={{ cursor: 'pointer' }} onClick={() => { setCenterPerson(p); if (onSelect) onSelect(p); }}>
        <rect 
          width={nodeWidth} 
          height={nodeHeight} 
          rx={6} 
          fill={fillColor} 
          stroke={isCenter ? '#1976d2' : (isSibling ? '#ccc' : '#eee')} 
          strokeWidth={isCenter ? 3 : (isSibling ? 1 : 1)}
          strokeDasharray={isSibling ? '3,2' : 'none'}
        />
        <text x={10} y={18} fontSize={12} fontWeight={isSibling ? 400 : 600} fill={textColor} fontStyle={fontStyle}>
          <title>{fullName}{isSibling ? ' (Sibling)' : ''}</title>
          {displayName}
        </text>
        <text x={10} y={36} fontSize={11} fill={textColor} fontStyle={fontStyle}>{p.dob || ''}{p.dod ? ` — ${p.dod}` : ''}</text>
        {isSibling && (
          <text x={nodeWidth - 15} y={15} fontSize={10} fill="#999" fontWeight="bold">
            S
          </text>
        )}
        {isCenter && (
          <g 
            transform={`translate(${nodeWidth - 25}, 5)`} style={{ cursor: 'pointer' }} 
            onClick={(e) => { e.stopPropagation(); onViewPerson(p); }}
          >
            <circle cx={10} cy={10} r={10} fill="rgba(25, 118, 210, 0.1)" stroke="#1976d2" strokeWidth={1} />
            <svg x={4} y={4} width={12} height={12} viewBox="0 0 24 24" fill="#1976d2">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <title>View Details</title>
          </g>
        )}
      </g>
    );
  };

  return (
    <div ref={treeContainerRef} style={{ width: '100%', minHeight: computedHeight }}>
      {/* Tree View Type Toolbar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        padding: '0.75rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px', 
        marginBottom: '1rem',
        border: '1px solid #e9ecef'
      }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#495057' }}>Tree View:</span>
        <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
          <button
            onClick={() => setTreeViewType('normal')}
            style={{
              padding: '0.375rem 0.75rem',
              border: 'none',
              backgroundColor: treeViewType === 'normal' ? '#0d6efd' : '#fff',
              color: treeViewType === 'normal' ? '#fff' : '#495057',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Basic
          </button>
          <button
            onClick={() => setTreeViewType('siblings')}
            style={{
              padding: '0.375rem 0.75rem',
              border: 'none',
              borderLeft: '1px solid #dee2e6',
              backgroundColor: treeViewType === 'siblings' ? '#0d6efd' : '#fff',
              color: treeViewType === 'siblings' ? '#fff' : '#495057',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            With Siblings
          </button>
        </div>
      </div>
      
      <svg width={treeWidth} height={computedHeight} style={{ display: 'block', minWidth: '100%' }}>
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.08"/>
          </filter>
        </defs>

        <g>{links.map((l, i) => renderLink(l, i))}</g>
        <g>{nodes.map(n => renderNode(n))}</g>
      </svg>
    </div>
  );
}

export default CenteredFamilyTree;
