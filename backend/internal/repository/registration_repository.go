package repository

import (
	"context"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type AccountTypeClientRow struct {
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
		SELECT account_type_name, client_id, client_name
		FROM (
			SELECT 
				at.name AS account_type_name,
				at.id AS account_type_id,
				cl.id AS client_id,
				cl.client_name AS client_name,
				ROW_NUMBER() OVER (PARTITION BY pc.account_type_id 
					ORDER BY cl.client_name) as row_num
			FROM preapproved_clients pc
			JOIN account_types at ON pc.account_type_id = at.id
			JOIN clients cl ON pc.client_id = cl.id
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
			at.name AS account_type_name,
			cl.id AS client_id,
			cl.client_name AS client_name
		FROM preapproved_clients pc
		JOIN account_types at ON pc.account_type_id = at.id
		JOIN clients cl ON pc.client_id = cl.id
		WHERE pc.account_type_id = ?
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
