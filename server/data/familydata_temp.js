// Sample family data structure
// This file will contain sample data and data models for the Family Tree application

const sampleFamilyData = {
  members: [
    {
      id: 1,
      name: "John Doe",
      birthDate: "1950-01-15",
      relation: "grandfather",
      spouse: "Jane Doe",
      children: [2, 3]
    },
    {
      id: 2,
      name: "Michael Doe",
      birthDate: "1975-06-20",
      relation: "father",
      spouse: "Sarah Doe",
      children: [4, 5],
      parents: [1]
    },
    {
      id: 3,
      name: "Lisa Smith",
      birthDate: "1978-03-12",
      relation: "aunt",
      spouse: "David Smith",
      children: [6],
      parents: [1]
    },
    {
      id: 4,
      name: "Alex Doe",
      birthDate: "2000-09-08",
      relation: "child",
      parents: [2]
    },
    {
      id: 5,
      name: "Emma Doe",
      birthDate: "2003-12-25",
      relation: "child",
      parents: [2]
    },
    {
      id: 6,
      name: "Ryan Smith",
      birthDate: "2005-07-14",
      relation: "cousin",
      parents: [3]
    }
  ]
};

module.exports = {
  sampleFamilyData
};
