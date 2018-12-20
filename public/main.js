'use strict';

// Stuff I need to do:
  // 1. Figure out the date thing
  // 2. New routine submit function
  // 3. 

const MOCK_WORKOUTS = {
  "workouts": [
    {
      "id": 111111,
      "routine": "A",
      "user": "Russell Koons",
      "lifts": [
        {
          "name": "Squat",
          "weight": 225,
          "unit": "lbs",
          "sets": 5,
          "reps": 5
        },
        {
          "name": "Bench Press",
          "weight": 125,
          "unit": "lbs",
          "sets": 5,
          "reps": 5
        },
        {
          "name": "Row",
          "weight": 135,
          "unit": "lbs",
          "sets": 5,
          "reps": 5
        },
        {
          "name": "Straight Bar",
          "weight": 65,
          "unit": "lbs",
          "sets": 3,
          "reps": 8
        }
      ],
      "notes": "Yeah yeah yeahhhhhh",
      "date": "December 21, 2018"
    },
    {
      "id": 22222,
      "routine": "B",
      "user": "Russell Koons",
      "lifts": [
        {
          "name": "Squat",
          "weight": 225,
          "unit": "lbs",
          "sets": 5,
          "reps": 5
        },
        {
          "name": "Deadlift",
          "weight": 225,
          "unit": "lbs",
          "sets": 1,
          "reps": 5
        },
        {
          "name": "Military Press",
          "weight": 75,
          "unit": "lbs",
          "sets": 5,
          "reps": 5
        },
        {
          "name": "Cable Crunch",
          "weight": 150,
          "unit": "lbs",
          "sets": 3,
          "reps": 10
        }
      ],
      "notes": "I goofed",
      "date": "December 19, 2018"
    },
    {
      "id": 33333,
      "routine": "A",
      "user": "Russell Koons",
      "lifts": [
        {
          "name": "Squat",
          "weight": 225,
          "unit": "lbs",
          "sets": 5,
          "reps": 5
        },
        {
          "name": "Bench Press",
          "weight": 125,
          "unit": "lbs",
          "sets": 5,
          "reps": 5
        },
        {
          "name": "Row",
          "weight": 135,
          "unit": "lbs",
          "sets": 5,
          "reps": 5
        },
        {
          "name": "Straight Bar",
          "weight": 65,
          "unit": "lbs",
          "sets": 3,
          "reps": 8
        }
      ],
      "notes": "A good workout" ,
      "date": "December 17, 2018"
    }
  ]
}

function getRecentWorkouts(callbackFn) {
  setTimeout(function(){ callbackFn(MOCK_WORKOUTS)}, 1);
}

function displayWorkouts(data) {
  $('#workout-list').empty();
  for (let i = 0; i < data.workouts.length; i++) {
    $('#workout-list').append(
      '<p>' + data.workouts[i].date + '</p>' +
      'Routine: ' + data.workouts[i].routine + 
      `<ol class="workout${i}"></ol>` + 
      'Notes: ' + data.workouts[i].notes
    );
    for (let j = 0; j < data.workouts[i].lifts.length; j++) {
      $(`.workout${i}`).append(
        `<li>${data.workouts[i].lifts[j].name}: ${data.workouts[i].lifts[j].weight} ${data.workouts[i].lifts[j].unit}
          <ul>
            <li>Sets: ${data.workouts[i].lifts[j].sets}</li>
            <li>Reps: ${data.workouts[i].lifts[j].reps}</li>
          </ul>
        </li>`
      );
    }
  }
}

function addWorkout() {
  const newLog = {
    "id": 44444,
    "routine": $('#routine-list').val(),
    "user": "Russell Koons",
    "lifts": [

    ],
    "notes": $('#notes').val(),
    "date": Date.now()
  };
  const found = MOCK_WORKOUTS.workouts.find(function(workout) {
    return workout.routine === $('#routine-list').val();
  });
  for (let i = 0; i < found.lifts.length; i++) {
    newLog.lifts.push({
      "name": found.lifts[i].name,
      "weight": $(`#weight${i}`).val(),
      "unit": $(`#unit${i}`).val(),
      "sets": $(`#set${i}`).val(),
      "reps": $(`#rep${i}`).val()
    });
  }
  MOCK_WORKOUTS.workouts.unshift(newLog);
  $('#log-form').empty();
  getWorkouts();
  console.log('addWorkout working');
}

function createForm() {
  $('#js-choose-routine').click(event => {
    $('#new-workout').empty();
    const routine = $('#routine-list').val();
    const found = MOCK_WORKOUTS.workouts.find(function(workout) {
      return workout.routine === routine;
    });
    $('#log-form').append(`<form id="new-workout" onsubmit="event.preventDefault(); addWorkout();"></form>`);
    for (let i = 0; i < found.lifts.length; i++) {
      $('#new-workout').append(`
      <span>${found.lifts[i].name}</span><br/>
        <label for="weight-${i}">Weight: </label><input type="number" name="weight-${i}" id="weight-${i}" value="${found.lifts[i].weight}" required>
        <select id="unit-${i}">
          <option value="lbs">lbs</option>
          <option value="kgs">kgs</option>
        </select>
        <label for="set-${i}">Sets: </label><input type="number" name="set-${i}" id="set-${i}" value="${found.lifts[i].sets}" required>
        <label for="rep-${i}">Reps: </label><input type="number" name="rep-${i}" id="rep-${i}" value="${found.lifts[i].reps}" required><br/>
      `);
    };
    $('#new-workout').append(`
    <label for="notes">Notes: </label><input type="text" name="notes" id="notes"><br/>
    <input type="submit" value="Submit" id="js-workout-submit">
    `);
    console.log('createForm working');
  })
}

function addLift() {
  let lift = 0;
  $('#log-form').on('click', '#js-add-lift', function() {
    lift++;
    console.log(lift);
    $('#new-routine-lifts').append(`
      <label for="name-${lift}">Lift name: <input type="text" name="name-${lift}" id="name-${lift}" required>
      <label for="weight-${lift}">Weight: <input type="number" name="weight-${lift}" id="weight-${lift} required>
      <label for="set-${lift}">Sets: <input type="number" name="set-${lift}" id="set-${lift}" required>
      <label for="rep-${lift}">Reps: <input type="number" name="rep-${lift}" id="rep-${lift}" required><br/>
    `);
    console.log('addLift working');
  });
}

function newRoutine() {
  $('#js-new-routine').click(event => {
    $('#log-form').removeClass('hidden');
    $('#log-form').empty();
    $('#log-form').append(`
      <form id="new-routine" onsubmit="event.preventDefault(); addRoutine();">
        <section id="new-routine-lifts">
          <label for="routine">Routine Name: </label><input type="text" name="routine" id="routine" required><br/>
          <label for="name-0">Lift name: <input type="text" name="name-0" id="name-0" required>
          <label for="weight-0">Weight: <input type="number" name="weight-0" id="weight-0 required>
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
    let routines = [];
    for (let i = 0; i < MOCK_WORKOUTS.workouts.length; i++) {
      routines.push(MOCK_WORKOUTS.workouts[i].routine);
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
    createForm();
    console.log('newWorkout working');
  })
}

function getWorkouts() {
  getRecentWorkouts(displayWorkouts);
}

$(function() {
  getWorkouts();
  newWorkout();
  newRoutine();
  addLift();
})