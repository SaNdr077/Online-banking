// მელი - ანიმაცია რეგისტრაცია/ავტორიზაციის გვერდის
const container = document.getElementById('regContainerMain');
const formDiv = document.getElementById('regFormDiv');
formDiv.addEventListener('click', function(event) {
    event.stopPropagation();
    container.classList.add('paused');
});

container.addEventListener('click', function() {
    if (container.classList.contains('paused')) {
        container.classList.remove('paused');
    }
});

// მელი - ახალი უიზერუს კლასის კონსტრუქტორი
class User {
    constructor(fullName, email, password, cardNumber, cardType, cardDate) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.cardNumber = cardNumber;
        this.cardType = cardType;
        this.cardDate= cardDate;
        this.cardAmount = this.generateRandomAmount(8000, 10000);
        this.transactions = [];
    }

    // რენდომ ბალანსის გენერირება და მინიჭება იუზერისთვის
    generateRandomAmount(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// დარეგისტრირებული იუზერების შემოწმება, გამოიყენება ეს ცვლადი გამოიყენება ლოგ ინ ფუნქციაში
let users = JSON.parse(localStorage.getItem('users')) || [];

// დალოგინებული იუზერის ცვლადი ნალია, უტოლდება კონკრეტულ იუზერს როცა იუზერი დალოგინდება და ინახება სესიის სთორიჯში , რათა შემდეგ დალოგინებული იუზერის ინფორმაციას მივწვდეთ
let loggedInUser = null;

// იაკო & მელი - რეგისტრაცია-ავტორიზაცია
const loginDiv = document.getElementById('login');
const signUpDiv = document.getElementById('signup');

const regContainerMain = document.getElementById('regContainerMain');
const dashboardPage = document.getElementById('dashboardPage');

// ავტორიზაციის გამოტანა
function showLogin () {
    signUpDiv.style.display = 'none';
    loginDiv.style.display = 'block';
}

// რეგისტრაციის გამოტანა
function showSignUp () {
    signUpDiv.style.display = 'block';
    loginDiv.style.display = 'none';
}

//რეგისტრაცია
function signUp () {
    clearErrorMessages();

    const fullName = document.getElementById('signupFullName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const cardNumber = document.getElementById('signupCardNumber').value;
    const cardDate = document.getElementById('signupCardDate').value;
    const cardType = document.getElementById('signupCardType').value;

    // რეგექს პირობები ვალიდაციისთვის
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    const dateRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    const cardNumberRegex = /^\d{14}$/;

    let isValid = true;

    // შეტყობინებების გამოტანა ველების ვალიდაციისას
    if (!fullName) {
        showError('fullNameError', 'Full Name is required');
        isValid = false;
    }

    if (!email) {
        showError('emailError', 'Email is required');
        isValid = false;
    }

    if (!passwordRegex.test(password)) {
        showError('passwordError', 'Password must be at least 8 characters: 1 uppercase letter, 1 number, 1 symbol.');
        isValid = false;
    }

    if (!cardNumberRegex.test(cardNumber)) {
        showError('cardNumberError', 'Card Number must be exactly 14 digits.');
        isValid = false;
    }

    if (!dateRegex.test(cardDate)) {
        showError('cardDateError', 'Expiry date should be in MM/YY format.');
        isValid = false;
    }

    if (!cardType) {
        showError('cardTypeError', 'Please select a card type');
        isValid = false;
    }

    if (users.some(user => user.email === email)) {
        alert("Email is already registered.");
        return;
    }

    // თუ ველებმა გაიარა ვალიდაცია იქმენბა ახალი იუზერი კლასის გამოყენებით და ინფორმაცია ინახება ლოკალ სთორიჯში
    if (isValid) {
        const newUser = new User(fullName, email, password, cardNumber, cardType, cardDate);

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Sign Up Successful');
        showLogin();
    }
}

//ავტორიზაცია
function logIn () {
    clearErrorMessages();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    let isValid = true;

    // ველების ვალიდაცია
    if (!email) {
        showError('loginEmailError', 'Email is required');
        isValid = false;
    }

    if (!password) {
        showError('loginPasswordError', 'Password is required');
        isValid = false;
    }

    // თუ ველები შევსებულია
    if (email && password) {
        loggedInUser = users.find(user => user.email === email && user.password === password);

        // თუ იუზერზე ინფრო არ მოიძებნა
        if (!loggedInUser) {
            showError('loginGeneralError', 'Invalid email or password');
            isValid = false;
            return;
        }

        // ლოკალ სთორიჯში ვამოწმებთ იუზერებს და თუ არის იუზერი უკვე დარეგისტრირებული დალოგინებულ იუზერს ვუტოლებთ მას
        const usersFromLocalStorage = JSON.parse(localStorage.getItem('users')) || [];
        loggedInUser = usersFromLocalStorage.find(user => user.email === email && user.password === password);

        // სესიის სთორიჯში ვინახავთ დალოგინებულ იუზერს
        sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

        regContainerMain.style.display = 'none';
        dashboardPage.style.display = 'flex';

        // ვიძაცხებთ ფუნქციას რომელიც გამოიტანს დალოგინებული იუზერის ინფოს
        displayUserInfo();
    }

    return isValid
}

// ველების ვალიდაციის შეტყობინებების გამოტანა ველის ID-ს მიხედვით
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// ველების ვალიდაციის შეტყობინებების დამალვა
function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => {
        message.textContent = '';
        message.style.display = 'none';
    });
}

