package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"slices"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/jung-kurt/gofpdf/v2"
)

type ReportService interface {
	GenerateSystemReport(
		ctx context.Context,
		permissions []string,
		params dto.SystemReportParams,
	) ([]byte, error)
}

type reportService struct {
	userRepo   repository.UserRepository
	clientRepo repository.ClientRepository
	logRepo    repository.LogRepository
}

func NewReportService(
	userRepo repository.UserRepository,
	clientRepo repository.ClientRepository,
	logRepo repository.LogRepository,
) ReportService {
	return &reportService{
		userRepo:   userRepo,
		clientRepo: clientRepo,
		logRepo:    logRepo,
	}
}

type SystemReportJSON struct {
	Users   []models.User     `json:"users,omitempty"`
	Clients []models.Client   `json:"clients,omitempty"`
	Logs    []models.AuditLog `json:"logs,omitempty"`
}

func (s *reportService) GenerateSystemReport(
	ctx context.Context,
	permissions []string,
	params dto.SystemReportParams,
) ([]byte, error) {
	var users []models.User
	var clients []models.Client
	var logs []models.AuditLog
	var err error

	hasUsersPerm := slices.Contains(permissions, "View all users")
	hasClientsPerm := slices.Contains(permissions, "View all appclients")
	hasLogsPerm := slices.Contains(permissions, "View audit logs")

	if params.IncludeUsers && hasUsersPerm {
		users, err = s.userRepo.GetUserList(
			ctx, params.LimitUsers, 0, "created_at", "DESC", "",
		)
		if err != nil {
			log.Printf("[ReportService] GetUserList error: %v", err)
			return nil, fmt.Errorf("failed to fetch users: %w", err)
		}
	}

	if params.IncludeClients && hasClientsPerm {
		clients, err = s.clientRepo.ListClients(
			ctx, params.LimitClients, 0, "", "client_name", "ASC",
		)
		if err != nil {
			log.Printf("[ReportService] ListClients error: %v", err)
			return nil, fmt.Errorf("failed to fetch clients: %w", err)
		}
	}

	if params.IncludeLogs && hasLogsPerm {
		logs, err = s.logRepo.GetLogList(ctx, params.LimitLogs, 0)
		if err != nil {
			log.Printf("[ReportService] GetLogList error: %v", err)
			return nil, fmt.Errorf("failed to fetch logs: %w", err)
		}
	}

	if params.Format == "json" {
		reportData := SystemReportJSON{
			Users:   users,
			Clients: clients,
			Logs:    logs,
		}
		return json.MarshalIndent(reportData, "", "  ")
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 18, 15)
	pdf.SetAutoPageBreak(true, 28)

	pdf.SetFooterFunc(func() {
		pdf.SetY(-27)
		pdf.SetFont("Arial", "", 8)
		pdf.SetTextColor(25, 25, 25)
		pdf.SetX(105)
		pdf.CellFormat(
			90, 5,
			"This is system-generated, signature is not required.",
			"", 0, "R", false, 0, "",
		)

		pdf.SetY(-21)
		pdf.SetDrawColor(30, 30, 30)
		pdf.Line(15, pdf.GetY(), 195, pdf.GetY())

		pdf.SetY(-16)
		pdf.SetFont("Arial", "B", 8)
		pdf.SetTextColor(180, 0, 0)
		pdf.SetX(5)
		pdf.CellFormat(
			145, 4,
			"This document contains personal-identifiable information "+
				"that is subject to Data Privacy.",
			"", 0, "C", false, 0, "",
		)

		pdf.SetY(-11)
		pdf.SetX(5)
		pdf.CellFormat(
			145, 4,
			"Please keep this document protected and in a safe place.",
			"", 0, "C", false, 0, "",
		)
	})

	pdf.AddPage()
	genDate := time.Now().Format("2006-01-02 15:04:05 MST")
	addSystemReportHeader(pdf, genDate)

	if params.IncludeUsers && hasUsersPerm {
		addReportSectionTitle(pdf, "1. Registered Users")
		addUsersTable(pdf, users)
	}

	if params.IncludeClients && hasClientsPerm {
		sectionNum := "2"
		if !params.IncludeUsers || !hasUsersPerm {
			sectionNum = "1"
		}
		addReportSectionTitle(
			pdf, fmt.Sprintf("%s. Registered Application Clients", sectionNum),
		)
		addClientsTable(pdf, clients)
	}

	if params.IncludeLogs && hasLogsPerm {
		sectionNum := "3"
		if (!params.IncludeUsers || !hasUsersPerm) &&
			(!params.IncludeClients || !hasClientsPerm) {
			sectionNum = "1"
		} else if (!params.IncludeUsers || !hasUsersPerm) ||
			(!params.IncludeClients || !hasClientsPerm) {
			sectionNum = "2"
		}
		addReportSectionTitle(
			pdf, fmt.Sprintf("%s. System Audit Logs", sectionNum),
		)
		addLogsTable(pdf, logs)
	}

	var buf bytes.Buffer
	err = pdf.Output(&buf)
	if err != nil {
		log.Printf("[ReportService] PDF Output error: %v", err)
		return nil, fmt.Errorf("failed to generate PDF output: %w", err)
	}

	return buf.Bytes(), nil
}

