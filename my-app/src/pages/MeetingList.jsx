import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingsAPI } from '../services/api';
import MeetingForm from '../components/MeetingForm';

export default function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingsAPI.getAll();
      setMeetings(data);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (formData) => {
    try {
      setLoading(true);
      // TODO: add attendees selection
      await meetingsAPI.create(formData.title, formData.date, [], formData.agenda);
      setShowForm(false);
      fetchMeetings();
    } catch (err) {
      console.error('Error creating meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Meetings</h1>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Meeting'}
        </button>

        {showForm && (
          <div className="mb-6">
            <MeetingForm onSubmit={handleCreateMeeting} loading={loading} />
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
