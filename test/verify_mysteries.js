import { generateMystery, validateMystery } from '../js/mystery-generator.js';

console.log('Testing 500 procedural mystery generations...');

let vampireAsHostCount = 0;
let totalTests = 500;

for (let i = 0; i < totalTests; i++) {
  const mystery = generateMystery();
  const validation = validateMystery(mystery);
  
  if (!validation.valid) {
    console.error(`Failed at iteration ${i}:`, validation.reason);
    process.exit(1);
  }

  // Verify constraints explicitly
  if (mystery.clues.length !== 3) {
    console.error(`Iteration ${i}: Clues length is ${mystery.clues.length}`);
    process.exit(1);
  }

  const hosts = mystery.clues.map(c => c.hostId);
  if (new Set(hosts).size !== 3) {
    console.error(`Iteration ${i}: Duplicate host in ${hosts}`);
    process.exit(1);
  }

  const objects = mystery.clues.map(c => c.objectType);
  if (objects.includes('face')) {
    console.error(`Iteration ${i}: Clue placed on face!`);
    process.exit(1);
  }

  if (hosts.includes(mystery.vampireId)) {
    vampireAsHostCount++;
  }
}

console.log(`Success! All ${totalTests} mysteries passed all 10 validation rules.`);
console.log(`Vampire hosted a clue in ${vampireAsHostCount} out of ${totalTests} games (${(vampireAsHostCount/totalTests*100).toFixed(1)}%).`);
