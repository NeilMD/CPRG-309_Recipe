let recipeData = new Object();

let recipeSettings = {
    multiplier: 1,
    metric: 0, // 0:Metric, 1:Imperial
}

// Google Conversion Multiplier
const UNIT_MULTIPLIER = {
    gramsToPounds : 0.00220462,
    tspToMl : 4.92892,
    tbspToMl : 14.7868,
    cupsToMl : 240
}

const getData = async function () {
    try {
        const response = await fetch("./recipe.json");
        let recipe = await response.json();
        return recipe
    } catch (err) {

    }
};

// Get all data from recipe.json
(async function (){
    let optionData = await getData();
    recipeData = optionData
    for (let i = 0; i < optionData.length; i++) {
        const el = document.createElement('option');
        el.value = i;
        el.textContent = optionData[i].name;
        recipe.appendChild(el);
    }
})();

const convertUnit = (data)  => {
    let blConvert, numAmount, txtConverted, txtNewUnit;

    // if selected measurement is imperial
    if (recipeSettings.metric == 1) {
        blConvert = (data.unit == 'grams') ? 1 : 0;
        numAmount = (data.amount * recipeSettings.multiplier * (blConvert ? UNIT_MULTIPLIER.gramsToPounds : 1));
        txtNewUnit = blConvert ? 'pounds' : data.unit;
    } else { // Else, metric
        let numMl = 1;
        // Check current unit if imperial
        switch (data.unit) {
            case 'tablespoons':
            case 'tablespoon':
                numMl = UNIT_MULTIPLIER.tbspToMl;
                txtNewUnit = 'ml'
                break;
            case 'teaspoons':
            case 'teaspoon':
                numMl = UNIT_MULTIPLIER.tspToMl;
                txtNewUnit = 'ml'
                break;
            case 'cups':
            case 'cup':
                numMl = UNIT_MULTIPLIER.cupsToMl;
                txtNewUnit = 'ml';
                break
            default: 
                txtNewUnit = data.unit
        }
        numAmount = (data.amount * recipeSettings.multiplier * numMl);
    }
    txtConverted = parseFloat(Math.round(numAmount * 100) / 100);
    return `${txtConverted} ${txtNewUnit}`; 
}

const fillUp =  (data) => {
    let elArticle  = document.getElementById("recipe-container");
    elArticle.classList.remove("article-fade");
    void elArticle.offsetWidth;
    // Update Static Data
    recipename.textContent = data.name;
    desc.textContent = data.description;
    cuisine.textContent = data.cuisine;
    // If time is more than 60mins, change the format of time
    prepTime.textContent = data.prepTime > 60 ? `${Math.floor(data.prepTime/60)} hour ${data.prepTime % 60} minutes`: `${data.prepTime} minutes`;
    cookTime.textContent = data.cookTime > 60 ? `${Math.floor(data.cookTime/60)} hour ${data.cookTime % 60} minutes`: `${data.cookTime} minutes`;
    // Multiple to serving multipler inputted
    servings.innerHTML = `${data.servings * recipeSettings.multiplier} <small class="small-italic">(based on ${data.servings} servings × multipler of ${recipeSettings.multiplier})</small>`;
    // Change color depending on the difficulty of recipe
    diff.parentNode.classList.remove('green-bg','blue-bg','red-bg');
    let diffColor = (data.difficulty == 'high') ? 'red-bg' : (data.difficulty == 'medium') ? 'blue-bg' : 'green-bg';
    diff.parentNode.classList.add(diffColor)
    diff.textContent = data.difficulty;
    recipeImage.src = data.image
    
    // Update nutritional value
    cal.textContent = `${data.nutritionalInfo.calories} kcal`;
    protein.textContent = `${data.nutritionalInfo.protein} g`;
    carbs.textContent = `${data.nutritionalInfo.carbohydrates} g`;
    fat.textContent = `${data.nutritionalInfo.fat} g`;

    // Select all elements to be removed
    const elementsToRemove = document.querySelectorAll("#ingredients-list li, #instructions-list li, .tags:not(div .tags)");
    elementsToRemove.forEach(element => {
        element.remove();
    });

    // Update Ingredients
    let ingredientsEl = '';
    for (const ing of data.ingredients) {
        let el= `<li class="text-30">
            ${convertUnit(ing)} ${ing.item}
        </li>`;
        ingredientsEl += el;
    }
    document.getElementById("ingredients-list").insertAdjacentHTML('afterbegin', ingredientsEl);

    // Update Instructions
    let instructionsEl = '';
    for (const ins of data.instructions) {
        let el= `<li class="text-70">${ins.text}</li>`;
        instructionsEl += el;
    }
    document.getElementById("instructions-list").insertAdjacentHTML('afterbegin', instructionsEl);

    // Update Tags
    let tagsEl = '';
    for (const tag of data.tags) {
        let el= `<span class="tags green-bg">${tag}</span>`;
        tagsEl += el;
    }
    document.getElementById("tags-header").insertAdjacentHTML('afterend', tagsEl);

    // animation to fade the whole section
    elArticle.classList.add("article-fade");
}


// Element behavior


document.getElementById("submit").addEventListener('click', (event)=>{
    // Insert update data
    event.preventDefault();
    const elRecipe = document.getElementById("recipe");
    const elMultiplier = document.getElementById("serving");

    if (!elRecipe.checkValidity() || !elMultiplier.checkValidity()) {
        const invalidEl = !elRecipe.checkValidity() ? elRecipe : elMultiplier;
        invalidEl.reportValidity();
        return;
    }
    
    let recipe = document.getElementById('recipe').value;
    recipeSettings.multiplier = document.getElementById('serving').value;
    recipeSettings.metric = document.querySelector('input[name="measurement"]:checked').value;
    document.getElementById('recipe-container').classList.remove("hidden")
    fillUp(recipeData[recipe])

})

