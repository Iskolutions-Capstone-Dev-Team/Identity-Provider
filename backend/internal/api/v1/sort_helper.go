package v1

import (
	"net/http"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/errors"
	"github.com/gin-gonic/gin"
)

// ValidateSortParams extracts and validates sorting query parameters.
/**
 * ValidateSortParams validates that the sort_by column is not "id", is
 * allowed by the whitelist, and that the order is "asc" or "desc".
 */
func ValidateSortParams(
	c *gin.Context,
	allowedColumns map[string]bool,
) (string, string, bool) {
	sortBy := c.Query("sort_by")
	order := strings.ToLower(c.Query("order"))

	if sortBy != "" {
		if strings.ToLower(sortBy) == "id" {
			errors.SendString(
				c,
				http.StatusBadRequest,
				errors.CodeInvalidInput,
				"Sorting by ID is not allowed.",
				"InvalidSortBy",
			)
			return "", "", false
		}
		if !allowedColumns[sortBy] {
			errors.SendString(
				c,
				http.StatusBadRequest,
				errors.CodeInvalidInput,
				"Invalid sort column.",
				"InvalidSortBy",
			)
			return "", "", false
		}
	}

	if order == "" {
		order = "desc"
	} else if order != "asc" && order != "desc" {
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Order parameter must be 'asc' or 'desc'.",
			"InvalidOrder",
		)
		return "", "", false
	}

	return sortBy, order, true
}
