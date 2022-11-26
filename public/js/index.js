//fetch events from database
function getEvents(filters = undefined) {


  fetch('/api/events/get?offset=' + sessionStorage.getItem('offset') + (filters !== undefined ? '&filter=' + filters : ''), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {

    if (document.querySelector('#eventAdd')) {
      document.querySelector('#eventAdd').remove();
    }

    let eventContainer = document.getElementById("eventContainer");

    if (eventContainer.querySelector('.modal-event-add')) {
      eventContainer.querySelector('.modal-event-add').remove();
    }

    Array.from(data).forEach(event => {
      sessionStorage.setItem("offset", parseInt(sessionStorage.getItem('offset')) + 1);

      let div = document.createElement("div");
      div.classList.add("col-12", "col-md-6", "col-lg-4", "col-xl-3", "col-xxl-2", "py-3");
      div.setAttribute("data-bs-toggle", "modal");
      div.setAttribute("data-bs-target", "#modalRegister");
      div.setAttribute("data-bs-event-id", event.event_id);

      let card = document.createElement("div");
      card.classList.add("card", "h-100");

      let cardBody = document.createElement("div");
      cardBody.classList.add("card-body", "position-relative", "d-flex", "flex-column");

      let title = document.createElement("h5");
      title.classList.add("card-title");
      title.innerHTML = event.event_name;

      let maxPeople = document.createElement("span");
      maxPeople.classList.add("max-people");
      maxPeople.innerHTML = event.event_max + " <i class=\"fa-solid fa-user-group\"></i>";

      let date = document.createElement("p");
      date.classList.add("m-0");
      //convert mysql date to js date
      let calendarStart = (event.event_date_start).split('T');
      let calendarEnd = (event.event_date_start).split('T');

      let dateObj = new Date(event.event_date_start);
      let dateStartCal = dateObj.toLocaleDateString("en", { month: 'short', day: 'numeric'});
      let dateStart = dateObj.toLocaleTimeString("en", { hour: 'numeric', minute: 'numeric' });

      dateObj = new Date(event.event_date_end);
      let option, dateEnd;
      if (calendarStart[0] === calendarEnd[0]) {
        option = { hour: 'numeric', minute: 'numeric' };
        dateEnd = dateObj.toLocaleTimeString("en", option);
      } else {
        option = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        dateEnd = dateObj.toLocaleDateString("en", option);
      }

      date.innerHTML = "<i class='fa-regular fa-calendar'></i> " + dateStartCal + "<div class='text-nowrap'>" + dateStart + " - " + dateEnd + "</div>";

      let location = document.createElement("p");
      location.innerHTML = "<i class='fa-solid fa-location-pin'></i> " + event.event_location;

      let organizer = document.createElement("p");
      organizer.classList.add("m-0");
      organizer.innerHTML = "<i class='fa-solid fa-user'></i> " + event.user_first;

      let description = document.createElement("p");
      if (event.description !== undefined) description.innerHTML = event.event_description;

      cardBody.appendChild(title);
      cardBody.appendChild(maxPeople);
      cardBody.appendChild(organizer);
      cardBody.appendChild(date);
      cardBody.appendChild(location);
      cardBody.appendChild(description);

      card.appendChild(cardBody);

      div.appendChild(card);

      eventContainer.appendChild(div);
    });

    sessionStorage.setItem("offset", parseInt(sessionStorage.getItem("offset")) + 1);

    let div = document.createElement("div");
    div.classList.add("col-12", "col-md-6", "col-lg-4", "col-xl-3", "col-xxl-2", "py-3", "modal-event-add");
    div.setAttribute("data-bs-toggle", "modal");
    div.setAttribute("data-bs-target", "#modalEvent");

    let card = document.createElement("div");
    card.classList.add("card", "h-100");

    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "position-relative", "card-event");

    let plus = document.createElement("i");
    plus.classList.add("fa-solid", "fa-circle-plus");

    cardBody.appendChild(plus);

    card.appendChild(cardBody);

    div.appendChild(card);

    eventContainer.appendChild(div);
  });
}

function getFilters() {
  fetch('/api/type/get', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())
  .then(data => {

    for (let type in data) {
      let filterContainer = document.getElementById("filterContainer");

      let div = document.createElement("div");
      div.classList.add("filter-btn", "d-flex", "flex-column", "py-4", "pe-5");
      div.setAttribute('data-filter', data[type].type_name);

      let icon = document.createElement("i");

      let iconClass = data[type].type_icon.split(" ");
      for (let c in iconClass) {
        icon.classList.add(iconClass[c]);
      }

      let span = document.createElement("span");
      span.innerHTML = data[type].type_name;

      div.appendChild(icon);
      div.appendChild(span);

      filterContainer.appendChild(div);
    }
  });
}

sessionStorage.setItem("offset", 0);

getFilters();
getEvents();


const modalRegister = document.getElementById('modalRegister');

modalRegister.addEventListener('show.bs.modal', event => {
  // Button that triggered the modal
  const button = event.relatedTarget;
  // Extract info from data-bs-* attributes
  const eventID = button.getAttribute('data-bs-event-id');
  // If necessary, you could initiate an AJAX request here
  // and then do the updating in a callback.
  //
  // Update the modal's content.
  const errorFields = event.target.querySelectorAll('.error');

  Array.from(errorFields).forEach(err => {
    err.innerHTML = '';
  });

  const modalEventInput = modalRegister.querySelector('#event_id');
  modalEventInput.value = eventID;

  const modalDelete = modalRegister.querySelector('#deleteEvent');
  modalDelete.setAttribute('data-id', eventID);

  fetch('/api/events/get?event_id=' + eventID, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {

    let modalBody = modalRegister.querySelector('#modalRegisterBody');
    let table = modalBody.querySelector('#peopleTbl');
    table.innerHTML = "";

    if (data[0].event_users === null) {
      return;
    }

    if (sessionStorage.getItem('user') == data[0].event_organizer) {
      modalDelete.style.display = "inline-block";
    } else {
      modalDelete.style.display = "none";
    }

    fetch('/api/users/names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSON.parse(data[0].event_users))
    })
    .then(response => response.json())
    .then(data => {

      let modalBody = document.querySelector('#modalRegisterBody');
      let table = modalBody.querySelector('#peopleTbl');

      modalRegister.querySelector('button[type=submit]').innerHTML = "Register";
      modalRegister.querySelector('button[type=submit]').removeAttribute('data-action', undefined);

      data.forEach(user => {
        let tr = document.createElement("tr");
        let td = document.createElement("td");

        td.innerHTML = user.user_first + " " + user.user_last;

        tr.appendChild(td);
        table.appendChild(tr);

        if (user.user_id == parseInt(sessionStorage.getItem('user'))) {
          modalRegister.querySelector('button[type=submit]').innerHTML = "Remove";
          modalRegister.querySelector('button[type=submit]').setAttribute('data-action', '/remove');
        }
      });

    });
  });
});

const modalEventDelete = document.getElementById('deleteEvent');

modalEventDelete.addEventListener('click', event => {
  const button = event.target;
  const eventID = button.getAttribute('data-id');

  fetch('/api/events/delete?event_id=' + eventID, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);

    closeModal();
    
    sessionStorage.setItem("offset", 0);
    document.getElementById('eventContainer').innerHTML = '';
    getEvents();
  });
});

document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('filter-btn')) {
    sessionStorage.setItem("offset", 0);
    document.getElementById('eventContainer').innerHTML = '';
    getEvents(e.target.getAttribute('data-filter'));
  }
});