// src/components/familyTree/CenteredFamilyTree.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { getAncestors, getDescendants } from "../../utils/familyUtils";

/*
  Manual SVG-centered family tree
  - Renders the selected `person` at center
  - Ancestors appear above (levels: parents, grandparents, ...)
  - Descendants appear below (children, grandchildren, ...)
  - No wrapper nodes labeled "Ancestors" or "Descendants"
  - Props: { person, people, width=1000, height=800, onSelect }
*/
function CenteredFamilyTree({ person, people, width = 1000, height = null, onSelect = () => {} }) {
  if (!person) return <div style={{ padding: 20 }}>Select a person to view the family tree</div>;

  // local center state so clicks can re-center without waiting for parent
  const [centerPerson, setCenterPerson] = useState(person);
  const treeContainerRef = useRef(null);
  
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

  const buildAncestorLevels = (root, maxLevels) => {
    const levels = [];
    const visited = new Set([root.personId]);
    let current = [root];

    for (let i = 0; i < maxLevels; i++) {
      const next = [];
      current.forEach(p => {
        if (p.motherId) {
          const mom = getPersonById(p.motherId);
          if (mom && !visited.has(mom.personId)) { next.push(mom); visited.add(mom.personId); }
        }
        if (p.fatherId) {
          const dad = getPersonById(p.fatherId);
          if (dad && !visited.has(dad.personId)) { next.push(dad); visited.add(dad.personId); }
        }
      });
      if (next.length === 0) break;
      levels.push(next);
      current = next;
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
  const ancestorLevels = buildAncestorLevels(centerPerson, maxAnc);
  const descendantLevels = buildDescendantLevels(centerPerson.personId, maxDesc);

  // compute dynamic height based on actual levels used (not reserved max)
  const topPadding = 10;
  const actualAncestorLevels = ancestorLevels.length;
  const actualDescendantLevels = descendantLevels.length;
  
  // height = top padding + ancestor levels + center person + descendant levels + bottom padding
  const computedHeight = height || (topPadding + (actualAncestorLevels * levelGap) + nodeHeight + (actualDescendantLevels * levelGap) + topPadding);

  const { nodes, links } = useMemo(() => {
    if (!centerPerson) return { nodes: [], links: [] };

    const centerX = width / 2;
    // Position center person based on actual ancestor levels, not in middle of computed height
    const centerY = topPadding + (actualAncestorLevels * levelGap) + (nodeHeight / 2);

    const nodesMap = new Map();
    nodesMap.set(centerPerson.personId, { person: centerPerson, x: centerX, y: centerY });

    // place ancestor levels above center
    ancestorLevels.forEach((levelArray, idx) => {
      const level = idx + 1;
      const y = centerY - level * levelGap;
      const n = levelArray.length;
      const spacing = Math.max(100, width / (n + 1));
      levelArray.forEach((p, j) => {
        const x = spacing * (j + 1);
        nodesMap.set(p.personId, { person: p, x, y });
      });
    });

    // place descendant levels below center
    descendantLevels.forEach((levelArray, idx) => {
      const level = idx + 1;
      const y = centerY + level * levelGap;
      const n = levelArray.length;
      const spacing = Math.max(100, width / (n + 1));
      levelArray.forEach((p, j) => {
        const x = spacing * (j + 1);
        nodesMap.set(p.personId, { person: p, x, y });
      });
    });

    // links: parent -> child when both on map
    const linksArr = [];
    nodesMap.forEach((node, pid) => {
      const p = node.person;
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

    return { nodes: Array.from(nodesMap.values()), links: linksArr };
  }, [centerPerson, people, width, computedHeight, ancestorLevels, descendantLevels, actualAncestorLevels, topPadding, levelGap, nodeHeight]);

  // draw a curved link
  const renderLink = (link, i) => {
    const { from, to } = link;
    const midY = (from.y + to.y) / 2;
    const path = `M ${from.x} ${from.y} C ${from.x} ${midY} ${to.x} ${midY} ${to.x} ${to.y}`;
    return <path key={i} d={path} stroke="#999" fill="none" strokeWidth={1.2} />;
  };

  // (computedHeight already calculated above from ancestor/desc counts)

  const renderNode = (node) => {
    const { person: p, x, y } = node;
    const isCenter = centerPerson && p.personId === centerPerson.personId;
    const fillColor = (p.gender || '').toLowerCase() === 'male' ? '#e6f2ff' : ( (p.gender || '').toLowerCase() === 'female' ? '#ffe6f0' : '#fff' );
    const textColor = p.dod ? '#757575' : '#000'; // Gray for deceased instead of red
    const fontStyle = p.dod ? 'italic' : 'normal'; // Italic for deceased
    
    // Truncate name if longer than MAX_NAME_LENGTH characters
    const fullName = `${p.firstName} ${p.lastName}`;
    const displayName = fullName.length > MAX_NAME_LENGTH ? `${fullName.substring(0, ELLIPSIS_START_POS)}..` : fullName;
    
    return (
      <g key={p.personId} transform={`translate(${x - nodeWidth/2}, ${y - nodeHeight/2})`} style={{ cursor: 'pointer' }} onClick={() => { setCenterPerson(p); if (onSelect) onSelect(p); }}>
        <rect width={nodeWidth} height={nodeHeight} rx={6} fill={fillColor} stroke={isCenter ? '#1976d2' : '#eee'} strokeWidth={isCenter ? 3 : 1} />
        <text x={10} y={18} fontSize={12} fontWeight={600} fill={textColor} fontStyle={fontStyle}>
          <title>{fullName}</title>
          {displayName}
        </text>
        <text x={10} y={36} fontSize={11} fill={textColor} fontStyle={fontStyle}>{p.dob || ''}{p.dod ? ` — ${p.dod}` : ''}</text>
      </g>
    );
  };

  return (
    <div ref={treeContainerRef} style={{ width, minHeight: computedHeight, border: '1px solid #eee', background: '#fafafa' }}>
      <svg width={width} height={computedHeight} style={{ display: 'block' }}>
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
