// General script
let typeBtns = document.querySelectorAll('.type-select');
let categoryBtns = document.querySelectorAll('#cat-btn');
let generateBtn = document.querySelector('.generate button');
let displayContainer = document.querySelector('.joke-displayer');
let savedContainer = document.querySelector('.container')
let savedJokeBtn = document.querySelector('.saved-jokes')
let closeContainerBtn = document.querySelector('.close')
let saveHeart = document.querySelector('.save i')
let cardrContainer = document.querySelector('.cards')
let warning = document.querySelector('.warning');
let deleteBtn = document.querySelector('.delete')
let langSelect = document.querySelector('.lang');
let cardNum = parseInt(localStorage.getItem("cardNum")) || 0;
let jokeType = ''; // Default joke type
let jokeCategory = ''; // Default joke category
let languageType = ''; // Default language
const apiUrl = "https://v2.jokeapi.dev/joke/";

// Initially both type is selected
typeBtns[0].classList.add('active');
jokeType = typeBtns[0].textContent.trim();

// Initially Any category is selected
categoryBtns[0].classList.add('active2');
jokeCategory = categoryBtns[0].textContent.trim();

languageType = 'en';

typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove 'active' class from all buttons
        typeBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        // Add 'active' class to the clicked button
        btn.classList.add('active');
        // Retrieve the text content of the clicked button and store it in jokeType
        jokeType = btn.textContent.split(' ').join('').toLowerCase();
        console.log('jokeType:', jokeType); // For testing purposes, you can log the jokeType
    });
});

categoryBtns.forEach(catBtn => {
    catBtn.addEventListener('click', () => {
        // Remove 'active2' class from all buttons
        categoryBtns.forEach(catBtn => {
            catBtn.classList.remove('active2');
        });
        // Add 'active2' class to the clicked button
        catBtn.classList.add('active2');
        // Retrieve the text content of the clicked button and store it in jokeCategory
        jokeCategory = catBtn.textContent.trim();
        console.log('jokeCategory:', jokeCategory); // For testing purposes, you can log the jokeCategory
    });
});


// api code

generateBtn.addEventListener('click', () => {
    // Fetch joke from JokeAPI
    setTimeout(() => {
        displayContainer.innerHTML = `<p>Loading Joke.....</p>`
    }, 200)
    fetchJoke();
});

async function fetchJoke() {
    try {
        const response = await fetch(`${apiUrl}/${jokeCategory}/${jokeType}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        displayJoke(data);
    } catch (error) {
        console.error('Error fetching joke:', error);
    }
}



// Declare fetchedJokeId in a scope accessible to both functions
let fetchedJokeId;

function displayJoke(data) {
    // Clear previous joke
    displayContainer.innerHTML = '';

    if (data.error) {
        displayContainer.innerHTML = `<p>${data.message}</p>`;
    } else {
        if (data.type === 'single') {
            displayContainer.innerHTML = `<p class="newjoke">${data.joke}</p>`;
        } else if (data.type === 'twopart') {
            displayContainer.innerHTML = `<p class="newjoke">${data.setup}</p><p class="newjoke">${data.delivery}</p>`;
        }
    }
    fetchedJokeId = data.id;
}



// Saved Jokes Displayer code

savedJokeBtn.addEventListener('click', () => {
    savedContainer.style.display = 'block'
    document.querySelector('.overlay').style.display = 'block'
})

closeContainerBtn.addEventListener('click', () => {
    savedContainer.style.display = 'none'
    document.querySelector('.overlay').style.display = 'none'
})

//onclick of heart button will create a card and store the data
saveHeart.addEventListener('click', () => {
    saveHeart.style.color = 'red';

    // Retrieve the saved jokes from local storage
    let savedJokes = JSON.parse(localStorage.getItem("savedJokes")) || [];

    // Check if the joke has already been saved
    if (savedJokes.includes(fetchedJokeId)) {
        warning.style.display = 'block';
        setTimeout(() => {
            warning.style.display = 'none';
        }, 2000)
    } else {
        // Retrieve the joke details from the displayContainer
        let jokeDetails = {
            id: fetchedJokeId,
            type: jokeType,
            category: jokeCategory,
            newJoke: Array.from(document.querySelectorAll('.newjoke')).map(p => p.textContent)
        };

        // Save the joke details to local storage
        savedJokes.push(fetchedJokeId);
        localStorage.setItem("savedJokes", JSON.stringify(savedJokes));
        cardCreation(jokeDetails);
        setTimeout(() => {
            saveHeart.style.color = '#7F7676';
        }, 1000);
    }
});

//delete card event
cardrContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains('delete')) {
        let createdCardId = event.target.getAttribute('data-card-id');
        deleteCard(createdCardId);
    }
});

// funtion for creating a card every time onclick of save button

function cardCreation(jokeDetails) {
    cardNum++;
    let cardElement = document.createElement('div')
    cardElement.classList.add("card");

    // Generate a unique ID for the card
    var cardId = cardNum; // You can use a better ID generation method

    // Create the card content
    cardElement.innerHTML = `
        <div class="head">
            <div class="number">${cardId}</div>
            <div class="joke-id">Joke ID : <span>${jokeDetails.id}</span></div>
        </div>
        <div class="joke-type">Joke Type : <span>${jokeDetails.type}</span></div>
        <div class="joke-category">Category : <span>${jokeDetails.category}</span></div>
        <div class="joke-place"><p>${jokeDetails.newJoke}</p></div>
        <div class="delete" data-card-id="${cardId}" >Delete</div>
    `;
    cardrContainer.appendChild(cardElement);

    // Store the card data in local storage
    localStorage.setItem(cardId, cardElement.outerHTML);

    // Update cardNum in local storage
    localStorage.setItem("cardNum", cardNum);
}

//function to delete the card
function deleteCard(cardId) {
    // Remove the card from the DOM
    var cardElement = document.querySelector(`[data-card-id="${cardId}"]`).closest('.card');
    cardElement.remove();

    // Remove the card data from local storage
    localStorage.removeItem(cardId);

    // Remove savedJokes data from local storage
    localStorage.removeItem('savedJokes');

    // Update cardNum and store it in local storage
    if (cardNum > 0) { // Check if cardNum is greater than 0 before decrementing
        cardNum--;
        localStorage.setItem("cardNum", cardNum);
    }
}


window.addEventListener('DOMContentLoaded', () => {
    // Retrieve keys from local storage and sort them based on cardId
    let keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        let key = parseInt(localStorage.key(i));
        if (!isNaN(key)) keys.push(key);
    }
    keys.sort((a, b) => a - b); // sort keys numerically

    // Insert the sorted card HTML strings into cardrContainer
    cardrContainer.innerHTML = keys.map(key => localStorage.getItem(key)).join('');
});

// Listen for errors
window.addEventListener('error', (event) => {
    console.error('Error occurred:', event.error);
});

// Listen for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});