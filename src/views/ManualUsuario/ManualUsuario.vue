<template>
  <div class="manual-wrapper">
    <!-- Hero Section -->
    <div v-if="!mostrarDocumentacao" class="hero-section">
      <div class="hero-content">
        <div class="hero-logo">
          <img src="@/assets/logo-preto-branco.png" alt="Logo Arcca Bebidas" />
        </div>
        <!-- <h1 class="hero-title">Arcca Bebidas</h1> -->
        <p class="hero-subtitle">Sistema de Gestão para Distribuidora de Bebidas</p>
        <p class="hero-description">
          Uma solução completa e intuitiva para gestão de estoque, pedidos, clientes e fornecedores.
          Controle total sobre o seu negócio de forma simples e eficiente.
        </p>
        <button class="btn-documentacao" @click="abrirDocumentacao">
          Acessar Documentação
          <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>

    <!-- Área de Documentação -->
    <div v-else class="documentacao-wrapper">
      <!-- Header da Documentação -->
      <header class="doc-header">
        <div class="doc-header-content">
          <div class="logo-section">
            <img src="@/assets/logo-preto-branco.png" alt="Logo Arcca Bebidas" />
          </div>
          <div class="header-actions">
            <router-link to="/login" class="btn-sistema">← Ir para o Sistema</router-link>
            <button class="btn-voltar" @click="voltarInicio">Voltar ao Início</button>
          </div>
        </div>
      </header>

      <div class="doc-layout">
        <!-- Menu Lateral -->
        <aside class="menu-lateral">
          <div class="menu-header">
            <h2>Documentação</h2>
          </div>
          <nav class="menu-nav">
            <a
              v-for="modulo in modulos"
              :key="modulo.id"
              :class="{ active: moduloSelecionado && moduloSelecionado.id === modulo.id }"
              @click="selecionarModulo(modulo)"
            >
              {{ modulo.nome }}
            </a>
          </nav>
        </aside>

        <!-- Conteúdo Principal -->
        <main class="conteudo-principal">
          <!-- Mensagem Inicial -->
          <div v-if="!moduloSelecionado" class="mensagem-inicial">
            <div class="mensagem-icon">📚</div>
            <h2>Bem-vindo à Documentação</h2>
            <p>Selecione um módulo no menu lateral para visualizar a documentação</p>
          </div>

          <!-- Conteúdo do Módulo -->
          <div v-else class="modulo-conteudo-wrapper">
            <div class="modulo-header">
              <h1>{{ moduloAtual.nome }}</h1>
              <p class="modulo-descricao">{{ moduloAtual.descricao }}</p>
            </div>

            <div class="modulo-conteudo">
              <!-- Visão Geral -->
              <section class="secao">
                <h2>Visão Geral</h2>
                <p>{{ moduloAtual.conteudo.visaoGeral }}</p>
              </section>

              <!-- Funcionalidades -->
              <section class="secao">
                <h2>Funcionalidades</h2>
                <ul class="lista-funcionalidades">
                  <li v-for="(func, index) in moduloAtual.conteudo.funcionalidades" :key="index">
                    {{ func }}
                  </li>
                </ul>
              </section>

              <!-- Regras de Negócio -->
              <section class="secao">
                <h2>Regras de Negócio</h2>
                <ul class="lista-regras">
                  <li v-for="(regra, index) in moduloAtual.conteudo.regrasNegocio" :key="index">
                    {{ regra }}
                  </li>
                </ul>
              </section>

              <!-- Capturas de Tela -->
              <section class="secao">
                <h2>Capturas de Tela</h2>
                <p class="secao-subtitulo">
                  Visualize as principais telas e funcionalidades do módulo
                </p>
                <div class="prints-grid">
                  <div
                    v-for="(print, index) in moduloAtual.conteudo.prints"
                    :key="index"
                    class="print-item"
                  >
                    <div class="print-info">
                      <h4>{{ print.titulo }}</h4>
                      <p>{{ print.descricao }}</p>
                    </div>
                    <div class="print-imagem" @click="abrirImagemModal(print.imagem)">
                      <img
                        v-if="print.imagem"
                        :src="print.imagem"
                        :alt="print.titulo"
                        @error="handleImageError"
                      />
                      <div v-else class="print-placeholder">
                        <span class="print-icon">📷</span>
                        <p class="print-numero">Captura {{ index + 1 }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Modal de Visualização de Imagem -->
    <div v-if="imagemModal" class="modal-overlay" @click="fecharImagemModal">
      <div class="modal-imagem">
        <button class="btn-fechar-modal" @click="fecharImagemModal">✕</button>
        <img :src="imagemModal" alt="Visualização ampliada" @click.stop />
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.manual-wrapper {
  min-height: 100vh;
  background: #ffffff;
}

/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: #ffffff;
}

.hero-content {
  max-width: 700px;
  text-align: center;
}

