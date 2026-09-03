// ============================================
// НАСТРОЙКИ
// ============================================
const MAX_PIECES = 150;
const MIN_PIECE_SIZE = 40;
const MAX_DIMENSION = 800;
const MIN_MOVES_TO_WIN = 5;

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let pieces = [];
let selectedPiece = null;
let moves = 0;
let correctPieces = 0;
let totalPieces = 0;
let imageData = null;
let cols = 0;
let rows = 0;
let pieceSize = 0;
let currentMode = null;
let gameStarted = false;
let currentPieceWidth = 0;
let currentPieceHeight = 0;

// ============================================
// ВИДИМАЯ ОТЛАДКА
// ============================================


// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM загружен');
    

    
    // Проверяем config.js
    if (typeof window.MY_PHOTO_BASE64 === 'undefined') {
        console.log('⚠️ MY_PHOTO_BASE64 не определён');
        window.MY_PHOTO_BASE64 = '';
    } else {
        console.log('✅ MY_PHOTO_BASE64 определён, длина: ' + window.MY_PHOTO_BASE64.length);
    }
    
    // Привязываем обработчик
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
        console.log('✅ Обработчик файла привязан');
    } else {
        console.log(' #imageInput не найден!');
    }
});

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log(' Файл: ' + file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
        console.log('✅ FileReader OK');
        processImage(event.target.result);
    };
    reader.onerror = () => console.log('❌ FileReader error');
    reader.readAsDataURL(file);
}

// ============================================
// ВЫБОР РЕЖИМА
// ============================================
function selectMode(mode) {
    console.log('🎮 selectMode: ' + mode);
    currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    const anyPhotoGroup = document.getElementById('anyPhotoGroup');
    const pieceInfo = document.getElementById('pieceInfo');
    const startBtn = document.getElementById('startBtn');
    
    if (anyPhotoGroup) anyPhotoGroup.classList.remove('active');
    if (pieceInfo) pieceInfo.style.display = 'none';
    if (startBtn) startBtn.classList.remove('active');
    
    imageData = null;
    gameStarted = false;

    if (mode === 'my') {
        console.log('📸 Режим: Наше фото');
        const buttons = document.querySelectorAll('.mode-btn');
        if (buttons[0]) buttons[0].classList.add('active');
        
        if (!window.MY_PHOTO_BASE64 || window.MY_PHOTO_BASE64 === '') {
            console.log(' MY_PHOTO_BASE64 пустой!');
            alert('⚠️ Фото не добавлено!\n\n1. Открой config.js\n2. Вставь base64 в MY_PHOTO_BASE64\n3. Обнови страницу');
            return;
        }
        
        console.log('✅ MY_PHOTO_BASE64 длина: ' + window.MY_PHOTO_BASE64.length);
        processImage(window.MY_PHOTO_BASE64);
    } else {
        console.log('📷 Режим: Любое фото');
        const buttons = document.querySelectorAll('.mode-btn');
        if (buttons[1]) buttons[1].classList.add('active');
        if (anyPhotoGroup) anyPhotoGroup.classList.add('active');
    }
}

// ============================================
// ОБРАБОТКА ИЗОБРАЖЕНИЯ
// ============================================
function processImage(src) {
    console.log('🔄 processImage start');
    
    if (!src) {
        console.log('❌ src пустой');
        return;
    }
    
    const img = new Image();
    
    img.onload = () => {
        console.log('✅ img.onload: ' + img.width + 'x' + img.height);
        
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
            console.log(' Уменьшено: ' + width + 'x' + height);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            console.log('❌ ctx null');
            return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        imageData = canvas.toDataURL();
        
        console.log('✅ imageData длина: ' + imageData.length);

        const totalArea = width * height;
        const areaPerPiece = totalArea / MAX_PIECES;
        pieceSize = Math.max(MIN_PIECE_SIZE, Math.round(Math.sqrt(areaPerPiece)));
        
        cols = Math.floor(width / pieceSize);
        rows = Math.floor(height / pieceSize);
        
        cols = Math.max(4, cols);
        rows = Math.max(4, rows);
        
        totalPieces = cols * rows;

        console.log('🧩 Сетка: ' + cols + 'x' + rows + ' = ' + totalPieces);

        const photoSizeEl = document.getElementById('photoSize');
        const pieceCountEl = document.getElementById('pieceCount');
        const gridSizeEl = document.getElementById('gridSize');
        const pieceSizeDisplayEl = document.getElementById('pieceSizeDisplay');
        const pieceInfoEl = document.getElementById('pieceInfo');
        const startBtn = document.getElementById('startBtn');
        
        if (photoSizeEl) photoSizeEl.textContent = width + '×' + height;
        if (pieceCountEl) pieceCountEl.textContent = totalPieces;
        if (gridSizeEl) gridSizeEl.textContent = cols + '×' + rows;
        if (pieceSizeDisplayEl) pieceSizeDisplayEl.textContent = pieceSize;
        if (pieceInfoEl) pieceInfoEl.style.display = 'block';
        if (startBtn) startBtn.classList.add('active');
        
        console.log('✅ Готово к игре!');
    };
    
    img.onerror = () => {
        console.log('❌ img.onerror');
        alert('Ошибка загрузки изображения!');
    };
    
    img.src = src;
}

