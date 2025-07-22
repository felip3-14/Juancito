// Variables globales
let currentSection = 0;
let audioPlayer = null;
let isPlaying = false;
let volume = 0.7;
let currentTime = 0;
let duration = 0;

// Variables del rompecabezas
let puzzlePieces = [];
let puzzleComplete = false;
const correctOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Orden correcto de las piezas

// Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Configurar el reproductor de audio
    initAudioPlayer();
    
    // Actualizar contador dinámico
    updateDayCounter();
    
    // Inicializar el rompecabezas
    initializePuzzle();
    
    // Iniciar la animación del nombre
    startNameAnimation();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar las secciones
    setupSections();
    
    console.log('🎉 Proyecto de cumpleaños cargado para Juan 🎉');
}

// Función para calcular y actualizar el contador de días
function updateDayCounter() {
    const meetingDate = new Date('2025-02-05'); // Fecha en que se conocieron
    const currentDate = new Date();
    
    // Calcular la diferencia en días
    const timeDifference = currentDate.getTime() - meetingDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    // Actualizar el contador en la página
    const dayCounterElement = document.getElementById('dayCounter');
    if (dayCounterElement) {
        dayCounterElement.textContent = daysDifference;
    }
    
    console.log(`Días desde que se conocieron: ${daysDifference}`);
}

// Función mejorada para inicializar el rompecabezas
function initializePuzzle() {
    const puzzleBoard = document.getElementById('puzzleBoard');
    const puzzlePiecesContainer = document.getElementById('puzzlePieces');
    
    // Limpiar contenedores
    puzzleBoard.innerHTML = '';
    puzzlePiecesContainer.innerHTML = '';

    // Añadir botón de reintentar
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Reintentar';
    retryButton.className = 'retry-button hidden';
    retryButton.id = 'retryButton';
    puzzlePiecesContainer.parentElement.insertBefore(retryButton, puzzlePiecesContainer.nextSibling);

    retryButton.addEventListener('click', () => {
        initializePuzzle();
        retryButton.classList.add('hidden');
    });
    
    // Crear las casillas del tablero (sin números)
    for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.dataset.position = i;
        puzzleBoard.appendChild(slot);
    }
    
    // Crear las piezas del rompecabezas
    const imageUrl = 'assets/5CA5250F-8B12-40AA-B211-41B827153E09.jpg';
    const shuffledOrder = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    
    // Precargar la imagen para asegurar que se cargue
    const img = new Image();
    img.onload = function() {
        console.log('Imagen cargada correctamente:', imageUrl);
        console.log('Dimensiones:', img.width, 'x', img.height);
        
        shuffledOrder.forEach((pieceIndex, i) => {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.correctPosition = pieceIndex;
            piece.dataset.currentPosition = i;
            piece.draggable = true;
            
            // Calcular la posición de la pieza en la imagen (3x3 grid)
            const row = Math.floor(pieceIndex / 3);
            const col = pieceIndex % 3;
            
            // Configurar el background de la pieza
            piece.style.backgroundImage = `url('${imageUrl}')`;
            piece.style.backgroundSize = '240px 240px'; // Tamaño total de la imagen
            piece.style.backgroundPosition = `-${col * 80}px -${row * 80}px`;
            piece.style.backgroundRepeat = 'no-repeat';
            piece.style.border = '2px solid rgba(0, 255, 65, 0.3)';
            
            // Event listeners for drag and drop
            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragend', handleDragEnd);
            
            // Touch event listeners
            piece.addEventListener('touchstart', handleTouchStart, { passive: false });
            piece.addEventListener('touchmove', handleTouchMove, { passive: false });
            piece.addEventListener('touchend', handleTouchEnd);

            puzzlePiecesContainer.appendChild(piece);
        });
    };
    
    img.onerror = function() {
        console.error('Error al cargar la imagen:', imageUrl);
        // Mostrar mensaje de error con la ruta que está intentando cargar
        puzzlePiecesContainer.innerHTML = `
            <div style="color: #ff6b6b; text-align: center; padding: 2rem;">
                <p>Error al cargar la imagen del rompecabezas</p>
                <p style="font-size: 0.9rem; opacity: 0.8;">Ruta: ${imageUrl}</p>
                <p style="font-size: 0.9rem; opacity: 0.8;">Verifica que la imagen exista en la carpeta assets</p>
            </div>
        `;
    };
    
    img.src = imageUrl;
    
    // Event listeners para las casillas
    setupPuzzleSlots();

    // Permitir soltar piezas de vuelta en el contenedor
    puzzlePiecesContainer.addEventListener('dragover', handleDragOver);
    puzzlePiecesContainer.addEventListener('drop', handlePieceDropInContainer);
}

