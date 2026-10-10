export type MultipleChoiceQuestion = {
  question: string;
  answer: string;
  distractors: readonly [string, string, string];
  explanation: string;
};

export const MULTIPLE_CHOICE_BANK: readonly MultipleChoiceQuestion[] = [
  {
    question: 'Which planet is closest to the Sun?',
    answer: 'Mercury',
    distractors: ['Venus', 'Earth', 'Mars'],
    explanation: 'Mercury orbits the Sun closer than any other planet.',
  },
  {
    question: 'How many legs does a spider have?',
    answer: '8',
    distractors: ['6', '10', '12'],
    explanation: 'Spiders are arachnids with eight legs. Insects have six.',
  },
  {
    question: 'Which is the largest ocean on Earth?',
    answer: 'Pacific Ocean',
    distractors: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'],
    explanation: 'The Pacific covers about a third of the whole planet.',
  },
  {
    question: 'Which gas do plants take in for photosynthesis?',
    answer: 'Carbon dioxide',
    distractors: ['Oxygen', 'Nitrogen', 'Helium'],
    explanation:
      'Plants use sunlight to turn carbon dioxide and water into sugar and oxygen.',
  },
  {
    question: 'What is the hardest natural material?',
    answer: 'Diamond',
    distractors: ['Gold', 'Iron', 'Quartz'],
    explanation:
      'Diamond is made of tightly bonded carbon atoms and tops the hardness scale.',
  },
  {
    question: 'In the most common model, how many continents are there?',
    answer: '7',
    distractors: ['5', '6', '8'],
    explanation:
      'Africa, Antarctica, Asia, Australia, Europe, North America and South America.',
  },
  {
    question: 'Which animal is the tallest in the world?',
    answer: 'Giraffe',
    distractors: ['Elephant', 'Ostrich', 'Camel'],
    explanation: 'An adult giraffe can stand about 5 metres (16 feet) tall.',
  },
  {
    question: 'What is the capital city of Japan?',
    answer: 'Tokyo',
    distractors: ['Kyoto', 'Osaka', 'Seoul'],
    explanation: 'Tokyo is both the capital and the largest city of Japan.',
  },
  {
    question: 'How many sides does a hexagon have?',
    answer: '6',
    distractors: ['5', '7', '8'],
    explanation: 'Hex means six. Honeycomb cells are hexagons.',
  },
  {
    question: 'Which colour do you get by mixing blue and yellow paint?',
    answer: 'Green',
    distractors: ['Purple', 'Orange', 'Brown'],
    explanation:
      'Blue and yellow are both primary colours, and together make green.',
  },
  {
    question: 'Bees collect which sweet liquid from flowers to make honey?',
    answer: 'Nectar',
    distractors: ['Sap', 'Dew', 'Syrup'],
    explanation: 'Bees carry nectar to the hive and turn it into honey.',
  },
  {
    question: 'Which is the largest animal on Earth?',
    answer: 'Blue whale',
    distractors: ['African elephant', 'Giraffe', 'Hippopotamus'],
    explanation: 'Blue whales can grow longer than 25 metres (80 feet).',
  },
  {
    question: 'How many days are in a leap year?',
    answer: '366',
    distractors: ['365', '364', '367'],
    explanation: 'A leap year adds an extra day, 29 February.',
  },
  {
    question: 'At what temperature does water freeze, in degrees Celsius?',
    answer: '0 °C',
    distractors: ['32 °C', '-10 °C', '100 °C'],
    explanation:
      'Water freezes at 0 °C, which is 32 °F. The 32 is the Fahrenheit number.',
  },
  {
    question: 'Which organ pumps blood around the body?',
    answer: 'Heart',
    distractors: ['Lungs', 'Liver', 'Kidney'],
    explanation: 'The heart beats around 100,000 times every day.',
  },
  {
    question: 'What is the smallest prime number?',
    answer: '2',
    distractors: ['0', '1', '3'],
    explanation:
      'A prime has exactly two divisors. 2 is the smallest, and the only even one.',
  },
  {
    question: 'Which planet is known as the Red Planet?',
    answer: 'Mars',
    distractors: ['Jupiter', 'Venus', 'Saturn'],
    explanation: 'Rusty iron-rich dust gives Mars its reddish colour.',
  },
  {
    question: 'What is the chemical formula for water?',
    answer: 'H₂O',
    distractors: ['CO₂', 'O₂', 'NaCl'],
    explanation:
      'Each water molecule has two hydrogen atoms and one oxygen atom.',
  },
  {
    question: 'Which instrument has black and white keys?',
    answer: 'Piano',
    distractors: ['Violin', 'Flute', 'Trumpet'],
    explanation:
      'Pressing a key makes a hammer strike a string inside the piano.',
  },
  {
    question: 'What does a tadpole grow into?',
    answer: 'Frog',
    distractors: ['Fish', 'Lizard', 'Snail'],
    explanation:
      'Tadpoles lose their tails and grow legs as they become frogs.',
  },
  {
    question: 'How many strings does a standard violin have?',
    answer: '4',
    distractors: ['3', '5', '6'],
    explanation: 'Violin strings are tuned to G, D, A and E.',
  },
  {
    question: 'Which country’s flag has a red maple leaf on it?',
    answer: 'Canada',
    distractors: ['Norway', 'Brazil', 'Egypt'],
    explanation: 'The maple leaf has been on the Canadian flag since 1965.',
  },
  {
    question: 'Which is the largest desert in the world?',
    answer: 'Antarctica',
    distractors: ['Sahara', 'Gobi', 'Arabian'],
    explanation:
      'A desert is defined by how little rain or snow falls. Antarctica is very dry.',
  },
  {
    question:
      'How many players from one team are on the pitch in a soccer match?',
    answer: '11',
    distractors: ['9', '10', '12'],
    explanation:
      'Each side plays with eleven players, including the goalkeeper.',
  },
  {
    question: 'Which part of a plant takes in water from the soil?',
    answer: 'Roots',
    distractors: ['Leaves', 'Petals', 'Seeds'],
    explanation: 'Roots also anchor the plant in place.',
  },
  {
    question:
      'At sea level, water boils at what temperature in degrees Celsius?',
    answer: '100 °C',
    distractors: ['90 °C', '110 °C', '212 °C'],
    explanation:
      'Water boils at 100 °C at sea level. 212 is the same temperature in Fahrenheit.',
  },
  {
    question: 'What do the three angles of any triangle add up to?',
    answer: '180°',
    distractors: ['90°', '270°', '360°'],
    explanation:
      'Tear off the corners of any paper triangle and they line up flat.',
  },
  {
    question: 'Which is the tallest mountain above sea level?',
    answer: 'Mount Everest',
    distractors: ['K2', 'Kilimanjaro', 'Denali'],
    explanation:
      'Everest stands about 8,849 metres (29,032 feet) above sea level.',
  },
  {
    question: 'Which of these birds cannot fly?',
    answer: 'Penguin',
    distractors: ['Robin', 'Pigeon', 'Duck'],
    explanation: 'Penguins use their wings like flippers to swim.',
  },
  {
    question: 'How many bones does a typical adult human have?',
    answer: '206',
    distractors: ['106', '306', '412'],
    explanation:
      'Babies are born with more, and some of them fuse together as they grow.',
  },
  {
    question: 'Which is the largest planet in our solar system?',
    answer: 'Jupiter',
    distractors: ['Saturn', 'Neptune', 'Earth'],
    explanation: 'More than 1,000 Earths could fit inside Jupiter.',
  },
  {
    question: 'What is a baby kangaroo called?',
    answer: 'Joey',
    distractors: ['Cub', 'Kit', 'Pup'],
    explanation: 'A joey lives in its mother’s pouch for months.',
  },
  {
    question: 'A group of fish swimming together is called a what?',
    answer: 'School',
    distractors: ['Herd', 'Flock', 'Pride'],
    explanation:
      'Fish that swim together are called a school, or sometimes a shoal.',
  },
  {
    question: 'In a traditional rainbow, how many colours are named?',
    answer: '7',
    distractors: ['5', '6', '8'],
    explanation: 'Red, orange, yellow, green, blue, indigo and violet.',
  },
  {
    question: 'Which force pulls objects towards the Earth?',
    answer: 'Gravity',
    distractors: ['Magnetism', 'Friction', 'Static'],
    explanation:
      'Gravity is why things fall down, and keeps the Moon in orbit.',
  },
  {
    question: 'Which planet is famous for its bright rings?',
    answer: 'Saturn',
    distractors: ['Mars', 'Mercury', 'Venus'],
    explanation: 'Saturn’s rings are made mostly of ice chunks.',
  },
  {
    question: 'What is the square root of 81?',
    answer: '9',
    distractors: ['7', '8', '11'],
    explanation: '9 × 9 = 81.',
  },
  {
    question: 'Which metal is liquid at normal room temperature?',
    answer: 'Mercury',
    distractors: ['Iron', 'Copper', 'Aluminium'],
    explanation:
      'Mercury melts at about −39 °C, so it is liquid at room temperature.',
  },
  {
    question: 'Which is the fastest land animal over a short sprint?',
    answer: 'Cheetah',
    distractors: ['Lion', 'Horse', 'Gazelle'],
    explanation: 'A cheetah can reach about 100 km/h (62 mph) in short bursts.',
  },
];
