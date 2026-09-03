package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type AccountTypeClientRow struct {
	AccountTypeID   int    `db:"account_type_id"`
	AccountTypeName string `db:"account_type_name"`
	IsSelectable    bool   `db:"is_selectable"`
	ClientID        []byte `db:"client_id"`
	ClientName      string `db:"client_name"`
}

type RegistrationRepository interface {
	GetRegistrationConfig(ctx context.Context, limit, offset int,
		sortBy, order, keyword string) ([]AccountTypeClientRow, error)
	CountAccountTypes(ctx context.Context, keyword string) (int, error)
	GetClientsByAccountTypeID(ctx context.Context,
		id int) ([]AccountTypeClientRow, error)
	SyncPreapprovedClients(ctx context.Context, accountTypeID int,
		clientIDs []uuid.UUID) error
	GetAccountTypeIDByName(ctx context.Context, name string) (int, error)
	CreateAccountType(ctx context.Context, name string,
		isSelectable bool) (int, error)
	UpdateAccountType(ctx context.Context, id int, name string,
		isSelectable bool) error
	DeleteAccountType(ctx context.Context, id int) error
	GetScopedRegistrationConfig(ctx context.Context, userID []byte,
		limit, offset int, sortBy, order, keyword string,
	) ([]AccountTypeClientRow, error)
	CountScopedAccountTypes(ctx context.Context, userID []byte,
		keyword string) (int, error)
	GetSelectableAccountTypes(ctx context.Context) ([]models.AccountType, error)
}

type regRepo struct {
	db *sqlx.DB
}

func NewRegistrationRepository(db *sqlx.DB) RegistrationRepository {
	return &regRepo{db: db}
}

func getSafeRegSubquery(sortBy, order string) (string, string, string) {
	ord := "DESC"
	if strings.ToLower(order) == "asc" {
		ord = "ASC"
	}
	var selectCol, orderCol string
	switch sortBy {
	case "account_type_name":
		selectCol = "at.name"
		orderCol = "at.name " + ord
	case "client_id":
		selectCol = "COALESCE(MIN(cl.id), 0)"
		orderCol = "MIN(cl.id) " + ord
	case "client_name":
		selectCol = "COALESCE(MIN(cl.client_name), '')"
		orderCol = "MIN(cl.client_name) " + ord
	default:
		selectCol = "at.id"
		orderCol = "at.id " + ord
	}
	return selectCol, orderCol, ord
}

func (r *regRepo) GetRegistrationConfig(ctx context.Context,
	limit, offset int, sortBy, order, keyword string,
) ([]AccountTypeClientRow, error) {
	selectCol, orderCol, ordVal := getSafeRegSubquery(sortBy, order)

	var queryParams []interface{}
	whereClause := ""
	if keyword != "" {
		whereClause = "WHERE LOWER(at.name) LIKE ?"
		queryParams = append(queryParams, "%"+strings.ToLower(keyword)+"%")
	}
	queryParams = append(queryParams, limit, offset)

	query := fmt.Sprintf(`
		SELECT 
			account_type_id, 
			account_type_name, 
			is_selectable, 
			client_id, 
			client_name
		FROM (
			SELECT 
				at.id AS account_type_id,
				at.name AS account_type_name,
				at.is_selectable AS is_selectable,
				cl.id AS client_id,
				COALESCE(cl.client_name, '') AS client_name,
				at.sort_val,
				ROW_NUMBER() OVER (PARTITION BY at.id 
					ORDER BY cl.client_name) as row_num
			FROM (
				SELECT at.id, at.name, at.is_selectable, %s AS sort_val
				FROM account_types at
				LEFT JOIN preapproved_clients pc 
					ON at.id = pc.account_type_id
				LEFT JOIN clients cl ON pc.client_id = cl.id
				%s
				GROUP BY at.id, at.name, at.is_selectable
				ORDER BY %s
				LIMIT ? OFFSET ?
			) at
			LEFT JOIN preapproved_clients pc ON at.id = pc.account_type_id
			LEFT JOIN clients cl ON pc.client_id = cl.id
		) t
		WHERE row_num <= 5
		ORDER BY sort_val %s, account_type_id, client_name;
	`, selectCol, whereClause, orderCol, ordVal)
	var rows []AccountTypeClientRow
	err := r.db.SelectContext(ctx, &rows, query, queryParams...)
	return rows, err
}

func (r *regRepo) CountAccountTypes(
	ctx context.Context, keyword string,
) (int, error) {
	var count int
	var queryParams []interface{}
	whereClause := ""
	if keyword != "" {
		whereClause = "WHERE LOWER(name) LIKE ?"
		queryParams = append(queryParams, "%"+strings.ToLower(keyword)+"%")
	}
	query := fmt.Sprintf("SELECT COUNT(*) FROM account_types %s", whereClause)
	err := r.db.GetContext(ctx, &count, query, queryParams...)
	return count, err
}

func (r *regRepo) GetClientsByAccountTypeID(ctx context.Context,
	id int,
) ([]AccountTypeClientRow, error) {
	query := `
		SELECT 
			at.id AS account_type_id,
			at.name AS account_type_name,
			at.is_selectable AS is_selectable,
			cl.id AS client_id,
			COALESCE(cl.client_name, '') AS client_name
		FROM account_types at
		LEFT JOIN preapproved_clients pc ON at.id = pc.account_type_id
		LEFT JOIN clients cl ON pc.client_id = cl.id
		WHERE at.id = ?
		ORDER BY cl.client_name;
	`
	var rows []AccountTypeClientRow
	err := r.db.SelectContext(ctx, &rows, query, id)
	return rows, err
}

