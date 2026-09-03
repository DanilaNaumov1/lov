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

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM загружен, начинаю инициализацию...');
    
    // Проверяем, существует ли MY_PHOTO_BASE64
    if (typeof MY_PHOTO_BASE64 === 'undefined') {
        console.warn('⚠️ MY_PHOTO_BASE64 не определён в config.js');
        window.MY_PHOTO_BASE64 = '';
    }
    
    initEventListeners();
    console.log('✅ Инициализация завершена');
});

function initEventListeners() {
    // Обработчик загрузки файла
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) {
        console.error('❌ Файл не выбран');
        return;
    }
    
    console.log('📷 Файл выбран:', file.name, file.type);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
        console.log('✅ FileReader завершил чтение');
        processImage(event.target.result);
    };
    
    reader.onerror = () => {
        console.error(' Ошибка FileReader');
        alert('Ошибка чтения файла!');
    };
    
    reader.readAsDataURL(file);
}

// ============================================
// ВЫБОР РЕЖИМА
// ============================================
function selectMode(mode) {
    console.log('🎮 selectMode вызвана, режим:', mode);
    
    currentMode = mode;
    
    // Сброс UI
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
            console.error(' MY_PHOTO_BASE64 пустой!');
            alert('⚠️ Фото ещё не добавлено!\n\n1. Открой файл config.js\n2. Вставь base64 код фото в переменную MY_PHOTO_BASE64\n3. Сохрани и обнови страницу');
            return;
        }
        
        console.log('✅ MY_PHOTO_BASE64 найден, длина:', window.MY_PHOTO_BASE64.length);
        processImage(window.MY_PHOTO_BASE64);
    } else {
        console.log(' Режим: Любое фото');
        const buttons = document.querySelectorAll('.mode-btn');
        if (buttons[1]) buttons[1].classList.add('active');
        
        if (anyPhotoGroup) anyPhotoGroup.classList.add('active');
    }
}

// ============================================
// ОБРАБОТКА ИЗОБРАЖЕНИЯ
// ============================================
function processImage(src) {
    console.log('🔄 processImage началась');
    
    if (!src) {
        console.error('❌ src пустой!');
        alert('Ошибка: изображение не загружено');
        return;
    }
    
    const img = new Image();
    
    img.onload = () => {
        console.log('✅ Изображение загружено:', img.width, 'x', img.height);
        
        let width = img.width;
        let height = img.height;
        
        // Уменьшаем если нужно
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
            console.log(' Уменьшено до:', width, 'x', height);
        }

        // Создаём canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            console.error('❌ Не удалось получить контекст canvas');
            return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        imageData = canvas.toDataURL();
        
        console.log('✅ imageData создана, длина:', imageData.length);

        // Вычисляем сетку
        const totalArea = width * height;
        const areaPerPiece = totalArea / MAX_PIECES;
        pieceSize = Math.max(MIN_PIECE_SIZE, Math.round(Math.sqrt(areaPerPiece)));
        
        cols = Math.floor(width / pieceSize);
        rows = Math.floor(height / pieceSize);
        
        cols = Math.max(4, cols);
        rows = Math.max(4, rows);
        
        totalPieces = cols * rows;

        console.log(`🧩 Сетка: ${cols}x${rows} = ${totalPieces} кусочков`);

        // Обновляем UI
        const photoSizeEl = document.getElementById('photoSize');
        const pieceCountEl = document.getElementById('pieceCount');
        const gridSizeEl = document.getElementById('gridSize');
        const pieceSizeDisplayEl = document.getElementById('pieceSizeDisplay');
        const pieceInfoEl = document.getElementById('pieceInfo');
        const startBtn = document.getElementById('startBtn');
        
        if (photoSizeEl) photoSizeEl.textContent = `${width}×${height}`;
        if (pieceCountEl) pieceCountEl.textContent = totalPieces;
        if (gridSizeEl) gridSizeEl.textContent = `${cols}×${rows}`;
        if (pieceSizeDisplayEl) pieceSizeDisplayEl.textContent = pieceSize;
        if (pieceInfoEl) pieceInfoEl.style.display = 'block';
        if (startBtn) startBtn.classList.add('active');
        
        console.log('✅ processImage завершена, кнопка "Начать игру" активна');
    };
    
    img.onerror = () => {
        console.error('❌ Ошибка загрузки изображения');
        alert('Ошибка загрузки изображения! Проверь, что base64 код правильный.');
    };
    
    img.src = src;
}

