// Get elements
const addButton = document.getElementById('addButton');
const resetButton = document.getElementById('resetButton');
const totalCalories = document.getElementById('totalCalories');
const totalProtein = document.getElementById('totalProtein');
const totalCarbs = document.getElementById('totalCarbs');
const totalFat = document.getElementById('totalFat');
const cardContainer = document.getElementById('cardContainer');
const dateFilter = document.getElementById('dateFilter');

const weightEntryRadio = document.getElementById('weightEntry');
const directEntryRadio = document.getElementById('directEntry');
const weightInputsDiv = document.getElementById('weightInputs');
const directInputsDiv = document.getElementById('directInputs');

const foodWeight = document.getElementById('foodWeight');
const foodKcal = document.getElementById('foodKcal');
const foodProtein = document.getElementById('foodProtein');
const foodCarbs = document.getElementById('foodCarbs');
const foodFat = document.getElementById('foodFat');

const directKcal = document.getElementById('directKcal');
const directProtein = document.getElementById('directProtein');
const directCarbs = document.getElementById('directCarbs');
const directFat = document.getElementById('directFat');

const editGoalsButton = document.getElementById('editGoalsButton');
const goalCalories = document.getElementById('goalCalories');
const goalProtein = document.getElementById('goalProtein');
const goalCarbs = document.getElementById('goalCarbs');
const goalFat = document.getElementById('goalFat');
const goalCaloriesDisplay = document.getElementById('goalCaloriesDisplay');
const goalProteinDisplay = document.getElementById('goalProteinDisplay');
const goalCarbsDisplay = document.getElementById('goalCarbsDisplay');
const goalFatDisplay = document.getElementById('goalFatDisplay');

// Audio element
let audio = document.getElementById('clickSound');
if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'clickSound';
    audio.src = 'e.mp3'; // **REPLACE WITH YOUR SOUND FILE PATH**
    document.body.appendChild(audio);
}

// Goals
let goals = JSON.parse(localStorage.getItem('goals')) || {
    kcal: 2650,
    protein: 194,
    carbs: 288,
    fat: 80
};

function displayGoals() {
    goalCalories.textContent = goals.kcal;
    goalProtein.textContent = goals.protein;
    goalCarbs.textContent = goals.carbs;
    goalFat.textContent = goals.fat;
    goalCaloriesDisplay.textContent = goals.kcal;
    goalProteinDisplay.textContent = goals.protein;
    goalCarbsDisplay.textContent = goals.carbs;
    goalFatDisplay.textContent = goals.fat;
}

// Food entries
let foodEntries = JSON.parse(localStorage.getItem('foodEntries')) || [];

function addFoodEntry(date, weight, kcal, protein, carbs, fat, isDirect) {
    if (!date) {
        alert("Please select a date.");
        return;
    }
    if (isDirect && (isNaN(kcal) || isNaN(protein) || isNaN(carbs) || isNaN(fat))) {
        alert("Please enter valid numeric values for direct entry.");
        return;
    }
    if (!isDirect && (isNaN(weight) || isNaN(kcal) || isNaN(protein) || isNaN(carbs) || isNaN(fat))) {
        alert("შე ბოზო ჯერ მონაცემები შეიყვანე და მერე დამაჭირე! არ გამიტრაკაა!"); // Keep this if you want :)
        return;
    }

    const entry = { date, weight, kcal, protein, carbs, fat, isDirect };
    foodEntries.push(entry);
    localStorage.setItem('foodEntries', JSON.stringify(foodEntries));
    updateTotals();
    displayEntries();

    if (isDirect) {
        directKcal.value = '';
        directProtein.value = '';
        directCarbs.value = '';
        directFat.value = '';
    } else {
        foodWeight.value = '';
        foodKcal.value = '';
        foodProtein.value = '';
        foodCarbs.value = '';
        foodFat.value = '';
    }
}

function processInput() {
    const today = new Date().toISOString().split('T')[0];
    let isDirect = directEntryRadio.checked;

    playSound(); // Play sound

    if (isDirect) {
        const kcal = parseFloat(directKcal.value);
        const protein = parseFloat(directProtein.value);
        const carbs = parseFloat(directCarbs.value);
        const fat = parseFloat(directFat.value);
        addFoodEntry(today, null, kcal, protein, carbs, fat, true);
    } else {
        const weight = parseFloat(foodWeight.value);
        const kcal = parseFloat(foodKcal.value);
        const protein = parseFloat(foodProtein.value);
        const carbs = parseFloat(foodCarbs.value);
        const fat = parseFloat(foodFat.value);
        addFoodEntry(today, weight, kcal, protein, carbs, fat, false);
    }
}

function playSound() {
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.error("Error playing sound:", error);
            alert("Sound could not be played. Please check your browser settings or try a different sound file.");
        });
    }
}

function updateTotals() {
    let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    const filterDate = dateFilter.value;

    foodEntries.forEach(entry => {
        if (!filterDate || entry.date === filterDate) {
            if (entry.isDirect) {
                totals.kcal += entry.kcal;
                totals.protein += entry.protein;
                totals.carbs += entry.carbs;
                totals.fat += entry.fat;
            } else {
                const factor = entry.weight / 100;
                totals.kcal += entry.kcal * factor;
                totals.protein += entry.protein * factor;
                totals.carbs += entry.carbs * factor;
                totals.fat += entry.fat * factor;
            }
        }
    });

    totalCalories.textContent = totals.kcal.toFixed(1);
    totalProtein.textContent = totals.protein.toFixed(1);
    totalCarbs.textContent = totals.carbs.toFixed(1);
    totalFat.textContent = totals.fat.toFixed(1);
}