// ბარათის ნომრის სიგრძის ვალიდაცია
function restrictCardNumberLength(input) {
    input.value = input.value.replace(/\D/g, '');

    if (input.value.length > 14) {
        input.value = input.value.slice(0, 14);
    }
}

// ბარათის თარიღის ფორმატი
function formatCardDate(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
        input.value = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else {
        input.value = value;
    }
}

// მელი - დეშბორდი და ტრანზაქციები

const menuToggler = document.getElementById('menuToggler');
menuToggler.addEventListener('click', function () {
    if (dashboardMenu.style.display === 'none') {
        dashboardMenu.style.display = 'flex';
        dashboardMainSection.style.marginLeft = '17%'
        loansPage.style.marginLeft = '17%'
        contactPage.style.marginLeft = '17%'
        headHelpdDiv.style.marginLeft = '17%'
    } else {
        dashboardMenu.style.display = 'none';
        dashboardMainSection.style.marginLeft = '0'
        loansPage.style.marginLeft = '0'
        contactPage.style.marginLeft = '0'
        headHelpdDiv.style.marginLeft = '0'
    }
    
});

// dashboardMenu.addEventListener('click', function() {
    
// });

const selectCardDiv = document.getElementById('selectCardDiv');
const customSelectCards = document.getElementById('custom-select-cards');
const optionsDiv = customSelectCards.querySelector('.options');

// კონტაქტების დორპდაუნის თოგოლი (გახსნა. დამალვა კლიკზე)
selectCardDiv.addEventListener('click', function() {
    customSelectCards.classList.toggle('show-options');
});

const currencySymbol = document.getElementById('currencySymbol');
const usdFlag = document.getElementById('USD');
const gelFlag = document.getElementById('GEL');

// ვალუტის არჩევა
currencySymbol.textContent = '$';
usdFlag.addEventListener('click', function(event) {
    event.preventDefault();
    currencySymbol.textContent = '$';
});

gelFlag.addEventListener('click', function(event) {
    event.preventDefault();
    currencySymbol.textContent = '₾';
});

const selectContactDiv = document.getElementById('selectContactDiv');
const customSelectContacts = document.getElementById('custom-select-contacts');
const contactSearch = document.getElementById('contactSearch');
const contactOptions = document.getElementById('contactOptions');

// კონატქტების დროფდაუნი
selectContactDiv.addEventListener('click', function(event) {
    event.preventDefault();
    customSelectContacts.classList.toggle('show-options');
    contactSearch.value = '';
    contactSearch.focus();

    contactOptions.querySelectorAll('.option').forEach(option => {
        option.style.display = 'block';
    });
});

// კონატქტების დროფდაუნის ძიება
contactSearch.addEventListener('input', function(event) {
    event.preventDefault();
    const query = contactSearch.value.toLowerCase();

    contactOptions.querySelectorAll('.option').forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(query) ? 'block' : 'none';
    });
});

// კონატქტის არჩევა
contactOptions.addEventListener('click', function(event) {
    event.preventDefault();
    const option = event.target.closest('.option');
    if (option) {
        const selected = option.querySelector('span').textContent;
        selectContactDiv.innerHTML = `${selected}`;
        customSelectContacts.classList.remove('show-options');
        contactSearch.value = '';
    }
});

// კონტაქტების დროფდაუნის დახურვა მის გარეთ დაჭერისას
document.addEventListener('click', function(event) {
    if (!customSelectContacts.contains(event.target)) {
        customSelectContacts.classList.remove('show-options');
        contactSearch.value = '';
        contactOptions.querySelectorAll('.option').forEach(option => {
            option.style.display = 'block';
        });
    }
});

