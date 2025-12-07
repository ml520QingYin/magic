
import React from 'react';
import { TileType, HeroState, Direction, MonsterStats, CustomTileDef } from '../types';
import * as LucideIcons from 'lucide-react';

interface GameMapProps {
  mapData: number[][];
  hero: HeroState;
  monsterDefs: Record<number, MonsterStats>;
  customTiles?: Record<number, CustomTileDef>;
  onTileClick?: (r: number, c: number) => void;
  editorMode?: boolean;
}

const CELL_SIZE = 32;

// Dynamic Icon Lookup
const getIconComponent = (iconName: string) => {
  // @ts-ignore
  const Icon = LucideIcons[iconName];
  return Icon || LucideIcons.HelpCircle;
};

const GameMap: React.FC<GameMapProps> = ({ mapData, hero, monsterDefs, customTiles, onTileClick, editorMode }) => {

  const renderTile = (tileId: number, r: number, c: number) => {
    // Hero Rendering
    const isHeroHere = r === hero.y && c === hero.x;
    if (isHeroHere && !editorMode) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-blue-900/30 z-20 pointer-events-none">
          <LucideIcons.User className={`w-6 h-6 text-white transition-transform ${hero.direction === Direction.LEFT ? '-scale-x-100' : ''}`} />
        </div>
      );
    }

    // Standard Tiles
    switch (tileId) {
      case TileType.EMPTY: return null;
      case TileType.WALL: return <div className="w-full h-full bg-slate-700 border border-slate-600 shadow-inner" />;
      
      // Doors
      case TileType.DOOR_YELLOW: return <div className="w-full h-full bg-yellow-900/50 flex items-center justify-center border border-yellow-600"><LucideIcons.DoorOpen className="w-5 h-5 text-yellow-400" /></div>;
      case TileType.DOOR_BLUE: return <div className="w-full h-full bg-blue-900/50 flex items-center justify-center border border-blue-600"><LucideIcons.DoorOpen className="w-5 h-5 text-blue-400" /></div>;
      case TileType.DOOR_RED: return <div className="w-full h-full bg-red-900/50 flex items-center justify-center border border-red-600"><LucideIcons.DoorOpen className="w-5 h-5 text-red-500" /></div>;

      // Stairs
      case TileType.STAIRS_UP: return <div className="w-full h-full flex items-center justify-center bg-gray-800"><LucideIcons.MoveUp className="w-5 h-5 text-white" /></div>;
      case TileType.STAIRS_DOWN: return <div className="w-full h-full flex items-center justify-center bg-gray-800"><LucideIcons.MoveDown className="w-5 h-5 text-white" /></div>;

      // Keys
      case TileType.KEY_YELLOW: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Key className="w-4 h-4 text-yellow-400" /></div>;
      case TileType.KEY_BLUE: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Key className="w-4 h-4 text-blue-400" /></div>;
      case TileType.KEY_RED: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Key className="w-4 h-4 text-red-500" /></div>;

      // Items
      case TileType.POTION_RED: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Heart className="w-4 h-4 text-red-500 fill-red-500" /></div>;
      case TileType.POTION_BLUE: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Heart className="w-5 h-5 text-blue-500 fill-blue-500" /></div>;
      case TileType.GEM_RED: return <div className="w-full h-full flex items-center justify-center"><div className="w-3 h-3 bg-red-500 rotate-45 border border-white shadow-[0_0_5px_red]" /></div>;
      case TileType.GEM_BLUE: return <div className="w-full h-full flex items-center justify-center"><div className="w-3 h-3 bg-blue-500 rotate-45 border border-white shadow-[0_0_5px_blue]" /></div>;
      case TileType.GEM_SUPER_RED: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Sparkles className="w-4 h-4 text-red-400 fill-red-500 animate-spin-slow" /></div>;
      case TileType.GEM_SUPER_BLUE: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Sparkles className="w-4 h-4 text-blue-400 fill-blue-500 animate-spin-slow" /></div>;
      case TileType.ITEM_PICKAXE: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Hammer className="w-4 h-4 text-stone-300" /></div>;
      
      // Equip
      case TileType.SWORD_IRON: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Sword className="w-5 h-5 text-slate-300" /></div>;
      case TileType.SHIELD_IRON: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Shield className="w-5 h-5 text-slate-300" /></div>;
      case TileType.SWORD_SILVER: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Sword className="w-5 h-5 text-gray-200 drop-shadow-[0_0_2px_cyan]" /></div>;
      case TileType.SHIELD_SILVER: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Shield className="w-5 h-5 text-gray-200 drop-shadow-[0_0_2px_cyan]" /></div>;
      case TileType.SWORD_KNIGHT: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Sword className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_2px_gold]" /></div>;
      case TileType.SHIELD_KNIGHT: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Shield className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_2px_gold]" /></div>;

      // NPCs
      case TileType.NPC_WISEMAN: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.User className="w-5 h-5 text-gray-400" /></div>;
      case TileType.NPC_SHOP: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Store className="w-5 h-5 text-yellow-600" /></div>;
      case TileType.NPC_MERCHANT_KEY: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.Key className="w-5 h-5 text-amber-500" /></div>;
      case TileType.NPC_MERCHANT_EXP: return <div className="w-full h-full flex items-center justify-center"><LucideIcons.GraduationCap className="w-5 h-5 text-purple-400" /></div>;
    }

    // Custom Tiles (ID >= 1000)
    if (tileId >= 1000 && customTiles && customTiles[tileId]) {
      const custom = customTiles[tileId];
      const IconComp = getIconComponent(custom.iconId);
      return (
        <div className={`w-full h-full flex items-center justify-center ${custom.type === 'MONSTER' ? 'animate-pulse-slow' : ''}`}>
           <IconComp className="w-5 h-5" style={{ color: custom.color }} />
        </div>
      );
    }

    // Standard Monsters
    const monster = monsterDefs[tileId];
    if (monster) {
       let Icon = LucideIcons.Ghost;
       if (tileId === TileType.MONSTER_SKELETON) Icon = LucideIcons.Skull;
       if (tileId === TileType.MONSTER_ORC) Icon = LucideIcons.Axe;
       if (tileId === TileType.MONSTER_GOLEM) Icon = LucideIcons.Box;
       if (tileId === TileType.MONSTER_VAMPIRE) Icon = LucideIcons.Flame;
       if (tileId === TileType.MONSTER_DRAGON) Icon = LucideIcons.Crown;
       
       return (
         <div className="w-full h-full flex items-center justify-center animate-pulse-slow">
           <Icon className="w-5 h-5" style={{ color: monster.color, fill: tileId === TileType.MONSTER_DRAGON ? monster.color : 'none' }} />
         </div>
       );
    }

    return <div className="text-[8px] text-gray-500">?</div>;
  };

  return (
    <div className={`bg-black p-1 border-4 border-slate-600 rounded-lg shadow-2xl inline-block select-none ${editorMode ? 'cursor-crosshair border-yellow-500' : ''}`}>
      <div 
        className="grid bg-gray-900"
        style={{
          gridTemplateColumns: `repeat(${mapData[0].length}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${mapData.length}, ${CELL_SIZE}px)`,
        }}
      >
        {mapData.map((row, r) => (
          row.map((tileId, c) => (
            <div 
              key={`${r}-${c}`} 
              className={`relative border-[0.5px] border-slate-800/30 w-full h-full ${editorMode ? 'hover:bg-white/10' : ''}`}
              onClick={() => onTileClick && onTileClick(r, c)}
            >
               {renderTile(tileId, r, c)}
               
               {/* Ghost Hero for Editor */}
               {editorMode && hero.floor === (hero as any)._editorCurrentFloorIndex && r === hero.y && c === hero.x && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-900/30 z-20 pointer-events-none opacity-50 animate-bounce">
                    <LucideIcons.User className="w-6 h-6 text-white" />
                  </div>
               )}
            </div>
          ))
        ))}
      </div>
    </div>
  );
};

export default GameMap;
