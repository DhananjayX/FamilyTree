// src/utils/familyUtils.js

// ✅ Calculate age from dob
export function calculateAge(dob, dod = null) {
  // normalize inputs that might be empty strings or the string 'null'
  if (!dob || (typeof dob === 'string' && dob.trim().toLowerCase() === 'null')) return null;
  if (typeof dod === 'string') {
    const t = dod.trim().toLowerCase();
    if (t === '' || t === 'null' || t === 'undefined') dod = null;
  }
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

// ✅ Get siblings (only full siblings: both mother and father match and are non-empty)
export function getSiblings(person, people) {
  if (!person) return [];
  return people.filter(p => {
    if (p.personId === person.personId) return false;
    // require both parents to be present and equal
    if (!person.motherId || !person.fatherId) return false;
    if (!p.motherId || !p.fatherId) return false;
    return p.motherId === person.motherId && p.fatherId === person.fatherId;
  });
}

// ✅ Get spouse(s)
export function getSpouses(person, people) {
  if (!person || !person.spouses) return [];
  return person.spouses
    .map(s => getPersonById(s.spouseId, people))
    .filter(Boolean);
}

// ✅ Get upcoming birthdays in the specified month (defaults to current month)
// Returns array of { personId, name, dob, day }
export function upcomingBday(people, month = null) {
  if (!Array.isArray(people)) return [];
  const now = new Date();
  const targetMonth = (month === null || month === undefined) ? now.getMonth() : (Number(month) || 0);

  const list = people
    .map(p => {
      const raw = p && p.dob;
      if (!raw || (typeof raw === 'string' && raw.trim().toLowerCase() === 'null')) return null;
      const d = new Date(raw);
      if (isNaN(d)) return null;
      return {
        personId: p.personId,
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        dob: raw,
        day: d.getDate(),
        month: d.getMonth()
      };
    })
    .filter(Boolean)
    .filter(item => item.month === targetMonth)
    .sort((a, b) => a.day - b.day)
    .map(({ personId, name, dob, day }) => ({ personId, name, dob, day }));

  return list;
}

// ✅ Get upcoming anniversaries in the specified month (defaults to current month)
// Returns array of { personIds: [id1,id2], couple, marriageDate, day }
export function upcomingAnniversary(people, month = null) {
  if (!Array.isArray(people)) return [];
  const now = new Date();
  const targetMonth = (month === null || month === undefined) ? now.getMonth() : (Number(month) || 0);

  const seenPairs = new Set();
  const list = [];

  people.forEach(p => {
    const spouses = p.spouses || [];
    spouses.forEach(s => {
      if (!s || !s.spouseId) return;
      const spouseId = s.spouseId;
      // avoid duplicate pair entries (sort ids)
      const pairKey = [p.personId, spouseId].sort().join('|');
      if (seenPairs.has(pairKey)) return;

      const raw = s.marriageDate || s.marriage || null;
      if (!raw || (typeof raw === 'string' && raw.trim().toLowerCase() === 'null')) return;
      const d = new Date(raw);
      if (isNaN(d)) return;
      if (d.getMonth() !== targetMonth) return;

      // find spouse person to build names
      const spousePerson = people.find(x => x.personId === spouseId) || null;
      const nameA = `${p.firstName || ''} ${p.lastName || ''}`.trim();
      const nameB = spousePerson ? `${spousePerson.firstName || ''} ${spousePerson.lastName || ''}`.trim() : spouseId;

      list.push({
        personIds: [p.personId, spouseId],
        couple: `${nameA} & ${nameB}`,
        marriageDate: raw,
        day: d.getDate()
      });

      seenPairs.add(pairKey);
    });
  });

  return list.sort((a, b) => a.day - b.day);
}
