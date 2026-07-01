/** Syllabus content — condensed for web. */

export const PROGRAMS_LABEL = "Toddler & Preschool";

export const SYLLABUS_PHILOSOPHY = {
  title: "School philosophy",
  paragraphs: [
    "We provide safe, nurturing Montessori child care where children grow socially, emotionally, physically, and intellectually through hands-on learning, practical life, creativity, and character-building.",
    "Our goal is independence, curiosity, confidence, kindness, and a lifelong love of learning.",
  ],
};

export const SYLLABUS_TOC = [
  { id: "syllabus-schedule", label: "Daily schedule" },
  { id: "syllabus-philosophy", label: "School philosophy" },
  { id: "syllabus-toddler", label: "Toddler program" },
  { id: "syllabus-preschool", label: "Preschool program" },
  { id: "syllabus-assessment", label: "Assessment" },
  { id: "syllabus-offerings", label: "School offerings" },
  { id: "syllabus-families", label: "Families provide" },
  { id: "syllabus-values", label: "Program values" },
];

export const SYLLABUS_TODDLER = {
  id: "syllabus-toddler",
  title: "Toddler program",
  age: "Ages 16 months – 33 months",
  goalsIntro: "Program focus:",
  goals: [
    "Independence and daily routines",
    "Language and communication",
    "Social-emotional skills",
    "Sensory and motor development",
  ],
  areasTitle: "Learning areas",
  areas: [
    {
      title: "Practical life",
      items: ["Hand washing & self-care", "Pouring & carrying", "Dressing & snack help", "Grace & courtesy"],
    },
    {
      title: "Language",
      items: ["Stories & songs", "Naming & conversation", "Picture matching", "Early letter sounds"],
    },
    {
      title: "Sensorial & motor",
      items: ["Texture & sorting", "Fine motor trays", "Outdoor movement", "Music & creative play"],
    },
    {
      title: "Social-emotional",
      items: ["Circle time", "Turn-taking", "Cooperative play", "Emotional expression"],
    },
  ],
};

export const SYLLABUS_PRESCHOOL = {
  id: "syllabus-preschool",
  title: "Preschool program",
  age: "Ages 33 months – 6 years",
  goalsIntro: "Program focus:",
  goals: [
    "Early literacy and math readiness",
    "Independence and concentration",
    "Science, culture, and discovery",
    "Social skills for kindergarten readiness",
  ],
  areasTitle: "Learning areas",
  areas: [
    {
      title: "Practical life & literacy",
      items: [
        "Classroom routines & care of environment",
        "Letter sounds, phonics & pre-writing",
        "Stories, vocabulary & listening",
      ],
    },
    {
      title: "Math & science",
      items: [
        "Counting, patterns & number sense",
        "Shapes, measurement & sequencing",
        "Nature, seasons & simple experiments",
      ],
    },
    {
      title: "Culture & creativity",
      items: [
        "Maps, community & traditions",
        "Art, music & dramatic play",
        "Outdoor play & physical skills",
      ],
    },
    {
      title: "Social-emotional",
      items: [
        "Friendship & cooperation",
        "Self-regulation & group participation",
        "Respect, empathy & confidence",
      ],
    },
  ],
};

export const SYLLABUS_SCHEDULE = {
  id: "syllabus-schedule",
  title: "Daily schedule (6:30 AM – 6:00 PM)",
  programs: [
    {
      name: "Toddler program",
      items: [
        "Arrival & greeting",
        "Breakfast",
        "Free exploration & circle time",
        "Practical life & outdoor play",
        "Lunch & nap / quiet time",
        "Afternoon snack, stories & activities",
        "Departure",
      ],
    },
    {
      name: "Preschool program",
      items: [
        "Arrival & greeting",
        "Breakfast",
        "Montessori work cycle",
        "Literacy, math & outdoor play",
        "Lunch & rest / quiet time",
        "Science, art & group activities",
        "Departure",
      ],
    },
  ],
};

export const SYLLABUS_ASSESSMENT = {
  id: "syllabus-assessment",
  title: "Assessment & communication",
  intro: "Teachers track growth through:",
  items: [
    "Daily observations",
    "Progress notes",
    "Parent communication",
    "Conferences & developmental updates",
  ],
};

export const SYLLABUS_OFFERINGS = {
  id: "syllabus-offerings",
  title: "School offerings",
  intro: "Our program includes:",
  includedTitle: null,
  included: [
    "Montessori child care for Toddler & Preschool",
    "Hands-on literacy, math & practical life",
    "Art, music, movement & outdoor play",
    "Social-emotional learning",
    "Healthy morning and afternoon snacks",
    "Parent updates & conferences",
  ],
  commitment: {
    title: "Our commitment",
    paragraphs: [
      "We partner with families so each child feels safe, valued, and ready to learn.",
    ],
  },
};

export const SYLLABUS_FAMILIES = {
  id: "syllabus-families",
  title: "What families provide",
  intro: "Please note:",
  sections: [
    {
      title: "Transportation",
      items: ["Families provide drop-off and pick-up (no school bus service)."],
    },
    {
      title: "Lunch",
      items: ["The school provides healthy morning and afternoon snacks."],
    },
    {
      title: "Personal items",
      items: [
        "Extra clothes & weather-appropriate outdoor gear",
        "Diapers/wipes (as needed), labeled water bottle",
        "Nap blanket",
      ],
    },
  ],
};

export const SYLLABUS_VALUES = {
  id: "syllabus-values",
  title: "Program values",
  intro: "We encourage:",
  items: [
    "Respect & kindness",
    "Independence & responsibility",
    "Curiosity & confidence",
    "Cooperation & creativity",
    "Love of learning",
  ],
  closing: "Every child is supported to grow with joy and purpose.",
};
