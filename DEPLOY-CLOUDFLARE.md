# CLOUDFLARE PAGES - MOTO PONTA BRASIL

## 🌐 **CONFIGURAÇÃO PARA DEPLOY**

### **Estrutura otimizada para Cloudflare Pages:**

```
motoponta-legal/
├── index.html                 # Página principal (obrigatório)
├── termos-uso.html           # Termos de uso
├── politica-privacidade.html # Política de privacidade  
├── politica-cookies.html     # Política de cookies
├── informacoes-lgpd.html     # Informações LGPD
├── meta-compliance.html      # Conformidade Meta
├── base-template.html        # Template base
├── static/
│   ├── css/
│   │   ├── styles.css        # CSS principal
│   │   ├── base.css          # Variáveis e reset
│   │   ├── components.css    # Componentes
│   │   ├── animations.css    # Animações
│   │   └── responsive.css    # Responsividade
│   └── js/
│       └── main.js           # JavaScript principal
├── favicon.ico               # Favicon
└── _headers                  # Headers de segurança
```

### **Headers de Segurança (_headers):**

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:; connect-src 'self'
```

### **Configurações de Build:**

- **Build command:** `echo "Static site - no build needed"`
- **Output directory:** `/`
- **Root directory:** `/`

### **Variables de Ambiente:**

- `NODE_VERSION`: `18`
- `ENVIRONMENT`: `production`

### **Otimizações implementadas:**

✅ **Caminhos relativos** para todos os assets  
✅ **CSS modular** para melhor organização  
✅ **JavaScript seguro** sem vulnerabilidades XSS  
✅ **Estrutura semântica** para SEO  
✅ **Responsividade completa** mobile-first  
✅ **Acessibilidade WCAG 2.1** compliant  
✅ **Performance otimizada** com lazy loading  

### **URLs finais:**

- Principal: `https://motoponta.pages.dev/`
- Termos: `https://motoponta.pages.dev/termos-uso.html`
- Privacidade: `https://motoponta.pages.dev/politica-privacidade.html`
- Cookies: `https://motoponta.pages.dev/politica-cookies.html`
- LGPD: `https://motoponta.pages.dev/informacoes-lgpd.html`
- Meta: `https://motoponta.pages.dev/meta-compliance.html`
