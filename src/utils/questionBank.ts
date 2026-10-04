export interface QuestionTemplate {
  text: string;
  category: string;
  options: string[];
}

export const QUESTION_SUGGESTIONS: QuestionTemplate[] = [
  {
    text: "What is my go-to comfort food when I've had a long day?",
    category: "Food & Drinks",
    options: ["Pizza & garlic dips", "Warm bowl of Ramen / Pho", "Tacos & guacamole", "Burgers & loaded fries"],
  },
  {
    text: "What is my absolute biggest pet peeve?",
    category: "Personality",
    options: ["People walking too slowly", "Being left on 'read'", "Loud chewing or talking during movies", "Being chronically late"],
  },
  {
    text: "If I won an all-expenses-paid trip tomorrow, where am I going?",
    category: "Travel & Dreams",
    options: ["Tokyo, Japan", "Amalfi Coast, Italy", "Swiss Alps cabin", "A tropical island overwater bungalow"],
  },
  {
    text: "What is my default weekend mode?",
    category: "Lifestyle",
    options: ["Out exploring new cafes & spots", "Binge-watching shows in comfy clothes", "Hitting the gym or hiking outdoors", "Hosting a game night with friends"],
  },
  {
    text: "How do I take my morning coffee or drink?",
    category: "Food & Drinks",
    options: ["Iced oat milk latte", "Black drip coffee, strong", "Matcha or chai latte", "I don't drink coffee, water or energy drinks"],
  },
  {
    text: "Am I more of a morning lark or a chaotic night owl?",
    category: "Lifestyle",
    options: ["Up with the sunrise, productive early", "Night owl, brain activates after 11 PM", "Perpetually tired regardless of time", "Depends entirely on whether it's a weekday"],
  },
  {
    text: "What would I do first in a zombie apocalypse?",
    category: "Fun & Quirks",
    options: ["Fortify the house and hoard snacks", "Team up with friends and build weapons", "Panic immediately", "Try to negotiate with the zombies"],
  },
  {
    text: "What genre of music or playlist is on my headphones right now?",
    category: "Entertainment",
    options: ["Indie / Alternative rock", "Pop hits / Nostalgia jams", "Hip-hop & R&B", "Lofi / Electronic beats"],
  },
  {
    text: "What is my hidden talent or quirky superpower?",
    category: "Fun & Quirks",
    options: ["Remembering random trivial facts", "Finding the absolute best memes", "Falling asleep anywhere in 2 minutes", "Impeccable driving playlist curation"],
  },
  {
    text: "If I could have any fictional pet, what would it be?",
    category: "Fun & Quirks",
    options: ["Baby dragon", "Hedwig the owl", "Appa the flying bison", "Pikachu"],
  },
];
