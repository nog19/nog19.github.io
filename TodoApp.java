import java.io.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class TodoApp {

    static final String ARQUIVO = "tarefas.txt";
    static final String SEP = "||";
    static List<Tarefa> tarefas = new ArrayList<>();
    static Scanner scanner = new Scanner(System.in);
    static class Tarefa {
        int id;
        String titulo;
        String categoria;
        String prazo;
        boolean concluida;

        Tarefa(int id, String titulo, String categoria, String prazo, boolean concluida) {
            this.id = id;
            this.titulo = titulo;
            this.categoria = categoria;
            this.prazo = prazo;
            this.concluida = concluida;
        }

        String toCSV() {
            return id + SEP + titulo + SEP + categoria + SEP + prazo + SEP + concluida;
        }

        static Tarefa fromCSV(String linha) {
            String[] p = linha.split("\\|\\|", -1);
            return new Tarefa(Integer.parseInt(p[0]), p[1], p[2], p[3], Boolean.parseBoolean(p[4]));
        }

        @Override
        public String toString() {
            String status = concluida ? "✔" : "○";
            String prazoPart = prazo.isEmpty() ? "" : "  📅 " + prazo;
            String catPart = categoria.isEmpty() ? "" : "  [" + categoria + "]";
            return String.format("  %s #%d - %s%s%s", status, id, titulo, catPart, prazoPart);
        }
    }
// Funções de persistência
    static void salvar() throws IOException {
        try (PrintWriter pw = new PrintWriter(new FileWriter(ARQUIVO))) {
            for (Tarefa t : tarefas) pw.println(t.toCSV());
        }
    }

    static void carregar() {
        File f = new File(ARQUIVO);
        if (!f.exists()) return;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String linha;
            while ((linha = br.readLine()) != null) {
                if (!linha.isBlank()) tarefas.add(Tarefa.fromCSV(linha));
            }
        } catch (Exception e) {
            System.out.println("⚠ Não foi possível carregar tarefas salvas.");
        }
    }

    static int proximoId() {
        return tarefas.stream().mapToInt(t -> t.id).max().orElse(0) + 1;
    }

// Funções de interface
    static void cabecalho(String titulo) {
        System.out.println();
        System.out.println("╔══════════════════════════════════════╗");
        System.out.printf ("║  %-36s║%n", titulo);
        System.out.println("╚══════════════════════════════════════╝");
    }


    static String ler(String prompt) {
        System.out.print(prompt);
        return scanner.nextLine().trim();
    }

    // Funções principais do menu   
    static void listar(boolean apenasAbertas) {
        List<Tarefa> lista = apenasAbertas
            ? tarefas.stream().filter(t -> !t.concluida).collect(java.util.stream.Collectors.toList())
            : tarefas;

        if (lista.isEmpty()) {
            System.out.println("  (nenhuma tarefa encontrada)");
            return;
        }

        // Agrupa por categoria
        Map<String, List<Tarefa>> grupos = new LinkedHashMap<>();
        for (Tarefa t : lista) {
            grupos.computeIfAbsent(t.categoria.isEmpty() ? "Sem categoria" : t.categoria,
                                   k -> new ArrayList<>()).add(t);
        }

        for (Map.Entry<String, List<Tarefa>> e : grupos.entrySet()) {
            System.out.println("\n  ▸ " + e.getKey());
            e.getValue().forEach(System.out::println);
        }
    }

