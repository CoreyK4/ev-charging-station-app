const registrationSubmitButton = document.getElementById('registrationForm');

registrationSubmitButton.addEventListener('submit', (e) => {
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
                alert(data.message);
              } else if (statusCode === 409) {
                // User already exists
                alert(data.message);
              } else if (statusCode === 500) {
                // Internal server error
                alert(data.message);
              } else {
                // Other status code
                alert('Unexpected status code:', statusCode);
              }
        })


});