package repository

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type AccountTypeClientRow struct {
	AccountTypeID   int    `db:"account_type_id"`
	AccountTypeName string `db:"account_type_name"`
	ClientID        []byte `db:"client_id"`
	ClientName      string `db:"client_name"`
}

type RegistrationRepository interface {
	GetRegistrationConfig(ctx context.Context) ([]AccountTypeClientRow, error)
	GetClientsByAccountTypeID(ctx context.Context,
		id int) ([]AccountTypeClientRow, error)
	SyncPreapprovedClients(ctx context.Context, accountTypeID int,
		clientIDs []uuid.UUID) error
	GetAccountTypeIDByName(ctx context.Context, name string) (int, error)
	CreateAccountType(ctx context.Context, name string) (int, error)
	UpdateAccountType(ctx context.Context, id int, name string) error
	DeleteAccountType(ctx context.Context, id int) error
}

type regRepo struct {
	db *sqlx.DB
}

func NewRegistrationRepository(db *sqlx.DB) RegistrationRepository {
	return &regRepo{db: db}
}

func (r *regRepo) GetRegistrationConfig(ctx context.Context) (
	[]AccountTypeClientRow, error) {
	query := `
		SELECT account_type_id, account_type_name, client_id, client_name
		FROM (
			SELECT 
				at.id AS account_type_id,
				at.name AS account_type_name,
				cl.id AS client_id,
				COALESCE(cl.client_name, '') AS client_name,
				ROW_NUMBER() OVER (PARTITION BY at.id 
					ORDER BY cl.client_name) as row_num
			FROM account_types at
			LEFT JOIN preapproved_clients pc ON at.id = pc.account_type_id
			LEFT JOIN clients cl ON pc.client_id = cl.id
		) t
		WHERE row_num <= 5
		ORDER BY account_type_id;
	`
	var rows []AccountTypeClientRow
	err := r.db.SelectContext(ctx, &rows, query)
	return rows, err
}

func (r *regRepo) GetClientsByAccountTypeID(ctx context.Context,
	id int) ([]AccountTypeClientRow, error) {
	query := `
		SELECT 
			at.id AS account_type_id,
			at.name AS account_type_name,
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

func (r *regRepo) CreateAccountType(ctx context.Context, name string) (int, error) {
	query := "INSERT INTO account_types (name) VALUES (?)"
	res, err := r.db.ExecContext(ctx, query, name)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return int(id), err
}

func (r *regRepo) UpdateAccountType(ctx context.Context, id int, name string) error {
	query := "UPDATE account_types SET name = ? WHERE id = ?"
	_, err := r.db.ExecContext(ctx, query, name, id)
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
