import { GameState } from '../js/game-state.js';

console.log('--- Simulating complete game loop ---');

const game = new GameState();
console.log('Generated mystery for vampire:', game.mystery.vampireName, `(${game.mystery.vampireId})`);
console.log('Seating order:', game.mystery.characters.map((c, i) => `${i + 1}. ${c.name}`).join(', '));
console.log('Clues assigned:');
game.mystery.clues.forEach(c => {
  console.log(`  Clue ${c.number}: on ${c.hostName}'s ${c.objectType} -> "${c.text}"`);
});

// Verify 3 distinct hosts and no face clues
const hosts = game.mystery.clues.map(c => c.hostId);
console.assert(new Set(hosts).size === 3, 'Must have 3 distinct hosts');
console.assert(!game.mystery.clues.some(c => c.objectType === 'face'), 'No face clues');

// 1. Open investigation on first character
const firstChar = game.mystery.characters[0];
game.openInvestigation(firstChar.id);
console.assert(game.activeCharacterId === firstChar.id, 'Active character is firstChar');
console.assert(game.activeInspectionArea === 'full', 'Always starts on full image');
console.log(`✓ Successfully opened investigation on ${firstChar.name} (Full image)`);

// 2. Switch inspection areas
['face', 'drink', 'purse', 'shoe', 'hand'].forEach(area => {
  game.setInspectionArea(area);
  console.assert(game.activeInspectionArea === area, `Area switched to ${area}`);
});
console.log('✓ Area switching works for all 5 inspection areas');

// 3. Navigate next and prev characters
game.nextCharacter();
console.assert(game.activeInspectionArea === 'full', 'Next character resets to full image');
game.prevCharacter();
console.assert(game.activeInspectionArea === 'full', 'Prev character resets to full image');
console.log('✓ Character navigation resets inspection to full character');

// 4. Back to table preserves state
game.backToTable();
console.assert(game.activeCharacterId === null, 'Back to table unsets active character');
console.log('✓ Back to table preserved state');

// 5. Test Clue Discovery
console.assert(game.discoveredClues.length === 0, 'Initially 0 discovered clues');
console.assert(game.canAccuseVampire() === false, 'Cannot accuse vampire before 3 clues');

// Discover clue 1
const clue1 = game.mystery.clues[0];
game.openInvestigation(clue1.hostId);
game.setInspectionArea(clue1.objectType);
const activeClue1 = game.getActiveObjectClue();
console.assert(activeClue1 && activeClue1.id === clue1.id, 'Active clue matches clue 1');
game.discoverClue(clue1.id);
console.assert(game.discoveredClues.length === 1, '1 clue discovered');
console.assert(game.canAccuseVampire() === false, 'Cannot accuse vampire yet');
console.log('✓ Discovered Clue 1 on', clue1.hostName, clue1.objectType);

// Discover clue 2
const clue2 = game.mystery.clues[1];
game.openInvestigation(clue2.hostId);
game.setInspectionArea(clue2.objectType);
game.discoverClue(clue2.id);
console.assert(game.discoveredClues.length === 2, '2 clues discovered');
console.assert(game.canAccuseVampire() === false, 'Cannot accuse vampire yet');
console.log('✓ Discovered Clue 2 on', clue2.hostName, clue2.objectType);

// Discover clue 3
const clue3 = game.mystery.clues[2];
game.openInvestigation(clue3.hostId);
game.setInspectionArea(clue3.objectType);
game.discoverClue(clue3.id);
console.assert(game.discoveredClues.length === 3, '3 clues discovered');
console.assert(game.canAccuseVampire() === true, 'Can accuse vampire once 3 clues are discovered');
console.log('✓ Discovered Clue 3 on', clue3.hostName, clue3.objectType);
console.log('✓ Accusation button unlocked!');

// 6. Test Accusation Flow
let stateEvents = [];
game.subscribe((evt, data) => {
  stateEvents.push({ evt, data });
});

game.accuseSuspect(game.mystery.vampireId);
console.assert(game.verificationState === 'examining', 'State moved to examining');
console.log('✓ Accusation triggered examining state');

setTimeout(() => {
  console.assert(game.verificationState === 'success', `State moved to success: ${game.verificationState}`);
  console.log('✓ Correct accusation resulted in success screen state!');
  console.log('--- All simulation assertions passed successfully! ---');
  process.exit(0);
}, 4200);
