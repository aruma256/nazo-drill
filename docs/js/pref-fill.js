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

        // 重複出題防止用
        this.lastPref = null;

        // 漢字→ひらがなのマッピング
        this.kanjiToHiragana = {
            '北海道': 'ほっかいどう',
            '青森': 'あおもり',
            '岩手': 'いわて',
            '宮城': 'みやぎ',
            '秋田': 'あきた',
            '山形': 'やまがた',
            '福島': 'ふくしま',
            '茨城': 'いばらき',
            '栃木': 'とちぎ',
            '群馬': 'ぐんま',
            '埼玉': 'さいたま',
            '千葉': 'ちば',
            '東京': 'とうきょう',
            '神奈川': 'かながわ',
            '新潟': 'にいがた',
            '富山': 'とやま',
            '石川': 'いしかわ',
            '福井': 'ふくい',
            '山梨': 'やまなし',
            '長野': 'ながの',
            '岐阜': 'ぎふ',
            '静岡': 'しずおか',
            '愛知': 'あいち',
            '三重': 'みえ',
            '滋賀': 'しが',
            '京都': 'きょうと',
            '大阪': 'おおさか',
            '兵庫': 'ひょうご',
            '奈良': 'なら',
            '和歌山': 'わかやま',
            '鳥取': 'とっとり',
            '島根': 'しまね',
            '岡山': 'おかやま',
            '広島': 'ひろしま',
            '山口': 'やまぐち',
            '徳島': 'とくしま',
            '香川': 'かがわ',
            '愛媛': 'えひめ',
            '高知': 'こうち',
            '福岡': 'ふくおか',
            '佐賀': 'さが',
            '長崎': 'ながさき',
            '熊本': 'くまもと',
            '大分': 'おおいた',
            '宮崎': 'みやざき',
            '鹿児島': 'かごしま',
            '沖縄': 'おきなわ'
        };

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
     * 回答を正規化する（漢字・カタカナをひらがなに変換）
     * @param {string} answer
     * @returns {string}
     */
    normalizeAnswer(answer) {
        const trimmed = answer.toString().trim();

        // 漢字の都道府県名をひらがなに変換
        if (this.kanjiToHiragana[trimmed]) {
            return this.kanjiToHiragana[trimmed];
        }

        // カタカナをひらがなに変換
        return DrillUtils.katakanaToHiragana(trimmed);
    }

    /**
     * 問題を生成する
     * @returns {Object} { question: string, answer: string }
     */
    generateQuestion() {
        const maxRetries = 100;

        for (let retry = 0; retry < maxRetries; retry++) {
            // ランダムに都道府県を選択（前回と同じものは除外）
            const pref = DrillUtils.getRandomElementExcluding(this.prefectures, this.lastPref);

            const questionStr = this.generateQuestionString(pref);

            if (questionStr !== null) {
                this.lastPref = pref;
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
