
package ch.dashboard.Resource;

import ch.dashboard.Entity.*;
import ch.dashboard.Service.JwtService;
import org.openpdf.text.*;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Path("/reports")
@Authenticated
public class ReportResource {

        @Inject
        JwtService jwtService;

        @GET
        @Path("/monthly")
        @Produces("application/pdf")
        public Response monthlyReport() {
                try {
                        Long userId = jwtService.getUserId();

                        User user = User.findById(userId);

                        if (user == null) {
                                throw new NotAuthorizedException("Utilisateur introuvable");
                        }
                        List<Project> projects = Project.list("user.id", userId);
                        List<Task> tasks = Task.list("user.id", userId);
                        List<Goal> goals = Goal.list("user.id", userId);
                        List<FinanceItem> finances = FinanceItem.list("user.id", userId);

                        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                        Document document = new Document(PageSize.A4, 42, 42, 42, 42);
                        PdfWriter.getInstance(document, outputStream);

                        document.open();

                        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(15, 23, 42));
                        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(100, 116, 139));
                        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, new Color(15, 23, 42));
                        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(51, 65, 85));
                        Font whiteFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

                        Paragraph title = new Paragraph("Rapport mensuel de " + user.username, titleFont);
                        title.setSpacingAfter(6);
                        document.add(title);

                        document.add(new Paragraph(user.email + " · Généré le " + LocalDate.now(), subtitleFont));
                        document.add(space(18));

                        addSummary(document, projects, tasks, goals, finances, sectionFont, normalFont, whiteFont);
                        addCharts(document, finances, tasks, sectionFont);
                        addProjectsTable(document, projects, sectionFont, normalFont, whiteFont);
                        addTasksTable(document, tasks, sectionFont, normalFont, whiteFont);
                        addGoalsTable(document, goals, sectionFont, normalFont, whiteFont);
                        addFinancesTable(document, finances, sectionFont, normalFont, whiteFont);

                        document.close();

                        String fileName = "rapport-home-dashboard-" + LocalDate.now().getYear() + "-"
                                        + String.format("%02d", LocalDate.now().getMonthValue()) + ".pdf";

                        return Response.ok(outputStream.toByteArray())
                                        .header("Content-Disposition", "attachment; filename=" + fileName).build();

                } catch (Exception e) {
                        return Response.serverError()
                                        .entity("Erreur génération PDF : " + e.getMessage())
                                        .build();
                }
        }

        private void addSummary(
                        Document document,
                        List<Project> projects,
                        List<Task> tasks,
                        List<Goal> goals,
                        List<FinanceItem> finances,
                        Font sectionFont,
                        Font normalFont,
                        Font whiteFont) throws DocumentException {

                document.add(section("Résumé", sectionFont));

                double revenus = finances.stream()
                                .filter(item -> "Revenu".equalsIgnoreCase(item.type))
                                .mapToDouble(item -> item.amount)
                                .sum();

                double depenses = finances.stream()
                                .filter(item -> "Dépense".equalsIgnoreCase(item.type))
                                .mapToDouble(item -> item.amount)
                                .sum();

                double epargne = finances.stream()
                                .filter(item -> "Épargne".equalsIgnoreCase(item.type))
                                .mapToDouble(item -> item.amount)
                                .sum();

                double solde = revenus - depenses - epargne;

                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                table.setSpacingAfter(18);

                addHeaderCell(table, "Projets", whiteFont);
                addHeaderCell(table, "Tâches", whiteFont);
                addHeaderCell(table, "Objectifs", whiteFont);
                addHeaderCell(table, "Solde net", whiteFont);

                addCell(table, String.valueOf(projects.size()), normalFont);
                addCell(table, String.valueOf(tasks.size()), normalFont);
                addCell(table, String.valueOf(goals.size()), normalFont);
                addCell(table, "CHF " + formatAmount(solde), normalFont);

                document.add(table);
        }

        private void addProjectsTable(
                        Document document,
                        List<Project> projects,
                        Font sectionFont,
                        Font normalFont,
                        Font whiteFont) throws DocumentException {

                document.add(section("Projets", sectionFont));

                PdfPTable table = new PdfPTable(3);
                table.setWidthPercentage(100);
                table.setSpacingAfter(18);
                table.setWidths(new float[] { 3, 2, 1 });

                addHeaderCell(table, "Nom", whiteFont);
                addHeaderCell(table, "Statut", whiteFont);
                addHeaderCell(table, "Progression", whiteFont);

                if (projects.isEmpty()) {
                        addCell(table, "Aucun projet", normalFont);
                        addCell(table, "-", normalFont);
                        addCell(table, "-", normalFont);
                } else {
                        for (Project project : projects) {
                                addCell(table, project.name, normalFont);
                                addCell(table, project.status, normalFont);
                                addCell(table, project.progress + "%", normalFont);
                        }
                }

                document.add(table);
        }

        private void addTasksTable(
                        Document document,
                        List<Task> tasks,
                        Font sectionFont,
                        Font normalFont,
                        Font whiteFont) throws DocumentException {

                document.add(section("Tâches", sectionFont));

                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                table.setSpacingAfter(18);
                table.setWidths(new float[] { 3, 2, 2, 2 });

                addHeaderCell(table, "Titre", whiteFont);
                addHeaderCell(table, "Projet", whiteFont);
                addHeaderCell(table, "Priorité", whiteFont);
                addHeaderCell(table, "Statut", whiteFont);

                if (tasks.isEmpty()) {
                        addCell(table, "Aucune tâche", normalFont);
                        addCell(table, "-", normalFont);
                        addCell(table, "-", normalFont);
                        addCell(table, "-", normalFont);
                } else {
                        for (Task task : tasks) {
                                addCell(table, task.title, normalFont);
                                addCell(table, task.project, normalFont);
                                addCell(table, task.priority, normalFont);
                                addCell(table, task.status, normalFont);
                        }
                }

                document.add(table);
        }

        private void addGoalsTable(
                        Document document,
                        List<Goal> goals,
                        Font sectionFont,
                        Font normalFont,
                        Font whiteFont) throws DocumentException {

                document.add(section("Objectifs", sectionFont));

                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                table.setSpacingAfter(18);
                table.setWidths(new float[] { 3, 2, 2, 1 });

                addHeaderCell(table, "Titre", whiteFont);
                addHeaderCell(table, "Catégorie", whiteFont);
                addHeaderCell(table, "Deadline", whiteFont);
                addHeaderCell(table, "Progression", whiteFont);

                if (goals.isEmpty()) {
                        addCell(table, "Aucun objectif", normalFont);
                        addCell(table, "-", normalFont);
                        addCell(table, "-", normalFont);
                        addCell(table, "-", normalFont);
                } else {
                        for (Goal goal : goals) {
                                addCell(table, goal.title, normalFont);
                                addCell(table, goal.category, normalFont);
                                addCell(table, goal.deadline, normalFont);
                                addCell(table, goal.progress + "%", normalFont);
                        }
                }

                document.add(table);
        }

        private void addFinancesTable(
                        Document document,
                        List<FinanceItem> finances,
                        Font sectionFont,
                        Font normalFont,
                        Font whiteFont) throws DocumentException {

                document.add(section("Finances", sectionFont));

                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                table.setSpacingAfter(18);
                table.setWidths(new float[] { 3, 2, 2, 2 });

                addHeaderCell(table, "Description", whiteFont);
                addHeaderCell(table, "Type", whiteFont);
                addHeaderCell(table, "Catégorie", whiteFont);
                addHeaderCell(table, "Montant", whiteFont);

                if (finances.isEmpty()) {
                        addCell(table, "Aucune ligne financière", normalFont);
                        addCell(table, "-", normalFont);
                        addCell(table, "-", normalFont);
                        addCell(table, "-", normalFont);
                } else {
                        for (FinanceItem item : finances) {
                                addCell(table, item.description, normalFont);
                                addCell(table, item.type, normalFont);
                                addCell(table, item.category, normalFont);
                                addCell(table, "CHF " + formatAmount(item.amount), normalFont);
                        }
                }

                document.add(table);
        }

        private Paragraph section(String title, Font font) {
                Paragraph paragraph = new Paragraph(title, font);
                paragraph.setSpacingBefore(8);
                paragraph.setSpacingAfter(8);
                return paragraph;
        }

        private Paragraph space(int size) {
                Paragraph paragraph = new Paragraph(" ");
                paragraph.setSpacingAfter(size);
                return paragraph;
        }

        private void addHeaderCell(PdfPTable table, String text, Font font) {
                PdfPCell cell = new PdfPCell(new Phrase(text, font));
                cell.setBackgroundColor(new Color(91, 77, 247));
                cell.setPadding(8);
                cell.setBorderColor(new Color(226, 232, 240));
                table.addCell(cell);
        }

        private void addCell(PdfPTable table, String text, Font font) {
                PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
                cell.setPadding(8);
                cell.setBorderColor(new Color(226, 232, 240));
                table.addCell(cell);
        }

        private String formatAmount(double value) {
                return String.format("%.2f", value);
        }

        private void addCharts(
                        Document document,
                        List<FinanceItem> finances,
                        List<Task> tasks,
                        Font sectionFont) throws Exception {

                document.add(section("Graphiques", sectionFont));

                double revenus = finances.stream()
                                .filter(item -> "Revenu".equalsIgnoreCase(item.type))
                                .mapToDouble(item -> item.amount)
                                .sum();

                double depenses = finances.stream()
                                .filter(item -> "Dépense".equalsIgnoreCase(item.type))
                                .mapToDouble(item -> item.amount)
                                .sum();

                double epargne = finances.stream()
                                .filter(item -> "Épargne".equalsIgnoreCase(item.type))
                                .mapToDouble(item -> item.amount)
                                .sum();

                int todo = (int) tasks.stream()
                                .filter(task -> "À faire".equalsIgnoreCase(task.status))
                                .count();

                int doing = (int) tasks.stream()
                                .filter(task -> "En cours".equalsIgnoreCase(task.status))
                                .count();

                int done = (int) tasks.stream()
                                .filter(task -> "Terminé".equalsIgnoreCase(task.status))
                                .count();

                Image financeChart = createBarChartImage(
                                "Finances",
                                new String[] { "Revenus", "Dépenses", "Épargne" },
                                new double[] { revenus, depenses, epargne });

                Image taskChart = createBarChartImage(
                                "Tâches",
                                new String[] { "À faire", "En cours", "Terminé" },
                                new double[] { todo, doing, done });

                financeChart.scaleToFit(500, 230);
                taskChart.scaleToFit(500, 230);

                document.add(financeChart);
                document.add(space(12));
                document.add(taskChart);
                document.add(space(18));
        }

        private Image createBarChartImage(
                        String title,
                        String[] labels,
                        double[] values) throws Exception {

                int width = 900;
                int height = 360;

                BufferedImage image = new BufferedImage(
                                width,
                                height,
                                BufferedImage.TYPE_INT_RGB);

                Graphics2D g = image.createGraphics();

                java.awt.Color background = new java.awt.Color(248, 250, 252);
                java.awt.Color text = new java.awt.Color(15, 23, 42);
                java.awt.Color muted = new java.awt.Color(100, 116, 139);
                java.awt.Color accent = new java.awt.Color(91, 77, 247);
                java.awt.Color grid = new java.awt.Color(226, 232, 240);

                g.setColor(background);
                g.fillRect(0, 0, width, height);

                g.setColor(text);
                g.setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 28));
                g.drawString(title, 40, 50);

                double max = 1;

                for (double value : values) {
                        if (value > max) {
                                max = value;
                        }
                }

                int chartX = 70;
                int chartY = 90;
                int chartWidth = 760;
                int chartHeight = 190;
                int barWidth = 120;
                int gap = 120;

                g.setColor(grid);

                for (int i = 0; i <= 4; i++) {
                        int y = chartY + (chartHeight / 4) * i;
                        g.drawLine(chartX, y, chartX + chartWidth, y);
                }

                for (int i = 0; i < values.length; i++) {
                        int barHeight = (int) ((values[i] / max) * chartHeight);
                        int x = chartX + 70 + i * (barWidth + gap);
                        int y = chartY + chartHeight - barHeight;

                        g.setColor(accent);
                        g.fillRoundRect(x, y, barWidth, barHeight, 18, 18);

                        g.setColor(text);
                        g.setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 20));
                        g.drawString(String.valueOf((int) values[i]), x + 22, y - 12);

                        g.setColor(muted);
                        g.setFont(new java.awt.Font("Arial", java.awt.Font.PLAIN, 18));
                        g.drawString(labels[i], x, chartY + chartHeight + 36);
                }

                g.dispose();

                ByteArrayOutputStream imageOutput = new ByteArrayOutputStream();
                ImageIO.write(image, "png", imageOutput);

                return Image.getInstance(imageOutput.toByteArray());
        }
}