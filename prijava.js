const form = document.getElementById('form')
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeatpassword_input = document.getElementById('repeat-password-input');
const greske_poruka = document.getElementById('greske-poruka');

// console.log('Firstname:', firstname_input);
// console.log('Email:', email_input);
// console.log('Password:', password_input);



form.addEventListener('submit', (e) => {

    let greske = [];


    if (firstname_input) {
        //ako smo u registraciji(signup)
        greske = GetSignupFormErrors(firstname_input.value, email_input.value, password_input.value, repeatpassword_input.value);

    }
    else {
        //ako smo u prijavi(login)
        greske = GetLoginFormErrors(email_input.value, password_input.value);
    }

    if (greske.length > 0) {
        e.preventDefault();
        greske_poruka.innerText = greske.join(" ");
    }
})



function GetSignupFormErrors(firstname, email, password, repeatPassword) {
    let greske = [];

    if (firstname === "" || firstname == null) {
        greske.push('Unesi ime.');
        firstname_input.parentElement.classList.add('incorrect');
    }
    if (email === "" || email == null) {
        greske.push('Unesi email.\n');
        email_input.parentElement.classList.add('incorrect');
    }
    if (password === "" || password == null) {
        greske.push('Unesi lozinku.');
        password_input.parentElement.classList.add('incorrect');
    }
    if (password !== repeatPassword) {
        greske.push('Lozinke se ne podudaraju.')
        password_input.parentElement.classList.add('incorrect');
        repeatpassword_input.parentElement.classList.add('incorrect');
    }
    if (!validPassword(password)) {
        greske.push('Lozinka pre jednostavna!');
        password_input.parentElement.classList.add('incorrect');
        repeatpassword_input.parentElement.classList.add('incorrect');
    }
    if (!password.contains)
        return greske;
}

const allInputs = [firstname_input, email_input, password_input, repeatpassword_input].filter(input => input != null);//greske u konzoli zbog viska elemenata u login stranici

allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
        }
    })
})

function GetLoginFormErrors(email, password) {
    let greske = [];

    if (email === "" || email == null) {
        greske.push('Unesi email.');
        email_input.parentElement.classList.add('incorrect');
    }
    if (password === "" || password == null) {
        greske.push('Unesi lozinku.');
        password_input.parentElement.classList.add('incorrect');
    }


    return greske;
}



function validPassword(password) {
    const posebni = /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

    if (password == "")
        return false;

    if (password.length < 8) {
        return false;
    }
    if (!posebni.test(password)) {
        return false;
    }
    if (!/\d/.test(password)) {
        return false;
    }
    return true;
}

//exports.validPassword = validPassword;