// იუზერის ინფორმაციის გამოტანა
function displayUserInfo() {
    // სესიის სტორიჯიდან წამოღება იუზერის ინფოების
    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    
    if (user) {
        // ბარათის მონაცემები
        document.getElementById('cardHolder').innerText = user.fullName;
        document.getElementById('iban').innerText = `**** ${user.cardNumber.slice(-4)}`;
        document.getElementById('cardDate').innerText = user.cardDate;
        document.getElementById('cardType').innerText = user.cardType;

        const firstName = user.fullName.split(' ')[0];
        const userNameGreet = document.getElementById('userNameGreet');
        userNameGreet.innerHTML = `${firstName}!`;

        // არსებული ბარათები
        selectCardDiv.innerHTML = `${user.cardType} <span>$${user.cardAmount}</span>`;

        optionsDiv.innerHTML = `
            <div class="option">
                <span>${user.cardType}</span>
                <span>$${user.cardAmount}</span>
            </div>`
        ;
        
        // არსებული ბარათებიდან ბარათის არჩევის ფუნქცია
        optionsDiv.querySelector('.option').addEventListener('click', function() {
            selectCardDiv.innerHTML = `${user.cardType} <span>$${user.cardAmount}</span>`;
            customSelectCards.classList.remove('show-options');
        });

        // იუზერის შენახული ტრანზაქციების რენდერი
        renderTransactions(user.transactions);
    } else {
        window.location.href = 'index.html';
    }
}

// ტრანზაქციის ფუნქციის გამოძახება
document.getElementById('sendMoneyBtn').addEventListener('click', function(e) {
    e.preventDefault();
    sendMoney();
});

// რენდომ ფერი კონატქტებისთვის
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// ტრანზაქციების რენდერი
function renderTransactions(transactions) {
    const transacList = document.getElementById('dashboardTransacList');
    transacList.innerHTML = "";

    transactions.forEach(transaction => {
        const transactionList = document.getElementById('dashboardTransacList');
        const newTransaction = document.createElement('p');newTransaction.classList.add('transaction-item');

        newTransaction.innerHTML = `
        <span><span class="contactImg"></span></span>
        <span class="contactName">${transaction.recipient}</span>
        <span class="transacDate">${transaction.date}</span>
        <span class="transacCard">${transaction.cardNumber}</span>
        <span class="transacAmount"><span class="transacOperator">-</span>$${transaction.amount}</span>
        <span><span class="transacStatus">${transaction.status}</span></span>`;

        transactionList.appendChild(newTransaction);

        const transacStatus = newTransaction.querySelector('.transacStatus');

        if(transacStatus.textContent === 'Success') {
            transacStatus.style.backgroundColor = '#C0E9D8';
            transacStatus.style.color = '#02710C';
        } else {
            transacStatus.style.backgroundColor = '#FFF1ED';
            transacStatus.style.color = '#FFAA90';
        }
        
        
        const transactName = newTransaction.querySelector('.contactName');
        
        const initials = transactName.textContent.split(' ').map(initial => initial[0].toUpperCase()).join('');
        const contactImg = newTransaction.querySelector('.contactImg');
        contactImg.textContent = initials;

        const randomColor = getRandomColor();
        contactImg.style.backgroundColor = randomColor;
    });
}

// თარიღის წამოღება ტრანზაქციის დროს და ფორმატი
function formatDate(date) {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

// ტრანზაქციის შესრულება
function sendMoney() {
    const amount = document.getElementById('sendAmount').value;
    const recipient = selectContactDiv.textContent;

    // ველების ვალიდაცია
    if (!amount || !recipient) {
        alert("Please enter an amount and select a recipient.");
        return;
    }

    // დალოგინებული იუზერის ნახვა სესიის სთორიჯში
    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));

    let status;

    // ბალანსე არსებული თანხის ვალიდაცია ტრანზაქციის სტატუსისთვის
    if (user.cardAmount >= amount) {
        status = 'Success';
        user.cardAmount -= amount;
    } else {
        status = 'Declined';
    }

    // ტრანზაქციის ობიექტის შექმნა
    const transaction = {
        recipient,
        date: formatDate(new Date()),
        amount,
        status: status
    };

    // ტრანზაქციის ობიექტის დამატება იუზერის ობიექტში
    user.transactions.push(transaction);

    // იუსერის ობიექტის განახლება ახალი ინფოთი (ტრანზაქციები) სესიის და ლოკალ სთორიჯებში
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === user.email);
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));

    // ტრანზაქციების რენდერი რათა მოხდეს ახალი ინფოს გამოტანაც როცა შენახული ტრანზაქციებიც არსებობს
    renderTransactions(user.transactions);

    // ბალანსის განახლება
    updateCardBalanceDisplay();
}

