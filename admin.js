/**
 * Zaman Bank - Admin Panel Module
 * Handles admin panel functionality and AI action logs
 */

import * as api from 'api.js';
import * as ui from 'ui.js';

let logsData = [];
let currentFilters = {};

/**
 * Initialize admin panel
 */
export async function init() {
  await loadLogs();

  // Setup filter form
  const filterForm = document.getElementById('filter-form');
  if (filterForm) {
    filterForm.addEventListener('submit', handleFilterSubmit);
  }

  // Setup clear filters button
  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClearFilters);
  }
}

/**
 * Load AI action logs
 * @param {Object} filters 
 */
export async function loadLogs(filters = {}) {
  const logsContainer = document.getElementById('logs-table');

  if (!logsContainer) return;

  ui.showLoading(logsContainer);

  try {
    logsData = await api.getAdminLogs(filters);

    if (logsData.length === 0) {
      logsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>Логи не найдены</p>
        </div>
      `;
      return;
    }

    logsContainer.innerHTML = renderLogsTable(logsData);

  } catch (error) {
    console.error('Failed to load logs:', error);
    logsContainer.innerHTML = '<p>Ошибка загрузки логов</p>';
    ui.showToast('Ошибка загрузки логов', 'error');
  }
}

/**
 * Render logs table
 * @param {Array} logs 
 * @returns {string}
 */
function renderLogsTable(logs) {
  return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>User ID</th>
          <th>Тип действия</th>
          <th>Время</th>
          <th>Статус</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        ${logs.map(log => `
          <tr>
            <td>${log.id}</td>
            <td>${log.user_id}</td>
            <td>${formatActionType(log.action_type)}</td>
            <td>${ui.formatDate(log.timestamp)}</td>
            <td>
              <span class="badge ${getStatusBadgeClass(log.status)}">
                ${formatStatus(log.status)}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-ghost" onclick="window.adminModule.viewLogDetails(${log.id})">
                Подробнее
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/**
 * Format action type
 * @param {string} type 
 * @returns {string}
 */
function formatActionType(type) {
  const types = {
    'update_goal_contribution': 'Обновление взноса',
    'create_goal': 'Создание цели',
    'balance_check': 'Проверка баланса',
    'transfer': 'Перевод',
    'payment': 'Платеж'
  };

  return types[type] || type;
}

/**
 * Format status
 * @param {string} status 
 * @returns {string}
 */
function formatStatus(status) {
  const statuses = {
    'completed': 'Завершено',
    'pending': 'В ожидании',
    'failed': 'Ошибка',
    'cancelled': 'Отменено'
  };

  return statuses[status] || status;
}

/**
 * Get badge class for status
 * @param {string} status 
 * @returns {string}
 */
function getStatusBadgeClass(status) {
  const classes = {
    'completed': 'badge-success',
    'pending': 'badge-warning',
    'failed': 'badge-error',
    'cancelled': 'badge-error'
  };

  return classes[status] || 'badge-primary';
}

/**
 * Handle filter form submission
 * @param {Event} event 
 */
async function handleFilterSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const filters = {};

  if (form.user_id.value) {
    filters.user_id = form.user_id.value;
  }

  if (form.action_type.value) {
    filters.action_type = form.action_type.value;
  }

  if (form.status.value) {
    filters.status = form.status.value;
  }

  currentFilters = filters;
  await loadLogs(filters);
}

/**
 * Handle clear filters
 */
async function handleClearFilters() {
  const form = document.getElementById('filter-form');
  if (form) {
    form.reset();
  }

  currentFilters = {};
  await loadLogs();
}

/**
 * View log details
 * @param {number} logId 
 */
export function viewLogDetails(logId) {
  const log = logsData.find(l => l.id === logId);

  if (!log) return;

  const content = `
    <div style="line-height: 1.8;">
      <p><strong>ID:</strong> ${log.id}</p>
      <p><strong>User ID:</strong> ${log.user_id}</p>
      <p><strong>Тип действия:</strong> ${formatActionType(log.action_type)}</p>
      <p><strong>Время:</strong> ${ui.formatDate(log.timestamp)}</p>
      <p><strong>Статус:</strong> ${formatStatus(log.status)}</p>
    </div>
  `;

  ui.showInfoModal('Детали лога', content);
}

/**
 * Filter logs (client-side)
 * @param {Object} filters 
 */
export function filterLogs(filters) {
  let filtered = [...logsData];

  if (filters.user_id) {
    filtered = filtered.filter(log => log.user_id === parseInt(filters.user_id));
  }

  if (filters.action_type) {
    filtered = filtered.filter(log => log.action_type === filters.action_type);
  }

  if (filters.status) {
    filtered = filtered.filter(log => log.status === filters.status);
  }

  const logsContainer = document.getElementById('logs-table');
  if (logsContainer) {
    logsContainer.innerHTML = renderLogsTable(filtered);
  }
}

// Expose viewLogDetails to global scope for onclick handler
window.adminModule = { viewLogDetails };

export default {
  init,
  loadLogs,
  filterLogs,
  viewLogDetails
};
