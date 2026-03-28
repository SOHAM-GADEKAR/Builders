const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.statusText}`);
    }
    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  register: (name, email, password) =>
    apiCall('/auth/register', 'POST', { name, email, password }),
  login: (email, password) =>
    apiCall('/auth/login', 'POST', { email, password }),
  getMe: () => apiCall('/auth/me')
};

// Meetings API calls
export const meetingsAPI = {
  create: (title, date, attendees, agenda) =>
    apiCall('/meetings', 'POST', { title, date, attendees, agenda }),
  getAll: () => apiCall('/meetings'),
  getById: (id) => apiCall(`/meetings/${id}`),
  getWeeklyDigest: () => apiCall('/meetings/weekly-digest')
};

// Decisions API calls
export const decisionsAPI = {
  add: (meetingId, description) =>
    apiCall(`/decisions/${meetingId}`, 'POST', { description }),
  getForMeeting: (meetingId) => apiCall(`/decisions/${meetingId}`)
};

// Action Items API calls
export const actionItemsAPI = {
  create: (meetingId, title, owner, deadline) =>
    apiCall(`/actionItems/${meetingId}`, 'POST', { title, owner, deadline }),
  getUserItems: (userId) => apiCall(`/actionItems/user/${userId}`),
  getOverdue: (userId) => apiCall(`/actionItems/overdue/${userId}`),
  update: (id, status, deadline) => {
    const payload = {};
    if (status !== undefined) payload.status = status;
    if (deadline !== undefined && deadline !== null && deadline !== '') payload.deadline = deadline;
    return apiCall(`/actionItems/${id}`, 'PUT', payload);
  }
};

// Users API calls
export const usersAPI = {
  getAll: () => apiCall('/users'),
  getGamification: () => apiCall('/users/me/gamification'),
  getLeaderboard: () => apiCall('/users/leaderboard')
};
