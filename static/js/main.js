/**
 * MAIN.JS - JAVASCRIPT MODULAR PARA PÁGINAS LEGAIS - MOTO PONTA BRASIL
 * Sistema de módulos com carregamento assíncrono e controle de erros
 */

// ===== CONFIGURAÇÃO GLOBAL =====
window.MotoPonta = {
    config: {
        animationDuration: 300,
        scrollOffset: 100,
        redirectTime: 15,
        facebookUrl: 'https://facebook.com/motoponta',
        debug: true
    },
    modules: {},
    utils: {},
    initialized: false
};

// ===== SISTEMA DE LOGS SEGURO =====
window.MotoPonta.log = {
    info: (message, ...args) => {
        if (window.MotoPonta.config.debug && console && console.log) {
            console.log(`[MotoPonta] ${message}`, ...args);
        }
    },
    error: (message, error) => {
        if (console && console.error) {
            console.error(`[MotoPonta Error] ${message}`, error);
        }
    },
    warn: (message, ...args) => {
        if (console && console.warn) {
            console.warn(`[MotoPonta Warning] ${message}`, ...args);
        }
    }
};

// ===== UTILITIES CORE =====
window.MotoPonta.utils = {
    // Throttle function para performance
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Debounce function para performance
    debounce: (func, wait, immediate) => {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },

    // Sanitizar HTML para prevenir XSS
    sanitizeHTML: (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Criar elemento de forma segura
    createElement: (tag, attributes = {}, content = '') => {
        const element = document.createElement(tag);
        
        // Definir atributos de forma segura
        Object.keys(attributes).forEach(key => {
            if (key === 'textContent') {
                element.textContent = attributes[key];
            } else if (key === 'innerHTML') {
                // Usar apenas se necessário e de fonte confiável
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (content && typeof content === 'string') {
            element.textContent = content;
        }
        
        return element;
    },

    // Verificar se elemento está visível na viewport
    isElementInViewport: (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Scroll suave para elemento
    scrollToElement: (element, offset = 0) => {
        if (!element) return;
        
        const elementPosition = element.offsetTop - offset;
        
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback para navegadores antigos
            window.scrollTo(0, elementPosition);
        }
    },

    // Detectar dispositivo móvel
    isMobile: () => {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Detectar se usuário prefere animações reduzidas
    prefersReducedMotion: () => {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
};

// ===== MÓDULO DE ANIMAÇÕES =====
window.MotoPonta.modules.animations = {
    init() {
        this.setupScrollAnimations();
        this.setupLoadingAnimations();
        window.MotoPonta.log.info('Módulo de animações inicializado');
    },

    setupScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        if (elements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => {
            observer.observe(el);
        });
    },

    setupLoadingAnimations() {
        // Apenas se não há preferência por movimento reduzido
        if (window.MotoPonta.utils.prefersReducedMotion()) return;

        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100 + 500);
        });
    }
};

// ===== MÓDULO DE COOKIES =====
window.MotoPonta.modules.cookies = {
    init() {
        this.setupCookieConsent();
        window.MotoPonta.log.info('Módulo de cookies inicializado');
    },

    setupCookieConsent() {
        const consent = localStorage.getItem('cookieConsent');
        const banner = document.getElementById('cookieConsent');
        
        if (!banner) return;

        if (!consent) {
            setTimeout(() => {
                banner.style.display = 'block';
                banner.style.animation = 'slideInDown 0.5s ease-out';
            }, 2000);
        }

        const acceptBtn = document.getElementById('acceptCookies');
        const declineBtn = document.getElementById('declineCookies');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptCookies());
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', () => this.declineCookies());
        }
    },

    acceptCookies() {
        localStorage.setItem('cookieConsent', 'accepted');
        this.hideBanner();
        window.MotoPonta.modules.notifications.showToast('🍪 Cookies aceitos com sucesso!', 'success');
    },

    declineCookies() {
        localStorage.setItem('cookieConsent', 'declined');
        this.hideBanner();
        window.MotoPonta.modules.notifications.showToast('Cookies recusados', 'info');
    },

    hideBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.style.animation = 'slideOutDown 0.3s ease-in';
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300);
        }
    }
};

// ===== MÓDULO DE NOTIFICAÇÕES =====
window.MotoPonta.modules.notifications = {
    init() {
        this.createToastContainer();
        window.MotoPonta.log.info('Módulo de notificações inicializado');
    },

    createToastContainer() {
        if (document.querySelector('.toast-container')) return;

        const container = window.MotoPonta.utils.createElement('div', {
            class: 'toast-container position-fixed top-0 end-0 p-3',
            style: 'z-index: 9999;'
        });

        document.body.appendChild(container);
    },

    showToast(message, type = 'info', duration = 5000) {
        const container = document.querySelector('.toast-container');
        if (!container) return;

        const toastId = 'toast-' + Date.now();
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const colorMap = {
            success: 'text-success',
            error: 'text-danger',
            warning: 'text-warning',
            info: 'text-info'
        };

        const toast = window.MotoPonta.utils.createElement('div', {
            class: 'toast',
            role: 'alert',
            'aria-live': 'assertive',
            'aria-atomic': 'true',
            id: toastId
        });

        const sanitizedMessage = window.MotoPonta.utils.sanitizeHTML(message);
        
        toast.innerHTML = `
            <div class="toast-header ${colorMap[type]}">
                <i class="${iconMap[type]} me-2"></i>
                <strong class="me-auto">Moto Ponta</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fechar"></button>
            </div>
            <div class="toast-body">
                ${sanitizedMessage}
            </div>
        `;

        container.appendChild(toast);

        // Usar Bootstrap toast se disponível
        if (window.bootstrap && window.bootstrap.Toast) {
            const bsToast = new window.bootstrap.Toast(toast, {
                delay: duration
            });
            bsToast.show();
        } else {
            // Fallback manual
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                toast.style.transition = 'all 0.3s ease-out';
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(0)';
            }, 100);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
        }
    }
};

