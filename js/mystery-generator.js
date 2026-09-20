/**
 * HALLOWEEN VAMPIRE PUB — PROCEDURAL MYSTERY GENERATOR & SOLVER
 * Generates randomized, logically watertight mysteries with 100% deduction guarantee.
 * Enhanced with deep Halloween party themes, dynamic character dialogues, and direct neighbor clues.
 */

import { CHARACTERS, VALID_CLUE_OBJECTS } from './mystery-data.js';

/**
 * Fisher-Yates array shuffle helper
 */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a complete mystery session
 */
export function generateMystery() {
  const MAX_ATTEMPTS = 50;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const mystery = attemptGenerateMystery();
    const validation = validateMystery(mystery);
    if (validation.valid) {
      return mystery;
    }
  }

  // Fallback guaranteed generation if random search timed out
  return createCuratedMystery();
}

/**
 * Core generation logic
 */
function attemptGenerateMystery() {
  // 1. Randomize seating positions 0-5
  const characters = shuffle(CHARACTERS).map((char, index) => ({
    ...char,
    tablePosition: index // 0 = leftmost, 5 = rightmost
  }));

  // 2. Choose 1 Vampire
  const vampireIndex = Math.floor(Math.random() * characters.length);
  const vampire = characters[vampireIndex];

  // 3. Select active dialogue for each character based on Halloween party context & neighbor proximity
  const activeDialogues = {};
  characters.forEach(char => {
    let chosen = null;
    const pool = char.dialoguePool;
    if (pool) {
      if (char.id === vampire.id) {
        // Character is the hidden vampire
        chosen = pool.vampire[Math.floor(Math.random() * pool.vampire.length)];
      } else if (char.tablePosition === vampire.tablePosition - 1) {
        // Seated immediately to the left of the vampire (vampire is to their right)
        const useNeighbor = Math.random() < 0.65;
        chosen = useNeighbor && pool.neighborRight
          ? pool.neighborRight[Math.floor(Math.random() * pool.neighborRight.length)]
          : pool.party[Math.floor(Math.random() * pool.party.length)];
      } else if (char.tablePosition === vampire.tablePosition + 1) {
        // Seated immediately to the right of the vampire (vampire is to their left)
        const useNeighbor = Math.random() < 0.65;
        chosen = useNeighbor && pool.neighborLeft
          ? pool.neighborLeft[Math.floor(Math.random() * pool.neighborLeft.length)]
          : pool.party[Math.floor(Math.random() * pool.party.length)];
      } else {
        // General Halloween party banter
        chosen = pool.party[Math.floor(Math.random() * pool.party.length)];
      }
    }
    if (!chosen && char.dialogues && char.dialogues.length > 0) {
      chosen = char.dialogues[Math.floor(Math.random() * char.dialogues.length)];
    }
    activeDialogues[char.id] = chosen;
  });

  // 4. Select 3 distinct hosts for the clues (vampire MAY be a host)
  const shuffledForHosts = shuffle(characters);
  const host1 = shuffledForHosts[0];
  const host2 = shuffledForHosts[1];
  const host3 = shuffledForHosts[2];

  // 5. Select object type for each host (NEVER 'face')
  const obj1 = VALID_CLUE_OBJECTS[Math.floor(Math.random() * VALID_CLUE_OBJECTS.length)];
  const obj2 = VALID_CLUE_OBJECTS[Math.floor(Math.random() * VALID_CLUE_OBJECTS.length)];
  const obj3 = VALID_CLUE_OBJECTS[Math.floor(Math.random() * VALID_CLUE_OBJECTS.length)];

  // 6. Build the 3 clues with deductive logic
  const { clue1, clue2, clue3 } = buildDeductionChain(vampire, characters, activeDialogues, [host1, host2, host3], [obj1, obj2, obj3]);

  return {
    vampireId: vampire.id,
    vampireName: vampire.name,
    characters,
    activeDialogues,
    clues: [clue1, clue2, clue3],
    createdAt: Date.now()
  };
}

