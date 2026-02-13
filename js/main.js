const swiper = new Swiper('.stages__swiper', {
    // Optional parameters
    slidesPerView: 3,
    // autoplay: {
    //     delay: 2500,
    //     disableOnInteraction: false,
    // },
    breakpoints: {
    0: {
        slidesPerView: 1,
    },
    700: {
        slidesPerView: 2,
    },
    1300: {
        slidesPerView: 3,
    }
}
});

// Инициализация слайдера отзывов
const feedbackSwiper = new Swiper('.feedback__swiper', {
    spaceBetween: 12,
    navigation: {
        nextEl: '.feedback__swiper-button-next',
        prevEl: '.feedback__swiper-button-prev',
    },
    breakpoints: {
        // 0px - 1299px: 1 слайд (для мобильных)
        0: {
            slidesPerView: 1,
            spaceBetween: 8
        },
        // 768px - 1299px: 2 слайда (для планшетов)
        768: {
            slidesPerView: 2,
            spaceBetween: 10
        },
        // 1300px и больше: 3 слайда (для десктопа)
        1300: {
            slidesPerView: 3,
            spaceBetween: 12
        }
    },
    on: {
        init: function () {
            updatePagination(this);
        },
        slideChange: function () {
            updatePagination(this);
        },
        // Добавляем обработчик ресайза
        resize: function () {
            updatePagination(this);
        }
    }
});

function updatePagination(swiper) {
    const current = document.querySelector('.feedback__swiper-current');
    const total = document.querySelector('.feedback__swiper-total');
    const progress = document.querySelector('.feedback__swiper-progress');

    if (current && total && progress) {
        const currentIndex = swiper.activeIndex + 1;
        const totalSlides = swiper.slides.length;

        // Правильный расчет прогресса - учитываем видимые слайды
        const slidesPerView = swiper.params.slidesPerView;
        const maxIndex = Math.max(totalSlides - slidesPerView + 1, 1);
        const progressWidth = (currentIndex / maxIndex) * 100;

        current.textContent = String(currentIndex).padStart(2, '0');
        total.textContent = String(totalSlides).padStart(2, '0');
        progress.style.width = `${progressWidth}%`;
    }
}


// Переменная для хранения экземпляра Fancybox галереи отзывов
let feedbackFancybox = null;

// Функция для создания звезд рейтинга
function createRatingStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= rating;
        starsHtml += `
            <li class="feedback-modal__rating-item">
                <svg class="feedback__rate ${isActive ? 'feedback__rate--active' : ''}" width="14" height="13" viewBox="0 0 14 13" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M8.8305 4.14031L13.0278 4.47054C13.4737 4.50563 13.6527 5.06386 13.3103 5.35173L10.1196 8.03393L11.0976 12.0573C11.2024 12.4885 10.7353 12.8324 10.3546 12.6042L6.74463 10.4403L3.13461 12.6042C2.75398 12.8324 2.28688 12.4885 2.39169 12.0573L3.36963 8.03393L0.178979 5.35173C-0.163456 5.06386 0.0155389 4.50563 0.461504 4.47054L4.65876 4.14031L6.28426 0.304968C6.45655 -0.10155 7.0327 -0.10155 7.20499 0.304968L8.8305 4.14031Z"
                        fill="${isActive ? '#FFD34E' : '#C4C4C4'}" />
                </svg>
            </li>
        `;
    }
    return starsHtml;
}

// Функция для создания галереи
function createGallery(galleryItems) {
    if (!galleryItems || galleryItems.length === 0) return '';

    let galleryHtml = '';
    galleryItems.forEach(item => {
        const link = item.querySelector('a');
        const img = item.querySelector('img');
        const eyeIcon = item.querySelector('.feedback__slide-eye img');

        if (link && img) {
            galleryHtml += `
                <li class="feedback-modal__gallery-item">
                    <a href="${link.getAttribute('href')}" 
                       target="_blank" 
                       rel="noopener noreferrer">
                        <img src="${img.getAttribute('src')}" alt="${img.getAttribute('alt')}" />
                        <div class="feedback-modal__gallery-eye">
                            <img src="${eyeIcon ? eyeIcon.getAttribute('src') : './assets/eye.svg'}" alt="Просмотр" />
                        </div>
                    </a>
                </li>
            `;
        }
    });
    return galleryHtml;
}

