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
  });

}

const forms = document.querySelectorAll('form');

forms.forEach((form) => {
  form.addEventListener('submit', handleSubmit);
});
