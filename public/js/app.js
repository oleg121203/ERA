function App() {
    const [selectedPath, setSelectedPath] = React.useState('');
    const [recursive, setRecursive] = React.useState(true);
    const [autoApply, setAutoApply] = React.useState(false);
    const [format, setFormat] = React.useState(false);
    const [metrics, setMetrics] = React.useState(false);
    const [strict, setStrict] = React.useState(false);
    const [logFile, setLogFile] = React.useState('analysis_report.json');
    const [analysisTypes, setAnalysisTypes] = React.useState({
        basic: { confidence: 80, impact: 70, priority: 75 },
        security: { confidence: 90, impact: 80, priority: 85 },
        performance: { confidence: 85, impact: 75, priority: 80 },
        syntax: { confidence: 95, impact: 60, priority: 70 },
        imports: { confidence: 85, impact: 75, priority: 80 },
        breakpoint: { confidence: 80, impact: 70, priority: 75 },
    });
    const [message, setMessage] = React.useState('');

    const handleRunAnalysis = async () => {
        if (!selectedPath) {
            alert('Пожалуйста, выберите путь к файлам или папкам для анализа.');
            return;
        }

        const typesParam = Object.keys(analysisTypes)
            .map(type => {
                const { confidence, impact, priority } = analysisTypes[type];
                return `${type}:confidence=${confidence}:impact=${impact}:priority=${priority}`;
            })
            .join(',');

        const payload = {
            path: selectedPath,
            recursive,
            types: typesParam,
            autoApply,
            format,
            metrics,
            strict,
            logFile,
        };

        try {
            setMessage('Анализ запускается...');
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok) {
                setMessage('Анализ завершен успешно!');
                console.log(result);
            } else {
                setMessage(`Ошибка: ${result.error}`);
            }
        } catch (error) {
            setMessage(`Ошибка при запуске анализа: ${error.message}`);
        }
    };

    const handlePathChange = (e) => {
        setSelectedPath(e.target.value);
    };

    const handleTypeChange = (type, field, value) => {
        setAnalysisTypes(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
            },
        }));
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>ERA Code Analyzer</h1>
            
            <div style={{ marginBottom: '15px' }}>
                <label>Путь к файлам/папкам: </label>
                <input
                    type="text"
                    value={selectedPath}
                    onChange={handlePathChange}
                    placeholder="Введите путь..."
                    style={{ width: '300px', marginLeft: '10px' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>
                    <input
                        type="checkbox"
                        checked={recursive}
                        onChange={(e) => setRecursive(e.target.checked)}
                    />
                    Рекурсивный анализ
                </label>
                <label style={{ marginLeft: '20px' }}>
                    <input
                        type="checkbox"
                        checked={autoApply}
                        onChange={(e) => setAutoApply(e.target.checked)}
                    />
                    Авто-применение
                </label>
                <label style={{ marginLeft: '20px' }}>
                    <input
                        type="checkbox"
                        checked={format}
                        onChange={(e) => setFormat(e.target.checked)}
                    />
                    Форматирование
                </label>
                <label style={{ marginLeft: '20px' }}>
                    <input
                        type="checkbox"
                        checked={metrics}
                        onChange={(e) => setMetrics(e.target.checked)}
                    />
                    Метрики
                </label>
                <label style={{ marginLeft: '20px' }}>
                    <input
                        type="checkbox"
                        checked={strict}
                        onChange={(e) => setStrict(e.target.checked)}
                    />
                    Строгий режим
                </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Файл лога: </label>
                <input
                    type="text"
                    value={logFile}
                    onChange={(e) => setLogFile(e.target.value)}
                    style={{ width: '200px', marginLeft: '10px' }}
                />
            </div>

            <h3>Типы анализа</h3>
            {Object.keys(analysisTypes).map(type => (
                <div key={type} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                    <strong>{type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                    <div style={{ marginTop: '10px' }}>
                        <label>Confidence: </label>
                        <input
                            type="number"
                            value={analysisTypes[type].confidence}
                            onChange={(e) => handleTypeChange(type, 'confidence', Number(e.target.value))}
                            style={{ width: '60px', marginRight: '20px' }}
                        />
                        <label>Impact: </label>
                        <input
                            type="number"
                            value={analysisTypes[type].impact}
                            onChange={(e) => handleTypeChange(type, 'impact', Number(e.target.value))}
                            style={{ width: '60px', marginRight: '20px' }}
                        />
                        <label>Priority: </label>
                        <input
                            type="number"
                            value={analysisTypes[type].priority}
                            onChange={(e) => handleTypeChange(type, 'priority', Number(e.target.value))}
                            style={{ width: '60px' }}
                        />
                    </div>
                </div>
            ))}

            <button
                onClick={handleRunAnalysis}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Запустить анализ
            </button>

            {message && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                    {message}
                </div>
            )}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
