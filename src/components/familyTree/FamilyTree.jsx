// src/components/familyTree/FamilyTree.jsx
import React, { useMemo } from "react";
import Tree from "react-d3-tree";
import { getAncestors, getDescendants } from "../../utils/familyUtils";

const FamilyTree = ({ person, people }) => {
  if (!person) return <div>Select a person to view tree</div>;

  // Build descendants recursively
  const buildDescendantNode = (p, depth = 1) => {
    if (!p) return null;
    const children = depth < 5 ? getDescendants(p.personId, people, 1) : [];
    return {
      name: `${p.firstName} ${p.lastName}`,
      attributes: { gender: p.gender, dob: p.dob || "" },
      children: children.map(c => buildDescendantNode(c, depth + 1)).filter(Boolean),
    };
  };

  // Build ancestors recursively
  const buildAncestorNode = (p, depth = 1) => {
    if (!p) return null;
    const parents = depth < 5 ? getAncestors(p, people, 1) : [];
    return {
      name: `${p.firstName} ${p.lastName}`,
      attributes: { gender: p.gender, dob: p.dob || "" },
      children: parents.map(pp => buildAncestorNode(pp, depth + 1)).filter(Boolean),
    };
  };

  // Data for descendants (downward tree)
  const descendantsData = useMemo(() => {
    return [
      {
        name: `${person.firstName} ${person.lastName}`,
        attributes: { gender: person.gender, dob: person.dob || "" },
        children: getDescendants(person.personId, people, 5).map(c =>
          buildDescendantNode(c)
        ),
      },
    ];
  }, [person, people]);

  // Data for ancestors (upward tree)
  const ancestorsData = useMemo(() => {
    return [
      {
        name: `${person.firstName} ${person.lastName}`,
        attributes: { gender: person.gender, dob: person.dob || "" },
        children: getAncestors(person, people, 5).map(p =>
          buildAncestorNode(p)
        ),
      },
    ];
  }, [person, people]);

  return (
    <div style={{ width: "100%", height: "900px", display: "flex", flexDirection: "column" }}>
      {/* Ancestors (UP) */}
      <div style={{ flex: 1, borderBottom: "1px solid gray" }}>
        <Tree
          data={ancestorsData}
          orientation="vertical"
          translate={{ x: 400, y: 400 }}
          pathFunc="diagonal"
        />
      </div>

      {/* Descendants (DOWN) */}
      <div style={{ flex: 1 }}>
        <Tree
          data={descendantsData}
          orientation="vertical"
          translate={{ x: 400, y: 50 }}
          pathFunc="diagonal"
        />
      </div>
    </div>
  );
};

export default FamilyTree;
