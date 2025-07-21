/**
 * Funções utilitárias - Moto Ponta Brasil
 * Versão segura e otimizada
 */

// ===== UTILITIES SEGURAS =====
export const Utils = {
    
    // Throttle function - previne spam de eventos
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Debounce function - atrasa execução
    debounce(func, wait, immediate = false) {
        let timeout;
        return function(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    // Sanitização segura de texto
    sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Criação segura de elementos
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        // Aplicar classes de forma segura
        if (options.classes) {
            if (Array.isArray(options.classes)) {
                element.classList.add(...options.classes);
            } else {
                element.className = options.classes;
            }
        }
        
        // Aplicar atributos de forma segura
        if (options.attributes) {
            Object.keys(options.attributes).forEach(attr => {
                element.setAttribute(attr, options.attributes[attr]);
            });
        }
        
        // Aplicar texto de forma segura
        if (options.text) {
            element.textContent = options.text;
        }
        
        // Aplicar estilos de forma segura
        if (options.styles) {
            Object.keys(options.styles).forEach(style => {
                element.style[style] = options.styles[style];
            });
        }
        
        return element;
    },

    // Animação suave para scroll
    smoothScrollTo(target, duration = 1000) {
        const targetElement = typeof target === 'string' ? 
            document.querySelector(target) : target;
            
        if (!targetElement) return;

        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();

        function animation(currentTime) {
            const timeElapsed = currentTime - startTime;
            const run = Utils.easeInOutQuart(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    },

    // Função de easing para animações suaves
    easeInOutQuart(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
    },

    // Verificar se elemento está visível na viewport
    isElementInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const vertInView = (rect.top + rect.height * threshold) <= windowHeight && 
                          (rect.top + rect.height * (1 - threshold)) >= 0;
        const horInView = (rect.left + rect.width * threshold) <= windowWidth && 
                         (rect.left + rect.width * (1 - threshold)) >= 0;
        
        return vertInView && horInView;
    },

    // Gerenciador de event listeners com cleanup automático
    addEventListenerWithCleanup(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        // Retorna função de cleanup
        return () => {
            element.removeEventListener(event, handler, options);
        };
    },

    // Verificar suporte a recursos
    supports: {
        touch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        reducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        darkMode: () => window.matchMedia('(prefers-color-scheme: dark)').matches,
        webp: () => {
            const canvas = document.createElement('canvas');
            return canvas.toDataURL('image/webp').indexOf('webp') > -1;
        }
    },

    // Armazenamento local seguro
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('Erro ao ler localStorage:', error);
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('Erro ao escrever localStorage:', error);
                return false;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Erro ao remover localStorage:', error);
                return false;
            }
        }
    },

    // Formatação de data/hora
    formatDate(date, locale = 'pt-BR') {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    },

    // Gerador de IDs únicos
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Validação de email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Detectar dispositivo móvel
    isMobile() {
        return window.innerWidth <= 768;
    },

    // Observador de performance
    performanceObserver: {
        start() {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.entryType === 'navigation') {
                            console.log('Tempo de carregamento:', entry.loadEventEnd - entry.loadEventStart, 'ms');
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['navigation'] });
                return observer;
            }
            return null;
        }
    },

    // Sistema de notificações simples
    notify(message, type = 'info', duration = 5000) {
        const notification = Utils.createElement('div', {
            classes: ['notification', `notification-${type}`],
            text: message,
            attributes: {
                'role': 'alert',
                'aria-live': 'polite'
            }
        });

        document.body.appendChild(notification);

        // Auto-remove após duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        return notification;
    }
};

// Verificação de integridade
if (typeof window !== 'undefined') {
    // Inicializar observador de performance
    Utils.performanceObserver.start();
    
    // Log de inicialização
    console.log('✅ Utils module loaded successfully');
}

export default Utils;
