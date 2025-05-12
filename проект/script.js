document.addEventListener('DOMContentLoaded', function() {
    //Инициализация темы
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // Проверяем сохраненную тему при загрузке
        if (localStorage.getItem('darkTheme') === 'true') {
            document.body.classList.add('dark-theme');
        }
        
        // Назначаем обработчик переключения темы
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('darkTheme', isDark);
        });
    }

    // Поиск книг
    const searchInput = document.getElementById('book-search');
    const searchResults = document.getElementById('search-results');
    const noResults = document.getElementById('no-results');
    const bookItems = document.querySelectorAll('.book-item');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let hasResults = false;
            
            if (searchTerm.length > 0) {
                bookItems.forEach(item => {
                    const title = item.querySelector('.book-title')?.textContent.toLowerCase();
                    const author = item.querySelector('.book-author')?.textContent.toLowerCase();
                    
                    if (title?.includes(searchTerm) || author?.includes(searchTerm)) {
                        item.style.display = 'flex';
                        hasResults = true;
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                if (searchResults) searchResults.style.display = hasResults ? 'block' : 'none';
                if (noResults) noResults.style.display = hasResults ? 'none' : 'block';
            } else {
                if (searchResults) searchResults.style.display = 'none';
                if (noResults) noResults.style.display = 'none';
            }
        });
    }

    // Модальное окно для рецензий (сохранена существующая функция)
    const modal = document.getElementById('reviewModal');
    if (modal) {
        const closeBtn = document.querySelector('.close');
        
        document.querySelectorAll('.card-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Получаем карточку книги
                const bookCard = this.closest('.lots__card-list-item');
                if (!bookCard) return;
                
                // Получаем обложку из data-атрибута
                const coverImage = bookCard.getAttribute('data-book-cover');
                
                // Устанавливаем обложку
                const bookCover = document.getElementById('modalBookCover');
                if (bookCover) {
                    bookCover.src = coverImage ? `./images/${coverImage}` : '';
                }
                
                // Заполняем данные
                const setTextContent = (id, value) => {
                    const el = document.getElementById(id);
                    if (el && value) el.textContent = value;
                };
                
                setTextContent('modalBookTitle', this.getAttribute('data-book-title'));
                setTextContent('modalBookAuthor', this.getAttribute('data-book-author'));
                setTextContent('modalReviewer', `Рецензия от ${this.getAttribute('data-reviewer')}, ${this.getAttribute('data-review-date')}`);
                setTextContent('modalReviewText', this.getAttribute('data-review-text'));
                
                // Создаем звезды рейтинга
                const starsContainer = document.getElementById('modalRatingStars');
                if (starsContainer) {
                    starsContainer.innerHTML = '';
                    const rating = parseInt(this.getAttribute('data-review-rating')) || 0;
                    
                    for (let i = 1; i <= 5; i++) {
                        const star = document.createElement('span');
                        star.className = i <= rating ? 'star' : 'star empty';
                        star.textContent = '★';
                        starsContainer.appendChild(star);
                    }
                }
                
                modal.style.display = 'block';
            });
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Переход на страницу формы для написания рецензии
    document.querySelectorAll('.book-item').forEach(bookItem => {
        bookItem.addEventListener('click', function() {
            // Получаем данные о книге
            const bookId = this.getAttribute('data-book-id');
            const title = this.querySelector('.book-title').textContent;
            const author = this.querySelector('.book-author').textContent;
            const cover = this.querySelector('.book-cover').src.split('/').pop();
            
            // Формируем URL с параметрами
            const url = new URL('./write_review_form.html', window.location.href);
            url.searchParams.set('id', bookId);
            url.searchParams.set('title', encodeURIComponent(title));
            url.searchParams.set('author', encodeURIComponent(author));
            url.searchParams.set('cover', cover);
            
            // Переходим на страницу формы
            window.location.href = url.toString();
        });
    });

    // Если мы на странице формы, заполняем данные книги
    if (window.location.pathname.includes('write_review_form.html')) {
        fillBookDataFromURL();
        setupRatingStars();
        setupFormSubmission();
    }

    // Функция для заполнения данных книги на странице формы
    function fillBookDataFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        const bookCover = document.getElementById('bookCover');
        const bookTitle = document.getElementById('bookTitle');
        const bookAuthor = document.getElementById('bookAuthor');
        const bookIdInput = document.getElementById('bookId');
        
        if (urlParams.has('cover') && bookCover) {
            bookCover.src = `./images/${urlParams.get('cover')}`;
        }
        
        if (urlParams.has('title') && bookTitle) {
            bookTitle.textContent = decodeURIComponent(urlParams.get('title'));
        }
        
        if (urlParams.has('author') && bookAuthor) {
            bookAuthor.textContent = decodeURIComponent(urlParams.get('author'));
        }
        
        if (urlParams.has('id') && bookIdInput) {
            bookIdInput.value = urlParams.get('id');
        }
    }

    //  Инициализация звезд рейтинга
    function setupRatingStars() {
        const stars = document.querySelectorAll('.rating-stars .star');
        const ratingInput = document.getElementById('rating');
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                
                // Обновляем визуальное отображение
                stars.forEach((s, index) => {
                    s.classList.toggle('active', index < rating);
                });
                
                // Устанавливаем значение в скрытое поле
                ratingInput.value = rating;
            });
        });
    }

    
    // Обработка отправки формы
    function setupFormSubmission() {
        const form = document.querySelector('.review-form form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Создаем элементы модального окна
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                
                const modal = document.createElement('div');
                modal.className = 'custom-modal';
                
                const message = document.createElement('p');
                message.textContent = 'Рецензия отправлена!';
                
                const button = document.createElement('button');
                button.className = 'modal-button';
                button.textContent = 'OK';
                
                // Обработчик закрытия модального окна и очистки формы
                button.onclick = function() {
                    // Очищаем все поля формы
                    form.reset();
                    
                    // Сбрасываем рейтинг
                    const stars = document.querySelectorAll('.star.star_insert');
                    stars.forEach(star => {
                        star.classList.remove('active');
                    });
                    document.getElementById('rating').value = '0';
                    
                    // Удаляем модальное окно
                    document.body.removeChild(overlay);
                    
                    // Если нужно перенаправление, раскомментируйте:
                    // window.location.href = './review.html';
                };
                
                // Собираем модальное окно
                modal.appendChild(message);
                modal.appendChild(button);
                overlay.appendChild(modal);
                
                // Добавляем на страницу
                document.body.appendChild(overlay);
            });
        }
    }
    const burgerMenu = document.getElementById('burger-menu');
    const headerMenu = document.querySelector('.header__menu');
    
    if (burgerMenu && headerMenu) {
        burgerMenu.addEventListener('click', function(e) {
            e.stopPropagation(); 
            this.classList.toggle('active');
            headerMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Закрытие меню при клике на пункт или вне меню
        document.addEventListener('click', function(e) {
            const isClickInsideMenu = headerMenu.contains(e.target) || burgerMenu.contains(e.target);
            
            if (!isClickInsideMenu && headerMenu.classList.contains('active')) {
                burgerMenu.classList.remove('active');
                headerMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Закрытие меню при нажатии Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && headerMenu.classList.contains('active')) {
                burgerMenu.classList.remove('active');
                headerMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
});
