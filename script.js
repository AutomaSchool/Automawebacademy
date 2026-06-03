(function () {
  'use strict';

  /**
   * Sanitiza texto para prevenir XSS básico.
   * Elimina etiquetas HTML y caracteres peligrosos.
   */
  function sanitizeInput(value) {
    if (typeof value !== 'string') return '';

    return value
      .replace(/[<>"'`&]/g, function (char) {
        var entities = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '`': '&#x60;',
          '&': '&amp;'
        };
        return entities[char] || char;
      })
      .trim();
  }

  /**
   * Valida formato de email.
   */
  function isValidEmail(email) {
    var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return pattern.test(email);
  }

  /**
   * Muestra u oculta mensaje de error en un campo.
   */
  function setFieldError(errorEl, message) {
    if (!errorEl) return;
    errorEl.textContent = message || '';
  }

  /**
   * Muestra mensaje de éxito.
   */
  function showSuccess(successEl, message) {
    if (!successEl) return;
    successEl.textContent = message;
    successEl.hidden = false;
  }

  /**
   * Resetea mensaje de éxito.
   */
  function hideSuccess(successEl) {
    if (!successEl) return;
    successEl.textContent = '';
    successEl.hidden = true;
  }

  /* --- Navegación móvil --- */
  var navToggle = document.querySelector('.nav__toggle');
  var navMenu = document.querySelector('.nav__menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --- Año en footer --- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* --- Efecto typewriter genérico --- */
  function initTypewriter(textSelector, wrapSelector, phrases) {
    var textEl = document.querySelector(textSelector);
    if (!textEl) return;

    var typewriterWrap = textEl.closest(wrapSelector);
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      textEl.textContent = phrases[0];
      if (typewriterWrap) {
        typewriterWrap.setAttribute('aria-label', phrases[0]);
      }
      return;
    }

    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var timerId = null;

    var TYPE_MS = 52;
    var DELETE_MS = 32;
    var PAUSE_TYPED_MS = 2400;
    var PAUSE_DELETED_MS = 380;

    function setAccessibleLabel(phrase) {
      if (typewriterWrap) {
        typewriterWrap.setAttribute('aria-label', phrase);
      }
    }

    function schedule(nextDelay) {
      timerId = window.setTimeout(tick, nextDelay);
    }

    function tick() {
      var phrase = phrases[phraseIndex];

      if (!isDeleting) {
        charIndex += 1;
        textEl.textContent = phrase.slice(0, charIndex);
        setAccessibleLabel(textEl.textContent);

        if (charIndex < phrase.length) {
          schedule(TYPE_MS);
          return;
        }

        isDeleting = true;
        schedule(PAUSE_TYPED_MS);
        return;
      }

      charIndex -= 1;
      textEl.textContent = phrase.slice(0, charIndex);

      if (charIndex > 0) {
        schedule(DELETE_MS);
        return;
      }

      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setAccessibleLabel('');
      schedule(PAUSE_DELETED_MS);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      } else if (!document.hidden && timerId === null) {
        schedule(PAUSE_DELETED_MS);
      }
    });

    tick();
  }

  /* --- Inicializar typewriters --- */
  initTypewriter('[data-typewriter]', '.hero__typewriter', [
    'resultados reales',
    'automatización',
    'formación'
  ]);

  initTypewriter('[data-typewriter-contact]', '.contact__typewriter', [
    'IA fácil en tu negocio'
  ]);

  initTypewriter('[data-typewriter-enterprise]', '.enterprise__typewriter', [
    'Automatizaciones para empresas'
  ]);

  /* --- Animaciones reveal al scroll (Fase 2) --- */
  var revealElements = document.querySelectorAll('.reveal');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealElements.length && !prefersReducedMotion) {
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
      );

      revealElements.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      revealElements.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  } else if (revealElements.length) {
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* --- Formulario Lead Magnet --- */
  var leadForm = document.getElementById('lead-form');

  if (leadForm) {
    var leadEmail = document.getElementById('lead-email');
    var leadEmailError = document.getElementById('lead-email-error');
    var leadSuccess = document.getElementById('lead-success');

    leadForm.addEventListener('submit', function (event) {
      event.preventDefault();
      hideSuccess(leadSuccess);
      setFieldError(leadEmailError, '');

      var rawEmail = leadEmail.value;
      var email = sanitizeInput(rawEmail);

      if (!email) {
        setFieldError(leadEmailError, 'El email es obligatorio.');
        leadEmail.focus();
        return;
      }

      if (!isValidEmail(email)) {
        setFieldError(leadEmailError, 'Ingresá un email válido.');
        leadEmail.focus();
        return;
      }

      /* Simulación de envío — conectar con backend o servicio de email marketing */
      showSuccess(leadSuccess, '¡Listo! Revisá tu bandeja de entrada para descargar la guía.');
      leadForm.reset();
    });
  }

  /* --- Formulario de Contacto --- */
  var contactForm = document.getElementById('contact-form');

  if (contactForm) {
    var contactName = document.getElementById('contact-name');
    var contactEmail = document.getElementById('contact-email');
    var contactMessage = document.getElementById('contact-message');
    var contactNameError = document.getElementById('contact-name-error');
    var contactEmailError = document.getElementById('contact-email-error');
    var contactMessageError = document.getElementById('contact-message-error');
    var contactSuccess = document.getElementById('contact-success');

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      hideSuccess(contactSuccess);
      setFieldError(contactNameError, '');
      setFieldError(contactEmailError, '');
      setFieldError(contactMessageError, '');

      var name = sanitizeInput(contactName.value);
      var email = sanitizeInput(contactEmail.value);
      var message = sanitizeInput(contactMessage.value);

      var hasError = false;

      if (!name) {
        setFieldError(contactNameError, 'El nombre es obligatorio.');
        hasError = true;
      } else if (name.length < 2) {
        setFieldError(contactNameError, 'El nombre debe tener al menos 2 caracteres.');
        hasError = true;
      }

      if (!email) {
        setFieldError(contactEmailError, 'El email es obligatorio.');
        hasError = true;
      } else if (!isValidEmail(email)) {
        setFieldError(contactEmailError, 'Ingresá un email válido.');
        hasError = true;
      }

      if (!message) {
        setFieldError(contactMessageError, 'El mensaje es obligatorio.');
        hasError = true;
      } else if (message.length < 10) {
        setFieldError(contactMessageError, 'El mensaje debe tener al menos 10 caracteres.');
        hasError = true;
      }

      if (hasError) {
        if (!name || name.length < 2) contactName.focus();
        else if (!email || !isValidEmail(email)) contactEmail.focus();
        else contactMessage.focus();
        return;
      }

      /* Simulación de envío — conectar con backend o servicio de formularios */
      showSuccess(contactSuccess, '¡Mensaje enviado! Te responderé pronto.');
      contactForm.reset();
    });
  }
})();