function setupPuzzleSlots() {
    document.querySelectorAll('.puzzle-slot').forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
        slot.addEventListener('dragenter', handleDragEnter);
        slot.addEventListener('dragleave', handleDragLeave);
    });
}

// Funciones para el drag and drop del rompecabezas
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.correctPosition);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    if (!e.target.classList.contains('filled')) {
        e.target.classList.add('highlight');
    }
}

function handleDragLeave(e) {
    e.target.classList.remove('highlight');
}

// --- Touch Event Handlers for Puzzle ---
let draggedPiece = null;
let startX, startY;
let offsetX, offsetY;

function handleTouchStart(e) {
    e.preventDefault();
    draggedPiece = e.target;
    
    // Para que la pieza "salte" y se vea que la arrastramos
    draggedPiece.classList.add('dragging');
    
    // Guardar la posición inicial del toque
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    
    // Posicionar la pieza debajo del dedo
    const rect = draggedPiece.getBoundingClientRect();
    offsetX = startX - rect.left;
    offsetY = startY - rect.top;

    draggedPiece.style.left = `${startX - offsetX}px`;
    draggedPiece.style.top = `${startY - offsetY}px`;
}

function handleTouchMove(e) {
    if (!draggedPiece) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const newX = touch.clientX;
    const newY = touch.clientY;
    
    // Mover la pieza con el dedo
    draggedPiece.style.left = `${newX - offsetX}px`;
    draggedPiece.style.top = `${newY - offsetY}px`;

    // Resaltar el slot debajo
    const elementUnder = document.elementFromPoint(newX, newY);
    document.querySelectorAll('.puzzle-slot').forEach(s => s.classList.remove('highlight'));
    if (elementUnder && elementUnder.classList.contains('puzzle-slot') && !elementUnder.querySelector('.puzzle-piece')) {
        elementUnder.classList.add('highlight');
    }
}

function handleTouchEnd(e) {
    if (!draggedPiece) return;
    
    // Quitar el estilo de arrastre
    draggedPiece.classList.remove('dragging');
    draggedPiece.style.left = '';
    draggedPiece.style.top = '';

    // Encontrar el elemento debajo de donde se soltó
    const touch = e.changedTouches[0];
    const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
    
    document.querySelectorAll('.puzzle-slot').forEach(s => s.classList.remove('highlight'));
    
    // Si se suelta sobre un slot válido
    if (elementUnder && elementUnder.classList.contains('puzzle-slot') && !elementUnder.querySelector('.puzzle-piece')) {
        const targetSlot = elementUnder;
        const sourceContainer = draggedPiece.parentElement;

        targetSlot.appendChild(draggedPiece);
        draggedPiece.classList.add('placed');

        if (sourceContainer.classList.contains('puzzle-slot')) {
            sourceContainer.classList.remove('filled');
        }
        
        targetSlot.classList.add('filled');
        checkPuzzleComplete();
    } 
    // Si se suelta fuera de un slot (devolver al contenedor de piezas)
    else if (draggedPiece.parentElement.classList.contains('puzzle-slot')) {
        const puzzlePiecesContainer = document.getElementById('puzzlePieces');
        puzzlePiecesContainer.appendChild(draggedPiece);
        draggedPiece.classList.remove('placed');
        draggedPiece.parentElement.classList.remove('filled');
    }

    draggedPiece = null;
}


