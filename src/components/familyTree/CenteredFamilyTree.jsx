// src/components/familyTree/CenteredFamilyTree.jsx
import React, { useMemo, useState, useEffect } from "react";
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
  useEffect(() => {
    setCenterPerson(person);
  }, [person]);

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
  const ancestorLevels = buildAncestorLevels(centerPerson, maxAnc);
  const descendantLevels = buildDescendantLevels(centerPerson.personId, maxDesc);

  // compute dynamic height based on reserved max levels (if `height` prop not provided)
  const base = 400;
  // reserve space for maxAnc above and maxDesc below so up to 6 generations are visible
  const computedHeight = height || Math.max(base + (maxAnc * levelGap) + (maxDesc * levelGap), 900);

  const { nodes, links } = useMemo(() => {
    if (!centerPerson) return { nodes: [], links: [] };

    const centerX = width / 2;
    const centerY = computedHeight / 2;

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
  }, [centerPerson, people, width, computedHeight, ancestorLevels, descendantLevels]);

  // draw a curved link
  const renderLink = (link, i) => {
    const { from, to } = link;
    const midY = (from.y + to.y) / 2;
    const path = `M ${from.x} ${from.y} C ${from.x} ${midY} ${to.x} ${midY} ${to.x} ${to.y}`;
    return <path key={i} d={path} stroke="#999" fill="none" strokeWidth={1.2} />;
  };

  const nodeWidth = 140;
  const nodeHeight = 48;

  // (computedHeight already calculated above from ancestor/desc counts)

  const renderNode = (node) => {
    const { person: p, x, y } = node;
    const isCenter = centerPerson && p.personId === centerPerson.personId;
    const fillColor = (p.gender || '').toLowerCase() === 'male' ? '#e6f2ff' : ( (p.gender || '').toLowerCase() === 'female' ? '#ffe6f0' : '#fff' );
    const textColor = p.dod ? 'red' : '#000';
    return (
      <g key={p.personId} transform={`translate(${x - nodeWidth/2}, ${y - nodeHeight/2})`} style={{ cursor: 'pointer' }} onClick={() => { setCenterPerson(p); if (onSelect) onSelect(p); }}>
        <rect width={nodeWidth} height={nodeHeight} rx={6} fill={fillColor} stroke={isCenter ? '#f59e0b' : '#3b82f6'} strokeWidth={isCenter ? 2 : 1} />
        <text x={10} y={18} fontSize={12} fontWeight={600} fill={textColor}>{p.firstName} {p.lastName}</text>
        <text x={10} y={36} fontSize={11} fill={textColor}>{p.dob || ''}{p.dod ? ` — ${p.dod}` : ''}</text>
      </g>
    );
  };

  return (
    <div style={{ width, height: computedHeight, overflow: 'auto', border: '1px solid #eee', background: '#fafafa' }}>
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
