interface I18N_Langs {
  validation: {
    /**
     * バリデーションエラー（タイトル）
     */
    error: string;
    /**
     * 単一
     */
    single: LangValue<{ s?: string; }>;
    /**
     * 複数
     */
    multiple: LangValue<{ s?: string; }>;
    /**
     * 変換成功
     */
    parseSucceeded: LangValue<{ s?: string; type: string; before?: string | number | boolean | Date | null | undefined; after?: string | number | boolean | Date | null | undefined; }>;
    /**
     * 変換失敗
     */
    parseFailed: LangValue<{ s?: string; type: string; value?: string | number | boolean | Date | null | undefined; }>;
    /**
     * 型一致
     */
    typeOf: LangValue<{ s?: string; type: string; mode?: "input" | "set" }>;
    /**
     * 必須
     */
    required: LangValue<{ s?: string; mode?: "input" | "select" | "set"; }>;
    /**
     * 文字数一致
     */
    length: LangValue<{ s?: string; len: number; cur?: number; }>;
    /**
     * 最小文字数
     */
    minLength: LangValue<{ s?: string; minLen: number; cur?: number; }>
    /**
     * 最大文字数
     */
    maxLength: LangValue<{ s?: string; maxLen: number; cur?: number; }>;
    /**
     * 最小・最大文字数
     */
    rangeLength: LangValue<{ s?: string; minLen: number; maxLen: number; cur?: number; }>
    /**
     * 最小数値
     */
    min: LangValue<{ s?: string; min: number; }>;
    /**
     * 最大数値
     */
    max: LangValue<{ s?: string; max: number; }>;
    /**
     * 最小・最大数値
     */
    range: LangValue<{ s?: string; min: number; max: number; }>;
    /**
     * 有効小数値
     */
    float: LangValue<{ s?: string; float: number; cur?: number; }>;
    /**
     * 件数一致
     */
    number: LangValue<{ s?: string; num: number; cur?: number; }>;
    /**
     * 最小件数
     */
    minNumber: LangValue<{ s?: string; minNum: number; cur?: number; }>;
    /**
     * 最大件数
     */
    maxNumber: LangValue<{ s?: string; maxNum: number; cur?: number; }>;
    /**
     * 最小・最大件数
     */
    rangeNumber: LangValue<{ s?: string; minNum: number; maxNum: number; cur?: number; }>;
    /**
     * 最小日時
     */
    minDate: LangValue<{ s?: string; minDate: string; }>;
    /**
     * 最大日時
     */
    maxDate: LangValue<{ s?: string; maxDate: string; }>;
    /**
     * 最小・最大日時
     */
    rangeDate: LangValue<{ s?: string; minDate: string; maxDate: string; }>;
    /**
     * 日付前後関係
     */
    contextDate: LangValue<{ s?: string; }>;
    /**
     * 時間前後関係
     */
    contextTime: LangValue<{ s?: string; }>;
    /**
     * ファイル拡張子
     */
    fileAccept: LangValue<{ s?: string; }>;
    /**
     * ファイルサイズ
     */
    fileSize: LangValue<{ s?: string; size: string; }>;
    /**
     * 選択可能値
     */
    contain: LangValue<{ s?: string; }>;
    /**
     * 選択肢に存在しない
     */
    choices: LangValue<{ s?: string; value: string | number | boolean | Date | null | undefined; }>
    /**
     * 文字列パターン
     */
    stringPattern: LangValue<{ s?: string; pattern: string; }>;
    /**
     * 数値
     */
    int: LangValue<{ s?: string; }>;
    /**
     * 半角数字
     */
    halfNum: LangValue<{ s?: string; }>;
    /**
     * 全角数字
     */
    fullNum: LangValue<{ s?: string; }>;
    /**
     * 数字
     */
    num: LangValue<{ s?: string; }>;
    /**
     * 半角英字
     */
    halfAlpha: LangValue<{ s?: string; }>;
    /**
     * 全角英字
     */
    fullAlpha: LangValue<{ s?: string; }>;
    /**
     * 英字
     */
    alpha: LangValue<{ s?: string; }>;
    /**
     * 半角英数字
     */
    halfAlphaNum: LangValue<{ s?: string; }>;
    /**
     * 半角英数字記号
     */
    halfApphaNumSyn: LangValue<{ s?: string; }>;
    /**
     * 半角カタカナ
     */
    halfKatakana: LangValue<{ s?: string; }>;
    /**
     * 全角カタカナ
     */
    fullKatakana: LangValue<{ s?: string; }>;
    /**
     * カタカナ
     */
    katakana: LangValue<{ s?: string; }>;
    /**
     * ひらがな
     */
    hiragana: LangValue<{ s?: string; }>;
    /**
     * 半角
     */
    halfWidth: LangValue<{ s?: string; }>;
    /**
     * 全角
     */
    fullWidth: LangValue<{ s?: string; }>;
    /**
     * メールアドレス
     */
    email: LangValue<{ s?: string; }>;
    /**
     * 電話番号
     */
    tel: LangValue<{ s?: string; }>;
    /**
     * URL
     */
    url: LangValue<{ s?: string; }>;
    /**
     * サイン
     */
    writeSign: LangValue<{ s?: string; }>;
  };
}
