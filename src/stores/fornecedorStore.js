import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { toast } from 'vue3-toastify'
import { parseApiError } from '@/utils/parseApiError'

export const useFornecedorStore = defineStore('fornecedor', () => {
  // Estado
  const fornecedores = ref([])
  const fornecedor = ref({
    id: null,
    nome: '',
    razaoSocial: '',
    cnpj: '',
    inscricaoEstadual: '',
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
  const filtroAtivos = ref(null) // null = todos, true = apenas ativos, false = apenas inativos
  const ordenacao = ref({ campo: 'nome', direcao: 'asc' })

  // Computados
  const totalPaginas = computed(() => Math.ceil(totalItens.value / itensPorPagina.value))

  // Ações
  const listarFornecedores = async () => {
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

      const resposta = await api.get('/fornecedor', { params })

      if (resposta.data.data) {
        const pagedResult = resposta.data.data
        fornecedores.value = pagedResult.items || []
        totalItens.value = pagedResult.totalItems || 0
        paginaAtual.value = pagedResult.currentPage || 1
      } else {
        fornecedores.value = resposta.data.items || resposta.data
        totalItens.value = resposta.data.totalItems || resposta.data.length || 0
      }
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
    } finally {
      loading.value = false
    }
  }

  const listarFornecedoresAtivos = async () => {
    try {
      const resposta = await api.get('/fornecedor/ativos')
      return resposta.data.data || resposta.data || []
    } catch (erro) {
      console.error('Erro ao carregar fornecedores ativos:', erro)
      return []
    }
  }

  const obterFornecedor = async (id) => {
    try {
      const resposta = await api.get(`/fornecedor/${id}`)
      return resposta.data.data || resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const obterFornecedorPorCnpj = async (cnpj) => {
    try {
      const resposta = await api.get(`/fornecedor/cnpj/${cnpj}`)
      return resposta.data.data || resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      return null
    }
  }

  const criarFornecedor = async (dadosFornecedor) => {
    loading.value = true
    try {
      const resposta = await api.post('/fornecedor', dadosFornecedor)
      toast.success('Fornecedor criado com sucesso!')
      await listarFornecedores()
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

  const atualizarFornecedor = async (id, dadosFornecedor) => {
    loading.value = true
    try {
      const resposta = await api.put(`/fornecedor/${id}`, dadosFornecedor)
      toast.success('Fornecedor atualizado com sucesso!')
      await listarFornecedores()
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

  const excluirFornecedor = async (id) => {
    try {
      await api.delete(`/fornecedor/${id}`)
      toast.success('Fornecedor excluído com sucesso!')
      await listarFornecedores()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const ativarFornecedor = async (id) => {
    try {
      await api.patch(`/fornecedor/${id}/ativar`)
      toast.success('Fornecedor ativado com sucesso!')
      await listarFornecedores()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const inativarFornecedor = async (id) => {
    try {
      await api.patch(`/fornecedor/${id}/inativar`)
      toast.success('Fornecedor inativado com sucesso!')
      await listarFornecedores()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const buscarCep = async (cep) => {
    try {
      // Remove caracteres não numéricos
      const cepLimpo = cep.replace(/\D/g, '')
      if (cepLimpo.length !== 8) {
        toast.error('CEP inválido')
        return null
      }

      const resposta = await api.get(`/viacep/${cepLimpo}`)
      return resposta.data.data || resposta.data
    } catch (erro) {
      console.error('Erro ao buscar CEP:', erro)
      toast.error('Erro ao buscar CEP')
      return null
    }
  }

  // Modal
  const abrirModal = (fornecedorParaEditar = null) => {
    if (fornecedorParaEditar) {
      fornecedor.value = { ...fornecedorParaEditar }
      modoEdicao.value = true
    } else {
      fornecedor.value = {
        id: null,
        nome: '',
        razaoSocial: '',
        cnpj: '',
        inscricaoEstadual: '',
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
    fornecedor.value = {
      id: null,
      nome: '',
      razaoSocial: '',
      cnpj: '',
      inscricaoEstadual: '',
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
    listarFornecedores()
  }

  const limparFiltros = () => {
    termoBusca.value = ''
    filtroAtivos.value = null
    paginaAtual.value = 1
    listarFornecedores()
  }

  const alterarOrdenacao = (campo) => {
    if (ordenacao.value.campo === campo) {
      ordenacao.value.direcao = ordenacao.value.direcao === 'asc' ? 'desc' : 'asc'
    } else {
      ordenacao.value.campo = campo
      ordenacao.value.direcao = 'asc'
    }
    listarFornecedores()
  }

  // Funções auxiliares
  const formatarCnpj = (cnpj) => {
    if (!cnpj) return ''
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return cnpj
    return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatarTelefone = (telefone) => {
    if (!telefone) return ''
    const telefoneLimpo = telefone.replace(/\D/g, '')
    if (telefoneLimpo.length === 10) {
      return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else if (telefoneLimpo.length === 11) {
      return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return telefone
  }

  const formatarCep = (cep) => {
    if (!cep) return ''
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return cep
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  return {
    // Estado
    fornecedores,
    fornecedor,
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
    listarFornecedores,
    listarFornecedoresAtivos,
    obterFornecedor,
    obterFornecedorPorCnpj,
    criarFornecedor,
    atualizarFornecedor,
    excluirFornecedor,
    ativarFornecedor,
    inativarFornecedor,
    buscarCep,
    abrirModal,
    fecharModal,
    aplicarFiltros,
    limparFiltros,
    alterarOrdenacao,

    // Funções auxiliares
    formatarCnpj,
    formatarTelefone,
    formatarCep,
  }
})
