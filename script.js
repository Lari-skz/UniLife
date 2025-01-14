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

  // Resetăm formularul
  document.getElementById('signInForm').reset();
});

//unable opening a page until the user logs in
  function click() {
    inputname = $('#name').val();
    inputpassword =$('#pass').val();
    for (i in data.username )      //to match username with provided array
      { 
        name = data.username[i];
        for ( i in data.password){
            pass = data.password[i];
            if (inputname == name & inputpassword == pass ){
                window.open('welcome1.html','_self');
            }               
        }
    }
    if (inputname != name & inputpassword != pass ){
        alert("Wrong Password");
    }
}


