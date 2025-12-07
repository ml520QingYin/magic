import React from 'react';
import { HeroState } from '../types';
import { Heart, Shield, Sword, Coins, Key, Star, Layers } from 'lucide-react';

interface StatusPanelProps {
  hero: HeroState;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ hero }) => {
  return (
    <div className="bg-slate-800 text-slate-100 p-4 rounded-lg border-2 border-slate-600 w-full md:w-64 shadow-lg font-mono text-sm">
      <h2 className="text-xl font-bold mb-4 text-yellow-400 border-b border-slate-600 pb-2 text-center">STATUS</h2>
      
      <div className="grid grid-cols-2 gap-y-3 gap-x-2">
        <div className="flex items-center space-x-2 col-span-2">
           <Layers className="w-4 h-4 text-gray-400" />
           <span className="text-gray-400">Floor</span>
           <span className="text-white font-bold text-lg">{hero.floor}</span>
        </div>

        <div className="flex items-center space-x-2 col-span-2 mb-2">
           <span className="text-purple-400 font-bold">LVL {hero.lvl}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-red-500" />
          <span>{hero.hp}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-purple-400" />
          <span>{hero.exp}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Sword className="w-4 h-4 text-blue-400" />
          <span>{hero.atk}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span>{hero.def}</span>
        </div>

        <div className="flex items-center space-x-2 col-span-2 mt-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-200">{hero.gold}</span>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-600 pt-4">
        <h3 className="text-xs text-slate-400 mb-2 uppercase tracking-widest">Keys</h3>
        <div className="flex justify-between px-2">
           <div className="flex flex-col items-center">
             <Key className="w-5 h-5 text-yellow-400 mb-1" />
             <span>{hero.keys.yellow}</span>
           </div>
           <div className="flex flex-col items-center">
             <Key className="w-5 h-5 text-blue-400 mb-1" />
             <span>{hero.keys.blue}</span>
           </div>
           <div className="flex flex-col items-center">
             <Key className="w-5 h-5 text-red-500 mb-1" />
             <span>{hero.keys.red}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;