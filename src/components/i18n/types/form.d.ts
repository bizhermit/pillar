interface I18N_Langs {
  form: {
    /**
     * 元に戻す
     */
    revert: string;
    /**
     * やり直す
     */
    progress: string;
    /**
     * クリアする
     */
    clear: LangValue<{ s?: string }>;
    /**
     * 履歴をクリアする
     */
    clearHistory: LangValue<{ s: string; }>;
    /**
     * キャンバスと履歴をクリアする
     */
    clearCanvasAndHistory: string;
    /**
     * 今日
     */
    today: string;
    /**
     * 選択中を表示する
     */
    dispCurrent: string;
    /**
     * サイン
     */
    sign: string;
    /**
     * キャンバス
     */
    canvas: string;
    /**
     * ファイルを選択する
     */
    selectFile: string;
    /**
     * ファイルをドラッグ＆ドロップ
     */
    dragAndDropFile: string;
  };
}
