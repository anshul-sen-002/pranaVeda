package com.pranaveda.content;

import java.util.List;

import com.pranaveda.ai.AiProvider;
import com.pranaveda.common.error.BadRequestException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Narration generation is deterministic around the provider: prompts carry the
 * admin-authored context, replies are sanitized and length-capped, and an
 * empty reply is a failed generation rather than a publishable blank.
 */
class StepInstructionGeneratorTest {

    private AiProvider provider;
    private StepInstructionGenerator generator;

    @BeforeEach
    void setUp() {
        provider = mock(AiProvider.class);
        generator = new StepInstructionGenerator(provider);
    }

    @Test
    void generatesSanitizedNarrationFromProviderReply() {
        when(provider.chat(anyList())).thenReturn(
            new AiProvider.AiReply("  \"Stand tall. Breathe slowly. \" ", "model-x", 10, 20));

        String text = generator.generate(item(), step("Feet together, shoulders relaxed"), 2, 5);

        assertThat(text).isEqualTo("Stand tall. Breathe slowly.");
    }

    @Test
    void emptyReplyIsRejectedNotStored() {
        when(provider.chat(anyList())).thenReturn(new AiProvider.AiReply("   ", "model-x", 1, 1));

        catchThrowableOfType(() -> generator.generate(item(), step(null), 1, 1), BadRequestException.class);
    }

    @Test
    void promptCarriesPoseContextAndStepPosition() {
        when(provider.chat(anyList())).thenReturn(new AiProvider.AiReply("Ok.", "model-x", 1, 1));

        generator.generate(item(), step("Lift the leg"), 3, 4);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<AiProvider.ChatTurn>> captor = ArgumentCaptor.forClass(List.class);
        verify(provider).chat(captor.capture());
        String userMessage = captor.getValue().get(1).content();

        assertThat(captor.getValue().get(0).role()).isEqualTo("system");
        assertThat(userMessage).contains("Tree Pose").contains("Vrikshasana")
            .contains("Step 3 of 4").contains("Lift the leg")
            .contains("Keep a soft bend in the standing knee"); // safety notes
    }

    @Test
    void overlongRepliesAreCappedAtTheNarrationLimit() {
        String longReply = "word ".repeat(2000); // ~10k chars
        when(provider.chat(anyList())).thenReturn(new AiProvider.AiReply(longReply, "model-x", 1, 1));

        String text = generator.generate(item(), step("cap"), 1, 1);

        assertThat(text.length()).isLessThanOrEqualTo(StepInstructionGenerator.MAX_INSTRUCTION_CHARS);
    }

    // --- helpers -----------------------------------------------------------

    private static ContentItem item() {
        ContentItem item = new ContentItem();
        item.setTitle("Tree Pose");
        item.setSanskritName("Vrikshasana");
        item.setDifficulty(Difficulty.BEGINNER);
        item.setSafetyPrecautions("Keep a soft bend in the standing knee.");
        item.setBreathingNotes("Slow, even breaths.");
        return item;
    }

    private static ContentStep step(String caption) {
        ContentStep step = new ContentStep();
        step.setCaption(caption);
        return step;
    }
}