// ბალანსის განახლება ტრანზაქციის შემდგომ
function updateCardBalanceDisplay() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    selectCardDiv.innerHTML = `${loggedInUser.cardType} <span>$${loggedInUser.cardAmount}</span>`;
}

// გასვლა
const logOut = document.getElementById('logOut');
logOut.addEventListener('click', (event) => {
    event.preventDefault();

    regContainerMain.style.display = 'flex';
    dashboardPage.style.display = 'none';
})





// მელი - სექციების დამალვა/გამოჩენა
const dashboardMainSection = document.getElementById('dashboardMainSection');
const contactPage = document.getElementById('contactPage');
const loansPage = document.getElementById('loansPage');

// კონტაქტებზე გადასვლა
const contactPageLink = document.getElementById('contactPageLink');
contactPageLink.addEventListener('click', (event) => {
    event.preventDefault();
    dashboardMainSection.style.display = 'none';
    contactPage.style.display = 'block';
    loansPage.style.display = 'none';
    headHelpdDiv.style.display = 'none';
})

// დეშბორდზე გადასვლა
const dashboardPageLink = document.getElementById('dashboardPageLink');
dashboardPageLink.addEventListener('click', (event) => {
    event.preventDefault();
    dashboardMainSection.style.display = 'flex';
    contactPage.style.display = 'none';
    loansPage.style.display = 'none';
    headHelpdDiv.style.display = 'none';
})

// სესხებზე გადასვლა
const loadPageLink = document.getElementById('loadPageLink');
loadPageLink.addEventListener('click', (event) => {
    event.preventDefault();
    dashboardMainSection.style.display = 'none';
    contactPage.style.display = 'none';
    loansPage.style.display = 'block';
    headHelpdDiv.style.display = 'none';
})

// იაკო - სესხების გვერდის ფუნქციონალი
const modal = document.getElementById('loansPage');
const overlay = document.getElementById('overlay');
const confirmBtn = document.getElementById('confirmLoan');
const cancelBtn = document.getElementById('cancelLoan');
const loanButtons = document.querySelectorAll('.loan-request-button');

const confirmedLoans = new Set();


const loanData = new Map([
    [1, { discount: '30%', description: 'მოითხოვე ავტოლიზინგი და დაზოგე თანხა' }],
    [2, { discount: '20%', description: 'მოითხოვე სამომხმარებლო სესხი და დაზოგე თანხა' }],
    [3, { discount: '10%', description: 'მოითხოვე ბიზნეს სესხი და დაზოგე თანხა' }]
]);

function showModal(loanId) {
    const loan = loanData.get(loanId);
    if (loan) {
        modal.style.display = 'block';
        overlay.style.display = 'block';

        confirmBtn.onclick = () => confirmLoan(loanId);
    }
}

function hideModal() {
    modal.style.display = 'none';
    overlay.style.display = 'none';
}

function confirmLoan(loanId) {
    const amount = document.getElementById('loanAmount').value;
    const currency = document.getElementById('currency').value;
    if (amount > 0) {
        alert(`სესხის მოთხოვნა წარმატებით დასრულდა! თქვენ მოითხოვეთ ${amount} ${currency}. დადებითი პასუხის შემთხვევაში შეტყობინება გამოიგზავნება თქვენს ტელეფონის ნომერზე 593 56 4* **`);
        confirmedLoans.add(loanId);
        hideModal();
    } else {
        alert('გთხოვთ შეიყვანოთ სწორი თანხა.');
    }
}

loanButtons.forEach(button => {
    button.addEventListener('click', function() {
        const loanId = parseInt(this.closest('.loan-card').getAttribute('data-loan-id'));
        showModal(loanId);
    });
});

cancelBtn.addEventListener('click', hideModal);
overlay.addEventListener('click', hideModal);

// აიკო - კონტაქტების გვერდი და მისი ფუნქციონალი
const contactNames = new Set();
const contactMap = new Map();

const addContactBtn = document.getElementById('addContactBtn');
const contactForm = document.getElementById('contactForm');
const submitContactBtn = document.getElementById('submitContactBtn');
const contactList = document.getElementById('contactList');