const DIALOGUE_RIDDLES = {
  dylan: [
    'Whispers at the Halloween party speak of cellars locked after midnight, where mortals fear to tread.',
    'An overheard remark praised a Halloween vintage with the bouquet of aged iron and cold oak.',
    'One guest was heard murmuring with cold disdain that mortal Halloween masks are merely fleeting.'
  ],
  lucien: [
    'An uneasy whisper warned that bitter drinks poured at this Halloween tavern were never intended for living throats.',
    'Someone at the party remarked that tavern laughter drowns out the frantic beating of mortal hearts.',
    'A dark murmur noted that family crypts are far more welcoming than this Halloween revelry.'
  ],
  silas: [
    'A patron muttered about mirrors draped in black velvet behind the Halloween punch bowl to hide unreflected faces.',
    'Overheard words warned that the autumn fog outside our Halloween party carries hungry whispers.',
    'One guest was heard observing pale throats and unspoken dread across the Halloween guests.'
  ],
  vesper: [
    'A quiet voice remarked that beneath velvet Halloween masks lie fingers as cold as marble.',
    'One patron was overheard whispering that even the Halloween shadows possess real fangs tonight.',
    'A warning was whispered that delicate mortals at this party are like spun glass waiting to shatter.'
  ],
  elara: [
    'A whisper questioned whether silver spoons at the Halloween table still cast everyone’s reflection.',
    'A guest was overheard noting that ancient vampire bloodlines simply relocate to darker Halloween taverns.',
    'A dark murmur noted how every human pulse quickens as midnight approaches at our Halloween party.'
  ],
  selene: [
    'An overheard voice claimed to have walked beneath the Halloween moon long before this pub had a name.',
    'A patron was heard murmuring that someone among our party company is terrified of sunrise.',
    'A whisper remarked on sudden chills through the Halloween party that do not belong to the wind.'
  ]
};

const DRINK_RIDDLES = {
  'crimson wine': 'At the Halloween party, the creature’s thirst is masked by a glass of deep crimson wine, untouched by living warmth.',
  'emerald absinthe': 'The beast masks its breath behind a silver-rimmed glass of bitter emerald Halloween absinthe.',
  'smoky amber spirit': 'Under the Halloween jack-o\'-lantern lights, the unliving soul nurses a heavy crystal tumbler filled with smoky amber liquor.',
  'dark violet potion': 'Bubbling violet potion that smells of nightshade swirls inside the predator’s coupe glass at the Halloween party.',
  'emerald citrus draught': 'A tall frosted Halloween goblet smelling of hemlock and citrus masks the beast’s unnatural chill.',
  'blood-orange chalice': 'The nocturnal guest cradles a frosted chalice tinged with blood-orange, gazing through cold glass at the Halloween party.'
};

const STONE_RIDDLES = {
  'ruby': 'A solitary blood-red ruby set in gold gleams upon the predator’s cold finger at the Halloween party.',
  'onyx': 'A skeletal signet set with pitch-black onyx stone marks the creature’s hand amidst the party guests.',
  'amber': 'An antique seal ring carved with skulls and glowing with dark amber adorns the beast’s hand for Halloween.',
  'amethyst': 'A silver serpent coiled around a deep purple amethyst binds the creature’s finger at the masquerade.',
  'emerald': 'A coiled serpent ring holding a cold glittering emerald clutches the unliving hand at the Halloween table.',
  'moonstone': 'A pale moonstone silver band, icy to the touch, rests upon the fiend’s hand during the Halloween party.'
};

const SHOE_RIDDLES = {
  'buckled dress shoes': 'The creature glides soundlessly across the flagstones in antique buckled dress shoes at the Halloween party.',
  'tall aristocratic riding boots': 'Tall aristocratic riding boots disguise feet that cast no living warmth upon the Halloween pub floor.',
  'heavy buckled leather boots': 'Heavy buckled leather boots, worn from wandering forgotten catacombs, belong to the creature at this party.',
  'strappy gothic velvet heels': 'Strappy gothic velvet heels carry the predator gracefully through the Halloween masquerade.',
  'emerald satin embroidered slippers': 'Silent steps in emerald satin embroidered slippers leave no trace upon the Halloween tavern floor.',
  'midnight stiletto heels': 'Sharp midnight stiletto heels leave quiet echoes beneath the stained glass arches at the party.'
};

const PURSE_RIDDLES = {
  'gothic cross leather wallet': 'Concealed within a gothic cross leather wallet lies an oath sworn in centuries past, brought to the Halloween party.',
  'velvet monogrammed satchel': 'The stale scent of crypt dust lingers inside a velvet monogrammed satchel at the Halloween table.',
  'antique leather parchment case': 'An antique leather parchment case contains dark transcripts of the creature\'s vampire lineage.',
  'bat-wing embroidered purse': 'A delicate party bag stitched with bat wings conceals the creature’s dark intent.',
  'vintage gold-clasp handbag': 'Tucked inside a vintage gold-clasp handbag rests a nocturnal vial of hemlock for the Halloween party.',
  'silver mesh chain bag': 'A shimmering silver mesh chain bag keeps secrets that belong only to the grave.'
};

/**
 * Constructs 3 clues that narrow suspects logically without ever spoiling the suspect's name
 */