// Функция для подсчета рейтинга
function calculateRating(rateItems) {
    let rating = 0;
    rateItems.forEach(item => {
        if (item.querySelector('.feedback__rate--active')) {
            rating++;
        }
    });
    return rating;
}

// Функция для форматирования текста с абзацами
function formatTextWithParagraphs(text) {
    // Разделяем текст по двойным переносам строк
    const paragraphs = text.split(/\n\s*\n/);

    // Оборачиваем каждый абзац в <p> тег
    return paragraphs.map(paragraph =>
        `<p>${paragraph.trim()}</p>`
    ).join('');
}

// Функция инициализации Fancybox для галереи отзывов
function initFeedbackGallery() {
    // Закрываем предыдущий экземпляр Fancybox если он есть
    if (feedbackFancybox) {
        feedbackFancybox.destroy();
    }

    // Инициализируем новый Fancybox для всех изображений с data-fancybox="feedback-gallery"
    feedbackFancybox = Fancybox.bind("[data-fancybox='feedback-gallery']", {
        Image: {
            zoom: false,
            fit: "contain",
        },
        Toolbar: {
            display: {
                left: [],
                middle: [],
                right: ["close"],
            },
        },
        // Важные настройки для правильной работы
        closeOnNavigate: false, // Не закрывать при навигации
    });

    console.log('Fancybox инициализирован для галереи отзывов'); // Для отладки
}

// Функция открытия модалки отзыва
function openFeedbackModal(feedbackSlide) {
    // 1. Получаем ВСЕ данные ИЗ САМОГО СЛАЙДА ОТЗЫВА
    const userName = feedbackSlide.querySelector('.feedback__slide-title').textContent;
    const date = feedbackSlide.querySelector('.feedback__slide-date').textContent;
    const place = feedbackSlide.querySelector('.feedback__slide-place').textContent;
    const userIcon = feedbackSlide.querySelector('.feedback__slide-icon img').getAttribute('src');

    // 2. Получаем элементы для рейтинга и галереи ИЗ СЛАЙДА
    const rateItems = feedbackSlide.querySelectorAll('.feedback__slide-rate-item');
    const galleryItems = feedbackSlide.querySelectorAll('.feedback__slide-gallery-item');

    // 3. Вычисляем рейтинг ИЗ СЛАЙДА
    const rating = calculateRating(rateItems);

    // 4. Получаем полный текст отзыва и форматируем его с абзацами
    let fullText = feedbackSlide.getAttribute('data-full-text');

    // Если нет data-атрибута, используем текст из слайда
    if (!fullText) {
        fullText = feedbackSlide.querySelector('.feedback__slide-desciption').textContent;
    }

    // 5. Форматируем текст - заменяем двойные переносы на теги <p>
    const formattedText = formatTextWithParagraphs(fullText);

    // 6. Заполняем модалку данными ИЗ СЛАЙДА
    document.getElementById('modal-user-name').textContent = userName;
    document.getElementById('modal-date').textContent = date;
    document.getElementById('modal-place').textContent = place;
    document.getElementById('modal-user-icon').setAttribute('src', userIcon);
    document.getElementById('modal-description').innerHTML = formattedText; // Используем innerHTML для тегов

    // 7. Создаем и вставляем звезды рейтинга
    document.getElementById('modal-rating').innerHTML = createRatingStars(rating);

    // 8. Создаем и вставляем галерею ИЗ СЛАЙДА
    document.getElementById('modal-gallery').innerHTML = createGallery(galleryItems);

    // 9. Открываем модалку
    const feedbackModal = document.getElementById('feedback__modal');
    feedbackModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // 10. Инициализируем Fancybox для галереи - ВАЖНО: с задержкой чтобы DOM обновился
    setTimeout(() => {
        initFeedbackGallery();
    }, 100);
}

// Функция закрытия модалки отзыва
function closeFeedbackModal() {
    const feedbackModal = document.getElementById('feedback__modal');
    feedbackModal.style.display = 'none';
    document.body.style.overflow = '';

    // Закрываем Fancybox если он открыт
    if (feedbackFancybox) {
        feedbackFancybox.close();
    }
}

