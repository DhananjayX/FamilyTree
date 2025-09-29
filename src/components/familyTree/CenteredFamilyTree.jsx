// src/components/familyTree/CenteredFamilyTree.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { getAncestors, getDescendants } from "../../utils/familyUtils";
import './CenteredFamilyTree.css';

/*
  Manual SVG-centered family tree
  - Renders the selected `person` at center
  - Ancestors appear above (levels: parents, grandparents, ...)
  - Descendants appear below (children, grandchildren, ...)
  - No wrapper nodes labeled "Ancestors" or "Descendants"
  - Props: { person, people, width=1000, height=800, onSelect, onViewPerson }
*/
function CenteredFamilyTree({ person, people, width = 1000, height = null, onSelect = () => {}, onViewPerson = () => {} }) {
  if (!person) return <div className="no-person-message">Select a person to view the family tree</div>;

  // local center state so clicks can re-center without waiting for parent
  const [centerPerson, setCenterPerson] = useState(person);
  const treeContainerRef = useRef(null);
  
  // Tree view type state - persist in localStorage
  const [treeViewType, setTreeViewType] = useState(() => {
    try {
      return localStorage.getItem('familyTree_viewType') || 'normal';
    } catch (error) {
      console.warn('Failed to read viewType from localStorage:', error);
      return 'normal';
    }
  }); // 'normal' or 'siblings'
  
  // Save tree view type to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('familyTree_viewType', treeViewType);
    } catch (error) {
      console.warn('Failed to save viewType to localStorage:', error);
    }
  }, [treeViewType]);
  
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

  const getSpousesForPerson = (person) => {
    // Find people who have children with this person (are co-parents)
    const spouses = [];
    
    // Find all children of this person
    const children = people.filter(p => 
      p.motherId === person.personId || p.fatherId === person.personId
    );
    
    // For each child, find the other parent (spouse)
    children.forEach(child => {
      const otherParentId = child.motherId === person.personId ? child.fatherId : child.motherId;
      if (otherParentId && !spouses.some(s => s.personId === otherParentId)) {
        const spouse = getPersonById(otherParentId);
        if (spouse) {
          spouses.push(spouse);
        }
      }
    });
    
    return spouses;
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
      const levelPeople = [];
      
      currentIds.forEach(id => {
        people.forEach(p => {
          if (!visited.has(p.personId) && (p.motherId === id || p.fatherId === id)) {
            levelPeople.push(p);
            visited.add(p.personId);
          }
        });
      });

      // If in siblings mode, add spouses for descendants
      if (treeViewType === 'siblings') {
        const levelWithSpouses = [];
        levelPeople.forEach(person => {
          const spouses = getSpousesForPerson(person).filter(s => !visited.has(s.personId));
          spouses.forEach(spouse => {
            visited.add(spouse.personId);
          });
          
          // Position spouses based on the main person's gender (opposite side of siblings)
          const mainPersonGender = (person.gender || '').toLowerCase();
          
          if (mainPersonGender === 'female') {
            // Female person: show main person first, then spouses on right
            levelWithSpouses.push({ ...person, isSpouse: false, mainPerson: person.personId });
            levelWithSpouses.push(...spouses.map(s => ({ ...s, isSpouse: true, mainPerson: person.personId, spousePosition: 'right' })));
          } else {
            // Male person (or unknown gender): show spouses on left, then main person
            levelWithSpouses.push(...spouses.map(s => ({ ...s, isSpouse: true, mainPerson: person.personId, spousePosition: 'left' })));
            levelWithSpouses.push({ ...person, isSpouse: false, mainPerson: person.personId });
          }
        });
        next.push(...levelWithSpouses);
      } else {
        next.push(...levelPeople.map(p => ({ ...p, isSpouse: false })));
      }
      
      if (next.length === 0) break;
      levels.push(next);
      currentIds = levelPeople.map(p => p.personId); // Use original level people for next iteration
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
  const descendantLevels = useMemo(() => buildDescendantLevels(centerPerson.personId, maxDesc), [centerPerson, treeViewType, people, maxDesc]);

  // compute dynamic height based on actual levels used (not reserved max)
  const topPadding = 10;
  const actualAncestorLevels = ancestorLevels.length;
  const actualDescendantLevels = descendantLevels.length;
  
  // height = top padding + ancestor levels + center person + descendant levels + bottom padding
  const computedHeight = height || (topPadding + (actualAncestorLevels * levelGap) + nodeHeight + (actualDescendantLevels * levelGap) + topPadding);

  const { nodes, links, treeWidth } = useMemo(() => {
    if (!centerPerson) return { nodes: [], links: [], treeWidth: width };

    // Create center level with siblings and spouses if in siblings mode
    let centerLevel = [centerPerson];
    if (treeViewType === 'siblings') {
      const centerSiblings = getSiblingsForPerson(centerPerson);
      const centerSpouses = getSpousesForPerson(centerPerson);
      const mainPersonGender = (centerPerson.gender || '').toLowerCase();
      
      if (mainPersonGender === 'female') {
        // Female person: show all siblings on left side, then main person, then spouses on right
        centerLevel = [
          ...centerSiblings.map(s => ({ ...s, isSibling: true, mainPerson: centerPerson.personId, siblingPosition: 'left' })),
          { ...centerPerson, isSibling: false, mainPerson: centerPerson.personId },
          ...centerSpouses.map(s => ({ ...s, isSpouse: true, mainPerson: centerPerson.personId, spousePosition: 'right' }))
        ];
      } else {
        // Male person (or unknown gender): show spouses on left, then main person, then siblings on right
        centerLevel = [
          ...centerSpouses.map(s => ({ ...s, isSpouse: true, mainPerson: centerPerson.personId, spousePosition: 'left' })),
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
    
    let maxLevelWidth;
    if (treeViewType === 'siblings') {
      // Calculate width based on grouped positioning for siblings mode
      maxLevelWidth = Math.max(...allLevels.map(levelArray => {
        if (levelArray.length === 0) return 0;
        
        // Group by mainPerson to calculate actual grouped width
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
        groups.forEach(group => {
          let groupWidth = 0;
          group.forEach((p, j) => {
            groupWidth += nodeWidth;
            if (j < group.length - 1) {
              const nextPerson = group[j + 1];
              // No gap between spouses, 10px gap between others
              if (p.isSpouse || nextPerson.isSpouse) {
                groupWidth += 0; // Touching blocks for spouses
              } else {
                groupWidth += 10; // 10px gap for siblings
              }
            }
          });
          totalRequiredWidth += groupWidth;
        });
        
        // Add gaps between groups (60px each)
        const numGaps = groups.size - 1;
        totalRequiredWidth += numGaps * 60;
        
        // Add padding on both sides
        return totalRequiredWidth + 100; // 50px padding on each side
      }));
    } else {
      // Normal width calculation for regular view
      const minMargin = 20;
      maxLevelWidth = Math.max(...allLevels.map(levelArray => {
        const n = levelArray.length;
        const totalNodeWidth = n * nodeWidth;
        const totalMarginWidth = (n - 1) * minMargin;
        return totalNodeWidth + totalMarginWidth + (2 * minMargin); // add padding on sides
      }));
    }
    
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
      // Center person with siblings/spouses (siblings mode) - position with appropriate spacing
      let currentX = 0;
      let totalWidth = 0;
      
      // Calculate total width with appropriate spacing
      centerLevel.forEach((p, j) => {
        totalWidth += nodeWidth;
        if (j < centerLevel.length - 1) {
          const nextPerson = centerLevel[j + 1];
          // No gap between spouses, 10px gap between others
          if (p.isSpouse || nextPerson.isSpouse) {
            totalWidth += 0; // Touching blocks for spouses
          } else {
            totalWidth += 10; // 10px gap for siblings
          }
        }
      });
      
      const groupStartX = centerX - (totalWidth / 2);
      currentX = groupStartX;
      
      centerLevel.forEach((p, j) => {
        const x = currentX + (nodeWidth / 2);
        nodesMap.set(p.personId, { person: p, x, y: centerY });
        
        currentX += nodeWidth;
        if (j < centerLevel.length - 1) {
          const nextPerson = centerLevel[j + 1];
          // No gap between spouses, 10px gap between others
          if (p.isSpouse || nextPerson.isSpouse) {
            currentX += 0; // Touching blocks for spouses
          } else {
            currentX += 10; // 10px gap for siblings
          }
        }
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
          let groupWidth = 0;
          group.forEach((p, j) => {
            groupWidth += nodeWidth;
            if (j < group.length - 1) {
              // Ancestors are siblings, so keep 10px gap
              groupWidth += 10; // 10px gap for siblings
            }
          });
          groupWidths.push(groupWidth);
          totalRequiredWidth += groupWidth;
        });
        
        // Add gaps between groups (60px each)
        const numGaps = groups.size - 1;
        totalRequiredWidth += numGaps * 60;
        
        // Start from center and work outward, but ensure minimum left padding
        const idealStartX = centerX - (totalRequiredWidth / 2);
        const minLeftPadding = 50; // Minimum 50px from left edge
        let currentX = Math.max(idealStartX, minLeftPadding);
        
        let groupIndex = 0;
        groups.forEach(group => {
          let groupCurrentX = currentX;
          
          group.forEach((p, j) => {
            const x = groupCurrentX + (nodeWidth / 2);
            nodesMap.set(p.personId, { person: p, x, y });
            
            groupCurrentX += nodeWidth;
            if (j < group.length - 1) {
              // Ancestors are siblings, so keep 10px gap
              groupCurrentX += 10; // 10px gap for siblings
            }
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
      
      if (treeViewType === 'siblings') {
        // Group spouses closer to their main person, similar to sibling logic
        
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
          let groupWidth = 0;
          group.forEach((p, j) => {
            groupWidth += nodeWidth;
            if (j < group.length - 1) {
              const nextPerson = group[j + 1];
              // No gap between spouses, 10px gap between others
              if (p.isSpouse || nextPerson.isSpouse) {
                groupWidth += 0; // Touching blocks for spouses
              } else {
                groupWidth += 10; // 10px gap for siblings
              }
            }
          });
          groupWidths.push(groupWidth);
          totalRequiredWidth += groupWidth;
        });
        
        // Add gaps between groups (60px each)
        const numGaps = groups.size - 1;
        totalRequiredWidth += numGaps * 60;
        
        // Start from center and work outward, but ensure minimum left padding
        const idealStartX = centerX - (totalRequiredWidth / 2);
        const minLeftPadding = 50; // Minimum 50px from left edge
        let currentX = Math.max(idealStartX, minLeftPadding);
        
        let groupIndex = 0;
        groups.forEach(group => {
          let groupCurrentX = currentX;
          
          group.forEach((p, j) => {
            const x = groupCurrentX + (nodeWidth / 2);
            nodesMap.set(p.personId, { person: p, x, y });
            
            groupCurrentX += nodeWidth;
            if (j < group.length - 1) {
              const nextPerson = group[j + 1];
              // No gap between spouses, 10px gap between others
              if (p.isSpouse || nextPerson.isSpouse) {
                groupCurrentX += 0; // Touching blocks for spouses
              } else {
                groupCurrentX += 10; // 10px gap for siblings
              }
            }
          });
          
          currentX += groupWidths[groupIndex] + 60; // Move to next group position
          groupIndex++;
        });
      } else {
        // Normal spacing for regular descendant view
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

    // links: parent -> child when both on map, but exclude siblings
    const linksArr = [];
    nodesMap.forEach((node, pid) => {
      const p = node.person;
      
      // Skip creating parent links for siblings and spouses
      if (p.isSibling || p.isSpouse) return;
      
      const parentIds = [];
      if (p.motherId) parentIds.push(p.motherId);
      if (p.fatherId) parentIds.push(p.fatherId);
      parentIds.forEach(parentId => {
        if (nodesMap.has(parentId)) {
          const parentNode = nodesMap.get(parentId);
          // Only create links to non-spouse parent nodes
          if (!parentNode.person.isSpouse) {
            linksArr.push({ from: { x: parentNode.x, y: parentNode.y }, to: { x: node.x, y: node.y }, parentId, childId: pid });
          }
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
              
              // Don't draw connection lines between spouses (they should be touching blocks)
              const isSpouseConnection = fromNode.person.isSpouse || toNode.person.isSpouse;
              
              if (!isSpouseConnection) {
                linksArr.push({ 
                  from: { x: fromNode.x, y: fromNode.y }, 
                  to: { x: toNode.x, y: toNode.y }, 
                  isSiblingConnection: true 
                });
              }
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
      return <path key={i} d={path} className="family-link sibling" />;
    } else {
      // Draw curved line for parent-child connections
      const midY = (from.y + to.y) / 2;
      const path = `M ${from.x} ${from.y} C ${from.x} ${midY} ${to.x} ${midY} ${to.x} ${to.y}`;
      return <path key={i} d={path} className="family-link parent-child" />;
    }
  };

  // Helper function to get CSS classes for person background colors
  const getPersonFillClass = (person, isSibling, isSpouse, isDeceased) => {
    const gender = (person.gender || '').toLowerCase();
    const genderPrefix = gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'unknown';
    
    if (isDeceased) {
      return `fill-${genderPrefix}-deceased-${isSibling ? 'sibling' : isSpouse ? 'spouse' : 'mainline'}`;
    } else {
      return `fill-${genderPrefix}-${isSibling ? 'sibling' : isSpouse ? 'spouse' : 'mainline'}`;
    }
  };

  // (computedHeight already calculated above from ancestor/desc counts)

  const renderNode = (node) => {
    const { person: p, x, y } = node;
    const isCenter = centerPerson && p.personId === centerPerson.personId;
    const isSibling = p.isSibling;
    const isSpouse = p.isSpouse;
    const isDeceased = !!p.dod;
    
    // Get CSS classes for styling
    const fillClass = getPersonFillClass(p, isSibling, isSpouse, isDeceased);
    
    // Determine person type for CSS classes
    let personType = 'mainline';
    if (isSibling) personType = 'sibling';
    else if (isSpouse) personType = 'spouse';
    else if (isDeceased) personType = 'deceased';
    
    // Truncate name if longer than MAX_NAME_LENGTH characters
    const fullName = `${p.firstName} ${p.lastName}`;
    const displayName = fullName.length > MAX_NAME_LENGTH ? `${fullName.substring(0, ELLIPSIS_START_POS)}..` : fullName;
    
    return (
      <g key={p.personId} transform={`translate(${x - nodeWidth/2}, ${y - nodeHeight/2})`} className="person-node" onClick={() => { setCenterPerson(p); if (onSelect) onSelect(p); }}>
        <rect 
          width={nodeWidth} 
          height={nodeHeight} 
          className={`person-rect ${fillClass} ${isSpouse ? 'spouse' : isDeceased ? 'deceased' : 'regular'} ${isCenter ? 'selected' : isSibling ? 'sibling' : isSpouse ? 'normal' : isDeceased ? 'normal' : 'mainline'}`}
        />
        <text x={10} y={18} className={`person-name ${personType}`}>
          <title>{fullName}{isSibling ? ' (Sibling)' : isSpouse ? ' (Spouse)' : ''}</title>
          {displayName}
        </text>
        <text x={10} y={36} className={`person-dates ${personType}`}>{p.dob || ''}{p.dod ? ` — ${p.dod}` : ''}</text>
        {isSpouse && (
          <text x={nodeWidth - 15} y={15} className="spouse-icon">
            ♥
          </text>
        )}
        {isDeceased && (
          <text x={nodeWidth - 15} y={15} className="deceased-icon">
            🙏
          </text>
        )}

        {isCenter && (
          <g 
            transform={`translate(${nodeWidth - 25}, 5)`} 
            className="view-person-button"
            onClick={(e) => { e.stopPropagation(); onViewPerson(p); }}
          >
            <circle cx={10} cy={10} r={10} className="view-button-circle" />
            <svg x={4} y={4} width={12} height={12} viewBox="0 0 24 24" className="view-button-icon">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <title>View Details</title>
          </g>
        )}
      </g>
    );
  };

  return (
    <div ref={treeContainerRef} className="centered-family-tree" style={{ minHeight: computedHeight }}>
      {/* Tree View Type Toolbar */}
      <div className="tree-view-toolbar">
        <span className="toolbar-label">Tree View:</span>
        <div className="toolbar-buttons">
          <button
            onClick={() => setTreeViewType('normal')}
            className={`toolbar-button normal ${treeViewType === 'normal' ? 'active' : 'inactive'}`}
          >
            Basic
          </button>
          <button
            onClick={() => setTreeViewType('siblings')}
            className={`toolbar-button siblings ${treeViewType === 'siblings' ? 'active' : 'inactive'}`}
          >
            Advance
          </button>
        </div>
      </div>
      
      <svg width={treeWidth} height={computedHeight} className="family-tree-svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.08"/>
          </filter>
          <linearGradient id="memorialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.8 }} />
            <stop offset="50%" style={{ stopColor: '#f0f0f0', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#e0e0e0', stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>

        <g>{links.map((l, i) => renderLink(l, i))}</g>
        <g>{nodes.map(n => renderNode(n))}</g>
      </svg>
    </div>
  );
}

export default CenteredFamilyTree;
