import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { toast } from 'vue3-toastify'
import { parseApiError } from '@/utils/parseApiError'

export const useClienteStore = defineStore('cliente', () => {
  // Estado
  const clientes = ref([])
  const cliente = ref({
    id: null,
    nome: '',
    cpfCnpj: '',
    telefone: '',
    celular: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    ativo: true,
  })

  const loading = ref(false)
  const modalAberto = ref(false)
  const modoEdicao = ref(false)

  // Paginação e filtros
  const paginaAtual = ref(1)
  const itensPorPagina = ref(10)
  const totalItens = ref(0)
  const termoBusca = ref('')
  const filtroAtivos = ref(null)
  const ordenacao = ref({ campo: 'nome', direcao: 'asc' })

  // Computados
  const totalPaginas = computed(() => Math.ceil(totalItens.value / itensPorPagina.value))

  // Ações
  const listarClientes = async () => {
    loading.value = true
    try {
      const params = {
        pagina: paginaAtual.value,
        itensPorPagina: itensPorPagina.value,
        termo: termoBusca.value,
        apenasAtivos: filtroAtivos.value,
        ordenarPor: ordenacao.value.campo,
        direcao: ordenacao.value.direcao,
      }

      const resposta = await api.get('/cliente', { params })

      if (resposta.data.data) {
        const pagedResult = resposta.data.data
        clientes.value = pagedResult.items || []
        totalItens.value = pagedResult.totalItems || 0
        paginaAtual.value = pagedResult.currentPage || 1
      } else {
        clientes.value = resposta.data.items || resposta.data || []
        totalItens.value = resposta.data.totalItems || resposta.data.length || 0
      }
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      console.error('Erro ao listar clientes:', erro)
    } finally {
      loading.value = false
    }
  }

  const listarClientesAtivos = async () => {
    try {
      const resposta = await api.get('/cliente/ativos')
      return resposta.data.data || resposta.data || []
    } catch (erro) {
      console.error('Erro ao carregar clientes ativos:', erro)
      return []
    }
  }

  const obterCliente = async (id) => {
    try {
      const resposta = await api.get(`/cliente/${id}`)
      return resposta.data.data || resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const criarCliente = async (dadosCliente) => {
    loading.value = true
    try {
      const resposta = await api.post('/cliente', dadosCliente)
      toast.success('Cliente criado com sucesso!')
      await listarClientes()
      fecharModal()
      return resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    } finally {
      loading.value = false
    }
  }

  const atualizarCliente = async (id, dadosCliente) => {
    loading.value = true
    try {
      const resposta = await api.put(`/cliente/${id}`, dadosCliente)
      toast.success('Cliente atualizado com sucesso!')
      await listarClientes()
      fecharModal()
      return resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    } finally {
      loading.value = false
    }
  }

  const excluirCliente = async (id) => {
    try {
      await api.delete(`/cliente/${id}`)
      toast.success('Cliente excluído com sucesso!')
      await listarClientes()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const ativarCliente = async (id) => {
    try {
      await api.patch(`/cliente/${id}/ativar`)
      toast.success('Cliente ativado com sucesso!')
      await listarClientes()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const inativarCliente = async (id) => {
    try {
      await api.patch(`/cliente/${id}/inativar`)
      toast.success('Cliente inativado com sucesso!')
      await listarClientes()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  // Modal
  const abrirModal = (clienteParaEditar = null) => {
    if (clienteParaEditar) {
      cliente.value = { ...clienteParaEditar }
      modoEdicao.value = true
    } else {
      cliente.value = {
        id: null,
        nome: '',
        cpfCnpj: '',
        telefone: '',
        celular: '',
        email: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        ativo: true,
      }
      modoEdicao.value = false
    }
    modalAberto.value = true
  }

  const fecharModal = () => {
    modalAberto.value = false
    modoEdicao.value = false
    cliente.value = {
      id: null,
      nome: '',
      cpfCnpj: '',
      telefone: '',
      celular: '',
      email: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      ativo: true,
    }
  }

  // Filtros e busca
  const aplicarFiltros = () => {
    paginaAtual.value = 1
    listarClientes()
  }

  const limparFiltros = () => {
    termoBusca.value = ''
    filtroAtivos.value = null
    paginaAtual.value = 1
    listarClientes()
  }

  const alterarOrdenacao = (campo) => {
    if (ordenacao.value.campo === campo) {
      ordenacao.value.direcao = ordenacao.value.direcao === 'asc' ? 'desc' : 'asc'
    } else {
      ordenacao.value.campo = campo
      ordenacao.value.direcao = 'asc'
    }
    listarClientes()
  }

  // Funções auxiliares
  const formatarCpfCnpj = (cpfCnpj) => {
    if (!cpfCnpj) return ''
    const limpo = cpfCnpj.replace(/\D/g, '')
    
    if (limpo.length === 11) {
      // CPF: 000.000.000-00
      return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (limpo.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return cpfCnpj
  }

  const formatarTelefone = (telefone) => {
    if (!telefone) return ''
    const limpo = telefone.replace(/\D/g, '')
    
    if (limpo.length === 10) {
      return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else if (limpo.length === 11) {
      return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return telefone
  }

  return {
    // Estado
    clientes,
    cliente,
    loading,
    modalAberto,
    modoEdicao,
    paginaAtual,
    itensPorPagina,
    totalItens,
    totalPaginas,
    termoBusca,
    filtroAtivos,
    ordenacao,

    // Ações
    listarClientes,
    listarClientesAtivos,
    obterCliente,
    criarCliente,
    atualizarCliente,
    excluirCliente,
    ativarCliente,
    inativarCliente,
    abrirModal,
    fecharModal,
    aplicarFiltros,
    limparFiltros,
    alterarOrdenacao,

    // Funções auxiliares
    formatarCpfCnpj,
    formatarTelefone,
  }
})
