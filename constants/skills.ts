// Skill Categories Constants
// Shared across the app for consistent skill/interests selection

export type SkillItem = {
  id: string;
  name: string;
};

export type SkillCategory = {
  id: string;
  name: string;
  items: SkillItem[];
};

export const skillCategories: SkillCategory[] = [
  {
    id: 'popular',
    name: 'Popular Interests',
    items: [
      { id: 'social-networking', name: '🤝 Social Networking' },
      { id: 'community', name: '👥 Community' },
      { id: 'self-improvement', name: '📘 Self-Improvement' },
    ],
  },
  {
    id: 'creativity',
    name: 'Creativity',
    items: [
      { id: 'design', name: '🎨 Design' },
      { id: 'photography', name: '📸 Photography' },
      { id: 'dancing', name: '💃 Dancing' },
      { id: 'videography', name: '📹 Videography' },
      { id: 'craft', name: '🧵 Craft' },
      { id: 'writing', name: '✍️ Writing' },
      { id: 'singing', name: '🎶 Singing' },
    ],
  },
  {
    id: 'sports',
    name: 'Sports',
    items: [
      { id: 'cricket', name: '🏏 Cricket' },
      { id: 'football', name: '⚽ Football' },
      { id: 'kabaddi', name: '🤼 Kabaddi' },
      { id: 'volleyball', name: '🏐 Volleyball' },
      { id: 'wrestling', name: '🤼‍♂️ Wrestling' },
      { id: 'chess', name: '♟️ Chess' },
      { id: 'athletics', name: '🏃‍♀️ Athletics' },
      { id: 'basketball', name: '🏀 Basketball' },
      { id: 'table-tennis', name: '🏓 Table Tennis' },
      { id: 'shooting', name: '🔫 Shooting' },
      { id: 'archery', name: '🏹 Archery' },
      { id: 'cycling', name: '🚴 Cycling' },
    ],
  },
  {
    id: 'career',
    name: 'Career & Business',
    items: [
      { id: 'govt-jobs', name: '👔 Government Jobs' },
      { id: 'private-jobs', name: '💼 Private Jobs' },
      { id: 'freelancing', name: '👩🏻‍💻 Freelancing' },
      { id: 'teaching', name: '👩‍🏫 Teaching' },
      { id: 'healthcare', name: '🏥 Healthcare' },
      { id: 'it/software', name: '💻 IT / Software' },
      { id: 'engineering', name: '👷‍♂️ Engineering' },
      { id: 'marketing-sales', name: '📢 Marketing & Sales' },
      { id: 'banking-finance', name: '🏦 Banking & Finance' },
      { id: 'agriculture', name: '🌾 Agriculture Sector' },
      { id: 'law/legal-services', name: '⚖️ Law / Legal Services' },
      { id: 'design/art', name: '🎨 Design / Art' },
      { id: 'food-business', name: '🍽️ Food Business' },
      { id: 'e-commerce', name: '🛒 E-commerce' },
      { id: 'transportation', name: '🚕 Transportation' },
      { id: 'logistics', name: '📦 Logistics' },
    ],
  },
  {
    id: 'community-env',
    name: 'Community & Environment',
    items: [
      { id: 'volunteering', name: '🫱🏻‍🫲🏽 Volunteering' },
      { id: 'youth-empowerment', name: '✊🏾 Youth Empowerment' },
      { id: 'women-rights', name: '🚺 Women\'s Rights' },
      { id: 'education-access', name: '📚 Education Access' },
      { id: 'disaster-relief', name: '🆘 Disaster Relief' },
      { id: 'support-for-seniors', name: '👴🏻 Support for Seniors' },
      { id: 'farming', name: '🌾 Farming' },
      { id: 'waste-management', name: '♻️ Waste Management' },
      { id: 'tree-plantation', name: '🌱 Tree Plantation' },
      { id: 'clean-energy', name: '🔋 Clean Energy' },
      { id: 'animal-welfare', name: '🐾 Animal Welfare' },
      { id: 'sustainable-projects', name: '◾ Sustainability Projects' },
      { id: 'water-conservation', name: '🚰 Water Conservation' },
      { id: 'roommates', name: '👨🏽‍🤝‍👨🏼 Roommates' },
    ],
  },
  {
    id: 'health',
    name: 'Health & Wellbeing',
    items: [
      { id: 'mental-health-awareness', name: '🧠 Mental Health Awareness' },
      { id: 'meditation', name: '☯ Meditation' },
      { id: 'yoga', name: '🧘 Yoga' },
      { id: 'nutrition', name: '🍎 Nutrition' },
      { id: 'fitness', name: '🏋 Fitness/Gym' },
      { id: 'healthy-eating', name: '🥗 Healthy Eating' },
      { id: 'digital-detox', name: '📵 Digital Detox' },
      { id: 'disability-support', name: '🧑‍🦽 Disability Support' },
    ],
  },
  {
    id: 'identity',
    name: 'Identity & Language',
    items: [
      { id: 'student', name: '👨‍🎓 Student' },
      { id: 'farmer', name: '👨‍🌾 Farmer' },
      { id: 'professional', name: '👩🏻‍💼 Professional' },
      { id: 'entrepreneur', name: '💼 Entrepreneur' },
      { id: 'artist/creator', name: '👨‍🎨 Artist/Creator' },
      { id: 'homemaker', name: '👷‍♂️ Homemaker' },
      { id: 'community-worker', name: '🧑‍💼 Community Worker' },
      { id: 'volunteer', name: '🫱🏻‍🫲🏽 Volunteer' },
      { id: 'activist', name: '✊ Activist' },
      { id: 'english', name: '𝗘𝗡 English' },
    ],
  },
];

// Default expanded categories for UI
export const defaultExpandedCategories = ['popular', 'creativity'];

