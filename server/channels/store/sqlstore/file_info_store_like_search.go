// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package sqlstore

import (
	"fmt"
	"strings"

	sq "github.com/mattermost/squirrel"

	"github.com/mattermost/mattermost/server/public/model"
)

// buildFileInfoLIKEClause builds a LIKE clause for file info search using pg_bigm indexes
func (fs SqlFileInfoStore) buildFileInfoLIKEClause(term string, searchColumns ...string) sq.Sqlizer {
	// escape the special characters with *
	likeTerm := sanitizeSearchTerm(term, "*")
	if likeTerm == "" {
		return nil
	}

	// add a placeholder at the beginning and end
	likeTerm = wildcardSearchTerm(likeTerm)

	// Prepare the LIKE portion of the query.
	var searchFields sq.Or

	for _, field := range searchColumns {
		if fs.DriverName() == model.DatabaseDriverPostgres {
			expr := fmt.Sprintf("LOWER(%s) LIKE LOWER(?) ESCAPE '*'", field)
			searchFields = append(searchFields, sq.Expr(expr, likeTerm))
		} else {
			expr := fmt.Sprintf("%s LIKE ? ESCAPE '*'", field)
			searchFields = append(searchFields, sq.Expr(expr, likeTerm))
		}
	}

	return searchFields
}
