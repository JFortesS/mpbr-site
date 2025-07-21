/**
 * Gerenciador de Redirecionamento - Moto Ponta Brasil
 * Sistema seguro e acessível
 */

import { Utils } from './utils.js';

export class RedirectManager {
    constructor(config = {}) {
        this.config = {
            redirectTime: 30, // segundos
            facebookUrl: 'https://facebook.com/motoponta',
            enableAutoRedirect: true,
            showProgressBar: true,
            ...config
        };
        
        this.timer = null;
        this.banner = null;
        this.cleanupFunctions = [];
        this.isPaused = false;
        this.timeLeft = this.config.redirectTime;
    }

    // Inicializar redirecionamento (apenas se estiver na página index)
    init() {
        // Verificar se deve ativar o redirecionamento
        if (!this.shouldActivate()) {
            return false;
        }

        this.createBanner();
        this.startCountdown();
        console.log('🔄 Redirect Manager initialized');
        return true;
    }

    // Verificar se deve ativar o redirecionamento
    shouldActivate() {
        const pathname = window.location.pathname;
        const isIndex = pathname === '/' || 
                       pathname === '/index.html' || 
                       pathname.endsWith('/');
        
        // Verificar se o usuário já cancelou o redirecionamento
        const userCancelled = Utils.storage.get('redirectCancelled', false);
        
        return isIndex && !userCancelled && this.config.enableAutoRedirect;
    }

    // Criar banner de redirecionamento de forma segura
    createBanner() {
        // Remover banner existente se houver
        this.removeBanner();

        this.banner = Utils.createElement('div', {
            attributes: {
                'id': 'redirectBanner',
                'role': 'banner',
                'aria-label': 'Aviso de redirecionamento automático'
            },
            classes: ['redirect-banner']
        });

        // Criar conteúdo do banner
        const container = Utils.createElement('div', {
            classes: ['container']
        });

        const row = Utils.createElement('div', {
            classes: ['row', 'align-items-center']
        });

        // Coluna de conteúdo
        const contentCol = Utils.createElement('div', {
            classes: ['col-md-8']
        });

        const redirectContent = Utils.createElement('div', {
            classes: ['redirect-content']
        });

        const icon = Utils.createElement('i', {
            classes: ['fab', 'fa-facebook-f', 'redirect-icon'],
            attributes: {
                'aria-hidden': 'true'
            }
        });

        const textDiv = Utils.createElement('div', {
            classes: ['redirect-text']
        });

        const title = Utils.createElement('h5', {
            text: '🔄 Redirecionamento Automático',
            styles: { marginBottom: '0.25rem' }
        });

        const description = Utils.createElement('p', {
            styles: { margin: '0' }
        });
        description.innerHTML = `Você será redirecionado para nossa página do Facebook em <span id="countdown" aria-live="polite">${this.timeLeft}</span> segundos`;

        // Coluna de botões
        const buttonCol = Utils.createElement('div', {
            classes: ['col-md-4', 'text-md-end']
        });

        const redirectNowBtn = Utils.createElement('button', {
            text: 'Ir Agora',
            classes: ['btn', 'btn-light', 'btn-sm', 'me-2'],
            attributes: {
                'id': 'redirectNow',
                'type': 'button',
                'aria-label': 'Ir para o Facebook agora'
            }
        });

        const cancelBtn = Utils.createElement('button', {
            text: 'Cancelar',
            classes: ['btn', 'btn-outline-light', 'btn-sm'],
            attributes: {
                'id': 'cancelRedirect',
                'type': 'button',
                'aria-label': 'Cancelar redirecionamento'
            }
        });

        // Barra de progresso
        const progressBar = Utils.createElement('div', {
            classes: ['progress-bar'],
            attributes: {
                'role': 'progressbar',
                'aria-label': 'Progresso do redirecionamento'
            }
        });

        const progressFill = Utils.createElement('div', {
            classes: ['progress-fill'],
            attributes: {
                'aria-hidden': 'true'
            }
        });

        // Montar estrutura
        textDiv.appendChild(title);
        textDiv.appendChild(description);
        redirectContent.appendChild(icon);
        redirectContent.appendChild(textDiv);
        contentCol.appendChild(redirectContent);
        
        buttonCol.appendChild(redirectNowBtn);
        buttonCol.appendChild(cancelBtn);
        
        row.appendChild(contentCol);
        row.appendChild(buttonCol);
        container.appendChild(row);
        
        progressBar.appendChild(progressFill);
        
        this.banner.appendChild(container);
        this.banner.appendChild(progressBar);

        // Adicionar event listeners com cleanup
        this.cleanupFunctions.push(
            Utils.addEventListenerWithCleanup(redirectNowBtn, 'click', () => this.redirectNow()),
            Utils.addEventListenerWithCleanup(cancelBtn, 'click', () => this.cancel()),
            Utils.addEventListenerWithCleanup(document, 'keydown', (e) => this.handleKeydown(e))
        );

        // Inserir no DOM
        document.body.insertBefore(this.banner, document.body.firstChild);
        
        // Ajustar padding do body
        this.adjustBodyPadding();
    }

