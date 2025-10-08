// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getUserByUsername} from 'mattermost-redux/selectors/entities/users';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import Constants from 'utils/constants';

import type {GlobalState} from 'types/store';

import MentionableRenderer from './mentionable_renderer';

/**
 * Renderer that:
 *  - Replaces @username in plain text nodes with @Display Name
 *  - Leaves code blocks and inline code intact (including the @content)
 *  - Does NOT attempt replacements inside code/codespan
 * Output is used before stripMarkdown() for notification text.
 */
export default class DisplayNameMentionRenderer extends MentionableRenderer {
    private state: GlobalState;
    private teammateNameDisplay: string;

    constructor(state: GlobalState, teammateNameDisplay: string) {
        super();
        this.state = state;
        this.teammateNameDisplay = teammateNameDisplay;
    }

    /**
     * Override code blocks to preserve original code (adding fences back).
     * marked passes only the code content (without the backticks). We re-wrap it.
     */
    public code(code: string, language?: string | null) {
        const info = (language || '').trim();
        // Preserve code blocks by reconstructing the fences (will become plain text after stripMarkdown)
        return `\n\`\`\`${info}\n${code}\n\`\`\`\n`;
    }

    /**
     * Preserve inline code exactly (re-wrap with backticks).
     */
    public codespan(code: string) {
        return `\`${code}\``;
    }

    /**
     * Replace mentions only in plain text nodes.
     * Code/codespan are overridden above so they won't reach here.
     */
    public text(text: string) {
        if (!text || text.indexOf('@') === -1) {
            return super.text(text);
        }

        // Call parent's text method to maintain existing processing (emoji removal, etc.)
        const base = super.text(text);

        return base.replace(Constants.MENTIONS_REGEX, (full: string) => {
            // full = "@username"
            const raw = full.slice(1); // Remove the '@' prefix
            const lower = raw.toLowerCase();

            // Keep special mentions unchanged
            if (Constants.SPECIAL_MENTIONS.includes(lower)) {
                return full;
            }

            const user = getUserByUsername(this.state, lower);
            if (!user) {
                return full;
            }

            const display = displayUsername(user, this.teammateNameDisplay, false);
            return `@${display}`;
        });
    }
}
