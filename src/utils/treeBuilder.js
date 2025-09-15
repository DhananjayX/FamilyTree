export function buildFamilyTree(persons, marriages, rootId) {
  const personMap = new Map(persons.map(p => [p.personId, { ...p, children: [] }]));
  marriages.forEach(marriage => {
    marriage.children.forEach(childId => {
      const child = personMap.get(childId);
      if(child){
        const father = personMap.get(marriage.spouse1Id);
        const mother = personMap.get(marriage.spouse2Id);
        if(father) father.children.push(child);
        if(mother) mother.children.push(child);
      }
    });
  });
  return personMap.get(rootId);
}