function buildDeductionChain(vampire, characters, activeDialogues, hosts, objects) {
  const [host1, host2, host3] = hosts;
  const [obj1, obj2, obj3] = objects;

  const isVampireMale = vampire.gender === 'male';
  const vampirePos = vampire.tablePosition;
  const isLeft = vampirePos < 3; // 0, 1, 2 = left; 3, 4, 5 = right
  const isEven = vampirePos % 2 === 0;

  const leftNeighbor = characters.find(c => c.tablePosition === vampirePos - 1);
  const rightNeighbor = characters.find(c => c.tablePosition === vampirePos + 1);

  // Clue 1: Atmospheric / Dialogue / Seating Wing / Direct Neighbor clue
  const vDialogueList = DIALOGUE_RIDDLES[vampire.id] || [];
  const randomDialogueRiddle = vDialogueList[Math.floor(Math.random() * vDialogueList.length)] ||
    'Whispers in the shadows speak of an ancient curse among the Halloween patrons.';

  const clue1Options = [
    {
      text: randomDialogueRiddle,
      test: (c) => c.id === vampire.id
    },
    {
      text: isLeft
        ? 'Jack-o\'-lantern flames flicker restlessly over the west wing of the Halloween party table.'
        : 'An uncanny supernatural shadow falls across the east wing of the Halloween party table.',
      test: (c) => isLeft ? c.tablePosition < 3 : c.tablePosition >= 3
    },
    {
      text: isVampireMale
        ? 'The nocturnal predator at the Halloween party assumes the guise of an aristocratic gentleman.'
        : 'The creature of darkness hides beneath the grace of an elegant Halloween party lady.',
      test: (c) => c.gender === vampire.gender
    }
  ];

  // Direct neighbor clues
  if (leftNeighbor) {
    clue1Options.push({
      text: `A panicked Halloween note found by the drinks: "The real vampire is standing directly to the right of ${leftNeighbor.name}!"`,
      test: (c) => c.tablePosition === leftNeighbor.tablePosition + 1
    });
  }

  if (rightNeighbor) {
    clue1Options.push({
      text: `An overheard whisper at the punch bowl: "Look directly to the left of ${rightNeighbor.name}—that is the true vampire!"`,
      test: (c) => c.tablePosition === rightNeighbor.tablePosition - 1
    });
  }

  const adjacent = leftNeighbor || rightNeighbor;
  if (adjacent) {
    clue1Options.push({
      text: `A guest whispered into the tavern shadows: "The vampire is standing right next to ${adjacent.name} in the Halloween lineup!"`,
      test: (c) => Math.abs(c.tablePosition - adjacent.tablePosition) === 1
    });
  }

  const selectedClue1 = clue1Options[Math.floor(Math.random() * clue1Options.length)];

  // Clue 2: Drink / Metal Affinity / Seating Parity
  const metalText = vampire.traits.metal === 'gold'
    ? 'No sacred silver burns this creature; its Halloween accessories gleam with untarnished gold.'
    : vampire.traits.metal === 'silver'
    ? 'Ancient blood allows this predator to wear ornaments of antique silver at the party without burning.'
    : 'The scent of oxidized bronze and ancient tomb relics surrounds the nocturnal wanderer at this party.';

  const clue2Options = [
    {
      text: DRINK_RIDDLES[vampire.traits.drinkName] || `The vampire is drinking ${vampire.traits.drinkName}.`,
      test: (c) => c.traits.drinkName === vampire.traits.drinkName
    },
    {
      text: metalText,
      test: (c) => c.traits.metal === vampire.traits.metal
    },
    {
      text: isEven
        ? 'A chilling breeze disturbs only the guests seated in even positions at the Halloween party table.'
        : 'Cold drafts cling to the odd-numbered seats around the Halloween party table.',
      test: (c) => (c.tablePosition % 2 === 0) === isEven
    }
  ];

  const selectedClue2 = clue2Options[Math.floor(Math.random() * clue2Options.length)];

  // Clue 3: Decisive Forensic Detail (Jewelry stone, Footwear, or Bag item)
  const clue3Options = [
    {
      text: STONE_RIDDLES[vampire.traits.stone] || `Cold aura emanates from an accessory with a ${vampire.traits.stone}.`,
      test: (c) => c.traits.stone === vampire.traits.stone
    },
    {
      text: SHOE_RIDDLES[vampire.traits.shoeStyle] || `The vampire is wearing ${vampire.traits.shoeStyle}.`,
      test: (c) => c.traits.shoeStyle === vampire.traits.shoeStyle
    },
    {
      text: PURSE_RIDDLES[vampire.traits.purseItem] || `An ancient possession belongs to the creature: ${vampire.traits.purseItem}.`,
      test: (c) => c.traits.purseItem === vampire.traits.purseItem
    }
  ];

  const selectedClue3 = clue3Options[Math.floor(Math.random() * clue3Options.length)];

  return {
    clue1: {
      id: 'clue_1',
      number: 1,
      hostId: host1.id,
      hostName: host1.name,
      objectType: obj1,
      text: selectedClue1.text,
      discovered: false,
      test: selectedClue1.test
    },
    clue2: {
      id: 'clue_2',
      number: 2,
      hostId: host2.id,
      hostName: host2.name,
      objectType: obj2,
      text: selectedClue2.text,
      discovered: false,
      test: selectedClue2.test
    },
    clue3: {
      id: 'clue_3',
      number: 3,
      hostId: host3.id,
      hostName: host3.name,
      objectType: obj3,
      text: selectedClue3.text,
      discovered: false,
      test: selectedClue3.test
    }
  };
}

