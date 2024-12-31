node ➜ /workspaces/ERA (dev) $ npm run build

> era@1.0.0 build
> tsc && npm run copy-ssl

client/src/js/game.ts:3:9 - error TS7034: Variable 'startGame' implicitly has type 'any' in some locations where its type cannot be determined.

3     let startGame, pauseGame, resumeGame, stopGame;
          ~~~~~~~~~

client/src/js/game.ts:3:20 - error TS7034: Variable 'pauseGame' implicitly has type 'any' in some locations where its type cannot be determined.

3     let startGame, pauseGame, resumeGame, stopGame;
                     ~~~~~~~~~

client/src/js/game.ts:3:31 - error TS7034: Variable 'resumeGame' implicitly has type 'any' in some locations where its type cannot be determined.

3     let startGame, pauseGame, resumeGame, stopGame;
                                ~~~~~~~~~~

client/src/js/game.ts:3:43 - error TS7034: Variable 'stopGame' implicitly has type 'any' in some locations where its type cannot be determined.

3     let startGame, pauseGame, resumeGame, stopGame;
                                            ~~~~~~~~

client/src/js/game.ts:27:21 - error TS18047: 'canvas' is possibly 'null'.

27         const ctx = canvas.getContext('2d');
                       ~~~~~~

client/src/js/game.ts:27:28 - error TS2339: Property 'getContext' does not exist on type 'HTMLElement'.

27         const ctx = canvas.getContext('2d');
                              ~~~~~~~~~~

client/src/js/game.ts:50:13 - error TS7034: Variable 'snake2' implicitly has type 'any[]' in some locations where its type cannot be determined.

50         let snake2 = [];
               ~~~~~~

client/src/js/game.ts:51:13 - error TS7034: Variable 'food' implicitly has type 'any' in some locations where its type cannot be determined.

51         let food = null;
               ~~~~

client/src/js/game.ts:54:13 - error TS7034: Variable 'game' implicitly has type 'any' in some locations where its type cannot be determined.

54         let game = null;
               ~~~~

client/src/js/game.ts:72:33 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ eat: string; gameOver: string; start: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ eat: string; gameOver: string; start: string; }'.

72             if (soundEnabled && snakeSoundAssets[sound]) {
                                   ~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:73:35 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ eat: string; gameOver: string; start: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ eat: string; gameOver: string; start: string; }'.

73                 const audioPath = snakeSoundAssets[sound];
                                     ~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:99:49 - error TS18047: 'canvas' is possibly 'null'.

99                 ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                                                   ~~~~~~

client/src/js/game.ts:99:56 - error TS2339: Property 'width' does not exist on type 'HTMLElement'.

99                 ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                                                          ~~~~~

client/src/js/game.ts:99:63 - error TS18047: 'canvas' is possibly 'null'.

99                 ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                                                                 ~~~~~~

client/src/js/game.ts:99:70 - error TS2339: Property 'height' does not exist on type 'HTMLElement'.

99                 ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                                                                        ~~~~~~

client/src/js/game.ts:116:26 - error TS2339: Property 'enable3DEffect' does not exist on type '{ speed: number; snakeColor: string; backgroundImage: string; showGrid: boolean; }'.