// Función corregida para manejar el drop
function handleDrop(e) {
    e.preventDefault();
    const targetSlot = e.target.closest('.puzzle-slot');
    if (!targetSlot) return;

    targetSlot.classList.remove('highlight');

    const pieceCorrectPosition = e.dataTransfer.getData('text/plain');
    const piece = document.querySelector(`.puzzle-piece[data-correct-position="${pieceCorrectPosition}"]`);
    if (!piece) return;

    // Si el slot está ocupado, no hacer nada (o intercambiar, para una v2)
    if (targetSlot.querySelector('.puzzle-piece')) {
        return;
    }
    
    const sourceContainer = piece.parentElement;

    // Mover la pieza al slot
    targetSlot.appendChild(piece);
    piece.classList.add('placed');
    
    // Marcar el slot de origen como vacío si era un slot
    if (sourceContainer.classList.contains('puzzle-slot')) {
        sourceContainer.classList.remove('filled');
    }
    
    // Ajustar el backgroundPosition para el slot más grande
    const correctPos = parseInt(pieceCorrectPosition);
    const row = Math.floor(correctPos / 3);
    const col = correctPos % 3;
    
    piece.style.backgroundSize = '300px 300px'; // Tamaño más grande para el slot
    piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;
    
    // Reemplazar el contenido del slot
    targetSlot.classList.add('filled');
    
    // Verificar si el rompecabezas está completo
    checkPuzzleComplete();
}

function handlePieceDropInContainer(e) {
    e.preventDefault();
    const pieceCorrectPosition = e.dataTransfer.getData('text/plain');
    const piece = document.querySelector(`.puzzle-piece[data-correct-position="${pieceCorrectPosition}"]`);
    if (!piece) return;

    const sourceSlot = piece.parentElement;
    if (sourceSlot.classList.contains('puzzle-slot')) {
        sourceSlot.classList.remove('filled');
    }

    const puzzlePiecesContainer = document.getElementById('puzzlePieces');
    puzzlePiecesContainer.appendChild(piece);
    piece.classList.remove('placed');
    
    const correctPos = parseInt(piece.dataset.correctPosition);
    const row = Math.floor(correctPos / 3);
    const col = correctPos % 3;
    
    piece.style.backgroundSize = '240px 240px';
    piece.style.backgroundPosition = `-${col * 80}px -${row * 80}px`;
}

function checkPuzzleComplete() {
    const slots = document.querySelectorAll('.puzzle-slot');
    let correctPieces = 0;
    
    slots.forEach((slot, index) => {
        const piece = slot.querySelector('.puzzle-piece');
        if (piece && parseInt(piece.dataset.correctPosition) === index) {
            correctPieces++;
        }
    });
    
    if (correctPieces === 9) {
        puzzleComplete = true;
        setTimeout(() => {
            showPuzzleSuccess();
        }, 500);
    } else {
        // Si todas las piezas están colocadas pero no son correctas
        const allPlaced = document.querySelectorAll('.puzzle-slot .puzzle-piece').length === 9;
        if (allPlaced) {
            document.getElementById('retryButton').classList.remove('hidden');
        }
    }
}

function showPuzzleSuccess() {
    const puzzleBoard = document.querySelector('.puzzle-board');
    puzzleBoard.classList.add('puzzle-complete');
    
    // Mostrar mensaje de éxito
    const puzzleMessage = document.getElementById('puzzleMessage');
    puzzleMessage.classList.remove('hidden');
    puzzleMessage.classList.add('show');
    
    // Crear efecto de partículas de éxito
    createSuccessParticles();
    
    console.log('¡Rompecabezas completado!');
}

