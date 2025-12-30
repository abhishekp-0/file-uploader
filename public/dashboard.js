document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="rename-toggle"]');
  if (!button) return;

  const entityId = button.dataset.entityId;
  const form = document.querySelector(`[data-rename-form="${entityId}"]`);
  if (!form) return;

  form.hidden = !form.hidden;

  if (!form.hidden) {
    const input = form.querySelector('input[name="name"]');
    if (input) {
      input.focus();
      input.select();
    }
  }
});