// Инициализация модалки отзывов
function initFeedbackModal() {
    const feedbackMoreButtons = document.querySelectorAll('.feedback__slide-more');

    // 1. Добавляем обработчики на кнопки "Смотреть полностью"
    feedbackMoreButtons.forEach((button) => {
        button.addEventListener('click', function () {
            const feedbackSlide = this.closest('.feedback__slide');
            openFeedbackModal(feedbackSlide);
        });
    });

    // 2. Закрытие модалки отзыва
    const feedbackModal = document.getElementById('feedback__modal');
    const feedbackCloseBtn = feedbackModal?.querySelector('.close__button');
    const feedbackOverlay = feedbackModal?.querySelector('.overlay-modal');

    if (feedbackCloseBtn) {
        feedbackCloseBtn.addEventListener('click', closeFeedbackModal);
    }

    if (feedbackOverlay) {
        feedbackOverlay.addEventListener('click', closeFeedbackModal);
    }

    // 3. Закрытие по ESC
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && feedbackModal.style.display === 'block') {
            closeFeedbackModal();
        }
    });

    // 4. Предотвращаем закрытие при клике на контент
    if (feedbackModal) {
        feedbackModal.querySelector('.container__modal').addEventListener('click', function (event) {
            event.stopPropagation();
        });
    }
}

// ========== КОД ДЛЯ ОСНОВНЫХ МОДАЛОК ==========

const modal = document.getElementById('consultation__modal');
const closeBtn = document.querySelector('.close__button');
const overlay = document.querySelector('.overlay-modal');
const modalBtns = document.querySelectorAll('.button__consultation--open');
const submitBtn = document.getElementById('btn_btn-order');
const form = document.querySelector('.consultation__form');

// Селекторы
const nameInput = document.querySelector('input[name="consultation-name"]');
const cityInput = document.querySelector('input[name="consultation-city"]');
const phoneInput = document.querySelector('input[name="consultation-phone"]');
const checkbox = document.querySelector('.consultation__form__group--checkbox');

// Переменная для отслеживания состояния формы
let isFormValid = false;

// Функция открытия модального окна
function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    form.reset();
    // Сбрасываем состояние кнопки
    submitBtn.classList.add('consultation__btn--disable');
    isFormValid = false;
}

// Функция закрытия модального окна
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Функция проверки валидности формы
function checkFormValidity() {
    const isNameValid = nameInput.value.trim() !== '';
    const isCityValid = cityInput.value.trim() !== '';
    const isPhoneValid = phoneInput.value.trim() !== '';
    const isCheckboxChecked = checkbox.checked;

    isFormValid = isNameValid && isCityValid && isPhoneValid && isCheckboxChecked;

    if (isFormValid) {
        submitBtn.classList.remove('consultation__btn--disable');
        submitBtn.style.cursor = 'pointer';
    } else {
        submitBtn.classList.add('consultation__btn--disable');
        submitBtn.style.cursor = 'not-allowed';
    }
}

// Функция отправки формы
function handleSubmit(event) {
    event.preventDefault();

    if (isFormValid) {
        console.log('Форма отправлена!');

        // Закрываем текущее модальное окно
        closeModal();

        // Открываем модалку успеха
        setTimeout(() => {
            openSuccessModal();
        }, 300);
    }
}

// Обработчик клика по кнопке (дополнительная защита)
function handleButtonClick(event) {
    event.preventDefault();

    if (!isFormValid) {
        console.log('Кнопка заблокирована - форма не валидна');
        return;
    }

    // Триггерим отправку формы
    form.dispatchEvent(new Event('submit', { bubbles: true }));
}

// ========== КОД ДЛЯ МОДАЛКИ УСПЕХА ==========

const successModal = document.querySelector('.modal__consultation-success');
const successOverlay = document.querySelector('.overlay-modal-success');
const successCloseBtn = document.querySelector('.close__button-success');
const successBtn = document.querySelector('.success__btn');

