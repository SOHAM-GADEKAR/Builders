import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingsAPI, usersAPI } from '../services/api';
import MeetingForm from '../components/MeetingForm';

export default function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [xpToast, setXpToast] = useState(null);
  const [levelPopup, setLevelPopup] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

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

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [meetingsData, usersData] = await Promise.all([
        meetingsAPI.getAll(),
        usersAPI.getAll(),
      ]);
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await meetingsAPI.getAll();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (formData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const beforeProfile = await usersAPI.getGamification();
      
      console.log('Creating meeting with:', formData);
      await meetingsAPI.create(formData.title, formData.date, formData.attendees, formData.agenda);

      const afterProfile = await usersAPI.getGamification();
      const gainedXp = (afterProfile?.xp || 0) - (beforeProfile?.xp || 0);
      if (gainedXp > 0) {
        setXpToast(`+${gainedXp} XP earned!`);
      }
      if ((afterProfile?.level || 1) > (beforeProfile?.level || 1)) {
        setLevelPopup(`Level Up! You reached Level ${afterProfile.level} 🎉`);
      }
      
      setSuccess('Meeting created successfully!');
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchMeetings();
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

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

        <h1 className="text-4xl font-bold text-gray-800 mb-6">Meetings</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Meeting'}
        </button>

        {showForm && (
          <div className="mb-6">
            <MeetingForm onSubmit={handleCreateMeeting} loading={loading} users={users} />
          </div>
        )}

        <div className="space-y-4">
          {meetings.length === 0 ? (
            <p className="text-gray-600">No meetings yet. Create one to get started!</p>
          ) : (
            meetings.map(meeting => (
              <div
                key={meeting._id}
                onClick={() => navigate(`/meeting/${meeting._id}`)}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
              >
                <h2 className="text-xl font-bold text-gray-800">{meeting.title}</h2>
                <p className="text-gray-600">{new Date(meeting.date).toLocaleDateString()}</p>
                <p className="text-gray-500">{meeting.agenda}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