func (r *regRepo) SyncPreapprovedClients(ctx context.Context,
	accountTypeID int, clientIDs []uuid.UUID) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx,
		"DELETE FROM preapproved_clients WHERE account_type_id = ?",
		accountTypeID)
	if err != nil {
		return err
	}

	if len(clientIDs) > 0 {
		query := "INSERT INTO preapproved_clients (account_type_id, client_id) VALUES "
		vals := []interface{}{}
		for _, clientID := range clientIDs {
			query += "(?, ?),"
			binaryID, _ := clientID.MarshalBinary()
			vals = append(vals, accountTypeID, binaryID)
		}
		query = query[:len(query)-1]
		_, err = tx.ExecContext(ctx, query, vals...)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *regRepo) GetAccountTypeIDByName(ctx context.Context,
	name string) (int, error) {
	var id int
	lowerName := strings.ToLower(name)
	query := "SELECT id FROM account_types WHERE lower(name) = ?"
	err := r.db.GetContext(ctx, &id, query, lowerName)
	return id, err
}

func (r *regRepo) CreateAccountType(ctx context.Context, name string,
	isSelectable bool,
) (int, error) {
	query := "INSERT INTO account_types (name, is_selectable) VALUES (?, ?)"
	res, err := r.db.ExecContext(ctx, query, name, isSelectable)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return int(id), err
}

func (r *regRepo) UpdateAccountType(ctx context.Context, id int, name string,
	isSelectable bool,
) error {
	query := `UPDATE account_types 
		SET name = ?, is_selectable = ? 
		WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, name, isSelectable, id)
	return err
}

func (r *regRepo) DeleteAccountType(ctx context.Context, id int) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Delete preapproved clients first to avoid constraint issues
	_, err = tx.ExecContext(ctx,
		"DELETE FROM preapproved_clients WHERE account_type_id = ?", id)
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, "DELETE FROM account_types WHERE id = ?", id)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *regRepo) GetScopedRegistrationConfig(ctx context.Context,
	userID []byte, limit, offset int, sortBy, order, keyword string,
) ([]AccountTypeClientRow, error) {
	selectCol, orderCol, ordVal := getSafeRegSubquery(sortBy, order)
	selectCol = strings.ReplaceAll(selectCol, "at.", "at2.")
	selectCol = strings.ReplaceAll(selectCol, "cl.", "cl2.")
	orderCol = strings.ReplaceAll(orderCol, "at.", "at2.")
	orderCol = strings.ReplaceAll(orderCol, "cl.", "cl2.")

	var queryParams []interface{}
	queryParams = append(queryParams, userID)

	whereClause := "WHERE aac2.user_id = ?"
	if keyword != "" {
		whereClause += " AND LOWER(at2.name) LIKE ?"
		queryParams = append(queryParams, "%"+strings.ToLower(keyword)+"%")
	}
	queryParams = append(queryParams, limit, offset, userID)

	query := fmt.Sprintf(`
		SELECT 
			account_type_id, 
			account_type_name, 
			is_selectable, 
			client_id, 
			client_name
		FROM (
			SELECT 
				at.id AS account_type_id,
				at.name AS account_type_name,
				at.is_selectable AS is_selectable,
				cl.id AS client_id,
				COALESCE(cl.client_name, '') AS client_name,
				at.sort_val,
				ROW_NUMBER() OVER (PARTITION BY at.id 
					ORDER BY cl.client_name) as row_num
			FROM (
				SELECT 
					at2.id, 
					at2.name, 
					at2.is_selectable, 
					%s AS sort_val
				FROM account_types at2
				JOIN preapproved_clients pc2 ON at2.id = pc2.account_type_id
				JOIN admin_allowed_clients aac2 ON pc2.client_id = aac2.client_id
				LEFT JOIN clients cl2 ON pc2.client_id = cl2.id
				%s
				GROUP BY at2.id, at2.name, at2.is_selectable
				ORDER BY %s
				LIMIT ? OFFSET ?
			) at
			LEFT JOIN preapproved_clients pc ON at.id = pc.account_type_id
			LEFT JOIN clients cl ON pc.client_id = cl.id
			JOIN admin_allowed_clients aac ON cl.id = aac.client_id
			WHERE aac.user_id = ? AND cl.deleted_at IS NULL
		) t
		WHERE row_num <= 5
		ORDER BY sort_val %s, account_type_id, client_name;
	`, selectCol, whereClause, orderCol, ordVal)
	var rows []AccountTypeClientRow
	err := r.db.SelectContext(ctx, &rows, query, queryParams...)
	return rows, err
}

func (r *regRepo) CountScopedAccountTypes(ctx context.Context,
	userID []byte, keyword string,
) (int, error) {
	var count int
	var queryParams []interface{}
	queryParams = append(queryParams, userID)

	whereClause := "WHERE aac.user_id = ?"
	if keyword != "" {
		whereClause += " AND LOWER(at.name) LIKE ?"
		queryParams = append(queryParams, "%"+strings.ToLower(keyword)+"%")
	}

	query := fmt.Sprintf(`
		SELECT COUNT(DISTINCT at.id)
		FROM account_types at
		JOIN preapproved_clients pc ON at.id = pc.account_type_id
		JOIN admin_allowed_clients aac ON pc.client_id = aac.client_id
		%s
	`, whereClause)

	err := r.db.GetContext(ctx, &count, query, queryParams...)
	return count, err
}

func (r *regRepo) GetSelectableAccountTypes(
	ctx context.Context,
) ([]models.AccountType, error) {
	query := `
		SELECT id, name, is_selectable
		FROM account_types
		WHERE is_selectable = TRUE
		ORDER BY name ASC;
	`
	var types []models.AccountType
	err := r.db.SelectContext(ctx, &types, query)
	return types, err
}