function createSuccessParticles() {
    const particles = ['✨', '🎉', '⭐', '💫', '🌟'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}vw;
                top: ${Math.random() * 100}vh;
                font-size: 2rem;
                pointer-events: none;
                z-index: 1000;
                animation: sparkleSuccess 2s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }, i * 100);
    }
}

// Función para mezclar array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Animación tipo Matrix para cambiar nombres
function startNameAnimation() {
    const nameElement = document.getElementById('changingName');
    const names = ['Juan', 'Pianista', 'Juan Cru', 'Juancito'];
    let currentNameIndex = 0;
    
    function changeToNextName() {
        if (currentNameIndex < names.length - 1) {
            currentNameIndex++;
            animateNameChange(nameElement, names[currentNameIndex], () => {
                setTimeout(changeToNextName, 2000);
            });
        } else {
            // Mostrar el botón después de completar todos los nombres
            setTimeout(() => {
                document.getElementById('startButton').classList.remove('hidden');
            }, 1000);
        }
    }
    
    // Empezar con el primer cambio después de 2 segundos
    setTimeout(changeToNextName, 2000);
}

function animateNameChange(element, newName, callback) {
    const originalName = element.textContent;
    const maxLength = Math.max(originalName.length, newName.length);
    let currentStep = 0;
    const steps = 20;
    
    const interval = setInterval(() => {
        let displayText = '';
        
        for (let i = 0; i < maxLength; i++) {
            if (i < originalName.length && currentStep < steps * 0.7) {
                // Fase de "destrucción" con caracteres aleatorios
                displayText += getRandomMatrixChar();
            } else if (i < newName.length) {
                // Fase de "construcción" del nuevo nombre
                const progress = (currentStep - steps * 0.3) / (steps * 0.7);
                if (progress > i / newName.length) {
                    displayText += newName[i];
                } else {
                    displayText += getRandomMatrixChar();
                }
            }
        }
        
        element.textContent = displayText;
        currentStep++;
        
        if (currentStep >= steps) {
            clearInterval(interval);
            element.textContent = newName;
            if (callback) callback();
        }
    }, 50);
}

function getRandomMatrixChar() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    return chars.charAt(Math.floor(Math.random() * chars.length));
}

// Configurar event listeners
function setupEventListeners() {
    // Botón de inicio - va a la sección del reproductor
    document.getElementById('startButton').addEventListener('click', () => {
        navigateToSection(1); // Va a la sección del reproductor
    });
    
    // Botón de continuar del reproductor - va al contador
    document.getElementById('playerContinueButton').addEventListener('click', () => {
        navigateToSection(2); // Va a la sección del contador
    });
    
    // Botón de continuar (contador) - va a música
    document.getElementById('continueButton').addEventListener('click', () => {
        navigateToSection(3); // Va a la sección de música
    });
    
    // Botón siguiente (música) - va al rompecabezas
    document.getElementById('nextButton').addEventListener('click', () => {
        navigateToSection(4); // Va a la sección de trivia
    });

    // Trivia options
    document.querySelectorAll('.trivia-option').forEach(button => {
        button.addEventListener('click', (e) => {
            const isCorrect = e.target.dataset.correct === 'true';
            const messageText = document.getElementById('triviaMessageText');
            const triviaMessage = document.getElementById('triviaMessage');

            if (isCorrect) {
                messageText.textContent = '¡Estás atento!';
                e.target.classList.add('correct');
            } else {
                messageText.textContent = 'Por estas cosas le compraría un auto a Ferez';
                e.target.classList.add('incorrect');
                // Highlight the correct answer
                document.querySelector('.trivia-option[data-correct="true"]').classList.add('correct');
            }

            triviaMessage.classList.remove('hidden');
            document.querySelectorAll('.trivia-option').forEach(btn => btn.disabled = true);
            document.getElementById('triviaContinueButton').classList.remove('hidden');
        });
    });

    // Botón de continuar de la trivia
    document.getElementById('triviaContinueButton').addEventListener('click', () => {
        navigateToSection(5); // Va a la sección del rompecabezas
    });
    
    // Botón continuar (rompecabezas) - va a cumpleaños
    document.getElementById('puzzleContinueButton').addEventListener('click', () => {
        navigateToSection(6); // Va a la sección de cumpleaños
    });
    
    // Controles del reproductor principal
    setupMediaControls();
    
    // Hover en álbumes
    document.querySelectorAll('.album-cover').forEach(cover => {
        cover.addEventListener('mouseenter', () => {
            cover.style.transform = 'scale(1.1) rotate(2deg)';
        });
        cover.addEventListener('mouseleave', () => {
            cover.style.transform = 'scale(1) rotate(0deg)';
        });
    });
}

