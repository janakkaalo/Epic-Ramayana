# Epic Ramayana - 2D Platformer Game

A beautiful 2D platformer game based on **Valmiki Ramayana** (Bala Kanda & Ayodhya Kanda), featuring traditional Indian art, pure archery combat, and fully animated backgrounds.

## 🎮 Game Overview

- **Engine:** Phaser 3 with TypeScript
- **Art Style:** Traditional Indian Art (Rajput/Mughal/Madhubani inspired)
- **Story:** 100% accurate to Valmiki Ramayana
- **Scope:** 15 levels covering Bala Kanda and Ayodhya Kanda
- **Combat:** Pure archery system with divine Astras
- **Features:** Dharma system, companion AI, animated backgrounds

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (24 recommended)
- pnpm 10+

### Installation

```bash
# Install dependencies
pnpm install

# Run the game in development mode
pnpm --filter @workspace/ramayana-game run dev
```

Then open http://localhost:5173

### Build for Production

```bash
pnpm run build
```

## 📂 Project Structure

```
artifacts/ramayana-game/
├── public/
│   └── assets/                 # Game assets (sprites, audio, backgrounds)
├── src/
│   ├── game/
│   │   ├── phaser/            # Phaser 3 game code
│   │   │   ├── scenes/        # Game scenes (levels, menus)
│   │   │   ├── entities/      # Game entities (Player, Enemy, etc.)
│   │   │   ├── weapons/       # Bow, arrows, astras
│   │   │   ├── systems/       # Game systems (combat, dharma)
│   │   │   ├── managers/      # Managers (input, audio, camera)
│   │   │   └── config/        # Configuration files
│   │   └── store.ts           # Game state management
│   ├── components/            # React UI components
│   └── main.tsx               # Entry point
```

## 🎯 Game Features

### Currently Implemented

✅ Phaser 3 game engine integration  
✅ Player character (Rama) with full movement  
✅ Archery combat system with aiming  
✅ Platforming mechanics (jump, run, double jump)  
✅ Dharma tracking system  
✅ Health and mana systems  
✅ Basic level architecture  
✅ Main menu and UI

### In Progress

🚧 Arrow projectile physics  
🚧 Enemy AI system  
🚧 Astra special abilities  
🚧 Level 1: Valmiki's Ashram (full implementation)  
🚧 Traditional art assets  
🚧 Background animations  
🚧 Audio system

### Planned

📋 All 15 levels from Bala & Ayodhya Kandas  
📋 Boss battles (Tataka, etc.)  
📋 Companion AI (Lakshmana)  
📋 Dialogue system  
📋 Save/load system  
📋 Achievements

## 🎮 Controls

- **Arrow Keys** - Move left/right
- **UP Arrow** - Jump (press twice for double jump when unlocked)
- **SHIFT** - Run
- **SPACE** - Aim bow (hold) / Shoot arrow (release)
- **1-5 Keys** - Use divine Astras (when unlocked)
- **ESC** - Pause menu

## 📖 Story - Valmiki Ramayana

### Act 1: Bala Kanda (8 Levels)

1. **The Question of Perfection** - Valmiki's Ashram
2. **The Sacred Yajna** - Putrakameshti Yajna in Ayodhya
3. **The Brothers' Training** - Archery tutorial
4. **The Sage's Request** - Journey to Siddhashrama
5. **Tataka's Terror** - First boss battle
6. **Guardian of the Yajna** - Tower defense style
7. **Journey to Mithila** - Ahalya's liberation
8. **The Divine Bow** - Sita's Swayamvara

### Act 2: Ayodhya Kanda (7 Levels)

9. **Rama Rajyabhisheka Preparation** - Coronation announcement
10. **The Poisoned Mind** - Manthara's conspiracy
11. **The Two Boons** - Rama's exile
12. **Farewell to Ayodhya** - Emotional departure
13. **The Charioteer's Trick** - Meeting Guha
14. **Crossing to Chitrakuta** - Hermitage building
15. **Bharata's Arrival** - The Paduka ceremony

## 🎨 Art Direction

### Visual Style

- **Traditional Indian Art** - Rajput paintings, Mughal miniatures, Madhubani
- **Rich Colors** - Gold, royal blue, deep red, emerald green
- **Ornate Details** - Intricate costumes, jewelry, architecture
- **Animated Backgrounds** - Multi-layer parallax with full scene animations

### Character Design

- **Rama** - Blue/dark skin, golden crown, red dhoti, divine aura
- **Lakshmana** - Orange dhoti, protective stance
- **Sita** - Golden saree, graceful movements
- **Bosses** - Dramatic, mythologically accurate designs