// Функция открытия модалки успеха
function openSuccessModal() {
    successModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Функция закрытия модалки успеха
function closeSuccessModal() {
    successModal.style.display = 'none';
    document.body.style.overflow = '';
}

// ========== КОД ДЛЯ МОДАЛКИ УСПЕХА ОТЗЫВА ==========

// Функция открытия модалки успеха отзыва
function openFeedbackSuccessModal() {
    const feedbackSuccessModal = document.getElementById('feedbackSuccessModal');
    if (feedbackSuccessModal) {
        feedbackSuccessModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Функция закрытия модалки успеха отзыва
function closeFeedbackSuccessModal() {
    const feedbackSuccessModal = document.getElementById('feedbackSuccessModal');
    if (feedbackSuccessModal) {
        feedbackSuccessModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Инициализация модалки успеха отзыва
function initFeedbackSuccessModal() {
    const feedbackSuccessModal = document.getElementById('feedbackSuccessModal');
    const feedbackSuccessCloseBtn = feedbackSuccessModal?.querySelector('.close__button-success');
    const feedbackSuccessBtn = feedbackSuccessModal?.querySelector('#feedbackSuccessClose');
    const feedbackSuccessOverlay = feedbackSuccessModal?.querySelector('.overlay-modal-success');

    // Закрытие по кнопке
    if (feedbackSuccessCloseBtn) {
        feedbackSuccessCloseBtn.addEventListener('click', closeFeedbackSuccessModal);
    }

    if (feedbackSuccessBtn) {
        feedbackSuccessBtn.addEventListener('click', closeFeedbackSuccessModal);
    }

    if (feedbackSuccessOverlay) {
        feedbackSuccessOverlay.addEventListener('click', closeFeedbackSuccessModal);
    }

    // Закрытие по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && feedbackSuccessModal && feedbackSuccessModal.style.display === 'block') {
            closeFeedbackSuccessModal();
        }
    });

    // Предотвращаем закрытие при клике на контент
    if (feedbackSuccessModal) {
        feedbackSuccessModal.querySelector('.container__modal').addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
}

// ========== КОД ДЛЯ МОДАЛКИ ФОРМЫ ОТЗЫВА ==========

// Функция открытия модалки формы отзыва
function openFeedbackFormModal() {
    const feedbackFormModal = document.getElementById('feedbackFormModal');
    if (feedbackFormModal) {
        feedbackFormModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Функция закрытия модалки формы отзыва
function closeFeedbackFormModal() {
    const feedbackFormModal = document.getElementById('feedbackFormModal');
    if (feedbackFormModal) {
        feedbackFormModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Инициализация модалки формы отзыва
function initFeedbackFormModal() {
    const feedbackBtn = document.querySelector('.feedBack__btn');
    const feedbackFormModal = document.getElementById('feedbackFormModal');
    const feedbackFormCloseBtn = feedbackFormModal?.querySelector('.close__button-feedback-form');
    const feedbackFormOverlay = feedbackFormModal?.querySelector('.overlay-modal');
    const feedbackForm = feedbackFormModal?.querySelector('.feedback-form');
    const fileInput = feedbackFormModal?.querySelector('input[type="file"]');
    const uploadLabel = feedbackFormModal?.querySelector('.upload-label');

    // Открытие по кнопке "Оставить отзыв"
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', openFeedbackFormModal);
    }

    // Закрытие
    if (feedbackFormCloseBtn) {
        feedbackFormCloseBtn.addEventListener('click', closeFeedbackFormModal);
    }

    if (feedbackFormOverlay) {
        feedbackFormOverlay.addEventListener('click', closeFeedbackFormModal);
    }

    // Закрытие по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && feedbackFormModal && feedbackFormModal.style.display === 'block') {
            closeFeedbackFormModal();
        }
    });

    // Обработка загрузки файлов
    let selectedFiles = [];
    
    if (fileInput && uploadLabel) {
        fileInput.addEventListener('change', function() {
            const files = Array.from(this.files);

            // Проверка на максимальное количество файлов
            if (selectedFiles.length + files.length > 10) {
                alert('Максимальное количество файлов - 10');
                return;
            }

            // Добавляем новые файлы к существующим
            selectedFiles = [...selectedFiles, ...files];

            // Обновляем input files
            const dt = new DataTransfer();
            selectedFiles.forEach(file => dt.items.add(file));
            this.files = dt.files;

            updateUploadedFilesList();
        });

        function updateUploadedFilesList() {
            const uploadedFilesContainer = document.getElementById('uploaded-files');

            if (selectedFiles.length === 0) {
                if (uploadedFilesContainer) uploadedFilesContainer.innerHTML = '';
                if (uploadLabel) {
                    uploadLabel.querySelector('.upload-button').textContent = 
                        'Загрузить до 10 файлов JPEG или PNG до 10мб';
                }
                return;
            }

            if (uploadLabel) {
                uploadLabel.querySelector('.upload-button').textContent = 
                    `Выбрано файлов: ${selectedFiles.length}/10`;
            }

            if (uploadedFilesContainer) {
                uploadedFilesContainer.innerHTML = selectedFiles.map((file, index) => `
                    <div class="uploaded-file">
                        <span class="uploaded-file-name" title="${file.name}">${file.name}</span>
                        <button type="button" class="uploaded-file-remove" data-index="${index}" title="Удалить">×</button>
                    </div>
                `).join('');

                // Добавляем обработчики для кнопок удаления
                uploadedFilesContainer.querySelectorAll('.uploaded-file-remove').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const index = parseInt(this.getAttribute('data-index'));
                        removeFile(index);
                    });
                });
            }
        }

        function removeFile(index) {
            selectedFiles.splice(index, 1);

            // Обновляем input files
            const dt = new DataTransfer();
            selectedFiles.forEach(file => dt.items.add(file));
            fileInput.files = dt.files;

            updateUploadedFilesList();
        }
    }

    // Обработка отправки формы
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Простая валидация - проверяем, что все поля заполнены
            const inputs = this.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                }
            });
            
            const checkbox = this.querySelector('.feedback-form__agree-checkbox');
            if (!checkbox.checked) {
                isValid = false;
            }
            
            if (!isValid) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            
            console.log('Форма отзыва отправлена!');
            
            // Закрываем модалку формы
            closeFeedbackFormModal();
            
            // Очищаем форму
            this.reset();
            if (selectedFiles) {
                selectedFiles = [];
                if (fileInput) fileInput.value = '';
                updateUploadedFilesList();
            }
            
            // Открываем модалку успеха
            setTimeout(() => {
                openFeedbackSuccessModal();
            }, 300);
        });
    }

    // Предотвращаем закрытие при клике на контент
    if (feedbackFormModal) {
        feedbackFormModal.querySelector('.container__modal').addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
}

