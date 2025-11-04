// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAllGroupsForReferenceByName} from 'mattermost-redux/selectors/entities/groups';
import {getUsersByUsername} from 'mattermost-redux/selectors/entities/users';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import Constants from 'utils/constants';
import {getUserOrGroupFromMentionName} from 'utils/post_utils';

import type {GlobalState} from 'types/store';

import PlainRenderer from './plain_renderer';

/**
 * Renderer that:
 *  - Replaces @username in plain text nodes with @Display Name
 *  - Leaves code blocks and inline code intact (including the @content)
 *  - Does NOT attempt replacements inside code/codespan
 * Output is used before stripMarkdown() for notification text.
 */
export default class DisplayNameMentionRenderer extends PlainRenderer {
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
     * Note: PlainRenderer.code() takes no parameters, but marked actually passes them.
     */
    public code(code?: string, language?: string | null): string {
        if (!code) {
            return '\n';
        }
        const info = (language || '').trim();
        // Preserve code blocks by reconstructing the fences (will become plain text after stripMarkdown)
        return `\n\`\`\`${info}\n${code}\n\`\`\`\n`;
    }

    /**
     * Preserve inline code exactly (re-wrap with backticks).
     * Note: PlainRenderer.codespan() takes no parameters, but marked actually passes them.
     */
    public codespan(code?: string): string {
        if (!code) {
            return ' ';
        }
        return `\`${code}\``;
    }

    /**
     * Replace mentions only in plain text nodes.
     * Code/codespan are overridden above so they won't reach here.
     */
    public text(text: string) {
        if (!text || text.indexOf('@') === -1) {
            return text;
        }

        // Get users and groups from state
        const usersByUsername = getUsersByUsername(this.state);
        const groupsByName = getAllGroupsForReferenceByName(this.state);

        // Replace mentions in text (no emoji removal - preserve original content)
        return text.replace(Constants.MENTIONS_REGEX, (full: string) => {
            // full = "@username" or "@username." etc (with trailing punctuation)
            const mentionName = full.slice(1); // Remove the '@' prefix

            // Keep special mentions unchanged
            if (Constants.SPECIAL_MENTIONS.includes(mentionName.toLowerCase())) {
                return full;
            }

            // Get user or group from mention name (handles trailing punctuation)
            const [user, group] = getUserOrGroupFromMentionName(mentionName, usersByUsername, groupsByName);

            if (user) {
                // Extract any trailing punctuation/suffix after the actual username
                const userMentionNameSuffix = mentionName.substring(user.username.length);
                const display = displayUsername(user, this.teammateNameDisplay, false);
                return `@${display}${userMentionNameSuffix}`;
            } else if (group) {
                // Extract any trailing punctuation/suffix after the actual group name
                const groupMentionNameSuffix = mentionName.substring(group.name.length);
                return `@${group.name}${groupMentionNameSuffix}`;
            }

            // Unknown user/group - return original
            return full;
        });
    }
}
