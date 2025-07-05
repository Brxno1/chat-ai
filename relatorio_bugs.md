# Relatório de Bugs: Problemas Críticos no Código Micro-SaaS

## Resumo Geral
Este relatório identifica 3 bugs críticos encontrados no código, incluindo vulnerabilidades de segurança, problemas de desempenho e erros de lógica.

---

## Bug #1: Vulnerabilidade de Redirecionamento Aberto

**Severidade:** ALTA (Vulnerabilidade de Segurança)
**Arquivo:** `src/utils/get-url.ts`
**Linhas:** 1-10

### Descrição
A função `getUrl` constrói URLs sem validação adequada de entrada, tornando-a vulnerável a ataques de redirecionamento aberto. A função aceita um tipo `Path` mas não valida se a entrada realmente corresponde aos caminhos esperados.

### Código Vulnerável
```typescript
export function getUrl(path: Path) {
  const baseUrl = env.NEXT_PUBLIC_APP_URL!
  return `${baseUrl}${path}`
}
```

### Impacto de Segurança
- **Ataque de Redirecionamento Aberto**: Um atacante poderia manipular o parâmetro path para redirecionar usuários para sites maliciosos externos
- **Ataques CSRF**: Poderia ser usado em conjunto com outras vulnerabilidades para realizar falsificação de solicitação entre sites
- **Phishing**: Usuários poderiam ser redirecionados para sites de phishing que parecem legítimos

### A Correção
Adicionar validação e sanitização adequada de entrada:

```typescript
type Path = '/dashboard' | '/auth' | '/' | '/chat'

const CAMINHOS_PERMITIDOS: Path[] = ['/dashboard', '/auth', '/', '/chat']

export function getUrl(path: Path): string {
  // Validar se o caminho está na nossa lista permitida
  if (!CAMINHOS_PERMITIDOS.includes(path)) {
    throw new Error(`Caminho inválido: ${path}`)
  }
  
  // Garantir que o caminho comece com /
  if (!path.startsWith('/')) {
    throw new Error(`Caminho deve começar com /: ${path}`)
  }
  
  const baseUrl = env.NEXT_PUBLIC_APP_URL!
  
  // Validar se baseUrl não está vazia
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL não está configurada')
  }
  
  return `${baseUrl}${path}`
}
```

---

## Bug #2: Falta de Autorização na Ação de Atualização de Todo

**Severidade:** ALTA (Vulnerabilidade de Segurança)
**Arquivo:** `src/app/(http)/todo/update-todo.ts`
**Linhas:** 1-16

### Descrição
A server action `updateTodoAction` não possui verificações adequadas de autenticação e autorização. Qualquer usuário pode potencialmente atualizar qualquer item de todo fornecendo um ID válido, levando à modificação não autorizada de dados.

### Código Vulnerável
```typescript
export async function updateTodoAction(todo: Todo) {
  await prisma.todo.update({
    where: {
      id: todo.id,
    },
    data: {
      title: todo.title,
    },
  })
}
```

### Impacto de Segurança
- **Escalação de Privilégios**: Usuários podem modificar todos pertencentes a outros usuários
- **Integridade de Dados**: Modificação não autorizada de itens de todo
- **IDOR (Referência Direta a Objeto Insegura)**: Acesso direto a objetos sem autorização adequada

### A Correção
Adicionar autenticação e autorização adequadas:

```typescript
'use server'

import { auth } from '@/lib/auth'  // Assumindo que existe utilitário de auth
import { Todo } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'

export async function updateTodoAction(todo: Todo) {
  // Obter a sessão do usuário atual
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('Não autorizado: Usuário não autenticado')
  }
  
  // Primeiro, verificar se o todo pertence ao usuário atual
  const todoExistente = await prisma.todo.findUnique({
    where: { id: todo.id },
    select: { userId: true, id: true }
  })
  
  if (!todoExistente) {
    throw new Error('Todo não encontrado')
  }
  
  if (todoExistente.userId !== session.user.id) {
    throw new Error('Não autorizado: Não é possível atualizar todo de outro usuário')
  }
  
  // Validar dados de entrada
  if (!todo.title || todo.title.trim().length === 0) {
    throw new Error('Título do todo não pode estar vazio')
  }
  
  if (todo.title.length > 255) {
    throw new Error('Título do todo muito longo (máximo 255 caracteres)')
  }
  
  // Agora é seguro atualizar
  await prisma.todo.update({
    where: {
      id: todo.id,
    },
    data: {
      title: todo.title.trim(),
      updatedAt: new Date(),
    },
  })
}
```

---

## Bug #3: Problema de Desempenho - Padrão de Consulta Ineficiente

**Severidade:** MÉDIA (Problema de Desempenho)
**Arquivo:** `src/app/api/chat/services/chat-operations.ts`
**Linhas:** 66-84

