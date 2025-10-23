# slime_stacker

A React Native puzzle game built with Expo, featuring adorable slime creatures and strategic block-stacking gameplay.

![Game Logo](<./assets/images/shamtaro_a_title_logo_for_a_game_called_slime_stacker_with_cu_08d5c47e-ba3b-4305-81d1-aea6b5026088_1%20(1).png>)

## 🎮 Game Overview

slime_stacker is a puzzle game where players strategically place pairs of slime creatures to create matches and clear blocks. The game features charming characters, satisfying chain reactions, and increasingly challenging gameplay.

## 🎥 Gameplay Video

https://github.com/user-attachments/assets/screen-20251023-120049.mp4

_Watch the gameplay in action!_

## 🎯 Game Mechanics

### Core Gameplay

- **Grid**: 6 columns × 12 rows playfield
- **Objective**: Clear blocks by creating matches and chains
- **Game Over**: When spawn columns (3 & 4) are blocked

### Block Types

#### Friend Blocks (Jelly Creatures)

- **Blue Jelly** ![Blue Jelly](./assets/sprites/gifs/blue-jelly-idle.gif)
- **Green Jelly** ![Green Jelly](./assets/sprites/gifs/jelly-idle.gif)
- **Red Jelly** ![Red Jelly](./assets/sprites/gifs/red-jelly-idle.gif)
- **Yellow Jelly** ![Yellow Jelly](./assets/sprites/gifs/yellow-jelly-idle.gif)

**Behavior**: Used to sandwich other blocks. Clear when 2+ identical jellies touch horizontally or vertically.

#### Special Blocks

- **Star Blocks** ⭐: Yield 1 point when sandwiched between identical friends
- **Bomb Blocks** 💣: Clear entire row when sandwiched
- **Hard Blocks** 🧱: Require two sandwiches to eliminate

### Chain System

Create satisfying chain reactions by:

1. Placing pairs strategically
2. Creating matches that trigger gravity
3. Building longer chains for bonus stars
4. Earning bonus stars based on chain length:
   - Chain 2: +2 stars
   - Chain 3: +4 stars
   - Chain 4: +5 stars
   - Chain 5: +6 stars
   - Chain 6+: +12 stars

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **UI Library**: Gluestack UI
- **Animation**: React Native Reanimated
- **Graphics**: Shopify React Native Skia
- **Skia**: 2D Graphics Engine
- **State Management**: Zustand
- **Audio**: Expo AV
- **Navigation**: React Navigation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd slime_stacker
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**

   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on device/simulator**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## 📱 Building for Production

### Android

```bash
expo build:android
```

### iOS

```bash
expo build:ios
```

## 🎨 Assets & Credits

### Game Assets

- **UI Pack**: Kenney UI Pack
- **Font**: Kenney Future Font
- **Sprites**: Custom jelly creature animations
- **Audio**: Licensed game music and sound effects

### Special Thanks

- Kenney for the amazing UI assets
- React Native community for excellent libraries
- Open source contributors

## 🎵 Audio Features

- Background music with dynamic switching
- Credits music for cinematic experience
- Sound effects for interactions
- Audio engine with pause/resume functionality

## 🎮 Game Features

- **Multiple Game Modes**: Various difficulty levels
- **Tutorial System**: Learn the game mechanics
- **Settings**: Customize audio and gameplay
- **Credits**: Animated credits sequence
- **Responsive Design**: Works on phones and tablets

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── GameBoard.tsx    # Main game board
│   ├── GameUI.tsx       # Game interface
│   └── ...
├── game/               # Game logic
│   ├── GameEngine.ts   # Core game engine
│   └── BlockTypes.ts   # Block type definitions
├── screens/           # App screens
│   ├── GameScreen.tsx # Main game screen
│   ├── MainMenuScreen.tsx
│   └── ...
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── types/             # TypeScript definitions
```

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**

   ```bash
   npx expo start --clear
   ```

2. **iOS build issues**

   ```bash
   cd ios && pod install
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean
   ```

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For any issues or suggestions, please contact the development team.

---

**Made with ❤️ using React Native and Expo**
