/**
 * 都道府県名の穴埋め ドリル
 * 「◯うき◯◯」→「とうきょう」のように都道府県名を当てる
 */
class PrefFillDrill extends DrillBase {
    constructor() {
        super('pref-fill');

        // 47都道府県のリスト（ひらがな）
        this.prefectures = [
            'ほっかいどう',
            'あおもり',
            'いわて',
            'みやぎ',
            'あきた',
            'やまがた',
            'ふくしま',
            'いばらき',
            'とちぎ',
            'ぐんま',
            'さいたま',
            'ちば',
            'とうきょう',
            'かながわ',
            'にいがた',
            'とやま',
            'いしかわ',
            'ふくい',
            'やまなし',
            'ながの',
            'ぎふ',
            'しずおか',
            'あいち',
            'みえ',
            'しが',
            'きょうと',
            'おおさか',
            'ひょうご',
            'なら',
            'わかやま',
            'とっとり',
            'しまね',
            'おかやま',
            'ひろしま',
            'やまぐち',
            'とくしま',
            'かがわ',
            'えひめ',
            'こうち',
            'ふくおか',
            'さが',
            'ながさき',
            'くまもと',
            'おおいた',
            'みやざき',
            'かごしま',
            'おきなわ'
        ];

    }

    /**
     * 文字列の指定位置を◯に置換
     * @param {string} str - 元の文字列
     * @param {number[]} indices - 置換する位置の配列
     * @returns {string} 置換後の文字列
     */
    replaceWithCircle(str, indices) {
        const chars = str.split('');
        for (const idx of indices) {
            chars[idx] = '◯';
        }
        return chars.join('');
    }

    /**
     * 出題文字列が一意に正解を特定できるかチェック
     * @param {string} questionStr - 出題文字列（◯を含む）
     * @param {string} answer - 正解の都道府県名
     * @returns {boolean} 一意に特定できればtrue
     */
    isUnique(questionStr, answer) {
        // 出題文字列にマッチする都道府県を探す
        const matches = this.prefectures.filter(pref => {
            if (pref.length !== questionStr.length) return false;
            for (let i = 0; i < questionStr.length; i++) {
                if (questionStr[i] !== '◯' && questionStr[i] !== pref[i]) {
                    return false;
                }
            }
            return true;
        });
        // 正解のみがマッチすれば一意
        return matches.length === 1 && matches[0] === answer;
    }

    /**
     * できるだけ多くの文字を◯に置換した出題文字列を生成
     * @param {string} pref - 都道府県名
     * @returns {string|null} 出題文字列。作成不可ならnull
     */
    generateQuestionString(pref) {
        const indices = [];
        // シャッフルした順番で各位置を試す
        const positions = Array.from({ length: pref.length }, (_, i) => i);
        this.shuffleArray(positions);

        for (const pos of positions) {
            // この位置を◯にしても一意性が保たれるか確認
            const testIndices = [...indices, pos];
            const testStr = this.replaceWithCircle(pref, testIndices);
            if (this.isUnique(testStr, pref)) {
                indices.push(pos);
            }
        }

        // 少なくとも1文字は◯にする必要がある
        if (indices.length === 0) {
            return null;
        }

        // 少なくとも1文字は見えている必要がある
        if (indices.length === pref.length) {
            // 全文字◯は不可なので、1つ戻す
            indices.pop();
        }

        return this.replaceWithCircle(pref, indices);
    }

    /**
     * 配列をシャッフル（Fisher-Yates）
     * @param {Array} array
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = DrillUtils.getRandomInt(0, i);
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * 問題を生成する
     * @returns {Object} { question: string, answer: string }
     */
    generateQuestion() {
        const maxRetries = 100;

        for (let retry = 0; retry < maxRetries; retry++) {
            // ランダムに都道府県を選択
            const pref = DrillUtils.getRandomElement(this.prefectures);

            const questionStr = this.generateQuestionString(pref);

            if (questionStr !== null) {
                return {
                    question: questionStr,
                    answer: pref
                };
            }
        }

        // フォールバック（通常は到達しない）
        return {
            question: '◯うきょう',
            answer: 'とうきょう'
        };
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.PrefFillDrill = PrefFillDrill;
}
