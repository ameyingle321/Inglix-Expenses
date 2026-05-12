import React, { useEffect, useState } from 'react';
import { leaderboardService } from '../../services/leaderboardService';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Trophy, ArrowUpRight, ArrowDownLeft, Medal } from 'lucide-react';
import clsx from 'clsx';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardService.getLeaderboard();
        setLeaderboard(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-8"><LoadingSkeleton type="full" /></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-3">
          <Trophy className="w-7 h-7 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-slate-500 mt-1">See who owes the most among your contacts.</p>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
      ) : leaderboard.length === 0 ? (
        <EmptyState 
          icon={<Trophy className="w-8 h-8" />}
          title="No data yet"
          description="Add expenses and split them to see the leaderboard."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-sm font-medium text-slate-500 uppercase tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">Contact</div>
            <div className="col-span-3 text-right">Total Owed</div>
            <div className="col-span-3 text-right">Pending</div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {leaderboard.map((entry, index) => (
              <div key={entry.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                
                {/* Rank */}
                <div className="hidden md:flex col-span-1 justify-center">
                  {index === 0 ? <Medal className="w-6 h-6 text-yellow-500" /> : 
                   index === 1 ? <Medal className="w-6 h-6 text-slate-400" /> : 
                   index === 2 ? <Medal className="w-6 h-6 text-amber-600" /> : 
                   <span className="font-semibold text-slate-400">#{index + 1}</span>}
                </div>
                
                {/* Contact Info */}
                <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                  {/* Mobile Rank Badge */}
                  <div className="md:hidden">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-semibold text-slate-600 uppercase overflow-hidden shrink-0">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover" />
                    ) : (
                      entry.name.charAt(0)
                    )}
                  </div>
                  <span className="font-semibold text-brand-dark">{entry.name}</span>
                </div>
                
                {/* Total Owed (All time) */}
                <div className="col-span-1 md:col-span-3 flex justify-between md:block md:text-right">
                  <span className="text-sm text-slate-500 md:hidden">Total (All Time):</span>
                  <span className="font-medium text-slate-700">₹{entry.total_owed_to_user.toFixed(2)}</span>
                </div>
                
                {/* Pending */}
                <div className="col-span-1 md:col-span-3 flex justify-between md:block md:text-right">
                  <span className="text-sm text-slate-500 md:hidden">Pending:</span>
                  <span className={clsx(
                    "font-bold",
                    entry.total_pending > 0 ? "text-rose-600" : "text-emerald-600"
                  )}>
                    ₹{entry.total_pending.toFixed(2)}
                  </span>
                </div>
                
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
