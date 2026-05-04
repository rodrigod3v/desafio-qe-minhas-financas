using System;
using FluentAssertions;
using MinhasFinancas.Domain.Entities;
using Xunit;

namespace MinhasFinancas.UnitTests.Domain;

public class TransacaoTests
{
    [Fact]
    public void SetterCategoria_QuandoCategoriaNaoPermiteTipoDaTransacao_DeveLancarInvalidOperationException()
    {
        // Arrange
        var categoriaReceita = new Categoria { Finalidade = Categoria.EFinalidade.Receita };
        var transacaoDespesa = new Transacao { Tipo = Transacao.ETipo.Despesa };

        // Act
        Action action = () => transacaoDespesa.Categoria = categoriaReceita;

        // Assert
        action.Should().Throw<InvalidOperationException>()
              .WithMessage("Não é possível registrar despesa em categoria de receita.");
    }

    [Fact]
    public void SetterCategoria_QuandoCategoriaPermiteTipoDaTransacao_NaoDeveLancarExcecao()
    {
        // Arrange
        var categoriaDespesa = new Categoria { Finalidade = Categoria.EFinalidade.Despesa };
        var transacaoDespesa = new Transacao { Tipo = Transacao.ETipo.Despesa };

        // Act
        Action action = () => transacaoDespesa.Categoria = categoriaDespesa;

        // Assert
        action.Should().NotThrow();
        transacaoDespesa.CategoriaId.Should().Be(categoriaDespesa.Id);
    }

    [Theory]
    [InlineData(17, false)]
    [InlineData(18, true)]
    [InlineData(19, true)]
    public void SetterPessoa_QuandoTransacaoEhReceita_DeveValidarIdadeCorretamente(int idade, bool devePermitir)
    {
        // Arrange
        var pessoa = new Pessoa { DataNascimento = DateTime.Today.AddYears(-idade) };
        var transacaoReceita = new Transacao { Tipo = Transacao.ETipo.Receita };

        // Act
        Action action = () => transacaoReceita.Pessoa = pessoa;

        // Assert
        if (devePermitir)
        {
            action.Should().NotThrow();
            transacaoReceita.PessoaId.Should().Be(pessoa.Id);
        }
        else
        {
            action.Should().Throw<InvalidOperationException>()
                  .WithMessage("Menores de 18 anos não podem registrar receitas.");
        }
    }

    [Theory]
    [InlineData(17)]
    [InlineData(18)]
    public void SetterPessoa_QuandoTransacaoEhDespesa_SempreDevePermitir(int idade)
    {
        // Arrange
        var pessoa = new Pessoa { DataNascimento = DateTime.Today.AddYears(-idade) };
        var transacaoDespesa = new Transacao { Tipo = Transacao.ETipo.Despesa };

        // Act
        Action action = () => transacaoDespesa.Pessoa = pessoa;

        // Assert
        action.Should().NotThrow();
        transacaoDespesa.PessoaId.Should().Be(pessoa.Id);
    }
}
