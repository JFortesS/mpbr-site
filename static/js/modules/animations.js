/**
 * Gerenciador de Animações - Moto Ponta Brasil
 * Sistema otimizado para performance
 */

import { Utils } from './utils.js';

export class AnimationManager {
    constructor(config = {}) {
        this.config = {
            animationDuration: 300,
            scrollOffset: 100,
            enableParallax: true,
            reduceMotionOnMobile: true,
            intersectionThreshold: 0.1,
            ...config
        };
        
        this.observers = [];
        this.scrollAnimations = new Set();
        this.activeAnimations = new Map();
        this.cleanupFunctions = [];
        
        // Verificar preferências de motion
        this.respectReducedMotion = Utils.supports.reducedMotion();
        this.isMobile = Utils.isMobile();
    }

    // Inicializar sistema de animações
    init() {
        this.setupScrollAnimations();
        this.initLoadingAnimations();
        this.createBackToTopButton();
        this.setupEventListeners();
        
        console.log('🎬 Animation Manager initialized');
        return this;
    }

    // Configurar animações de scroll
    setupScrollAnimations() {
        // Encontrar elementos que devem ser animados
        const animatedElements = document.querySelectorAll(
            '.highlight-box, .contact-info, .warning-box, .card, [data-animate]'
        );

        animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
        });

        // Configurar Intersection Observer
        this.createScrollObserver();
        
        // Setup scroll handler para parallax
        if (this.config.enableParallax && !this.respectReducedMotion && !this.isMobile) {
            this.setupParallaxEffect();
        }
    }

    // Criar Intersection Observer para animações de scroll
    createScrollObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback para navegadores antigos
            this.setupScrollFallback();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: this.config.intersectionThreshold,
            rootMargin: `${this.config.scrollOffset}px`
        });

        // Observar todos os elementos
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => {
            observer.observe(el);
        });

        this.observers.push(observer);
    }

    // Animar elemento
    animateElement(element) {
        if (this.respectReducedMotion) {
            element.classList.add('animate-in');
            return;
        }

        // Aplicar animação baseada no tipo de elemento
        const animationType = element.dataset.animate || this.getDefaultAnimation(element);
        
        element.classList.add('animate-in');
        
        // Adicionar classe específica de animação
        if (animationType) {
            element.classList.add(animationType);
        }

        // Registrar animação ativa
        this.activeAnimations.set(element, animationType);
        
        // Cleanup após animação
        setTimeout(() => {
            this.activeAnimations.delete(element);
        }, this.config.animationDuration * 2);
    }

    // Obter animação padrão baseada no elemento
    getDefaultAnimation(element) {
        if (element.classList.contains('card')) return 'fade-in-up';
        if (element.classList.contains('highlight-box')) return 'slide-in-left';
        if (element.classList.contains('warning-box')) return 'slide-in-right';
        return 'fade-in-up';
    }

    // Configurar efeito parallax
    setupParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.legal-header, [data-parallax]');
        
        if (parallaxElements.length === 0) return;

        const scrollHandler = Utils.throttle(() => {
            const scrollTop = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;
                const transform = `translateY(${scrollTop * speed}px)`;
                
                // Usar transform3d para melhor performance
                element.style.transform = `translate3d(0, ${scrollTop * speed}px, 0)`;
            });
        }, 16); // ~60fps

        this.cleanupFunctions.push(
            Utils.addEventListenerWithCleanup(window, 'scroll', scrollHandler, { passive: true })
        );
    }

    // Fallback para navegadores sem Intersection Observer
    setupScrollFallback() {
        const scrollHandler = Utils.throttle(() => {
            const elements = document.querySelectorAll('.animate-on-scroll:not(.animate-in)');
            
            elements.forEach(element => {
                if (Utils.isElementInViewport(element, this.config.intersectionThreshold)) {
                    this.animateElement(element);
                }
            });
        }, 100);

        this.cleanupFunctions.push(
            Utils.addEventListenerWithCleanup(window, 'scroll', scrollHandler, { passive: true })
        );
    }

    // Animações de loading inicial
    initLoadingAnimations() {
        if (this.respectReducedMotion) return;

        // Simular carregamento progressivo de cards
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100 + 500);
        });
    }

    // Criar botão "voltar ao topo"
    createBackToTopButton() {
        // Verificar se já existe
        if (document.querySelector('.back-to-top')) return;

        const button = Utils.createElement('button', {
            classes: ['back-to-top'],
            attributes: {
                'type': 'button',
                'aria-label': 'Voltar ao topo da página',
                'title': 'Voltar ao topo'
            }
        });

        const icon = Utils.createElement('i', {
            classes: ['fas', 'fa-arrow-up'],
            attributes: { 'aria-hidden': 'true' }
        });

        button.appendChild(icon);
        document.body.appendChild(button);

        // Event listeners
        this.cleanupFunctions.push(
            Utils.addEventListenerWithCleanup(button, 'click', () => this.scrollToTop()),
            Utils.addEventListenerWithCleanup(window, 'scroll', 
                Utils.throttle(() => this.toggleBackToTop(), 100), 
                { passive: true }
            )
        );
    }

    // Mostrar/ocultar botão voltar ao topo
    toggleBackToTop() {
        const button = document.querySelector('.back-to-top');
        if (!button) return;

        const scrollTop = window.pageYOffset;
        const shouldShow = scrollTop > 300;

        if (shouldShow && !button.classList.contains('show')) {
            button.classList.add('show');
        } else if (!shouldShow && button.classList.contains('show')) {
            button.classList.remove('show');
        }
    }

    // Scroll suave para o topo
    scrollToTop() {
        if (this.respectReducedMotion) {
            window.scrollTo(0, 0);
            return;
        }

        Utils.smoothScrollTo(document.body, 1000);
    }

    // Criar efeito ripple em botões
    createRippleEffect(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = Utils.createElement('span', {
            classes: ['ripple-effect'],
            styles: {
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}px`,
                top: `${y}px`,
                position: 'absolute',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.6)',
                transform: 'scale(0)',
                animation: 'ripple 0.6s linear',
                pointerEvents: 'none'
            }
        });

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        // Remover após animação
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    // Configurar event listeners gerais
    setupEventListeners() {
        // Ripple effect em botões
        const buttons = document.querySelectorAll('.btn, .btn-legal');
        buttons.forEach(button => {
            this.cleanupFunctions.push(
                Utils.addEventListenerWithCleanup(button, 'click', (e) => {
                    if (!this.respectReducedMotion) {
                        this.createRippleEffect(e);
                    }
                })
            );
        });

        // Redimensionamento da janela
        this.cleanupFunctions.push(
            Utils.addEventListenerWithCleanup(window, 'resize', 
                Utils.debounce(() => this.handleResize(), 250)
            )
        );
    }

    // Lidar com redimensionamento
    handleResize() {
        this.isMobile = Utils.isMobile();
        
        // Desabilitar animações pesadas em mobile
        if (this.isMobile && this.config.reduceMotionOnMobile) {
            const heavyAnimations = document.querySelectorAll('.float-animation, .glow-animation');
            heavyAnimations.forEach(el => {
                el.style.animation = 'none';
            });
        }
    }

    // Animar elemento específico programaticamente
    animateElementById(elementId, animationType = 'fade-in-up') {
        const element = document.getElementById(elementId);
        if (!element) return false;

        if (this.respectReducedMotion) {
            element.style.opacity = '1';
            return true;
        }

        element.classList.add(animationType);
        return true;
    }

    // Pausar todas as animações
    pauseAllAnimations() {
        document.documentElement.style.setProperty('--animation-play-state', 'paused');
    }

    // Retomar todas as animações
    resumeAllAnimations() {
        document.documentElement.style.setProperty('--animation-play-state', 'running');
    }

    // Cleanup e destruição
    cleanup() {
        // Limpar observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];

        // Limpar event listeners
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];

        // Limpar animações ativas
        this.activeAnimations.clear();
        this.scrollAnimations.clear();
    }

    // Destruir instância
    destroy() {
        this.cleanup();
        console.log('🎬 Animation Manager destroyed');
    }

    // Obter estatísticas
    getStats() {
        return {
            activeAnimations: this.activeAnimations.size,
            scrollAnimations: this.scrollAnimations.size,
            observers: this.observers.length,
            respectReducedMotion: this.respectReducedMotion,
            isMobile: this.isMobile
        };
    }
}

export default AnimationManager;
