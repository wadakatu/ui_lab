const SIGNAL_VOCABULARY = [
  ['future', ['future', '未来', '未知', '斬新', 'サイバー', '前代未聞']],
  ['tactile', ['tactile', '触', '手触り', '操作', 'つまみ', 'ドラッグ']],
  ['motion', ['motion', '動', '回転', '流れ', '慣性', 'アニメ', 'swipe']],
  ['spatial', ['3d', '立体', '空間', '軌道', 'cube', 'orbit', 'helix']],
  ['cosmic', ['cosmic', '宇宙', '星', '星雲', 'ブラックホール', 'nebula']],
  ['color', ['color', '色', '配色', '色彩', 'カラーピッカー']],
  ['text', ['text', 'font', '文字', '書体', 'グリフ', '活字', 'タイポグラフィ']],
  ['retro', ['retro', 'レトロ', 'crt', 'パチスロ', '懐かし']],
  ['minimal', ['minimal', 'simple', 'シンプル', '静か', '簡素']],
  ['utility', ['utility', '実用', '日常', 'form', 'フォーム', '入力']],
  ['experimental', ['experimental', '実験', '奇妙', '不思議', '変わった']],
  ['warm', ['warm', '温', '暖', '熱', '炎', 'fire']],
  ['precise', ['precise', '正確', '精密', '同期', '数値']],
  ['navigation', ['navigation', 'ナビ', '移動', 'メニュー', '導線']],
  ['feedback', ['feedback', '通知', '進捗', '反応', 'ローディング']],
];

export function normalizeEchoText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, (character) =>
      String.fromCharCode(character.charCodeAt(0) + 0x60)
    )
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractSignals(value) {
  const normalized = normalizeEchoText(value);
  const found = [];

  SIGNAL_VOCABULARY.forEach(([signal, aliases], vocabularyIndex) => {
    const indexes = aliases
      .map((alias) => normalized.indexOf(normalizeEchoText(alias)))
      .filter((index) => index >= 0);
    if (indexes.length > 0) {
      found.push({ signal, index: Math.min(...indexes), vocabularyIndex });
    }
  });

  return found
    .sort((a, b) => a.index - b.index || a.vocabularyIndex - b.vocabularyIndex)
    .map(({ signal }) => signal);
}

function directMatch(item, term) {
  const haystack = normalizeEchoText([
    item.title,
    item.category,
    item.description,
    ...(item.signals || []),
  ].join(' '));
  const normalizedTerm = normalizeEchoText(term);
  const fragments = normalizedTerm
    .split(/[\s、。,.!?！？・/|]+/)
    .filter((fragment) => fragment.length >= 2);

  return haystack.includes(normalizedTerm) || fragments.some((fragment) => haystack.includes(fragment));
}

export function rankArtifacts(items, echoes = []) {
  return items
    .map((item, originalIndex) => {
      let rawScore = 14;
      let repelled = false;
      const matchedSignals = [];
      const itemSignals = new Set(
        (item.signals || []).flatMap((signal) => [signal, ...extractSignals(signal)])
      );

      echoes.forEach((echo) => {
        const echoSignals = Array.from(new Set([
          ...extractSignals(echo.term),
          ...(echo.signals || []),
        ]));
        const sharedSignals = echoSignals.filter((signal) => itemSignals.has(signal));
        const hasDirectMatch = directMatch(item, echo.term);
        const strength = sharedSignals.length * 36 + (hasDirectMatch ? 30 : 0);

        if (echo.mode === 'repel') {
          if (strength > 0) {
            rawScore -= strength + 96;
            repelled = true;
          }
          return;
        }

        if (strength > 0) {
          rawScore += strength;
          sharedSignals.forEach((signal) => {
            if (!matchedSignals.includes(signal)) matchedSignals.push(signal);
          });
        } else {
          rawScore -= 5;
        }
      });

      return {
        ...item,
        resonance: Math.max(1, Math.min(99, Math.round(rawScore))),
        matchedSignals,
        repelled,
        originalIndex,
        rawScore,
      };
    })
    .sort((a, b) => b.rawScore - a.rawScore || a.originalIndex - b.originalIndex)
    .map(({ originalIndex: _originalIndex, rawScore: _rawScore, ...item }) => item);
}

export function addEcho(echoes, nextEcho) {
  const term = String(nextEcho?.term ?? '').replace(/\s+/g, ' ').trim();
  const mode = nextEcho?.mode === 'repel' ? 'repel' : 'attract';
  if (!term) return [...echoes];

  const identity = normalizeEchoText(term);
  const echo = { term, mode };
  if (nextEcho?.label) echo.label = String(nextEcho.label).trim();
  if (Array.isArray(nextEcho?.signals) && nextEcho.signals.length > 0) {
    echo.signals = Array.from(new Set(nextEcho.signals.map(normalizeEchoText).filter(Boolean)));
  }

  return [
    ...echoes.filter((echo) => normalizeEchoText(echo.term) !== identity),
    echo,
  ];
}
