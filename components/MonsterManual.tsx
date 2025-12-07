
import React from 'react';
import { HeroState, MonsterStats, CustomTileDef } from '../types';
import { X, Skull } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface MonsterManualProps {
  isOpen: boolean;
  onClose: () => void;
  hero: HeroState;
  currentFloorMap: number[][];
  monsterDefs: Record<number, MonsterStats>;
  customTiles?: Record<number, CustomTileDef>;
}

const MonsterManual: React.FC<MonsterManualProps> = ({ isOpen, onClose, hero, currentFloorMap, monsterDefs, customTiles = {} }) => {
  if (!isOpen) return null;

  // Helper to normalize monster data
  const getMonsterStat = (id: number): MonsterStats | null => {
    // 1. Check Standard
    if (monsterDefs[id]) return monsterDefs[id];
    
    // 2. Check Custom
    const custom = customTiles[id];
    if (custom && custom.type === 'MONSTER') {
        return {
            name: custom.name,
            hp: custom.hp || 1,
            atk: custom.atk || 0,
            def: custom.def || 0,
            gold: custom.gold || 0,
            exp: custom.exp || 0,
            color: custom.color
        };
    }
    return null;
  };

  // Find unique monsters on current floor
  const uniqueMonsterIds = new Set<number>();
  currentFloorMap.forEach(row => {
    row.forEach(cell => {
      if (getMonsterStat(cell)) {
        uniqueMonsterIds.add(cell);
      }
    });
  });

  const floorMonsters = Array.from(uniqueMonsterIds)
    .map(id => ({ id, stat: getMonsterStat(id)! }))
    .sort((a, b) => a.stat.atk - b.stat.atk); // Sort by ATK roughly indicating difficulty

  const calculateDamage = (monster: MonsterStats) => {
    const heroDmg = hero.atk - monster.def;
    if (heroDmg <= 0) return { damage: Infinity, rounds: Infinity, viable: false, label: "UNDEFEATABLE" };

    const monsterDmg = Math.max(0, monster.atk - hero.def);
    const rounds = Math.ceil(monster.hp / heroDmg);
    
    // Hero attacks first, so we take damage for rounds-1 turns
    const totalDamage = (rounds - 1) * monsterDmg;

    if (totalDamage >= hero.hp) return { damage: totalDamage, rounds, viable: false, label: "DEADLY" };
    
    return { damage: totalDamage, rounds, viable: true, label: `${totalDamage} DMG` };
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-mono">
      <div className="bg-slate-800 border-2 border-slate-500 rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-slate-600 bg-slate-900 rounded-t-lg">
          <h2 className="text-xl text-yellow-400 font-bold flex items-center gap-2">
            <Skull className="w-5 h-5" /> Monster Manual (Floor {hero.floor})
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-3">
          {floorMonsters.length === 0 ? (
            <p className="text-center text-gray-500 italic py-8">No monsters detected on this floor.</p>
          ) : (
            floorMonsters.map(({ id, stat: m }) => {
              const prediction = calculateDamage(m);
              
              // Resolve Icon
              // @ts-ignore
              let Icon = LucideIcons.Ghost;
              // Check custom icon first
              if (customTiles[id]) {
                 // @ts-ignore
                 const CustomIcon = LucideIcons[customTiles[id].iconId];
                 if (CustomIcon) Icon = CustomIcon;
              } 
              else if (id === 53) Icon = LucideIcons.Skull; // Skeleton
              else if (id === 99) Icon = LucideIcons.Crown; // Dragon
              
              return (
                <div key={id} className="bg-slate-700 p-3 rounded flex items-center justify-between border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded flex items-center justify-center bg-slate-800 border border-slate-600" style={{ color: m.color }}>
                       <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{m.name}</div>
                      <div className="text-[10px] text-gray-400">HP:{m.hp} A:{m.atk} D:{m.def}</div>
                      <div className="text-[10px] text-yellow-300">Gold: {m.gold} | Exp: {m.exp}</div>
                    </div>
                  </div>
                  
                  <div className={`text-right font-mono font-bold ${prediction.viable ? 'text-white' : 'text-red-500'}`}>
                    <div className="text-sm">{prediction.label}</div>
                    {prediction.viable && (
                       <div className="text-[10px] text-gray-400">{prediction.rounds} Rounds</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MonsterManual;
