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
      let dateOB = false;
      if (new Date(event.event_date_end) < new Date()) {
        dateOB = true;
      }

      sessionStorage.setItem("offset", parseInt(sessionStorage.getItem('offset')) + 1);

      let div = document.createElement("div");
      div.classList.add("col-12", "col-md-6", "col-lg-4", "col-xl-3", "col-xxl-2", "py-3");
      if (dateOB) div.classList.add('muted');
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

    let eventType = document.getElementsByClassName('event-type');

    for(let i = 0; i < eventType.length; i++) {
      let div = document.createElement("div");
      div.classList.add("form-floating");
      let select = document.createElement("select");
      select.classList.add("form-select");
      select.setAttribute("name", "event_type")
      select.setAttribute("id", "event_type");
      select.setAttribute("aria-label", "Type");

      let option = document.createElement("option");
      option.setAttribute("selected", "");
      option.innerHTML = "Select One...";
      select.appendChild(option);
      for (let type in data) {
        let option = document.createElement("option");
        option.setAttribute("value", data[type].type_id);
        option.innerHTML = data[type].type_name;

        select.appendChild(option);

      }

      let label = document.createElement("label");
      label.setAttribute("for", "floatingSelect");
      label.innerHTML = "Type";

      eventType[i].appendChild(div);
      div.appendChild(select);
      div.appendChild(label);
    }
  });
}

function getEventNames(eventID = undefined) {

  modalRegisterEvent.classList.remove("d-none");
  modalRegisterEvent.classList.add("d-inline-block");

  eventID = modalRegisterEvent.getAttribute("data-id");

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

    console.log(data);

    if (sessionStorage.getItem('user') == data[0].event_organizer) {
      if (new Date(data[0].event_date_end) < new Date()) {
        modalDeleteEvent.classList.remove("d-inline-block");
        modalDeleteEvent.classList.add("d-none");
        modalRegisterEvent.classList.remove("d-inline-block");
        modalRegisterEvent.classList.add("d-none");
      } else {
        modalDeleteEvent.classList.remove("d-none");
        modalDeleteEvent.classList.add("d-inline-block");
      }
    } else {
      modalDeleteEvent.classList.remove("d-inline-block");
      modalDeleteEvent.classList.add("d-none");
    }

    if (data[0].event_users === null) {
      return;
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

      if (Object.keys(data).length === 0) return false;

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
}

sessionStorage.setItem("offset", 0);

getFilters();
getEvents();


const modalRegister = document.getElementById('modalRegister');

const modalEventInput = modalRegister.querySelector('#event_id');

const modalDeleteEvent = modalRegister.querySelector('#deleteEvent');

const modalRegisterEvent = modalRegister.querySelector('#registerEvent');


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

  modalRegister.querySelector('#event_id').value = eventID;

  modalDeleteEvent.setAttribute('data-id', eventID);

  modalRegisterEvent.setAttribute('data-id', eventID);

  getEventNames(eventID);
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