import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Finance API is running' });
});

// Get all months for user
app.get('/api/meses', async (req, res) => {
  try {
    const meses = await prisma.mes.findMany({
      include: {
        quinzenas: {
          include: {
            receitas: true,
            parcelas: {
              include: {
                despesa: true
              }
            }
          }
        }
      },
      orderBy: [
        { ano: 'desc' },
        { mes: 'desc' }
      ]
    });
    res.json(meses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new month
app.post('/api/meses', async (req, res) => {
  try {
    const { ano, mes, userId } = req.body;
    
    const novoMes = await prisma.mes.create({
      data: {
        ano,
        mes,
        userId,
        quinzenas: {
          create: [
            { tipo: 'primeira' },
            { tipo: 'segunda' }
          ]
        }
      },
      include: {
        quinzenas: true
      }
    });
    
    res.json(novoMes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quinzena details
app.get('/api/quinzenas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const quinzena = await prisma.quinzena.findUnique({
      where: { id },
      include: {
        receitas: true,
        parcelas: {
          include: {
            despesa: true
          }
        },
        mes: true
      }
    });
    
    if (!quinzena) {
      return res.status(404).json({ error: 'Quinzena não encontrada' });
    }
    
    // Calcular saldo disponível
    const totalReceitas = quinzena.receitas.reduce((sum, rec) => sum + rec.valor, 0);
    const totalDespesasPagas = quinzena.parcelas
      .filter(p => p.pago)
      .reduce((sum, parc) => sum + (parc.valorPago || parc.valorParcela), 0);
    
    const saldoDisponivel = quinzena.saldoAnterior + totalReceitas - totalDespesasPagas;
    
    res.json({
      ...quinzena,
      calculos: {
        totalReceitas,
        totalDespesasPagas,
        saldoDisponivel
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add revenue to quinzena
app.post('/api/quinzenas/:id/receitas', async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, tipo } = req.body;
    
    const receita = await prisma.receita.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        tipo,
        quinzenaId: id
      }
    });
    
    res.json(receita);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense with installments
app.post('/api/quinzenas/:id/despesas', async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valorTotal, parcelas, categoria, observacao } = req.body;
    
    // Criar despesa
    const despesa = await prisma.despesa.create({
      data: {
        descricao,
        valorTotal: parseFloat(valorTotal),
        parcelas: parseInt(parcelas),
        categoria,
        observacao,
        quinzenaId: id
      }
    });
    
    // Gerar parcelas automaticamente
    const valorParcela = parseFloat(valorTotal) / parseInt(parcelas);
    const parcelasData = [];
    
    for (let i = 1; i <= parseInt(parcelas); i++) {
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + (i * 15)); // 15 dias entre parcelas
      
      parcelasData.push({
        numeroParcela: i,
        valorParcela,
        dataVencimento,
        despesaId: despesa.id,
        quinzenaId: id // Primeira parcela na quinzena atual
      });
    }
    
    await prisma.parcela.createMany({
      data: parcelasData
    });
    
    const despesaCompleta = await prisma.despesa.findUnique({
      where: { id: despesa.id },
      include: {
        parcelasRelacao: true
      }
    });
    
    res.json(despesaCompleta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark installment as paid
app.patch('/api/parcelas/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    const { valorPago } = req.body;
    
    const parcela = await prisma.parcela.update({
      where: { id },
      data: {
        pago: true,
        valorPago: valorPago ? parseFloat(valorPago) : undefined,
        dataPagamento: new Date()
      },
      include: {
        despesa: true,
        quinzena: true
      }
    });
    
    res.json(parcela);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});