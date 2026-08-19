import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addEcho,
  extractSignals,
  normalizeEchoText,
  rankArtifacts,
} from './engine.mjs';

const ARTIFACTS = [
  {
    id: 'helix',
    title: 'ヘリックスカルーセル',
    category: 'Carousel',
    description: '立体空間を慣性で滑る未来的なカルーセル。',
    signals: ['carousel', '3d', 'motion', 'future'],
  },
  {
    id: 'forge',
    title: '活字鍛冶場',
    category: 'Text',
    description: '文字を熱して打つ手仕事のUI。',
    signals: ['text', 'craft', 'warm'],
  },
  {
    id: 'form',
    title: '静かなフォーム',
    category: 'Form',
    description: '日常の入力を邪魔しない実用的なフォーム。',
    signals: ['form', 'quiet', 'utility'],
  },
];

test('normalizeEchoText は全角とひらがなのゆれを同じ波形として扱う', () => {
  // このテストが防ぐ破壊: NFKC または仮名正規化の削除。
  assert.equal(normalizeEchoText('Ｆｕｔｕｒｅ かるーせる'), 'future カルーセル');
});

test('extractSignals は文章の曖昧な印象語を複数の意味信号に展開する', () => {
  // このテストが防ぐ破壊: 最初に見つけた別名だけを返す実装。
  assert.deepEqual(extractSignals('未来的で、触ると動くもの'), ['future', 'tactile', 'motion']);
});

test('rankArtifacts は引力の波に共鳴する対象を先頭にする', () => {
  // このテストが防ぐ破壊: 信号マッチ加点の欠落や並び順の反転。
  const ranked = rankArtifacts(ARTIFACTS, [
    { term: '未来的で動く', mode: 'attract' },
  ]);

  assert.equal(ranked[0].id, 'helix');
  assert.deepEqual(ranked[0].matchedSignals, ['future', 'motion']);
  assert.ok(ranked[0].resonance > ranked[1].resonance);
});

test('rankArtifacts は斥力の波に触れた対象を沈める', () => {
  // このテストが防ぐ破壊: repel の符号取り違え。
  const ranked = rankArtifacts(ARTIFACTS, [
    { term: '未来的で動く', mode: 'attract' },
    { term: '3Dは違う', mode: 'repel' },
  ]);
  const helix = ranked.find((item) => item.id === 'helix');

  assert.equal(helix.repelled, true);
  assert.equal(ranked.at(-1).id, 'helix');
});

test('addEcho は同じ意味の波を重複させず、反対モードに置き換える', () => {
  // このテストが防ぐ破壊: 連打によるチップ増殖と引力/斥力の同時存在。
  const once = addEcho([], { term: '　未来　', mode: 'attract' });
  const duplicate = addEcho(once, { term: '未来', mode: 'attract' });
  const replaced = addEcho(duplicate, { term: '未来', mode: 'repel' });

  assert.equal(duplicate.length, 1);
  assert.deepEqual(replaced, [{ term: '未来', mode: 'repel' }]);
});

test('結果から放った波はその特徴を他の対象との類似度に使う', () => {
  // このテストが防ぐ破壊: 結果由来の signals をラベル文字列だけに退化させる変更。
  const echoes = addEcho([], {
    term: 'helix-reference',
    label: 'ヘリックスに似たもの',
    signals: ['spatial', 'motion'],
    mode: 'attract',
  });
  const ranked = rankArtifacts(ARTIFACTS, echoes);

  assert.deepEqual(echoes[0], {
    term: 'helix-reference',
    label: 'ヘリックスに似たもの',
    signals: ['spatial', 'motion'],
    mode: 'attract',
  });
  assert.equal(ranked[0].id, 'helix');
  assert.deepEqual(ranked[0].matchedSignals, ['spatial', 'motion']);
});
