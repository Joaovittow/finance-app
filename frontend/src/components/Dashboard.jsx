import React, { useState, useEffect } from 'react'
import { Plus, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const [meses, setMeses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarMeses()
  }, [])

  const carregarMeses = async () => {
    try {
      const response = await axios.get('/api/meses')
      setMeses(response.data)
    } catch (error) {
      console.error('Erro ao carregar meses:', error)
    } finally {
      setLoading(false)
    }
  }

  const criarNovoMes = async () => {
    const anoAtual = new Date().getFullYear()
    const mesAtual = new Date().getMonth() + 1
    
    try {
      const response = await axios.post('/api/meses', {
        ano: anoAtual,
        mes: mesAtual,
        userId: 'user-1' // Temporário - depois implementar auth
      })
      setMeses([response.data, ...meses])
    } catch (error) {
      console.error('Erro ao criar mês:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Financeiro</h1>
        <button
          onClick={criarNovoMes}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Mês</span>
        </button>
      </div>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Saldo Atual</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">R$ 0,00</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Despesas do Mês</h3>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">R$ 0,00</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Meses Ativos</h3>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{meses.length}</p>
        </div>
      </div>

      {/* Lista de Meses */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Meses Cadastrados</h2>
        </div>
        
        {meses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum mês cadastrado ainda.</p>
            <button
              onClick={criarNovoMes}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Criar primeiro mês
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {meses.map((mes) => (
              <div key={mes.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {new Date(mes.ano, mes.mes - 1).toLocaleDateString('pt-BR', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <p className="text-gray-600">
                      {mes.quinzenas.length} quinzenas cadastradas
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {mes.quinzenas.map((quinzena) => (
                      <a
                        key={quinzena.id}
                        href={`/quinzena/${quinzena.id}`}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200"
                      >
                        {quinzena.tipo === 'primeira' ? 'Dia 15' : 'Dia 30'}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard