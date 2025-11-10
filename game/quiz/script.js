// ゲーム状態管理
class QuizGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.questions = [];
        this.selectedDifficulty = 'normal';
        this.timeLimit = 20; // デフォルトは普通
        this.timer = null;
        this.currentTimeLeft = 0;
        this.wrongAnswers = [];
        this.answered = false;
        this.correctAnswers = 0;
        
        this.initializeElements();
        this.attachEventListeners();
        this.showHomeScreen();
    }
    
    initializeElements() {
        // 画面要素
        this.homeScreen = document.getElementById('home-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultScreen = document.getElementById('result-screen');
        
        // ゲーム要素
        this.progressBar = document.getElementById('progress');
        this.questionCounter = document.getElementById('question-counter');
        this.scoreDisplay = document.getElementById('score-display');
        this.timerDisplay = document.getElementById('timer');
        this.timerProgress = document.getElementById('timer-progress');
        this.categoryDisplay = document.getElementById('category');
        this.questionText = document.getElementById('question-text');
        this.answersContainer = document.getElementById('answers');
        this.answerButtons = this.answersContainer.querySelectorAll('.answer-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.nextBtn = document.getElementById('next-btn');
        
        // 結果画面要素
        this.finalScore = document.getElementById('final-score');
        this.correctCount = document.getElementById('correct-count');
        this.accuracyRate = document.getElementById('accuracy-rate');
        this.difficultyLabel = document.getElementById('difficulty-label');
        this.wrongAnswersContainer = document.getElementById('wrong-answers');
    }
    
    attachEventListeners() {
        // 難易度選択
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setDifficulty(e.target.dataset.difficulty);
                this.startGame();
            });
        });
        
        // 回答ボタン
        this.answerButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.answered) {
                    this.selectAnswer(e.target.dataset.answer);
                }
            });
        });
        
        // ゲーム制御ボタン
        this.skipBtn.addEventListener('click', () => this.skipQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        
        // 結果画面ボタン
        document.getElementById('play-again-btn').addEventListener('click', () => this.showHomeScreen());
        document.getElementById('share-btn').addEventListener('click', () => this.shareResult());
        
    }
    
    setDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        // 全ての難易度で統一した制限時間
        this.timeLimit = 30;
    }
    
    startGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = [];
        this.questions = getRandomQuestions(this.selectedDifficulty, 10);
        
        this.showGameScreen();
        this.loadQuestion();
    }
    
    showHomeScreen() {
        console.log('showHomeScreen メソッドが呼び出されました');
        this.hideAllScreens();
        console.log('全画面を非表示にしました');
        this.homeScreen.classList.remove('hidden');
        console.log('ホーム画面を表示しました');
    }
    
    showGameScreen() {
        this.hideAllScreens();
        this.gameScreen.classList.remove('hidden');
    }
    
    showResultScreen() {
        this.hideAllScreens();
        this.resultScreen.classList.remove('hidden');
        this.displayResults();
    }
    
    hideAllScreens() {
        console.log('hideAllScreens メソッドが呼び出されました');
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
            console.log('画面を非表示にしました:', screen.id);
        });
    }
    
    loadQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }
        
        const question = this.questions[this.currentQuestion];
        this.answered = false;
        
        // UI更新
        this.updateProgress();
        this.updateQuestionDisplay(question);
        this.resetAnswerButtons();
        this.startTimer();
        
        // ボタン表示制御
        this.skipBtn.classList.remove('hidden');
        this.nextBtn.classList.add('hidden');
    }
    
    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        this.progressBar.style.width = progress + '%';
        this.questionCounter.textContent = `問題 ${this.currentQuestion + 1}/${this.questions.length}`;
        this.scoreDisplay.textContent = `スコア: ${this.score}`;
    }
    
    updateQuestionDisplay(question) {
        this.categoryDisplay.textContent = question.category;
        this.questionText.textContent = question.question;
        
        this.answerButtons.forEach((btn, index) => {
            const optionKey = ['A', 'B', 'C', 'D'][index];
            btn.innerHTML = `${optionKey}. ${question.options[optionKey]}`;
        });
    }
    
    resetAnswerButtons() {
        this.answerButtons.forEach(btn => {
            btn.className = 'answer-btn';
        });
    }
    
    startTimer() {
        this.currentTimeLeft = this.timeLimit;
        this.timerDisplay.textContent = this.currentTimeLeft;
        this.timerProgress.style.width = '100%';
        
        this.timer = setInterval(() => {
            this.currentTimeLeft--;
            this.timerDisplay.textContent = this.currentTimeLeft;
            
            const progressPercent = (this.currentTimeLeft / this.timeLimit) * 100;
            this.timerProgress.style.width = progressPercent + '%';
            
            if (this.currentTimeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    selectAnswer(selectedAnswer) {
        if (this.answered) return;
        
        this.answered = true;
        this.stopTimer();
        
        const question = this.questions[this.currentQuestion];
        const isCorrect = selectedAnswer === question.correct;
        
        // ボタンの色を変更
        this.answerButtons.forEach(btn => {
            const answer = btn.dataset.answer;
            btn.classList.add('disabled');
            
            if (answer === question.correct) {
                btn.classList.add('correct');
            } else if (answer === selectedAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        if (isCorrect) {
            this.score += this.calculateScore();
            this.correctAnswers++;
        } else {
            // 間違った問題を記録
            this.wrongAnswers.push({
                question: question.question,
                selectedAnswer: selectedAnswer,
                correctAnswer: question.correct,
                selectedText: question.options[selectedAnswer],
                correctText: question.options[question.correct]
            });
        }
        
        // ボタン表示制御
        this.skipBtn.classList.add('hidden');
        this.nextBtn.classList.remove('hidden');
        
        this.updateProgress();
    }
    
    calculateScore() {
        // 残り時間に応じてスコア計算
        const timeBonus = Math.max(0, this.currentTimeLeft);
        const baseScore = 100;
        const difficultyMultiplier = {
            'easy': 1,
            'normal': 1.5,
            'hard': 2
        }[this.selectedDifficulty];
        
        return Math.round((baseScore + timeBonus * 5) * difficultyMultiplier);
    }
    
    timeUp() {
        if (!this.answered) {
            this.answered = true;
            this.stopTimer();
            
            const question = this.questions[this.currentQuestion];
            
            // 正解を表示
            this.answerButtons.forEach(btn => {
                btn.classList.add('disabled');
                if (btn.dataset.answer === question.correct) {
                    btn.classList.add('correct');
                }
            });
            
            // 間違った問題として記録
            this.wrongAnswers.push({
                question: question.question,
                selectedAnswer: '時間切れ',
                correctAnswer: question.correct,
                selectedText: '回答なし',
                correctText: question.options[question.correct]
            });
            
            // ボタン表示制御
            this.skipBtn.classList.add('hidden');
            this.nextBtn.classList.remove('hidden');
        }
    }
    
    skipQuestion() {
        if (this.answered) return;
        
        const question = this.questions[this.currentQuestion];
        
        // スキップした問題として記録
        this.wrongAnswers.push({
            question: question.question,
            selectedAnswer: 'スキップ',
            correctAnswer: question.correct,
            selectedText: 'スキップ',
            correctText: question.options[question.correct]
        });
        
        this.nextQuestion();
    }
    
    nextQuestion() {
        this.stopTimer();
        this.currentQuestion++;
        this.loadQuestion();
    }
    
    endGame() {
        this.stopTimer();
        
        // ハイスコア保存
        saveHighScore(this.score, this.selectedDifficulty, this.correctAnswers, this.questions.length);
        
        this.showResultScreen();
    }
    
    displayResults() {
        this.finalScore.textContent = this.score;
        this.correctCount.textContent = this.correctAnswers;
        
        const accuracy = Math.round((this.correctAnswers / this.questions.length) * 100);
        this.accuracyRate.textContent = accuracy + '%';
        
        const difficultyNames = {
            'easy': '簡単',
            'normal': '普通', 
            'hard': '難しい'
        };
        this.difficultyLabel.textContent = difficultyNames[this.selectedDifficulty];
        
        // 間違った問題の表示
        this.displayWrongAnswers();
    }
    
    displayWrongAnswers() {
        if (this.wrongAnswers.length === 0) {
            this.wrongAnswersContainer.innerHTML = '<div style="text-align: center; color: #28a745; font-size: 1.2rem;">🎉 全問正解！素晴らしいです！</div>';
            return;
        }
        
        let html = '<h4>📝 間違った問題:</h4>';
        this.wrongAnswers.forEach(wrong => {
            html += `
                <div class="wrong-answer-item">
                    <strong>Q:</strong> ${wrong.question}<br>
                    <span style="color: #dc3545;">あなたの回答: ${wrong.selectedText}</span><br>
                    <span style="color: #28a745;">正解: ${wrong.correctText}</span>
                </div>
            `;
        });
        
        this.wrongAnswersContainer.innerHTML = html;
    }
    
    shareResult() {
        const text = `クイズゲームで ${this.score} 点獲得！ ${this.correctAnswers}/${this.questions.length} 問正解 (${Math.round((this.correctAnswers / this.questions.length) * 100)}%)`;
        
        if (navigator.share) {
            navigator.share({
                title: 'クイズゲーム結果',
                text: text,
                url: window.location.href
            });
        } else {
            // フォールバック: クリップボードにコピー
            navigator.clipboard.writeText(text).then(() => {
                alert('結果をクリップボードにコピーしました！');
            });
        }
    }
    
    
}

// ゲーム開始
const game = new QuizGame();