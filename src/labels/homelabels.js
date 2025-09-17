// Home page data configuration
const homelabels = {
  headerData: {
    title: "Family Tree",
    subtitle: "Discover and document your family's story"
  },

  welcomeData: {
    title: "Welcome to Your Family Tree",
    description: "Start building and exploring your family connections today."
  },

  featuresData: [
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Your Family Members",
      title2:"Persons",
      description: "Add and manage family members with detailed profiles",
      route: "/persons"
    },
    {
      icon: "🌳",
      title: "Your Family Trees",
      title2:"View Tree",
      description: "Visualize your family connections in an interactive tree",
      route: "/viewtree"
    },   
    {
      icon: "📅",
      title: "Timeline",
      title2:"Upcoming Events",
      description: "Track important family events and milestones",
      route: "/upcoming"
    }
  ],

  footerData: {
    text: "Discover your roots.",
    year: 2025
  }
};

export default homelabels;