/**
 * Validates that a generated mystery fulfills all rules
 */
export function validateMystery(mystery) {
  // 1. Exactly 1 vampire
  if (!mystery.vampireId || !mystery.vampireName) {
    return { valid: false, reason: 'Missing vampire ID or Name' };
  }

  // 2. Exactly 6 characters
  if (mystery.characters.length !== 6) {
    return { valid: false, reason: 'Must have exactly 6 characters' };
  }

  // 3. Exactly 3 clues
  if (mystery.clues.length !== 3) {
    return { valid: false, reason: 'Must have exactly 3 clues' };
  }

  // 4. Clues must be hosted by 3 distinct characters
  const hostIds = mystery.clues.map(c => c.hostId);
  const uniqueHosts = new Set(hostIds);
  if (uniqueHosts.size !== 3) {
    return { valid: false, reason: 'Clues must be hosted on 3 distinct characters' };
  }

  // 5. Clue objects must NOT be 'face'
  const invalidObjects = mystery.clues.filter(c => c.objectType === 'face' || !VALID_CLUE_OBJECTS.includes(c.objectType));
  if (invalidObjects.length > 0) {
    return { valid: false, reason: 'Clues cannot be on face and must be valid objects' };
  }

  // 6. Each clue must match the true vampire
  const vampire = mystery.characters.find(c => c.id === mystery.vampireId);
  for (const clue of mystery.clues) {
    if (!clue.test(vampire)) {
      return { valid: false, reason: `Clue "${clue.text}" does not match true vampire ${vampire.name}` };
    }
  }

  // 7. Deductive intersection must yield EXACTLY the 1 true vampire
  const matchingCandidates = mystery.characters.filter(c => {
    return mystery.clues.every(clue => clue.test(c));
  });

  if (matchingCandidates.length !== 1 || matchingCandidates[0].id !== mystery.vampireId) {
    return {
      valid: false,
      reason: `Deduction chain matched ${matchingCandidates.length} characters instead of exactly 1 (${mystery.vampireName})`
    };
  }

  // 8. No clue text is duplicated
  const clueTexts = new Set(mystery.clues.map(c => c.text));
  if (clueTexts.size !== 3) {
    return { valid: false, reason: 'Duplicate clue text' };
  }

  return { valid: true };
}

/**
 * Curated fallback mystery in case random attempts fail
 */
function createCuratedMystery() {
  const characters = CHARACTERS.map((char, index) => ({
    ...char,
    tablePosition: index
  }));

  const activeDialogues = {};
  characters.forEach(c => activeDialogues[c.id] = c.dialogues[0]);

  const vampire = characters[0]; // Dylan
  const host1 = characters[1];   // Lucien
  const host2 = characters[2];   // Silas
  const host3 = characters[3];   // Vesper

  return {
    vampireId: vampire.id,
    vampireName: vampire.name,
    characters,
    activeDialogues,
    clues: [
      {
        id: 'clue_1',
        number: 1,
        hostId: host1.id,
        hostName: host1.name,
        objectType: 'drink',
        text: 'At the Halloween party, the creature’s thirst is masked by a glass of deep crimson wine, untouched by living warmth.',
        discovered: false,
        test: (c) => c.traits.drinkName === 'crimson wine'
      },
      {
        id: 'clue_2',
        number: 2,
        hostId: host2.id,
        hostName: host2.name,
        objectType: 'purse',
        text: 'No sacred silver burns this creature; its Halloween accessories gleam with untarnished gold.',
        discovered: false,
        test: (c) => c.traits.metal === 'gold'
      },
      {
        id: 'clue_3',
        number: 3,
        hostId: host3.id,
        hostName: host3.name,
        objectType: 'hand',
        text: 'A solitary blood-red ruby set in gold gleams upon the predator’s cold finger at the Halloween party.',
        discovered: false,
        test: (c) => c.traits.stone === 'ruby'
      }
    ],
    createdAt: Date.now()
  };
}
