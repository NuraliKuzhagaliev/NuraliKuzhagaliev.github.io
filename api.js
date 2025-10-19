/**
 * Zaman Bank - API Module
 * Handles all API communications with backend
 * Supports mock mode for development without backend
 */

// Configuration
let BASE_URL = 'http://127.0.0.1:5000'; // Replace with actual backend URL
let USE_MOCK = false; // Toggle mock mode

// Mock data for development
const MOCK_DATA = {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    balance: 250000
  },

  token: 'mock_jwt_token_12345',

  goals: [
    {
      id: 1,
      title: 'Emergency Fund',
      target_amount: 100000,
      current_amount: 75000,
      deadline: '2025-12-31',
      created_at: '2025-01-15'
    },
    {
      id: 2,
      title: 'New Car',
      target_amount: 500000,
      current_amount: 250000,
      deadline: '2026-06-30',
      created_at: '2025-02-01'
    },
    {
      id: 3,
      title: 'Vacation to Dubai',
      target_amount: 200000,
      current_amount: 50000,
      deadline: '2025-09-01',
      created_at: '2025-03-10'
    }
  ],

  transactions: [
    { id: 1, date: '2025-10-18', description: 'Salary Deposit', amount: 150000, type: 'credit' },
    { id: 2, date: '2025-10-17', description: 'Grocery Shopping', amount: -15000, type: 'debit' },
    { id: 3, date: '2025-10-16', description: 'Utility Bills', amount: -8500, type: 'debit' },
    { id: 4, date: '2025-10-15', description: 'Online Purchase', amount: -25000, type: 'debit' },
    { id: 5, date: '2025-10-14', description: 'Transfer from Savings', amount: 50000, type: 'credit' }
  ],

  aiResponses: {
    'баланс': {
      text: 'Ваш текущий баланс составляет 250,000 ₸. У вас есть 3 активные финансовые цели.',
      suggested_action: null
    },
    'помоги с целями': {
      text: 'У вас 3 финансовые цели. Рекомендую увеличить ежемесячные взносы на Emergency Fund на 10,000 ₸.',
      suggested_action: {
        type: 'update_goal_contribution',
        goal_id: 1,
        amount: 10000,
        title: 'Увеличить взнос на Emergency Fund',
        description: 'Увеличить ежемесячный взнос с текущего до 10,000 ₸ для достижения цели быстрее.'
      }
    },
    'создай новую цель': {
      text: 'Хорошо! Давайте создадим новую финансовую цель. Какую сумму вы хотите накопить?',
      suggested_action: null
    }
  },

  logs: [
    { id: 1, user_id: 1, action_type: 'update_goal_contribution', timestamp: '2025-10-18 14:30:00', status: 'completed' },
    { id: 2, user_id: 1, action_type: 'create_goal', timestamp: '2025-10-17 10:15:00', status: 'completed' },
    { id: 3, user_id: 2, action_type: 'balance_check', timestamp: '2025-10-16 16:45:00', status: 'completed' }
  ]
};

/**
 * Set base URL for API
 * @param {string} url - New base URL
 */
export function setBaseUrl(url) {
  BASE_URL = url;
}

/**
 * Toggle mock mode
 * @param {boolean} useMock - Enable/disable mock mode
 */
export function setMockMode(useMock) {
  USE_MOCK = useMock;
}

/**
 * Get current mock mode status
 * @returns {boolean}
 */
export function isMockMode() {
  return USE_MOCK;
}

/**
 * Get authentication headers
 * @returns {Object} Headers object with authorization
 */
export function authHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

/**
 * Generic GET request
 * @param {string} path - API endpoint path
 * @returns {Promise<any>}
 */
export async function get(path) {
  if (USE_MOCK) {
    return mockGet(path);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: authHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
}

/**
 * Generic POST request
 * @param {string} path - API endpoint path
 * @param {Object} body - Request body
 * @returns {Promise<any>}
 */
export async function post(path, body) {
  if (USE_MOCK) {
    return mockPost(path, body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
}

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user_id: number, access_token: string}>}
 */
export async function login(email, password) {
  return post('/auth/login', { email, password });
}

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<{user_id: number, access_token: string}>}
 */
export async function register(userData) {
  return post('/auth/register', userData);
}

/**
 * Send message to AI
 * @param {number} userId 
 * @param {string} message 
 * @returns {Promise<{text: string, suggested_action?: Object}>}
 */
export async function sendAIMessage(userId, message) {
  return post('/ai/message', { user_id: userId, message });
}

/**
 * Execute AI suggested action
 * @param {number} userId 
 * @param {Object} action 
 * @returns {Promise<{success: boolean, result: any}>}
 */
export async function executeAIAction(userId, action) {
  return post('/ai/execute', { user_id: userId, action });
}

/**
 * Get user goals
 * @param {number} userId 
 * @returns {Promise<Array>}
 */
export async function getUserGoals(userId) {
  return get(`/users/${userId}/goals`);
}

/**
 * Create new goal
 * @param {number} userId 
 * @param {Object} goalData 
 * @returns {Promise<Object>}
 */
export async function createGoal(userId, goalData) {
  return post(`/users/${userId}/goals`, goalData);
}

/**
 * Get user transactions
 * @param {number} userId 
 * @returns {Promise<Array>}
 */
export async function getUserTransactions(userId) {
  return get(`/users/${userId}/transactions`);
}

/**
 * Get admin logs
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>}
 */
export async function getAdminLogs(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return get(`/admin/logs${query ? '?' + query : ''}`);
}

// ============= MOCK FUNCTIONS =============

function mockGet(path) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (path.includes('/goals')) {
        resolve(MOCK_DATA.goals);
      } else if (path.includes('/transactions')) {
        resolve(MOCK_DATA.transactions);
      } else if (path.includes('/admin/logs')) {
        resolve(MOCK_DATA.logs);
      } else {
        resolve({ message: 'Mock GET response' });
      }
    }, 500);
  });
}

function mockPost(path, body) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (path.includes('/auth/login')) {
        resolve({
          user_id: MOCK_DATA.user.id,
          access_token: MOCK_DATA.token,
          user: MOCK_DATA.user
        });
      } else if (path.includes('/auth/register')) {
        resolve({
          user_id: MOCK_DATA.user.id,
          access_token: MOCK_DATA.token
        });
      } else if (path.includes('/ai/message')) {
        const message = body.message.toLowerCase();
        let response = MOCK_DATA.aiResponses['баланс'];

        for (const [key, value] of Object.entries(MOCK_DATA.aiResponses)) {
          if (message.includes(key.toLowerCase())) {
            response = value;
            break;
          }
        }

        resolve(response);
      } else if (path.includes('/ai/execute')) {
        resolve({
          success: true,
          result: { message: 'Action executed successfully' }
        });
      } else if (path.includes('/goals')) {
        const newGoal = {
          id: MOCK_DATA.goals.length + 1,
          ...body,
          current_amount: 0,
          created_at: new Date().toISOString().split('T')[0]
        };
        MOCK_DATA.goals.push(newGoal);
        resolve(newGoal);
      } else {
        resolve({ message: 'Mock POST response' });
      }
    }, 500);
  });
}

export default {
  setBaseUrl,
  setMockMode,
  isMockMode,
  authHeaders,
  get,
  post,
  login,
  register,
  sendAIMessage,
  executeAIAction,
  getUserGoals,
  createGoal,
  getUserTransactions,
  getAdminLogs
};