function deleteEntry(index) {
    foodEntries.splice(index, 1);
    localStorage.setItem('foodEntries', JSON.stringify(foodEntries));
    updateTotals();
    displayEntries();
}

function editEntry(index) {
    const entry = foodEntries[index];
    const modal = new bootstrap.Modal(document.getElementById('editModal'));

    document.getElementById('editDate').value = entry.date;
    document.getElementById('editWeight').value = entry.weight || '';
    document.getElementById('editKcal').value = entry.kcal;
    document.getElementById('editProtein').value = entry.protein;
    document.getElementById('editCarbs').value = entry.carbs;
    document.getElementById('editFat').value = entry.fat;
    document.getElementById('editIsDirect').checked = entry.isDirect;

    document.getElementById('saveEditButton').onclick = () => {
        const updatedDate = document.getElementById('editDate').value;
        const updatedWeight = parseFloat(document.getElementById('editWeight').value) || null;
        const updatedKcal = parseFloat(document.getElementById('editKcal').value);
        const updatedProtein = parseFloat(document.getElementById('editProtein').value);
        const updatedCarbs = parseFloat(document.getElementById('editCarbs').value);
        const updatedFat = parseFloat(document.getElementById('editFat').value);
        const updatedIsDirect = document.getElementById('editIsDirect').checked;

        if (!updatedDate) {
            alert("Please select a date.");
            return;
        }
        if (updatedIsDirect && (isNaN(updatedKcal) || isNaN(updatedProtein) || isNaN(updatedCarbs) || isNaN(updatedFat))) {
            alert("Please enter valid numeric values for direct entry.");
            return;
        }
        if (!updatedIsDirect && (isNaN(updatedWeight) || isNaN(updatedKcal) || isNaN(updatedProtein) || isNaN(updatedCarbs) || isNaN(updatedFat))) {
            alert("Please enter valid numeric values.");
            return;
        }

        foodEntries[index] = {
            date: updatedDate,
            weight: updatedWeight,
            kcal: updatedKcal,
            protein: updated,
            carbs: updatedCarbs,
            fat: updatedFat,
            isDirect: updatedIsDirect
        };

        localStorage.setItem('foodEntries', JSON.stringify(foodEntries));
        updateTotals();
        displayEntries();
        modal.hide();
    };

    modal.show();
}

function displayEntries() {
    cardContainer.innerHTML = '';
    const filterDate = dateFilter.value;

    foodEntries.forEach((entry, index) => {
        if (!filterDate || entry.date === filterDate) {
            const card = document.createElement('div');
            card.classList.add('card');

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            let displayText = '';
            if (entry.isDirect) {
                displayText = `Direct Entry: ${entry.kcal}kcal, ${entry.protein}g P, ${entry.carbs}g C, ${entry.fat}g F`;
            } else {
                displayText = `${entry.weight}g (${entry.kcal}kcal, ${entry.protein}g P, ${entry.carbs}g C, ${entry.fat}g F)`;
            }

            cardBody.innerHTML = `
                <h5 class="card-title">${entry.date}</h5>
                <p class="card-text">${displayText}</p>
                <button class="btn btn-primary edit-button" data-index="${index}">Edit</button>
                <button class="btn btn-danger delete-button" data-index="${index}">Delete</button>
            `;
            card.appendChild(cardBody);
            cardContainer.appendChild(card);
        }
    });

    cardContainer.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            editEntry(parseInt(index));
        });
    });

    cardContainer.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            deleteEntry(parseInt(index));
        });
    });
}

function resetTotals() {
    foodEntries = [];
    localStorage.setItem('foodEntries', JSON.stringify(foodEntries));
    updateTotals();
    displayEntries();
}

function editGoals() {
    const modal = new bootstrap.Modal(document.getElementById('editGoalsModal'));

    document.getElementById('editGoalKcal').value = goals.kcal;
    document.getElementById('editGoalProtein').value = goals.protein;
    document.getElementById('editGoalCarbs').value = goals.carbs;
    document.getElementById('editGoalFat').value = goals.fat;

    document.getElementById('saveGoalsButton').onclick = () => {
        const updatedKcal = parseFloat(document.getElementById('editGoalKcal').value);
        const updatedProtein = parseFloat(document.getElementById('editGoalProtein').value);
        const updatedCarbs = parseFloat(document.getElementById('editGoalCarbs').value);
        const updatedFat = parseFloat(document.getElementById('editGoalFat').value);

        if (isNaN(updatedKcal) || isNaN(updatedProtein) || isNaN(updatedCarbs) || isNaN(updatedFat)) {
            alert("Please enter valid numeric values for the goals.");
            return;
        }

        goals.kcal = updatedKcal;
        goals.protein = updatedProtein;
        goals.carbs = updatedCarbs;
        goals.fat = updatedFat;

        localStorage.setItem('goals', JSON.stringify(goals));

        displayGoals();
        updateTotals();

        modal.hide();
    };

    modal.show();
}

// Event listeners
addButton.addEventListener('click', processInput);
resetButton.addEventListener('click', resetTotals);
dateFilter.addEventListener('change', () => {
    updateTotals();
    displayEntries();
});
editGoalsButton.addEventListener('click', editGoals);

weightEntryRadio.addEventListener('change', () => {
    weightInputsDiv.style.display = 'block';
    directInputsDiv.style.display = 'none';
});

directEntryRadio.addEventListener('change', () => {
    weightInputsDiv.style.display = 'none';
    directInputsDiv.style.display = 'block';
});

// Initial setup
displayGoals();
updateTotals();
displayEntries();