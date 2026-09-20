/**
 * HALLOWEEN VAMPIRE PUB — INVESTIGATION UI CONTROLLER
 * Coordinates table interactions, investigation overlay, hotspots, click-and-hold clue discovery,
 * evidence board, and vampire accusation result flows.
 */

import { SharingCard } from './sharing-card.js';

const PUMPKIN_EMPTY = 'assets/icons/pumpkin-empty.svg';
const PUMPKIN_HALF = 'https://ik.imagekit.io/HUDs/halloween/pumpkin%20half%20filled.svg?updatedAt=1789896688386';
const PUMPKIN_FILLED = 'https://ik.imagekit.io/HUDs/halloween/pumpkin%20filled.svg?updatedAt=1789896688565';

export class InvestigationUI {
  constructor(gameState, soundEngine) {
    this.state = gameState;
    this.sound = soundEngine;

    this.canHover = false;
    this.holdTimer = null;
    this.holdStartTime = 0;
    this.holdDurationMs = 1100; // 1.1s responsive click-and-hold duration

    this.initDOMElements();
    this.sharingCard = new SharingCard(this.sound);
    this.bindEvents();
    this.renderTableCharacters();
    this.renderTopCluesCounter();

    // Subscribe to state changes
    this.state.subscribe((event, data) => this.handleStateChange(event, data));
  }

  initDOMElements() {
    // Pub Scene elements
    this.charsLayer = document.getElementById('chars-layer');
    this.bgLayer = document.getElementById('bg-layer');
    this.fgLayer = document.getElementById('fg-layer');
    this.topCluesBox = document.querySelector('.top-ui .clues-box');

    // Investigation Overlay
    this.overlay = document.getElementById('investigation-overlay');
    this.backToTableBtn = document.getElementById('back-to-table-btn');
    
    // Left Toolbar buttons
    this.toolBtns = {
      face: document.getElementById('tool-btn-face'),
      drink: document.getElementById('tool-btn-drink'),
      purse: document.getElementById('tool-btn-purse'),
      shoe: document.getElementById('tool-btn-shoe'),
      hand: document.getElementById('tool-btn-hand')
    };

    // Stage elements
    this.stageImg = document.getElementById('stage-character-img');
    this.characterDisplayContainer = document.querySelector('.character-display-container');
    this.hotspotsWrapper = document.getElementById('hotspots-wrapper');
    this.characterNameDisplay = document.getElementById('character-name-display');
    this.prevCharBtn = document.getElementById('prev-char-btn');
    this.nextCharBtn = document.getElementById('next-char-btn');

    // Clue discovery hold target
    this.clueHoldTarget = document.getElementById('clue-hold-target');
    this.holdProgressCircle = document.getElementById('hold-progress-circle');

    // Right panel elements
    this.investigationPumpkins = [
      document.getElementById('inv-pumpkin-0'),
      document.getElementById('inv-pumpkin-1'),
      document.getElementById('inv-pumpkin-2')
    ];
    this.evidenceEmpty = document.getElementById('evidence-empty');
    this.evidenceList = document.getElementById('evidence-list');
    this.dialogueText = document.getElementById('dialogue-text');
    this.dialogueAuthor = document.getElementById('dialogue-author');
    this.foundVampireBtn = document.getElementById('found-vampire-btn');

    // Modals
    this.clueModal = document.getElementById('clue-modal');
    this.clueModalTitle = document.getElementById('clue-modal-title');
    this.clueModalText = document.getElementById('clue-modal-text');
    this.clueModalUnderstoodBtn = document.getElementById('clue-understood-btn');

    this.accusationModal = document.getElementById('accusation-modal');
    this.suspectsGrid = document.getElementById('suspects-grid');
    this.cancelAccusationBtn = document.getElementById('cancel-accusation-btn');

    this.verificationBlackout = document.getElementById('verification-blackout');
    this.verificationText = document.getElementById('verification-text');

    this.resultModal = document.getElementById('result-modal');
    this.resultCharImg = document.getElementById('result-char-img');
    this.resultTitle = document.getElementById('result-title');
    this.resultDesc = document.getElementById('result-desc');
    this.resultHomeBtn = document.getElementById('result-home-btn');
    this.resultShareBtn = document.getElementById('result-share-btn');
    this.shareToast = document.getElementById('share-toast');
  }

