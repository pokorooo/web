# 野球スタメンメーカー (Baseball Lineup Maker)

React + Vite + Tailwind のシンプルなウェブアプリです。フォームモードと野球場モードを切り替えて、ドラッグ&ドロップでスタメンを編集できます。ローカル保存と画像出力に対応。

## 開発

1. 依存関係をインストール

```bash
npm install
```

2. 開発サーバー起動

```bash
npm run dev
```

## 主な機能

- フォームモード: 打順・選手名・守備位置を表形式で編集、行の並び替え対応
- 野球場モード: 各守備位置に選手名を配置、ドラッグで位置入れ替え可能（ベンチ領域あり）
- データ永続化: localStorage 保存/読み込み
- 画像出力: 現在の画面を画像として保存（html2canvas）
- リセット: 空のスタメンに戻す

## 技術

- React 18 + Vite
- Tailwind CSS
- react-beautiful-dnd
- html2canvas
