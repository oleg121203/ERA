import React, { useState } from 'react';

interface AnalysisTypeConfig {
  name: string;
  confidence: number;
  impact: number;
  priority: number;
}

const defaultTypes: AnalysisTypeConfig[] = [
  { name: 'basic', confidence: 80, impact: 70, priority: 75 },
  { name: 'security', confidence: 90, impact: 80, priority: 85 },
  { name: 'performance', confidence: 85, impact: 75, priority: 80 },
  { name: 'syntax', confidence: 95, impact: 60, priority: 70 },
  { name: 'imports', confidence: 85, impact: 75, priority: 80 },
  { name: 'breakpoint', confidence: 80, impact: 70, priority: 75 },
];

export function AnalysisForm() {
  const [selectedPath, setSelectedPath] = useState('./tsrc');
  const [recursive, setRecursive] = useState(true);
  const [autoApply, setAutoApply] = useState(true);
  const [format, setFormat] = useState(true);
  const [metrics, setMetrics] = useState(true);
  const [strict, setStrict] = useState(true);
  const [depth, setDepth] = useState(2);
  const [exclude, setExclude] = useState('node_modules');
  const [logFile, setLogFile] = useState('analysis_report.json');
  const [analysisTypes, setAnalysisTypes] = useState(defaultTypes);

  const handleTypeChange = (index: number, field: keyof AnalysisTypeConfig, value: number) => {
    const newTypes = [...analysisTypes];
    (newTypes[index] as any)[field] = value;
    setAnalysisTypes(newTypes);
  };

  const handleRunAnalysis = () => {
    const typesParam = analysisTypes
      .map(t => {
        return `${t.name}:confidence=${t.confidence}:impact=${t.impact}:priority=${t.priority}`;
      })
      .join(',');

    const command = [
      'node src/main.js analyze',
      selectedPath,
      recursive ? '--recursive' : '',
      `--types=${typesParam}`,
      `--fix=70`,
      autoApply ? '--auto-apply' : '',
      format ? '--format' : '',
      metrics ? '--metrics' : '',
      strict ? '--strict' : '',
      `--depth=${depth}`,
      exclude ? `--exclude="${exclude}"` : '',
      `--log-file=${logFile}`,
    ]
      .filter(Boolean)
      .join(' ');

    alert(`Команда запуска анализа:\n${command}`);
  };

  return (
    <div style={{ padding: '1em', fontFamily: 'sans-serif' }}>
      <h2>Графический интерфейс анализа кода</h2>

      <div>
        <label>Путь к анализируемой папке: </label>
        <input
          value={selectedPath}
          onChange={(e) => setSelectedPath(e.target.value)}
          style={{ width: '200px', marginRight: '1em' }}
        />
      </div>

      <div style={{ marginTop: '0.5em' }}>
        <label>
          <input
            type="checkbox"
            checked={recursive}
            onChange={(e) => setRecursive(e.target.checked)}
          />
          Рекурсивно
        </label>

        <label style={{ marginLeft: '1em' }}></label>
          <input
            type="checkbox"
            checked={autoApply}
            onChange={(e) => setAutoApply(e.target.checked)}
          />
          Авто-применение
        </label>

        <label style={{ marginLeft: '1em' }}>
          <input
            type="checkbox"
            checked={format}
            onChange={(e) => setFormat(e.target.checked)}
          />
          Форматирование
        </label>

        <label style={{ marginLeft: '1em' }}>
          <input
            type="checkbox"
            checked={metrics}
            onChange={(e) => setMetrics(e.target.checked)}
          />
          Метрики
        </label>

        <label style={{ marginLeft: '1em' }}>
          <input
            type="checkbox"
            checked={strict}
            onChange={(e) => setStrict(e.target.checked)}
          />
          Строгий режим
        </label>
      </div>

      <div style={{ marginTop: '1em' }}>
        <label>Глубина анализа: </label>
        <input
          type="number"
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
          style={{ width: '50px', marginRight: '1em' }}
        />

        <label>Исключить: </label>
        <input
          value={exclude}
          onChange={(e) => setExclude(e.target.value)}
          style={{ width: '120px', marginRight: '1em' }}
        />

        <label>Лог-файл: </label>
        <input
          value={logFile}
          onChange={(e) => setLogFile(e.target.value)}
          style={{ width: '140px' }}
        />
      </div>

      <h3 style={{ marginTop: '1em' }}>Типы анализа</h3>
      {analysisTypes.map((typeCfg, index) => (
        <div key={index} style={{ border: '1px solid #ccc', padding: '0.5em', marginBottom: '0.5em' }}>
          <strong>{typeCfg.name}</strong>
          <div>
            Confidence:
            <input
              type="number"
              value={typeCfg.confidence}
              onChange={(e) => handleTypeChange(index, 'confidence', Number(e.target.value))}
            />
            Impact:
            <input
              type="number"
              value={typeCfg.impact}
              onChange={(e) => handleTypeChange(index, 'impact', Number(e.target.value))}
            />
            Priority:
            <input
              type="number"
              value={typeCfg.priority}
              onChange={(e) => handleTypeChange(index, 'priority', Number(e.target.value))}
            />
          </div>
        </div>
      ))}

      <button style={{ marginTop: '1em' }} onClick={handleRunAnalysis}>
        Запустить анализ
      </button>
    </div>
  );
}