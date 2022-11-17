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

      let card = document.createElement("div");
      card.classList.add("card", "h-100");

      let cardBody = document.createElement("div");
      cardBody.classList.add("card-body", "position-relative");

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