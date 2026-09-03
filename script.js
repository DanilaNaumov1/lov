const MAX_PIECES = 150;
const MIN_PIECE_SIZE = 40;
const MAX_DIMENSION = 800;
const MIN_MOVES_TO_WIN = 5;

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

function selectMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('anyPhotoGroup').classList.remove('active');
    document.getElementById('pieceInfo').style.display = 'none';
    document.getElementById('startBtn').classList.remove('active');
    imageData = null;
    gameStarted = false;

    if (mode === 'my') {
        document.querySelectorAll('.mode-btn')[0].classList.add('active');
        
        if (!MY_PHOTO_BASE64) {
            alert('️ Фото ещё не добавлено!\n\nОткрой файл config.js и вставь base64 код фото.');
            return;
        }
        
        processImage(MY_PHOTO_BASE64);
    } else {
        document.querySelectorAll('.mode-btn')[1].classList.add('active');
        document.getElementById('anyPhotoGroup').classList.add('active');
    }
}

document.getElementById('imageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            processImage(event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

function processImage(src) {
    const img = new Image();
    img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        imageData = canvas.toDataURL();

        const totalArea = width * height;
        const areaPerPiece = totalArea / MAX_PIECES;
        pieceSize = Math.max(MIN_PIECE_SIZE, Math.round(Math.sqrt(areaPerPiece)));
        
        cols = Math.floor(width / pieceSize);
        rows = Math.floor(height / pieceSize);
        
        cols = Math.max(4, cols);
        rows = Math.max(4, rows);
        
        totalPieces = cols * rows;

        document.getElementById('photoSize').textContent = `${width}×${height}`;
        document.getElementById('pieceCount').textContent = totalPieces;
        document.getElementById('gridSize').textContent = `${cols}×${rows}`;
        document.getElementById('pieceSizeDisplay').textContent = pieceSize;
        document.getElementById('pieceInfo').style.display = 'block';
        document.getElementById('startBtn').classList.add('active');
    };
    img.onerror = () => {
        alert('❌ Ошибка загрузки изображения!');
    };
    img.src = src;
}

function startGame() {
    if (!imageData) {
        alert('⚠️ Сначала выбери фото!');
        return;
    }

    gameStarted = true;
    document.getElementById('controlsPanel').style.display = 'none';
    document.getElementById('gameInfo').classList.add('active');
    document.getElementById('puzzleContainer').classList.add('active');
    document.getElementById('totalCount').textContent = totalPieces;

    createPuzzle();
}

function createPuzzle() {
    const board = document.getElementById('puzzleBoard');
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.innerHTML = '';
    pieces = [];
    selectedPiece = null;
    moves = 0;
    correctPieces = 0;

    const img = new Image();
    img.onload = () => {
        const pieceWidth = img.width / cols;
        const pieceHeight = img.height / rows;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const canvas = document.createElement('canvas');
                canvas.width = pieceWidth;
                canvas.height = pieceHeight;
                const ctx = canvas.getContext('2d');
                
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
            }
        }

        do {
            shuffleArray(pieces);
        } while (isSolved());

        renderBoard();
    };
    img.onerror = () => {
        alert('❌ Ошибка создания пазла!');
    };
    img.src = imageData;
}

function isSolved() {
    return pieces.every((p, i) => p.id === p.correctId);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderBoard() {
    const board = document.getElementById('puzzleBoard');
    board.innerHTML = '';

    pieces.forEach((piece, index) => {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'puzzle-piece';
        pieceDiv.style.backgroundImage = `url(${piece.imageData})`;
        pieceDiv.dataset.index = index;

        if (piece.id === piece.correctId) {
            pieceDiv.classList.add('correct');
        }

        pieceDiv.addEventListener('click', () => handlePieceClick(index));
        board.appendChild(pieceDiv);
    });

    updateInfo();
}

function handlePieceClick(index) {
    if (!gameStarted) return;

    const pieceElements = document.querySelectorAll('.puzzle-piece');

    if (selectedPiece === null) {
        selectedPiece = index;
        pieceElements[index].classList.add('selected');
    } else if (selectedPiece === index) {
        pieceElements[index].classList.remove('selected');
        selectedPiece = null;
    } else {
        const piece1 = pieces[selectedPiece];
        const piece2 = pieces[index];
        
        if (piece1.id === piece1.correctId && piece2.id === piece2.correctId) {
            pieceElements[selectedPiece].classList.remove('selected');
            selectedPiece = null;
            return;
        }

        [pieces[selectedPiece], pieces[index]] = [pieces[index], pieces[selectedPiece]];
        moves++;
        selectedPiece = null;
        renderBoard();
        
        if (moves >= MIN_MOVES_TO_WIN && isSolved()) {
            setTimeout(showWin, 800);
        }
    }
}

function updateInfo() {
    document.getElementById('movesCount').textContent = moves;
    correctPieces = pieces.filter(p => p.id === p.correctId).length;
    document.getElementById('correctCount').textContent = correctPieces;
}

function shufflePieces() {
    do {
        shuffleArray(pieces);
    } while (isSolved());
    moves = 0;
    renderBoard();
}

function showPreview() {
    document.getElementById('previewFull').src = imageData;
    document.getElementById('previewModal').classList.add('active');
}

function closePreview() {
    document.getElementById('previewModal').classList.remove('active');
}

function showWin() {
    document.getElementById('winImage').src = imageData;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('winModal').classList.add('active');
    createHearts();
}

function createHearts() {
    const container = document.getElementById('heartsContainer');
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
