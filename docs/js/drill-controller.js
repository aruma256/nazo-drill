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
            questionDisplay: document.getElementById('question-display'),
            answerInput: document.getElementById('answer-input'),
            submitButton: document.getElementById('submit-button'),
            nextButton: document.getElementById('next-button'),
            feedback: document.getElementById('feedback')
        };

        this.setupEventListeners();
        this.init();
    }

    /**
     * 初期化
     */
    init() {
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
        } else {
            const correctAnswer = this.drill.currentQuestion.answer;
            this.showFeedback(`✗ 不正解... 正解は「${correctAnswer}」です`, 'error');
        }

        this.elements.answerInput.disabled = true;
        this.elements.submitButton.classList.add('hidden');
        this.elements.nextButton.classList.remove('hidden');
        this.elements.nextButton.focus();
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
