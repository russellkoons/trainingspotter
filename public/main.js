'use strict';

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
      "date": "December 19, 2018"
    },
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
      "date": "December 17, 2018"
    }
  ]
}

function getRecentWorkouts(callbackFn) {
  setTimeout(function(){ callbackFn(MOCK_WORKOUTS)}, 1);
}

function displayWorkouts(data) {
  for (let i = 0; i < data.workouts.length; i++) {
    $('#main').append(
      '<p>' + data.workouts[i].date + '</p>' +
      'Routine: ' + data.workouts[i].routine + 
      `<ol class="workout${i}"></ol>`
    );
    for (let j = 0; j < data.workouts[i].lifts.length; j++) {
      $(`.workout${i}`).append(
        `<li>${data.workouts[i].lifts[j].name}:
          <ul>
            <li>Weight: ${data.workouts[i].lifts[j].weight}${data.workouts[i].lifts[j].unit}</li>
            <li>Sets: ${data.workouts[i].lifts[j].sets}</li>
            <li>Reps: ${data.workouts[i].lifts[j].reps}</li>
          </ul>
        </li>`
      );
    }
  }
}

function getWorkouts() {
  getRecentWorkouts(displayWorkouts);
}

$(function() {
  getWorkouts();
})