// Funções de manipulação
    static void adicionar() throws IOException {
        cabecalho("➕ Nova Tarefa");
        String titulo = ler("  Título       : ");
        if (titulo.isEmpty()) { System.out.println("  Título não pode ser vazio."); return; }
        String categoria = ler("  Categoria    : ");
        String prazo     = ler("  Prazo (ex: 2025-12-31) [Enter para pular]: ");
        tarefas.add(new Tarefa(proximoId(), titulo, categoria, prazo, false));
        salvar();
        System.out.println("  ✅ Tarefa adicionada!");
    }

    static void concluir() throws IOException {
        cabecalho("✔ Concluir Tarefa");
        listar(true);
        String entrada = ler("\n  ID da tarefa: ");
        try {
            int id = Integer.parseInt(entrada);
            tarefas.stream().filter(t -> t.id == id).findFirst().ifPresentOrElse(t -> {
                t.concluida = true;
                try { salvar(); } catch (IOException e) { e.printStackTrace(); }
                System.out.println("  🎉 Tarefa #" + id + " concluída!");
            }, () -> System.out.println("  Tarefa não encontrada."));
        } catch (NumberFormatException e) {
            System.out.println("  ID inválido.");
        }
    }

    static void excluir() throws IOException { // Excluir tarefa por ID
        cabecalho("🗑 Excluir Tarefa");
        listar(false);
        String entrada = ler("\n  ID da tarefa: ");
        try {
            int id = Integer.parseInt(entrada);
            boolean removida = tarefas.removeIf(t -> t.id == id);
            if (removida) { salvar(); System.out.println("  Tarefa removida."); }
            else           System.out.println("  Tarefa não encontrada.");
        } catch (NumberFormatException e) {
            System.out.println("  ID inválido.");
        }
    }

    static void buscar() {// Buscar por título ou categoria
        cabecalho("🔍 Buscar Tarefa");
        String termo = ler("  Buscar por: ").toLowerCase();
        tarefas.stream()
            .filter(t -> t.titulo.toLowerCase().contains(termo)
                      || t.categoria.toLowerCase().contains(termo))
            .forEach(System.out::println);
    }

    static void resumo() {// Mostrar resumo e progresso
        cabecalho("📊 Resumo");
        long total     = tarefas.size();
        long concluidas = tarefas.stream().filter(t -> t.concluida).count();
        long abertas   = total - concluidas;
        System.out.printf("  Total    : %d%n", total);
        System.out.printf("  Abertas  : %d%n", abertas);
        System.out.printf("  Concluídas: %d%n", concluidas);
        if (total > 0) {
            int pct = (int)(concluidas * 100 / total);
            System.out.print("  Progresso: [");
            int bars = pct / 5;
            System.out.print("█".repeat(bars) + "░".repeat(20 - bars));
            System.out.printf("] %d%%%n", pct);
        }
    }

    // ── Menu principal 
    public static void main(String[] args) {
        carregar();
        System.out.println("\n  ╔═════════════════════════════╗");
        System.out.println("  ║   📝 GERENCIADOR DE TAREFAS ║");
        System.out.println("  ╚═════════════════════════════╝");

        while (true) {
            System.out.println("\n──────────────────────────────────────");
            System.out.println("  1. Ver tarefas abertas");
            System.out.println("  2. Ver todas as tarefas");
            System.out.println("  3. Adicionar tarefa");
            System.out.println("  4. Marcar como concluída");
            System.out.println("  5. Excluir tarefa");
            System.out.println("  6. Buscar tarefa");
            System.out.println("  7. Resumo / Progresso");
            System.out.println("  0. Sair");
            System.out.println("──────────────────────────────────────");
            String opcao = ler("  Escolha: ");

            try {
                switch (opcao) {
                    case "1" -> { cabecalho("📋 Tarefas Abertas"); listar(true); }
                    case "2" -> { cabecalho("📋 Todas as Tarefas"); listar(false); }
                    case "3" -> adicionar();
                    case "4" -> concluir();
                    case "5" -> excluir();
                    case "6" -> buscar();
                    case "7" -> resumo();
                    case "0" -> { System.out.println("\n  Até logo! 👋\n"); return; }
                    default  -> System.out.println("  Opção inválida.");
                }
            } catch (IOException e) {
                System.out.println("  ⚠ Erro ao salvar: " + e.getMessage());
            }
        }
    }
}