// Nueva función para la sección del reproductor
function startPlayerSectionAnimation() {
    // El reproductor ya está visible, solo mostramos el botón después de un tiempo
    setTimeout(() => {
        document.getElementById('playerContinueButton').classList.remove('hidden');
    }, 3000);
}

// Nueva función para iniciar música cuando se presiona play
function startMusicFromPlayer() {
    if (audioPlayer && audioPlayer.paused) {
        // Configurar volumen inicial
        audioPlayer.volume = 0.5;
        volume = 0.5;
        updateVolumeDisplay();
        
        audioPlayer.play().then(() => {
            isPlaying = true;
            updatePlayButton();
            console.log('Cover favorito iniciado desde el reproductor');
            
            // Mostrar indicador sutil de música
            showMusicIndicator();
        }).catch(error => {
            console.log('Error al reproducir:', error);
        });
    }
}

// Configurar controles del reproductor principal
function setupMediaControls() {
    // Botón play principal
    document.getElementById('mainPlayButton').addEventListener('click', togglePlayPause);
    
    // Controles de volumen
    document.querySelector('.volume-down-btn').addEventListener('click', () => adjustVolume(-0.1));
    document.querySelector('.volume-up-btn').addEventListener('click', () => adjustVolume(0.1));
}

// Mostrar indicador sutil de que hay música
function showMusicIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'musicIndicator';
    indicator.innerHTML = 'MUSIC';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        font-size: 1rem;
        opacity: 0.7;
        z-index: 1000;
        animation: pulse 2s ease-in-out infinite;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #00ff41;
        font-family: 'JetBrains Mono', monospace;
    `;
    
    // Al hacer clic en el indicador, muestra/oculta controles
    indicator.addEventListener('click', toggleMusicControls);
    
    document.body.appendChild(indicator);
}

// Configurar secciones
function setupSections() {
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        if (index !== 0) {
            section.classList.remove('active');
        }
    });
}

// Navegar entre secciones
function navigateToSection(sectionIndex) {
    const sections = document.querySelectorAll('section');
    
    // Ocultar sección actual
    if (sections[currentSection]) {
        sections[currentSection].classList.remove('active');
    }
    
    // Mostrar nueva sección
    setTimeout(() => {
        sections[sectionIndex].classList.add('active');
        currentSection = sectionIndex;
        
        // Ejecutar animaciones específicas de la sección
        handleSectionAnimation(sectionIndex);
    }, 300);
}

// Manejar animaciones específicas de cada sección
function handleSectionAnimation(sectionIndex) {
    switch(sectionIndex) {
        case 1:
            startPlayerSectionAnimation();
            break;
        case 2:
            startDiscoveryAnimation();
            break;
        case 3:
            startMusicSectionAnimation();
            break;
        case 4:
            // Trivia section doesn't need a special animation start
            break;
        case 5:
            startPuzzleAnimation();
            break;
        case 6:
            startBirthdayAnimation();
            break;
    }
}

// Animación de descubrimientos (sección contador)
function startDiscoveryAnimation() {
    const discoveries = document.querySelectorAll('.discovery-item');
    let currentDiscovery = 0;
    
    function showNextDiscovery() {
        if (currentDiscovery < discoveries.length) {
            const discovery = discoveries[currentDiscovery];
            discovery.classList.add('showing');
            
            // Tiempo variable según el texto
            let displayTime = 3000;
            if (discovery.classList.contains('special')) {
                displayTime = 5000;
            }
            
            setTimeout(() => {
                discovery.classList.remove('showing');
                currentDiscovery++;
                
                if (currentDiscovery < discoveries.length) {
                    setTimeout(showNextDiscovery, 500);
                } else {
                    // Mostrar botón de continuar
                    setTimeout(() => {
                        document.getElementById('continueButton').classList.remove('hidden');
                    }, 1000);
                }
            }, displayTime);
        }
    }
    
    // Empezar después de un segundo
    setTimeout(showNextDiscovery, 1000);
}

// Animación de la sección de música (ahora más conceptual)
function startMusicSectionAnimation() {
    const albums = document.querySelectorAll('.album-cover');
    
    // Animar entrada de álbumes
    albums.forEach((album, index) => {
        setTimeout(() => {
            album.style.opacity = '0';
            album.style.transform = 'translateY(30px)';
            album.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                album.style.opacity = '1';
                album.style.transform = 'translateY(0)';
            }, 100);
        }, index * 200);
    });
    
    // Mostrar texto del cover después de un tiempo
    setTimeout(() => {
        const coverReveal = document.querySelector('.cover-reveal');
        if (coverReveal) {
            coverReveal.style.opacity = '1';
            coverReveal.style.transform = 'translateY(0)';
            
            // Agregar mensaje sobre la música
            setTimeout(() => {
                const listeningNote = document.createElement('p');
                listeningNote.style.cssText = `
                    margin-top: 1rem;
                    font-size: 1.2rem;
                    color: #00ff41;
                    opacity: 0;
                    animation: fadeIn 1s ease-out 1s forwards;
                    text-align: center;
                `;
                listeningNote.textContent = '(ya lo estás escuchando de fondo)';
                coverReveal.appendChild(listeningNote);
            }, 1500);
        }
    }, 3000);
    
    // Mostrar botón siguiente
    setTimeout(() => {
        document.getElementById('nextButton').classList.remove('hidden');
    }, 6000);
}

// Nueva función para la animación del rompecabezas
function startPuzzleAnimation() {
    const puzzleTitle = document.querySelector('.puzzle-title');
    const puzzleSubtitle = document.querySelector('.puzzle-subtitle');
    
    // Animar entrada del título
    setTimeout(() => {
        puzzleTitle.style.opacity = '1';
        puzzleTitle.style.transform = 'translateY(0)';
    }, 500);
    
    setTimeout(() => {
        puzzleSubtitle.style.opacity = '1';
        puzzleSubtitle.style.transform = 'translateY(0)';
    }, 1000);
    
    // Animar entrada del tablero y piezas
    setTimeout(() => {
        const puzzleBoard = document.querySelector('.puzzle-board');
        const puzzlePieces = document.querySelector('.puzzle-pieces');
        
        puzzleBoard.style.opacity = '1';
        puzzleBoard.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            puzzlePieces.style.opacity = '1';
            puzzlePieces.style.transform = 'translateY(0)';
        }, 500);
    }, 1500);
}

function updatePlayButton() {
    // Actualizar botón principal
    const playIcon = document.getElementById('playIcon');
    const playText = document.getElementById('playText');
    if (playIcon && playText) {
        playIcon.className = isPlaying ? 'fas fa-pause button-icons' : 'fas fa-play button-icons';
        playText.textContent = isPlaying ? 'Pause' : 'Play';
    }
    
    // También actualizar botón flotante si existe
    const floatingPlayButton = document.getElementById('floatingPlayButton');
    if (floatingPlayButton) {
        floatingPlayButton.textContent = isPlaying ? 'PAUSE' : 'PLAY';
    }
}

function updateProgressBar() {
    // Actualizar barra principal
    const progressBar = document.getElementById('mainProgressBar');
    if (progressBar && duration > 0) {
        const progress = (currentTime / duration) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // Actualizar displays de tiempo
    updateTimeDisplays();
}

function updateTimeDisplays() {
    const currentDisplay = document.getElementById('currentTimeDisplay');
    const totalDisplay = document.getElementById('totalTimeDisplay');
    
    if (currentDisplay) {
        currentDisplay.textContent = formatTime(currentTime);
    }
    
    if (totalDisplay && duration > 0) {
        totalDisplay.textContent = formatTime(duration);
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Configurar reproductor de audio
function initAudioPlayer() {
    audioPlayer = document.getElementById('coverAudio');
    
    // Event listeners para el audio
    audioPlayer.addEventListener('loadedmetadata', function() {
        duration = audioPlayer.duration;
        updateTimeDisplays();
        console.log('Audio cargado, duración:', formatTime(duration));
    });
    
    audioPlayer.addEventListener('timeupdate', function() {
        if (audioPlayer.currentTime) {
            currentTime = audioPlayer.currentTime;
            updateProgressBar();
        }
    });
    
    audioPlayer.addEventListener('ended', function() {
        isPlaying = false;
        currentTime = 0;
        updatePlayButton();
        updateProgressBar();
    });
    
    // Configurar volumen inicial
    audioPlayer.volume = volume;
    updateVolumeDisplay();
    updateTimeDisplays();
}

function togglePlayPause() {
    if (audioPlayer.paused) {
        // Si es la primera vez, usar la función especial
        if (!isPlaying && currentTime === 0) {
            startMusicFromPlayer();
        } else {
            audioPlayer.play().then(() => {
                isPlaying = true;
                updatePlayButton();
                console.log('Reproduciendo cover favorito...');
            }).catch(error => {
                console.error('Error al reproducir:', error);
                isPlaying = true;
                updatePlayButton();
            });
        }
    } else {
        audioPlayer.pause();
        isPlaying = false;
        updatePlayButton();
        console.log('Pausado');
    }
}

function adjustVolume(change) {
    volume = Math.max(0, Math.min(1, volume + change));
    audioPlayer.volume = volume;
    updateVolumeDisplay();
    
    // También actualizar controles flotantes si existen
    const floatingFill = document.getElementById('floatingVolumeFill');
    if (floatingFill) {
        floatingFill.style.width = `${volume * 100}%`;
    }
}

function updateVolumeDisplay() {
    const volumeFill = document.getElementById('volumeFill');
    if (volumeFill) {
        volumeFill.style.width = `${volume * 100}%`;
    }
    
    // También actualizar controles flotantes si existen
    const floatingFill = document.getElementById('floatingVolumeFill');
    if (floatingFill) {
        floatingFill.style.width = `${volume * 100}%`;
    }
}

// Animación de cumpleaños
function startBirthdayAnimation() {
    const birthdayTitle = document.querySelector('.birthday-title');
    
    // Animar entrada del título
    setTimeout(() => {
        birthdayTitle.style.transform = 'scale(1.2)';
        birthdayTitle.style.animation = 'birthdayGlow 2s ease-in-out infinite alternate';
    }, 500);
    
    // Crear efectos de partículas de cumpleaños
    createBirthdayParticles();
}

function createBirthdayParticles() {
    const particles = ['*', '+', '·', '•', '○', '◦'];
    
    setInterval(() => {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}vw;
            top: -50px;
            font-size: 2rem;
            pointer-events: none;
            z-index: 1000;
            animation: fallDown 4s linear forwards;
            color: #00ff41;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 4000);
    }, 1000);
}

// Mostrar/ocultar controles de música
function toggleMusicControls() {
    const existingControls = document.getElementById('floatingMusicControls');
    
    if (existingControls) {
        existingControls.remove();
    } else {
        showFloatingMusicControls();
    }
}

// Crear controles flotantes de música
function showFloatingMusicControls() {
    const controls = document.createElement('div');
    controls.id = 'floatingMusicControls';
    controls.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideDown 0.3s ease;
    `;
    
    controls.innerHTML = `
        <button id="floatingPlayButton" style="background: transparent; border: none; color: white; font-size: 1.2rem; cursor: pointer;">
            ${isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <div style="display: flex; align-items: center; gap: 5px;">
            <button id="floatingVolumeDown" style="background: transparent; border: none; color: white; font-size: 1rem; cursor: pointer;">VOL-</button>
            <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;">
                <div id="floatingVolumeFill" style="height: 100%; background: #00ff41; width: ${volume * 100}%; transition: width 0.3s ease;"></div>
            </div>
            <button id="floatingVolumeUp" style="background: transparent; border: none; color: white; font-size: 1rem; cursor: pointer;">VOL+</button>
        </div>
    `;
    
    document.body.appendChild(controls);
    
    // Event listeners para controles flotantes
    document.getElementById('floatingPlayButton').addEventListener('click', () => {
        togglePlayPause();
        document.getElementById('floatingPlayButton').textContent = isPlaying ? 'PAUSE' : 'PLAY';
    });
    
    document.getElementById('floatingVolumeDown').addEventListener('click', () => {
        adjustVolume(-0.1);
        document.getElementById('floatingVolumeFill').style.width = `${volume * 100}%`;
    });
    
    document.getElementById('floatingVolumeUp').addEventListener('click', () => {
        adjustVolume(0.1);
        document.getElementById('floatingVolumeFill').style.width = `${volume * 100}%`;
    });
    
    // Auto ocultar después de 5 segundos
    setTimeout(() => {
        if (document.getElementById('floatingMusicControls')) {
            document.getElementById('floatingMusicControls').remove();
        }
    }, 5000);
}