116             if (settings.enable3DEffect) {
                             ~~~~~~~~~~~~~~

client/src/js/game.ts:117:17 - error TS18047: 'gameArea' is possibly 'null'.

117                 gameArea.classList.add('animate');
                    ~~~~~~~~

client/src/js/game.ts:119:17 - error TS18047: 'gameArea' is possibly 'null'.

119                 gameArea.classList.remove('animate');
                    ~~~~~~~~

client/src/js/game.ts:128:48 - error TS18047: 'canvas' is possibly 'null'.

128                 x: Math.floor(Math.random() * (canvas.width / box)) * box,
                                                   ~~~~~~

client/src/js/game.ts:128:55 - error TS2339: Property 'width' does not exist on type 'HTMLElement'.

128                 x: Math.floor(Math.random() * (canvas.width / box)) * box,
                                                          ~~~~~

client/src/js/game.ts:129:48 - error TS18047: 'canvas' is possibly 'null'.

129                 y: Math.floor(Math.random() * (canvas.height / box)) * box,
                                                   ~~~~~~

client/src/js/game.ts:129:55 - error TS2339: Property 'height' does not exist on type 'HTMLElement'.

129                 y: Math.floor(Math.random() * (canvas.height / box)) * box,
                                                          ~~~~~~

client/src/js/game.ts:145:33 - error TS18047: 'canvas' is possibly 'null'.

145             ctx.clearRect(0, 0, canvas.width, canvas.height);
                                    ~~~~~~

client/src/js/game.ts:145:40 - error TS2339: Property 'width' does not exist on type 'HTMLElement'.

145             ctx.clearRect(0, 0, canvas.width, canvas.height);
                                           ~~~~~

client/src/js/game.ts:145:47 - error TS18047: 'canvas' is possibly 'null'.

145             ctx.clearRect(0, 0, canvas.width, canvas.height);
                                                  ~~~~~~

client/src/js/game.ts:145:54 - error TS2339: Property 'height' does not exist on type 'HTMLElement'.

145             ctx.clearRect(0, 0, canvas.width, canvas.height);
                                                         ~~~~~~

client/src/js/game.ts:153:17 - error TS7005: Variable 'food' implicitly has an 'any' type.

153             if (food) {
                    ~~~~

client/src/js/game.ts:159:17 - error TS7005: Variable 'snake2' implicitly has an 'any[]' type.

159                 snake2.forEach((part, index) => {
                    ~~~~~~

client/src/js/game.ts:173:45 - error TS18047: 'canvas' is possibly 'null'.

173                 ctx.fillText(blinkingCount, canvas.width / 2, 80);
                                                ~~~~~~

client/src/js/game.ts:173:52 - error TS2339: Property 'width' does not exist on type 'HTMLElement'.

173                 ctx.fillText(blinkingCount, canvas.width / 2, 80);
                                                       ~~~~~

client/src/js/game.ts:188:33 - error TS18047: 'canvas' is possibly 'null'.

188             for (let x = 0; x < canvas.width; x += box) {
                                    ~~~~~~

client/src/js/game.ts:188:40 - error TS2339: Property 'width' does not exist on type 'HTMLElement'.

188             for (let x = 0; x < canvas.width; x += box) {
                                           ~~~~~

client/src/js/game.ts:191:31 - error TS18047: 'canvas' is possibly 'null'.

191                 ctx.lineTo(x, canvas.height);
                                  ~~~~~~

client/src/js/game.ts:191:38 - error TS2339: Property 'height' does not exist on type 'HTMLElement'.

191                 ctx.lineTo(x, canvas.height);
                                         ~~~~~~

client/src/js/game.ts:194:33 - error TS18047: 'canvas' is possibly 'null'.

194             for (let y = 0; y < canvas.height; y += box) {
                                    ~~~~~~

client/src/js/game.ts:194:40 - error TS2339: Property 'height' does not exist on type 'HTMLElement'.

194             for (let y = 0; y < canvas.height; y += box) {
                                           ~~~~~~

client/src/js/game.ts:197:28 - error TS18047: 'canvas' is possibly 'null'.

197                 ctx.lineTo(canvas.width, y);
                               ~~~~~~

client/src/js/game.ts:197:35 - error TS2339: Property 'width' does not exist on type 'HTMLElement'.

197                 ctx.lineTo(canvas.width, y);
                                      ~~~~~

client/src/js/game.ts:217:29 - error TS2339: Property 'snakePattern' does not exist on type '{ speed: number; snakeColor: string; backgroundImage: string; showGrid: boolean; }'.

217             switch(settings.snakePattern) {
                                ~~~~~~~~~~~~

client/src/js/game.ts:257:34 - error TS7006: Parameter 'x' implicitly has an 'any' type.

257         function drawRoundedRect(x, y, width, height, radius): void {
                                     ~

client/src/js/game.ts:257:37 - error TS7006: Parameter 'y' implicitly has an 'any' type.

257         function drawRoundedRect(x, y, width, height, radius): void {
                                        ~

client/src/js/game.ts:257:40 - error TS7006: Parameter 'width' implicitly has an 'any' type.

257         function drawRoundedRect(x, y, width, height, radius): void {
                                           ~~~~~

client/src/js/game.ts:257:47 - error TS7006: Parameter 'height' implicitly has an 'any' type.

257         function drawRoundedRect(x, y, width, height, radius): void {
                                                  ~~~~~~

client/src/js/game.ts:257:55 - error TS7006: Parameter 'radius' implicitly has an 'any' type.

257         function drawRoundedRect(x, y, width, height, radius): void {
                                                          ~~~~~~

client/src/js/game.ts:278:21 - error TS7005: Variable 'food' implicitly has an 'any' type.

278             ctx.arc(food.x + box/2 + depth, food.y + box/2 + depth, box/2, 0, Math.PI * 2);
                        ~~~~

client/src/js/game.ts:278:45 - error TS7005: Variable 'food' implicitly has an 'any' type.

278             ctx.arc(food.x + box/2 + depth, food.y + box/2 + depth, box/2, 0, Math.PI * 2);
                                                ~~~~

client/src/js/game.ts:289:26 - error TS7005: Variable 'food' implicitly has an 'any' type.

289             ctx.fillText(food.emoji, food.x + box/2, food.y + box/2);
                             ~~~~

client/src/js/game.ts:289:38 - error TS7005: Variable 'food' implicitly has an 'any' type.

289             ctx.fillText(food.emoji, food.x + box/2, food.y + box/2);
                                         ~~~~

client/src/js/game.ts:289:54 - error TS7005: Variable 'food' implicitly has an 'any' type.

289             ctx.fillText(food.emoji, food.x + box/2, food.y + box/2);
                                                         ~~~~

client/src/js/game.ts:301:28 - error TS2531: Object is possibly 'null'.

301                 ? parseInt(document.getElementById('playersCount').value)
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:301:68 - error TS2339: Property 'value' does not exist on type 'HTMLElement'.

301                 ? parseInt(document.getElementById('playersCount').value)
                                                                       ~~~~~

client/src/js/game.ts:320:41 - error TS18047: 'canvas' is possibly 'null'.

320             if (head.x < 0 || head.x >= canvas.width ||
                                            ~~~~~~

client/src/js/game.ts:320:48 - error TS2339: Property 'width' does not exist on type 'HTMLElement'.

320             if (head.x < 0 || head.x >= canvas.width ||
                                                   ~~~~~

client/src/js/game.ts:321:41 - error TS18047: 'canvas' is possibly 'null'.

321                 head.y < 0 || head.y >= canvas.height) {
                                            ~~~~~~

client/src/js/game.ts:321:48 - error TS2339: Property 'height' does not exist on type 'HTMLElement'.

321                 head.y < 0 || head.y >= canvas.height) {
                                                   ~~~~~~

client/src/js/game.ts:329:17 - error TS7005: Variable 'food' implicitly has an 'any' type.

329             if (food && head.x === food.x && head.y === food.y) {
                    ~~~~

client/src/js/game.ts:331:17 - error TS2531: Object is possibly 'null'.

331                 document.getElementById('score').textContent = score;
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:331:17 - error TS2322: Type 'number' is not assignable to type 'string'.

331                 document.getElementById('score').textContent = score;
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:349:32 - error TS7005: Variable 'snake2' implicitly has an 'any[]' type.

349             const head2 = { ...snake2[0] };
                                   ~~~~~~

client/src/js/game.ts:356:43 - error TS18047: 'canvas' is possibly 'null'.

356             if (head2.x < 0 || head2.x >= canvas.width || head2.y < 0 || head2.y >= canvas.height) {
                                              ~~~~~~

client/src/js/game.ts:356:50 - error TS2339: Property 'width' does not exist on type 'HTMLElement'.

356             if (head2.x < 0 || head2.x >= canvas.width || head2.y < 0 || head2.y >= canvas.height) {
                                                     ~~~~~

client/src/js/game.ts:356:85 - error TS18047: 'canvas' is possibly 'null'.

356             if (head2.x < 0 || head2.x >= canvas.width || head2.y < 0 || head2.y >= canvas.height) {
                                                                                        ~~~~~~

client/src/js/game.ts:356:92 - error TS2339: Property 'height' does not exist on type 'HTMLElement'.

356             if (head2.x < 0 || head2.x >= canvas.width || head2.y < 0 || head2.y >= canvas.height) {
                                                                                               ~~~~~~

client/src/js/game.ts:361:17 - error TS7005: Variable 'food' implicitly has an 'any' type.

361             if (food && head2.x === food.x && head2.y === food.y) {
                    ~~~~

client/src/js/game.ts:363:53 - error TS2531: Object is possibly 'null'.

363                 document.getElementById('score2') ? document.getElementById('score2').textContent = score2 : null;
                                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:363:53 - error TS2322: Type 'number' is not assignable to type 'string'.

363                 document.getElementById('score2') ? document.getElementById('score2').textContent = score2 : null;
                                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:367:17 - error TS7005: Variable 'snake2' implicitly has an 'any[]' type.

367                 snake2.pop();
                    ~~~~~~

client/src/js/game.ts:402:15 - error TS2451: Cannot redeclare block-scoped variable 'handleMouseMove'.

402         const handleMouseMove: MouseMoveHandler = (event: MouseEvent): void => {
                  ~~~~~~~~~~~~~~~

client/src/js/game.ts:405:27 - error TS7005: Variable 'snake2' implicitly has an 'any[]' type.

405             const head2 = snake2[0];
                              ~~~~~~

client/src/js/game.ts:424:15 - error TS2451: Cannot redeclare block-scoped variable 'handleMouseMove'.

424         const handleMouseMove: MouseMoveHandler = (event: MouseEvent): void => {
                  ~~~~~~~~~~~~~~~

client/src/js/game.ts:427:27 - error TS7005: Variable 'snake2' implicitly has an 'any[]' type.

427             const head2 = snake2[0];
                              ~~~~~~

client/src/js/game.ts:457:17 - error TS18047: 'startStopBtn' is possibly 'null'.

457             if (startStopBtn.textContent === 'Старт') {
                    ~~~~~~~~~~~~

client/src/js/game.ts:458:17 - error TS7005: Variable 'startGame' implicitly has an 'any' type.

458                 startGame();
                    ~~~~~~~~~

client/src/js/game.ts:459:17 - error TS18047: 'startStopBtn' is possibly 'null'.

459                 startStopBtn.textContent = 'Стоп';
                    ~~~~~~~~~~~~

client/src/js/game.ts:460:17 - error TS18047: 'pauseResumeBtn' is possibly 'null'.

460                 pauseResumeBtn.disabled = false;
                    ~~~~~~~~~~~~~~

client/src/js/game.ts:460:32 - error TS2339: Property 'disabled' does not exist on type 'HTMLElement'.

460                 pauseResumeBtn.disabled = false;
                                   ~~~~~~~~

client/src/js/game.ts:462:17 - error TS7005: Variable 'stopGame' implicitly has an 'any' type.

462                 stopGame();
                    ~~~~~~~~

client/src/js/game.ts:463:17 - error TS18047: 'startStopBtn' is possibly 'null'.

463                 startStopBtn.textContent = 'Старт';
                    ~~~~~~~~~~~~

client/src/js/game.ts:464:17 - error TS18047: 'pauseResumeBtn' is possibly 'null'.

464                 pauseResumeBtn.textContent = 'Пауза';
                    ~~~~~~~~~~~~~~

client/src/js/game.ts:465:17 - error TS18047: 'pauseResumeBtn' is possibly 'null'.

465                 pauseResumeBtn.disabled = true;
                    ~~~~~~~~~~~~~~

client/src/js/game.ts:465:32 - error TS2339: Property 'disabled' does not exist on type 'HTMLElement'.

465                 pauseResumeBtn.disabled = true;
                                   ~~~~~~~~

client/src/js/game.ts:470:17 - error TS18047: 'pauseResumeBtn' is possibly 'null'.

470             if (pauseResumeBtn.textContent === 'Пауза') {
                    ~~~~~~~~~~~~~~

client/src/js/game.ts:471:17 - error TS7005: Variable 'pauseGame' implicitly has an 'any' type.

471                 pauseGame();
                    ~~~~~~~~~

client/src/js/game.ts:472:17 - error TS18047: 'pauseResumeBtn' is possibly 'null'.

472                 pauseResumeBtn.textContent = 'Продолжить';
                    ~~~~~~~~~~~~~~

client/src/js/game.ts:474:17 - error TS7005: Variable 'resumeGame' implicitly has an 'any' type.

474                 resumeGame();
                    ~~~~~~~~~~

client/src/js/game.ts:475:17 - error TS18047: 'pauseResumeBtn' is possibly 'null'.

475                 pauseResumeBtn.textContent = 'Пауза';
                    ~~~~~~~~~~~~~~

client/src/js/game.ts:480:9 - error TS18047: 'startStopBtn' is possibly 'null'.

480         startStopBtn.addEventListener('click', handleStartStop);
            ~~~~~~~~~~~~

client/src/js/game.ts:481:9 - error TS18047: 'pauseResumeBtn' is possibly 'null'.

481         pauseResumeBtn.addEventListener('click', handlePauseResume);
            ~~~~~~~~~~~~~~

client/src/js/game.ts:497:17 - error TS2531: Object is possibly 'null'.

497                 document.getElementById('score').textContent = '0';
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:499:22 - error TS7005: Variable 'food' implicitly has an 'any' type.

499                 if (!food) {
                         ~~~~

client/src/js/game.ts:519:27 - error TS7005: Variable 'game' implicitly has an 'any' type.

519             clearInterval(game);
                              ~~~~

client/src/js/game.ts:520:13 - error TS18047: 'pauseResumeBtn' is possibly 'null'.

520             pauseResumeBtn.textContent = 'Продолжить';
                ~~~~~~~~~~~~~~

client/src/js/game.ts:527:13 - error TS18047: 'pauseResumeBtn' is possibly 'null'.

527             pauseResumeBtn.textContent = 'Пауза';
                ~~~~~~~~~~~~~~

client/src/js/game.ts:533:27 - error TS7005: Variable 'game' implicitly has an 'any' type.

533             clearInterval(game);
                              ~~~~

client/src/js/game.ts:545:25 - error TS7005: Variable 'startGame' implicitly has an 'any' type.

545                         startGame();
                            ~~~~~~~~~

client/src/js/game.ts:549:25 - error TS7005: Variable 'pauseGame' implicitly has an 'any' type.

549                         pauseGame();
                            ~~~~~~~~~

client/src/js/game.ts:564:30 - error TS7006: Parameter 'message' implicitly has an 'any' type.

564         function showMessage(message, duration = 3000): void {
                                 ~~~~~~~

client/src/js/game.ts:566:13 - error TS18047: 'messageOverlay' is possibly 'null'.

566             messageOverlay.textContent = message;
                ~~~~~~~~~~~~~~

client/src/js/game.ts:567:13 - error TS18047: 'messageOverlay' is possibly 'null'.

567             messageOverlay.style.display = 'block';
                ~~~~~~~~~~~~~~

client/src/js/game.ts:569:17 - error TS18047: 'messageOverlay' is possibly 'null'.

569                 messageOverlay.style.display = 'none';
                    ~~~~~~~~~~~~~~

client/src/js/game.ts:580:13 - error TS2531: Object is possibly 'null'.

580             document.getElementById('score').textContent = '0';
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:587:13 - error TS7005: Variable 'stopGame' implicitly has an 'any' type.

587             stopGame();
                ~~~~~~~~

client/src/js/game.ts:590:40 - error TS18047: 'canvas' is possibly 'null'.

590             ctx.fillText('GAME OVER!', canvas.width/3, canvas.height/2);
                                           ~~~~~~

client/src/js/game.ts:590:47 - error TS2339: Property 'width' does not exist on type 'HTMLElement'.

590             ctx.fillText('GAME OVER!', canvas.width/3, canvas.height/2);
                                                  ~~~~~

client/src/js/game.ts:590:56 - error TS18047: 'canvas' is possibly 'null'.

590             ctx.fillText('GAME OVER!', canvas.width/3, canvas.height/2);
                                                           ~~~~~~

client/src/js/game.ts:590:63 - error TS2339: Property 'height' does not exist on type 'HTMLElement'.

590             ctx.fillText('GAME OVER!', canvas.width/3, canvas.height/2);
                                                                  ~~~~~~

client/src/js/game.ts:595:33 - error TS7006: Parameter 'newSettings' implicitly has an 'any' type.

595         function updateSettings(newSettings): void {
                                    ~~~~~~~~~~~

client/src/js/game.ts:604:26 - error TS2339: Property 'snakePattern' does not exist on type '{ speed: number; snakeColor: string; backgroundImage: string; showGrid: boolean; }'.

604                 settings.snakePattern = newSettings.snakePattern;
                             ~~~~~~~~~~~~

client/src/js/game.ts:607:26 - error TS2339: Property 'gridSize' does not exist on type '{ speed: number; snakeColor: string; backgroundImage: string; showGrid: boolean; }'.

607                 settings.gridSize = newSettings.gridSize;
                             ~~~~~~~~

client/src/js/game.ts:608:17 - error TS2588: Cannot assign to 'box' because it is a constant.

608                 box = settings.gridSize;
                    ~~~

client/src/js/game.ts:608:32 - error TS2339: Property 'gridSize' does not exist on type '{ speed: number; snakeColor: string; backgroundImage: string; showGrid: boolean; }'.

608                 box = settings.gridSize;
                                   ~~~~~~~~

client/src/js/game.ts:609:17 - error TS18047: 'canvas' is possibly 'null'.

609                 canvas.width = settings.gridSize * 40; // Пример изменения размера холста
                    ~~~~~~

client/src/js/game.ts:609:24 - error TS2339: Property 'width' does not exist on type 'HTMLElement'.

609                 canvas.width = settings.gridSize * 40; // Пример изменения размера холста
                           ~~~~~

client/src/js/game.ts:609:41 - error TS2339: Property 'gridSize' does not exist on type '{ speed: number; snakeColor: string; backgroundImage: string; showGrid: boolean; }'.

609                 canvas.width = settings.gridSize * 40; // Пример изменения размера холста
                                            ~~~~~~~~

client/src/js/game.ts:610:17 - error TS18047: 'canvas' is possibly 'null'.

610                 canvas.height = settings.gridSize * 30;
                    ~~~~~~

client/src/js/game.ts:610:24 - error TS2339: Property 'height' does not exist on type 'HTMLElement'.

610                 canvas.height = settings.gridSize * 30;
                           ~~~~~~

client/src/js/game.ts:610:42 - error TS2339: Property 'gridSize' does not exist on type '{ speed: number; snakeColor: string; backgroundImage: string; showGrid: boolean; }'.

610                 canvas.height = settings.gridSize * 30;
                                             ~~~~~~~~

client/src/js/game.ts:626:35 - error TS7005: Variable 'game' implicitly has an 'any' type.

626                     clearInterval(game);
                                      ~~~~

client/src/js/game.ts:631:26 - error TS2339: Property 'enable3DEffect' does not exist on type '{ speed: number; snakeColor: string; backgroundImage: string; showGrid: boolean; }'.

631                 settings.enable3DEffect = newSettings.enable3DEffect;
                             ~~~~~~~~~~~~~~

client/src/js/game.ts:635:31 - error TS7005: Variable 'game' implicitly has an 'any' type.

635                 clearInterval(game);
                                  ~~~~

client/src/js/game.ts:650:40 - error TS2531: Object is possibly 'null'.

650                 const speed = parseInt(document.getElementById('speed').value);
                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:650:73 - error TS2339: Property 'value' does not exist on type 'HTMLElement'.

650                 const speed = parseInt(document.getElementById('speed').value);
                                                                            ~~~~~

client/src/js/game.ts:651:36 - error TS2531: Object is possibly 'null'.

651                 const snakeColor = document.getElementById('snakeColor').value;
                                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:651:74 - error TS2339: Property 'value' does not exist on type 'HTMLElement'.

651                 const snakeColor = document.getElementById('snakeColor').value;
                                                                             ~~~~~

client/src/js/game.ts:652:41 - error TS2531: Object is possibly 'null'.

652                 const backgroundImage = document.getElementById('backgroundImage').value;
                                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:652:84 - error TS2339: Property 'value' does not exist on type 'HTMLElement'.

652                 const backgroundImage = document.getElementById('backgroundImage').value;
                                                                                       ~~~~~

client/src/js/game.ts:653:38 - error TS2531: Object is possibly 'null'.

653                 const snakePattern = document.getElementById('snakePattern').value;
                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:653:78 - error TS2339: Property 'value' does not exist on type 'HTMLElement'.

653                 const snakePattern = document.getElementById('snakePattern').value;
                                                                                 ~~~~~

client/src/js/game.ts:654:43 - error TS2531: Object is possibly 'null'.

654                 const gridSize = parseInt(document.getElementById('gridSize').value);
                                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:654:79 - error TS2339: Property 'value' does not exist on type 'HTMLElement'.

654                 const gridSize = parseInt(document.getElementById('gridSize').value);
                                                                                  ~~~~~

client/src/js/game.ts:655:40 - error TS2531: Object is possibly 'null'.

655                 const gameDifficulty = document.getElementById('gameDifficulty').value;
                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:655:82 - error TS2339: Property 'value' does not exist on type 'HTMLElement'.

655                 const gameDifficulty = document.getElementById('gameDifficulty').value;
                                                                                     ~~~~~

client/src/js/game.ts:668:17 - error TS2531: Object is possibly 'null'.

668                 document.getElementById('settingsPanel').style.display = 'none';
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:674:35 - error TS2339: Property 'value' does not exist on type 'HTMLElement'.

674                 const lang = this.value;
                                      ~~~~~

client/src/js/game.ts:676:21 - error TS2531: Object is possibly 'null'.

676                     document.getElementById('player1-label').textContent = 'Игрок:';
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:677:21 - error TS2531: Object is possibly 'null'.

677                     document.getElementById('player2-label').textContent = 'Играки:';
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:680:21 - error TS2531: Object is possibly 'null'.

680                     document.getElementById('player1-label').textContent = 'Player:';
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:681:21 - error TS2531: Object is possibly 'null'.

681                     document.getElementById('player2-label').textContent = 'Players:';
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

client/src/js/game.ts:700:1 - error TS2322: Type '(msg: string, url: string, lineNo: number, columnNo: number, error: Error) => boolean' is not assignable to type 'OnErrorEventHandler'.
  Types of parameters 'msg' and 'event' are incompatible.
    Type 'string | Event' is not assignable to type 'string'.
      Type 'Event' is not assignable to type 'string'.

700 window.onerror = function(msg: string, url: string, lineNo: number, columnNo: number, error: Error): boolean {
    ~~~~~~~~~~~~~~

client/src/js/game.ts:701:5 - error TS2304: Cannot find name 'logger'.

701     logger.error(`Error: ${msg}\nURL: ${url}\nLine: ${lineNo}\nColumn: ${No}\nError: ${error}`);
        ~~~~~~

client/src/js/game.ts:701:74 - error TS2304: Cannot find name 'No'.

701     logger.error(`Error: ${msg}\nURL: ${url}\nLine: ${lineNo}\nColumn: ${No}\nError: ${error}`);
                                                                             ~~

client/src/types/index.ts:1:41 - error TS2307: Cannot find module '@shared/types' or its corresponding type declarations.

1 import { GameState, GameSettings } from '@shared/types';
                                          ~~~~~~~~~~~~~~~

server/src/server.ts:65:11 - error TS2451: Cannot redeclare block-scoped variable 'wss'.

65     const wss = new WebSocketServer({ port: settings.wsPort });
             ~~~

server/src/server.ts:65:39 - error TS2322: Type 'string | number' is not assignable to type 'number | undefined'.
  Type 'string' is not assignable to type 'number'.

65     const wss = new WebSocketServer({ port: settings.wsPort });
                                         ~~~~

server/src/server.ts:113:11 - error TS2451: Cannot redeclare block-scoped variable 'wss'.

113     const wss = new WebSocketServer({ server });
              ~~~


Found 145 errors in 3 files.

Errors  Files
   141  client/src/js/game.ts:3
     1  client/src/types/index.ts:1
     3  server/src/server.ts:65
node ➜ /workspaces/ERA (dev) $ 