package com.pranaveda.content;

/**
 * Who produced a step's narration text. AI drafts are always editable by an
 * admin before publishing - publication is the approval step
 * (feature: guided yoga pose with voice narration).
 */
public enum InstructionSource {
    /** Generated through the OpenRouter Agent API, still subject to admin review. */
    AI,
    /** Written or edited by an admin. */
    ADMIN
}