addContactBtn.addEventListener('click', () => {
    contactForm.style.display = contactForm.style.display === 'none' ? 'block' : 'none';
});

submitContactBtn.addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const accountNumber = document.getElementById('accountNumber').value.trim();

    if (name && accountNumber) {
        if (contactNames.has(name)) {
            alert('Contact with this name already exists.');
            return;
        }

        contactNames.add(name);
        contactMap.set(name, { accountNumber });

        const initials = name.split(' ').map(n => n[0]).join('');

        const contactCard = document.createElement('div');
        contactCard.className = 'contact-card';

        const contactInitials = document.createElement('div');
        contactInitials.className = 'contact-initials';
        contactInitials.textContent = initials;

        const contactInfo = document.createElement('div');
        contactInfo.className = 'contact-info';
        contactInfo.innerHTML = `<p>${name}</p><p>*****${accountNumber.slice(-5)}</p>`;

        const deleteButton = document.createElement('span');
        deleteButton.className = 'delete-contact-btn';
        deleteButton.textContent = '✖';

        contactCard.appendChild(contactInitials);
        const randomColor = getRandomColor();
        contactInitials.style.backgroundColor = randomColor;
        contactCard.appendChild(contactInfo);
        contactCard.appendChild(deleteButton);

        contactList.appendChild(contactCard);

        document.getElementById('name').value = '';
        document.getElementById('accountNumber').value = '';

        contactForm.style.display = 'none';
    } else {
        alert('Please fill in both fields.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.content').addEventListener('click', function (event) {
        if (event.target.classList.contains('delete-contact-btn')) {
            const contactCard = event.target.closest('.contact-card');
            const contactName = contactCard.querySelector('.contact-info p').textContent.split('\n')[0];

            contactNames.delete(contactName);
            contactMap.delete(contactName);

            contactCard.remove();
        }
    });
});




//help

const help = document.getElementById('help')
const headHelpdDiv = document.getElementById('headhelpdiv')
help.addEventListener('click', function(){
    dashboardMainSection.style.display = 'none';
    headHelpdDiv.style.display = 'flex'
})

const RegistrationPage = document.getElementById('RegistrationPage')
RegistrationPage.addEventListener('click', function(){
    dashboardPage.style.display = 'none';
    regContainerMain.style.display = 'flex';
})

// ენის შეცვლა

