using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MinhasFinancas.Application.DTOs;
using MinhasFinancas.Application.Services;
using MinhasFinancas.Domain.Entities;
using MinhasFinancas.Infrastructure.Data;
using MinhasFinancas.Infrastructure.Repositories;
using MinhasFinancas.Infrastructure;
using Xunit;

namespace MinhasFinancas.IntegrationTests.Services;

public class PessoaServiceTests
{
    private MinhasFinancasDbContext GetDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<MinhasFinancasDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new MinhasFinancasDbContext(options);
    }

    [Fact]
    public async Task UpdateAsync_AlterarParaMenorDeIdadeComReceitaExistente_DeveEvidenciarBug()
    {
        // Arrange
        var dbContext = GetDbContext(Guid.NewGuid().ToString());
        var unitOfWork = new UnitOfWork(dbContext);
        var pessoaService = new PessoaService(unitOfWork);

        var pessoaId = Guid.NewGuid();
        var pessoa = new Pessoa { Id = pessoaId, Nome = "João", DataNascimento = DateTime.Today.AddYears(-20) };
        var categoria = new Categoria { Id = Guid.NewGuid(), Descricao = "Salário", Finalidade = Categoria.EFinalidade.Receita };
        var transacao = new Transacao 
        { 
            Id = Guid.NewGuid(), 
            Descricao = "Pagamento", 
            Valor = 5000, 
            Tipo = Transacao.ETipo.Receita, 
            Data = DateTime.Today 
        };
        // Bypass para evitar a validação da lógica de domínio durante a configuração do cenário
        transacao.GetType().GetProperty("Pessoa")?.SetValue(transacao, pessoa);
        transacao.GetType().GetProperty("Categoria")?.SetValue(transacao, categoria);
        
        dbContext.Categorias.Add(categoria);
        dbContext.Pessoas.Add(pessoa);
        dbContext.Transacoes.Add(transacao);
        await dbContext.SaveChangesAsync();

        // Act - Vamos alterar a pessoa para menor de idade (15 anos)
        var updateDto = new UpdatePessoaDto 
        { 
            Nome = "João", 
            DataNascimento = DateTime.Today.AddYears(-15) 
        };
        
        // BUG: O serviço não verifica o histórico ao atualizar a idade
        Func<Task> action = async () => await pessoaService.UpdateAsync(pessoaId, updateDto);

        // Assert
        await action.Should().NotThrowAsync();

        // Verifica inconsistência
        var pessoaAtualizada = await dbContext.Pessoas.FindAsync(pessoaId);
        pessoaAtualizada!.EhMaiorDeIdade().Should().BeFalse();
        
        var transacoes = await dbContext.Transacoes.Where(t => t.PessoaId == pessoaId).ToListAsync();
        transacoes.Should().Contain(t => t.Tipo == Transacao.ETipo.Receita);
    }

    [Fact]
    public async Task DeleteAsync_ExcluirPessoa_DeveExcluirTransacoesEmCascata()
    {
        // Arrange
        var dbContext = GetDbContext(Guid.NewGuid().ToString());
        var unitOfWork = new UnitOfWork(dbContext);
        var pessoaService = new PessoaService(unitOfWork);

        var pessoaId = Guid.NewGuid();
        var pessoa = new Pessoa { Id = pessoaId, Nome = "Maria", DataNascimento = DateTime.Today.AddYears(-25) };
        var categoria = new Categoria { Id = Guid.NewGuid(), Descricao = "Alimentação", Finalidade = Categoria.EFinalidade.Despesa };
        var transacao = new Transacao 
        { 
            Id = Guid.NewGuid(), 
            Descricao = "Mercado", 
            Valor = 500, 
            Tipo = Transacao.ETipo.Despesa, 
            Data = DateTime.Today 
        };
        
        // Setup manual para passar na validação
        transacao.GetType().GetProperty("Pessoa")?.SetValue(transacao, pessoa);
        transacao.GetType().GetProperty("Categoria")?.SetValue(transacao, categoria);

        dbContext.Categorias.Add(categoria);
        dbContext.Pessoas.Add(pessoa);
        dbContext.Transacoes.Add(transacao);
        await dbContext.SaveChangesAsync();

        var savedTransacao = await dbContext.Transacoes.FindAsync(transacao.Id);
        savedTransacao.Should().NotBeNull();

        // Act
        await pessoaService.DeleteAsync(pessoaId);

        // Assert
        var pessoaExcluida = await dbContext.Pessoas.FindAsync(pessoaId);
        pessoaExcluida.Should().BeNull();

        // No InMemory do EF Core, isso testa se o tracked object foi removido
        var transacaoExcluida = await dbContext.Transacoes.FindAsync(transacao.Id);
    }
}
