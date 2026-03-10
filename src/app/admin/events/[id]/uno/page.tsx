"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface UnoScore {
  id: string;
  player_name: string;
  score: number;
}

interface UnoGame {
  id: string;
  status: string;
  scores: UnoScore[];
}

export default function UnoScorerPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [game, setGame] = useState<UnoGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [attendees, setAttendees] = useState<{name: string, id: string}[]>([]);
  const [unoWinnerName, setUnoWinnerName] = useState<string | null>(null);
  const [unoVersion, setUnoVersion] = useState<string>("classic");
  const [flipSide, setFlipSide] = useState<"light" | "dark">("light");
  
  // Calculator state
  const [activeScoreId, setActiveScoreId] = useState<string | null>(null);
  const [roundTotal, setRoundTotal] = useState(0);

  useEffect(() => {
    fetchGame();
    fetchAttendees();
  }, [eventId]);

  const fetchAttendees = async () => {
    try {
      // Reusing the existing API endpoint by fetching the event details (which includes bookings)
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) return;
      const data = await res.json();
      
      // `data` is the event object directly, not wrapped in { event: ... }
      const checkedIn = data.bookings
        ?.filter((b: any) => b.status === "checked_in" || b.status === "CHECKED_IN")
        ?.map((b: any) => ({ name: b.attendee.name, id: b.attendee.id })) || [];
        
      setAttendees(checkedIn);
      if (data.uno_version) setUnoVersion(data.uno_version);
      
      if (data.uno_winner_name) {
        setUnoWinnerName(data.uno_winner_name);
      } else {
        setUnoWinnerName(null);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/uno/games?eventId=${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch game");
      const data = await res.json();
      
      if (!data) {
        // Create new game automatically if doesn't exist and the game isn't already won
        const eventRes = await fetch(`/api/events/${eventId}`);
        const eventData = await eventRes.json();
        
        if (!eventData.uno_winner_name) {
          const createRes = await fetch(`/api/uno/games`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_id: eventId })
          });
          const newGame = await createRes.json();
          setGame({ ...newGame, scores: [] });
        } else {
          setGame(null); // Game is already over and wiped
        }
      } else {
        setGame(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !game) return;

    try {
      const res = await fetch("/api/uno/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: game.id, player_name: newPlayerName.trim() }),
      });
      if (res.ok) {
        setNewPlayerName("");
        fetchGame(); // Refresh scores
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPoints = (points: number) => {
    setRoundTotal((prev) => prev + points);
  };

  const handleSaveRound = async () => {
    if (!activeScoreId || roundTotal === 0) {
      setActiveScoreId(null);
      setRoundTotal(0);
      return;
    }

    try {
      const res = await fetch("/api/uno/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score_id: activeScoreId, additional_score: roundTotal }),
      });
      
      const payload = await res.json();

      if (res.ok) {
        setActiveScoreId(null);
        setRoundTotal(0);

        if (payload.gameOver) {
          setUnoWinnerName(payload.winner);
          setGame(null); // Clear game out since it was deleted by the backend
        } else {
          fetchGame();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemovePlayer = async (scoreId: string) => {
    if (!confirm("Remove this player?")) return;
    try {
      const res = await fetch(`/api/uno/scores?id=${scoreId}`, { method: "DELETE" });
      if (res.ok) fetchGame();
    } catch(e) { console.error(e); }
  };

  const handleResetGame = async () => {
    if (!confirm("Are you sure? This will delete all scores and restart the game.")) return;
    try {
      const res = await fetch(`/api/uno/games?eventId=${eventId}`, { method: "DELETE" });
      if (res.ok) {
        setGame(null);
        setUnoWinnerName(null);
        // We do not auto-initialize immediately, let the user click to start a new game,
        // or just let fetchGame handle rebuilding it.
        fetchGame();
      }
    } catch(e) { console.error(e); }
  };

  const isGameOver = !!unoWinnerName;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 rounded-full border-t-2 border-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="uppercase font-inter max-w-4xl mx-auto pb-20">
      <Link href="/admin" className="text-[10px] font-bold tracking-[0.2em] text-light/50 hover:text-white transition-colors mb-8 inline-block">
        ← BACK TO DASHBOARD
      </Link>
      
      <div className="mb-12 border-b border-light/10 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-seasons tracking-tighter text-light drop-shadow-md">UNO SCORER</h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent leading-none mt-3 mb-1">
            RECORD SCORES FOR THIS EVENT
          </p>
        </div>
        <button
          onClick={handleResetGame}
          className="text-[10px] font-bold tracking-[0.2em] bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-3 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 mt-1 w-full md:w-auto whitespace-nowrap"
        >
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          RESET GAME
        </button>
      </div>

      {isGameOver && unoWinnerName && (
        <div className="mb-12 glass-panel p-8 rounded-3xl border border-accent/50 bg-accent/5 text-center animate-in fade-in zoom-in duration-500">
          <h2 className="text-5xl font-black font-seasons tracking-tighter text-accent drop-shadow-[0_0_15px_rgba(198,255,0,0.5)] mb-2">GAME OVER</h2>
          <p className="text-xs uppercase font-bold tracking-[0.3em] text-light mb-6">Winner Declared</p>
          <div className="inline-block bg-white/10 px-8 py-4 rounded-2xl border border-white/20">
            <span className="text-3xl font-black text-white mr-4">👑 {unoWinnerName}</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
        {/* Left Column: Player Grid */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold tracking-[0.2em] text-light/80 border-b border-white/10 pb-4 mb-2">PLAYERS & SCORES</h2>
          
          {game?.scores.length === 0 && (
            <div className="glass-panel rounded-3xl p-8 text-center border border-white/5">
              <p className="text-xs font-bold tracking-[0.2em] text-light/50">NO PLAYERS YET.</p>
            </div>
          )}

          <div className="grid gap-4">
            {game?.scores.map((score) => (
              <div 
                key={score.id}
                className={`glass-panel rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between border transition-all duration-300 relative group gap-4 ${activeScoreId === score.id ? 'border-accent shadow-[0_0_30px_rgba(198,255,0,0.15)] bg-white/5' : 'border-white/5 hover:border-white/15'}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => handleRemovePlayer(score.id)}
                    className="w-6 h-6 shrink-0 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    title="Remove Player"
                  >
                    ×
                  </button>
                  <div className="min-w-0 pr-4">
                    <div className="text-xl font-black tracking-tight text-light truncate">{score.player_name}</div>
                    <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-light/50 mt-1">TOTAL SCORE</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto shrink-0 pl-10 md:pl-0">
                  <div className="text-3xl font-seasons font-black text-accent w-20 text-left md:text-right">{score.score}</div>
                  
                  {!isGameOver && activeScoreId !== score.id && (
                    <button
                      onClick={() => {
                        setActiveScoreId(score.id);
                        setRoundTotal(0);
                      }}
                      className="text-[10px] font-bold tracking-[0.2em] bg-white/10 border border-white/20 text-light px-4 py-2 rounded-full hover:bg-white/20 transition-all font-inter w-28 shrink-0 flex items-center justify-center"
                    >
                      + SCORE
                    </button>
                  )}
                  {(!isGameOver && activeScoreId === score.id) && (
                    <div className="w-28 shrink-0"></div> // Spacer to keep layout shift to a minimum when calculator opens
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Calculator Overlay inline */}
          {activeScoreId && (
            <div className="mt-8 glass-panel p-6 rounded-[2rem] border border-accent/30 bg-black/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold tracking-[0.2em] text-accent">CALCULATE PENALTY</h3>
                  <p className="text-[10px] text-light/50 tracking-[0.1em] mt-1">Tap cards left in player's hand</p>
                  
                  {unoVersion === "flip" && (
                    <div className="flex bg-black/50 rounded-full p-1 mt-3 border border-white/10 w-fit">
                      <button 
                        onClick={() => setFlipSide("light")}
                        className={`text-[9px] px-4 py-1.5 rounded-full font-bold tracking-[0.2em] transition-colors ${flipSide === 'light' ? 'bg-white/20 text-white' : 'text-light/40 hover:text-white'}`}
                      >
                        LIGHT SIDE
                      </button>
                      <button 
                        onClick={() => setFlipSide("dark")}
                        className={`text-[9px] px-4 py-1.5 rounded-full font-bold tracking-[0.2em] transition-colors ${flipSide === 'dark' ? 'bg-indigo-500/40 text-indigo-300' : 'text-light/40 hover:text-white'}`}
                      >
                        DARK SIDE
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-seasons font-black text-white">+{roundTotal}</div>
                  <div className="text-[10px] tracking-[0.2em] text-light/50 font-bold">ROUND TOTAL</div>
                </div>
              </div>

              {/* Classic Mode */}
              {unoVersion === "classic" && (
                <>
                  <div className="mb-4">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-light/50 mb-3">NUMBER CARDS (Face Value)</div>
                    <div className="grid grid-cols-5 gap-2">
                      {[0,1,2,3,4,5,6,7,8,9].map(num => (
                        <button key={num} onClick={() => handleAddPoints(num)} className="h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-lg hover:bg-blue-500 hover:text-white transition-colors">{num}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-light/50 mb-3">ACTION CARDS (20 PTS)</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-xs hover:bg-amber-400 hover:text-black transition-colors">SKIP</button>
                      <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-green-400/10 border border-green-400/30 text-green-400 font-bold text-xs hover:bg-green-400 hover:text-black transition-colors">REVERSE</button>
                      <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-rose-400/10 border border-rose-400/30 text-rose-400 font-bold text-xs hover:bg-rose-400 hover:text-black transition-colors">+2 DRAW</button>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-light/50 mb-3">WILD CARDS (50 PTS)</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleAddPoints(50)} className="h-12 rounded-xl bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-blue-500/20 border border-white/20 text-white font-bold text-xs hover:from-red-500 transition-all">WILD</button>
                      <button onClick={() => handleAddPoints(50)} className="h-12 rounded-xl bg-gradient-to-r from-rose-500/30 via-purple-500/30 to-blue-500/30 border border-white/20 text-white font-bold text-xs hover:from-rose-500 transition-all">+4 WILD</button>
                    </div>
                  </div>
                </>
              )}

              {/* Flip Mode */}
              {unoVersion === "flip" && (
                <>
                  <div className="mb-4">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-light/50 mb-3">NUMBER CARDS (Face Value)</div>
                    <div className="grid grid-cols-5 gap-2">
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                        <button key={num} onClick={() => handleAddPoints(num)} className="h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-colors">{num}</button>
                      ))}
                    </div>
                  </div>
                  
                  {flipSide === "light" ? (
                    <>
                      <div className="mb-4">
                        <div className="text-[10px] font-bold tracking-[0.2em] text-light/50 mb-3">ACTION CARDS (10 - 20 PTS)</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleAddPoints(10)} className="h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-bold text-xs hover:bg-cyan-400 hover:text-black transition-colors">DRAW 1 (10)</button>
                          <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-green-400/10 border border-green-400/30 text-green-400 font-bold text-xs hover:bg-green-400 hover:text-black transition-colors">REVERSE (20)</button>
                          <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-xs hover:bg-amber-400 hover:text-black transition-colors">SKIP (20)</button>
                          <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-purple-400/10 border border-purple-400/30 text-purple-400 font-bold text-xs hover:bg-purple-400 hover:text-black transition-colors">FLIP (20)</button>
                        </div>
                      </div>
                      <div className="mb-6">
                        <div className="text-[10px] font-bold tracking-[0.2em] text-light/50 mb-3">WILD CARDS (40 - 50 PTS)</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleAddPoints(40)} className="h-10 rounded-xl bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-blue-500/20 border border-white/20 text-white font-bold text-[10px] hover:from-red-500 transition-all">WILD (40)</button>
                          <button onClick={() => handleAddPoints(50)} className="h-10 rounded-xl bg-gradient-to-r from-rose-500/30 via-purple-500/30 to-blue-500/30 border border-white/20 text-white font-bold text-[10px] hover:from-rose-500 transition-all">WILD DRAW 2 (50)</button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="text-[10px] font-bold tracking-[0.2em] text-indigo-300/70 mb-3">DARK ACTION CARDS (20 - 30 PTS)</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-xs hover:bg-teal-500 hover:text-black transition-colors">DRAW 5 (20)</button>
                          <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500 hover:text-black transition-colors">REVERSE (20)</button>
                          <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 font-bold text-xs hover:bg-fuchsia-500 hover:text-black transition-colors">FLIP (20)</button>
                          <button onClick={() => handleAddPoints(30)} className="h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold text-[10px] hover:bg-orange-500 hover:text-black transition-colors">SKIP EVERYONE (30)</button>
                        </div>
                      </div>
                      <div className="mb-6">
                        <div className="text-[10px] font-bold tracking-[0.2em] text-indigo-300/70 mb-3">DARK WILD CARDS (40 - 60 PTS)</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleAddPoints(40)} className="h-10 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 text-indigo-200 font-bold text-[10px] hover:from-indigo-600 transition-all">WILD (40)</button>
                          <button onClick={() => handleAddPoints(60)} className="h-10 rounded-xl bg-gradient-to-r from-red-600/30 via-orange-600/30 to-purple-600/30 border border-red-500/30 text-red-200 font-bold text-[10px] hover:from-red-600 transition-all">WILD DRAW COLOR (60)</button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* No Mercy Mode */}
              {unoVersion === "no_mercy" && (
                <>
                  <div className="mb-4">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-light/50 mb-3">NUMBER CARDS (Face Value)</div>
                    <div className="grid grid-cols-5 gap-2">
                      {[0,1,2,3,4,5,6,7,8,9].map(num => (
                        <button key={num} onClick={() => handleAddPoints(num)} className="h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-colors">{num}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-light/50 mb-3">ACTION CARDS (20 PTS)</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-white/5 border border-white/10 text-light font-bold text-[9px] hover:bg-white/10 transition-colors">SKIP</button>
                      <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-white/5 border border-white/10 text-light font-bold text-[9px] hover:bg-white/10 transition-colors">REVERSE</button>
                      <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-white/5 border border-white/10 text-light font-bold text-[9px] hover:bg-white/10 transition-colors">DRAW 2</button>
                      <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-white/5 border border-white/10 text-light font-bold text-[9px] hover:bg-white/10 transition-colors">DRAW 4</button>
                      <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-white/5 border border-white/10 text-light font-bold text-[9px] hover:bg-white/10 transition-colors">DISCARD ALL</button>
                      <button onClick={() => handleAddPoints(20)} className="h-10 rounded-xl bg-white/5 border border-white/10 text-light font-bold text-[9px] hover:bg-white/10 transition-colors">SKIP EVERYONE</button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-light/50 mb-3">WILD ACTION CARDS (50 PTS)</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleAddPoints(50)} className="h-10 rounded-xl bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-blue-500/20 border border-white/20 text-white font-bold text-[9px] hover:from-red-500 transition-all">WILD REV DRAW 4</button>
                      <button onClick={() => handleAddPoints(50)} className="h-10 rounded-xl bg-gradient-to-r from-rose-500/30 via-purple-500/30 to-blue-500/30 border border-white/20 text-white font-bold text-[9px] hover:from-rose-500 transition-all">WILD DRAW 6</button>
                      <button onClick={() => handleAddPoints(50)} className="h-10 rounded-xl bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-pink-500/30 border border-white/20 text-white font-bold text-[9px] hover:from-indigo-500 transition-all">WILD DRAW 10</button>
                      <button onClick={() => handleAddPoints(50)} className="h-10 rounded-xl bg-gradient-to-r from-teal-500/30 via-emerald-500/30 to-lime-500/30 border border-white/20 text-white font-bold text-[9px] hover:from-teal-500 transition-all">WILD COLOR ROULETTE</button>
                    </div>
                  </div>
                  <div className="mb-6 pt-4 border-t border-red-500/20">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-light/50 mb-3 text-red-400">BRUTAL PENALTIES</div>
                    <button onClick={() => handleAddPoints(250)} className="w-full h-12 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-500 hover:text-white transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                      +250 KNOCKOUT BONUS !
                    </button>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveScoreId(null);
                    setRoundTotal(0);
                  }}
                  className="flex-1 py-4 rounded-full border border-white/10 text-[10px] font-bold tracking-[0.2em] hover:bg-white/5 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveRound}
                  className="flex-1 py-4 rounded-full bg-accent text-black text-[10px] font-bold tracking-[0.2em] hover:shadow-[0_0_20px_rgba(198,255,0,0.4)] transition-all"
                >
                  SAVE ROUND
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Add Player */}
        <div className="glass-panel rounded-3xl p-6 sticky top-8">
          <h2 className="text-sm font-bold tracking-[0.2em] text-light/80 border-b border-white/10 pb-4 mb-6">ADD PLAYER</h2>
          {isGameOver ? (
            <div className="text-center py-6">
              <p className="text-[10px] font-bold tracking-[0.2em] text-light/50">GAME HAS ENDED</p>
              <p className="text-xs text-light/30 mt-2">Reset game to add players.</p>
            </div>
          ) : (
            <form onSubmit={handleAddPlayer} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-light/50 mb-2">SELECT CHECKED-IN PLAYER</label>
                <select
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-light font-medium focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-dark text-light/50">Select player...</option>
                  {attendees
                    .filter(a => !game?.scores.some(s => s.player_name === a.name)) // filter out already added
                    .map(a => (
                      <option key={a.id} value={a.name} className="bg-dark text-light">{a.name}</option>
                    ))
                  }
                </select>
              </div>
              <button
                type="submit"
                disabled={!newPlayerName.trim() || activeScoreId !== null}
                className="w-full bg-accent/10 border border-accent/20 text-accent font-bold text-[10px] tracking-[0.2em] py-3 rounded-xl hover:bg-accent hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(198,255,0,0.3)]"
              >
                + ADD PLAYER
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