.hero-logo {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-logo img {
  width: 200px;
  height: auto;
  object-fit: contain;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.hero-description {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.btn-documentacao {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-documentacao:hover {
  background: #2d2d2d;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.btn-arrow {
  font-size: 1.25rem;
  transition: transform 0.3s;
}

.btn-documentacao:hover .btn-arrow {
  transform: translateX(4px);
}

/* Documentação Wrapper */
.documentacao-wrapper {
  min-height: 100vh;
  background: #ffffff;
}

/* Header da Documentação */
.doc-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.doc-header-content {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-section img {
  height: 120px;
  width: auto;
  object-fit: contain;
}

.logo-icon {
  font-size: 1.75rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-sistema {
  padding: 0.5rem 1rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
}

.btn-sistema:hover {
  background: #2d2d2d;
  transform: translateY(-1px);
}

.btn-voltar {
  padding: 0.5rem 1rem;
  background: transparent;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-voltar:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #1f2937;
}

/* Layout com Menu Lateral */
.doc-layout {
  display: flex;
}

/* Menu Lateral */
.menu-lateral {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  position: sticky;
  top: 73px;
  overflow: hidden;
}

.menu-header {
  padding: 2rem 1.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.menu-header h2 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-nav {
  padding: 1rem 0;
}

.menu-nav a {
  display: block;
  padding: 0.875rem 1.5rem;
  color: #4b5563;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.menu-nav a:hover {
  background: #f9fafb;
  color: #1f2937;
}

.menu-nav a.active {
  background: #f9fafb;
  color: #1a1a1a;
  border-left-color: #1a1a1a;
  font-weight: 600;
}

/* Conteúdo Principal */
.conteudo-principal {
  flex: 1;
  background: #f9fafb;
  overflow-y: auto;
  height: calc(100vh - 73px);
}

/* Mensagem Inicial */
.mensagem-inicial {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 4rem 2rem;
  text-align: center;
}

.mensagem-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.mensagem-inicial h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
}

.mensagem-inicial p {
  font-size: 1.125rem;
  color: #6b7280;
}

/* Conteúdo do Módulo */
.modulo-conteudo-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.modulo-header {
  margin-bottom: 3rem;
}

.modulo-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.modulo-descricao {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.7;
}

.modulo-conteudo {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Seções */
.secao {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
}

.secao h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
}

.secao p {
  font-size: 1rem;
  color: #4b5563;
  line-height: 1.7;
}

.secao-subtitulo {
  font-size: 0.9375rem !important;
  color: #6b7280 !important;
  margin-bottom: 1.5rem;
}

.lista-funcionalidades,
.lista-regras {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lista-funcionalidades li,
.lista-regras li {
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.6;
  padding-left: 1.5rem;
  position: relative;
}

.lista-funcionalidades li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: 700;
}

.lista-regras li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #1a1a1a;
  font-weight: 700;
}

/* Prints Grid */
.prints-grid {
  display: grid;
  gap: 2rem;
  margin-top: 1.5rem;
}

.print-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.print-imagem {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  position: relative;
  cursor: zoom-in;
}

.print-imagem:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.print-imagem::after {
  content: '🔍';
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  font-size: 1rem;
}

.print-imagem:hover::after {
  opacity: 1;
}

.print-imagem img {
  width: 100%;
  height: auto;
  display: block;
}

.print-placeholder {
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  aspect-ratio: 16/9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.print-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.print-numero {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

.print-info {
  margin-bottom: 1rem;
}

.print-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.print-info p {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 1024px) {
  .doc-layout {
    flex-direction: column;
    height: auto;
  }

  .menu-lateral {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .menu-nav {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
  }

  .menu-nav a {
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .menu-nav a.active {
    border-left: none;
    border-bottom-color: #1a1a1a;
  }

  .conteudo-principal {
    overflow-y: visible;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-logo {
    font-size: 4rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .modulo-header h1 {
    font-size: 2rem;
  }

  .modulo-conteudo-wrapper {
    padding: 2rem 1rem;
  }

  .secao {
    padding: 1.5rem;
  }

  .menu-nav a {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
  }

  .print-imagem img {
    max-width: 100%;
    height: auto;
  }
}

/* Modal de Visualização de Imagem */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  cursor: zoom-out;
}

.modal-imagem {
  position: relative;
  max-width: 95%;
  max-height: 95%;
  cursor: default;
}

.modal-imagem img {
  max-width: 100%;
  max-height: 90vh;
  width: auto;
  height: auto;
  display: block;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.btn-fechar-modal {
  position: absolute;
  top: -40px;
  right: 0;
  background: white;
  color: #1a1a1a;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.btn-fechar-modal:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .btn-fechar-modal {
    top: -50px;
  }

  .modal-overlay {
    padding: 1rem;
  }
}
</style>

<script src="./index.js"></script>
