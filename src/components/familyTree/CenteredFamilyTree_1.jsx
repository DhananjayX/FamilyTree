import React, { useMemo } from "react";

/*
  CenteredFamilyTree
  Props:
    - person: the selected person object (must have personId)
    - people: array of all people
    - width, height: svg canvas size
    - maxAncestors / maxDescendants: how many levels up/down to render
    - nodeWidth/nodeHeight: box size
    - levelGap: vertical spacing between levels
    - onNodeClick(personId) optional
*/
function CenteredFamilyTree({
  person,
  people,
  width = 1000,
  height = 800,
  maxAncestors = 4,
  maxDescendants = 5,
  nodeWidth = 140,
  nodeHeight = 48,
  levelGap = 110,
  onNodeClick = () => {}
}) {
  // helpers
  const getPersonById = (id) => people.find(p => p.personId === id) || null;

  // build ancestor levels: level 1 = parents, level 2 = grandparents...
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
    return levels; // array of arrays [ [parents], [grandparents], ... ]
  };

  // build descendant levels: level 1 = children, level 2 = grandchildren...
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
    return levels; // [ [children], [grandchildren], ... ]
  };

  const { nodes, links } = useMemo(() => {
    if (!person) return { nodes: [], links: [] };

    const centerX = width / 2;
    const centerY = height / 2;

    const ancestorLevels = buildAncestorLevels(person, maxAncestors);
    const descendantLevels = buildDescendantLevels(person.personId, maxDescendants);

    // nodesMap: personId -> { person, x, y }
    const nodesMap = new Map();

    // root node (center)
    nodesMap.set(person.personId, {
      person,
      x: centerX,
      y: centerY
    });

    // place ancestor levels above center
    ancestorLevels.forEach((levelArray, idx) => {
      const level = idx + 1;
      const y = centerY - level * levelGap;
      const n = levelArray.length;
      const spacing = Math.max(80, width / (n + 1));
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
      const spacing = Math.max(80, width / (n + 1));
      levelArray.forEach((p, j) => {
        const x = spacing * (j + 1);
        nodesMap.set(p.personId, { person: p, x, y });
      });
    });

    // Build links: for any node that has motherId/fatherId that exists in nodesMap, draw link from parent -> child
    const linksArr = [];
    nodesMap.forEach((node, pid) => {
      const p = node.person;
      const parentIds = [];
      if (p.motherId) parentIds.push(p.motherId);
      if (p.fatherId) parentIds.push(p.fatherId);
      parentIds.forEach(parentId => {
        if (nodesMap.has(parentId)) {
          const parentNode = nodesMap.get(parentId);
          linksArr.push({
            from: { x: parentNode.x, y: parentNode.y },
            to: { x: node.x, y: node.y },
            parentId,
            childId: pid
          });
        }
      });
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links: linksArr
    };
  }, [person, people, width, height, maxAncestors, maxDescendants, levelGap]);

  // debug logging to help local devs inspect the constructed graph
  if (typeof console !== 'undefined' && person) {
    console.debug('CenteredFamilyTree: selectedPersonId=', person.personId, 'nodes=', nodes.length, 'links=', links.length);
  }

  // Render SVG
  // small helper to draw a line with slight curve (quadratic)
  const renderLink = (link, i) => {
    const { from, to } = link;
    // create a simple cubic or quadratic curve: mid point
    const dx = 0;
    const midY = (from.y + to.y) / 2;
    const path = `M ${from.x} ${from.y + nodeHeight / 2} 
                  C ${from.x} ${midY} ${to.x} ${midY} ${to.x} ${to.y - nodeHeight / 2}`;
    return <path key={i} d={path} stroke="#999" fill="none" strokeWidth={1.2} />;
  };

  const renderNode = (node) => {
    const { person, x, y } = node;
    const boxW = nodeWidth;
    const boxH = nodeHeight;
    const rx = 6;

    return (
      <g key={person.personId} transform={`translate(${x - boxW / 2}, ${y - boxH / 2})`} style={{ cursor: "pointer" }}
         onClick={() => onNodeClick(person.personId)}>
        <rect width={boxW} height={boxH} rx={rx} fill="#fff" stroke="#3b82f6" strokeWidth={1.2} />
        <text x={8} y={18} fontSize={12} fontWeight="600">{person.firstName} {person.lastName}</text>
        <text x={8} y={36} fontSize={11} fill="#555">{person.dob || ""} {person.dod ? `— ${person.dod}` : ""}</text>
      </g>
    );
  };

  // if nothing to show
  if (!person) return <div style={{ padding: 20 }}>Select a person to view the family tree</div>;

  return (
    <div style={{ width, height, overflow: "auto", border: "1px solid #eee", background: "#fafafa" }}>
      <svg width={width} height={height} style={{ display: "block" }}>
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.08"/>
          </filter>
        </defs>

        {/* links */}
        <g>{links.map((l, i) => renderLink(l, i))}</g>

        {/* nodes */}
        <g>{nodes.map(n => renderNode(n))}</g>
      </svg>
    </div>
  );
}

export default CenteredFamilyTree;