// Efectos de mouse
document.addEventListener('mousemove', function(e) {
    // Crear trail mágico ocasional
    if (Math.random() < 0.05) {
        const trail = document.createElement('div');
        trail.textContent = '·';
        trail.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            font-size: 1rem;
            pointer-events: none;
            z-index: 100;
            animation: sparkleTrail 2s ease-out forwards;
            opacity: 0.8;
            color: #00ff41;
        `;
        
        document.body.appendChild(trail);
        
        setTimeout(() => {
            trail.remove();
        }, 2000);
    }
});

// Prevenir scroll en la página
document.addEventListener('wheel', function(e) {
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

// Añadir estilos CSS dinámicamente
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes fallDown {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes sparkleTrail {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 0.8;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    .cover-reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: all 1s ease;
    }
    
    .album-cover {
        opacity: 1;
        transform: translateY(0);
        transition: all 0.3s ease;
    }
    
    .discovery-item {
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;
document.head.appendChild(dynamicStyles);

// Añadir estilos CSS dinámicamente para el rompecabezas
const puzzleStyles = document.createElement('style');
puzzleStyles.textContent = `
    @keyframes sparkleSuccess {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    .puzzle-title, .puzzle-subtitle, .puzzle-board, .puzzle-pieces {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
    }
`;
document.head.appendChild(puzzleStyles);

// Función para detectar dispositivos móviles
function isMobile() {
    return window.innerWidth <= 768;
}

// Ajustar animaciones para móviles
if (isMobile()) {
    // Reducir intensidad de animaciones en móviles
    document.querySelectorAll('.gradient-orb').forEach(orb => {
        orb.style.animationDuration = '12s';
    });
}

// Mensaje de desarrollador
console.log(`
Feliz Cumpleaños Juan!
Este proyecto fue creado con mucho cariño.
Cada línea de código representa un momento especial.
Disfruta tu día especial!
`);

// Funciones de utilidad
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Precarga de recursos (si fuera necesario)
function preloadResources() {
    // Aquí se podrían precargar imágenes o audio si fueran necesarios
    console.log('Recursos precargados ✓');
}

// Inicializar precarga
preloadResources(); 