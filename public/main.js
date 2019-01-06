'use strict';

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

function guestLogin() {
  const guest = {
    'username': 'guest',
    'password': 'password'
  };
  logIn(guest);
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
    })
    .catch(err => {
      $('#login-error').empty().append(`<p class="alert">Username or password is incorrect</p>`);
    });
}

function signUp() {
  if ($('#signuppassword').val() !== $('#passconfirm').val()) {
    $('#signup-error').empty().append(`<p class="alert">Passwords must match</p>`);
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
          return res.json();
        }
      })
      .then(resJson => {
        $('#signup-error').empty().append(`<p class="alert">${resJson.message}</p>`);
        console.log(resJson);
      })
      .catch(err => {
        $('#signup-error').empty().append('<p class="alert">Something went wrong!</p>');
        console.log(err);
      });
  }
}

function makeCreds() {
  const creds = {
    'username': $('#loginusername').val(),
    'password': $('#loginpassword').val()
  }
  logIn(creds);
}

function deleteLog(num) {
  const id = logs[num].id;
  fetch(`/logs/${id}`, {
    method: 'delete'
  })
    .catch(err => {
      $('#log-buttons').append('<p class="alert">Delete failed</p>');
      console.log(err);
    });
  getWorkouts();
}

function submitEdit(id, routine) {
  const newLog = {
    'id': id,
    'routine': routine,
    'lifts': [],
    'notes': $(`#notes`).val()
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
  fetch(`/logs/${id}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newLog)
  })
    .catch(err => {
      $('#log-buttons').append('<p class="alert">Log edit failed!</p>') 
      console.log(err)
    });
  getWorkouts();
}

function editForm(num) {
  displayWorkouts(logs);
  $('#form').empty().addClass('hidden');
  $('#log-form').addClass('hidden');
  const found = logs[num];
  $(`#log-${num}`).empty().append(`
    <p class="center">${found.date}</p>
    <p class="center">Routine: ${found.routine}</p>
    <form id="edit-${num}" onsubmit="event.preventDefault(); submitEdit('${found.id}', '${found.routine}');" class="form">
      <section id="lifts">
      </section>
      <button type="button" onclick="addLift();">Add lift</button>
      <button type="button" onclick="removeLift();">Remove lift</button><br/>
      <label for="notes">Notes</label><br/>
      <textarea type="text" name="notes" id="notes">${found.notes}</textarea><br/>
      <input type="submit">
      <button type="button" onclick="displayWorkouts(logs);">Cancel</button>
    </form>
  `);
  for (let i = found.lifts.length - 1; i >= 0; i--) {
    lift++;
    $(`#lifts`).prepend(`
      <div id="lift-${i}">
        <label for="name-${i}" class="smallscreen">Lift ${i + 1}: </label><input type="text" name="name-${i}" id="name-${i}" class="large" value="${found.lifts[i].name}">
        <div class="smallscreen">
        <label for="weight-${i}" class="inline">Weight: </label>
          <input type="number" name="weight-${i}" id="weight-${i}" class="medium" value="${found.lifts[i].weight}">
          <select id="unit-${i}">
          </select>
        </div>
        <label for="set-${i}" class="inline">Sets: </label><input type="number" name="set-${i}" id="set-${i}" value="${found.lifts[i].sets}" class="small" required>
        <label for="rep-${i}" class="inline">Reps: </label><input type="number" name="rep-${i}" id="rep-${i}" value="${found.lifts[i].reps}" class="small" required>
      </div>
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
      `);
    };
  };
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
  for (let i = 0; i < lift; i++) {
    newLog.lifts.push({
      "name": $(`#name-${i}`).val(),
      "weight": $(`#weight-${i}`).val(),
      "unit": $(`#unit-${i}`).val(),
      "sets": $(`#set-${i}`).val(),
      "reps": $(`#rep-${i}`).val()
    });
  };
  addWorkout(newLog);
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
  fetch('/logs', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => {
      if (res.ok) {
        clearForm();
        getWorkouts();
      } else {
        throw new Error(res.statusText);
      }
    })
    .catch(err => {
      $('#log-buttons').append('<p class="alert">Something went wrong!</p>') 
      console.log(err);
    });
  clearForm();
  getWorkouts();
}

