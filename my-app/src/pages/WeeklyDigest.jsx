import { useState, useEffect } from 'react';
import { meetingsAPI, actionItemsAPI } from '../services/api';

export default function WeeklyDigest() {
  const [digestData, setDigestData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeeklyDigest();
  }, []);

  const fetchWeeklyDigest = async () => {
    try {
      setLoading(true);
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const meetings = await meetingsAPI.getAll();
      const userItems = await actionItemsAPI.getUserItems(user._id);

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // All decisions from meetings this week
      const allDecisions = [];
      meetings.forEach(m => {
        if (new Date(m.date) >= weekStart && new Date(m.date) <= weekEnd) {
          allDecisions.push(...(m.decisions || []));
        }
      });

      // Action items due this week
      const itemsDueThisWeek = userItems.filter(item =>
        new Date(item.deadline) >= weekStart &&
        new Date(item.deadline) <= weekEnd
      );

      // Overdue items
      const overdueItems = userItems.filter(item =>
        new Date(item.deadline) < now && item.status !== 'done'
      );

      // Completed items
      const completedItems = userItems.filter(item => item.status === 'done');

      setDigestData({
        decisionsCount: allDecisions.length,
        itemsDueCount: itemsDueThisWeek.length,
        overdueCount: overdueItems.length,
        completedCount: completedItems.length,
        itemsDueThisWeek,
        overdueItems,
        completedItems
      });
    } catch (err) {
      console.error('Error fetching digest:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !digestData) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Weekly Digest</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-2xl font-bold text-blue-600">{digestData.decisionsCount}</p>
            <p className="text-gray-600">Decisions Made</p>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
            <p className="text-2xl font-bold text-yellow-600">{digestData.itemsDueCount}</p>
            <p className="text-gray-600">Items Due This Week</p>
          </div>
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
            <p className="text-2xl font-bold text-red-600">{digestData.overdueCount}</p>
            <p className="text-gray-600">Overdue Items</p>
          </div>
          <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
            <p className="text-2xl font-bold text-green-600">{digestData.completedCount}</p>
            <p className="text-gray-600">Completed</p>
          </div>
        </div>

        {/* Items Due This Week */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Items Due This Week</h2>
          {digestData.itemsDueThisWeek.length === 0 ? (
            <p className="text-gray-600">No items due this week.</p>
          ) : (
            <ul className="space-y-2">
              {digestData.itemsDueThisWeek.map(item => (
                <li key={item._id} className="flex justify-between p-2 border-b">
                  <span>{item.title}</span>
                  <span className="text-gray-600">{new Date(item.deadline).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Overdue Items */}
        {digestData.overdueCount > 0 && (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded shadow mb-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Overdue Items</h2>
            <ul className="space-y-2">
              {digestData.overdueItems.map(item => (
                <li key={item._id} className="flex justify-between p-2 border-b">
                  <span>{item.title}</span>
                  <span className="text-red-600 font-semibold">{new Date(item.deadline).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completed Items */}
        {digestData.completedCount > 0 && (
          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded shadow">
            <h2 className="text-2xl font-bold text-green-600 mb-4">✓ Completed This Week</h2>
            <ul className="space-y-2">
              {digestData.completedItems.map(item => (
                <li key={item._id} className="flex justify-between p-2 border-b line-through text-gray-500">
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
                  <span>{item.title}</span>
                  <span className="text-gray-600">{new Date(item.deadline).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Overdue Items */}
        {digestData.overdueCount > 0 && (
          <div className="bg-red-50 p-6 rounded shadow border-l-4 border-red-600 mb-6">
            <h2 className="text-2xl font-bold text-red-800 mb-4">⚠️ Overdue Items</h2>
            <ul className="space-y-2">
              {digestData.overdueItems.map(item => (
                <li key={item._id} className="flex justify-between p-2 border-b border-red-200">
                  <span className="text-red-800 font-semibold">{item.title}</span>
                  <span className="text-red-600">{new Date(item.deadline).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completed Items */}
        {digestData.completedCount > 0 && (
          <div className="bg-green-50 p-6 rounded shadow border-l-4 border-green-600">
            <h2 className="text-2xl font-bold text-green-800 mb-4">✅ Completed Items</h2>
            <ul className="space-y-2">
              {digestData.completedItems.map(item => (
                <li key={item._id} className="flex justify-between p-2 border-b border-green-200">
                  <span className="text-green-800">{item.title}</span>
                  <span className="text-green-600">{new Date(item.deadline).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
