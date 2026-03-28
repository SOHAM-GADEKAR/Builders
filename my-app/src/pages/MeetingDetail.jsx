import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingsAPI, decisionsAPI, actionItemsAPI, usersAPI } from '../services/api';
import DecisionCard from '../components/DecisionCard';
import ActionItemCard from '../components/ActionItemCard';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const [meeting, setMeeting] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDecision, setNewDecision] = useState('');
  const [newActionItem, setNewActionItem] = useState({ title: '', owner: '', deadline: '' });
  const [xpToast, setXpToast] = useState(null);
  const [levelPopup, setLevelPopup] = useState(null);

  useEffect(() => {
    fetchMeetingDetails();
  }, [id]);

  useEffect(() => {
    if (!xpToast) return;
    const timeout = setTimeout(() => setXpToast(null), 2200);
    return () => clearTimeout(timeout);
  }, [xpToast]);

  useEffect(() => {
    if (!levelPopup) return;
    const timeout = setTimeout(() => setLevelPopup(null), 3000);
    return () => clearTimeout(timeout);
  }, [levelPopup]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const meetingData = await meetingsAPI.getById(id);

      setMeeting(meetingData);
      setDecisions(meetingData.decisions || []);
      setActionItems(meetingData.actionItems || []);

      // Default assignment to current user when possible.
      if (currentUser?._id && (meetingData.attendees || []).some((u) => u._id === currentUser._id)) {
        setNewActionItem((prev) => ({ ...prev, owner: currentUser._id }));
      } else if ((meetingData.attendees || []).length > 0) {
        setNewActionItem((prev) => ({ ...prev, owner: meetingData.attendees[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDecision = async (e) => {
    e.preventDefault();
    if (!newDecision.trim()) return;
    try {
      const beforeProfile = await usersAPI.getGamification();
      const decision = await decisionsAPI.add(id, newDecision);
      const afterProfile = await usersAPI.getGamification();

      const gainedXp = (afterProfile?.xp || 0) - (beforeProfile?.xp || 0);
      if (gainedXp > 0) {
        setXpToast(`+${gainedXp} XP earned!`);
      }
      if ((afterProfile?.level || 1) > (beforeProfile?.level || 1)) {
        setLevelPopup(`Level Up! You reached Level ${afterProfile.level} 🎉`);
      }

      setDecisions([...decisions, decision]);
      setNewDecision('');
    } catch (err) {
      console.error('Error adding decision:', err);
    }
  };

  const handleAddActionItem = async (e) => {
    e.preventDefault();
    if (!newActionItem.title.trim() || !newActionItem.owner || !newActionItem.deadline) return;
    try {
      const beforeProfile = await usersAPI.getGamification();
      const item = await actionItemsAPI.create(id, newActionItem.title, newActionItem.owner, newActionItem.deadline);
      const afterProfile = await usersAPI.getGamification();

      const gainedXp = (afterProfile?.xp || 0) - (beforeProfile?.xp || 0);
      if (gainedXp > 0) {
        setXpToast(`+${gainedXp} XP earned!`);
      }
      if ((afterProfile?.level || 1) > (beforeProfile?.level || 1)) {
        setLevelPopup(`Level Up! You reached Level ${afterProfile.level} 🎉`);
      }

      setActionItems([...actionItems, item]);
      setNewActionItem({ title: '', owner: '', deadline: '' });
    } catch (err) {
      console.error('Error adding action item:', err);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await actionItemsAPI.update(itemId, newStatus);
      setActionItems(actionItems.map(item =>
        item._id === itemId ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      console.error('Error updating action item:', err);
    }
  };

  if (loading || !meeting) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {xpToast && (
          <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg animate-bounce">
            {xpToast}
          </div>
        )}

        {levelPopup && (
          <div className="fixed top-40 right-6 z-50 bg-indigo-100 text-indigo-900 border border-indigo-300 px-4 py-3 rounded-lg shadow-lg">
            {levelPopup}
          </div>
        )}

        <button
          onClick={() => navigate('/meetings')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Meetings
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">{meeting.title}</h1>
        <p className="text-gray-600 mb-4">{meeting.agenda}</p>

        <div className="grid grid-cols-2 gap-6">
          {/* Decisions Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Decisions</h2>
            <form onSubmit={handleAddDecision} className="mb-4">
              <textarea
                value={newDecision}
                onChange={(e) => setNewDecision(e.target.value)}
                placeholder="Add a decision..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                rows="2"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Add Decision
              </button>
            </form>
            {decisions.map(d => <DecisionCard key={d._id} decision={d} />)}
          </div>

          {/* Action Items Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Action Items</h2>
            <form onSubmit={handleAddActionItem} className="mb-4 space-y-2">
              <input
                type="text"
                value={newActionItem.title}
                onChange={(e) => setNewActionItem({ ...newActionItem, title: e.target.value })}
                placeholder="Action title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={newActionItem.owner}
                onChange={(e) => setNewActionItem({ ...newActionItem, owner: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Assign to attendee...</option>
                {(meeting.attendees || []).map((attendee) => (
                  <option key={attendee._id} value={attendee._id}>
                    {attendee.name} ({attendee.email})
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newActionItem.deadline}
                onChange={(e) => setNewActionItem({ ...newActionItem, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
              >
                Add Action Item
              </button>
            </form>
            {actionItems.map(item => (
              <ActionItemCard
                key={item._id}
                item={item}
                onStatusChange={handleStatusChange}
                users={meeting.attendees || []}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
