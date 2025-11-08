import { ref, computed } from 'vue'

export default {
  name: 'ManualUsuario',
  setup() {
    const mostrarDocumentacao = ref(false)
    const moduloSelecionado = ref(null)

    const modulos = [
      {
        id: 'produtos',
        nome: 'Gestão de Produtos',
        descricao: 'Sistema completo para cadastro e gerenciamento do catálogo de produtos',
        conteudo: {
          visaoGeral:
            'O módulo de Gestão de Produtos permite cadastrar, editar e organizar todos os produtos comercializados pela distribuidora. Inclui informações detalhadas sobre cada item, como preços, códigos, categorias e dados tributários.',
          funcionalidades: [
            'Cadastro completo de produtos com nome, descrição e código interno',
            'Upload de imagens dos produtos',
            'Definição de preço de custo e preço de venda',
            'Vinculação com categoria e marca',
            'Informações tributárias: NCM, CEST e CST',
            'Código de barras para controle',
            'Sistema de busca e filtros avançados',
            'Ordenação por diversos critérios',
            'Paginação automática',
          ],
          regrasNegocio: [
            'Nome do produto é obrigatório e deve ser único no sistema',
            'Preço de venda deve ser maior que preço de custo',
            'Categoria e marca são campos obrigatórios',
            'Código de barras, quando informado, deve ser único',
            'Produtos com movimentações de estoque não podem ser excluídos',
            'Apenas informações podem ser editadas, o histórico é preservado',
          ],
          prints: [
            {
              titulo: 'Tela Principal - Lista de Produtos',
              descricao: 'Visualização da listagem completa com busca, filtros e ordenação',
            },
            {
              titulo: 'Modal de Cadastro',
              descricao: 'Formulário para adicionar novo produto com todos os campos',
            },
            {
              titulo: 'Modal de Edição',
              descricao: 'Edição de informações de produto existente',
            },
            {
              titulo: 'Busca e Filtros',
              descricao: 'Demonstração dos recursos de busca por nome, categoria ou marca',
            },
          ],
        },
      },
      {
        id: 'estoque',
        nome: 'Controle de Estoque',
        descricao: 'Gestão completa de estoque com dashboard, saldos e movimentações',
        conteudo: {
          visaoGeral:
            'O módulo de Estoque é dividido em três submódulos integrados: Dashboard para visão geral com KPIs, Saldos para controle individual de cada produto, e Movimentações para registro de entradas, saídas e ajustes.',
          funcionalidades: [
            'Dashboard com indicadores em tempo real',
            'Visualização de saldos por produto',
            'Registro de movimentações (Entrada, Saída, Ajuste)',
            'Controle de lotes e validades',
            'Sistema FIFO automático para saídas',
            'Alertas de estoque baixo e produtos próximos ao vencimento',
            'Definição de estoque mínimo e máximo',
            'Histórico completo de movimentações',
            'Rastreabilidade total com usuário e data/hora',
          ],
          regrasNegocio: [
            'Movimentações de ENTRADA requerem número do lote, data de fabricação e validade',
            'Movimentações de AJUSTE requerem observações obrigatórias',
            'Sistema utiliza FIFO: saídas consomem sempre os lotes mais antigos',
            'Cada movimentação registra usuário responsável e timestamp',
            'Alertas automáticos quando estoque atingir nível mínimo',
            'Produtos próximos ao vencimento (30 dias) geram alertas',
            'Integração automática com pedidos para baixa de estoque',
          ],
          prints: [
            {
              titulo: 'Dashboard de Estoque',
              descricao:
                'Visão geral com KPIs: valor total, produtos com estoque baixo, movimentações',
            },
            {
              titulo: 'Saldos de Estoque',
              descricao: 'Lista de produtos com saldos, status visual e barras de progresso',
            },
            {
              titulo: 'Modal de Nova Movimentação',
              descricao: 'Formulário para registrar entrada, saída ou ajuste',
            },
            {
              titulo: 'Histórico de Movimentações',
              descricao: 'Lista completa com filtros por período e tipo',
            },
            {
              titulo: 'Alertas',
              descricao: 'Visualização de alertas de estoque baixo e produtos vencendo',
            },
          ],
        },
      },
      {
        id: 'pedidos',
        nome: 'Gestão de Pedidos',
        descricao: 'Sistema de pedidos com controle de status e integração automática com estoque',
        conteudo: {
          visaoGeral:
            'O módulo de Pedidos permite criar e gerenciar pedidos de vendas com integração automática ao estoque. Controla o ciclo de vida completo dos pedidos através de três status: Ativo, Concluído e Cancelado.',
          funcionalidades: [
            'Criação de pedidos vinculados a clientes',
            'Adição de múltiplos produtos ao pedido',
            'Verificação automática de disponibilidade em estoque',
            'Cálculo automático de totais',
            'Baixa automática no estoque ao confirmar pedido',
            'Gestão de status (Ativo, Concluído, Cancelado)',
            'Histórico completo preservado',
            'Filtros por cliente, data e status',
            'Visualização detalhada de cada pedido',
          ],
          regrasNegocio: [
            'Pedido só pode ser criado se todos os produtos tiverem estoque disponível',
            'Baixa no estoque é automática ao confirmar o pedido',
            'Pedidos ATIVO podem ser concluídos ou cancelados',
            'Pedidos CANCELADO podem ser reativados apenas por administradores',
            'Pedidos CONCLUÍDO são imutáveis (estado final)',
            'Sistema registra automaticamente no estoque: "Saída automática por pedido #ID"',
            'Soft delete: pedidos nunca são deletados fisicamente',
          ],
          prints: [
            {
              titulo: 'Lista de Pedidos',
              descricao: 'Visualização de todos os pedidos com filtros e status',
            },
            {
              titulo: 'Criação de Novo Pedido',
              descricao: 'Tela de seleção de cliente e adição de produtos',
            },
            {
              titulo: 'Carrinho de Produtos',
              descricao: 'Lista de produtos adicionados com quantidades e valores',
            },
            {
              titulo: 'Detalhes do Pedido',
              descricao: 'Visualização completa com produtos, valores e status',
            },
            {
              titulo: 'Ações por Status',
              descricao: 'Botões disponíveis conforme status do pedido',
            },
          ],
        },
      },
      {
        id: 'clientes',
        nome: 'Gestão de Clientes',
        descricao: 'Cadastro completo de clientes pessoa física e jurídica',
        conteudo: {
          visaoGeral:
            'O módulo de Clientes gerencia o cadastro completo de clientes da distribuidora, suportando tanto pessoa física quanto jurídica, com validação automática de documentos e histórico de compras.',
          funcionalidades: [
            'Cadastro de pessoa física (CPF) e jurídica (CNPJ)',
            'Validação automática de CPF e CNPJ',
            'Endereço completo com CEP, rua, bairro, cidade e estado',
            'Dados de contato: telefone e email',
            'Histórico de pedidos vinculados ao cliente',
            'Sistema de busca por nome ou documento',
            'Ordenação e filtros',
          ],
          regrasNegocio: [
            'CPF ou CNPJ deve ser válido e único no sistema',
            'Nome é campo obrigatório',
            'Clientes com pedidos vinculados não podem ser excluídos',
            'Telefone e email são opcionais mas recomendados',
            'Sistema diferencia automaticamente PF e PJ pelo tipo de documento',
          ],
          prints: [
            {
              titulo: 'Lista de Clientes',
              descricao: 'Visualização completa com busca e filtros',
            },
            {
              titulo: 'Modal de Cadastro - Pessoa Física',
              descricao: 'Formulário com campos para CPF e dados pessoais',
            },
            {
              titulo: 'Modal de Cadastro - Pessoa Jurídica',
              descricao: 'Formulário com campos para CNPJ e razão social',
            },
            {
              titulo: 'Edição de Cliente',
              descricao: 'Atualização de informações cadastrais',
            },
          ],
        },
      },
      {
        id: 'fornecedores',
        nome: 'Gestão de Fornecedores',
        descricao: 'Controle de fornecedores e origem dos produtos',
        conteudo: {
          visaoGeral:
            'O módulo de Fornecedores permite cadastrar e gerenciar informações dos fornecedores da distribuidora, incluindo dados fiscais, contatos e produtos fornecidos.',
          funcionalidades: [
            'Cadastro completo de fornecedores',
            'Informações fiscais: CNPJ e Inscrição Estadual',
            'Endereço completo',
            'Dados de contato',
            'Vinculação com produtos fornecidos',
            'Histórico de compras',
            'Sistema de busca e filtros',
          ],
          regrasNegocio: [
            'CNPJ deve ser válido e único no sistema',
            'Fornecedores com produtos vinculados não podem ser excluídos',
            'Informações de contato são obrigatórias',
            'Razão social é campo obrigatório',
          ],
          prints: [
            {
              titulo: 'Lista de Fornecedores',
              descricao: 'Visualização completa com informações principais',
            },
            {
              titulo: 'Modal de Cadastro',
              descricao: 'Formulário com dados fiscais e de contato',
            },
            {
              titulo: 'Edição de Fornecedor',
              descricao: 'Atualização de informações cadastrais',
            },
          ],
        },
      },
      {
        id: 'categorias',
        nome: 'Categorias e Marcas',
        descricao: 'Organização de produtos através de categorias e marcas',
        conteudo: {
          visaoGeral:
            'Módulo para organização e classificação dos produtos através de categorias e marcas, facilitando a busca e organização do catálogo.',
          funcionalidades: [
            'Cadastro rápido de categorias',
            'Cadastro de marcas/fabricantes',
            'Contador de produtos por categoria',
            'Contador de produtos por marca',
            'Vinculação automática com produtos',
            'Edição e exclusão com validação',
          ],
          regrasNegocio: [
            'Nomes de categorias devem ser únicos',
            'Nomes de marcas devem ser únicos',
            'Categorias com produtos vinculados não podem ser excluídas',
            'Marcas com produtos vinculados não podem ser excluídas',
            'Atualização reativa nas listas de produtos',
          ],
          prints: [
            {
              titulo: 'Gerenciamento de Categorias',
              descricao: 'Lista de categorias com contadores e ações',
            },
            {
              titulo: 'Modal de Categoria',
              descricao: 'Cadastro e edição de categoria',
            },
            {
              titulo: 'Gerenciamento de Marcas',
              descricao: 'Lista de marcas com contadores e ações',
            },
            {
              titulo: 'Modal de Marca',
              descricao: 'Cadastro e edição de marca',
            },
          ],
        },
      },
      {
        id: 'devolucoes',
        nome: 'Devoluções',
        descricao: 'Controle de devoluções com reposição automática no estoque',
        conteudo: {
          visaoGeral:
            'O módulo de Devoluções gerencia o retorno de mercadorias, registrando motivos e realizando reposição automática no estoque com rastreabilidade completa.',
          funcionalidades: [
            'Registro de devoluções vinculadas a pedidos',
            'Seleção de produtos e quantidades devolvidas',
            'Motivos predefinidos de devolução',
            'Reposição automática no estoque',
            'Ajuste de lotes e validades',
            'Histórico completo de devoluções',
            'Filtros por período e status',
          ],
          regrasNegocio: [
            'Quantidade devolvida não pode exceder quantidade do pedido original',
            'Motivo da devolução é obrigatório',
            'Reposição automática registra movimentação de ENTRADA',
            'Observações são obrigatórias para auditoria',
            'Sistema vincula devolução ao pedido original',
          ],
          prints: [
            {
              titulo: 'Lista de Devoluções',
              descricao: 'Histórico completo com filtros',
            },
            {
              titulo: 'Modal de Nova Devolução',
              descricao: 'Formulário com seleção de pedido e produtos',
            },
            {
              titulo: 'Seleção de Motivo',
              descricao: 'Opções predefinidas de motivo de devolução',
            },
            {
              titulo: 'Confirmação de Reposição',
              descricao: 'Visualização da reposição no estoque',
            },
          ],
        },
      },
      {
        id: 'relatorios',
        nome: 'Relatórios',
        descricao: 'Geração de relatórios analíticos e gerenciais',
        conteudo: {
          visaoGeral:
            'Módulo de Relatórios oferece diversas análises e visualizações sobre vendas, estoque e desempenho do negócio, com exportação para PDF e Excel.',
          funcionalidades: [
            'Relatórios de vendas por período',
            'Análise de produtos mais vendidos',
            'Relatório de estoque com giro e valor total',
            'Movimentações detalhadas por produto',
            'Análise de pedidos por cliente',
            'Produtos próximos ao vencimento',
            'Produtos com estoque baixo',
            'Gráficos interativos',
            'Exportação para PDF e Excel',
          ],
          regrasNegocio: [
            'Relatórios podem ser filtrados por período customizado',
            'Filtros por categoria e marca disponíveis',
            'Comparativos entre períodos',
            'Dados em tempo real',
          ],
          prints: [
            {
              titulo: 'Seleção de Relatório',
              descricao: 'Menu com tipos de relatórios disponíveis',
            },
            {
              titulo: 'Relatório de Vendas',
              descricao: 'Gráficos e tabelas de vendas por período',
            },
            {
              titulo: 'Análise de Estoque',
              descricao: 'Visualização de valores e giro de estoque',
            },
            {
              titulo: 'Exportação',
              descricao: 'Opções de exportar para PDF ou Excel',
            },
          ],
        },
      },
      {
        id: 'conversao',
        nome: 'Conversão de Unidades',
        descricao: 'Sistema de conversão entre unidades de medida',
        conteudo: {
          visaoGeral:
            'Módulo para configurar conversões entre diferentes unidades de medida, permitindo venda em múltiplas unidades com cálculo automático de preços.',
          funcionalidades: [
            'Conversões automáticas entre unidades',
            'Cadastro de conversões personalizadas por produto',
            'Cálculo automático de preços proporcionais',
            'Suporte para múltiplas unidades por produto',
            'Exemplos: Caixa ↔ Unidade, Litro ↔ Mililitro, Fardo ↔ Unidade',
          ],
          regrasNegocio: [
            'Fator de conversão deve ser maior que zero',
            'Unidade base é sempre a menor (ex: unidade, mililitro)',
            'Preços são calculados proporcionalmente ao fator de conversão',
            'Conversões são aplicadas automaticamente em pedidos',
          ],
          prints: [
            {
              titulo: 'Lista de Conversões',
              descricao: 'Conversões cadastradas por produto',
            },
            {
              titulo: 'Modal de Cadastro',
              descricao: 'Definição de unidades e fator de conversão',
            },
            {
              titulo: 'Cálculo Automático',
              descricao: 'Demonstração do cálculo de preço proporcional',
            },
          ],
        },
      },
      {
        id: 'usuarios',
        nome: 'Usuários e Permissões',
        descricao: 'Controle de acesso e autenticação do sistema',
        conteudo: {
          visaoGeral:
            'Sistema de autenticação seguro com controle de acesso baseado em roles (Admin/User), garantindo segurança e rastreabilidade de todas as ações.',
          funcionalidades: [
            'Autenticação JWT com tokens seguros',
            'Dois níveis de acesso: Admin e User',
            'Opção "Manter conectado" (localStorage vs sessionStorage)',
            'Logout automático por inatividade',
            'Senhas criptografadas',
            'Auditoria de ações dos usuários',
            'Gerenciamento de usuários (apenas Admin)',
          ],
          regrasNegocio: [
            'Email deve ser único no sistema',
            'Senha deve ter mínimo de 6 caracteres',
            'Apenas Admin pode criar e gerenciar usuários',
            'Usuário não pode alterar sua própria role',
            'Admin tem acesso total ao sistema',
            'User tem acesso operacional (produtos, estoque, pedidos, clientes)',
            'Todas as ações são auditadas com usuário e timestamp',
          ],
          prints: [
            {
              titulo: 'Tela de Login',
              descricao: 'Interface de autenticação com opção "Manter conectado"',
            },
            {
              titulo: 'Gerenciamento de Usuários',
              descricao: 'Lista de usuários com roles (apenas Admin)',
            },
            {
              titulo: 'Modal de Novo Usuário',
              descricao: 'Cadastro com email, senha e role',
            },
            {
              titulo: 'Perfil do Usuário',
              descricao: 'Visualização e edição de dados pessoais',
            },
          ],
        },
      },
    ]

    const abrirDocumentacao = () => {
      mostrarDocumentacao.value = true
      moduloSelecionado.value = null
    }

    const voltarInicio = () => {
      mostrarDocumentacao.value = false
      moduloSelecionado.value = null
    }

    const selecionarModulo = (modulo) => {
      moduloSelecionado.value = modulo
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const voltarModulos = () => {
      moduloSelecionado.value = null
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const moduloAtual = computed(() => {
      return moduloSelecionado.value
    })

    return {
      mostrarDocumentacao,
      moduloSelecionado,
      moduloAtual,
      modulos,
      abrirDocumentacao,
      voltarInicio,
      selecionarModulo,
      voltarModulos,
    }
  },
}
