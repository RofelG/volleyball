function handleSubmit(e) {
  e.preventDefault();

  // Get the form data
  const data = new FormData(e.target);


  // Get the values from the form
  const value = Object.fromEntries(data.entries());

  if (e.target.querySelectorAll('select')) {
    const selects = e.target.querySelectorAll('select');
    for (let i = 0; i < selects.length; i++) {
      value[selects[i].name] = selects[i].value;
    }
  }

  const action = (e.target.querySelector('button[type=submit]') ? e.target.querySelector('button[type=submit]').getAttribute('data-action') : e.target.querySelector('input[type=submit]').getAttribute('data-action'));

  fetch(e.target.getAttribute('data-action') + (action == undefined || action == null ? '' : action), {
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

    if (e.target.getAttribute('data-callback') || e.target.querySelector('button[type=submit]').getAttribute('data-callback') || e.target.querySelector('button[type=submit]').getAttribute('data-callback')) {
      let fn = window[(e.target.getAttribute('data-callback') ? e.target.getAttribute('data-callback') : e.target.querySelector('button[type=submit]').getAttribute('data-callback') ? e.target.querySelector('button[type=submit]').getAttribute('data-callback') : e.target.querySelector('input[type=submit]').getAttribute('data-callback'))];
      if (typeof fn === 'function') {
        fn();
      }
    }

  });
}

(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()

const forms = document.querySelectorAll('form');

forms.forEach((form) => {
  form.addEventListener('submit', handleSubmit);
});

function closeModal() {
  const modal = document.querySelector('.modal.show');
  const modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();

  sessionStorage.setItem("offset", 0);
  getEvents();
}