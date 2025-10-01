import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Check, Clock, DollarSign } from 'lucide-react'
import axios from 'axios'

const QuinzenaPage = () => {
  const { id } = useParams()
  const [quinzena, setQuinzena] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReceitaForm, setShowReceitaForm] = useState(false)
  const [showDespesaForm, setShowDespesaForm] = useState(false)

  // Form states
  const [novaReceita, setNovaReceita] = useState({
    descricao: '',
    valor: '',
    tipo: 'variavel'
  })
  
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: '',
    valorTotal: '',
    parcelas: 1,
    categoria: 'outros',
    observacao: ''
  })

  useEffect(() => {
    if (id) {
      carregarQuinzena()
    }
  }, [id])

  const carregarQuinzena = async () => {
    try {
      const response = await axios.get(`/api/quinzenas/${id}`)
      setQuinzena(response.data)
    } catch (error) {
      console.error('Erro ao carregar quinzena:', error)
    } finally {
      setLoading(false)
    }
  }

  const adicionarReceita = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/api/quinzenas/${id}/receitas`, novaReceita)
      setNovaReceita({ descricao: '', valor: '', tipo: 'variavel' })
      setShowReceitaForm(false)
      carregarQuinzena() // Recarregar dados
    } catch (error) {
      console.error('Erro ao adicionar receita:', error)
    }
  }

  const adicionarDespesa = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/api/quinzenas/${id}/despesas`, novaDespesa)
      setNovaDespesa({ 
        descricao: '', 
        valorTotal: '', 
        parcelas: 1, 
        categoria: 'outros', 
        observacao: '' 
      })
      setShowDespesaForm(false)
      carregarQuinzena() // Recarregar dados
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error)
    }
  }

  const marcarParcelaComoPaga = async (parcelaId) => {
    try {
      await axios.patch(`/api/parcelas/${parcelaId}/pagar`)
      carregarQuinzena() // Recarregar dados
    } catch (error) {
      console.error('Erro ao marcar parcela como paga:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Carregando quinzena...</div>
      </div>
    )
  }

  if (!quinzena) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Quinzena não encontrada</div>
      </div>
    )
  }

  const { calculos } = quinzena

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {quinzena.tipo === 'primeira' ? 'Quinzena do Dia 15' : 'Quinzena do Dia 30'}
        </h1>
        <p className="text-gray-600">
          {quinzena.mes && 
            new Date(quinzena.mes.ano, quinzena.mes.mes - 1).toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            })
          }
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Saldo Anterior</h3>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <p className={`text-xl font-bold mt-1 ${quinzena.saldoAnterior >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {quinzena.saldoAnterior.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Total Receitas</h3>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">
            R$ {calculos.totalReceitas.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Despesas Pagas</h3>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">
            R$ {calculos.totalDespesasPagas.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Saldo Disponível</h3>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </div>
          <p className={`text-xl font-bold mt-1 ${calculos.saldoDisponivel >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {calculos.saldoDisponivel.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna da Esquerda - Receitas */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Receitas</h2>
              <button
                onClick={() => setShowReceitaForm(!showReceitaForm)}
                className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                <span>Nova</span>
              </button>
            </div>

            {showReceitaForm && (
              <div className="p-6 border-b">
                <form onSubmit={adicionarReceita} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={novaReceita.descricao}
                      onChange={(e) => setNovaReceita({ ...novaReceita, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={novaReceita.valor}
                      onChange={(e) => setNovaReceita({ ...novaReceita, valor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={novaReceita.tipo}
                      onChange={(e) => setNovaReceita({ ...novaReceita, tipo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="fixa">Fixa</option>
                      <option value="variavel">Variável</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReceitaForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="divide-y">
              {quinzena.receitas.map((receita) => (
                <div key={receita.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{receita.descricao}</p>
                    <p className="text-sm text-gray-600">
                      {receita.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                    </p>
                  </div>
                  <p className="text-green-600 font-semibold">R$ {receita.valor.toFixed(2)}</p>
                </div>
              ))}
              
              {quinzena.receitas.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>Nenhuma receita cadastrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna da Direita - Despesas */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Despesas</h2>
              <button
                onClick={() => setShowDespesaForm(!showDespesaForm)}
                className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
                <span>Nova</span>
              </button>
            </div>

            {showDespesaForm && (
              <div className="p-6 border-b">
                <form onSubmit={adicionarDespesa} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={novaDespesa.descricao}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Total
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={novaDespesa.valorTotal}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, valorTotal: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parcelas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={novaDespesa.parcelas}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, parcelas: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={novaDespesa.categoria}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="casa">Casa</option>
                      <option value="alimentacao">Alimentação</option>
                      <option value="transporte">Transporte</option>
                      <option value="saude">Saúde</option>
                      <option value="educacao">Educação</option>
                      <option value="lazer">Lazer</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDespesaForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="divide-y">
              {quinzena.parcelas.map((parcela) => (
                <div key={parcela.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800">
                        {parcela.despesa.descricao}
                        {parcela.despesa.parcelas > 1 && (
                          <span className="text-sm text-gray-600 ml-2">
                            ({parcela.numeroParcela}/{parcela.despesa.parcelas})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {parcela.despesa.categoria} • 
                        Vence: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-red-600 font-semibold">
                        R$ {parcela.valorParcela.toFixed(2)}
                      </p>
                      {!parcela.pago && (
                        <button
                          onClick={() => marcarParcelaComoPaga(parcela.id)}
                          className="mt-1 bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 hover:bg-green-700"
                        >
                          <Check className="h-3 w-3" />
                          <span>Pagar</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {parcela.pago && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm">
                      <Check className="h-4 w-4" />
                      <span>Pago em {new Date(parcela.dataPagamento).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {quinzena.parcelas.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>Nenhuma despesa cadastrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuinzenaPage