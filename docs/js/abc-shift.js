/**
 * アルファベットシフト ドリル
 * A+1→B, Z-1→Y のようにアルファベットをずらす
 */
class AlphaShiftDrill extends DrillBase {
    constructor() {
        super('abc-shift');
    }

    /**
     * 問題を生成する
     * @returns {Object} { question: string, answer: string }
     */
    generateQuestion() {
        // A〜Zのランダムなアルファベットを生成
        const baseChar = String.fromCharCode(65 + DrillUtils.getRandomInt(0, 25)); // A=65

        // シフト量を-5〜+5の範囲でランダムに生成（0は除外）
        let shift;
        do {
            shift = DrillUtils.getRandomInt(-5, 5);
        } while (shift === 0);

        // シフト後の文字を計算（A-Z範囲内で循環）
        const baseCode = baseChar.charCodeAt(0) - 65; // 0-25の範囲に正規化
        let shiftedCode = (baseCode + shift) % 26;

        // 負の値の場合は正の値に変換
        if (shiftedCode < 0) {
            shiftedCode += 26;
        }

        const answer = String.fromCharCode(65 + shiftedCode);

        // 問題文を生成
        const sign = shift > 0 ? '+' : '';
        const question = `${baseChar}${sign}${shift}`;

        return {
            question: question,
            answer: answer
        };
    }

    /**
     * 回答を正規化する（大文字に統一）
     * @param {string} answer
     * @returns {string}
     */
    normalizeAnswer(answer) {
        return answer.toString().trim().toUpperCase();
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.AlphaShiftDrill = AlphaShiftDrill;
}