// ===== MÓDULO DE ACESSIBILIDADE =====
window.MotoPonta.modules.accessibility = {
    init() {
        this.setupSkipLinks();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        window.MotoPonta.log.info('Módulo de acessibilidade inicializado');
    },

    setupSkipLinks() {
        const mainContent = document.querySelector('#main-content') || 
                          document.querySelector('main') || 
                          document.querySelector('.legal-content');
        
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    },

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC para fechar modais/banners
            if (e.key === 'Escape') {
                const banner = document.getElementById('redirectBanner');
                if (banner && window.MotoPonta.modules.redirect) {
                    window.MotoPonta.modules.redirect.cancelRedirect();
                }
            }

            // Tab melhorado
            if (e.key === 'Tab') {
                setTimeout(() => this.highlightFocusedElement(), 10);
            }
        });
    },

    setupFocusManagement() {
        // Garantir que elementos interativos sejam focáveis
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
        
        interactiveElements.forEach(element => {
            if (!element.hasAttribute('tabindex') && element.tabIndex < 0) {
                element.setAttribute('tabindex', '0');
            }
        });
    },

    highlightFocusedElement() {
        const focused = document.activeElement;
        if (focused && focused !== document.body) {
            focused.classList.add('focus-visible');
            
            setTimeout(() => {
                focused.classList.remove('focus-visible');
            }, 3000);
        }
    }
};

// ===== INICIALIZAÇÃO PRINCIPAL =====
window.MotoPonta.init = function() {
    if (this.initialized) {
        this.log.warn('Sistema já foi inicializado');
        return;
    }

    try {
        // Inicializar módulos em ordem de prioridade
        this.modules.accessibility.init();
        this.modules.notifications.init();
        this.modules.cookies.init();
        this.modules.animations.init();

        // Carregar módulos específicos se necessário
        if (document.getElementById('redirectBanner') || window.location.pathname.endsWith('/') || window.location.pathname.includes('index')) {
            this.loadRedirectModule();
        }

        this.initialized = true;
        this.log.info('🚀 Sistema Moto Ponta inicializado com sucesso');

    } catch (error) {
        this.log.error('Erro durante inicialização', error);
    }
};

// ===== CARREGAMENTO DINÂMICO DE MÓDULOS =====
window.MotoPonta.loadRedirectModule = function() {
    // Módulo de redirecionamento funcional
    if (typeof this.modules.redirect === 'undefined') {
        this.modules.redirect = {
            timeLeft: 15,
            timer: null,
            banner: null,
            
            init() {
                // Verificar se está na página inicial
                const pathname = window.location.pathname;
                const isIndex = pathname === '/' || 
                               pathname === '/index.html' || 
                               pathname.endsWith('/');
                
                if (isIndex && !localStorage.getItem('redirectCancelled')) {
                    this.createBanner();
                    this.startCountdown();
                    window.MotoPonta.log.info('Redirecionamento iniciado: 15 segundos para Facebook');
                }
            },
            
            createBanner() {
                // Remover banner existente
                if (this.banner) {
                    this.banner.remove();
                }
                
                // Criar banner
                this.banner = document.createElement('div');
                this.banner.id = 'redirectBanner';
                this.banner.className = 'alert alert-info position-fixed';
                this.banner.style.cssText = `
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    max-width: 350px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                `;
                
                this.banner.innerHTML = `
                    <div class="d-flex align-items-center">
                        <i class="fab fa-facebook-f me-2" style="color: #1877f2;"></i>
                        <div class="flex-grow-1">
                            <strong>Redirecionamento em <span id="countdown">15</span>s</strong><br>
                            <small>Você será redirecionado para nossa página no Facebook</small>
                        </div>
                        <div class="ms-2">
                            <button class="btn btn-sm btn-primary me-1" onclick="window.MotoPonta.modules.redirect.redirectNow()">
                                Ir Agora
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="window.MotoPonta.modules.redirect.cancel()">
                                Cancelar
                            </button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(this.banner);
            },
            
            startCountdown() {
                this.timer = setInterval(() => {
                    this.timeLeft--;
                    const countdownEl = document.getElementById('countdown');
                    if (countdownEl) {
                        countdownEl.textContent = this.timeLeft;
                    }
                    
                    if (this.timeLeft <= 0) {
                        this.redirectNow();
                    }
                }, 1000);
            },
            
            redirectNow() {
                if (this.timer) {
                    clearInterval(this.timer);
                }
                if (this.banner) {
                    this.banner.remove();
                }
                window.location.href = 'https://facebook.com/motoponta';
            },
            
            cancel() {
                if (this.timer) {
                    clearInterval(this.timer);
                }
                if (this.banner) {
                    this.banner.remove();
                }
                localStorage.setItem('redirectCancelled', 'true');
                window.MotoPonta.log.info('Redirecionamento cancelado pelo usuário');
            },
            
            // Função para resetar o cancelamento (para testes)
            reset() {
                localStorage.removeItem('redirectCancelled');
                window.MotoPonta.log.info('Status de redirecionamento resetado');
            }
        };
        
        this.modules.redirect.init();
    }
};

// ===== TRATAMENTO DE ERROS GLOBAL =====
window.addEventListener('error', function(e) {
    window.MotoPonta.log.error('Erro JavaScript capturado', e.error);
    
    // Não mostrar erros para o usuário em produção
    if (window.MotoPonta.config.debug) {
        console.error('Erro detalhado:', e);
    }
});

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.MotoPonta.init();
    });
} else {
    // DOM já carregado
    window.MotoPonta.init();
}
