const playerForm = document.getElementById('playerForm');
const categorySelect = document.getElementById('categorySelect');
const categorySelection = document.getElementById('category-selection');
const startQuestionsBtn = document.getElementById('startQuestionsBtn');
const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const resultContainer = document.getElementById('result');
const turnIndicator = document.getElementById('turnIndicator');

let player1Name, player2Name;
let currentPlayer = 1;
let playerScores = { player1: 0, player2: 0 };
let questions = [];
let currentQuestionIndex = 0;
let selectedCategory = '';
let previousCategories = []; 

categorySelect.addEventListener("change",(event)=>{
  selectedCategory = event.target.value;
  
  console.log("the selected category value is",selectedCategory);

})
console.log("selectedcategory value is", selectedCategory);
const fetchCategories = async () => {
    try {
      const response = await fetch('https://the-trivia-api.com/v2/categories');
      const data = await response.json();
      console.log("fetch categories data", data);
      categorySelect.innerHTML = '<option value="" disabled selected>Select a Category</option>';
      
      console.log("after conversion to object entries",Object.entries(data))
      for (const [categoryKey, categoryValue] of Object.entries(data)) {
        if (!previousCategories.includes(categoryKey)) {
          const option = document.createElement('option');
          option.value = categoryValue.pop();
          console.log("option is ",{categoryKey ,categoryValue});
          
          option.textContent = categoryKey;
          categorySelect.appendChild(option);
        }
      }
      console.log("previous Categories are ",previousCategories)
    } catch (error) {
      alert('Failed to load categories. Please try again later.');
    }
};


const fetchQuestions = async () => {
    try {
      if (!selectedCategory) {
        alert('Please select a category before starting the game.');
        return;
      }
  
      console.log('Selected Category:', selectedCategory);
  
      const apiUrl = `https://the-trivia-api.com/v2/questions?categories=${selectedCategory}&limit=6`;
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      console.log('Fetched Data:', data); 
  
      if (!data || data.length < 6) {
        alert('Not enough questions for this category. Please select another category.');
        return;
      }
  
      const easyQuestions = data.filter(q => q.difficulty === 'easy').slice(0, 2);
      const mediumQuestions = data.filter(q => q.difficulty === 'medium').slice(0, 2);
      const hardQuestions = data.filter(q => q.difficulty === 'hard').slice(0, 2);
  
      questions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
      currentQuestionIndex = 0;
  
      displayQuestion();
    } catch (error) {
      alert('Failed to load questions. Please try again later.');
    }
  };
  

const displayQuestion = () => {
  questionContainer.style.display = 'block';
  const question = questions[currentQuestionIndex];

  const decodedQuestion = decodeHtml(question.question.text);
  questionElement.textContent = decodedQuestion;
  optionsElement.innerHTML = '';

  const options = [...question.incorrectAnswers, question.correctAnswer];

  options.forEach(option => {
    const decodedOption = decodeHtml(option);
    const button = document.createElement('button');
    button.textContent = decodedOption;
    button.classList.add('optionButton');
    button.onclick = () => handleAnswer(decodedOption, question.correctAnswer);
    optionsElement.appendChild(button);
  });

  updateTurnIndicator();
};

const decodeHtml = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const handleAnswer = (selectedAnswer, correctAnswer) => {
  const question = questions[currentQuestionIndex];
  const difficulty = question.difficulty;

  if (selectedAnswer === correctAnswer) {
    let points = 0;
    if (difficulty === 'easy') points = 10;
    if (difficulty === 'medium') points = 15;
    if (difficulty === 'hard') points = 20;

    if (currentPlayer === 1) {
      playerScores.player1 += points;
    } else {
      playerScores.player2 += points;
    }
  }

  nextBtn.style.display = 'block';
};

nextBtn.onclick = () => {
  currentQuestionIndex++;
  currentPlayer = currentPlayer === 1 ? 2 : 1;

  if (currentQuestionIndex < questions.length) {
    displayQuestion();
    nextBtn.style.display = 'none';
  } else {
    endGame();
  }
};

const endGame = () => {
  questionContainer.style.display = 'none';
  resultContainer.style.display = 'block';

  const winner = playerScores.player1 > playerScores.player2 ? player1Name :
    playerScores.player2 > playerScores.player1 ? player2Name : "It's a tie!";

  resultContainer.innerHTML = `
    <h2>Game Over</h2>
    <p>${player1Name}: ${playerScores.player1} points</p>
    <p>${player2Name}: ${playerScores.player2} points</p>
    <h3>Congratulations ${winner}!</h3>
    <p>Wanna play again?</p>
    <button id="restartBtn" class="restartButton">Restart Game</button>
  `;

  document.getElementById('restartBtn').onclick = restartGame;
};

const updateTurnIndicator = () => {
  //use boolean!
  turnIndicator.textContent = `It's ${currentPlayer === 1 ? player1Name : player2Name}'s turn!`;
};

const restartGame = () => {
    playerScores = { player1: 0, player2: 0 };
    currentQuestionIndex = 0;
    currentPlayer = 1;
    selectedCategory = '';
  
    resultContainer.style.display = 'none';
    categorySelection.style.display = 'block';
  
    if (selectedCategory && !previousCategories.includes(selectedCategory)) {
        console.log("hey are you happening?????")
      previousCategories.push(selectedCategory);
    }
    console.log("previous categories after restarting",previousCategories);
  
    fetchCategories();
  };
  
  startQuestionsBtn.onclick = () => {
    selectedCategory = categorySelect.value;
  
    if (!selectedCategory) {
      alert('Please select a category before starting.');
      return;
    }
  
    categorySelection.style.display = 'none';
    fetchQuestions();
  };

playerForm.onsubmit = (e) => {
  // e.preventDefault();
  player1Name = document.getElementById('player1').value;
  player2Name = document.getElementById('player2').value;

  if (!player1Name || !player2Name) {
    alert('Please enter names for both players.');
    return;
  }

  playerForm.style.display = 'none';
  categorySelection.style.display = 'block';
  fetchCategories();
};

startQuestionsBtn.onclick = () => {
    selectedCategory = categorySelect.value;
  
    if (!selectedCategory) {
      alert('Please select a category before starting.');
      return;
    }
  
    if (!previousCategories.includes(selectedCategory)) {
      previousCategories.push(selectedCategory);
    }
  
    categorySelection.style.display = 'none';
    fetchQuestions();
  };
  
