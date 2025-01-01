class CustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    console.log('\n=== 🧪 Результаты тестирования ===');
    console.log(`✅ Успешно: ${results.numPassedTests}`);
    console.log(`❌ Ошибок: ${results.numFailedTests}`);
    console.log(`⏳ Всего тестов: ${results.numTotalTests}`);
    console.log(`⚡ Время выполнения: ${results.startTime}ms`);
    
    if (results.numFailedTests > 0) {
      console.log('\n❗ Подробности ошибок:');
      results.testResults.forEach(testFile => {
        testFile.testResults
          .filter(test => test.status === 'failed')
          .forEach(test => {
            console.log(`\n📄 ${test.fullName}`);
            console.log(`❌ ${test.failureMessages[0]}`);
          });
      });
    }
  }
}

module.exports = CustomReporter;
