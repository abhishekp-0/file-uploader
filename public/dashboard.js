document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="rename-toggle"]');
  if (!button) return;

  const entityId = button.dataset.entityId;
  const form = document.querySelector(`[data-rename-form="${entityId}"]`);
  if (!form) return;

  // Hide any open delete confirmations
  document.querySelectorAll('.delete-confirm').forEach((el) => (el.hidden = true));

  form.hidden = !form.hidden;

  if (!form.hidden) {
    const input = form.querySelector('input[name="name"]');
    if (input) {
      input.focus();
      input.select();
    }
  }
});

// Handle rename cancel
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="cancel-rename"]');
  if (!button) return;

  const entityId = button.dataset.entityId;
  const form = document.querySelector(`[data-rename-form="${entityId}"]`);
  if (form) {
    form.hidden = true;
  }
});

// Handle delete toggle (show confirmation)
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="delete-toggle"]');
  if (!button) return;

  const entityId = button.dataset.entityId;
  const confirmDiv = document.querySelector(`[data-delete-confirm="${entityId}"]`);
  if (!confirmDiv) return;

  // Hide any open rename forms
  document.querySelectorAll('[data-rename-form]').forEach((el) => (el.hidden = true));

  // Hide any other open delete confirmations
  document.querySelectorAll('.delete-confirm').forEach((el) => {
    if (el !== confirmDiv) el.hidden = true;
  });

  confirmDiv.hidden = !confirmDiv.hidden;
});

// Handle delete cancel
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="cancel-delete"]');
  if (!button) return;

  const entityId = button.dataset.entityId;
  const confirmDiv = document.querySelector(`[data-delete-confirm="${entityId}"]`);
  if (confirmDiv) {
    confirmDiv.hidden = true;
  }
});

// Prevent accidental form submission on Enter in rename input
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    // Close all open forms/confirmations on Escape
    document.querySelectorAll('[data-rename-form]').forEach((el) => (el.hidden = true));
    document.querySelectorAll('.delete-confirm').forEach((el) => (el.hidden = true));
  }
});
