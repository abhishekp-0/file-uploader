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

// Modal handling
const folderModal = document.getElementById('folder-modal');
const uploadModal = document.getElementById('upload-modal');

// Open folder modal
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="open-folder-modal"]');
  if (!button) return;

  folderModal.showModal();
});

// Close folder modal
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="close-folder-modal"]');
  if (!button) return;

  folderModal.close();
});

// Open upload modal
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="open-upload-modal"]');
  if (!button) return;

  uploadModal.showModal();
});

// Close upload modal
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="close-upload-modal"]');
  if (!button) return;

  uploadModal.close();
});

// Close modals on ESC or clicking backdrop
folderModal.addEventListener('click', (event) => {
  const rect = folderModal.getBoundingClientRect();
  const isInDialog =
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width;

  if (!isInDialog) {
    folderModal.close();
  }
});

uploadModal.addEventListener('click', (event) => {
  const rect = uploadModal.getBoundingClientRect();
  const isInDialog =
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width;

  if (!isInDialog) {
    uploadModal.close();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    // Close all open forms/confirmations on Escape
    document.querySelectorAll('[data-rename-form]').forEach((el) => (el.hidden = true));
    document.querySelectorAll('.delete-confirm').forEach((el) => (el.hidden = true));
  }
});