const translations = {
    en: {
        sendMoneyH3: 'Send Money',
        cards:'Cards',
        heloo:'Heloo',
        dashboardPageLink: 'Dashboard',
        contactPageLink: 'Contacts',
        loadPageLink: 'Loans',
        logOut: 'Log Out',
        getHelp: 'Get Help',
        languages: 'Languages',
        myCard: 'My Card',
        enterAmount: 'Enter the amount',
        sendMoney: 'Send Money',
        transactions: 'Transactions',
        contacts: 'Contacts',
        addContact: 'Add Contact',
        addNewContact: 'Add New Contact',
        name: 'Name',
        accountNumber: 'Account Number',
        submitContact: 'Add Contact',
        loanDiscount30: '30% Discount',
        loanDiscount20: '20% Discount',
        loanDiscount10: '10% Discount',
        applyForLoan: 'Apply',
        confirmLoan: 'Confirm',
        cancelLoan: 'Cancel',
        searchPlaceholder: 'Search...',
        selectCard: 'Select Card',
        selectContact: 'Transfer to:',
        title: "Online Banking Help Center",
        gettingStarted: "Getting Started",
        loginTitle: "How do I log in?",
        loginInstruction: "enter your username and password, and follow the login steps.",
        managingAccount: "Managing Your Account",
        checkBalanceTitle: "How can I check my account balance?",
        checkBalanceInstruction: "Log in and go to the 'Accounts' tab to view your current balance and recent transactions.",
        transferMoneyTitle: "How do I transfer money between accounts?",
        transferMoneyInstruction: "Navigate to the 'Transfers' section, select the accounts, and complete the transaction.",
        payBillsTitle: "How do I pay bills online?",
        payBillsInstruction: "Go to the 'Bill Pay' section, enter the bill details, and submit your payment.",
        securityPrivacy: "Security and Privacy",
        enable2faTitle: "How do I enable two-factor authentication (2FA)?",
        enable2faInstruction: "Go to 'Security Settings' and follow the steps to enable 2FA for added security.",
        updateContactTitle: "How do I update my contact information?",
        updateContactInstruction: "Go to 'Profile', update your contact details, and save the changes.",
        fraudulentActivityTitle: "What should I do if I suspect fraudulent activity?",
        fraudulentActivityInstruction: "Contact support immediately and review your recent transactions.",
        technicalSupport: "Technical Support",
        cantLoginTitle: "Why can’t I log in?",
        cantLoginInstruction: "Check your username, password, and internet connection. If the issue persists, contact support.",
        pageLoadTitle: "What if the page doesn’t load?",
        pageLoadInstruction: "Try refreshing the page or switching browsers. Clear your browser cache if needed.",
        subtitle: "Find answers to your questions below.",
    },
    ka: {
        sendMoneyH3: 'გადარიცხეთ თანხა',
        cards:'ბარათი',
        heloo:'გამარჯობა',
        dashboardPageLink: 'დეშბორდი',
        contactPageLink: 'კონტაქტები',
        loadPageLink: 'სესხები',
        logOut: 'გასვლა',
        getHelp: 'დახმარება',
        languages: 'ენები',
        myCard: 'ჩემი ბარათი',
        enterAmount: 'შეიყვანეთ თანხა',
        sendMoney: 'გადარიცხეთ თანხა',
        transactions: 'ტრანზაქციები',
        contacts: 'კონტაქტები',
        addContact: 'კონტაქტის დამატება',
        addNewContact: 'ახალი კონტაქტის დამატება',
        name: 'სახელი',
        accountNumber: 'ანგარიშის ნომერი',
        submitContact: 'კონტაქტის დამატება',
        loanDiscount30: '30% ფასდაკლება',
        loanDiscount20: '20% ფასდაკლება',
        loanDiscount10: '10% ფასდაკლება',
        applyForLoan: 'მოითხოვე',
        confirmLoan: 'დადასტურება',
        cancelLoan: 'გაუქმება',
        searchPlaceholder: 'ძებნა...',
        selectCard: 'ბარათის არჩევა',
        selectContact: 'გადარიცხეთ:',
        title: "ონლაინ საბანკო დახმარების ცენტრი",
        gettingStarted: "დაწყება",
        loginTitle: "როგორ შევიდე სისტემაში?",
        loginInstruction: "გადადით ავტორიზაციის გვერდზე, შეიყვანეთ თქვენი სახელი და პაროლი და მიყევით ინსტრუქციებს.",
        managingAccount: "თქვენი ანგარიშის მართვა",
        checkBalanceTitle: "როგორ შევამოწმო ჩემი ბალანსი?",
        checkBalanceInstruction: "შედით სისტემაში და გადადით 'ანგარიშები' ტაბზე, რათა ნახოთ თქვენი მიმდინარე ბალანსი.",
        transferMoneyTitle: "როგორ გადავიტანო ფული ანგარიშებს შორის?",
        transferMoneyInstruction: "გადადით 'ტრანსფერების' განყოფილებაში და დაასრულეთ ტრანზაქცია.",
        payBillsTitle: "როგორ გადავიხადო გადასახადები ონლაინ?",
        payBillsInstruction: "გადადით 'გადასახადების გადახდის' განყოფილებაში და შეიტანეთ დეტალები.",
        securityPrivacy: "უსაფრთხოება და კონფიდენციალურობა",
        enable2faTitle: "როგორ ჩავრთო ორფაქტორიანი აუტენტიფიკაცია (2FA)?",
        enable2faInstruction: "გადადით 'უსაფრთხოების პარამეტრებში' და მიჰყევით ინსტრუქციებს.",
        updateContactTitle: "როგორ განვაახლო საკონტაქტო ინფორმაცია?",
        updateContactInstruction: "გადადით 'პროფილში', განაახლეთ ინფორმაცია და შეინახეთ.",
        fraudulentActivityTitle: "რა გავაკეთო, თუ ვვარაუდობ თაღლითობას?",
        fraudulentActivityInstruction: "დაუკავშირდით მხარდაჭერას და გადაამოწმეთ თქვენი ბოლო ტრანზაქციები.",
        technicalSupport: "ტექნიკური მხარდაჭერა",
        cantLoginTitle: "რატომ ვერ შევდივარ სისტემაში?",
        cantLoginInstruction: "შეამოწმეთ სახელი, პაროლი და ინტერნეტი. თუ პრობლემა გრძელდება, დაუკავშირდით მხარდაჭერას.",
        pageLoadTitle: "რა გავაკეთო, თუ გვერდი არ იტვირთება?",
        pageLoadInstruction: "განაახლეთ გვერდი ან შეცვალეთ ბრაუზერი. ასევე, ცადეთ ქეშის გასუფთავება.",
        subtitle: "იპოვეთ კითხვებზე პასუხები ქვემოთ.",
    },
    ru: {
        sendMoneyH3: 'Отправить деньги',
        cards: 'карты',
        heloo: 'Привет',
        dashboardPageLink: 'Панель управления',
        contactPageLink: 'Контакты',
        loadPageLink: 'Займы',
        logOut: 'Выйти',
        getHelp: 'Помощь',
        languages: 'языки',
        myCard: 'Моя карта',
        enterAmount: 'Введите сумму',
        sendMoney: 'Отправить деньги',
        transactions: 'Транзакции',
        contacts: 'Контакты',
        addContact: 'Добавить контакт',
        addNewContact: 'Добавить новый контакт',
        name: 'Имя',
        accountNumber: 'Номер счета',
        submitContact: 'Добавить контакт',
        loanDiscount30: '30% скидка',
        loanDiscount20: '20% скидка',
        loanDiscount10: '10% скидка',
        applyForLoan: 'Подать заявку',
        confirmLoan: 'Подтвердить',
        cancelLoan: 'Отменить',
        searchPlaceholder: 'Поиск...',
        selectCard: 'Выберите карту',
        selectContact: 'Перевести на:',
        title: "Центр помощи онлайн-банкинга",
        gettingStarted: "Начало работы",
        loginTitle: "Как войти в систему?",
        loginInstruction: "Перейдите на страницу входа, введите свое имя пользователя и пароль и следуйте инструкциям.",
        managingAccount: "Управление вашим аккаунтом",
        checkBalanceTitle: "Как я могу проверить баланс?",
        checkBalanceInstruction: "Войдите в систему и перейдите на вкладку «Счета», чтобы увидеть текущий баланс и недавние транзакции.",
        transferMoneyTitle: "Как перевести деньги между счетами?",
        transferMoneyInstruction: "Перейдите в раздел «Переводы», выберите счета и завершите транзакцию.",
        payBillsTitle: "Как оплатить счета онлайн?",
        payBillsInstruction: "Перейдите в раздел «Оплата счетов», введите данные счета и отправьте платеж.",
        securityPrivacy: "Безопасность и конфиденциальность",
        enable2faTitle: "Как включить двухфакторную аутентификацию (2FA)?",
        enable2faInstruction: "Перейдите в «Настройки безопасности» и выполните шаги для включения 2FA.",
        updateContactTitle: "Как обновить контактную информацию?",
        updateContactInstruction: "Перейдите в «Профиль», обновите свои контактные данные и сохраните изменения.",
        fraudulentActivityTitle: "Что делать, если я подозреваю мошенничество?",
        fraudulentActivityInstruction: "Немедленно свяжитесь с поддержкой и проверьте свои последние транзакции.",
        technicalSupport: "Техническая поддержка",
        cantLoginTitle: "Почему я не могу войти в систему?",
        cantLoginInstruction: "Проверьте свое имя пользователя, пароль и подключение к Интернету. Если проблема не устранена, обратитесь в поддержку.",
        pageLoadTitle: "Что делать, если страница не загружается?",
        pageLoadInstruction: "Попробуйте обновить страницу или сменить браузер. Очистите кэш браузера, если это необходимо.",
        subtitle: "Найдите ответы на ваши вопросы ниже.",
    }
};

