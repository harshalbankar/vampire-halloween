/**
 * HALLOWEEN VAMPIRE PUB — CENTRALIZED GAME STATE STORE
 * Manages game sessions, discovered evidence, active navigation, and accusation lifecycle.
 */

import { generateMystery } from './mystery-generator.js';

export class GameState {
  constructor() {
    this.listeners = new Set();
    this.mystery = null;
    this.discoveredClues = []; // Array of clue objects discovered in this session
    this.activeCharacterId = null; // null = pub table, or character id
    this.activeInspectionArea = 'full'; // 'full' | 'face' | 'drink' | 'purse' | 'shoe' | 'hand'
    this.activeClueHold = {
      isHolding: false,
      progress: 0, // 0 to 1
      targetClueId: null
    };
    this.selectedSuspectId = null;
    this.verificationState = 'idle'; // 'idle' | 'examining' | 'blackout' | 'success' | 'fail'

    // Initialize first mystery
    this.startNewGame();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    for (const listener of this.listeners) {
      try {
        listener(event, data, this);
      } catch (err) {
        console.error('GameState listener error:', err);
      }
    }
  }

  /**
   * Resets and generates a fresh mystery session
   */
  startNewGame() {
    this.mystery = generateMystery();
    this.discoveredClues = [];
    this.activeCharacterId = null;
    this.activeInspectionArea = 'full';
    this.activeClueHold = { isHolding: false, progress: 0, targetClueId: null };
    this.selectedSuspectId = null;
    this.verificationState = 'idle';

    this.notify('new_game', { mystery: this.mystery });
  }

  /**
   * Open investigation screen for a specific character
   */
  openInvestigation(characterId) {
    const character = this.mystery.characters.find(c => c.id === characterId);
    if (!character) return;

    this.activeCharacterId = characterId;
    this.activeInspectionArea = 'full'; // Section 10: ALWAYS open with full character image
    this.activeClueHold = { isHolding: false, progress: 0, targetClueId: null };

    this.notify('investigation_opened', { character, inspectionArea: 'full' });
  }

  /**
   * Return to the pub table screen (Section 34)
   * Discovered clues remain globally preserved.
   */
  backToTable() {
    this.activeCharacterId = null;
    this.activeInspectionArea = 'full';
    this.activeClueHold = { isHolding: false, progress: 0, targetClueId: null };

    this.notify('back_to_table', { discoveredClues: this.discoveredClues });
  }

  /**
   * Switch inspection area for current character
   */
  setInspectionArea(area) {
    if (!this.activeCharacterId) return;
    this.activeInspectionArea = area;
    this.activeClueHold = { isHolding: false, progress: 0, targetClueId: null };

    this.notify('inspection_changed', {
      characterId: this.activeCharacterId,
      inspectionArea: area
    });
  }

  /**
   * Navigate to next character in seating order (0 to 5, no looping)
   * Always begins with their FULL character image!
   */
  nextCharacter() {
    if (!this.activeCharacterId) return;
    const currentIndex = this.mystery.characters.findIndex(c => c.id === this.activeCharacterId);
    if (currentIndex < this.mystery.characters.length - 1) {
      const nextChar = this.mystery.characters[currentIndex + 1];
      this.openInvestigation(nextChar.id);
    }
  }

  /**
   * Navigate to previous character in seating order (0 to 5, no looping)
   * Always begins with their FULL character image!
   */
  prevCharacter() {
    if (!this.activeCharacterId) return;
    const currentIndex = this.mystery.characters.findIndex(c => c.id === this.activeCharacterId);
    if (currentIndex > 0) {
      const prevChar = this.mystery.characters[currentIndex - 1];
      this.openInvestigation(prevChar.id);
    }
  }

  canPrevCharacter() {
    if (!this.activeCharacterId) return false;
    const currentIndex = this.mystery.characters.findIndex(c => c.id === this.activeCharacterId);
    return currentIndex > 0;
  }

  canNextCharacter() {
    if (!this.activeCharacterId) return false;
    const currentIndex = this.mystery.characters.findIndex(c => c.id === this.activeCharacterId);
    return currentIndex < this.mystery.characters.length - 1;
  }

  /**
   * Check if current active character & object has an undiscovered clue
   */
  getActiveObjectClue() {
    if (!this.activeCharacterId || this.activeInspectionArea === 'full' || this.activeInspectionArea === 'face') {
      return null;
    }

    // Find if a clue exists on this character and object
    const clue = this.mystery.clues.find(c => 
      c.hostId === this.activeCharacterId && 
      c.objectType === this.activeInspectionArea &&
      !this.discoveredClues.some(dc => dc.id === c.id)
    );

    return clue || null;
  }

  /**
   * Update active click-and-hold progress
   */
  setHoldProgress(progress, clueId = null) {
    this.activeClueHold.isHolding = progress > 0;
    this.activeClueHold.progress = Math.min(1, Math.max(0, progress));
    this.activeClueHold.targetClueId = clueId;

    this.notify('hold_progress', { ...this.activeClueHold });
  }

  /**
   * Complete clue discovery and record permanently
   */
  discoverClue(clueId) {
    const clue = this.mystery.clues.find(c => c.id === clueId);
    if (!clue) return;

    if (!this.discoveredClues.some(dc => dc.id === clue.id)) {
      clue.discovered = true;
      this.discoveredClues.push(clue);
    }

    this.activeClueHold = { isHolding: false, progress: 0, targetClueId: null };

    this.notify('clue_discovered', {
      clue,
      totalDiscovered: this.discoveredClues.length,
      allDiscovered: this.discoveredClues.length === 3
    });
  }

  /**
   * Checks if accusation is unlocked (Section 26: exactly 3 clues)
   */
  canAccuseVampire() {
    return this.discoveredClues.length === 3;
  }

  /**
   * Initiate vampire accusation and verification flow (Sections 27, 28, 29, 30, 31)
   */
  accuseSuspect(suspectId) {
    if (!this.canAccuseVampire()) return;

    this.selectedSuspectId = suspectId;
    this.verificationState = 'examining';
    this.notify('verification_state_changed', { state: 'examining', suspectId });

    // Step 1: Verification prompt for 1.4s
    setTimeout(() => {
      this.verificationState = 'blackout';
      this.notify('verification_state_changed', { state: 'blackout', suspectId });

      // Step 2: Full blackout suspense pause for 2.6s (Section 29)
      setTimeout(() => {
        const isCorrect = suspectId === this.mystery.vampireId;
        this.verificationState = isCorrect ? 'success' : 'fail';
        this.notify('verification_state_changed', {
          state: this.verificationState,
          isCorrect,
          selectedSuspectId: suspectId,
          vampireId: this.mystery.vampireId,
          vampireName: this.mystery.vampireName
        });
      }, 2600);
    }, 1400);
  }

  /**
   * Current active character object
   */
  getActiveCharacter() {
    if (!this.activeCharacterId) return null;
    return this.mystery.characters.find(c => c.id === this.activeCharacterId) || null;
  }
}