## 🎵 Audio

### Music Style

- Traditional Indian classical instruments (Sitar, Tabla, Bansuri)
- Orchestral support for epic moments
- Character leitmotifs
- Regional authenticity (North Indian classical)

### Planned Tracks

1. Main Menu - "Jai Shri Ram"
2. Ayodhya Theme - "Golden Kingdom"
3. Forest Exploration - "Dandaka Whispers"
4. Combat - "Warrior's Dharma"
5. Boss Battle - "Demoness' Wrath"
6. Sad Moments - "Exile's Sorrow"
7. Victory - "Dharma Prevails"

## 💻 Technical Details

### Technology Stack

- **Frontend:** React 18 + TypeScript
- **Game Engine:** Phaser 3.87+
- **Build Tool:** Vite 6
- **State Management:** Zustand
- **Physics:** Phaser Arcade Physics
- **Styling:** Tailwind CSS

### Performance

- Target: 60 FPS
- Resolution: 1280x720 (scales to fit)
- Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🔧 Development

### Project Commands

```bash
# Development
pnpm --filter @workspace/ramayana-game run dev

# Type checking
pnpm run typecheck

# Build
pnpm --filter @workspace/ramayana-game run build

# Preview production build
pnpm --filter @workspace/ramayana-game run serve
```

### Adding New Levels

1. Create scene in `src/game/phaser/scenes/Level{XX}_{Name}.ts`
2. Add level data to `src/game/phaser/config/levels.ts`
3. Register scene in `src/game/phaser/PhaserGame.ts`
4. Add assets to `public/assets/`

### Adding New Characters

1. Add character data to `src/game/phaser/config/characters.ts`
2. Create entity class in `src/game/phaser/entities/`
3. Add sprite assets to `public/assets/sprites/`

### Adding New Astras

1. Add astra data to `src/game/phaser/config/astras.ts`
2. Implement effects in `src/game/phaser/weapons/Astras/`
3. Add visual effects to assets

## 📚 Documentation

- **[Game Design Document](../../GAME_DESIGN_DOCUMENT.md)** - Complete GDD with all specifications
- **[Technical Specification](../../gdd_text.txt)** - Original 3D RPG concept (reference)
- **[Valmiki Ramayana Reference](http://www.valmikiramayan.net/)** - Source material

## 🙏 Cultural Accuracy

This game is developed with deep respect for Hindu culture and the sacred text of Valmiki Ramayana. We strive for:

- ✅ 100% story accuracy to Valmiki's narrative
- ✅ Respectful representation of deities and characters
- ✅ Authentic Sanskrit pronunciation and terminology
- ✅ Traditional visual styles honored
- ✅ Educational value and cultural context

## 🗺️ Roadmap

### Phase 1: Foundation (Current)

- [x] Set up Phaser 3 project
- [x] Create core player mechanics
- [x] Build basic platforming
- [x] Implement archery system
- [ ] Create Level 1

### Phase 2: Art Production (Next)

- [ ] Commission/create traditional art assets
- [ ] Rama character sprite sheets
- [ ] Environment backgrounds
- [ ] Boss designs

### Phase 3: Level Development

- [ ] Implement all 15 levels
- [ ] Boss battles
- [ ] Narrative cutscenes
- [ ] Dharma choice system

### Phase 4: Polish

- [ ] Audio integration
- [ ] UI/UX refinement
- [ ] Save/load system
- [ ] Performance optimization

### Phase 5: Launch

- [ ] Beta testing
- [ ] Story accuracy verification
- [ ] Public release

### Future Expansions

- Act 3: Aranya Kanda
- Act 4: Kishkindha Kanda
- Act 5: Sundara Kanda
- Act 6: Yuddha Kanda

## 🤝 Contributing

This is a cultural heritage project. Contributions are welcome, especially:

- Traditional Indian artists for authentic art assets
- Sanskrit scholars for accuracy verification
- Game developers for mechanics and systems
- Musicians for authentic Indian classical music
- Testers for feedback and bug reports

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Sage Valmiki for the immortal epic
- Traditional Indian artists for visual inspiration
- Indian classical musicians for audio inspiration
- The open-source game development community

## 📧 Contact

For questions, suggestions, or contributions, please open an issue on GitHub.

---

**"Dharma Eva Hato Hanti, Dharmo Rakshati Rakshitah"**  
_Righteousness destroys those who destroy it, and protects those who protect it_

**Jai Shri Ram! 🙏**