    // Iniciar countdown
    startCountdown() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            if (this.isPaused) return;
            
            this.timeLeft--;
            this.updateCountdown();
            this.updateProgressBar();
            
            if (this.timeLeft <= 0) {
                this.redirectNow();
            }
        }, 1000);
    }

    // Atualizar display do countdown
    updateCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.textContent = this.timeLeft;
            
            // Destacar quando restam poucos segundos
            if (this.timeLeft <= 10) {
                countdownElement.style.color = '#ff6b6b';
                countdownElement.style.fontWeight = 'bold';
            }
        }
    }

    // Atualizar barra de progresso
    updateProgressBar() {
        if (!this.config.showProgressBar) return;
        
        const progressFill = this.banner?.querySelector('.progress-fill');
        if (progressFill) {
            const progress = ((this.config.redirectTime - this.timeLeft) / this.config.redirectTime) * 100;
            progressFill.style.width = `${progress}%`;
            progressFill.setAttribute('aria-valuenow', progress);
        }
    }

    // Redirecionar imediatamente
    redirectNow() {
        this.cleanup();
        
        // Analytics tracking (se disponível)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'redirect_manual', {
                'event_category': 'navigation',
                'event_label': 'facebook_redirect'
            });
        }
        
        window.location.href = this.config.facebookUrl;
    }

    // Cancelar redirecionamento
    cancel() {
        this.cleanup();
        
        // Salvar preferência do usuário
        Utils.storage.set('redirectCancelled', true);
        
        // Mostrar confirmação
        Utils.notify('Redirecionamento cancelado', 'info', 3000);
        
        // Analytics tracking (se disponível)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'redirect_cancelled', {
                'event_category': 'navigation',
                'event_label': 'user_action'
            });
        }
    }

    // Pausar/retomar countdown
    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    // Manipular eventos de teclado
    handleKeydown(event) {
        if (event.key === 'Escape') {
            this.cancel();
        } else if (event.key === 'Enter' && event.target.id === 'redirectNow') {
            this.redirectNow();
        } else if (event.key === ' ') {
            event.preventDefault();
            this.isPaused ? this.resume() : this.pause();
        }
    }

    // Ajustar padding do body
    adjustBodyPadding() {
        if (this.banner) {
            const bannerHeight = this.banner.offsetHeight;
            document.body.style.paddingTop = `${bannerHeight}px`;
        }
    }

    // Remover banner
    removeBanner() {
        if (this.banner && this.banner.parentNode) {
            this.banner.parentNode.removeChild(this.banner);
            this.banner = null;
            document.body.style.paddingTop = '';
        }
    }

    // Cleanup completo
    cleanup() {
        // Limpar timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Remover event listeners
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];

        // Remover banner
        this.removeBanner();
    }

    // Destruir instância
    destroy() {
        this.cleanup();
        console.log('🔄 Redirect Manager destroyed');
    }

    // Verificar se está ativo
    isActive() {
        return this.banner !== null && this.timer !== null;
    }

    // Resetar para estado inicial
    reset() {
        this.cleanup();
        this.timeLeft = this.config.redirectTime;
        this.isPaused = false;
        Utils.storage.remove('redirectCancelled');
    }

    // Obter status atual
    getStatus() {
        return {
            isActive: this.isActive(),
            timeLeft: this.timeLeft,
            isPaused: this.isPaused,
            config: { ...this.config }
        };
    }
}

export default RedirectManager;
