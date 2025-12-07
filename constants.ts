
import { MonsterStats, TileType, MAP_SIZE, Direction, GameConfig, HeroState } from './types';

// Standard Monsters
export const MONSTERS: Record<number, MonsterStats> = {
  [TileType.MONSTER_SLIME_GREEN]: { name: 'Green Slime', hp: 40, atk: 18, def: 1, gold: 1, exp: 1, color: '#4ade80' },
  [TileType.MONSTER_SLIME_RED]: { name: 'Red Slime', hp: 60, atk: 25, def: 2, gold: 2, exp: 2, color: '#f87171' },
  [TileType.MONSTER_BAT]: { name: 'Bat', hp: 80, atk: 35, def: 5, gold: 4, exp: 3, color: '#a78bfa' },
  [TileType.MONSTER_SKELETON]: { name: 'Skeleton', hp: 150, atk: 50, def: 10, gold: 8, exp: 6, color: '#e5e7eb' },
  [TileType.MONSTER_MAGE]: { name: 'Mage', hp: 200, atk: 80, def: 15, gold: 15, exp: 10, color: '#60a5fa' },
  [TileType.MONSTER_ORC]: { name: 'Orc', hp: 450, atk: 150, def: 40, gold: 30, exp: 25, color: '#15803d' }, 
  [TileType.MONSTER_GOLEM]: { name: 'Golem', hp: 100, atk: 220, def: 120, gold: 40, exp: 40, color: '#78716c' }, 
  [TileType.MONSTER_VAMPIRE]: { name: 'Vampire', hp: 800, atk: 300, def: 80, gold: 60, exp: 60, color: '#9f1239' }, 
  [TileType.MONSTER_DRAGON]: { name: 'Dragon King', hp: 9999, atk: 600, def: 350, gold: 0, exp: 0, color: '#ef4444' },
};

export const INITIAL_HERO: HeroState = {
  floor: 0,
  maxFloorVisited: 0,
  x: 5,
  y: 10,
  direction: Direction.UP,
  hp: 1000,
  atk: 10,
  def: 10,
  gold: 0,
  exp: 0,
  lvl: 1,
  keys: { yellow: 1, blue: 0, red: 0 }, 
  pickaxes: 0,
};

// --- ICON LIBRARY FOR ASSET CREATOR ---
export const ICON_LIST = [
  // Weapons/Combat
  'Sword', 'Shield', 'Axe', 'Bow', 'Crosshair', 'Target', 'Hammer', 'Zap', 'Flame', 'Skull', 'Ghost', 'Crown', 
  // Nature/Elements
  'Droplet', 'Wind', 'Cloud', 'Sun', 'Moon', 'Star', 'Flower', 'Leaf', 'Tree', 'Mountain', 'Snowflake', 'Zap',
  // Items/Loot
  'Gem', 'Coins', 'Key', 'Lock', 'Unlock', 'Bag', 'Box', 'Gift', 'Potion', 'Heart', 'FirstAid',
  // Technology/Misc
  'Cpu', 'Database', 'Wifi', 'Battery', 'Anchor', 'Bell', 'Book', 'Briefcase', 'Camera', 'Clock', 'Compass',
  'Diamond', 'Eye', 'Feather', 'Flag', 'Flask', 'Gamepad', 'Glasses', 'Globe', 'Headphones', 'Hourglass',
  'Infinity', 'Lamp', 'Magnet', 'Map', 'Medal', 'Megaphone', 'Mic', 'Music', 'Palette', 'Paperclip',
  'Phone', 'Pin', 'Plane', 'Plug', 'Printer', 'Puzzle', 'Radio', 'Rocket', 'Scissors', 'Search', 'Server',
  'Settings', 'Shirt', 'Shovel', 'Speaker', 'Tag', 'Thermometer', 'ThumbsUp', 'Ticket', 'Tool', 'Trash',
  'Trophy', 'Truck', 'Tv', 'Umbrella', 'User', 'Video', 'Volume', 'Wallet', 'Watch', 'Wrench'
];

