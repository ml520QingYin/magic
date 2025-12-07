
import React, { useState } from 'react';
import { HeroState, MonsterStats, TileType } from '../types';
import { BASE_TILE_PALETTE } from '../constants';
import { X, Save, Settings, PenTool, Database, User, Trash2 } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  hero: HeroState;
  onUpdateHero: (hero: HeroState) => void;
  initialHero: HeroState;
  onUpdateInitialHero: (hero: HeroState) => void;
  monsterDefs: Record<number, MonsterStats>;
  onUpdateMonster: (id: number, stats: MonsterStats) => void;
  selectedTile: number;
  onSelectTile: (id: number) => void;
  onSaveToStorage: () => void;
  onResetStorage: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen, onClose, hero, onUpdateHero, initialHero, onUpdateInitialHero,
  monsterDefs, onUpdateMonster, selectedTile, onSelectTile,
  onSaveToStorage, onResetStorage
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'monsters' | 'map'>('hero');

  if (!isOpen) return null;

  const handleHeroChange = (field: keyof HeroState, value: number) => {
    onUpdateHero({ ...hero, [field]: value });
  };

  const handleHeroKeyChange = (color: 'yellow' | 'blue' | 'red', value: number) => {
    onUpdateHero({ ...hero, keys: { ...hero.keys, [color]: value } });
  };

  const handleInitialHeroChange = (field: keyof HeroState, value: number) => {
    onUpdateInitialHero({ ...initialHero, [field]: value });
  };
  
  const handleInitialHeroKeyChange = (color: 'yellow' | 'blue' | 'red', value: number) => {
    onUpdateInitialHero({ ...initialHero, keys: { ...initialHero.keys, [color]: value } });
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-600 shadow-2xl z-50 flex flex-col font-mono text-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-600 flex justify-between items-center">
        <h2 className="font-bold text-yellow-400 flex items-center gap-2">
            <Settings className="w-5 h-5" /> GM Panel
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800 border-b border-slate-600">
        <button 
            onClick={() => setActiveTab('hero')}
            className={`flex-1 p-2 text-center hover:bg-slate-700 ${activeTab === 'hero' ? 'bg-slate-700 text-white border-b-2 border-yellow-400' : 'text-gray-400'}`}
        >
            <User className="w-4 h-4 mx-auto" />
        </button>
        <button 
            onClick={() => setActiveTab('monsters')}
            className={`flex-1 p-2 text-center hover:bg-slate-700 ${activeTab === 'monsters' ? 'bg-slate-700 text-white border-b-2 border-yellow-400' : 'text-gray-400'}`}
        >
            <Database className="w-4 h-4 mx-auto" />
        </button>
        <button 
            onClick={() => setActiveTab('map')}
            className={`flex-1 p-2 text-center hover:bg-slate-700 ${activeTab === 'map' ? 'bg-slate-700 text-white border-b-2 border-yellow-400' : 'text-gray-400'}`}
        >
            <PenTool className="w-4 h-4 mx-auto" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Persistence Controls */}
        <div className="space-y-2 border-b border-slate-700 pb-4">
             <button onClick={onSaveToStorage} className="w-full bg-green-700 hover:bg-green-600 text-white p-2 rounded flex items-center justify-center gap-2">
                 <Save size={14} /> Save Changes Permanently
             </button>
             <button onClick={onResetStorage} className="w-full bg-red-900/50 hover:bg-red-800 text-red-300 p-2 rounded flex items-center justify-center gap-2 border border-red-900">
                 <Trash2 size={14} /> Reset Defaults
             </button>
             <p className="text-[10px] text-gray-500 text-center">Changes saved here will apply to new games.</p>
        </div>

        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase">Current Stats</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-400">HP</label>
                        <input type="number" value={hero.hp} onChange={e => handleHeroChange('hp', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Gold</label>
                        <input type="number" value={hero.gold} onChange={e => handleHeroChange('gold', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">ATK</label>
                        <input type="number" value={hero.atk} onChange={e => handleHeroChange('atk', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">DEF</label>
                        <input type="number" value={hero.def} onChange={e => handleHeroChange('def', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="text-xs text-yellow-400">Y-Key</label>
                        <input type="number" value={hero.keys.yellow} onChange={e => handleHeroKeyChange('yellow', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="text-xs text-blue-400">B-Key</label>
                        <input type="number" value={hero.keys.blue} onChange={e => handleHeroKeyChange('blue', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="text-xs text-red-500">R-Key</label>
                        <input type="number" value={hero.keys.red} onChange={e => handleHeroKeyChange('red', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="text-xs text-purple-400">LVL</label>
                        <input type="number" value={hero.lvl} onChange={e => handleHeroChange('lvl', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                </div>
            </div>

            <div className="space-y-2 border-t border-slate-700 pt-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase">Initial (Reset) Stats</h3>
                <div className="grid grid-cols-2 gap-2 opacity-80">
                    <div>
                        <label className="text-xs text-gray-400">Start HP</label>
                        <input type="number" value={initialHero.hp} onChange={e => handleInitialHeroChange('hp', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Start ATK</label>
                        <input type="number" value={initialHero.atk} onChange={e => handleInitialHeroChange('atk', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Start DEF</label>
                        <input type="number" value={initialHero.def} onChange={e => handleInitialHeroChange('def', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                    <div>
                        <label className="text-xs text-yellow-400">Y-Key</label>
                        <input type="number" value={initialHero.keys.yellow} onChange={e => handleInitialHeroKeyChange('yellow', +e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1" />
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* MONSTERS TAB */}
        {activeTab === 'monsters' && (
          <div className="space-y-4">
             {Object.entries(monsterDefs).map(([idStr, val]) => {
                 const id = parseInt(idStr);
                 const m = val as MonsterStats;
                 return (
                     <div key={id} className="bg-slate-800 p-2 rounded border border-slate-700">
                         <div className="font-bold text-xs mb-1" style={{ color: m.color }}>{m.name}</div>
                         <div className="grid grid-cols-4 gap-1">
                             <div><span className="text-[10px] text-gray-500">HP</span><input type="number" value={m.hp} onChange={e => onUpdateMonster(id, { ...m, hp: +e.target.value})} className="w-full text-xs bg-black/30 p-1 rounded text-white" /></div>
                             <div><span className="text-[10px] text-gray-500">ATK</span><input type="number" value={m.atk} onChange={e => onUpdateMonster(id, { ...m, atk: +e.target.value})} className="w-full text-xs bg-black/30 p-1 rounded text-white" /></div>
                             <div><span className="text-[10px] text-gray-500">DEF</span><input type="number" value={m.def} onChange={e => onUpdateMonster(id, { ...m, def: +e.target.value})} className="w-full text-xs bg-black/30 p-1 rounded text-white" /></div>
                             <div><span className="text-[10px] text-gray-500">Gold</span><input type="number" value={m.gold} onChange={e => onUpdateMonster(id, { ...m, gold: +e.target.value})} className="w-full text-xs bg-black/30 p-1 rounded text-white" /></div>
                         </div>
                     </div>
                 )
             })}
          </div>
        )}

        {/* MAP TAB */}
        {activeTab === 'map' && (
            <div className="space-y-4">
                <p className="text-xs text-gray-400">Select a tile and click on the map to paint.</p>
                
                {['Terrain', 'Doors', 'Items', 'Monsters', 'NPCs'].map(category => (
                    <div key={category}>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{category}</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {BASE_TILE_PALETTE.filter(t => t.category === category).map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onSelectTile(t.id)}
                                    className={`h-10 text-[10px] flex items-center justify-center rounded border p-1 leading-tight overflow-hidden ${selectedTile === t.id ? 'bg-yellow-900 border-yellow-500 text-yellow-200' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