// Функция для открытия модалки проекта
function openProjectModal(projectCard) {
    // 1. Получаем ВСЕ данные ИЗ САМОЙ КАРТОЧКИ ПРОЕКТА
    const projectImage = projectCard.querySelector('img');
    const projectTitle = projectCard.closest('.row__up-left, .row__up-right, .row__middle-left, .row__middle-right-first, .row__middle-right-second, .row__down-left, .row__down-right').querySelector('.projects__body-title').textContent;

    // 2. Получаем полное описание (как в отзывах data-full-text)
    let fullDescription = projectCard.getAttribute('data-full-description');

    // Если нет data-атрибута, используем текст из карточки
    if (!fullDescription) {
        fullDescription = projectCard.closest('.row__up-left, .row__up-right, .row__middle-left, .row__middle-right-first, .row__middle-right-second, .row__down-left, .row__down-right')
            .querySelector('.projects__body-description').textContent;
    }

    // 3. Заполняем модалку данными ИЗ КАРТОЧКИ
    document.getElementById('modal-project-img').setAttribute('src', projectImage.getAttribute('src'));
    document.getElementById('modal-project-img').setAttribute('alt', projectImage.getAttribute('alt'));
    document.getElementById('modal-project-title').textContent = projectTitle;
    document.getElementById('modal-project-description').textContent = fullDescription;

    // 4. Открываем модалку
    const projectModal = document.getElementById('project__modal');
    projectModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Функция закрытия модалки проекта
function closeProjectModal() {
    const projectModal = document.getElementById('project__modal');
    projectModal.style.display = 'none';
    document.body.style.overflow = '';
}

// Инициализация модалки проектов
function initProjectModal() {
    const projectCards = document.querySelectorAll('.project__card');

    // 1. Добавляем обработчики на карточки проектов
    projectCards.forEach((card) => {
        card.addEventListener('click', function(event) {
            event.preventDefault();
            openProjectModal(this);
        });
    });

    // 2. Закрытие модалки проекта
    const projectModal = document.getElementById('project__modal');
    const projectCloseBtn = projectModal?.querySelector('.close__button-project');
    const projectOverlay = projectModal?.querySelector('.overlay-modal');

    if (projectCloseBtn) {
        projectCloseBtn.addEventListener('click', closeProjectModal);
    }

    if (projectOverlay) {
        projectOverlay.addEventListener('click', closeProjectModal);
    }

    // 3. Закрытие по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && projectModal.style.display === 'block') {
            closeProjectModal();
        }
    });

    // 4. Предотвращаем закрытие при клике на контент
    if (projectModal) {
        projectModal.querySelector('.container__modal').addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
}