function clearForm() {
  lift = 0;
  $('#routine').empty();
  $('#form').empty();
  $('#log-form').addClass('hidden');
}

function createForm() {
  lift = 0;
  const routine = $('#routine-list').val();
  if (routine === 'new') {
    lift++;
    $('#log-form').removeClass('hidden');
    $('#form').empty().removeClass('hidden').append(`
      <form id="new-routine" onsubmit="event.preventDefault(); createRoutine();">
        <label for="routine" class="formlabel">Routine Name: </label><input type="text" name="routine" id="routine-name" required><br/>
        <section id="lifts">
          <div id="lift-0">
            <label for="name-0" class="smallscreen">Lift 1: </label><input type="text" name="name-0" id="name-0" class="large" required>
            <div class="smallscreen">
            <label for="weight-0" class="inline">Weight: </label>
              <input type="number" name="weight-0" id="weight-0" class="medium" required>
              <select id="unit-0">
                <option value="kgs">kgs</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
            <label for="set-0" class="inline">Sets: </label><input type="number" name="set-0" id="set-0" class="small" required>
            <label for="rep-0" class="inline">Reps: </label><input type="number" name="rep-0" id="rep-0" class="small" required>
          </div>
        </section>
        <section id="notes-n-submit">
          <button type="button" onclick="addLift();" class="center">Add lift</button>
          <button type="button" onclick="removeLift();" class="center">Remove lift</button><br/>
          <label for="notes">Notes</label><br/><textarea type="text" name="notes" id="notes"></textarea><br/>
          <label for="date">Date: </label><input type="date" name="date" id="date"><br/>
          <input type="submit" value="Submit" id="js-routine-submit">
          <button type="button" onclick="clearForm();">Cancel</button>
        </section>
      </form>
    `);
  } else {
    const found = logs.slice().reverse().find(function(workout) {
      return workout.routine === routine;
    });
    $('#form').empty().removeClass('hidden').append(`
      <form id="new-workout" onsubmit="event.preventDefault(); createLog();">
        <section id="lifts">
        </section>
        <button type="button" onclick="addLift();">Add lift</button>
        <button type="button" onclick="removeLift();">Remove lift</button><br/>
        <label for="notes">Notes</label><br/>
        <textarea type="text" name="notes" id="notes"></textarea><br/>
        <label for="date">Date: </label><input type="date" name="date" id="date" required><br/>
        <input type="submit">
        <button type="text" onclick="clearForm();">Cancel</button>
      </form>
    `);
    for (let i = 0; i < found.lifts.length; i++) {
      lift++;
      $('#lifts').append(`
        <div id="lift-${i}">
          <label for="name-${i}" class="smallscreen">Lift ${lift}: </label><input type="text" name="name-${i}" id="name-${i}" value="${found.lifts[i].name}" class="large" required>
          <div class="smallscreen">
          <label for="weight-${i}" class="inline">Weight: </label>
            <input type="number" name="weight-${i}" id="weight-${i}" value="${found.lifts[i].weight}" class="medium" required>
            <select id="unit-${i}">
            </select>
          </div>
          <label for="set-${i}" class="inline">Sets: </label><input type="number" name="set-${i}" id="set-${i}" class="small" value="${found.lifts[i].sets}" required>
          <label for="rep-${i}" class="inline">Reps: </label><input type="number" name="rep-${i}" id="rep-${i}" class="small" value="${found.lifts[i].reps}" required>
        </div>
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
  }
}

function removeLift() {
  lift--;
  $(`#lift-${lift}`).remove();
}

function addLift() {
  lift++;
  $('#lifts').append(`
    <div id="lift-${lift - 1}">
      <label for="name-${lift - 1}" class="smallscreen">Lift ${lift}: </label><input type="text" name="name-${lift - 1}" id="name-${lift - 1}" class="large" required>
      <div class="smallscreen">
      <label for="weight-${lift - 1}" class="inline">Weight: </label>
        <input type="number" name="weight-${lift - 1}" id="weight-${lift - 1}" class="medium" required>
        <select id="unit-${lift - 1}">
          <option value="kgs">kgs</option>
          <option value="lbs">lbs</option>
        </select>
      </div>
      <label for="set-${lift - 1}" class="inline">Sets: </label><input type="number" name="set-${lift - 1}" id="set-${lift - 1}" class="small" required>
      <label for="rep-${lift - 1}" class="inline">Reps: </label><input type="number" name="rep-${lift - 1}" id="rep-${lift - 1}" class="small" required>
    </div>
  `);
}

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

function displayWorkouts(data) {
  if (data.length === 0) {
    $('#log-buttons').removeClass('hidden');
    $('#workout-list').empty();
    $('#instructions').empty().removeClass('hidden').append(`
      <h2>Welcome to trainingspotter!</h2>
      <p>Since this appears to be your first time with the app, let me give you a quick rundown on how this whole thing works</p>
      <ol>
        <li>Click "Log a new workout" and choose "New routine"</li>
        <li>Fill out the form to create a new routine</li>
        <li>Click "Add lift" to put more lifts into your routine</li>
        <li>Once your form is filled out click submit and it will be saved to the database</li>
        <li>Next time you do that workout, pick it from the list and it'll pop up already filled out. You just need to make any adjustment for gains or changes in your workout</li>
      </ol>
      <p>You're ready to get started! Thanks for using trainingspotter!</p>  
    `)
  } else {
    lift = 0;
    $('#instructions').empty();
    $('#workout-list').empty().removeClass('hidden');
    $('#log-buttons').removeClass('hidden');
    for (let i = 0; i < data.length; i++) {
      $('#workout-list').prepend(`
        <section id="log-${i}" class="box center">
          <h4 class="center">${data[i].date}</h4>
          <p class="left">Routine: ${data[i].routine}</p> 
          <ol id="workout-${i}" class="left"></ol> 
          <p class="left">Notes: ${data[i].notes}</p>
          <button type="button" id="js-edit-${i}" onclick="editForm(${i})">Edit</button>
          <button type="button" id="js-delete-${i}" onclick="deleteLog(${i});">Delete</button>
        </section>
      `);
      for (let j = 0; j < data[i].lifts.length; j++) {
        $(`#workout-${i}`).append(
          `<li>${data[i].lifts[j].name}: ${data[i].lifts[j].weight}${data[i].lifts[j].unit} Sets: ${data[i].lifts[j].sets} Reps: ${data[i].lifts[j].reps}</li>`
        );
      };
    };
  };
}

function getWorkouts() {
  logs = [];
  clearForm();
  $('#login').addClass('hidden');
  $('#signup').addClass('hidden');
  $('#instructions').addClass('hidden');
  fetch('/logs')
    .then(res => res.json())
    .then(resJson => {
      logs = resJson.filter(obj => obj.user === user);
      logs.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
      });
      displayWorkouts(logs);
    })
    .catch(err => {
      $('#log-buttons').append('<p class="alert">Something went wrong!</p>') 
      console.log(err)
    });
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
    $('#instructions').addClass('hidden');
    $('#workout-list').addClass('hidden');
    $('#user-signout').empty();
    $('#login-and-signup').empty().removeClass('hidden').append(`
      <form id="login" onsubmit="event.preventDefault(); makeCreds();">
        <h3>Login</h3>
        <label for="loginusername">Username</label>
        <input type="text" name="loginusername" id="loginusername" required><br/>
        <label for="loginpassword">Password</label>
        <input type="password" name="loginpassword" id="loginpassword" required><br/>
        <input type="submit" value="Login" id="js-login">
        <button type="button" onclick="guestLogin();">Login as guest</button>
        <div id="login-error">
        </div>
      </form>
      <form id="signup" onsubmit="event.preventDefault(); signUp();">
        <h3>Sign Up</h3>
        <label for="signupusername">Username</label>
        <input type="text" name="signupusername" id="signupusername" maxlength="16" required><br/>
        <label for="signuppassword">Password</label>
        <input type="password" name="signuppassword" id="signuppassword" minlength="8" maxlength="72" required><br/>
        <label for="passconfirm">Re-enter your password</label>
        <input type="password" name="passconfirm" id="passconfirm" minlength="8" maxlength="72" required><br/>
        <input type="submit" value="Join" id="js-signup">
        <div id="signup-error">
        </div>
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
  displayPage();
})