// ============================================
// НАЧАЛО ИГРЫ
// ============================================
function startGame() {
    console.log('🎮 startGame');
    console.log('imageData: ' + (imageData ? 'OK (' + imageData.length + ')' : 'НЕТ'));
    
    if (!imageData) {
        console.log('❌ imageData отсутствует');
        alert('⚠️ Сначала выбери фото!');
        return;
    }

    gameStarted = true;
    
    const controlsPanel = document.getElementById('controlsPanel');
    if (controlsPanel) controlsPanel.style.display = 'none';
    
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) {
        gameInfo.style.display = 'flex';
        gameInfo.classList.add('active');
    }
    
    const puzzleContainer = document.getElementById('puzzleContainer');
    if (puzzleContainer) {
        puzzleContainer.style.display = 'block';
        puzzleContainer.classList.add('active');
    }
    
    const totalCountEl = document.getElementById('totalCount');
    if (totalCountEl) totalCountEl.textContent = totalPieces;

    console.log('🔄 createPuzzle...');
    createPuzzle();
}

// ============================================
// СОЗДАНИЕ ПАЗЛА
// ============================================
function createPuzzle() {
    console.log(' createPuzzle start');
    
    const board = document.getElementById('puzzleBoard');
    if (!board) {
        console.log('❌ #puzzleBoard не найден!');
        return;
    }
    
    board.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    board.innerHTML = '';
    pieces = [];
    selectedPiece = null;
    moves = 0;
    correctPieces = 0;

    const img = new Image();
    
    img.onload = () => {
        console.log('✅ img.onload для пазла');
        
        const pieceWidth = img.width / cols;
        const pieceHeight = img.height / rows;
        
        currentPieceWidth = pieceWidth;
        currentPieceHeight = pieceHeight;
        
        console.log('📐 Кусочек: ' + Math.round(pieceWidth) + 'x' + Math.round(pieceHeight));

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = pieceWidth;
                    canvas.height = pieceHeight;
                    const ctx = canvas.getContext('2d');
                    
                    if (!ctx) continue;
                    
                    ctx.drawImage(
                        img,
                        col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight,
                        0, 0, pieceWidth, pieceHeight
                    );

                    pieces.push({
                        id: row * cols + col,
                        correctId: row * cols + col,
                        imageData: canvas.toDataURL()
                    });
                } catch (e) {
                    console.log('❌ Ошибка кусочка: ' + e.message);
                }
            }
        }

        console.log('✅ Создано ' + pieces.length + ' кусочков');

        let attempts = 0;
        do {
            shuffleArray(pieces);
            attempts++;
        } while (isSolved() && attempts < 100);

        console.log('🔄 renderBoard...');
        renderBoard();
        console.log('✅ ДОСКА ГОТОВА!');
    };
    
    img.onerror = () => {
        console.log('❌ img.onerror для пазла');
        alert('Ошибка создания пазла!');
    };
    
    img.src = imageData;
}

function isSolved() {
    const correctCount = pieces.filter((p, i) => p.id === i).length;
    console.log('✅ Правильных: ' + correctCount + ' из ' + totalPieces);
    return correctCount === totalPieces;
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// ============================================
// ОТРИСОВКА ДОСКИ
// ============================================
function renderBoard() {
    console.log('🎨 renderBoard start, pieces: ' + pieces.length);
    
    const board = document.getElementById('puzzleBoard');
    if (!board) {
        console.log('❌ #puzzleBoard не найден');
        return;
    }
    
    board.innerHTML = '';

    // Вычисляем размеры кусочка из imageData
    const tempImg = new Image();
    tempImg.onload = () => {
        const pieceWidth = tempImg.width / cols;
        const pieceHeight = tempImg.height / rows;
        
        console.log('📐 Размер кусочка: ' + Math.round(pieceWidth) + 'x' + Math.round(pieceHeight));

        pieces.forEach((piece, index) => {
            try {
                const pieceDiv = document.createElement('div');
                pieceDiv.className = 'puzzle-piece';
                pieceDiv.style.backgroundImage = 'url(' + piece.imageData + ')';
                pieceDiv.style.width = pieceWidth + 'px';
                pieceDiv.style.height = pieceHeight + 'px';
                pieceDiv.style.display = 'inline-block';
                pieceDiv.dataset.index = index;
                pieceDiv.style.cursor = 'pointer';
                pieceDiv.style.border = '1px solid rgba(255,255,255,0.3)';

                if (piece.id === piece.correctId) {
                    pieceDiv.classList.add('correct');
                }

                pieceDiv.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const idx = parseInt(this.dataset.index);
                    console.log('👆 Клик на кусочек #' + idx);
                    handlePieceClick(idx);
                });

                board.appendChild(pieceDiv);
            } catch (e) {
                console.log('❌ renderBoard error: ' + e.message);
            }
        });

        updateInfo();
        console.log('✅ renderBoard finished');
    };
    tempImg.src = imageData;
}