export const BASE_TILE_PALETTE = [
    { label: 'Floor', id: TileType.EMPTY, category: 'Terrain' },
    { label: 'Wall', id: TileType.WALL, category: 'Terrain' },
    { label: 'Up Stair', id: TileType.STAIRS_UP, category: 'Terrain' },
    { label: 'Down Stair', id: TileType.STAIRS_DOWN, category: 'Terrain' },
    
    { label: 'Yellow Door', id: TileType.DOOR_YELLOW, category: 'Doors' },
    { label: 'Blue Door', id: TileType.DOOR_BLUE, category: 'Doors' },
    { label: 'Red Door', id: TileType.DOOR_RED, category: 'Doors' },

    { label: 'Yellow Key', id: TileType.KEY_YELLOW, category: 'Items' },
    { label: 'Blue Key', id: TileType.KEY_BLUE, category: 'Items' },
    { label: 'Red Key', id: TileType.KEY_RED, category: 'Items' },
    { label: 'Red Potion', id: TileType.POTION_RED, category: 'Items' },
    { label: 'Blue Potion', id: TileType.POTION_BLUE, category: 'Items' },
    { label: 'Red Gem', id: TileType.GEM_RED, category: 'Items' },
    { label: 'Blue Gem', id: TileType.GEM_BLUE, category: 'Items' },
    { label: 'Super Red Gem', id: TileType.GEM_SUPER_RED, category: 'Items' },
    { label: 'Super Blue Gem', id: TileType.GEM_SUPER_BLUE, category: 'Items' },
    { label: 'Pickaxe', id: TileType.ITEM_PICKAXE, category: 'Items' },
    
    { label: 'Iron Sword', id: TileType.SWORD_IRON, category: 'Items' },
    { label: 'Iron Shield', id: TileType.SHIELD_IRON, category: 'Items' },
    { label: 'Silver Sword', id: TileType.SWORD_SILVER, category: 'Items' },
    { label: 'Silver Shield', id: TileType.SHIELD_SILVER, category: 'Items' },
    { label: 'Knight Sword', id: TileType.SWORD_KNIGHT, category: 'Items' },
    { label: 'Knight Shield', id: TileType.SHIELD_KNIGHT, category: 'Items' },

    { label: 'Green Slime', id: TileType.MONSTER_SLIME_GREEN, category: 'Monsters' },
    { label: 'Red Slime', id: TileType.MONSTER_SLIME_RED, category: 'Monsters' },
    { label: 'Bat', id: TileType.MONSTER_BAT, category: 'Monsters' },
    { label: 'Skeleton', id: TileType.MONSTER_SKELETON, category: 'Monsters' },
    { label: 'Mage', id: TileType.MONSTER_MAGE, category: 'Monsters' },
    { label: 'Orc', id: TileType.MONSTER_ORC, category: 'Monsters' },
    { label: 'Golem', id: TileType.MONSTER_GOLEM, category: 'Monsters' },
    { label: 'Vampire', id: TileType.MONSTER_VAMPIRE, category: 'Monsters' },
    { label: 'Dragon', id: TileType.MONSTER_DRAGON, category: 'Monsters' },

    { label: 'Wiseman', id: TileType.NPC_WISEMAN, category: 'NPCs' },
    { label: 'Shop', id: TileType.NPC_SHOP, category: 'NPCs' },
    { label: 'Key Merchant', id: TileType.NPC_MERCHANT_KEY, category: 'NPCs' },
    { label: 'Exp Merchant', id: TileType.NPC_MERCHANT_EXP, category: 'NPCs' },
];

const EMPTY_MAP = Array(MAP_SIZE).fill(0).map(() => Array(MAP_SIZE).fill(TileType.EMPTY));
for(let i=0; i<MAP_SIZE; i++) {
    EMPTY_MAP[0][i] = TileType.WALL;
    EMPTY_MAP[MAP_SIZE-1][i] = TileType.WALL;
    EMPTY_MAP[i][0] = TileType.WALL;
    EMPTY_MAP[i][MAP_SIZE-1] = TileType.WALL;
}

// Basic Map 0
const F0 = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 30, 0, 0, 0, 10, 0, 0, 0, 31, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 50, 1, 32, 1, 0, 1, 33, 1, 50, 1],
  [1, 0, 1, 0, 1, 2, 1, 0, 1, 0, 1],
  [1, 0, 2, 0, 50, 0, 50, 0, 2, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 50, 0, 0, 0, 0, 0, 50, 0, 1],
  [1, 1, 1, 2, 1, 20, 1, 2, 1, 1, 1],
  [1, 20, 0, 0, 0, 100, 0, 0, 0, 20, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
];

export const DEFAULT_GAME_CONFIG: GameConfig = {
    initialHero: INITIAL_HERO,
    monsterDefs: MONSTERS,
    customTiles: {},
    maps: [F0, EMPTY_MAP, EMPTY_MAP], 
}

export const SHOP_PRICES = {
  goldCost: 25,
  statGain: 4, 
};

export const XP_LEVEL_THRESHOLD = 50;
