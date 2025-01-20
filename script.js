// Event Listener pentru Login
document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Previne trimiterea formularului

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Căutăm utilizatorul în lista simulată de utilizatori
  const user = users.find(user => user.email === email && user.password === password);
  const messageElement = document.getElementById('message');

  if (user) {
    messageElement.innerHTML = `<p style="color: green;">Autentificare reușită!</p>`;
    // Redirectare sau altă acțiune după logare
    // window.location.href = '/dashboard';  // Exemplu de redirectare
  } else {
    messageElement.innerHTML = `<p style="color: red;">Email sau parolă incorecte.</p>`;
  }
});

// Event Listener pentru Sign In (înregistrare)
document.getElementById('signInForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Previne trimiterea formularului

  const email = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const messageElement = document.getElementById('message');

  // Verificăm dacă parola și confirmarea parolei sunt egale
  if (password !== confirmPassword) {
    messageElement.innerHTML = `<p style="color: red;">Parolele nu se potrivesc.</p>`;
    return;
  }

  // Verificăm dacă email-ul nu este deja înregistrat
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    messageElement.innerHTML = `<p style="color: red;">Email-ul este deja utilizat.</p>`;
    return;
  }

  // Adăugăm utilizatorul nou în lista de utilizatori
  users.push({ email, password });
  messageElement.innerHTML = `<p style="color: green;">Înregistrare reușită! Acum te poți autentifica.</p>`;


  //unable opening a page until the user logs in
// LOGIN.js
function click() {
    inputname = $('#name').val();
    inputpassword =$('#pass').val();

    for (i in data.username )      //to match username with provided array
    { 
        name = data.username[i];

        for ( i in data.password){
            pass = data.password[i];

            if (inputname == name & inputpassword == pass ){
                //The user has successfully authenticated. We need to store this information
                //for the next page.
                sessionStorage.setItem("AuthenticationState", "Authenticated");
                
                //This authentication key will expire in 1 hour.
                sessionStorage.setItem("AuthenticationExpires", Date.now.addHours(1));
                
                //Push the user over to the next page.
                window.open('home1.html','_self');
            }               
        }
    }

    if (inputname != name & inputpassword != pass ){
        alert("Wrong Password");
    }
}

//addHours to a date.
//Credit to: Kennebec
//https://stackoverflow.com/questions/1050720/adding-hours-to-javascript-date-object
Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}

  // Resetăm formularul
  document.getElementById('signInForm').reset();
});

// Basic interactivity (optional)
document.addEventListener('DOMContentLoaded', () => {
    console.log("Page loaded successfully!");
    // Add further functionality as needed
});


