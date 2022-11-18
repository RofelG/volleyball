//fetch events from database
function getEvents() {

  fetch('/api/events/get?offset=' + sessionStorage.getItem('offset'), {
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
      title.innerHTML = event.name;

      let maxPeople = document.createElement("span");
      maxPeople.classList.add("max-people");
      maxPeople.innerHTML = event.max + " <i class=\"fa-solid fa-user-group\"></i>";

      let date = document.createElement("p");
      date.classList.add("m-0");
      //convert mysql date to js date
      let calendarStart = (event.date_start).split('T');
      let calendarEnd = (event.date_start).split('T');

      let dateObj = new Date(event.date_start);
      let dateStartCal = dateObj.toLocaleDateString("en", { month: 'short', day: 'numeric'});
      let dateStart = dateObj.toLocaleTimeString("en", { hour: 'numeric', minute: 'numeric' });

      dateObj = new Date(event.date_end);
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
      location.innerHTML = "<i class='fa-solid fa-location-pin'></i> " + event.location;

      let organizer = document.createElement("p");
      organizer.classList.add("m-0");
      organizer.innerHTML = "<i class='fa-solid fa-user'></i> " + event.organizer;

      let description = document.createElement("p");
      if (event.description !== undefined) description.innerHTML = event.description;

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

sessionStorage.setItem("offset", 0);

getEvents();

const modalRegister = document.getElementById('modalRegister');

modalRegister.addEventListener('show.bs.modal', event => {
  // Button that triggered the modal
  const button = event.relatedTarget
  // Extract info from data-bs-* attributes
  const eventID = button.getAttribute('data-bs-event-id')
  // If necessary, you could initiate an AJAX request here
  // and then do the updating in a callback.
  //
  // Update the modal's content.

  const modalEventInput = modalRegister.querySelector('#event_id');
  modalEventInput.value = eventID;

  fetch('/api/events/get?event_id=' + eventID, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log(JSON.parse(data[0].users));

    let modalBody = modalRegister.querySelector('#modalRegisterBody');
    let table = modalBody.querySelector('#peopleTbl');
    table.innerHTML = "";

    if (data[0].users === null) {
      return;
    }

    fetch('/api/users/names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSON.parse(data[0].users))
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);

      let modalBody = document.querySelector('#modalRegisterBody');
      let table = modalBody.querySelector('#peopleTbl');

      data.forEach(user => {
        let tr = document.createElement("tr");
        let td = document.createElement("td");

        td.innerHTML = user.first + " " + user.last;

        tr.appendChild(td);
        table.appendChild(tr);
      })
    });
  });
})