func addSystemReportHeader(pdf *gofpdf.Fpdf, generatedAt string) {
	pdf.SetXY(15, 18)
	pdf.SetTextColor(20, 20, 20)
	pdf.SetFont("Arial", "B", 17)
	pdf.Cell(0, 8, "Identity Provider System & Audit Report")

	pdf.SetXY(15, 27)
	pdf.SetFont("Arial", "I", 10)
	pdf.SetTextColor(45, 45, 45)
	pdf.Cell(0, 6, fmt.Sprintf("Generated on: %s", generatedAt))
	pdf.Ln(22)
}

func addUsersTable(pdf *gofpdf.Fpdf, users []models.User) {
	widths := []float64{40, 55, 25, 30, 30}
	addReportTableHeader(
		pdf,
		[]string{"NAME", "EMAIL", "STATUS", "ROLE", "CREATED AT"},
		widths,
	)

	pdf.SetDrawColor(185, 185, 185)
	pdf.SetTextColor(20, 20, 20)

	if len(users) == 0 {
		addReportCell(pdf, widths[0], 12, "None", "C", false)
		addReportCell(pdf, widths[1], 12, "No users recorded", "C", false)
		addReportCell(pdf, widths[2], 12, "-", "C", false)
		addReportCell(pdf, widths[3], 12, "-", "C", false)
		addReportCell(pdf, widths[4], 12, "-", "C", false)
		pdf.Ln(-1)
		return
	}

	for _, u := range users {
		fullName := fmt.Sprintf("%s %s", u.FirstName, u.LastName)
		createdAtStr := u.CreatedAt.Format("2006-01-02")
		roleName := "-"
		if u.Role.RoleName != "" {
			roleName = u.Role.RoleName
		}

		addMultiCellReportRow(
			pdf,
			widths,
			12,
			[]string{fullName, u.Email, string(u.Status), roleName, createdAtStr},
			[]string{"L", "L", "C", "C", "C"},
		)
	}
	pdf.Ln(16)
}

func addClientsTable(pdf *gofpdf.Fpdf, clients []models.Client) {
	widths := []float64{45, 55, 30, 50}
	addReportTableHeader(
		pdf,
		[]string{"CLIENT NAME", "BASE URL", "TOKENS TTL (A/R)", "GRANTS"},
		widths,
	)

	pdf.SetDrawColor(185, 185, 185)
	pdf.SetTextColor(20, 20, 20)

	if len(clients) == 0 {
		addReportCell(pdf, widths[0], 12, "None", "C", false)
		addReportCell(pdf, widths[1], 12, "No appclients recorded", "C", false)
		addReportCell(pdf, widths[2], 12, "-", "C", false)
		addReportCell(pdf, widths[3], 12, "-", "C", false)
		pdf.Ln(-1)
		return
	}

	for _, c := range clients {
		ttlStr := fmt.Sprintf(
			"%ds / %ds", c.AccessTokenTTL, c.RefreshTokenTTL,
		)
		grantsStr := ""
		if len(c.Grants) > 0 {
			grantsStr = c.Grants[0]
			if len(c.Grants) > 1 {
				grantsStr += ", ..."
			}
		} else {
			grantsStr = "-"
		}

		addMultiCellReportRow(
			pdf,
			widths,
			12,
			[]string{c.ClientName, c.BaseUrl, ttlStr, grantsStr},
			[]string{"L", "L", "C", "L"},
		)
	}
	pdf.Ln(16)
}

func addLogsTable(pdf *gofpdf.Fpdf, logs []models.AuditLog) {
	widths := []float64{50, 35, 40, 25, 30}
	addReportTableHeader(
		pdf,
		[]string{"ACTOR", "ACTION", "TARGET", "STATUS", "TIMESTAMP"},
		widths,
	)

	pdf.SetDrawColor(185, 185, 185)
	pdf.SetTextColor(20, 20, 20)

	if len(logs) == 0 {
		addReportCell(pdf, widths[0], 12, "None", "C", false)
		addReportCell(pdf, widths[1], 12, "No audit logs recorded", "C", false)
		addReportCell(pdf, widths[2], 12, "-", "C", false)
		addReportCell(pdf, widths[3], 12, "-", "C", false)
		addReportCell(pdf, widths[4], 12, "-", "C", false)
		pdf.Ln(-1)
		return
	}

	for _, logEntry := range logs {
		actorStr := "-"
		if logEntry.Actor != nil {
			actorStr = *logEntry.Actor
		}
		timeStr := logEntry.CreatedAt.Format("2006-01-02 15:04:05")

		addMultiCellReportRow(
			pdf,
			widths,
			12,
			[]string{actorStr, logEntry.Action, logEntry.Target, logEntry.Status, timeStr},
			[]string{"L", "C", "C", "C", "C"},
		)
	}
	pdf.Ln(16)
}