// ============================================
// ОБРАБОТКА КЛИКА
// ============================================
function handlePieceClick(index) {
    console.log('🎯 handlePieceClick вызвана, index: ' + index);
    
    if (!gameStarted) {
        console.log('⚠️ Игра не начата');
        return;
    }

    const pieceElements = document.querySelectorAll('.puzzle-piece');
    console.log('📋 pieceElements.length: ' + pieceElements.length);
    console.log('📋 selectedPiece: ' + selectedPiece);

    if (selectedPiece === null) {
        console.log('✅ Первый клик, выбираем #' + index);
        selectedPiece = index;
        if (pieceElements[index]) {
            pieceElements[index].classList.add('selected');
            console.log('✅ Добавлен класс selected');
        }
    } else if (selectedPiece === index) {
        console.log('️ Отмена выбора #' + index);
        if (pieceElements[index]) {
            pieceElements[index].classList.remove('selected');
        }
        selectedPiece = null;
    } else {
        console.log('🔄 Второй клик! Меняем #' + selectedPiece + ' <-> #' + index);
        
        const piece1 = pieces[selectedPiece];
        const piece2 = pieces[index];
        
        console.log('📊 piece1.id=' + piece1.id + ', piece2.id=' + piece2.id);
        
        // Не даём менять два правильных кусочка
        // Проверяем, находятся ли кусочки на своих правильных местах
const piece1IsCorrect = (selectedPiece === piece1.id);
const piece2IsCorrect = (index === piece2.id);

if (piece1IsCorrect && piece2IsCorrect) {
    console.log('⚠️ Оба на месте, отмена');
    if (pieceElements[selectedPiece]) {
        pieceElements[selectedPiece].classList.remove('selected');
    }
    selectedPiece = null;
    return;
}

        // МЕНЯЕМ МЕСТАМИ
        console.log('💫 ОБМЕН...');
        const temp = pieces[selectedPiece];
        pieces[selectedPiece] = pieces[index];
        pieces[index] = temp;
        
        moves++;
        console.log('📈 Ходов: ' + moves);
        
        // Снимаем выделение
        if (pieceElements[selectedPiece]) {
            pieceElements[selectedPiece].classList.remove('selected');
        }
        selectedPiece = null;
        
        console.log('🔄 Перерисовка...');
        renderBoard();

        // Проверяем победу - считаем правильные позиции
        const correctCount = pieces.filter((p, i) => p.id === i).length;
        console.log('📊 Правильных: ' + correctCount + '/' + totalPieces);

        if (correctCount === totalPieces) {
        console.log('🎉 ПОБЕДА! Все ' + totalPieces + ' кусочков на месте!');
        setTimeout(showWin, 800);
        }
    }
}

// ============================================
// ОБНОВЛЕНИЕ ИНФОРМАЦИИ
// ============================================
function updateInfo() {
    const movesCountEl = document.getElementById('movesCount');
    const correctCountEl = document.getElementById('correctCount');
    
    if (movesCountEl) movesCountEl.textContent = moves;
    
    // Правильная проверка: позиция в массиве === id кусочка
    correctPieces = pieces.filter((p, i) => p.id === i).length;
    
    if (correctCountEl) correctCountEl.textContent = correctPieces;
}
// ============================================
// ПЕРЕМЕШАТЬ ЗАНОВО
// ============================================
function shufflePieces() {
    console.log(' Перемешивание...');
    let attempts = 0;
    do {
        shuffleArray(pieces);
        attempts++;
    } while (isSolved() && attempts < 100);
    moves = 0;
    renderBoard();
}

// ============================================
// ПОДСКАЗКА
// ============================================
function showPreview() {
    const previewModal = document.getElementById('previewModal');
    const previewFull = document.getElementById('previewFull');
    if (previewFull) previewFull.src = imageData;
    if (previewModal) previewModal.classList.add('active');
}

function closePreview() {
    const previewModal = document.getElementById('previewModal');
    if (previewModal) previewModal.classList.remove('active');
}

// ============================================
// ПОБЕДА
// ============================================
function showWin() {
    console.log('🏆 showWin вызвана');
    
    const winModal = document.getElementById('winModal');
    const winImage = document.getElementById('winImage');
    const finalMoves = document.getElementById('finalMoves');
    
    if (winImage) winImage.src = imageData;
    if (finalMoves) finalMoves.textContent = moves;
    if (winModal) winModal.classList.add('active');
    
    createHearts();
}

// ============================================
// СЕРДЕЧКИ
// ============================================
function createHearts() {
    const container = document.getElementById('heartsContainer');
    if (!container) return;
    
    const hearts = ['❤️', '💕', '💖', '💗', '💝', '✨'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.top = '100%';
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 3000);
        }, i * 100);
    }
}

// ============================================
// ОБРАБОТКА ОШИБОК
// ============================================
window.addEventListener('error', (e) => {
    console.log('🔥 Глобальная ошибка: ' + e.message);
});
