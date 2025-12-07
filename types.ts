
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum TileType {
  EMPTY = 0,
  WALL = 1,
  
  // Doors
  DOOR_YELLOW = 2,
  DOOR_BLUE = 3,
  DOOR_RED = 4,
  
  // Stairs
  STAIRS_UP = 10,
  STAIRS_DOWN = 11,
  
  // Keys
  KEY_YELLOW = 20,
  KEY_BLUE = 21,
  KEY_RED = 22,
  
  // Potions
  POTION_RED = 30, // HP Small
  POTION_BLUE = 31, // HP Large
  
  // Gems
  GEM_RED = 32, // Atk
  GEM_BLUE = 33, // Def
  GEM_SUPER_RED = 34, // Atk++
  GEM_SUPER_BLUE = 35, // Def++
  
  // Equipment
  SWORD_IRON = 40,
  SHIELD_IRON = 41,
  SWORD_SILVER = 42,
  SHIELD_SILVER = 43,
  SWORD_KNIGHT = 44,
  SHIELD_KNIGHT = 45,
  ITEM_PICKAXE = 48, // Wall destroyer
  
  // Monsters (Standard)
  MONSTER_SLIME_GREEN = 50,
  MONSTER_SLIME_RED = 51,
  MONSTER_BAT = 52,
  MONSTER_SKELETON = 53,
  MONSTER_MAGE = 54,
  MONSTER_ORC = 60,
  MONSTER_GOLEM = 61,
  MONSTER_VAMPIRE = 62,
  MONSTER_DRAGON = 99, // Final Boss

  // NPCs / Shops
  NPC_WISEMAN = 100,
  NPC_SHOP = 101,
  NPC_MERCHANT_KEY = 102, 
  NPC_MERCHANT_EXP = 103,
}

// Custom Tiles start at ID 1000
export interface CustomTileDef {
  id: number;
  name: string;
  type: 'ITEM' | 'MONSTER';
  iconId: string; // Key into ICON_LIBRARY
  color: string;
  // Stats
  hp?: number; // For Item: Heals HP. For Monster: Max HP
  atk?: number; // For Item: Adds Atk. For Monster: Atk
  def?: number; // For Item: Adds Def. For Monster: Def
  gold?: number; // For Item: Adds Gold. For Monster: Drops Gold
  exp?: number; // For Item: Adds Exp. For Monster: Drops Exp
  keys?: { yellow: number; blue: number; red: number }; // For Item: Adds keys
  pickaxes?: number; // For Item: Adds pickaxes
}

export interface MonsterStats {
  name: string;
  hp: number;
  atk: number;
  def: number;
  gold: number;
  exp: number;
  color: string;
}

export interface HeroState {
  floor: number;
  maxFloorVisited: number;
  x: number;
  y: number;
  direction: Direction;
  hp: number;
  atk: number;
  def: number;
  gold: number;
  exp: number;
  lvl: number;
  keys: {
    yellow: number;
    blue: number;
    red: number;
  };
  pickaxes: number;
}

export interface GameState {
  hero: HeroState;
  maps: number[][][]; // [FloorIndex][Row][Col]
  messageLog: string[];
  gameStatus: 'PLAYING' | 'GAME_OVER' | 'VICTORY';
}

export interface GameConfig {
  initialHero: HeroState;
  monsterDefs: Record<number, MonsterStats>;
  customTiles: Record<number, CustomTileDef>;
  maps: number[][][];
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  config: GameConfig;
  lastPlayed: number;
}

export const MAP_SIZE = 11;
