'use strict';

// Stuff I need to do:
  // 1. Figure out the date thing

let lift = 0;

function displayWorkouts(data) {
  $('#workout-list').empty();
  $('#workout-list').removeClass('hidden');
  $('#log-buttons').removeClass('hidden');
  for (let i = data.length - 1; i >= 0; i--) {
    $('#workout-list').append(
      '<p>' + data[i].date + '</p>' +
      'Routine: ' + data[i].routine + 
      `<ol class="workout${i}"></ol>` + 
      'Notes: ' + data[i].notes
    );
    for (let j = 0; j < data[i].lifts.length; j++) {
      $(`.workout${i}`).append(
        `<li>${data[i].lifts[j].name}: ${data[i].lifts[j].weight} ${data[i].lifts[j].unit}
          <ul>
            <li>Sets: ${data[i].lifts[j].sets}</li>
            <li>Reps: ${data[i].lifts[j].reps}</li>
          </ul>
        </li>`
      );
    }
  }
}

function addRoutine(lift) {
  const newLog = {
    "routine": $('#routine').val(),
    "user": "Russell Koons",
    "lifts": [

    ],
    "notes": $('#notes').val(),
  };
  for (let i = 0; i <= lift; i++) {
    newLog.lifts.push({
      "name": $(`#name-${i}`).val(),
      "weight": $(`#weight-${i}`).val(),
      "unit": $(`#unit-${i}`).val(),
      "sets": $(`#set-${i}`).val(),
      "reps": $(`#rep-${i}`).val()
    });
  };
  fetch('/logs',  {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newLog)
  })
    .then(res => console.log(res));
  lift = 0;
  $('#log-form').empty();
  getWorkouts();
  console.log('addRoutine working');
}

function createLog(lift) {
  const newLog = {
    'routine': $('#routine-list').val(),
    'user': 'Russell Koons',
    'lifts': [],
    'notes': $('#notes').val()
  };
  for (let i = 0; i < lift; i++) {
    newLog.lifts.push({
      'name': $(`#name-${i}`).html(),
      'weight': $(`#weight-${i}`).val(),
      'unit': $(`#unit-${i}`).val(),
      'sets': $(`#set-${i}`).val(),
      'reps': $(`#rep-${i}`).val()
    });
  };
  lift = 0;
  addWorkout(newLog);
}

function addWorkout(data) {
  fetch('/logs', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => console.log(res));
  $('#log-form').empty();
  getWorkouts();
  console.log('addWorkout working');
}

function createForm(res) {
  $('#js-choose-routine').click(event => {
    $('#new-workout').empty();
    lift = 0;
    const routine = $('#routine-list').val();
    const found = res.find(function(workout) {
      return workout.routine === routine;
    });
    $('#log-form').append(`<form id="new-workout" onsubmit="event.preventDefault(); createLog(lift)"></form>`);
    for (let i = 0; i < found.lifts.length; i++) {
      lift++;
      $('#new-workout').append(`
      <span id="name-${i}">${found.lifts[i].name}</span><br/>
        <label for="weight-${i}">Weight: </label><input type="number" name="weight-${i}" id="weight-${i}" value="${found.lifts[i].weight}" required>
        <select id="unit-${i}">
          <option value="kgs">kgs</option>
          <option value="lbs">lbs</option>
        </select>
        <label for="set-${i}">Sets: </label><input type="number" name="set-${i}" id="set-${i}" value="${found.lifts[i].sets}" required>
        <label for="rep-${i}">Reps: </label><input type="number" name="rep-${i}" id="rep-${i}" value="${found.lifts[i].reps}" required><br/>
      `);
    };
    $('#new-workout').append(`
    <label for="notes">Notes: </label><input type="text" name="notes" id="notes"><br/>
    <input id="js-workout-submit" type="submit">
    `);
    console.log('createForm working');
  });
}

function addLift() {
  $('#log-form').on('click', '#js-add-lift', function() {
    lift++;
    $('#new-routine-lifts').append(`
      <label for="name-${lift}">Lift name: <input type="text" name="name-${lift}" id="name-${lift}" required>
      <label for="weight-${lift}">Weight: <input type="number" name="weight-${lift}" id="weight-${lift}" required>
      <select id="unit-${lift}">
      <option value="kgs">kgs</option>
      <option value="lbs">lbs</option>
      </select>
      <label for="set-${lift}">Sets: <input type="number" name="set-${lift}" id="set-${lift}" required>
      <label for="rep-${lift}">Reps: <input type="number" name="rep-${lift}" id="rep-${lift}" required><br/>
    `);
    console.log('addLift working');
  });
}

function newRoutine() {
  $('#js-new-routine').click(event => {
    lift = 0;
    $('#log-form').removeClass('hidden');
    $('#log-form').empty();
    $('#log-form').append(`
      <form id="new-routine" onsubmit="event.preventDefault(); addRoutine(lift);">
        <section id="new-routine-lifts">
          <label for="routine">Routine Name: </label><input type="text" name="routine" id="routine" required><br/>
          <label for="name-0">Lift name: <input type="text" name="name-0" id="name-0" required>
          <label for="weight-0">Weight: <input type="number" name="weight-0" id="weight-0" required>
          <select id="unit-0">
            <option value="kgs">kgs</option>
            <option value="lbs">lbs</option>
          </select>
          <label for="set-0">Sets: <input type="number" name="set-0" id="set-0" required>
          <label for="rep-0">Reps: <input type="number" name="rep-0" id="rep-0" required><br/>
        </section>
        <section id="notes-n-submit">
          <label for="notes">Notes: </label><input type="text" name="notes" id="notes"><br/>
          <input type="submit" value="Submit" id="js-routine-submit">
        </section>
      </form>
      <button type="button" id="js-add-lift">Add another lift</button>
    `);
    console.log('newRoutine working');
  });
}

function newWorkout() {
  $('#js-new-log').click(event => {
    $('#log-form').removeClass('hidden');
    $('#log-form').empty();
    fetch('/logs')
      .then(res => res.json())
      .then(resJson => {
        console.log(resJson);
        let routines = [];
        for (let i = 0; i < resJson.length; i++) {
          routines.push(resJson[i].routine);
        }
        let list = [...new Set(routines)];
        $('#log-form').append(
          `Choose a routine: <select id="routine-list">
    
          </select>
          <button type="button" id="js-choose-routine">Submit</button>`
        );
        for (let i = 0; i < list.length; i++) {
          $('#routine-list').append(`<option value="${list[i]}">${list[i]}</option>`);
        };
        createForm(resJson);
      });
  });
}

function getWorkouts() {
  $('#login').addClass('hidden');
  $('#signup').addClass('hidden');
  fetch('/logs')
    .then(res => res.json())
    .then(resJson => {
      console.log(resJson);
      displayWorkouts(resJson);
    });
}

$(function() {
  newWorkout();
  newRoutine();
  addLift();
})