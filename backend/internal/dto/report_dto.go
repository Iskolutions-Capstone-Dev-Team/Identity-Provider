package dto

// SystemReportParams represents the query parameters for system reports.
type SystemReportParams struct {
	IncludeUsers   bool   `form:"include_users,default=true"`
	IncludeClients bool   `form:"include_clients,default=true"`
	IncludeLogs    bool   `form:"include_logs,default=true"`
	LimitUsers     int    `form:"limit_users,default=50"`
	LimitClients   int    `form:"limit_clients,default=50"`
	LimitLogs      int    `form:"limit_logs,default=100"`
	Format         string `form:"format,default=pdf"`
}
