function handleSubmit(e) {
  e.preventDefault();

  // Get the form data
  const data = new FormData(e.target);

  // Get the values from the form
  const value = Object.fromEntries(data.entries());

  fetch(e.target.getAttribute('data-action'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  })
  .then((response) => response.json())
  .then(res => {
    if (res.user_id) {
      sessionStorage.setItem('user', res.user_id);
      if (res.token) {
        window.location.href = '/';
      }
    }

    if (res.error) {
      e.target.querySelector('.error').innerHTML = res.error;
      return;
    }

    if (e.target.getAttribute('data-callback')) {
      let fn = window[e.target.getAttribute('data-callback')];
      if (typeof fn === 'function') {
        fn();
      }
    }
  });

}

const forms = document.querySelectorAll('form');

forms.forEach((form) => {
  form.addEventListener('submit', handleSubmit);
});

function closeModal() {
  const modal = document.querySelector('.modal.show');
  const modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
}