// ============================================
// НАЧАЛО ИГРЫ
// ============================================
function startGame() {
    console.log('🎮 startGame вызвана');
    console.log('imageData:', imageData ? 'существует (' + imageData.length + ' символов)' : 'НЕТ');
    
    if (!imageData) {
        console.error('❌ imageData отсутствует!');
        alert('⚠️ Сначала выбери фото!');
        return;
    }

    gameStarted = true;
    
    // Скрываем панель управления
    const controlsPanel = document.getElementById('controlsPanel');
    if (controlsPanel) controlsPanel.style.display = 'none';
    
    // Показываем игровую информацию
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) {
        gameInfo.style.display = 'flex';
        gameInfo.classList.add('active');
    }
    
    // Показываем контейнер пазла
    const puzzleContainer = document.getElementById('puzzleContainer');
    if (puzzleContainer) {
        puzzleContainer.style.display = 'block';
        puzzleContainer.classList.add('active');
    }
    
    const totalCountEl = document.getElementById('totalCount');
    if (totalCountEl) totalCountEl.textContent = totalPieces;

    console.log('🔄 Создаю пазл...');
    createPuzzle();
}

// ============================================
// СОЗДАНИЕ ПАЗЛА
// ============================================
function createPuzzle() {
    console.log('🧩 createPuzzle началась');
    
    const board = document.getElementById('puzzleBoard');
    if (!board) {
        console.error('❌ Элемент #puzzleBoard не найден!');
        alert('Ошибка: не найден элемент доски');
        return;
    }
    
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.innerHTML = '';
    pieces = [];
    selectedPiece = null;
    moves = 0;
    correctPieces = 0;

    const img = new Image();
    
    img.onload = () => {
        console.log('✅ Изображение для пазла загружено');
        
        const pieceWidth = img.width / cols;
        const pieceHeight = img.height / rows;
        console.log(`📐 Размер кусочка: ${Math.round(pieceWidth)}x${Math.round(pieceHeight)}px`);

        // Создаём кусочки
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
                    console.error('❌ Ошибка создания кусочка:', e);
                }
            }
        }

        console.log(`✅ Создано ${pieces.length} кусочков`);

        // Перемешиваем
        let attempts = 0;
        do {
            shuffleArray(pieces);
            attempts++;
        } while (isSolved() && attempts < 100);

        console.log('🔄 Рендерю доску...');
        renderBoard();
        console.log('✅ Доска готова!');
    };
    
    img.onerror = () => {
        console.error('❌ Ошибка загрузки изображения для пазла');
        alert('Ошибка создания пазла!');
    };
    
    img.src = imageData;
}

// ============================================
// ПРОВЕРКА РЕШЕНИЯ
// ============================================
function isSolved() {
    return pieces.every((p, i) => p.id === p.correctId);
}

// ============================================
// ПЕРЕМЕШИВАНИЕ
// ============================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ============================================
// ОТРИСОВКА ДОСКИ
// ============================================
function renderBoard() {
    const board = document.getElementById('puzzleBoard');
    if (!board) {
        console.error('❌ #puzzleBoard не найден в renderBoard');
        return;
    }
    
    board.innerHTML = '';

    pieces.forEach((piece, index) => {
        try {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'puzzle-piece';
            pieceDiv.style.backgroundImage = `url(${piece.imageData})`;
            pieceDiv.dataset.index = index;

            if (piece.id === piece.correctId) {
                pieceDiv.classList.add('correct');
            }

            pieceDiv.addEventListener('click', () => handlePieceClick(index));
            board.appendChild(pieceDiv);
        } catch (e) {
            console.error('❌ Ошибка создания элемента пазла:', e);
        }
    });

    updateInfo();
}

// ============================================
// ОБРАБОТКА КЛИКА
// ============================================
function handlePieceClick(index) {
    if (!gameStarted) {
        console.warn('⚠️ Игра не начата');
        return;
    }

    const pieceElements = document.querySelectorAll('.puzzle-piece');

    if (selectedPiece === null) {
        selectedPiece = index;
        if (pieceElements[index]) {
            pieceElements[index].classList.add('selected');
        }
    } else if (selectedPiece === index) {
        if (pieceElements[index]) {
            pieceElements[index].classList.remove('selected');
        }
        selectedPiece = null;
    } else {
        const piece1 = pieces[selectedPiece];
        const piece2 = pieces[index];
        
        // Не даём менять два правильных кусочка
        if (piece1.id === piece1.correctId && piece2.id === piece2.correctId) {
            if (pieceElements[selectedPiece]) {
                pieceElements[selectedPiece].classList.remove('selected');
            }
            selectedPiece = null;
            return;
        }

        // Меняем местами
        [pieces[selectedPiece], pieces[index]] = [pieces[index], pieces[selectedPiece]];
        moves++;
        selectedPiece = null;
        renderBoard();
        
        // Проверяем победу
        if (moves >= MIN_MOVES_TO_WIN && isSolved()) {
            console.log('🎉 Победа! Ходов:', moves);
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
    
    correctPieces = pieces.filter(p => p.id === p.correctId).length;
    
    if (correctCountEl) correctCountEl.textContent = correctPieces;
}

// ============================================
// ПЕРЕМЕШАТЬ ЗАНОВО
// ============================================
function shufflePieces() {
    console.log('🔀 Перемешивание...');
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
    console.log(' showWin вызвана');
    
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
    console.error('🔥 Глобальная ошибка:', e.error);
});
