import React, { useState, useEffect } from 'react';

function FileExplorer({ onSelectionChange }) {
    const [treeData, setTreeData] = React.useState([]);
    const [selectedPaths, setSelectedPaths] = React.useState([]);
    const [recursive, setRecursive] = React.useState(false);
    const [depth, setDepth] = React.useState(2);
    const [warning, setWarning] = React.useState('');

    React.useEffect(() => {
        console.log('Fetching file structure...');
        fetch('/api/files?path=./')
            .then(res => res.json())
            .then(data => {
                console.log('File structure loaded:', data);
                setTreeData(data);
            })
            .catch(err => console.error('Ошибка загрузки файлов:', err));
    }, []);

    const handleToggle = (node, isChecked) => {
        let updatedSelected = [...selectedPaths];
        if (isChecked) {
            updatedSelected.push(node.path);
            if (node.type === 'directory') {
                setRecursive(true);
                setWarning('Глубина анализа будет одинаковой для всех выбранных элементов.');
            }
        } else {
            updatedSelected = updatedSelected.filter(path => path !== node.path);
            if (node.type === 'directory') {
                setRecursive(false);
                setWarning('');
            }
        }
        setSelectedPaths(updatedSelected);
        onSelectionChange(updatedSelected, { recursive, depth });
    };

    const renderTree = (nodes) => {
        return (
            <ul>
                {nodes.map(node => (
                    <li key={node.path}>
                        <label>
                            <input
                                type="checkbox"
                                onChange={(e) => handleToggle(node, e.target.checked)}
                            />
                            {node.name}
                        </label>
                        {node.type === 'directory' && node.children && (
                            <div style={{ marginLeft: '20px' }}>
                                {renderTree(node.children)}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '10px', overflowY: 'auto', height: '100vh' }}>
            <h3>Файловый менеджер</h3>
            {renderTree(treeData)}
            {recursive && (
                <div style={{ marginTop: '10px' }}>
                    <label>Глубина анализа: </label>
                    <input
                        type="number"
                        value={depth}
                        onChange={(e) => setDepth(Number(e.target.value))}
                        style={{ width: '50px', marginRight: '10px' }}
                    />
                    {warning && <div style={{ color: 'red' }}>{warning}</div>}
                </div>
            )}
        </div>
    );
}

function App() {
    const [selectedFiles, setSelectedFiles] = React.useState([]);
    const [recursive, setRecursive] = React.useState(false);
    const [depth, setDepth] = React.useState(2);
    const [excludedPaths, setExcludedPaths] = React.useState('node_modules');
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

    const handleSelectionChange = (selectedPaths, options) => {
        setSelectedFiles(selectedPaths);
        setRecursive(options.recursive);
        setDepth(options.depth);
    };

    const handleRunAnalysis = async () => {
        if (selectedFiles.length === 0) {
            alert('Пожалуйста, выберите файлы или папки для анализа.');
            return;
        }

        const typesParam = Object.keys(analysisTypes)
            .map(type => {
                const { confidence, impact, priority } = analysisTypes[type];
                return `${type}:confidence=${confidence}:impact=${impact}:priority=${priority}`;
            })
            .join(',');

        const payload = {
            paths: selectedFiles,
            recursive,
            depth,
            types: typesParam,
            autoApply: autoApply,
            format: format,
            metrics: metrics,
            strict: strict,
            exclude: excludedPaths,
            logFile: logFile,
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
        <div style={{ display: 'flex', fontFamily: 'Arial, sans-serif' }}>
            <FileExplorer onSelectionChange={handleSelectionChange} />

            <div style={{ padding: '20px', flex: 1 }}>
                <h1>ERA Code Analyzer</h1>

                <div style={{ marginBottom: '15px' }}>
                    <label>Исключить: </label>
                    <input
                        value={excludedPaths}
                        onChange={(e) => setExcludedPaths(e.target.value)}
                        style={{ width: '200px', marginLeft: '10px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Лог-файл: </label>
                    <input
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
        </div>
    );
}

console.log('Rendering App...');
ReactDOM.render(<App />, document.getElementById('root'));
