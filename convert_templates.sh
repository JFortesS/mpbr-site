#!/bin/bash

# Script para converter templates Jinja2 para HTML puro

# Array com os arquivos a serem convertidos
files=("politica-cookies.html" "informacoes-lgpd.html" "meta-compliance.html")

# Template do header HTML
header='<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%TITLE% - Moto Ponta Brasil</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CSS Customizado -->
    <link href="static/css/styles.css" rel="stylesheet">
    
    <!-- Meta Tags para SEO -->
    <meta name="description" content="%DESCRIPTION%">
    <meta name="keywords" content="%KEYWORDS%">
    <meta name="author" content="Moto Ponta Brasil">
    <meta name="robots" content="index, follow">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
    <!-- Skip Link para Acessibilidade -->
    <a href="#main-content" class="skip-link sr-only">Pular para o conteúdo principal</a>

    <!-- Header -->
    <header class="legal-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h1 class="mb-1">
                        <i class="fas fa-shield-alt me-3"></i>Central Legal e Conformidade
                    </h1>
                    <p class="mb-0 header-subtitle">
                        Transparência, proteção de dados e conformidade legal
                    </p>
                </div>
            </div>
        </div>
    </header>

    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb-custom" aria-label="breadcrumb">
        <div class="container">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="index.html">
                        <i class="fas fa-home"></i> Início
                    </a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">%BREADCRUMB%</li>
            </ol>
        </div>
    </nav>

    <!-- Main Content -->
    <main id="main-content" class="legal-content">
        <div class="container">'

# Template do footer HTML
footer='        </div>
    </main>

    <!-- Footer -->
    <footer class="footer-legal">
        <div class="container">
            <div class="row">
                <div class="col-lg-4 mb-4">
                    <h5><i class="fas fa-building"></i> Moto Ponta Brasil</h5>
                    <p>Delivery inteligente com tecnologia de ponta e compromisso com a proteção de dados.</p>
                    <div class="social-links">
                        <a href="https://facebook.com/motoponta" class="me-3" target="_blank" rel="noopener">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://instagram.com/motoponta" class="me-3" target="_blank" rel="noopener">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="https://whatsapp.com/motoponta" target="_blank" rel="noopener">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                    </div>
                </div>
                <div class="col-lg-4 mb-4">
                    <h6>Páginas Legais</h6>
                    <ul class="footer-links">
                        <li><a href="termos-uso.html">Termos de Uso</a></li>
                        <li><a href="politica-privacidade.html">Política de Privacidade</a></li>
                        <li><a href="politica-cookies.html">Política de Cookies</a></li>
                        <li><a href="informacoes-lgpd.html">Informações LGPD</a></li>
                        <li><a href="meta-compliance.html">Conformidade Meta</a></li>
                    </ul>
                </div>
                <div class="col-lg-4 mb-4">
                    <h6>Contato Legal</h6>
                    <p><i class="fas fa-envelope"></i> dpo@motoponta.com.br</p>
                    <p><i class="fas fa-phone"></i> +55 (42) 99161-9261</p>
                    <p><i class="fas fa-map-marker-alt"></i> Ponta Grossa, PR</p>
                </div>
            </div>
            <hr class="my-4">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <p class="mb-0">&copy; 2025 Moto Ponta Brasil. Todos os direitos reservados.</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="mb-0">
                        <i class="fas fa-shield-alt"></i> LGPD Compliant
                        <span class="ms-3"><i class="fas fa-check-circle text-success"></i> Meta Approved</span>
                    </p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- JavaScript Customizado -->
    <script src="static/js/main.js"></script>
</body>
</html>'

# Função para converter arquivo
convert_file() {
    local file=$1
    local title=$2
    local description=$3
    local keywords=$4
    local breadcrumb=$5
    
    echo "Convertendo $file..."
    
    # Criar backup
    cp "$file" "${file}.bak"
    
    # Extrair conteúdo entre {% block content %} e {% endblock %}
    content=$(sed -n '/{% block content %}/,/{% endblock %}/p' "$file" | sed '1d;$d')
    
    # Personalizar header
    local custom_header=$(echo "$header" | sed -e "s/%TITLE%/$title/g" -e "s/%DESCRIPTION%/$description/g" -e "s/%KEYWORDS%/$keywords/g" -e "s/%BREADCRUMB%/$breadcrumb/g")
    
    # Criar novo arquivo
    echo "$custom_header" > "$file"
    echo "$content" >> "$file"
    echo "$footer" >> "$file"
    
    # Substituir variáveis template
    sed -i 's/{{ data_atualizacao }}/Janeiro de 2025/g' "$file"
    
    echo "Conversão de $file concluída!"
}

# Converter cada arquivo
convert_file "politica-cookies.html" "Política de Cookies" "Política de Cookies da Moto Ponta Brasil - Como utilizamos cookies para melhorar sua experiência." "política de cookies, cookies, moto ponta, privacidade" "Política de Cookies"

convert_file "informacoes-lgpd.html" "Informações LGPD" "Informações LGPD da Moto Ponta Brasil - Seus direitos como titular de dados pessoais." "LGPD, proteção de dados, direitos, titular de dados" "Informações LGPD"

convert_file "meta-compliance.html" "Conformidade Meta" "Conformidade Meta da Moto Ponta Brasil - Compliance com políticas do WhatsApp Business." "meta compliance, whatsapp business, políticas meta" "Conformidade Meta"

echo "Todas as conversões concluídas!"
