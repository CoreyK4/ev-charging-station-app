function showToast(message) {
  const toastEl = document.getElementById('liveToast');
  const toastBodyEl = toastEl.querySelector('.toast-body');
  toastBodyEl.textContent = message;

  const toast = new bootstrap.Toast(toastEl, {
    delay: 2500,
  });
  toast.show();
}

// Register User
const registrationForm = document.getElementById('registrationForm');

registrationForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formInputs = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
    email: document.getElementById('email').value,
    first_name: document.getElementById('first_name').value,
    last_name: document.getElementById('last_name').value
  }

  fetch('/register', {
    method: 'POST',
    body: JSON.stringify(formInputs),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      const statusCode = response.status;

      return response.json().then(data => {
        return { statusCode, data };
      });
    })
    .then(({ statusCode, data }) => {
      if (statusCode === 201) {
        // User registered successfully
        showToast(data.message);
      } else if (statusCode === 409) {
        // User already exists
        showToast(data.message);
      } else if (statusCode === 500) {
        // Internal server error
        showToast(data.message);
      } else {
        // Other status code
        showToast('Unexpected status code:', statusCode);
      }
    })


});

// Login User
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formInputs = {
    username: document.getElementById('loginUsername').value,
    password: document.getElementById('loginPassword').value,
  }

  fetch('/login', {
    method: 'POST',
    body: JSON.stringify(formInputs),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      const statusCode = response.status;

      return response.json().then(data => {
        return { statusCode, data };
      });
    })
    .then(({ statusCode, data }) => {
      if (statusCode === 200) {
        // User registered successfully
        localStorage.setItem('user_id', data.user_id);
        window.dispatchEvent(new Event('storage'));
        showToast('You have successfully logged in!');
      } else if (statusCode === 401) {
        // Invalid username or password
        showToast(data.message);
      } else if (statusCode === 500) {
        // Internal server error
        showToast(data.message);
      } else {
        // Other status code
        showToast('Unexpected status code:', statusCode);
      }
    })


});