### Descrição
A função `saveMessages` executa consultas ineficientes ao banco de dados, buscando mensagens existentes para cada operação de salvamento, mesmo quando não é necessário. Isso cria carga desnecessária no banco e pode causar degradação de performance sob alta carga.

### Código Problemático
```typescript
const existingMessages = await prisma.message.findMany({
  where: {
    chatId,
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
  select: {
    id: true,
    parts: true,
    role: true,
    createdAt: true,
  },
})
```

### Impacto de Desempenho
- **Carga Desnecessária no Banco**: Busca mensagens mesmo quando verificação de duplicatas não é necessária
- **Tempos de Resposta Lentos**: Ida e volta adicional ao banco para cada salvamento de mensagem
- **Escalabilidade Ruim**: Performance degrada conforme o número de mensagens aumenta

### A Correção
Otimizar o padrão de consulta com busca condicional:

```typescript
async function saveMessages(
  messages: Array<{ role: Role; content: string }>,
  chatId: string,
): Promise<OperationResponse<null>> {
  try {
    // Só buscar mensagens existentes se tivermos mensagens para salvar
    if (messages.length === 0) {
      return { success: true, data: null }
    }

    const messagesToCreate: Array<{
      role: 'USER' | 'ASSISTANT'
      chatId: string
      parts: string
    }> = []

    // Só verificar duplicatas se tivermos mais de uma mensagem
    // ou se este é um cenário de potencial duplicata
    let existingMessages: any[] = []
    
    if (messages.length === 1) {
      // Só buscar a última mensagem para salvamentos de mensagem única
      existingMessages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          parts: true,
          role: true,
          createdAt: true,
        },
      })
    }

    for (const msg of messages) {
      const role = msg.role === 'user' ? 'USER' : 'ASSISTANT'
      const content = msg.content

      const parts = [{ type: 'text', text: content }]
      const partsString = JSON.stringify(parts)

      // Verificação otimizada de duplicata - só verificar se temos mensagens existentes
      const isConsecutiveDuplicate = existingMessages.length > 0 && 
        verificarDuplicata(existingMessages[0], role, content)

      if (!isConsecutiveDuplicate) {
        messagesToCreate.push({
          role,
          chatId,
          parts: partsString,
        })
      }
    }

    // Inserir todas as mensagens em lote em uma única transação
    if (messagesToCreate.length > 0) {
      await prisma.message.createMany({
        data: messagesToCreate,
      })
    }

    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: errorHandler(error),
      data: null,
    }
  }
}

// Função auxiliar para verificar duplicatas
function verificarDuplicata(lastMessage: any, role: string, content: string): boolean {
  if (lastMessage.role !== role) return false

  try {
    const lastParts = typeof lastMessage.parts === 'string'
      ? JSON.parse(lastMessage.parts)
      : lastMessage.parts

    if (Array.isArray(lastParts)) {
      const lastText = lastParts
        .filter((p) => p?.type === 'text' && p?.text)
        .map((p) => p.text)
        .join(' ')
      return lastText === content
    }
  } catch (error) {
    console.error('Erro ao comparar parts:', error)
  }

  return false
}
```

---

## Recomendações Adicionais

### 1. Validação de Entrada
- Implementar validação abrangente de entrada em todos os endpoints de API
- Usar bibliotecas de validação de schema como Zod para validação consistente
- Sanitizar todas as entradas do usuário antes de operações no banco

### 2. Limitação de Taxa
- Implementar limitação de taxa nos endpoints de API para prevenir abuso
- Adicionar tratamento adequado de erro para cenários de limite de taxa excedido

### 3. Indexação do Banco de Dados
- Adicionar índices adequados para campos frequentemente consultados
- Monitorar performance de consultas e otimizar consultas lentas

### 4. Cabeçalhos de Segurança
- Implementar cabeçalhos de segurança adequados (proteção CSRF, XSS)
- Usar HTTPS em produção
- Implementar políticas CORS adequadas

### 5. Tratamento de Erros
- Evitar expor informações sensíveis em mensagens de erro
- Implementar logging adequado para debugging sem expor segredos
- Usar formatos de resposta de erro consistentes

---

## Resumo Final

Os bugs identificados representam riscos significativos de segurança e desempenho que devem ser abordados imediatamente:

1. **Vulnerabilidade de Redirecionamento Aberto** - Pode levar a ataques de phishing
2. **Falta de Autorização** - Pode levar a vazamentos de dados
3. **Problemas de Desempenho** - Pode causar problemas de escalabilidade

Todos os três bugs foram fornecidos com correções detalhadas e devem ser priorizados para resolução imediata, especialmente as duas vulnerabilidades de segurança de alta severidade que podem levar a comprometimento de dados e segurança do usuário.