function setLanguage(lang) {

    
    document.querySelector('#myCard div p').textContent= translations[lang].name;
    document.querySelector('#sendMoney h3').textContent = translations[lang].sendMoneyH3;
    document.getElementById('card').textContent = translations[lang].cards;
    document.getElementById('heloo').textContent = translations[lang].heloo;
    document.getElementById('dashboardPageLink').textContent = translations[lang].dashboardPageLink;
    document.getElementById('contactPageLink').textContent = translations[lang].contactPageLink;
    document.getElementById('loadPageLink').textContent = translations[lang].loadPageLink;
    document.getElementById('logOut').textContent = translations[lang].logOut;
    document.getElementById('help').textContent = translations[lang].getHelp;
    document.getElementById('language').textContent = translations[lang].languages;
    document.querySelector('#dashboardMainSection div h3').textContent = translations[lang].myCard;
    document.querySelector('#sendMoney label[for="sendAmount"]').textContent = translations[lang].enterAmount;
    document.getElementById('sendMoneyBtn').textContent = translations[lang].sendMoney;
    document.querySelector('#transactionsContainer h3').textContent = translations[lang].transactions;
    document.querySelector('#contactPage h3').textContent = translations[lang].contacts;
    document.getElementById('addContactBtn').textContent = translations[lang].addContact;
    document.querySelector('#contactForm h2').textContent = translations[lang].addNewContact;
    document.getElementById('accountNumber').placeholder = translations[lang].accountNumber;
    document.getElementById('submitContactBtn').textContent = translations[lang].submitContact;
    document.querySelectorAll('.loan-card .loan-info h2')[0].textContent = translations[lang].loanDiscount30;
    document.querySelectorAll('.loan-card .loan-info h2')[1].textContent = translations[lang].loanDiscount20;
    document.querySelectorAll('.loan-card .loan-info h2')[2].textContent = translations[lang].loanDiscount10;
    document.querySelectorAll('.loan-card .loan-request-button')[0].textContent = translations[lang].applyForLoan;
    document.querySelectorAll('.loan-card .loan-request-button')[1].textContent = translations[lang].applyForLoan;
    document.querySelectorAll('.loan-card .loan-request-button')[2].textContent = translations[lang].applyForLoan;
    document.getElementById('confirmLoan').textContent = translations[lang].confirmLoan;
    document.getElementById('cancelLoan').textContent = translations[lang].cancelLoan;
    document.getElementById('contactSearch').placeholder = translations[lang].searchPlaceholder;
    document.getElementById('selectCardDiv').textContent = translations[lang].selectCard;
    document.getElementById('selectContactDiv').textContent = translations[lang].selectContact;
    document.getElementById("title").textContent = translations[lang].title;
    document.getElementById("subtitle").textContent = translations[lang].subtitle;
    document.getElementById("gettingStarted").textContent = translations[lang].gettingStarted;
    document.getElementById("loginTitle").textContent = translations[lang].loginTitle;
    document.getElementById("loginInstruction").textContent = translations[lang].loginInstruction;
    document.getElementById("managingAccount").textContent = translations[lang].managingAccount;
    document.getElementById("checkBalanceTitle").textContent = translations[lang].checkBalanceTitle;
    document.getElementById("checkBalanceInstruction").textContent = translations[lang].checkBalanceInstruction;
    document.getElementById("transferMoneyTitle").textContent = translations[lang].transferMoneyTitle;
    document.getElementById("transferMoneyInstruction").textContent = translations[lang].transferMoneyInstruction;
    document.getElementById("payBillsTitle").textContent = translations[lang].payBillsTitle;
    document.getElementById("payBillsInstruction").textContent = translations[lang].payBillsInstruction;
    document.getElementById("securityPrivacy").textContent = translations[lang].securityPrivacy;
    document.getElementById("enable2faTitle").textContent = translations[lang].enable2faTitle;
    document.getElementById("enable2faInstruction").textContent = translations[lang].enable2faInstruction;
    document.getElementById("updateContactTitle").textContent = translations[lang].updateContactTitle;
    document.getElementById("updateContactInstruction").textContent = translations[lang].updateContactInstruction;
    document.getElementById("fraudulentActivityTitle").textContent = translations[lang].fraudulentActivityTitle;
    document.getElementById("fraudulentActivityInstruction").textContent = translations[lang].fraudulentActivityInstruction;
    document.getElementById("technicalSupport").textContent = translations[lang].technicalSupport;
    document.getElementById("cantLoginTitle").textContent = translations[lang].cantLoginTitle;
    document.getElementById("cantLoginInstruction").textContent = translations[lang].cantLoginInstruction;
    document.getElementById("pageLoadTitle").textContent = translations[lang].pageLoadTitle;
    document.getElementById("pageLoadInstruction").textContent = translations[lang].pageLoadInstruction;
}


document.getElementById('langEn').addEventListener('click', () => setLanguage('en'));
document.getElementById('langKa').addEventListener('click', () => setLanguage('ka'));
document.getElementById('langRu').addEventListener('click', () => setLanguage('ru'));

const language = document.getElementById('language')
const languageSelector = document.getElementById('languageSelector')
let bool = false
const btnlang = document.getElementsByClassName('btnlang')
language.addEventListener('click', function(){
    bool = !bool
    if(bool==true){
    languageSelector.style.display ='flex'
    }else{languageSelector.style.display ='none'}
})

for(let element of btnlang){
    element.addEventListener('click', function(){
        languageSelector.style.display ='none'
    })
}