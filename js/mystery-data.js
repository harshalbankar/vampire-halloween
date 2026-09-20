/**
 * HALLOWEEN VAMPIRE PUB — MYSTERY DATA CATALOG
 * Character definitions, ImageKit CDN image assets, hotspots, dialogue pools, and deduction attributes.
 * All dialogues and descriptions centered around Halloween party festivities and suspicions.
 */

export const CHARACTERS = [
  {
    id: 'dylan',
    name: 'Dylan',
    gender: 'male',
    title: 'The Aristocrat',
    images: {
      full: 'https://ik.imagekit.io/HUDs/halloween/charct%20er%201.png?updatedAt=1789840793159',
      face: 'https://ik.imagekit.io/HUDs/halloween/character%201/character%201%20%20-%20closeup.png?updatedAt=1789896504591',
      hand: 'https://ik.imagekit.io/HUDs/halloween/character%201/character%201%20-%20hand%202.png?updatedAt=1789912365395',
      drink: 'https://ik.imagekit.io/HUDs/halloween/character%201/character%201%20%20-%20drink.png?updatedAt=1789896501371',
      purse: 'https://ik.imagekit.io/HUDs/halloween/character%201/character%201%20%20-%20bag.png?updatedAt=1789896503434',
      shoe: 'https://ik.imagekit.io/HUDs/halloween/character%201/character%201%20%20-%20shoe.png?updatedAt=1789896497327'
    },
    hotspots: {
      face:  { top: 12, left: 35, width: 30, height: 22 },
      drink: { top: 40, left: 42, width: 22, height: 18 },
      hand:  { top: 48, left: 36, width: 22, height: 16 },
      purse: { top: 58, left: 28, width: 28, height: 20 },
      shoe:  { top: 82, left: 32, width: 36, height: 18 }
    },
    traits: {
      drinkName: 'crimson wine',
      drinkGlass: 'stemmed crystal wine glass',
      handItem: 'ornate ruby ring',
      purseItem: 'gothic cross leather wallet',
      shoeStyle: 'buckled dress shoes',
      metal: 'gold',
      stone: 'ruby'
    },
    dialoguePool: {
      party: [
        { id: 'dylan_party_1', text: 'Such an exquisite Halloween party... everyone in disguise, yet one face among us wears no mask at all.' },
        { id: 'dylan_party_2', text: 'I adore Halloween tavern parties. The jack-o\'-lanterns illuminate the finest silks and the darkest secrets.' },
        { id: 'dylan_party_3', text: 'The party cider is sweet, but this Halloween gathering holds a much darker vintage.' }
      ],
      neighborRight: [
        { id: 'dylan_right_1', text: 'The Halloween guest standing directly to my right... their drink smells like warm iron, not party wine.' },
        { id: 'dylan_right_2', text: 'Watch the person to my right at this Halloween party. When the pumpkin candle flickered, they cast no shadow!' }
      ],
      neighborLeft: [
        { id: 'dylan_left_1', text: 'The party guest standing to my left hasn\'t touched the Halloween feast... and their breath is ice cold.' },
        { id: 'dylan_left_2', text: 'I noticed the person standing directly to my left watching everyone\'s necks during the Halloween toast.' }
      ],
      vampire: [
        { id: 'dylan_vamp_1', text: 'Halloween is my favorite celebration... mortals wear plastic fangs, while mine have tasted centuries.' },
        { id: 'dylan_vamp_2', text: 'A toast to our Halloween party! Savor the music, for when the clock strikes twelve, the real feast begins.' }
      ]
    },
    dialogues: [
      { id: 'dylan_party_1', text: 'Such an exquisite Halloween party... everyone in disguise, yet one face among us wears no mask at all.' },
      { id: 'dylan_party_2', text: 'I adore Halloween tavern parties. The jack-o\'-lanterns illuminate the finest silks and the darkest secrets.' },
      { id: 'dylan_party_3', text: 'The party cider is sweet, but this Halloween gathering holds a much darker vintage.' },
      { id: 'dylan_right_1', text: 'The Halloween guest standing directly to my right... their drink smells like warm iron, not party wine.' },
      { id: 'dylan_left_1', text: 'The party guest standing to my left hasn\'t touched the Halloween feast... and their breath is ice cold.' }
    ]
  },
  {
    id: 'lucien',
    name: 'Lucien',
    gender: 'male',
    title: 'The Melancholic',
    images: {
      full: 'https://ik.imagekit.io/HUDs/halloween/charct%20er%204.png?updatedAt=1789840794599',
      face: 'https://ik.imagekit.io/HUDs/halloween/character%204/character%204%20-%20closeup.png?updatedAt=1789896504680',
      hand: 'https://ik.imagekit.io/HUDs/halloween/character%204/character%204%20-%20hand%202.png?updatedAt=1789912413816',
      drink: 'https://ik.imagekit.io/HUDs/halloween/character%204/character%204%20-%20drink.png?updatedAt=1789896501715',
      purse: 'https://ik.imagekit.io/HUDs/halloween/character%204/character%204%20-%20bag.png?updatedAt=1789896504397',
      shoe: 'https://ik.imagekit.io/HUDs/halloween/character%204/character%204%20-%20shoe.png?updatedAt=1789896497452'
    },
    hotspots: {
      face:  { top: 12, left: 34, width: 32, height: 22 },
      drink: { top: 38, left: 45, width: 22, height: 18 },
      hand:  { top: 46, left: 32, width: 24, height: 18 },
      purse: { top: 56, left: 26, width: 28, height: 20 },
      shoe:  { top: 82, left: 30, width: 40, height: 18 }
    },
    traits: {
      drinkName: 'emerald absinthe',
      drinkGlass: 'silver-rimmed liqueur glass',
      handItem: 'skeletal silver signet',
      purseItem: 'velvet monogrammed satchel',
      shoeStyle: 'tall aristocratic riding boots',
      metal: 'silver',
      stone: 'onyx'
    },
    dialoguePool: {
      party: [
        { id: 'lucien_party_1', text: 'Halloween tavern laughter is wonderfully loud... it drowns out the frantic beating of human hearts.' },
        { id: 'lucien_party_2', text: 'Everyone wore costumes for this Halloween party, yet someone here is dressed in their everyday cemetery best.' },
        { id: 'lucien_party_3', text: 'A toast to All Hallows\' Eve! But beware what pours into your goblet after midnight.' }
      ],
      neighborRight: [
        { id: 'lucien_right_1', text: 'The party guest to my right... their skin is unnaturally frosted, like marble fresh from a crypt.' },
        { id: 'lucien_right_2', text: 'Notice how the guest standing immediately to my right refused to step near the garlic above the bar.' }
      ],
      neighborLeft: [
        { id: 'lucien_left_1', text: 'The person standing to my left at this Halloween party has hands cold as winter frost.' },
        { id: 'lucien_left_2', text: 'I can hear no heartbeat coming from the guest standing directly to my left...' }
      ],
      vampire: [
        { id: 'lucien_vamp_1', text: 'The Halloween masquerade is magnificent. No one questions why my drink is deep crimson.' },
        { id: 'lucien_vamp_2', text: 'Mortals pretend to be beasts on Halloween... how delightful of them to welcome the real predator.' }
      ]
    },
    dialogues: [
      { id: 'lucien_party_1', text: 'Halloween tavern laughter is wonderfully loud... it drowns out the frantic beating of human hearts.' },
      { id: 'lucien_party_2', text: 'Everyone wore costumes for this Halloween party, yet someone here is dressed in their everyday cemetery best.' },
      { id: 'lucien_party_3', text: 'A toast to All Hallows\' Eve! But beware what pours into your goblet after midnight.' },
      { id: 'lucien_right_1', text: 'The party guest to my right... their skin is unnaturally frosted, like marble fresh from a crypt.' },
      { id: 'lucien_left_1', text: 'The person standing to my left at this Halloween party has hands cold as winter frost.' }
    ]
  },
  {
    id: 'silas',
    name: 'Silas',
    gender: 'male',
    title: 'The Scholar',
    images: {
      full: 'https://ik.imagekit.io/HUDs/halloween/charct%20er%206.png?updatedAt=1789840794024',
      face: 'https://ik.imagekit.io/HUDs/halloween/character%206/character%206%20-%20closeup.png?updatedAt=1789896504853',
      hand: 'https://ik.imagekit.io/HUDs/halloween/character%206/character%206%20-%20hand%202.png?updatedAt=1789912446562',
      drink: 'https://ik.imagekit.io/HUDs/halloween/character%206/character%206%20-%20drink.png?updatedAt=1789896501811',
      purse: 'https://ik.imagekit.io/HUDs/halloween/character%206/character%206%20-%20bag.png?updatedAt=1789896504953',
      shoe: 'https://ik.imagekit.io/HUDs/halloween/character%206/character%206%20-%20shoe.png?updatedAt=1789896497444'
    },
    hotspots: {
      face:  { top: 12, left: 34, width: 32, height: 22 },
      drink: { top: 40, left: 40, width: 22, height: 18 },
      hand:  { top: 48, left: 42, width: 24, height: 16 },
      purse: { top: 58, left: 30, width: 30, height: 20 },
      shoe:  { top: 82, left: 32, width: 36, height: 18 }
    },
    traits: {
      drinkName: 'smoky amber spirit',
      drinkGlass: 'heavy cut crystal tumbler',
      handItem: 'skull-carved seal ring',
      purseItem: 'antique leather parchment case',
      shoeStyle: 'heavy buckled leather boots',
      metal: 'bronze',
      stone: 'amber'
    },
    dialoguePool: {
      party: [
        { id: 'silas_party_1', text: 'The antique grimoires warned of a Halloween party where the dead drink beside the living.' },
        { id: 'silas_party_2', text: 'Look behind the Halloween punch bowl... curious how one silhouette in the mirror is completely missing.' },
        { id: 'silas_party_3', text: 'Carved pumpkins, candlelight, and unspoken dread... the quintessential gothic Halloween party.' }
      ],
      neighborRight: [
        { id: 'silas_right_1', text: 'The Halloween patron standing to my right flinches every time the silver candelabra tilts!' },
        { id: 'silas_right_2', text: 'Ancient lore says vampires cannot cross running water—watch the guest to my right avoid the spilled party cider.' }
      ],
      neighborLeft: [
        { id: 'silas_left_1', text: 'The person standing directly to my left at this party... their eyes reflected crimson in the pumpkin lantern glow.' },
        { id: 'silas_left_2', text: 'Notice the guest to my left? Not a single breath has fogged from their lips in this cold pub.' }
      ],
      vampire: [
        { id: 'silas_vamp_1', text: 'All Hallows\' Eve is the only night I can toast with living company without hiding my true thirst.' },
        { id: 'silas_vamp_2', text: 'Such delicate mortals at this Halloween celebration... like spun glass waiting for midnight to shatter.' }
      ]
    },
    dialogues: [
      { id: 'silas_party_1', text: 'The antique grimoires warned of a Halloween party where the dead drink beside the living.' },
      { id: 'silas_party_2', text: 'Look behind the Halloween punch bowl... curious how one silhouette in the mirror is completely missing.' },
      { id: 'silas_party_3', text: 'Carved pumpkins, candlelight, and unspoken dread... the quintessential gothic Halloween party.' },
      { id: 'silas_right_1', text: 'The Halloween patron standing to my right flinches every time the silver candelabra tilts!' },
      { id: 'silas_left_1', text: 'The person standing directly to my left at this party... their eyes reflected crimson in the pumpkin lantern glow.' }
    ]
  },
  {
    id: 'vesper',
    name: 'Vesper',
    gender: 'female',
    title: 'The Seductress',
    images: {
      full: 'https://ik.imagekit.io/HUDs/halloween/charct%20er%203.png?updatedAt=1789840794166',
      face: 'https://ik.imagekit.io/HUDs/halloween/character%202/character%202%20-%20closeup.png?updatedAt=1789896504793',
      hand: 'https://ik.imagekit.io/HUDs/halloween/character%202/character%202%20-%20hand%202.png?updatedAt=1789912384034',
      drink: 'https://ik.imagekit.io/HUDs/halloween/character%202/character%202%20-%20drink.png?updatedAt=1789896501555',
      purse: 'https://ik.imagekit.io/HUDs/halloween/character%202/character%202%20-%20bag.png?updatedAt=1789896504607',
      shoe: 'https://ik.imagekit.io/HUDs/halloween/character%202/character%202%20-%20shoe.png?updatedAt=1789896501645'
    },
    hotspots: {
      face:  { top: 12, left: 35, width: 30, height: 22 },
      drink: { top: 40, left: 38, width: 22, height: 18 },
      hand:  { top: 46, left: 44, width: 22, height: 16 },
      purse: { top: 56, left: 32, width: 28, height: 20 },
      shoe:  { top: 82, left: 32, width: 36, height: 18 }
    },
    traits: {
      drinkName: 'dark violet potion',
      drinkGlass: 'bubbling violet coupe glass',
      handItem: 'silver serpent ring',
      purseItem: 'bat-wing embroidered purse',
      shoeStyle: 'strappy gothic velvet heels',
      metal: 'silver',
      stone: 'amethyst'
    },
    dialoguePool: {
      party: [
        { id: 'vesper_party_1', text: 'A Halloween mask conceals so little; the excitement in mortal veins is so terribly loud tonight.' },
        { id: 'vesper_party_2', text: 'The music at this Halloween party is intoxicating... almost enough to mask the scent of fresh blood.' },
        { id: 'vesper_party_3', text: 'Be cautious who you invite to dance on Halloween; beneath velvet disguises, some partygoers have real fangs.' }
      ],
      neighborRight: [
        { id: 'vesper_right_1', text: 'The guest standing to my right at this Halloween party... their drink is far thicker than spiced wine.' },
        { id: 'vesper_right_2', text: 'Look at the guest to my right—the pumpkin candles dim whenever they lean close.' }
      ],
      neighborLeft: [
        { id: 'vesper_left_1', text: 'The masquerade patron to my left hasn\'t blinked once during the entire Halloween party.' },
        { id: 'vesper_left_2', text: 'Whoever is standing directly to my left smells of nightshade and freshly dug grave soil.' }
      ],
      vampire: [
        { id: 'vesper_vamp_1', text: 'I adore Halloween. Tonight, mortals willingly walk into the predator\'s parlor and call it a party.' },
        { id: 'vesper_vamp_2', text: 'Drink your sweet Halloween cocktails, darlings... my thirst requires something far more intoxicating.' }
      ]
    },
    dialogues: [
      { id: 'vesper_party_1', text: 'A Halloween mask conceals so little; the excitement in mortal veins is so terribly loud tonight.' },
      { id: 'vesper_party_2', text: 'The music at this Halloween party is intoxicating... almost enough to mask the scent of fresh blood.' },
      { id: 'vesper_party_3', text: 'Be cautious who you invite to dance on Halloween; beneath velvet disguises, some partygoers have real fangs.' },
      { id: 'vesper_right_1', text: 'The guest standing to my right at this Halloween party... their drink is far thicker than spiced wine.' },
      { id: 'vesper_left_1', text: 'The masquerade patron to my left hasn\'t blinked once during the entire Halloween party.' }
    ]
  },
  {
    id: 'elara',
    name: 'Elara',
    gender: 'female',
    title: 'The Witch',
    images: {
      full: 'https://ik.imagekit.io/HUDs/halloween/charct%20er%202.png?updatedAt=1789840793292',
      face: 'https://ik.imagekit.io/HUDs/halloween/character%203/character%203%20-%20closeup.png?updatedAt=1789896504779',
      hand: 'https://ik.imagekit.io/HUDs/halloween/character%203/character%203%20-%20hand%202.png?updatedAt=1789912400038',
      drink: 'https://ik.imagekit.io/HUDs/halloween/character%203/character%203%20-%20drink.png?updatedAt=1789896501294',
      purse: 'https://ik.imagekit.io/HUDs/halloween/character%203/character%203%20-%20bag.png?updatedAt=1789896504890',
      shoe: 'https://ik.imagekit.io/HUDs/halloween/character%203/character%203%20-%20shoe.png?updatedAt=1789896502200'
    },
    hotspots: {
      face:  { top: 12, left: 35, width: 30, height: 22 },
      drink: { top: 38, left: 42, width: 22, height: 18 },
      hand:  { top: 46, left: 34, width: 22, height: 16 },
      purse: { top: 58, left: 26, width: 28, height: 20 },
      shoe:  { top: 82, left: 30, width: 40, height: 18 }
    },
    traits: {
      drinkName: 'emerald citrus draught',
      drinkGlass: 'tall frosted emerald goblet',
      handItem: 'emerald snake coiled ring',
      purseItem: 'vintage gold-clasp handbag',
      shoeStyle: 'emerald satin embroidered slippers',
      metal: 'gold',
      stone: 'emerald'
    },
    dialoguePool: {
      party: [
        { id: 'elara_party_1', text: 'My Halloween brew bubbles with hemlock, but someone in this pub drinks something far redder.' },
        { id: 'elara_party_2', text: 'They say on All Hallows\' Eve, the veil tears open. Tonight, an ancient vampire walks our party floor.' },
        { id: 'elara_party_3', text: 'Keep your eyes on your goblet this Halloween; a single drop from the unliving changes everything.' }
      ],
      neighborRight: [
        { id: 'elara_right_1', text: 'My divining ring burns whenever I turn toward the guest standing directly to my right!' },
        { id: 'elara_right_2', text: 'The party guest to my right... their crimson drink casts no reflection in my silver spoon.' }
      ],
      neighborLeft: [
        { id: 'elara_left_1', text: 'An aura of pure grave chill emanates from the party guest standing directly to my left.' },
        { id: 'elara_left_2', text: 'The guest to my left shivered when garlic bread was served at the Halloween party table.' }
      ],
      vampire: [
        { id: 'elara_vamp_1', text: 'Witches brew herbs, but vampires brew eternity. Happy Halloween to all our lovely prey.' },
        { id: 'elara_vamp_2', text: 'A glorious Halloween feast... so many warm throats gathered conveniently around one table.' }
      ]
    },
    dialogues: [
      { id: 'elara_party_1', text: 'My Halloween brew bubbles with hemlock, but someone in this pub drinks something far redder.' },
      { id: 'elara_party_2', text: 'They say on All Hallows\' Eve, the veil tears open. Tonight, an ancient vampire walks our party floor.' },
      { id: 'elara_party_3', text: 'Keep your eyes on your goblet this Halloween; a single drop from the unliving changes everything.' },
      { id: 'elara_right_1', text: 'My divining ring burns whenever I turn toward the guest standing directly to my right!' },
      { id: 'elara_left_1', text: 'An aura of pure grave chill emanates from the party guest standing directly to my left.' }
    ]
  },
  {
    id: 'selene',
    name: 'Selene',
    gender: 'female',
    title: 'The Moon Lady',
    images: {
      full: 'https://ik.imagekit.io/HUDs/halloween/charct%20er%205.png?updatedAt=1789840794723',
      face: 'https://ik.imagekit.io/HUDs/halloween/character%205/character%205%20-%20closeup.png?updatedAt=1789896504787',
      hand: 'https://ik.imagekit.io/HUDs/halloween/character%205/character%205%20-%20hand%202.png?updatedAt=1789912430323',
      drink: 'https://ik.imagekit.io/HUDs/halloween/character%205/character%205%20-%20drink.png?updatedAt=1789896499876',
      purse: 'https://ik.imagekit.io/HUDs/halloween/character%205/character%205%20-%20bag.png?updatedAt=1789896502706',
      shoe: 'https://ik.imagekit.io/HUDs/halloween/character%205/character%205%20-%20shoe.png?updatedAt=1789896502735'
    },
    hotspots: {
      face:  { top: 12, left: 34, width: 32, height: 22 },
      drink: { top: 38, left: 44, width: 22, height: 18 },
      hand:  { top: 46, left: 36, width: 22, height: 16 },
      purse: { top: 56, left: 28, width: 28, height: 20 },
      shoe:  { top: 82, left: 32, width: 36, height: 18 }
    },
    traits: {
      drinkName: 'blood-orange chalice',
      drinkGlass: 'frosted goblet with orange garnish',
      handItem: 'moonstone silver band',
      purseItem: 'silver mesh chain bag',
      shoeStyle: 'midnight stiletto heels',
      metal: 'silver',
      stone: 'moonstone'
    },
    dialoguePool: {
      party: [
        { id: 'selene_party_1', text: 'The full moon through these stained glass arches makes our Halloween masquerade look spectral.' },
        { id: 'selene_party_2', text: 'Look at their nervous fingers clutching party glasses... someone at this table is terrified of sunrise.' },
        { id: 'selene_party_3', text: 'I have attended Halloween tavern revels for centuries, yet tonight\'s guest list is especially dangerous.' }
      ],
      neighborRight: [
        { id: 'selene_right_1', text: 'The guest standing to my right in this Halloween lineup... their skin is unnaturally devoid of living color.' },
        { id: 'selene_right_2', text: 'Watch the party guest to my right—their gaze never leaves the pulse in the hostess\'s neck.' }
      ],
      neighborLeft: [
        { id: 'selene_left_1', text: 'A bone-deep chill radiates from the party guest standing immediately to my left.' },
        { id: 'selene_left_2', text: 'The guest to my left refused to take a bite of the salted Halloween party treats.' }
      ],
      vampire: [
        { id: 'selene_vamp_1', text: 'The moon smiles upon this Halloween party. Mortals in costumes, while the true ruler of the night drinks unseen.' },
        { id: 'selene_vamp_2', text: 'Enjoy the Halloween revelry while your blood still flows warm, my dear party guests.' }
      ]
    },
    dialogues: [
      { id: 'selene_party_1', text: 'The full moon through these stained glass arches makes our Halloween masquerade look spectral.' },
      { id: 'selene_party_2', text: 'Look at their nervous fingers clutching party glasses... someone at this table is terrified of sunrise.' },
      { id: 'selene_party_3', text: 'I have attended Halloween tavern revels for centuries, yet tonight\'s guest list is especially dangerous.' },
      { id: 'selene_right_1', text: 'The guest standing to my right in this Halloween lineup... their skin is unnaturally devoid of living color.' },
      { id: 'selene_left_1', text: 'A bone-deep chill radiates from the party guest standing immediately to my left.' }
    ]
  }
];

export const VALID_CLUE_OBJECTS = ['hand', 'drink', 'purse', 'shoe'];
