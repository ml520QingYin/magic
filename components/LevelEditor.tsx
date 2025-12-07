
import React, { useState } from 'react';
import { GameConfig, TileType, MAP_SIZE, HeroState, MonsterStats, CustomTileDef } from '../types';
import { BASE_TILE_PALETTE, DEFAULT_GAME_CONFIG, ICON_LIST } from '../constants';
import GameMap from './GameMap';
import * as Icons from 'lucide-react';

interface LevelEditorProps {
  initialConfig: GameConfig;
  onSave: (config: GameConfig) => void;
  onExit: () => void;
}

const LevelEditor: React.FC<LevelEditorProps> = ({ initialConfig, onSave, onExit }) => {
  const [config, setConfig] = useState<GameConfig>(JSON.parse(JSON.stringify(initialConfig)));
  const [currentFloor, setCurrentFloor] = useState(0);
  const [selectedTile, setSelectedTile] = useState<number>(TileType.WALL);
  const [activeTab, setActiveTab] = useState<'map' | 'monsters' | 'items' | 'hero' | 'assets'>('map');

  // Asset Creator State
  const [newAsset, setNewAsset] = useState<Partial<CustomTileDef>>({
      type: 'ITEM',
      name: 'New Item',
      color: '#ffffff',
      iconId: 'Star',
      hp: 0, atk: 0, def: 0, gold: 0, exp: 0, keys: { yellow:0, blue:0, red:0 }
  });

  // --- MAP MANIPULATION ---

  const handleTileClick = (r: number, c: number) => {
    const newMaps = [...config.maps];
    newMaps[currentFloor] = [...newMaps[currentFloor]];
    newMaps[currentFloor][r] = [...newMaps[currentFloor][r]];
    newMaps[currentFloor][r][c] = selectedTile;
    setConfig(prev => ({ ...prev, maps: newMaps }));
  };

  const addFloor = () => {
    const newMap = Array(MAP_SIZE).fill(0).map(() => Array(MAP_SIZE).fill(TileType.EMPTY));
    for(let i=0; i<MAP_SIZE; i++) {
        newMap[0][i] = TileType.WALL;
        newMap[MAP_SIZE-1][i] = TileType.WALL;
        newMap[i][0] = TileType.WALL;
        newMap[i][MAP_SIZE-1] = TileType.WALL;
    }
    setConfig(prev => ({ ...prev, maps: [...prev.maps, newMap] }));
    setCurrentFloor(config.maps.length);
  };

  const deleteFloor = () => {
    if (config.maps.length <= 1) { alert("Cannot delete last floor"); return; }
    if (!confirm("Delete floor?")) return;
    const newMaps = config.maps.filter((_, idx) => idx !== currentFloor);
    setConfig(prev => ({ ...prev, maps: newMaps }));
    if (currentFloor >= newMaps.length) setCurrentFloor(newMaps.length - 1);
  };

  // --- DATA MANIPULATION ---

  // Standard Monster Update
  const updateMonster = (id: number, field: keyof MonsterStats, value: any) => {
    setConfig(prev => ({
        ...prev,
        monsterDefs: {
            ...prev.monsterDefs,
            [id]: { ...prev.monsterDefs[id], [field]: value }
        }
    }));
  };

  // Custom Monster/Item Update
  const updateCustomTile = (id: number, field: keyof CustomTileDef, value: any) => {
      setConfig(prev => ({
          ...prev,
          customTiles: {
              ...prev.customTiles,
              [id]: { ...prev.customTiles[id], [field]: value }
          }
      }));
  };

  const updateHeroStart = (field: keyof HeroState, value: any) => {
    setConfig(prev => ({
        ...prev,
        initialHero: { ...prev.initialHero, [field]: value }
    }));
  };

  const createAsset = () => {
      // Find next ID
      const existingIds = Object.keys(config.customTiles || {}).map(Number);
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 999;
      const newId = maxId + 1;

      const assetToAdd: CustomTileDef = {
          id: newId,
          name: newAsset.name || 'Unknown',
          type: newAsset.type || 'ITEM',
          iconId: newAsset.iconId || 'HelpCircle',
          color: newAsset.color || '#fff',
          hp: Number(newAsset.hp),
          atk: Number(newAsset.atk),
          def: Number(newAsset.def),
          gold: Number(newAsset.gold),
          exp: Number(newAsset.exp),
          keys: newAsset.keys,
          pickaxes: Number(newAsset.pickaxes)
      };

      setConfig(prev => ({
          ...prev,
          customTiles: {
              ...prev.customTiles,
              [newId]: assetToAdd
          }
      }));
      alert(`Created ${assetToAdd.name}! It is now in your palette.`);
  };

  // --- PALETTE GENERATION ---
  const customPalette = Object.values(config.customTiles || {}).map((t: CustomTileDef) => ({
      label: t.name,
      id: t.id,
      category: t.type === 'MONSTER' ? 'Custom Monsters' : 'Custom Items'
  }));
  const fullPalette = [...BASE_TILE_PALETTE, ...customPalette];

  return (
    <div className="fixed inset-0 bg-slate-900 text-slate-200 font-mono flex flex-col z-50">
      
      {/* Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-yellow-500">LEVEL EDITOR</h1>
            <div className="flex bg-slate-700 rounded p-1 gap-1">
                <button onClick={() => setActiveTab('map')} className={`px-3 py-1 rounded text-xs ${activeTab === 'map' ? 'bg-blue-600' : 'hover:bg-slate-600'}`}>Map</button>
                <button onClick={() => setActiveTab('assets')} className={`px-3 py-1 rounded text-xs ${activeTab === 'assets' ? 'bg-blue-600' : 'hover:bg-slate-600'}`}>Asset Creator</button>
                <button onClick={() => setActiveTab('monsters')} className={`px-3 py-1 rounded text-xs ${activeTab === 'monsters' ? 'bg-blue-600' : 'hover:bg-slate-600'}`}>Monsters</button>
                <button onClick={() => setActiveTab('items')} className={`px-3 py-1 rounded text-xs ${activeTab === 'items' ? 'bg-blue-600' : 'hover:bg-slate-600'}`}>Items</button>
                <button onClick={() => setActiveTab('hero')} className={`px-3 py-1 rounded text-xs ${activeTab === 'hero' ? 'bg-blue-600' : 'hover:bg-slate-600'}`}>Hero</button>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={onExit} className="px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">Exit</button>
            <button onClick={() => onSave(config)} className="px-4 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold">Save Campaign</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Palette (Map Mode) */}
        {activeTab === 'map' && (
            <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                     <span className="text-xs text-gray-400">FLOOR {currentFloor}</span>
                     <div className="flex gap-1">
                        <button onClick={() => setCurrentFloor(Math.max(0, currentFloor-1))} className="px-2 bg-slate-700 rounded">&lt;</button>
                        <button onClick={() => setCurrentFloor(Math.min(config.maps.length-1, currentFloor+1))} className="px-2 bg-slate-700 rounded">&gt;</button>
                        <button onClick={addFloor} className="px-2 bg-green-800 text-green-200 rounded">+</button>
                        <button onClick={deleteFloor} className="px-2 bg-red-900 text-red-200 rounded">x</button>
                     </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Render Palette Categories */}
                    {['Terrain', 'Doors', 'Items', 'Monsters', 'NPCs', 'Custom Items', 'Custom Monsters'].map(cat => {
                        const items = fullPalette.filter(t => t.category === cat);
                        if (items.length === 0) return null;
                        return (
                            <div key={cat}>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1">{cat}</h4>
                                <div className="grid grid-cols-2 gap-1">
                                    {items.map(t => (
                                        <button 
                                            key={t.id} 
                                            onClick={() => setSelectedTile(t.id)}
                                            className={`text-[10px] p-1 rounded border text-left truncate ${selectedTile === t.id ? 'bg-yellow-900 border-yellow-500 text-yellow-100' : 'bg-slate-700 border-slate-600'}`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {/* CENTER: Content */}
        <div className="flex-1 bg-slate-900 flex items-center justify-center relative overflow-auto p-4">
            
            {activeTab === 'map' && (
                 <GameMap 
                    mapData={config.maps[currentFloor]} 
                    hero={{...config.initialHero, _editorCurrentFloorIndex: currentFloor} as any}
                    monsterDefs={config.monsterDefs}
                    customTiles={config.customTiles}
                    editorMode={true}
                    onTileClick={handleTileClick}
                 />
            )}

            {activeTab === 'assets' && (
                <div className="w-full max-w-2xl bg-slate-800 p-6 rounded shadow-xl border border-slate-700 overflow-y-auto max-h-full">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Icons.PlusSquare /> Create New Asset
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs text-gray-400">Name</label>
                            <input type="text" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full bg-slate-900 p-2 rounded text-white border border-slate-600" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Type</label>
                            <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value as any})} className="w-full bg-slate-900 p-2 rounded text-white border border-slate-600">
                                <option value="ITEM">Item (Buff/Resource)</option>
                                <option value="MONSTER">Monster (Enemy)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Color</label>
                            <input type="color" value={newAsset.color} onChange={e => setNewAsset({...newAsset, color: e.target.value})} className="w-full h-10 bg-slate-900 rounded border border-slate-600 cursor-pointer" />
                        </div>
                        <div>
                             <label className="text-xs text-gray-400">Preview Icon</label>
                             <div className="flex items-center gap-2 p-2 bg-slate-900 rounded">
                                 {/* @ts-ignore */}
                                 {React.createElement(Icons[newAsset.iconId || 'HelpCircle'], { className: "w-6 h-6", color: newAsset.color })}
                             </div>
                        </div>
                    </div>

                    {/* Icon Selector */}
                    <div className="mb-6">
                        <label className="text-xs text-gray-400 block mb-2">Select Icon ({ICON_LIST.length} Available)</label>
                        <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-900 rounded border border-slate-700">
                            {ICON_LIST.map(iconName => (
                                <button 
                                    key={iconName}
                                    onClick={() => setNewAsset({...newAsset, iconId: iconName})}
                                    title={iconName}
                                    className={`p-2 rounded flex justify-center hover:bg-slate-700 ${newAsset.iconId === iconName ? 'bg-blue-600' : ''}`}
                                >
                                    {/* @ts-ignore */}
                                    {React.createElement(Icons[iconName] || Icons.HelpCircle, { size: 16 })}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                         <div><label className="text-xs text-gray-400">HP</label><input type="number" value={newAsset.hp} onChange={e => setNewAsset({...newAsset, hp: +e.target.value})} className="w-full bg-slate-900 p-2 rounded text-white border border-slate-600" /></div>
                         <div><label className="text-xs text-gray-400">ATK</label><input type="number" value={newAsset.atk} onChange={e => setNewAsset({...newAsset, atk: +e.target.value})} className="w-full bg-slate-900 p-2 rounded text-white border border-slate-600" /></div>
                         <div><label className="text-xs text-gray-400">DEF</label><input type="number" value={newAsset.def} onChange={e => setNewAsset({...newAsset, def: +e.target.value})} className="w-full bg-slate-900 p-2 rounded text-white border border-slate-600" /></div>
                         <div><label className="text-xs text-gray-400">Gold</label><input type="number" value={newAsset.gold} onChange={e => setNewAsset({...newAsset, gold: +e.target.value})} className="w-full bg-slate-900 p-2 rounded text-white border border-slate-600" /></div>
                         <div><label className="text-xs text-gray-400">Exp</label><input type="number" value={newAsset.exp} onChange={e => setNewAsset({...newAsset, exp: +e.target.value})} className="w-full bg-slate-900 p-2 rounded text-white border border-slate-600" /></div>
                    </div>

                    <button onClick={createAsset} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded">
                        Create Asset & Add to Palette
                    </button>
                </div>
            )}

            {/* Combined Monster Editor (Standard + Custom) */}
            {activeTab === 'monsters' && (
                <div className="w-full max-w-5xl bg-slate-800 p-6 rounded shadow-xl border border-slate-700 overflow-y-auto max-h-full">
                    <h2 className="text-xl font-bold text-white mb-4">Edit Monster Stats</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     
                     {/* Standard Monsters */}
                     {Object.entries(config.monsterDefs).map(([idStr, mVal]) => {
                         const id = parseInt(idStr);
                         const m = mVal as MonsterStats;
                         // @ts-ignore
                         const Icon = Icons.Ghost; 
                         return (
                             <div key={id} className="bg-slate-900 p-3 rounded border border-slate-700 flex flex-col gap-2 relative">
                                 <div className="absolute top-1 right-1 text-[9px] text-gray-600">STD</div>
                                 <div className="flex items-center gap-2 font-bold" style={{ color: m.color }}>
                                     {/* @ts-ignore */}
                                     {React.createElement(Icons.Skull, { size: 16 })} {m.name}
                                 </div>
                                 <div className="grid grid-cols-4 gap-2">
                                     <div><label className="text-[10px] text-gray-500">HP</label><input type="number" value={m.hp} onChange={e => updateMonster(id, 'hp', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">ATK</label><input type="number" value={m.atk} onChange={e => updateMonster(id, 'atk', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">DEF</label><input type="number" value={m.def} onChange={e => updateMonster(id, 'def', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">Gold</label><input type="number" value={m.gold} onChange={e => updateMonster(id, 'gold', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                 </div>
                             </div>
                         )
                     })}

                     {/* Custom Monsters */}
                     {(Object.values(config.customTiles || {}) as CustomTileDef[]).filter(t => t.type === 'MONSTER').map((m) => {
                         // @ts-ignore
                         const Icon = Icons[m.iconId] || Icons.Ghost;
                         return (
                             <div key={m.id} className="bg-slate-900 p-3 rounded border border-slate-700 flex flex-col gap-2 relative">
                                 <div className="absolute top-1 right-1 text-[9px] text-blue-500">CUSTOM</div>
                                 <div className="flex items-center gap-2 font-bold" style={{ color: m.color }}>
                                     {/* @ts-ignore */}
                                     {React.createElement(Icon, { size: 16 })} {m.name}
                                 </div>
                                 <div className="grid grid-cols-4 gap-2">
                                     <div><label className="text-[10px] text-gray-500">HP</label><input type="number" value={m.hp} onChange={e => updateCustomTile(m.id, 'hp', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">ATK</label><input type="number" value={m.atk} onChange={e => updateCustomTile(m.id, 'atk', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">DEF</label><input type="number" value={m.def} onChange={e => updateCustomTile(m.id, 'def', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">Gold</label><input type="number" value={m.gold} onChange={e => updateCustomTile(m.id, 'gold', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">Exp</label><input type="number" value={m.exp} onChange={e => updateCustomTile(m.id, 'exp', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                 </div>
                             </div>
                         )
                     })}

                    </div>
                </div>
            )}
            
            {/* Custom Items Editor */}
            {activeTab === 'items' && (
                <div className="w-full max-w-5xl bg-slate-800 p-6 rounded shadow-xl border border-slate-700 overflow-y-auto max-h-full">
                    <h2 className="text-xl font-bold text-white mb-4">Edit Custom Items</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                     {(Object.values(config.customTiles || {}) as CustomTileDef[]).filter(t => t.type === 'ITEM').map((m) => {
                         // @ts-ignore
                         const Icon = Icons[m.iconId] || Icons.HelpCircle;
                         return (
                             <div key={m.id} className="bg-slate-900 p-3 rounded border border-slate-700 flex flex-col gap-2 relative">
                                 <div className="absolute top-1 right-1 text-[9px] text-blue-500">CUSTOM</div>
                                 <div className="flex items-center gap-2 font-bold" style={{ color: m.color }}>
                                     {/* @ts-ignore */}
                                     {React.createElement(Icon, { size: 16 })} {m.name}
                                 </div>
                                 <div className="grid grid-cols-6 gap-2">
                                     <div><label className="text-[10px] text-gray-500">HP+</label><input type="number" value={m.hp} onChange={e => updateCustomTile(m.id, 'hp', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">ATK+</label><input type="number" value={m.atk} onChange={e => updateCustomTile(m.id, 'atk', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">DEF+</label><input type="number" value={m.def} onChange={e => updateCustomTile(m.id, 'def', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">Gold+</label><input type="number" value={m.gold} onChange={e => updateCustomTile(m.id, 'gold', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                     <div><label className="text-[10px] text-gray-500">Exp+</label><input type="number" value={m.exp} onChange={e => updateCustomTile(m.id, 'exp', +e.target.value)} className="w-full text-xs bg-slate-800 text-white rounded p-1 border border-slate-600" /></div>
                                 </div>
                             </div>
                         )
                     })}
                     {(Object.values(config.customTiles || {}) as CustomTileDef[]).filter(t => t.type === 'ITEM').length === 0 && (
                         <p className="text-gray-500 text-sm">No custom items created yet. Use the Asset Creator to make some!</p>
                     )}
                    </div>
                </div>
            )}

            {activeTab === 'hero' && (
                 <div className="bg-slate-800 p-6 rounded">
                     <h2 className="font-bold mb-4">Initial Hero State</h2>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-400">Start HP</label><input type="number" value={config.initialHero.hp} onChange={e => updateHeroStart('hp', +e.target.value)} className="w-full bg-slate-900 p-2 rounded" /></div>
                        <div><label className="text-xs text-gray-400">Start ATK</label><input type="number" value={config.initialHero.atk} onChange={e => updateHeroStart('atk', +e.target.value)} className="w-full bg-slate-900 p-2 rounded" /></div>
                        <div><label className="text-xs text-gray-400">Start DEF</label><input type="number" value={config.initialHero.def} onChange={e => updateHeroStart('def', +e.target.value)} className="w-full bg-slate-900 p-2 rounded" /></div>
                     </div>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LevelEditor;
