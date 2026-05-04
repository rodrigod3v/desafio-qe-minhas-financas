# QA Test - Minhas Finanças

Este repositório isola toda a base de testes da aplicação "Minhas Finanças". O código foca na pirâmide de testes para as regras de negócio e na cobertura de cenários reais em múltiplas camadas.

## 🛠️ Tecnologias Utilizadas

- **Backend**: .NET 9, xUnit, FluentAssertions, Moq, Stryker.NET (Mutação).
- **Frontend**: React, Vitest (Unitário), Playwright (E2E, Visual, Acessibilidade).
- **Segurança**: Axe-core, Auditoria de API.
- **Performance**: k6.
- **Automação**: GitHub Actions (CI).

## 🎯 Estratégia de Testes

Seguimos a pirâmide de testes para garantir uma cobertura completa com o melhor custo-benefício:

*   **Unitário**: Backend (xUnit) e Frontend (Vitest). Validação de regras de domínio, invariantes de negócio e formatadores.
*   **Integração**: Backend (xUnit). Validação de Services, persistência de dados e regras de integridade.
*   **E2E (End-to-End)**: Frontend (Playwright). Fluxos críticos de usuário, Regressão Visual e Acessibilidade (WCAG).
*   **Segurança (Pentest)**: Validação de Autenticação, IDOR e Security Headers.
*   **Performance**: Testes de carga com k6 para validação de estabilidade e escalabilidade.

Para uma visão técnica detalhada de cada ferramenta e metodologia, consulte a [**Estratégia de Testes (ESTRATEGIA_TESTES.md)**](./ESTRATEGIA_TESTES.md).

## Como Executar

### 1. Backend (Unit, Integration & Mutation)
```bash
dotnet restore MinhasFinancas.Tests.sln
dotnet test MinhasFinancas.Tests.sln

# Testes de Mutação (Stryker)
cd Backend
dotnet stryker --config-file stryker-config.json
```

### 2. Frontend (Unit & Component)
```bash
cd Frontend
npm install
npm run test
```

### 3. E2E, Acessibilidade e Segurança (Playwright)
Certifique-se de que a aplicação está rodando (Docker ou Local) e execute:
```bash
cd Frontend
npx playwright test
```

### 4. Performance (k6)
```bash
k6 run performance/load-test.js
```

## 📊 Relatórios de Auditoria

Documentação detalhada sobre a postura de segurança e integridade do sistema:
- 🛡️ [**Relatório de Pentest (Segurança)**](./RELATORIO_PENTEST.md): Detalha as vulnerabilidades de infraestrutura (Auth, CORS, IDOR) com passos para reprodução.
- 📈 [**Avaliação de Qualidade**](./RELATORIO_QUALIDADE.md): Analisa a integridade das regras de negócio, falhas funcionais e o plano de ação recomendado.

## Integração Contínua (CI/CD)
O projeto conta com um pipeline automatizado no **GitHub Actions** (`ci.yml`) que valida todas as camadas a cada Pull Request, impedindo que regressões cheguem à branch principal.

---

