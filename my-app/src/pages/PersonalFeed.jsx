import { useState, useEffect } from 'react';
import { actionItemsAPI, usersAPI } from '../services/api';
import ActionItemCard from '../components/ActionItemCard';

export default function PersonalFeed() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [gamification, setGamification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [xpToast, setXpToast] = useState(null);
  const [badgePopup, setBadgePopup] = useState(null);
  const [levelPopup, setLevelPopup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, overdue, done

  useEffect(() => {
    fetchUserAndItems();
  }, []);

  useEffect(() => {
    if (!xpToast) return;
    const timeout = setTimeout(() => setXpToast(null), 2400);
    return () => clearTimeout(timeout);
  }, [xpToast]);

  useEffect(() => {
    if (!badgePopup) return;
    const timeout = setTimeout(() => setBadgePopup(null), 3200);
    return () => clearTimeout(timeout);
  }, [badgePopup]);

  useEffect(() => {
    if (!levelPopup) return;
    const timeout = setTimeout(() => setLevelPopup(null), 3200);
    return () => clearTimeout(timeout);
  }, [levelPopup]);

  const fetchUserAndItems = async () => {
    try {
      setLoading(true);
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(user);

      const [items, allUsers] = await Promise.all([
        actionItemsAPI.getUserItems(user._id),
        usersAPI.getAll(),
      ]);

      const [profile, topUsers] = await Promise.all([
        usersAPI.getGamification(),
        usersAPI.getLeaderboard(),
      ]);

      setUsers(Array.isArray(allUsers) ? allUsers : []);
      setGamification(profile);
      setLeaderboard(Array.isArray(topUsers) ? topUsers : []);

      // Sort by deadline
      const sorted = items.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setItems(sorted);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const previousProfile = gamification;
      await actionItemsAPI.update(itemId, newStatus);

      const [updatedProfile, updatedLeaderboard] = await Promise.all([
        usersAPI.getGamification(),
        usersAPI.getLeaderboard(),
      ]);

      setGamification(updatedProfile);
      setLeaderboard(Array.isArray(updatedLeaderboard) ? updatedLeaderboard : []);

      if (previousProfile && typeof previousProfile.xp === 'number') {
        const gainedXp = (updatedProfile.xp || 0) - (previousProfile.xp || 0);
        if (gainedXp > 0) {
          setXpToast(`+${gainedXp} XP earned!`);
        }

        if ((updatedProfile.level || 1) > (previousProfile.level || 1)) {
          setLevelPopup(`Level Up! You reached Level ${updatedProfile.level} 🎉`);
        }

        const prevBadges = new Set(previousProfile.badges || []);
        const newBadges = (updatedProfile.badges || []).filter((badge) => !prevBadges.has(badge));
        if (newBadges.length > 0) {
          setBadgePopup(`Badge unlocked: ${newBadges[0]} 🏅`);
        }
      }

      setItems(items.map(item =>
        item._id === itemId ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      console.error('Error updating action item:', err);
    }
  };

  const getFilteredItems = () => {
    const now = new Date();
    return items.filter(item => {
      if (filter === 'all') return true;
      if (filter === 'open') return item.status === 'open';
      if (filter === 'overdue') {
        return new Date(item.deadline) < now && item.status !== 'done';
      }
      if (filter === 'done') return item.status === 'done';
      return true;
    });
  };

  const overdueCount = items.filter(i => new Date(i.deadline) < new Date() && i.status !== 'done').length;
  const filteredItems = getFilteredItems();

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {xpToast && (
          <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg animate-bounce">
            {xpToast}
          </div>
        )}

        {badgePopup && (
          <div className="fixed top-40 right-6 z-50 bg-yellow-100 text-yellow-900 border border-yellow-300 px-4 py-3 rounded-lg shadow-lg">
            {badgePopup}
          </div>
        )}

        {levelPopup && (
          <div className="fixed top-56 right-6 z-50 bg-indigo-100 text-indigo-900 border border-indigo-300 px-4 py-3 rounded-lg shadow-lg">
            {levelPopup}
          </div>
        )}

        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Action Items</h1>
        {currentUser && <p className="text-gray-600 mb-6">Welcome, {currentUser.name}</p>}

        {gamification && (
          <div className="bg-white border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Accountability RPG</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">XP</p>
                <p className="text-xl font-bold text-blue-700">{gamification.xp || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Level</p>
                <p className="text-xl font-bold text-indigo-700">{gamification.level || 1}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current Streak</p>
                <p className={`text-xl font-bold text-orange-600 ${gamification.currentStreak > 0 ? 'animate-pulse' : ''}`}>
                  {gamification.currentStreak || 0}
                  <span className={gamification.currentStreak > 0 ? 'inline-block animate-bounce ml-1' : 'ml-1'}>🔥</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Best Streak</p>
                <p className="text-xl font-bold text-green-700">{gamification.longestStreak || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-1">XP Progress To Next Level</p>
              {(() => {
                const xp = gamification.xp || 0;
                const level = gamification.level || 1;
                const currentLevelMinXp = 50 * (level - 1) * (level - 1);
                const nextLevelXp = 50 * level * level;
                const span = Math.max(1, nextLevelXp - currentLevelMinXp);
                const progress = Math.min(100, Math.max(0, ((xp - currentLevelMinXp) / span) * 100));
                return (
                  <>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {xp} / {nextLevelXp} XP
                    </p>
                  </>
                );
              })()}
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Badges</p>
              <div className="flex flex-wrap gap-2">
                {(gamification.badges || []).length === 0 ? (
                  <span className="text-sm text-gray-500">No badges yet</span>
                ) : (
                  gamification.badges.map((badge) => (
                    <span key={badge} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-300">
                      {badge}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {leaderboard.length > 0 && (
          <div className="bg-white border border-purple-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Weekly Leaderboard</h2>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div key={entry._id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-1">
                  <span>
                    #{index + 1} {entry.name}
                  </span>
                  <span className="font-semibold text-purple-700">XP {entry.xp || 0} • Lv {entry.level || 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {overdueCount > 0 && (
          <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-6 rounded">
            <p className="text-red-800 font-bold">⚠️ You have {overdueCount} overdue action items!</p>
          </div>
        )}

        <div className="flex gap-3 mb-6 flex-wrap">
          {['all', 'open', 'overdue', 'done'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded font-semibold transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <p className="text-gray-600 text-center py-10">No action items in this category.</p>
          ) : (
            filteredItems.map(item => (
              <ActionItemCard
                key={item._id}
                item={item}
                onStatusChange={handleStatusChange}
                users={users}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
