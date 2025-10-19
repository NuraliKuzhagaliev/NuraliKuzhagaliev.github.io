/**
 * Zaman Bank - Dashboard Module
 * Handles dashboard data display and interactions
 */

import * as api from 'api.js';
import * as auth from 'auth.js';
import * as ui from 'ui.js';
import * as validator from 'validator.js';

let goalsData = [];
let transactionsData = [];

/**
 * Initialize dashboard
 */
export async function init() {
  await loadDashboard();

  // Listen for refresh events
  window.addEventListener('dashboard-refresh', loadDashboard);

  // Setup create goal form
  const createGoalForm = document.getElementById('create-goal-form');
  if (createGoalForm) {
    createGoalForm.addEventListener('submit', handleCreateGoal);
  }
}

/**
 * Load dashboard data
 */
export async function loadDashboard() {
  const userId = auth.getCurrentUserId();

  if (!userId) {
    window.location.href = 'login.html';
    return;
  }

  try {
    // Load goals
    await loadGoals(userId);

    // Load transactions
    await loadTransactions(userId);

    // Update balance
    updateBalance();

  } catch (error) {
    console.error('Failed to load dashboard:', error);
    ui.showToast('Ошибка загрузки данных', 'error');
  }
}

/**
 * Load user goals
 * @param {number} userId 
 */
async function loadGoals(userId) {
  const goalsContainer = document.getElementById('goals-container');

  if (!goalsContainer) return;

  ui.showLoading(goalsContainer);

  try {
    goalsData = await api.getUserGoals(userId);

    if (goalsData.length === 0) {
      goalsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎯</div>
          <p>У вас пока нет финансовых целей</p>
          <button class="btn btn-primary" onclick="document.getElementById('create-goal-btn').click()">
            Создать первую цель
          </button>
        </div>
      `;
      return;
    }

    goalsContainer.innerHTML = goalsData.map(goal => renderGoalCard(goal)).join('');

  } catch (error) {
    console.error('Failed to load goals:', error);
    goalsContainer.innerHTML = '<p>Ошибка загрузки целей</p>';
  }
}

/**
 * Render goal card
 * @param {Object} goal 
 * @returns {string}
 */
function renderGoalCard(goal) {
  const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return `
    <div class="card hover-lift">
      <div class="card-header">
        <h3 class="card-title">${goal.title}</h3>
        <span class="badge badge-primary">${daysLeft} дней</span>
      </div>
      <div class="card-body">
        <div class="flex-between" style="margin-bottom: 0.5rem;">
          <span>Прогресс</span>
          <span style="font-weight: 600;">${progress}%</span>
        </div>
        <div class="progress">
          <div class="progress-bar ${progress >= 100 ? 'progress-bar-success' : ''}" 
               style="width: ${progress}%"></div>
        </div>
        <div class="flex-between" style="margin-top: 1rem; color: var(--text-secondary); font-size: var(--text-sm);">
          <span>${ui.formatCurrency(goal.current_amount)}</span>
          <span>${ui.formatCurrency(goal.target_amount)}</span>
        </div>
      </div>
      <div class="card-footer">
        <small>Дедлайн: ${ui.formatDate(goal.deadline)}</small>
      </div>
    </div>
  `;
}

/**
 * Load user transactions
 * @param {number} userId 
 */
async function loadTransactions(userId) {
  const transactionsContainer = document.getElementById('transactions-table');

  if (!transactionsContainer) return;

  try {
    transactionsData = await api.getUserTransactions(userId);

    if (transactionsData.length === 0) {
      transactionsContainer.innerHTML = '<p>Нет транзакций</p>';
      return;
    }

    transactionsContainer.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Описание</th>
            <th>Сумма</th>
            <th>Тип</th>
          </tr>
        </thead>
        <tbody>
          ${transactionsData.map(t => `
            <tr>
              <td>${ui.formatDate(t.date)}</td>
              <td>${t.description}</td>
              <td style="color: ${t.type === 'credit' ? 'var(--success)' : 'var(--error)'}; font-weight: 600;">
                ${t.type === 'credit' ? '+' : ''}${ui.formatCurrency(t.amount)}
              </td>
              <td>
                <span class="badge ${t.type === 'credit' ? 'badge-success' : 'badge-warning'}">
                  ${t.type === 'credit' ? 'Поступление' : 'Списание'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  } catch (error) {
    console.error('Failed to load transactions:', error);
  }
}

/**
 * Update balance display
 */
function updateBalance() {
  const user = auth.getCurrentUser();
  const balanceEl = document.getElementById('balance-amount');

  if (balanceEl && user && user.balance) {
    balanceEl.textContent = ui.formatCurrency(user.balance);
  }
}

/**
 * Handle create goal form submission
 * @param {Event} event 
 */
async function handleCreateGoal(event) {
  event.preventDefault();

  const form = event.target;
  const title = form.goal_title.value;
  const targetAmount = parseFloat(form.target_amount.value);
  const deadline = form.deadline.value;

  // Validate
  const isValid = validator.validateForm(form, {
    goal_title: [(val) => validator.validateRequired(val, 'Название цели')],
    target_amount: [(val) => validator.validateNumber(val, 1000)],
    deadline: [(val) => validator.validateDate(val)]
  });

  if (!isValid) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Создание...';

  try {
    const userId = auth.getCurrentUserId();
    await api.createGoal(userId, {
      title,
      target_amount: targetAmount,
      deadline
    });

    ui.showToast('Цель создана успешно', 'success');
    form.reset();

    // Reload goals
    await loadGoals(userId);

    // Close modal if exists
    const modal = form.closest('.modal-overlay');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }

  } catch (error) {
    console.error('Failed to create goal:', error);
    ui.showToast('Ошибка создания цели', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Создать цель';
  }
}

/**
 * Refresh dashboard
 */
export async function refresh() {
  await loadDashboard();
}

export default {
  init,
  refresh
};
