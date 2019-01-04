'use strict';

// Stuff I need to do:
  // 1. Add remove lift function
  // 2. implement .ajax instead of fetch
  // 3. Password change input??

let lift = 0;
let logs;
let token;
let user;

function signOut() {
  localStorage.removeItem('authToken');
  displayPage();
}

function refreshToken() {
  fetch('/auth/refresh', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(res.statusText);
      }
    })
    .then(resJson => {
      token = resJson.authToken;
      localStorage.setItem('authToken', token);
      displayPage();
    })
    .catch(err => console.log(err));
}

function logIn(data) {
  fetch('/auth/login', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => {
      if (res.ok) {
        user = data.username;
        $('#user-signout').append(`
          <p>Welcome ${user}!</p>
          <button type="button" onclick="signOut();">Sign Out</button><br/>
        `)
        return res.json();
      } else {
        throw new Error(res.statusText);
      }
    })
    .then(resJson => {
      token = resJson.authToken;
      localStorage.setItem('authToken', token);
      getWorkouts();
      console.log(token);
    })
    .catch(err => console.log(err));
  console.log('logIn working');
}

function signUp() {
  if ($('#signuppassword').val() !== $('#passconfirm').val()) {
    $('#signup').append(`<p class="alert">Passwords must match</p>`);
  } else {
    const newUser = {
      'username': $('#signupusername').val(),
      'password': $('#signuppassword').val()
    };
    fetch(`/users`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    })
      .then(res => {
        if (res.ok) {
          logIn(newUser);
        } else {
          throw new Error(err.statusText);
        }
      })
      .catch(err => console.log(err));
    console.log('signUp working');
  }
}

function makeCreds() {
  const creds = {
    'username': $('#loginusername').val(),
    'password': $('#loginpassword').val()
  }
  logIn(creds);
}

function displayWorkouts(data) {
  lift = 0;
  $('#workout-list').empty();
  $('#workout-list').removeClass('hidden');
  $('#log-buttons').removeClass('hidden');
  for (let i = 0; i < data.length; i++) {
    $('#workout-list').prepend(
      `<section id="log-${i}" class="log">` +
      '<p>' + data[i].date + '</p>' +
      'Routine: ' + data[i].routine + 
      `<ol class="workout-${i}"></ol>` + 
      'Notes: ' + data[i].notes +
      `<br/><button type="button" id="js-edit-${i}" onclick="editForm(${i})">Edit</button><br/>` +
      `<button type="button" id="js-delete-${i}" onclick="deleteLog(${i});">Delete</button>` +
      '</section>'
    );
    for (let j = 0; j < data[i].lifts.length; j++) {
      $(`.workout-${i}`).append(
        `<li>${data[i].lifts[j].name}: ${data[i].lifts[j].weight} ${data[i].lifts[j].unit}
          <ul>
            <li>Sets: ${data[i].lifts[j].sets}</li>
            <li>Reps: ${data[i].lifts[j].reps}</li>
          </ul>
        </li>`
      );
    };
  };
}

function deleteLog(num) {
  const id = logs[num].id;
  fetch(`/logs/${id}`, {
    method: 'delete'
  })
    .catch(err => console.log(err));
  getWorkouts();
  console.log('deleteLog working');
}

