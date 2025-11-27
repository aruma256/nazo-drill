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
            getHintContent: options.getHintContent || null,
            onQuestionDisplay: options.onQuestionDisplay || null,
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
            modeButtons: document.querySelectorAll('[data-mode]'),
            // スマホ最適化用の追加要素
            header: document.getElementById('header'),
            backToStartButton: document.getElementById('back-to-start'),
            mainContainer: document.getElementById('main-container'),
            body: document.body,
            // モーダル関連
            feedbackModal: document.getElementById('feedback-modal'),
            modalMessage: document.getElementById('modal-message'),
            modalHint: document.getElementById('modal-hint')
        };

        this.currentMode = null;
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
     * モードを選択してドリルを開始
     * @param {string} mode - モード (beginner/intermediate/advanced 等)
     */
    selectMode(mode) {
        this.currentMode = mode;
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
        // モード選択ボタン
        this.elements.modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.dataset.mode;
                const disabled = button.dataset.disabled === 'true';
                if (!disabled) {
                    this.selectMode(mode);
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

        // カスタム表示関数があれば呼び出し、なければデフォルト表示
        if (this.options.onQuestionDisplay) {
            this.options.onQuestionDisplay(question, this.elements.questionDisplay);
        } else {
            this.elements.questionDisplay.textContent = question.question;
        }

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
        const correctAnswer = this.drill.currentQuestion.answer;
        const question = this.drill.currentQuestion.question;

        // 補助表示の生成（オプションで渡されたコールバックを使用）
        let hintContent = null;
        if (this.options.getHintContent) {
            hintContent = this.options.getHintContent(question, correctAnswer);
        }

        if (isCorrect) {
            this.showModal('✓ 正解！', 'success', hintContent);
        } else {
            this.showModal(`✗ 不正解\n正解は「${correctAnswer}」`, 'error', hintContent);
        }

        this.elements.answerInput.disabled = true;
        this.elements.submitButton.classList.add('hidden');
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

    /**
     * モーダルでフィードバックを表示
     * @param {string} message - 表示メッセージ
     * @param {string} type - フィードバックタイプ (success/error)
     * @param {string|null} hintContent - 補助表示の内容（オプション）
     */
    showModal(message, type, hintContent = null) {
        const modal = this.elements.feedbackModal;
        const messageEl = this.elements.modalMessage;
        const hintEl = this.elements.modalHint;

        // メッセージ設定（改行対応）
        messageEl.innerHTML = message.replace('\n', '<br>');

        // 色設定
        messageEl.classList.remove('text-green-600', 'text-red-600');
        if (type === 'success') {
            messageEl.classList.add('text-green-600');
        } else if (type === 'error') {
            messageEl.classList.add('text-red-600');
        }

        // 補助表示
        if (hintContent && hintEl) {
            hintEl.textContent = hintContent;
            hintEl.classList.remove('hidden');
        } else if (hintEl) {
            hintEl.classList.add('hidden');
        }

        // モーダル表示
        modal.classList.remove('hidden');

        // クリック/タップで閉じるイベント（一度きり）
        const closeHandler = () => {
            modal.classList.add('hidden');
            modal.removeEventListener('click', closeHandler);
            document.removeEventListener('keydown', keyHandler);
            this.presentNewQuestion();
        };

        // キーボード対応（Enter/Space/Escapeで閉じる）
        const keyHandler = (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                e.preventDefault();
                closeHandler();
            }
        };

        modal.addEventListener('click', closeHandler);
        document.addEventListener('keydown', keyHandler);
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.DrillController = DrillController;
}
