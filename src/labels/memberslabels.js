// Members Component Labels
const memberslabels = {
  header: {
    title: "Family Tree Members",
    treeInfo: (treeId, count) => `Tree ID: ${treeId} • ${count} members`
  },
  buttons: {
    addMember: "+ Add Member",
    cancel: "Cancel",
    submit: "Add Member",
    retry: "Try Again"
  },
  form: {
    title: "Add New Member",
    placeholders: {
      firstName: "First Name",
      lastName: "Last Name",
      gender: "Select Gender",
      birthDate: "Birth Date",
      location: "Location",
      occupation: "Occupation"
    },
    genderOptions: {
      male: "Male",
      female: "Female"
    }
  },
  controls: {
    search: "Search members...",
    filters: {
      allGenders: "All Genders",
      male: "Male",
      female: "Female"
    },
    sorting: {
      name: "Sort by Name",
      age: "Sort by Age",
      gender: "Sort by Gender"
    }
  },
  messages: {
    loading: "Loading family members...",
    errorTitle: "Error Loading Members",
    noMembers: "No members found matching your criteria.",
    stats: (shown, total) => `Showing ${shown} of ${total} members`
  },
  memberDetails: {
    age: "Age:",
    birthDate: "Birth Date:",
    deathDate: "Death Date:",
    location: "Location:",
    occupation: "Occupation:",
    id: "ID:",
    relationships: {
      father: "👨 Father",
      mother: "👩 Mother",
      married: "💑 Married",
      children: (count) => `👶 ${count} Children`
    }
  }
};

export default memberslabels;
