
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameState, HeroState, TileType, Direction, MAP_SIZE, Campaign, GameConfig 
} from './types';
import { DEFAULT_GAME_CONFIG, XP_LEVEL_THRESHOLD } from './constants';
import GameMap from './components/GameMap';
import StatusPanel from './components/StatusPanel';
import MonsterManual from './components/MonsterManual';
import LevelEditor from './components/LevelEditor';
import { 
  BookOpen, Play, PenTool, Plus, Trash2, Map as MapIcon, Plane, 
  Gamepad2, UserCog, LogOut, ArrowLeft, Lock
} from 'lucide-react';

const STORAGE_KEY = 'magicTower_campaigns_v1';

type AppMode = 'MENU' | 'GAME' | 'EDITOR';
type UserRole = 'ADMIN' | 'PLAYER' | null;

const App: React.FC = () => {
  // Navigation State
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [appMode, setAppMode] = useState<AppMode>('MENU');
  
  // Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Campaign Management
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  // Runtime State
  const [gameState, setGameState] = useState<GameState>({
    hero: { ...DEFAULT_GAME_CONFIG.initialHero },
    maps: DEFAULT_GAME_CONFIG.maps,
    messageLog: [],
    gameStatus: 'PLAYING',
  });

  const [showMonsterManual, setShowMonsterManual] = useState(false);
  const [showFlyModal, setShowFlyModal] = useState(false);

  // Load Campaigns
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            setCampaigns(JSON.parse(saved));
        } catch(e) { console.error("Failed load", e); }
    } else {
        // Init default
        const def: Campaign = {
            id: 'default',
            name: 'Classic Tower',
            description: 'The original 20-floor challenge.',
            config: DEFAULT_GAME_CONFIG,
            lastPlayed: Date.now()
        };
        setCampaigns([def]);
    }
  }, []);

  const saveCampaigns = (newCampaigns: Campaign[]) => {
      setCampaigns(newCampaigns);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCampaigns));
  };

  const createCampaign = () => {
      const name = prompt("Enter Campaign Name:");
      if (!name) return;
      const newC: Campaign = {
          id: Date.now().toString(),
          name,
          description: 'Custom Campaign',
          config: JSON.parse(JSON.stringify(DEFAULT_GAME_CONFIG)),
          lastPlayed: Date.now()
      };
      saveCampaigns([...campaigns, newC]);
  };

  const deleteCampaign = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Delete this campaign?")) return;
      saveCampaigns(campaigns.filter(c => c.id !== id));
      if (activeCampaignId === id) setActiveCampaignId(null);
  };

  const selectCampaign = (id: string) => {
      setActiveCampaignId(id);
  };

  const handleAdminLogin = () => {
      if (adminPassword === 'MagicFall') {
          setUserRole('ADMIN');
          setShowAuthModal(false);
          setAdminPassword('');
      } else {
          alert("Access Denied: Incorrect Password");
          setAdminPassword('');
      }
  };

  const startPlaying = (campaignId?: string) => {
      const idToPlay = campaignId || activeCampaignId;
      if (!idToPlay) return;
      
      const c = campaigns.find(c => c.id === idToPlay);
      if (!c) return;

      // Update Active ID if passed directly (Player Mode)
      if (campaignId) setActiveCampaignId(campaignId);

      setGameState({
          hero: { ...c.config.initialHero, keys: { ...c.config.initialHero.keys }, maxFloorVisited: c.config.initialHero.floor },
          maps: JSON.parse(JSON.stringify(c.config.maps)), // Deep copy maps
          messageLog: [`Started: ${c.name}`],
          gameStatus: 'PLAYING'
      });
      setShowMonsterManual(false);
      setAppMode('GAME');
  };

  const startEditing = () => {
      if (!activeCampaignId) return;
      setAppMode('EDITOR');
  };

  const handleEditorSave = (newConfig: GameConfig) => {
      const updatedCampaigns = campaigns.map(c => {
          if (c.id === activeCampaignId) {
              return { ...c, config: newConfig, lastPlayed: Date.now() };
          }
          return c;
      });
      saveCampaigns(updatedCampaigns);
      alert("Campaign Saved!");
  };

  // --- RUNTIME LOGIC ---

  const activeConfig = campaigns.find(c => c.id === activeCampaignId)?.config || DEFAULT_GAME_CONFIG;
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const addLog = (msg: string) => {
    setGameState(prev => ({
      ...prev,
      messageLog: [msg, ...prev.messageLog].slice(0, 5)
    }));
  };

  // Flying Logic
  const flyToFloor = (floorIdx: number) => {
      if (floorIdx > gameState.hero.maxFloorVisited) return;
      
      // Find safe spot (up stair usually safe)
      let tx = 0, ty = 0;
      let found = false;
      const map = gameState.maps[floorIdx];
      
      // Try to find Stairs UP to spawn on, or Down
      for(let r=0; r<MAP_SIZE; r++) {
          for(let c=0; c<MAP_SIZE; c++) {
              if (map[r][c] === TileType.STAIRS_UP || map[r][c] === TileType.STAIRS_DOWN) {
                  tx = c; ty = r; found = true; break;
              }
          }
          if (found) break;
      }
      
      setGameState(prev => ({
          ...prev,
          hero: { ...prev.hero, floor: floorIdx, x: tx, y: ty },
          messageLog: [`Flew to Floor ${floorIdx}.`, ...prev.messageLog]
      }));
      setShowFlyModal(false);
  };

  const handleCombat = (tileId: number, r: number, c: number) => {
    const { hero, maps } = gameStateRef.current;
    
    // Check standard monsters OR custom monsters
    let monster = activeConfig.monsterDefs[tileId];
    if (!monster && activeConfig.customTiles && activeConfig.customTiles[tileId]) {
        const custom = activeConfig.customTiles[tileId];
        if (custom.type === 'MONSTER') {
            monster = {
                name: custom.name,
                hp: custom.hp || 10,
                atk: custom.atk || 1,
                def: custom.def || 0,
                gold: custom.gold || 0,
                exp: custom.exp || 0,
                color: custom.color
            };
        }
    }

    if (!monster) return;

    const heroDmg = hero.atk - monster.def;
    if (heroDmg <= 0) {
      addLog(`You cannot hurt the ${monster.name}!`);
      return;
    }

    const monsterDmg = Math.max(0, monster.atk - hero.def);
    const rounds = Math.ceil(monster.hp / heroDmg);
    const damageTaken = (rounds - 1) * monsterDmg;

    if (hero.hp <= damageTaken) {
      setGameState(prev => ({
        ...prev, hero: { ...prev.hero, hp: 0 }, gameStatus: 'GAME_OVER',
        messageLog: [`Defeated by ${monster.name}!`, ...prev.messageLog]
      }));
      return;
    }

    // Victory
    const newMaps = [...maps];
    newMaps[hero.floor][r][c] = TileType.EMPTY;
    
    let newExp = hero.exp + monster.exp;
    let newLvl = hero.lvl;
    let newAtk = hero.atk;
    let newDef = hero.def;
    let newHp = hero.hp - damageTaken;

    while (newExp >= XP_LEVEL_THRESHOLD * newLvl) {
      newExp -= XP_LEVEL_THRESHOLD * newLvl;
      newLvl++;
      newAtk += 2;
      newDef += 2;
      newHp += 100;
      addLog(`Level Up! You are now level ${newLvl}.`);
    }

    setGameState(prev => ({
      ...prev,
      hero: { ...prev.hero, hp: newHp, gold: prev.hero.gold + monster.gold, exp: newExp, lvl: newLvl, atk: newAtk, def: newDef },
      maps: newMaps,
      messageLog: [`Defeated ${monster.name}. Lost ${damageTaken} HP.`, ...prev.messageLog]
    }));
  };

  const attemptMove = useCallback((dx: number, dy: number) => {
    if (appMode !== 'GAME') return;
    const { hero, maps, gameStatus } = gameStateRef.current;
    if (gameStatus !== 'PLAYING') return;

    const newX = hero.x + dx;
    const newY = hero.y + dy;

    if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) return;

    const targetTile = maps[hero.floor][newY][newX];
    
    let newDirection = hero.direction;
    if (dx > 0) newDirection = Direction.RIGHT;
    if (dx < 0) newDirection = Direction.LEFT;
    if (dy > 0) newDirection = Direction.DOWN;
    if (dy < 0) newDirection = Direction.UP;

    if (targetTile === TileType.WALL) {
       setGameState(prev => ({ ...prev, hero: { ...prev.hero, direction: newDirection }}));
       return;
    }

    // Check Monsters (Standard or Custom)
    if (activeConfig.monsterDefs[targetTile] || (activeConfig.customTiles?.[targetTile]?.type === 'MONSTER')) {
       handleCombat(targetTile, newY, newX);
       return;
    }

    // Doors
    if ([TileType.DOOR_YELLOW, TileType.DOOR_BLUE, TileType.DOOR_RED].includes(targetTile)) {
      const keys = { ...hero.keys };
      let opened = false;
      if (targetTile === TileType.DOOR_YELLOW && keys.yellow > 0) { keys.yellow--; opened = true; }
      else if (targetTile === TileType.DOOR_BLUE && keys.blue > 0) { keys.blue--; opened = true; }
      else if (targetTile === TileType.DOOR_RED && keys.red > 0) { keys.red--; opened = true; }
      
      if (opened) {
        const newMaps = [...maps];
        newMaps[hero.floor][newY][newX] = TileType.EMPTY;
        setGameState(prev => ({
          ...prev, hero: { ...prev.hero, keys, direction: newDirection }, maps: newMaps,
          messageLog: ["Door opened.", ...prev.messageLog]
        }));
      } else addLog("Locked!");
      return;
    }

    // Items Logic
    let updates: Partial<HeroState> = { x: newX, y: newY, direction: newDirection };
    let mapUpdate = false;
    let logMsg = "";

    // Standard Items
    switch (targetTile) {
      case TileType.KEY_YELLOW: updates.keys = { ...hero.keys, yellow: hero.keys.yellow + 1 }; mapUpdate = true; logMsg = "Yellow Key."; break;
      case TileType.KEY_BLUE: updates.keys = { ...hero.keys, blue: hero.keys.blue + 1 }; mapUpdate = true; logMsg = "Blue Key."; break;
      case TileType.KEY_RED: updates.keys = { ...hero.keys, red: hero.keys.red + 1 }; mapUpdate = true; logMsg = "Red Key."; break;
      case TileType.POTION_RED: updates.hp = hero.hp + 50; mapUpdate = true; logMsg = "HP +50."; break;
      case TileType.POTION_BLUE: updates.hp = hero.hp + 200; mapUpdate = true; logMsg = "HP +200."; break;
      case TileType.GEM_RED: updates.atk = hero.atk + 1; mapUpdate = true; logMsg = "Atk +1."; break;
      case TileType.GEM_BLUE: updates.def = hero.def + 1; mapUpdate = true; logMsg = "Def +1."; break;
      case TileType.GEM_SUPER_RED: updates.atk = hero.atk + 5; mapUpdate = true; logMsg = "Atk +5!"; break;
      case TileType.GEM_SUPER_BLUE: updates.def = hero.def + 5; mapUpdate = true; logMsg = "Def +5!"; break;
      case TileType.ITEM_PICKAXE: updates.pickaxes = (hero.pickaxes||0) + 1; mapUpdate = true; logMsg = "Pickaxe."; break;
      
      // Stairs
      case TileType.STAIRS_UP: {
        const nextFloor = hero.floor + 1;
        if (nextFloor < maps.length) {
          updates.floor = nextFloor;
          updates.maxFloorVisited = Math.max(hero.maxFloorVisited, nextFloor);
          // Teleport logic
          let found = false;
          for(let r=0;r<MAP_SIZE;r++) for(let c=0;c<MAP_SIZE;c++) if(maps[nextFloor][r][c]===TileType.STAIRS_DOWN){ updates.x=c; updates.y=r; found=true; break;}
          logMsg = `Floor ${nextFloor}.`;
        }
        break;
      }
      case TileType.STAIRS_DOWN: {
        const prevFloor = hero.floor - 1;
        if (prevFloor >= 0) {
          updates.floor = prevFloor;
          let found = false;
          for(let r=0;r<MAP_SIZE;r++) for(let c=0;c<MAP_SIZE;c++) if(maps[prevFloor][r][c]===TileType.STAIRS_UP){ updates.x=c; updates.y=r; found=true; break;}
          logMsg = `Floor ${prevFloor}.`;
        }
        break;
      }
    }

    // Custom Items Logic
    if (activeConfig.customTiles && activeConfig.customTiles[targetTile]) {
        const custom = activeConfig.customTiles[targetTile];
        if (custom.type === 'ITEM') {
            mapUpdate = true;
            logMsg = `Got ${custom.name}`;
            updates.hp = hero.hp + (custom.hp || 0);
            updates.atk = hero.atk + (custom.atk || 0);
            updates.def = hero.def + (custom.def || 0);
            updates.gold = hero.gold + (custom.gold || 0);
            updates.exp = hero.exp + (custom.exp || 0);
            if (custom.keys) {
                updates.keys = {
                    yellow: hero.keys.yellow + (custom.keys.yellow || 0),
                    blue: hero.keys.blue + (custom.keys.blue || 0),
                    red: hero.keys.red + (custom.keys.red || 0),
                };
            }
            if (custom.pickaxes) updates.pickaxes = (hero.pickaxes || 0) + custom.pickaxes;
        }
    }

    const newMaps = [...maps];
    if (mapUpdate) {
      newMaps[hero.floor][newY][newX] = TileType.EMPTY;
      if (logMsg) addLog(logMsg);
    } 

    setGameState(prev => ({
      ...prev,
      hero: { ...prev.hero, ...updates },
      maps: mapUpdate ? newMaps : prev.maps
    }));

  }, [appMode, activeConfig]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appMode !== 'GAME') return;
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'ArrowUp': case 'w': attemptMove(0, -1); break;
        case 'ArrowDown': case 's': attemptMove(0, 1); break;
        case 'ArrowLeft': case 'a': attemptMove(-1, 0); break;
        case 'ArrowRight': case 'd': attemptMove(1, 0); break;
        case 'f': setShowFlyModal(true); break;
        case 'm': setShowMonsterManual(!showMonsterManual); break;
        case 'Escape': setAppMode('MENU'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appMode, attemptMove, showMonsterManual]);


  // ----------------------------------------------------------------
  // RENDER: LANDING PAGE
  // ----------------------------------------------------------------
  if (!userRole) {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
              <div className="text-center mb-12">
                  <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4 drop-shadow-lg tracking-tighter">
                      MAGIC ENGINE
                  </h1>
                  <p className="text-slate-400 text-lg">Select your interface</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl relative">
                  {/* Player Card */}
                  <button 
                    onClick={() => setUserRole('PLAYER')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-blue-500 rounded-xl p-8 transition-all group group-hover:scale-105"
                  >
                      <div className="w-20 h-20 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
                          <Gamepad2 className="w-10 h-10 text-blue-300 group-hover:text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Player Arcade</h2>
                      <p className="text-slate-400 text-sm">Play campaigns created by the community. No editing tools, just pure gameplay.</p>
                  </button>

                  {/* Admin Card */}
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-yellow-500 rounded-xl p-8 transition-all group"
                  >
                      <div className="w-20 h-20 bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-600 transition-colors">
                          <UserCog className="w-10 h-10 text-yellow-300 group-hover:text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Creator Studio</h2>
                      <p className="text-slate-400 text-sm">Full access to the Game Engine. Create maps, design assets, and manage campaigns.</p>
                      <div className="mt-4 flex items-center justify-center gap-1 text-xs text-yellow-600">
                          <Lock size={12} /> Protected
                      </div>
                  </button>

                  {/* Auth Modal */}
                  {showAuthModal && (
                      <div className="absolute inset-0 bg-black/90 rounded-xl flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
                          <div className="bg-slate-800 p-6 rounded-lg border border-yellow-600 shadow-2xl max-w-sm w-full mx-4 text-center">
                              <h2 className="text-xl font-bold text-yellow-500 mb-4">Creator Access</h2>
                              <input 
                                  type="password" 
                                  value={adminPassword}
                                  onChange={(e) => setAdminPassword(e.target.value)}
                                  placeholder="Enter Password"
                                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded mb-4 focus:border-yellow-500 outline-none text-center tracking-widest"
                                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                                  autoFocus
                              />
                              <div className="flex gap-2">
                                  <button onClick={() => { setShowAuthModal(false); setAdminPassword(''); }} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded text-sm font-bold">Cancel</button>
                                  <button onClick={handleAdminLogin} className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded text-sm font-bold">Login</button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )
  }

  // ----------------------------------------------------------------
  // RENDER: EDITOR
  // ----------------------------------------------------------------
  if (appMode === 'EDITOR' && userRole === 'ADMIN') {
      return (
          <LevelEditor 
              initialConfig={activeConfig} 
              onSave={handleEditorSave} 
              onExit={() => setAppMode('MENU')} 
          />
      );
  }

  // ----------------------------------------------------------------
  // RENDER: MENU (Dual Interface)
  // ----------------------------------------------------------------
  if (appMode === 'MENU') {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 font-mono">
              
              {/* Top Navigation */}
              <div className="w-full max-w-6xl flex justify-between items-center py-6 mb-4">
                  <div className="flex items-center gap-3">
                      {userRole === 'ADMIN' ? <UserCog className="text-yellow-500" /> : <Gamepad2 className="text-blue-500" />}
                      <h1 className={`text-2xl font-bold ${userRole === 'ADMIN' ? 'text-yellow-500' : 'text-blue-500'}`}>
                          {userRole === 'ADMIN' ? 'CREATOR STUDIO' : 'PLAYER ARCADE'}
                      </h1>
                  </div>
                  <button 
                    onClick={() => setUserRole(null)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 border border-slate-600 px-4 py-2 rounded hover:bg-slate-800 transition"
                  >
                      <LogOut size={16} /> Switch Role
                  </button>
              </div>

              {/* ADMIN INTERFACE */}
              {userRole === 'ADMIN' && (
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Tools */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
                            <button onClick={createCampaign} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded mb-3 flex items-center justify-center gap-2">
                                <Plus /> New Campaign
                            </button>
                            <p className="text-xs text-gray-400 mt-4">
                                Select a campaign from the list to Edit or Play. All changes in the Editor are persistent.
                            </p>
                        </div>
                    </div>

                    {/* Campaign List */}
                    <div className="md:col-span-2 space-y-4">
                        {campaigns.map(c => (
                            <div 
                                key={c.id} 
                                onClick={() => selectCampaign(c.id)}
                                className={`bg-slate-800 p-6 rounded-lg border-2 transition-all cursor-pointer relative group ${activeCampaignId === c.id ? 'border-yellow-500 bg-slate-800' : 'border-slate-700 hover:border-slate-500'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{c.name}</h3>
                                        <p className="text-gray-400 text-sm mt-1">{c.description}</p>
                                        <div className="flex gap-4 mt-3 text-xs text-gray-500">
                                            <span>Floors: {c.config.maps.length}</span>
                                            <span>Updated: {new Date(c.lastPlayed).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => deleteCampaign(c.id, e)}
                                        className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                    >
                                        <Trash2 />
                                    </button>
                                </div>
                                
                                {activeCampaignId === c.id && (
                                    <div className="mt-6 flex gap-3 border-t border-slate-700 pt-4 animate-fade-in">
                                        <button onClick={() => startPlaying()} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
                                            <Play size={18} /> Test Play
                                        </button>
                                        <button onClick={startEditing} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
                                            <PenTool size={18} /> Open Editor
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {/* PLAYER INTERFACE */}
              {userRole === 'PLAYER' && (
                  <div className="w-full max-w-6xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {campaigns.map(c => (
                              <div key={c.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col h-64">
                                  {/* Thumbnail placeholder */}
                                  <div className="h-24 bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center border-b border-slate-700">
                                      <MapIcon className="text-white/20 w-12 h-12" />
                                  </div>
                                  <div className="p-5 flex-1 flex flex-col">
                                      <h3 className="text-xl font-bold text-white mb-1 truncate">{c.name}</h3>
                                      <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">{c.description}</p>
                                      
                                      <div className="flex justify-between items-center">
                                          <span className="text-xs bg-slate-900 text-gray-400 px-2 py-1 rounded">
                                              {c.config.maps.length} Floors
                                          </span>
                                          <button 
                                            onClick={() => startPlaying(c.id)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 shadow-lg shadow-blue-900/50"
                                          >
                                              <Play size={16} /> PLAY
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

          </div>
      );
  }

  // ----------------------------------------------------------------
  // RENDER: GAME
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-2 font-mono relative">
      
      {/* Game Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-4">
        <h1 className="text-xl font-bold text-yellow-500 tracking-tighter">{activeConfig.monsterDefs[99]?.name || "MAGIC TOWER"}</h1>
        <div className="flex gap-2">
           <button onClick={() => setShowMonsterManual(true)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded flex gap-2 items-center text-sm border border-slate-600 text-yellow-500">
             <BookOpen size={16} /> <span className="hidden sm:inline">Book (M)</span>
           </button>
           <button onClick={() => setShowFlyModal(true)} className="bg-slate-700 hover:bg-slate-600 p-2 rounded flex gap-2 items-center text-sm border border-slate-500">
             <Plane size={16} /> <span className="hidden sm:inline">Fly (F)</span>
           </button>
           <button onClick={() => setAppMode('MENU')} className="bg-slate-800 hover:bg-slate-700 p-2 rounded flex gap-2 items-center text-sm border border-slate-600 text-gray-400">
             <ArrowLeft size={16} /> Back to Menu
           </button>
        </div>
      </div>

      <div className={`flex flex-col md:flex-row gap-6 items-start max-w-5xl w-full`}>
        <StatusPanel hero={gameState.hero} />
        
        <div className="flex-shrink-0 relative">
            <GameMap 
                mapData={gameState.maps[gameState.hero.floor]} 
                hero={gameState.hero} 
                monsterDefs={activeConfig.monsterDefs}
                customTiles={activeConfig.customTiles}
            />
            
            {gameState.gameStatus !== 'PLAYING' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                    <h2 className={`text-4xl font-bold mb-4 ${gameState.gameStatus === 'VICTORY' ? 'text-yellow-400' : 'text-red-500'}`}>
                        {gameState.gameStatus === 'VICTORY' ? 'VICTORY!' : 'YOU DIED'}
                    </h2>
                    <button onClick={() => startPlaying()} className="px-6 py-2 bg-white text-black font-bold rounded hover:scale-105 transition">Restart Floor</button>
                </div>
            )}
        </div>

        <div className="flex flex-col w-full md:w-64 gap-4">
            <div className="bg-black/50 p-3 rounded h-32 md:h-64 overflow-hidden border border-slate-700 text-xs shadow-inner">
                {gameState.messageLog.map((msg, i) => (
                    <div key={i} className={`mb-1 ${i===0 ? 'text-white font-bold' : 'text-gray-500'}`}>{`> ${msg}`}</div>
                ))}
            </div>
        </div>
      </div>
      
      {/* Modals */}
      <MonsterManual 
        isOpen={showMonsterManual} 
        onClose={() => setShowMonsterManual(false)} 
        hero={gameState.hero} 
        currentFloorMap={gameState.maps[gameState.hero.floor]} 
        monsterDefs={activeConfig.monsterDefs}
        customTiles={activeConfig.customTiles}
      />

      {/* Fly Modal */}
      {showFlyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded border border-slate-600 max-w-sm w-full">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Plane /> Select Floor</h3>
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {gameState.maps.map((_, idx) => (
                        <button 
                            key={idx}
                            disabled={idx > gameState.hero.maxFloorVisited}
                            onClick={() => flyToFloor(idx)}
                            className={`p-2 rounded font-bold ${idx === gameState.hero.floor ? 'bg-yellow-600' : idx <= gameState.hero.maxFloorVisited ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-700 text-gray-500'}`}
                        >
                            {idx}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowFlyModal(false)} className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded">Cancel</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default App;
