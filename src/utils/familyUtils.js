// src/utils/familyUtils.js

// ✅ Calculate age from dob
export function calculateAge(dob, dod = null) {
  if (!dob) return null;
  const birth = new Date(dob);
  const endDate = dod ? new Date(dod) : new Date();
  let age = endDate.getFullYear() - birth.getFullYear();
  const m = endDate.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && endDate.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ✅ Get person by ID
export function getPersonById(personId, people) {
  return people.find(p => p.personId === personId) || null;
}

// ✅ Get parents (mother + father)
export function getParents(person, people) {
  const parents = [];
  if (person.motherId) {
    const mom = getPersonById(person.motherId, people);
    if (mom) parents.push(mom);
  }
  if (person.fatherId) {
    const dad = getPersonById(person.fatherId, people);
    if (dad) parents.push(dad);
  }
  return parents;
}

// ✅ Get children (all persons who list this person as mother/father)
export function getChildren(personId, people) {
  return people.filter(
    p => p.motherId === personId || p.fatherId === personId
  );
}

// ✅ Get ancestors (recursive, up N levels)
export function getAncestors(person, people, depth = 1) {
  if (!person || depth <= 0) return [];
  const parents = getParents(person, people);
  let result = [...parents];
  parents.forEach(parent => {
    result = result.concat(getAncestors(parent, people, depth - 1));
  });
  return result;
}

// ✅ Get descendants (recursive, down N levels)
export function getDescendants(personId, people, depth = 1) {
  if (!personId || depth <= 0) return [];
  const children = getChildren(personId, people);
  let result = [...children];
  children.forEach(child => {
    result = result.concat(getDescendants(child.personId, people, depth - 1));
  });
  return result;
}

// ✅ Get siblings (same parents)
export function getSiblings(person, people) {
  if (!person) return [];
  return people.filter(
    p =>
      p.personId !== person.personId &&
      (p.motherId === person.motherId || p.fatherId === person.fatherId)
  );
}

// ✅ Get spouse(s)
export function getSpouses(person, people) {
  if (!person || !person.spouses) return [];
  return person.spouses
    .map(s => getPersonById(s.spouseId, people))
    .filter(Boolean);
}