// Инициализация всех обработчиков при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация модалки отзывов
    initFeedbackModal();

    // Инициализация модалки проектов
    initProjectModal();
    
    // Инициализация модалки формы отзыва
    initFeedbackFormModal();
    
    // Инициализация модалки успеха отзыва
    initFeedbackSuccessModal();

    // Инициализация масок для телефонов
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        IMask(input, {
            mask: '+{7} (000) 000-00-00',
            lazy: true,
            placeholderChar: '_'
        });
    });

    // Инициализация основной Fancybox для всего сайта
    Fancybox.bind("[data-fancybox]", {
        Image: {
            zoom: false,
            fit: "contain",
        },
        Toolbar: {
            display: {
                left: [],
                middle: [],
                right: ["close"],
            },
        },
    });

    // Обработчики для основной модалки консультации
    modalBtns.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Закрытие по ESC для основной модалки
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Предотвращаем закрытие при клике на само модальное окно
    modal.querySelector('.container__modal').addEventListener('click', function(event) {
        event.stopPropagation();
    });

    // Слушаем изменения в полях формы
    nameInput.addEventListener('input', checkFormValidity);
    cityInput.addEventListener('input', checkFormValidity);
    phoneInput.addEventListener('input', checkFormValidity);
    checkbox.addEventListener('change', checkFormValidity);

    // Обработчики отправки
    form.addEventListener('submit', handleSubmit);
    submitBtn.addEventListener('click', handleButtonClick);

    // Обработчики для модалки успеха
    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', closeSuccessModal);
    }

    if (successBtn) {
        successBtn.addEventListener('click', closeSuccessModal);
    }

    if (successOverlay) {
        successOverlay.addEventListener('click', closeSuccessModal);
    }

    // Закрытие по ESC для модалки успеха
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && successModal.style.display === 'block') {
            closeSuccessModal();
        }
    });

    // Предотвращаем закрытие при клике на само модальное окно успеха
    if (successModal) {
        successModal.querySelector('.container__modal').addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
    
});


const burger =  document.querySelector(".burger")
const headerMenu = document.querySelector(".header__menu")
const headerLinks = document.querySelectorAll(".header__menu-item")
const overlayBurger = document.querySelector('.overlay') 
const body = document.body

burger.addEventListener('click', function(){
    headerMenu.classList.toggle('header__menu--active')
    burger.classList.toggle('burger--active')
    overlayBurger.classList.toggle('overlay--active')
    body.classList.toggle('menu-open')
    headerLinks.forEach(link => {
        link.addEventListener('click', function(){
            console.log("ты нашел ссылку")
            headerMenu.classList.remove('header__menu--active')
            burger.classList.remove('burger--active')
            body.classList.remove('menu-open')
            overlayBurger.classList.remove('overlay--active')
        })
    })
})

overlayBurger.addEventListener('click', function(){
    headerMenu.classList.remove('header__menu--active')
    burger.classList.remove('burger--active')
    overlayBurger.classList.remove('overlay--active')
    body.classList.toggle('menu-open')
    headerLinks.forEach(link => {
        link.addEventListener('click', function(){
            console.log("ты нашел ссылку")
            headerMenu.classList.remove('header__menu--active')
            burger.classList.remove('burger--active')
            overlayBurger.classList.remove('overlay--active')
            body.classList.remove('menu-open')
        })
    })
})
