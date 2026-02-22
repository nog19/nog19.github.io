📝 Gerenciador de Tarefas (TodoApp)
Um aplicativo de linha de comando (CLI) desenvolvido em Java para gerenciamento de produtividade pessoal. O sistema permite organizar tarefas por categorias, definir prazos e acompanhar o progresso através de uma interface visual amigável no terminal.

✨ Funcionalidades
CRUD Completo: Adicione, liste, conclua e exclua tarefas com facilidade.

Organização por Categorias: Visualização agrupada para melhor foco.

Busca Inteligente: Localize tarefas rapidamente por título ou categoria.

Persistência de Dados: Todas as tarefas são salvas automaticamente em um arquivo local (tarefas.txt).

Dashboard de Progresso: Resumo estatístico com barra de progresso visual.

Interface Limpa: Uso de caracteres ASCII/Box-drawing para uma experiência visual organizada no terminal.

🚀 Como Executar
Pré-requisitos
Java JDK 11 ou superior instalado.

Passo a Passo
Clone o repositório ou copie o código:

Bash
git clone https://github.com/nog19/ToDo-List
Compile o arquivo:

Bash
javac TodoApp.java
Execute a aplicação:

Bash
java TodoApp
🛠️ Detalhes Técnicos
A aplicação foi estruturada seguindo princípios de programação orientada a objetos e utiliza recursos modernos do Java:

Modelo de Dados: Utiliza uma static class Tarefa interna para encapsular as propriedades.

Streams API: Empregada para filtragem de buscas, cálculos de IDs e geração de resumos estatísticos.

Persistência: Implementada via PrintWriter e BufferedReader, utilizando um formato CSV customizado com o delimitador || para evitar conflitos com vírgulas no texto.

Collections: Uso de LinkedHashMap para manter a ordem das categorias durante a listagem.

📂 Estrutura do Arquivo de Dados
As tarefas são armazenadas no arquivo tarefas.txt no seguinte formato:
ID||Título||Categoria||Prazo||StatusConclusão

Exemplo:
1||Estudar Java||Educação||2025-05-20||false

📊 Visualização do Resumo
O sistema conta com um indicador visual de progresso dinâmico:
Progresso: [████████░░░░░░░░░░░░] 40%

🤝 Contribuições
Sinta-se à vontade para abrir uma issue ou enviar um pull request com melhorias como:

Validação de datas (formato local).

Edição de tarefas existentes.

Ordenação por prioridade.
