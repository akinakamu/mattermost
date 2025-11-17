// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package sqlstore

import (
	"fmt"
	"strings"

	sq "github.com/mattermost/squirrel"

	"github.com/mattermost/mattermost/server/public/model"
)

// sanitizeFileInfoSearchTerm prepares a search term for use in LIKE clauses with pg_bigm indexes
func sanitizeFileInfoSearchTerm(term string) string {
	// escape the special characters with *
	likeTerm := sanitizeSearchTerm(term, "*")
	if likeTerm == "" {
		return ""
	}

	// add a placeholder at the beginning and end
	return wildcardSearchTerm(likeTerm)
}
