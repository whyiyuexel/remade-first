let currentRow = 0;
let word = "salet";
const tiles = [0, 0, 0, 0, 0];
const tileNames = ["tileR2", "tileR3", "tileR4", "tileR5", "tileR6"];
const wordleList = new Set();
const fullList = new Set();
const green = new Set();
const filePath = "answers.txt";

// Read all possible answers and save it onto a set
fetch(filePath)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        return response.text();
    })
    .then(fileContent => {
        const words = fileContent.split(/\r?\n/).filter(word => word.trim() !== "");

        words.forEach(word => wordleList.add(word));
        words.forEach(word => fullList.add(word));

        console.log("Set of unique words:");
        console.log(wordleList);
    })
    .catch(error => {
        console.error("Error reading file:", error);
    });

function setColor(property, row, collumn) {
    if(currentRow == row) {
        let count = tiles[collumn];
        if(count == 2) {
            count = 0;
        }
        else if(count < 2) {
            count++;
        }
        tiles[collumn] = count;

        if (count == 0) {
            property.style.backgroundColor = "#3a3a3c";
        }
        else if(count == 1){
            property.style.backgroundColor = "#b59f3b";
        }
        else if (count == 2){
            property.style.backgroundColor = "#538d4e";
        }
    }
}

function resetButton() {
    //Reset first row and counts
    let rows = document.getElementsByClassName("tileR1");
    for(let i = 0; i < rows.length; i++) {
        rows[i].style.backgroundColor = "#3a3a3c";
        tiles[i] = 0;
    }

    //Rest of the rows
    for(let i = 0; i < tileNames.length; i++) {
        rows = document.getElementsByClassName(tileNames[i]);
        for(let j = 0; j < rows.length; j++) {
            rows[j].style.backgroundColor = "#121212";
            rows[j].style.border = "2px solid #3a3a3c";
            rows[j].value = "";
        }
    }

    currentRow = 0;
    word = "salet";
    const divElement = document.querySelector(".try");
    divElement.textContent = "Try SALET";
    wordleList.clear();
    updatePossibleWords()
    for (const value of fullList) {
        wordleList.add(value);
    }
}

function submitButton() {
    currentRow++;
    reduce();
    getWord();
    console.log(word);
    let rows = document.getElementsByClassName("tileR" + (currentRow + 1));
    for(let i = 0; i < rows.length; i++) {
        rows[i].value = word[i].toUpperCase();
        rows[i].style.backgroundColor = "#3a3a3c";
        rows[i].style.border = "none";
        tiles[i] = 0;
    }
    const divElement = document.querySelector(".try");
    divElement.textContent = "Try " + word.toUpperCase();
    updatePossibleWords()
}

function getWord() {
    let minEntropy = Number.MAX_SAFE_INTEGER;

    for(const value of wordleList) {
        let entropy = calculate(value);
        if(entropy < minEntropy) {
            minEntropy = entropy;
            word = value;
        }
    }
}

function calculate(word) {
    let counter = 0;
    const uniqueLetters = new Set(word);

    for (const value of wordleList) {
        const checkedCharacters = new Set();
        for (const letter of uniqueLetters) {
            if (value.includes(letter) && !checkedCharacters.has(letter)) {
                counter++;
                checkedCharacters.add(letter);
            }
        }
    }

    // Penalize words with duplicate letters to reduce their preference
    let penalty = word.length - uniqueLetters.size;
    return counter + penalty * 1000;
}

function reduce() {
    if(tiles[0] == 2 && tiles[1] == 2 && tiles[2] == 2 && tiles[3] == 2 && tiles[4] == 2) {
        wordleList.clear();
        wordleList.add(word);
    }
    else {
        for(let i = 0; i < tiles.length; i++) {
            reduceGreen(tiles[i], word[i], i);
        }
        for(let i = 0; i < tiles.length; i++) {
            reduceYellow(tiles[i], word[i], i);
        }
        for(let i = 0; i < tiles.length; i++) {
            reduceGrey(tiles[i], word[i], i);
        }
    }
    green.clear();
    // console.log("Set of unique words after:");
    // console.log(wordleList);
    // console.log(tiles);
}

/* Checks if a letter is green and adds it to the green list, removes
 *        all words that do not have that letter in that spot
 */
function reduceGreen(colorIndex, letter, index) {
    if(colorIndex == 2) {
        green.add(letter);
        for (const value of wordleList) {
            if(value[index] != letter) {
                wordleList.delete(value);
            }
        }
    }
}

/* Check if a letter is yellow and add it to green list, removes all words with
 *        letter in that spot and all words who do not have that letter
 */
function reduceYellow(colorIndex, letter, index) {
    if(colorIndex == 1) {
        green.add(letter);
        for (const value of wordleList) {
            if(!value.includes(letter)) {
                wordleList.delete(value);
            }
            if(value[index] == letter) {
                wordleList.delete(value);
            }
        }
    }
}

/* Check if the gray letter is in green list, if it is in green list only remove
 * the words with letters in that spot, if the letter is not in green list remove
 *                      all words that have that letter
 */
function reduceGrey(colorIndex, letter, index) {
    if(colorIndex == 0) {
        for (const value of wordleList) {
            if(value.includes(letter)) {
                if(green.has(letter)) {
                    if(value[index] == letter) {
                        wordleList.delete(value);
                    }
                }
                else {
                    wordleList.delete(value);
                }
            }
        }
    }
}

function updatePossibleWords() {
    const possibleWordsBox = document.getElementsByClassName("answers")[0];

    // Convert Set to an array, sort alphabetically, and convert to uppercase
    const wordsArray = Array.from(wordleList).map(word => word.toUpperCase()).sort();

    // Display "Possible words" at the top, followed by the list of words
    possibleWordsBox.innerHTML = `<strong>Possible words (${wordsArray.length}):</strong><br>${wordsArray.join(', ')}`;
}