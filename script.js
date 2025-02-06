// Get elements
const addButton = document.getElementById('addButton');
const resetButton = document.getElementById('resetButton');
const totalCalories = document.getElementById('totalCalories');
const totalProtein = document.getElementById('totalProtein');
const totalCarbs = document.getElementById('totalCarbs');
const totalFat = document.getElementById('totalFat');
const cardContainer = document.getElementById('cardContainer');
const dateFilter = document.getElementById('dateFilter');

// --- New Elements ---
const weightEntryRadio = document.getElementById('weightEntry');
const directEntryRadio = document.getElementById('directEntry');
const weightInputsDiv = document.getElementById('weightInputs');
const directInputsDiv = document.getElementById('directInputs');

// Weight-based inputs
const foodWeight = document.getElementById('foodWeight');
const foodKcal = document.getElementById('foodKcal');
const foodProtein = document.getElementById('foodProtein');
const foodCarbs = document.getElementById('foodCarbs');
const foodFat = document.getElementById('foodFat');

// Direct entry inputs
const directKcal = document.getElementById('directKcal');
const directProtein = document.getElementById('directProtein');
const directCarbs = document.getElementById('directCarbs');
const directFat = document.getElementById('directFat');


// Goals
const goals = {
    kcal: 2650,
    protein: 194,
    carbs: 288,
    fat: 80
};

// Display Goals
function displayGoals() {
    document.getElementById('goalCalories').textContent = goals.kcal;
    document.getElementById('goalProtein').textContent = goals.protein;
    document.getElementById('goalCarbs').textContent = goals.carbs;
    document.getElementById('goalFat').textContent = goals.fat;
    document.getElementById('goalCaloriesDisplay').textContent = goals.kcal;
    document.getElementById('goalProteinDisplay').textContent = goals.protein;
    document.getElementById('goalCarbsDisplay').textContent = goals.carbs;
    document.getElementById('goalFatDisplay').textContent = goals.fat;
}
displayGoals();

// Load entries from local storage
let foodEntries = JSON.parse(localStorage.getItem('foodEntries')) || [];

// --- addFoodEntry ---
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
        alert("Please enter valid numeric values for weight-based entry.");
        return;
    }

    const entry = { date, weight, kcal, protein, carbs, fat, isDirect };
    foodEntries.push(entry);
    localStorage.setItem('foodEntries', JSON.stringify(foodEntries));
    updateTotals();
    displayEntries();

    // Clear inputs after adding
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

// --- processInput ---
function processInput() {
    const today = new Date().toISOString().split('T')[0];
    let isDirect = directEntryRadio.checked;

    if (isDirect) {
        // Direct entry: Get values directly from the input fields.
        const kcal = parseFloat(directKcal.value);
        const protein = parseFloat(directProtein.value);
        const carbs = parseFloat(directCarbs.value);
        const fat = parseFloat(directFat.value);
        addFoodEntry(today, null, kcal, protein, carbs, fat, true);
    } else {
        // Weight-based entry
        const weight = parseFloat(foodWeight.value);
        const kcal = parseFloat(foodKcal.value);
        const protein = parseFloat(foodProtein.value);
        const carbs = parseFloat(foodCarbs.value);
        const fat = parseFloat(foodFat.value);
        addFoodEntry(today, weight, kcal, protein, carbs, fat, false);
    }
}

// Update totals
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

// Delete entry
function deleteEntry(index) {
    foodEntries.splice(index, 1);
    localStorage.setItem('foodEntries', JSON.stringify(foodEntries));
    updateTotals();
    displayEntries();
}

// --- editEntry ---
function editEntry(index) {
    const entry = foodEntries[index];
    const modal = new bootstrap.Modal(document.getElementById('editModal'));

    // Prefill the modal's form fields
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
            protein: updatedProtein,
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

// displayEntries
function displayEntries() {
    cardContainer.innerHTML = ''; // Clear previous cards
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

    // Event delegation for edit and delete buttons
    cardContainer.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            editEntry(parseInt(index)); // Convert index to number
        });
    });

    cardContainer.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            deleteEntry(parseInt(index)); // Convert index to number
        });
    });
}


// Reset totals function
function resetTotals() {
    foodEntries = []; // Clear all entries
    localStorage.setItem('foodEntries', JSON.stringify(foodEntries)); // Update local storage
    updateTotals();      // Update the displayed totals (will be 0 now)
    displayEntries();    // Clear the displayed food log
}

// Event listeners
addButton.addEventListener('click', processInput);
resetButton.addEventListener('click', resetTotals);
dateFilter.addEventListener('change', () => {
    updateTotals();
    displayEntries();
});

// --- Show/hide input fields based on radio selection ---
weightEntryRadio.addEventListener('change', () => {
    weightInputsDiv.style.display = 'block';
    directInputsDiv.style.display = 'none';
});

directEntryRadio.addEventListener('change', () => {
    weightInputsDiv.style.display = 'none';
    directInputsDiv.style.display = 'block';
});

// Initial setup
updateTotals();
displayEntries();