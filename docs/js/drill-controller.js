/**
 * ドリルの共通UIコントローラー
 * DrillBaseを継承したドリルを汎用的に制御する
 */
class DrillController {
    /**
     * @param {DrillBase} drill - DrillBaseを継承したドリルインスタンス
     * @param {Object} options - オプション設定
     */
    constructor(drill, options = {}) {
        this.drill = drill;
        this.options = {
            autoUppercase: options.autoUppercase || false,
            maxLength: options.maxLength || null,
            placeholder: options.placeholder || 'あ',
            ...options
        };

        // DOM要素の取得
        this.elements = {
            startScreen: document.getElementById('start-screen'),
            drillScreen: document.getElementById('drill-screen'),
            questionDisplay: document.getElementById('question-display'),
            answerInput: document.getElementById('answer-input'),
            submitButton: document.getElementById('submit-button'),
            nextButton: document.getElementById('next-button'),
            feedback: document.getElementById('feedback'),
            difficultyButtons: document.querySelectorAll('[data-difficulty]'),
            // スマホ最適化用の追加要素
            header: document.getElementById('header'),
            backToStartButton: document.getElementById('back-to-start'),
            mainContainer: document.getElementById('main-container'),
            body: document.body
        };

        this.currentDifficulty = null;
        this.setupEventListeners();
        // スタート画面がある場合は画面切り替え、ない場合は従来通り
        if (this.elements.startScreen) {
            this.showStartScreen();
        } else {
            this.initDrill();
        }
    }

    /**
     * スタート画面を表示
     */
    showStartScreen() {
        if (this.elements.startScreen) {
            this.elements.startScreen.classList.remove('hidden');
        }
        if (this.elements.drillScreen) {
            this.elements.drillScreen.classList.add('hidden');
        }
        // ヘッダーを表示
        if (this.elements.header) {
            this.elements.header.classList.remove('hidden');
        }
        // スクロール可能に戻す
        if (this.elements.body) {
            this.elements.body.classList.remove('overflow-hidden', 'h-dvh');
            this.elements.body.classList.add('min-h-screen');
        }
        if (this.elements.mainContainer) {
            this.elements.mainContainer.classList.remove('h-dvh', 'overflow-hidden', 'py-2');
            this.elements.mainContainer.classList.add('py-6');
        }
    }

    /**
     * ドリル画面を表示
     */
    showDrillScreen() {
        if (this.elements.startScreen) {
            this.elements.startScreen.classList.add('hidden');
        }
        if (this.elements.drillScreen) {
            this.elements.drillScreen.classList.remove('hidden');
        }
        // ヘッダーを非表示（スマホ最適化）
        if (this.elements.header) {
            this.elements.header.classList.add('hidden');
        }
        // スクロール無効化（スマホ最適化）
        if (this.elements.body) {
            this.elements.body.classList.remove('min-h-screen');
            this.elements.body.classList.add('overflow-hidden', 'h-dvh');
        }
        if (this.elements.mainContainer) {
            this.elements.mainContainer.classList.remove('py-6');
            this.elements.mainContainer.classList.add('h-dvh', 'overflow-hidden', 'py-2');
        }
        this.initDrill();
    }

    /**
     * 難易度を選択してドリルを開始
     * @param {string} difficulty - 難易度 (beginner/intermediate/advanced)
     */
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.drill.resetScore();
        this.showDrillScreen();
    }

    /**
     * ドリルを初期化
     */
    initDrill() {
        // プレースホルダーとmaxlengthの設定
        if (this.options.placeholder) {
            this.elements.answerInput.placeholder = this.options.placeholder;
        }
        if (this.options.maxLength) {
            this.elements.answerInput.maxLength = this.options.maxLength;
        }

        this.presentNewQuestion();
        this.elements.answerInput.focus();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // 難易度選択ボタン
        this.elements.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const difficulty = button.dataset.difficulty;
                const disabled = button.dataset.disabled === 'true';
                if (!disabled) {
                    this.selectDifficulty(difficulty);
                }
            });
        });

        // 「やめる」ボタン（スタート画面に戻る）
        if (this.elements.backToStartButton) {
            this.elements.backToStartButton.addEventListener('click', () => {
                this.showStartScreen();
            });
        }

        // ボタンクリック
        this.elements.submitButton.addEventListener('click', () => this.submitAnswer());
        this.elements.nextButton.addEventListener('click', () => this.presentNewQuestion());

        // Enterキーで回答/次の問題
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.elements.submitButton.classList.contains('hidden')) {
                this.submitAnswer();
            }
        });

        this.elements.nextButton.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.presentNewQuestion();
            }
        });

        // 自動大文字変換（オプション）
        if (this.options.autoUppercase) {
            this.elements.answerInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }
    }

    /**
     * 新しい問題を出題
     */
    presentNewQuestion() {
        const question = this.drill.presentQuestion();
        this.elements.questionDisplay.textContent = question.question;
        this.elements.answerInput.value = '';
        this.elements.answerInput.disabled = false;
        this.elements.submitButton.classList.remove('hidden');
        this.elements.nextButton.classList.add('hidden');
        this.elements.feedback.classList.add('hidden');
        this.elements.answerInput.focus();
    }

    /**
     * 回答を提出
     */
    submitAnswer() {
        const userAnswer = this.elements.answerInput.value.trim();

        if (!userAnswer) {
            this.showFeedback('回答を入力してください', 'warning');
            return;
        }

        const isCorrect = this.drill.checkAnswer(userAnswer);

        if (isCorrect) {
            this.showFeedback('✓ 正解！', 'success');
            // 正解時は自動で次の問題へ（フォーカス維持でキーボードを閉じない）
            setTimeout(() => {
                this.presentNewQuestion();
            }, 400);
        } else {
            const correctAnswer = this.drill.currentQuestion.answer;
            this.showFeedback(`✗ 不正解... 正解は「${correctAnswer}」です`, 'error');
            // 不正解時のみ「次へ」ボタンを表示
            this.elements.answerInput.disabled = true;
            this.elements.submitButton.classList.add('hidden');
            this.elements.nextButton.classList.remove('hidden');
            this.elements.nextButton.focus();
        }
    }

    /**
     * フィードバックを表示
     * @param {string} message - 表示メッセージ
     * @param {string} type - フィードバックタイプ (success/error/warning)
     */
    showFeedback(message, type) {
        const feedback = this.elements.feedback;
        feedback.textContent = message;
        feedback.classList.remove(
            'hidden',
            'bg-green-100', 'text-green-800',
            'bg-red-100', 'text-red-800',
            'bg-yellow-100', 'text-yellow-800'
        );

        const typeClasses = {
            success: ['bg-green-100', 'text-green-800'],
            error: ['bg-red-100', 'text-red-800'],
            warning: ['bg-yellow-100', 'text-yellow-800']
        };

        if (typeClasses[type]) {
            feedback.classList.add(...typeClasses[type]);
        }
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.DrillController = DrillController;
}
