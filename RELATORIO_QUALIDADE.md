# Relatório de Avaliação de Qualidade

**Projeto:** Minhas Finanças  
**Responsável:** Equipe de QA  
**Status Global:** ⚠️ Atenção (Necessita melhorias em regras de integridade)

---

## 1. Resumo Executivo

Este relatório apresenta uma análise técnica profunda sobre a qualidade do ecossistema "Minhas Finanças". Foram avaliados a corretude das regras de negócio, a robustez da arquitetura de dados e a eficácia da suíte de testes. 

Embora o sistema apresente uma base sólida em **Clean Architecture**, identificamos falhas críticas de "bypassing" de regras de negócio e débitos técnicos na camada de persistência que podem levar a estados inconsistentes no banco de dados.

---

## 2. Diagnóstico de Falhas Críticas (Defeitos Encontrados)

### 2.1. Bypass de Validação em Atualização de Cadastro (Severidade: Alta)
*   **Problema:** A regra "Menor de idade não pode possuir receitas" é validada apenas no ato da criação da transação. 
*   **Falha:** O sistema permite que um usuário maior de idade (com receitas cadastradas) altere sua data de nascimento para uma data que o torne menor de idade. O serviço de atualização de pessoas não verifica o histórico financeiro antes de persistir a alteração.
*   **Passos para Reprodução:**
    1.  Cadastre uma pessoa com data de nascimento em 1990 (Maior de idade).
    2.  Cadastre uma transação do tipo "Receita" para esta pessoa.
    3.  Acesse a edição da pessoa e altere a data de nascimento para 2020 (Menor de idade).
    4.  **Resultado esperado:** Erro de validação impedindo a alteração.
    5.  **Resultado atual:** A alteração é persistida com sucesso, deixando uma receita vinculada a um menor de idade.
*   **Impacto:** Corrupção da integridade dos dados e violação das regras de compliance financeiro.
*   **Solução:** Implementar validação cruzada no `PessoaService.UpdateAsync` ou utilizar um `DomainService` para garantir a invariante de negócio.

### 2.2. Validação Acoplada a Propriedades de Navegação (Severidade: Média)
*   **Problema:** As validações de negócio estão localizadas nos *setters* das propriedades de navegação (`Transacao.Pessoa` e `Transacao.Categoria`).
*   **Falha:** Caso um desenvolvedor instancie uma transação e defina apenas o `PessoaId` (Foreign Key), as validações do objeto `Pessoa` nunca serão executadas.
*   **Passos para Reprodução:**
    1.  Instancie uma nova `Transacao`.
    2.  Defina o `Tipo` como `Receita`.
    3.  Atribua um `PessoaId` de uma pessoa menor de idade diretamente na propriedade `PessoaId` (sem carregar o objeto `Pessoa`).
    4.  Persista a transação via `DbContext`.
    5.  **Resultado esperado:** Lançamento de exceção de negócio.
    6.  **Resultado atual:** A transação é salva no banco ignorando o setter validativo da propriedade `Pessoa`.
*   **Impacto:** Risco de inserção de dados inválidos via integrações ou scripts de carga que não carreguem as entidades completas via ORM.
*   **Solução:** Mover as validações para o construtor da classe ou um método de validação explícito (`Validate()`) chamado antes da persistência.

---

## 3. Análise de Arquitetura e Riscos

### 3.1. Risco de Performance (Escalabilidade)
*   **Observação:** O sistema utiliza SQLite com carregamento preguiçoso (*Lazy Loading*) em alguns pontos. 
*   **Risco:** O crescimento exponencial de transações pode causar o problema de "N+1 queries" no dashboard, degradando a experiência do usuário.
*   **Mitigação:** Implementar testes de carga (k6) e garantir o uso de `.Include()` (Eager Loading) nas consultas de agregação.

### 3.2. Ponto de Atenção: Domínio Anêmico Parcial
*   **Observação:** As regras de negócio estão acopladas a propriedades virtuais da entidade `Transacao`. 
*   **Risco:** Dificulta a manutenção e a evolução do domínio. 
*   **Recomendação:** Migrar para um modelo onde o Domínio é o "guardião" das regras através de métodos de fábrica ou objetos de valor.

### 3.3. Exclusão em Cascata
*   **Observação:** O sistema implementa corretamente a exclusão em cascata (`ON DELETE CASCADE`) para transações vinculadas a pessoas deletadas.
*   **Status:** Validado e operando conforme o esperado.

### 3.4. Ausência de Camada de Segurança (Auth)
*   **Risco:** O sistema não possui isolamento de usuários (*Multi-tenancy*). Atualmente, qualquer acesso à API permite visualização/edição de qualquer dado.
*   **Recomendação:** Implementação urgente de JWT e filtragem de dados por `UserId`.

---

## 4. Plano de Ação Recomendado (Roadmap de Qualidade)

### Curto Prazo (Prioridade Alta)
*   [ ] **Correção de Segurança**: Implementar Middleware de Autenticação (JWT) e restringir política de CORS.
*   [ ] **Correção de Segurança**: Implementar validação de `OwnerId` nos repositórios para mitigar falhas de IDOR.
*   [ ] **Integridade de Dados**: Implementar verificação de receitas existentes no `PessoaService.UpdateAsync` antes de permitir a alteração de idade.
*   [ ] **Refatoração**: Mover validações de regras de negócio dos *Setters* para métodos de fábrica ou construtores (DDD) para evitar bypass.

### Médio Prazo
*   [ ] Implementar Testes de Contrato para garantir sincronia entre Frontend e Backend.
*   [ ] Adicionar análise estática de segurança (SAST) no pipeline de CI para detectar vulnerabilidades precocemente.


---
**Conclusão:** O projeto possui uma excelente estrutura, mas requer ajustes pontuais na aplicação das regras de negócio para se tornar verdadeiramente resiliente a erros de usuário e falhas de integração.