  bindEvents() {
    // Back to table
    this.backToTableBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sound.playClick();
      this.state.backToTable();
    });

    // Toolbar area buttons
    Object.entries(this.toolBtns).forEach(([area, btn]) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playClick();
        if (this.state.activeInspectionArea === area) {
          // Clicking active area toggles back to full view
          this.state.setInspectionArea('full');
        } else {
          this.state.setInspectionArea(area);
        }
      });
    });

    // Character Prev / Next (bounded 0 to 5)
    this.prevCharBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.state.canPrevCharacter()) return;
      this.sound.playClick();
      this.state.prevCharacter();
    });

    this.nextCharBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.state.canNextCharacter()) return;
      this.sound.playClick();
      this.state.nextCharacter();
    });

    // Click on clue indicator boxes opens written clue modal (Figma 13:888)
    if (this.topCluesBox) {
      this.topCluesBox.style.cursor = 'pointer';
      this.topCluesBox.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playClick();
        this.openCluesModalList();
      });
    }

    const counterBox = document.querySelector('.panel-header-controls .counter-box');
    if (counterBox) {
      counterBox.style.cursor = 'pointer';
      counterBox.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playClick();
        this.openCluesModalList();
      });
    }

    const largeEvidenceBox = document.querySelector('.large-evidence-box');
    if (largeEvidenceBox) {
      largeEvidenceBox.style.cursor = 'pointer';
      largeEvidenceBox.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playClick();
        this.openCluesModalList();
      });
    }

    // Clue Discovery Click-and-Hold
    this.setupHoldInteractions();

    // Clue Modal Understood
    this.clueModalUnderstoodBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sound.playClick();
      this.clueModal.classList.remove('visible');
    });

    // Found Vampire button
    this.foundVampireBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.state.canAccuseVampire()) return;
      this.sound.playClick();
      this.openAccusationModal();
    });

    // Cancel accusation
    this.cancelAccusationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sound.playClick();
      this.accusationModal.classList.remove('visible');
      document.body.classList.remove('accusing');
      document.body.classList.add('investigating');
    });

    // Result Home/Retry Button: quick fade to black then navigate to index.html
    this.resultHomeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sound.playClick();
      this.resultModal.classList.remove('visible');

      // Full pitch black screen
      this.verificationBlackout.style.background = '#000000';
      this.verificationBlackout.classList.add('visible');
      this.verificationText.style.display = 'none';

      // Gracefully silence sound
      if (this.sound) {
        try { this.sound.stopSuspenseHeartbeat(); } catch(e) {}
        try { this.sound.mute(); } catch(e) {}
      }

      // Navigate after short black pause (use replace to avoid page2 reload guard)
      setTimeout(() => {
        window.location.replace('index.html');
      }, 900);
    });

    this.resultShareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sound.playClick();
      this.copyShareMystery();
      if (this.sharingCard) {
        this.sharingCard.open();
      }
    });
  }

  /**
   * Set up click-and-hold gestures on clue target
   */
  setupHoldInteractions() {
    const startHold = (e) => {
      if (this.isHolding) return;
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      const activeClue = this.state.getActiveObjectClue();
      if (!activeClue) return;

      this.isHolding = true;
      this.holdStartTime = Date.now();
      this.clueHoldTarget.classList.add('holding');

      try {
        const target = e.currentTarget || this.clueHoldTarget;
        if (e && e.pointerId != null && target && target.setPointerCapture) {
          target.setPointerCapture(e.pointerId);
          this._capturedPointerId = e.pointerId;
          this._capturingEl = target;
        }
      } catch (err) {}

      // Set half-filled pumpkin indicator during active hold (Section 21)
      this.updatePumpkinHoldState(true);

      const tick = () => {
        if (!this.isHolding) return;
        const elapsed = Date.now() - this.holdStartTime;
        const progress = Math.min(1, elapsed / this.holdDurationMs);

        // Update progress ring offset (circumference = 188.5)
        const offset = 188.5 * (1 - progress);
        if (this.holdProgressCircle) {
          this.holdProgressCircle.style.strokeDashoffset = offset;
        }

        // Tension procedural audio
        this.sound.playHoldProgress(progress);

        if (progress >= 1) {
          // Completed!
          this.finishHold(activeClue);
        } else {
          this.holdTimer = requestAnimationFrame(tick);
        }
      };

      this.holdTimer = requestAnimationFrame(tick);
    };

    const cancelHold = (e) => {
      if (!this.isHolding) return;
      this.isHolding = false;
      if (this.holdTimer) cancelAnimationFrame(this.holdTimer);
      this.sound.stopHoldSound();
      this.clueHoldTarget.classList.remove('holding');

      if (this._capturedPointerId != null && this._capturingEl) {
        try {
          this._capturingEl.releasePointerCapture(this._capturedPointerId);
        } catch (err) {}
        this._capturedPointerId = null;
        this._capturingEl = null;
      }

      if (this.holdProgressCircle) {
        this.holdProgressCircle.style.strokeDashoffset = '188.5';
      }

      // Revert half-filled pumpkin back to empty
      this.updatePumpkinHoldState(false);
    };

    // Single listener on the container — all children are pointer-events:none via CSS
    this.clueHoldTarget.addEventListener('pointerdown', startHold);
    this.clueHoldTarget.addEventListener('mousedown', startHold);

    window.addEventListener('pointerup', cancelHold);
    window.addEventListener('mouseup', cancelHold);
    window.addEventListener('pointercancel', cancelHold);
  }

  finishHold(clue) {
    this.isHolding = false;
    this.clueHoldTarget.classList.remove('holding');

    if (this._capturedPointerId != null && this._capturingEl) {
      try {
        this._capturingEl.releasePointerCapture(this._capturedPointerId);
      } catch (err) {}
      this._capturedPointerId = null;
      this._capturingEl = null;
    }

    if (this.holdProgressCircle) {
      this.holdProgressCircle.style.strokeDashoffset = '188.5';
    }

    this.sound.playClueChime();
    this.state.discoverClue(clue.id);

    // Show Clue Reveal Modal (Figma 13:888)
    this.showClueModal(clue);
  }

  showClueModal(clue) {
    this.clueModalTitle.textContent = 'clue';
    this.clueModalText.textContent = clue.text;
    this.clueModalUnderstoodBtn.textContent = 'understood';
    this.clueModal.classList.add('visible');
  }

  openCluesModalList() {
    const clues = this.state.discoveredClues;
    if (clues.length === 0) {
      this.clueModalTitle.textContent = 'clues';
      this.clueModalText.innerHTML = '<span class="empty-clues-text">not any clues found</span>';
      this.clueModalUnderstoodBtn.textContent = 'close'; // Button text is "close" when no clues found
    } else {
      this.clueModalTitle.textContent = 'clues';
      this.clueModalText.innerHTML = clues.map(c =>
        `<div style="margin-bottom: 14px; border-bottom: 1px dashed rgba(15,13,28,0.25); padding: 16px; box-sizing: border-box; background: rgba(0,0,0,0.03); border-radius: 4px;">
          <span style="font-family:'Jolly Lodger',cursive; font-size:34px; line-height:1.15; color:#0f0d1c;">${c.text}</span>
        </div>`
      ).join('');
      this.clueModalUnderstoodBtn.textContent = 'understood';
    }
    this.clueModal.classList.add('visible');
  }

  /**
   * Render characters at the pub table screen with randomized positions
   */
  renderTableCharacters() {
    this.charsLayer.innerHTML = '';

    this.state.mystery.characters.forEach((char) => {
      const slot = document.createElement('div');
      slot.className = 'char-slot';
      slot.dataset.id = char.id;

      const img = document.createElement('img');
      img.src = char.images.full;
      img.alt = char.name;
      img.draggable = false;

      slot.appendChild(img);
      this.charsLayer.appendChild(slot);
    });

    if (this._tableHitboxBound) return;
    this._tableHitboxBound = true;

    let currentHoveredCharId = null;

    const clearHover = () => {
      if (currentHoveredCharId !== null) {
        currentHoveredCharId = null;
        this.charsLayer.classList.remove('hover-active');
        this.bgLayer.classList.remove('dimmed');
        this.fgLayer.classList.remove('dimmed');
        const slots = this.charsLayer.querySelectorAll('.char-slot');
        slots.forEach(s => s.classList.remove('hovered'));
        this.charsLayer.style.cursor = 'default';
      }
    };
    this._clearTableHover = clearHover;

    this.charsLayer.addEventListener('pointermove', (e) => {
      if (!this.canHover) {
        clearHover();
        return;
      }

      const slots = Array.from(this.charsLayer.querySelectorAll('.char-slot'));
      if (slots.length === 0) return;

      const layerRect = this.charsLayer.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Only within the vertical bounds of the characters
      if (mouseY < layerRect.top || mouseY > layerRect.bottom) {
        clearHover();
        return;
      }

      // Check horizontal bounds across all characters
      const firstRect = slots[0].getBoundingClientRect();
      const lastRect = slots[slots.length - 1].getBoundingClientRect();
      if (mouseX < firstRect.left - 20 || mouseX > lastRect.right + 20) {
        clearHover();
        return;
      }

      // Find character whose horizontal center is closest to mouseX
      let closestSlot = null;
      let minDistance = Infinity;

      slots.forEach((slot) => {
        const rect = slot.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const dist = Math.abs(mouseX - centerX);
        if (dist < minDistance) {
          minDistance = dist;
          closestSlot = slot;
        }
      });

      if (closestSlot) {
        const charId = closestSlot.dataset.id;
        if (currentHoveredCharId !== charId) {
          currentHoveredCharId = charId;
          this.charsLayer.classList.add('hover-active');
          this.bgLayer.classList.add('dimmed');
          this.fgLayer.classList.add('dimmed');
          slots.forEach(s => s.classList.remove('hovered'));
          closestSlot.classList.add('hovered');
          this.charsLayer.style.cursor = 'pointer';
        }
      } else {
        clearHover();
      }
    });

    this.charsLayer.addEventListener('pointerleave', clearHover);

    this.charsLayer.addEventListener('click', (e) => {
      if (!this.canHover || !currentHoveredCharId) return;
      e.stopPropagation();
      this.sound.playClick();
      const targetId = currentHoveredCharId;
      clearHover();
      this.state.openInvestigation(targetId);
    });
  }

  /**
   * Update top clue counters in pub screen & investigation header
   */
  renderTopCluesCounter() {
    const totalDiscovered = this.state.discoveredClues.length;

    // Table screen counter (small clue indicator on top)
    if (this.topCluesBox) {
      const slots = this.topCluesBox.querySelectorAll('.pumpkin-slot img');
      slots.forEach((img, idx) => {
        img.src = idx < totalDiscovered ? PUMPKIN_FILLED : PUMPKIN_EMPTY;
      });
    }

    // Investigation screen counter (small clue indicator on top)
    this.investigationPumpkins.forEach((img, idx) => {
      img.src = idx < totalDiscovered ? PUMPKIN_FILLED : PUMPKIN_EMPTY;
    });

    // Accusation screen counter (small clue indicator on top)
    const accusePumpkins = [
      document.getElementById('accuse-pumpkin-0'),
      document.getElementById('accuse-pumpkin-1'),
      document.getElementById('accuse-pumpkin-2')
    ];
    accusePumpkins.forEach((img, idx) => {
      if (img) img.src = idx < totalDiscovered ? PUMPKIN_FILLED : PUMPKIN_EMPTY;
    });
  }

  /**
   * Updates half-filled pumpkin during active hold (Section 21)
   */
  updatePumpkinHoldState(isHolding) {
    const totalDiscovered = this.state.discoveredClues.length;
    if (totalDiscovered >= 3) return;

    const targetSlot = this.investigationPumpkins[totalDiscovered];
    if (targetSlot) {
      targetSlot.src = isHolding ? PUMPKIN_HALF : PUMPKIN_EMPTY;
    }
  }

  /**
   * Render Large Evidence Box (Figma 13:234, 13:851 - States 0, 1, 2, 3)
   */
  renderEvidencePanel() {
    const discovered = this.state.discoveredClues;
    const count = discovered.length;

    if (count === 0) {
      // State 0: Empty
      this.evidenceEmpty.style.display = 'flex';
      this.evidenceList.style.display = 'none';
      this.evidenceList.innerHTML = '';
    } else {
      // State 1, 2, 3: Active clues
      this.evidenceEmpty.style.display = 'none';
      this.evidenceList.style.display = 'flex';
      this.evidenceList.innerHTML = '';

      for (let i = 0; i < 3; i++) {
        const row = document.createElement('div');
        row.className = 'evidence-row';

        const img = document.createElement('img');
        img.className = 'evidence-pumpkin';

        const textSpan = document.createElement('span');
        textSpan.className = 'evidence-text';

        if (i < count) {
          img.src = PUMPKIN_HALF;
          textSpan.textContent = discovered[i].text;
          row.style.cursor = 'pointer';
          row.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound.playClick();
            this.showClueModal(discovered[i]);
          });
        } else {
          img.src = PUMPKIN_EMPTY;
          textSpan.textContent = '...';
          row.classList.add('empty');
        }

        row.appendChild(img);
        row.appendChild(textSpan);
        this.evidenceList.appendChild(row);
      }
    }

    // Update Found Vampire Button
    if (count === 3) {
      this.foundVampireBtn.classList.add('enabled');
    } else {
      this.foundVampireBtn.classList.remove('enabled');
    }
  }

  /**
   * Render the active character and current inspection area
   */
  renderActiveCharacterStage() {
    const character = this.state.getActiveCharacter();
    if (!character) return;

    const area = this.state.activeInspectionArea;

    // 1. Update Name and Prev / Next arrow bounds (0 to 5)
    this.characterNameDisplay.textContent = character.name;

    const currentIndex = this.state.mystery.characters.findIndex(c => c.id === character.id);
    const maxIndex = this.state.mystery.characters.length - 1;
    this.prevCharBtn.disabled = currentIndex <= 0;
    this.nextCharBtn.disabled = currentIndex >= maxIndex;
    this.prevCharBtn.classList.toggle('disabled', currentIndex <= 0);
    this.nextCharBtn.classList.toggle('disabled', currentIndex >= maxIndex);

    // 2. Update Image with blur-fade transition
    const targetImgSrc = area === 'full' ? character.images.full : character.images[area];

    // Add 48px gap between back-to-table and image when in area-inspection view
    if (this.characterDisplayContainer) {
      this.characterDisplayContainer.classList.toggle('area-view', area !== 'full');
    }
    
    // Blur-fade transition: instantly swap src, then play blur-fade-in animation
    this.stageImg.style.animation = 'none';
    this.stageImg.style.opacity = '0';
    this.stageImg.style.filter = 'blur(20px)';
    // Force reflow then swap & animate
    void this.stageImg.offsetWidth;
    this.stageImg.src = targetImgSrc;
    this.stageImg.alt = `${character.name} - ${area}`;
    this.stageImg.style.animation = '';
    this.stageImg.classList.add('blur-fade-enter');
    this.stageImg.addEventListener('animationend', () => {
      this.stageImg.classList.remove('blur-fade-enter');
      this.stageImg.style.opacity = '';
      this.stageImg.style.filter = '';
    }, { once: true });

    // 3. Update Left Toolbar Buttons Active State
    Object.entries(this.toolBtns).forEach(([btnArea, btn]) => {
      if (btnArea === area) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
      // Remove any hint class (no orange dot hints)
      btn.classList.remove('has-clue-hint');
    });

    // 4. Hotspots overlay removed as requested (no entry points or hover circles on image)
    if (this.hotspotsWrapper) {
      this.hotspotsWrapper.innerHTML = '';
    }

    // 5. Clue discovery hold target
    const activeClue = this.state.getActiveObjectClue();
    if (activeClue) {
      this.clueHoldTarget.style.display = 'flex';
    } else {
      this.clueHoldTarget.style.display = 'none';
    }

    // 6. Dialogue block
    const activeDialogue = this.state.mystery.activeDialogues[character.id];
    if (activeDialogue) {
      this.dialogueText.textContent = `“${activeDialogue.text}”`;
      this.dialogueAuthor.textContent = `- ${character.name}`;
    }
  }

  /**
   * Render clickable hotspots on full character artwork (Section 13)
   */
  renderHotspots(character) {
    Object.entries(character.hotspots).forEach(([area, coords]) => {
      const spot = document.createElement('div');
      spot.className = 'inspect-hotspot';
      spot.style.top = `${coords.top}%`;
      spot.style.left = `${coords.left}%`;
      spot.style.width = `${coords.width}%`;
      spot.style.height = `${coords.height}%`;
      spot.dataset.area = area;

      const hasClue = this.state.mystery.clues.some(c => 
        c.hostId === character.id && 
        c.objectType === area && 
        !this.state.discoveredClues.some(dc => dc.id === c.id)
      );
      if (hasClue) {
        spot.classList.add('active-tool');
      }

      const label = document.createElement('span');
      label.className = 'hotspot-label';
      label.textContent = hasClue ? `inspect ${area} ✦` : `inspect ${area}`;
      spot.appendChild(label);

      spot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playClick();
        this.state.setInspectionArea(area);
      });

      this.hotspotsWrapper.appendChild(spot);
    });
  }

  /**
   * Accusation selection modal (Section 27)
   */
  openAccusationModal() {
    this.suspectsGrid.innerHTML = '';

    this.state.mystery.characters.forEach((char) => {
      const card = document.createElement('div');
      card.className = 'suspect-card';
      card.dataset.id = char.id;

      const avatar = document.createElement('div');
      avatar.className = 'suspect-avatar';
      const img = document.createElement('img');
      img.src = char.images.face;
      img.alt = char.name;
      avatar.appendChild(img);

      const name = document.createElement('p');
      name.className = 'suspect-card-name';
      name.textContent = char.name;

      card.appendChild(avatar);
      card.appendChild(name);

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playClick();
        this.accusationModal.classList.remove('visible');
        document.body.classList.remove('accusing');
        document.body.classList.remove('investigating');
        this.state.accuseSuspect(char.id);
      });

      this.suspectsGrid.appendChild(card);
    });

    this.accusationModal.classList.add('visible');
    document.body.classList.remove('investigating');
    document.body.classList.add('accusing');
  }

  /**
   * Copy share result to clipboard
   */
  copyShareMystery() {
    const isCorrect = this.state.verificationState === 'success';
    const text = isCorrect
      ? `🦇 I identified the Vampire (${this.state.mystery.vampireName}) inside the Gothic Pub Halloween mystery!`
      : `🦇 The Vampire (${this.state.mystery.vampireName}) escaped my investigation in the Gothic Pub mystery! Can you solve it?`;

    navigator.clipboard?.writeText(text).then(() => {
      this.showToast('Mystery result copied to clipboard!');
    }).catch(() => {
      this.showToast('Could not access clipboard.');
    });
  }

  showToast(msg) {
    if (!this.shareToast) return;
    this.shareToast.textContent = msg;
    this.shareToast.classList.add('show');
    setTimeout(() => {
      this.shareToast.classList.remove('show');
    }, 2800);
  }

  /**
   * Handle state broadcast events
   */
  handleStateChange(event, data) {
    switch (event) {
      case 'new_game':
        document.body.classList.remove('investigating');
        document.body.classList.remove('accusing');
        this.overlay.classList.remove('active');
        this.renderTableCharacters();
        this.renderTopCluesCounter();
        this.renderEvidencePanel();
        break;

      case 'investigation_opened':
        document.body.classList.add('investigating');
        document.body.classList.remove('accusing');
        this.overlay.classList.add('active');
        this.renderActiveCharacterStage();
        this.renderTopCluesCounter();
        this.renderEvidencePanel();
        break;

      case 'back_to_table':
        document.body.classList.remove('investigating');
        document.body.classList.remove('accusing');
        this.overlay.classList.remove('active');
        this.renderTopCluesCounter();
        break;

      case 'inspection_changed':
        this.renderActiveCharacterStage();
        break;

      case 'clue_discovered':
        this.renderTopCluesCounter();
        this.renderEvidencePanel();
        this.renderActiveCharacterStage();
        break;

      case 'verification_state_changed':
        this.handleVerificationState(data);
        break;
    }
  }

  handleVerificationState(data) {
    const { state, isCorrect, suspectId, vampireName } = data;

    if (state === 'examining') {
      this.verificationBlackout.classList.add('visible');
      this.verificationText.style.display = 'block';
      this.verificationText.textContent = 'examining evidence...';
      this.sound.playSuspenseHeartbeat();
    } else if (state === 'blackout') {
      // Full black screen suspense (Section 29)
      this.verificationText.style.display = 'none';
      this.sound.playSuspenseHeartbeat();
    } else if (state === 'success' || state === 'fail') {
      this.verificationBlackout.classList.remove('visible');

      const suspect = this.state.mystery.characters.find(c => c.id === this.state.selectedSuspectId);
      const vampire = this.state.mystery.characters.find(c => c.id === this.state.mystery.vampireId);

      this.resultCharImg.src = isCorrect ? suspect.images.face : vampire.images.face;

      if (isCorrect) {
        this.sound.playVictorySting();
        this.resultTitle.textContent = 'You found the vampire';
        this.resultDesc.textContent = `“${suspect.name}” is the hidden vampire in the halloween party, thanks for finding out!`;
        this.resultHomeBtn.textContent = 'home';
      } else {
        this.sound.playDefeatSting();
        this.resultTitle.textContent = 'hmm.. you are wrong';
        this.resultDesc.textContent = `“${vampire.name}” is the hidden vampire in the halloween party, better luck next time!`;
        this.resultHomeBtn.textContent = 'retry';
      }

      this.resultModal.classList.add('visible');
    }
  }
}
