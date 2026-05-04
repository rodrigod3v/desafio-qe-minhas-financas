# Estratégia de Testes - Minhas Finanças

Este documento descreve a arquitetura e os padrões de testes implementados para garantir a qualidade, resiliência e corretude do sistema.

## 1. Pirâmide de Testes

Seguimos o modelo da pirâmide de testes para otimizar o feedback e reduzir custos de manutenção:

*   **Testes de Unidade (Base)**: Focados no domínio (`MinhasFinancas.Domain`). Validação exaustiva de regras de negócio, limites de idade e integridade de categorias usando xUnit e FluentAssertions.
*   **Testes de Integração**: Validação dos serviços da camada de aplicação e persistência.
*   **Testes de E2E (Topo)**: Fluxos críticos de usuário usando Playwright, garantindo a integração entre Frontend, API e Banco de Dados.

## 2. Testes de Unidade Avançados (Data-Driven)

Implementamos **Testes Baseados em Dados (Theories)** para validar regras complexas com múltiplos cenários em uma única estrutura.
*   **Exemplo**: A restrição de idade para receitas é testada com valores de borda (17, 18 e 19 anos) para garantir que a lógica de "maior ou igual" esteja correta.

## 3. Testes de Mutação (Stryker.NET)

Para medir a **eficácia real** da nossa suíte de testes, utilizamos o Stryker.NET.
O teste de mutação introduz falhas deliberadas no código-fonte para verificar se os testes existentes são capazes de detectá-las.

**Como rodar:**
```bash
cd tests/Backend
dotnet stryker --config-file stryker-config.json
```

## 4. Resiliência e Chaos Testing (Frontend)

O frontend é testado para ser resiliente a falhas externas:
*   **Simulação de Erro 500**: Validamos que a UI exibe mensagens de erro amigáveis caso a API esteja indisponível.
*   **Network Throttling**: Testamos o comportamento do sistema sob condições de rede lenta (3G), garantindo a presença de indicadores de carregamento (spinners).

## 5. Regressão Visual

Utilizamos o motor do Playwright para capturas de tela e comparação de pixels (**Visual Comparison**). Isso evita que mudanças acidentais no CSS quebrem o layout do Dashboard sem serem detectadas por testes funcionais.

## 6. Acessibilidade (WCAG 2.1)

Utilizamos o motor **Axe-core** integrado ao Playwright para realizar varreduras automáticas de acessibilidade. Isso garante que o sistema siga os padrões WCAG 2.1 (AA), sendo utilizável por tecnologias assistivas.

## 7. Testes de Performance (k6)

Para garantir que o sistema escale, implementamos testes de carga que simulam múltiplos usuários simultâneos acessando o Dashboard e as APIs de Totais. O foco é manter o tempo de resposta abaixo de 500ms mesmo sob carga.

**Como rodar:**
```bash
k6 run tests/performance/load-test.js
```

## 8. Segurança e Pentest Automático

Além dos testes funcionais, implementamos uma camada de auditoria de segurança:
*   **Auditoria de API**: Testes no Playwright (`security.spec.ts`) que verificam se os endpoints estão expostos sem autenticação e se há vazamento de informações sensíveis.
*   **Validação de Infraestrutura**: Verificação de cabeçalhos de segurança HTTP e políticas de CORS.
*   **Controle de Acesso**: Validação de falhas de IDOR (Insecure Direct Object Reference) para garantir a privacidade dos dados.

## 9. Pipeline de CI/CD (GitHub Actions)

O pipeline automatizado executa as seguintes etapas a cada Pull Request:
1.  Build e Testes Unitários do Backend.
2.  Testes de Componente do Frontend (Vitest).
3.  **Full Stack E2E**: O pipeline sobe containers Docker com a API e o Web, aguarda o Healthcheck e executa a suíte do Playwright.
4.  **Artefatos**: Vídeos e screenshots das execuções E2E são armazenados em caso de falha.

---
*Documentação gerada como parte dos padrões de engenharia do projeto.*