function submitEdit(id, routine) {
  const newLog = {
    'id': id,
    'routine': routine,
    'lifts': [],
    'notes': $(`.notes`).val()
  };
  for (let i = 0; i < lift; i++) {
    newLog.lifts.push({
      'name': $(`.name-${i}`).val(),
      'weight': $(`.weight-${i}`).val(),
      'unit': $(`.unit-${i}`).val(),
      'sets': $(`.set-${i}`).val(),
      'reps': $(`.rep-${i}`).val()
    });
  };
  fetch(`/logs/${id}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newLog)
  })
    .catch(err => console.log(err));
  getWorkouts();
  console.log('submitEdit working');
}

function addNewLift() {
  lift++;
  $(`#lift-list`).append(`
    <label for="name-${lift}">Lift ${lift}: </label><input type="text" name="name-${lift}" class="name-${lift}">
    <label for="weight-${lift}">Weight: </label><input type="number" name="weight-${lift}" class="weight-${lift}">
    <select class="unit-${lift}">
      <option value="kgs">kgs</option>
      <option value="lbs">lbs</option>
    </select>
    <label for="set-${lift}">Sets: </label><input type="number" name="set-${lift}" class="set-${lift}">
    <label for="rep-${lift}">Reps: </label><input type="number" name="rep-${lift}" class="rep-${lift}"><br/>
  `);
}

function editForm(num) {
  displayWorkouts(logs);
  $(`#log-${num}`).empty();
  const found = logs[num];
  $(`#log-${num}`).append(`
    <p>${found.date}</p>
    <p>Routine: ${found.routine}</p>
    <form id="edit-${num}" onsubmit="event.preventDefault(); submitEdit('${found.id}', '${found.routine}');">
      <section id="lift-list">
      </section>
      <label for="notes">Notes: </label><input type="text" name="notes" class="notes" value="${found.notes}"><br/>
      <input type="submit">
    </form>
    <button type="button" onclick="addNewLift();">Add lift</button>
    <button type="button" onclick="displayWorkouts(logs);">Cancel</button>
  `);
  for (let i = found.lifts.length - 1; i >= 0; i--) {
    lift++;
    $(`#lift-list`).prepend(`
      <label for="name-${i}">Lift ${i + 1}: </label><input type="text" name="name-${i}" class="name-${i}" value="${found.lifts[i].name}">
      <label for="weight-${i}">Weight: </label><input type="number" name="weight-${i}" class="weight-${i}" value="${found.lifts[i].weight}">
      <select class="unit-${i}">
      </select>
      <label for="set-${i}">Sets: </label><input type="number" name="set-${i}" class="set-${i}" value="${found.lifts[i].sets}" required>
      <label for="rep-${i}">Reps: </label><input type="number" name="rep-${i}" class="rep-${i}" value="${found.lifts[i].reps}" required><br/>
    `);
    if (found.lifts[i].unit === 'lbs') {
      $(`.unit-${i}`).append(`
        <option value="lbs">lbs</option>
        <option value="kgs">kgs</option>
      `);
    } else {
      $(`.unit-${i}`).append(`
        <option value="kgs">kgs</option>
        <option value="lbs">lbs</option>
      `);
    };
  };
  console.log('editForm working');
}

function createRoutine() {
  const newLog = {
    'routine': $('#routine-name').val(),
    'user': user,
    'lifts': [

    ],
    'notes': $('#notes').val(),
    'date': $('#date').val()
  };
  for (let i = 1; i <= lift; i++) {
    newLog.lifts.push({
      "name": $(`#name-${i}`).val(),
      "weight": $(`#weight-${i}`).val(),
      "unit": $(`#unit-${i}`).val(),
      "sets": $(`#set-${i}`).val(),
      "reps": $(`#rep-${i}`).val()
    });
  };
  addWorkout(newLog);
  console.log('createRoutine working');
}

function createLog() {
  const newLog = {
    'routine': $('#routine-list').val(),
    'user': user,
    'lifts': [],
    'notes': $('#notes').val(),
    'date': $('#date').val()
  };
  for (let i = 0; i < lift; i++) {
    newLog.lifts.push({
      'name': $(`#name-${i}`).val(),
      'weight': $(`#weight-${i}`).val(),
      'unit': $(`#unit-${i}`).val(),
      'sets': $(`#set-${i}`).val(),
      'reps': $(`#rep-${i}`).val()
    });
  };
  addWorkout(newLog);
}

function addWorkout(data) {
  console.log(data);
  fetch('/logs', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => console.log(res));
  clearForm();
  getWorkouts();
  console.log('addWorkout working');
}

function clearForm() {
  lift = 0;
  $('#routine').empty();
  $('#form').empty();
}

function createForm() {
  $('#form').empty();
  lift = 0;
  const routine = $('#routine-list').val();
  if (routine === 'new') {
    lift = 1;
    $('#log-form').removeClass('hidden');
    $('#form').empty();
    $('#form').append(`
      <form id="new-routine" onsubmit="event.preventDefault(); createRoutine();">
        <section id="lifts">
          <label for="routine">Routine Name: </label><input type="text" name="routine" id="routine-name" required><br/>
          <label for="name-1">Lift ${lift}: <input type="text" name="name-1" id="name-1" required>
          <label for="weight-1">Weight: <input type="number" name="weight-1" id="weight-1" required>
          <select id="unit-1">
            <option value="kgs">kgs</option>
            <option value="lbs">lbs</option>
          </select>
          <label for="set-1">Sets: <input type="number" name="set-1" id="set-1" required>
          <label for="rep-1">Reps: <input type="number" name="rep-1" id="rep-1" required><br/>
        </section>
        <section id="notes-n-submit">
          <label for="notes">Notes: </label><input type="text" name="notes" id="notes"><br/>
          <label for="date">Date: </label><input type="date" name="date" id="date"><br/>
          <input type="submit" value="Submit" id="js-routine-submit">
        </section>
      </form>
      <button type="button" id="js-add-lift">Add another lift</button>
      <button type="button" onclick="clearForm();">Cancel</button>
    `);
  } else {
    const found = logs.slice().reverse().find(function(workout) {
      return workout.routine === routine;
    });
    $('#form').append(`
      <form id="new-workout" onsubmit="event.preventDefault(); createLog(lift);">
      <section id="lifts">
      </section>
      </form>
      <button type="button" id="js-add-lift">Add lift</button>
      <button type="text" onclick="clearForm();">Cancel</button>
    `);
    for (let i = 0; i < found.lifts.length; i++) {
      lift++;
      $('#lifts').append(`
        <label for="name-${i}">Lift ${lift}: </label><input type="text" name="name-${i}" id="name-${i}" value="${found.lifts[i].name}" required>
        <label for="weight-${i}">Weight: </label><input type="number" name="weight-${i}" id="weight-${i}" value="${found.lifts[i].weight}" required>
        <select id="unit-${i}">
        </select>
        <label for="set-${i}">Sets: </label><input type="number" name="set-${i}" id="set-${i}" value="${found.lifts[i].sets}" required>
        <label for="rep-${i}">Reps: </label><input type="number" name="rep-${i}" id="rep-${i}" value="${found.lifts[i].reps}" required><br/>
      `);
      if (found.lifts[i].unit === 'lbs') {
        $(`#unit-${i}`).append(`
          <option value="lbs">lbs</option>
          <option value="kgs">kgs</option>
        `);
      } else {
        $(`#unit-${i}`).append(`
          <option value="kgs">kgs</option>
          <option value="lbs">lbs</option>
        `)
      };
    };
    $('#new-workout').append(`
    <label for="notes">Notes: </label><input type="text" name="notes" id="notes"><br/>
    <label for="date">Date: </label><input type="date" name="date" id="date" required><br/>
    <input type="submit">
    `);
  }
  console.log('createForm working');
}


function addLift() {
  $('#log-form').on('click', '#js-add-lift', function() {
    lift++;
    $('#lifts').append(`
      <label for="name-${lift}">Lift ${lift}: <input type="text" name="name-${lift}" id="name-${lift}" required>
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

// function newRoutine() {
//   $('#js-new-routine').click(event => {
//     lift = 1;
//     $('#log-form').removeClass('hidden');
//     $('#form').empty();
//     $('#routine').empty();
//     $('#form').append(`
//       <form id="new-routine" onsubmit="event.preventDefault(); createRoutine();">
//         <section id="lifts">
//           <label for="routine">Routine Name: </label><input type="text" name="routine" id="routine-name" required><br/>
//           <label for="name-1">Lift ${lift}: <input type="text" name="name-1" id="name-1" required>
//           <label for="weight-1">Weight: <input type="number" name="weight-1" id="weight-1" required>
//           <select id="unit-1">
//             <option value="kgs">kgs</option>
//             <option value="lbs">lbs</option>
//           </select>
//           <label for="set-1">Sets: <input type="number" name="set-1" id="set-1" required>
//           <label for="rep-1">Reps: <input type="number" name="rep-1" id="rep-1" required><br/>
//         </section>
//         <section id="notes-n-submit">
//           <label for="notes">Notes: </label><input type="text" name="notes" id="notes"><br/>
//           <label for="date">Date: </label><input type="date" name="date" id="date"><br/>
//           <input type="submit" value="Submit" id="js-routine-submit">
//         </section>
//       </form>
//       <button type="button" id="js-add-lift">Add another lift</button>
//       <button type="button" onclick="clearForm();">Cancel</button>
//     `);
//     console.log('newRoutine working');
//   });
// }

function newWorkout() {
  $('#js-new-log').click(event => {
    $('#log-form').removeClass('hidden');
    $('#form').empty();
    $('#routine').empty();
    let routines = [];
    for (let i = 0; i < logs.length; i++) {
      routines.push(logs[i].routine);
    }
    let list = [...new Set(routines)];
    list.sort();
    $('#routine').append(`
        Choose a routine: <select id="routine-list" onchange="createForm()">
          <option disabled selected></option>
          <option value="new">New routine</option>
        </select>
      `);
    for (let i = 0; i < list.length; i++) {
      $('#routine-list').append(`<option value="${list[i]}">${list[i]}</option>`);
    };
  });
}

function getWorkouts() {
  logs = [];
  lift = 0;
  $('#login').addClass('hidden');
  $('#signup').addClass('hidden');
  fetch('/logs')
    .then(res => res.json())
    .then(resJson => {
      logs = resJson.filter(obj => obj.user === user);
      logs.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
      });
      console.log(logs);
      displayWorkouts(logs);
    })
    .catch(err => console.log(err));
}

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

function displayPage() {
  token = localStorage.getItem('authToken');
  if (token === null) {
    $('#log-buttons').addClass('hidden');
    $('#log-form').addClass('hidden');
    $('#workout-list').addClass('hidden');
    $('#user-signout').empty();
    $('#login-and-signup').empty().removeClass('hidden').append(`
      <form id="login" onsubmit="event.preventDefault(); makeCreds();">
        <legend>Login!</legend>
        <label for="loginusername">Username: </label><input type="text" name="loginusername" id="loginusername" required><br/>
        <label for="loginpassword">Password: </label><input type="password" name="loginpassword" id="loginpassword" required><br/>
        <input type="submit" value="Login" id="js-login">
      </form>
      <form id="signup" onsubmit="event.preventDefault(); signUp();">
        <legend>Sign Up!</legend>
        <label for="signupusername">Username: </label><input type="text" name="signupusername" id="signupusername" maxlength="16" required><br/>
        <label for="signuppassword">Password: </label><input type="password" name="signuppassword" id="signuppassword" maxlength="72" required><br/>
        <label for="passconfirm">Re-enter your password: </label><input type="password" name="passconfirm" id="passconfirm" maxlength="72" required><br/>
        <input type="submit" value="Join" id="js-signup">
      </form>
    `);
  } else {
    const parse = parseJwt(token);
    const exp = parse.exp * 1000;
    const d = new Date();
    const date = d.getTime();
    if (exp < date)  {
      signOut();
    } else if (exp - date <= 86400000) {
      refreshToken();
    } else {
      user = parse.user.username;
      $('#user-signout').removeClass('hidden').append(`
        <p>Welcome ${user}!</p>
        <button type="button" onclick="signOut();">Sign Out</button><br/>
      `);
      getWorkouts();
    };
  };
}

$(function() {
  newWorkout();
  // newRoutine();
  addLift();
  displayPage();
})