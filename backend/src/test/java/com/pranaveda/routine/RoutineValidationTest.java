package com.pranaveda.routine;

import java.util.List;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.content.ContentItem;
import com.pranaveda.content.ContentItemFacetRepository;
import com.pranaveda.content.ContentRepository;
import com.pranaveda.content.ContentStatus;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.user.Role;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Server-side routine sequence validation (agents.md 2.10): a routine must be
 * non-empty, within the size cap, and every referenced item must be a PUBLISHED
 * content item - a draft/archived or unknown item is rejected so it can never be
 * embedded. Ownership comes from the security context, never the request.
 */
class RoutineValidationTest {

    private static final long USER_ID = 7L;

    private RoutineRepository routines;
    private RoutineItemRepository items;
    private ContentRepository contentRepository;
    private ContentItemFacetRepository facetRepository;
    private RoutineService service;

    /** In-memory stand-in for the routine_items table so DTO read-back works. */
    private final List<RoutineItem> storedItems = new java.util.ArrayList<>();

    @BeforeEach
    void setUp() {
        routines = mock(RoutineRepository.class);
        items = mock(RoutineItemRepository.class);
        contentRepository = mock(ContentRepository.class);
        facetRepository = mock(ContentItemFacetRepository.class);
        service = new RoutineService(routines, items, contentRepository, facetRepository);

        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                new CurrentUserPrincipal(USER_ID, "member@pranaveda.dev", Role.USER),
                null, List.of(() -> "ROLE_USER")));

        when(facetRepository.findByContentIdIn(anyCollection())).thenReturn(List.of());

        // Simulate persistence: capture saved items and serve them back on read.
        when(items.saveAll(anyCollection())).thenAnswer(invocation -> {
            Iterable<RoutineItem> saved = invocation.getArgument(0);
            for (RoutineItem item : saved) {
                ReflectionTestUtils.setField(item, "id", 500L + storedItems.size());
                storedItems.add(item);
            }
            return List.copyOf(storedItems);
        });
        when(items.findByRoutineIdOrderByPositionAsc(anyLong()))
                .thenAnswer(invocation -> List.copyOf(storedItems));
        when(routines.save(any(Routine.class))).thenAnswer(invocation -> {
            Routine saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 100L);
            return saved;
        });
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void emptySequenceIsRejected() {
        RoutineRequest request = new RoutineRequest("Morning flow", null, List.of());

        BadRequestException ex = catchThrowableOfType(
            () -> service.create(request), BadRequestException.class);

        assertThat(ex.getMessage()).contains("at least one item");
    }

    @Test
    void nullSequenceIsRejected() {
        RoutineRequest request = new RoutineRequest("Morning flow", null, null);

        BadRequestException ex = catchThrowableOfType(
            () -> service.create(request), BadRequestException.class);

        assertThat(ex.getMessage()).contains("at least one item");
    }

    @Test
    void draftContentCannotBeAdded() {
        when(contentRepository.findAllById(any())).thenReturn(List.of(item(1L, ContentStatus.DRAFT)));

        RoutineRequest request = requestWith(new RoutineItemRequest(1L, null, null));

        BadRequestException ex = catchThrowableOfType(
            () -> service.create(request), BadRequestException.class);

        assertThat(ex.getMessage()).contains("not available to add");
    }

    @Test
    void unknownContentCannotBeAdded() {
        when(contentRepository.findAllById(any())).thenReturn(List.of());

        RoutineRequest request = requestWith(new RoutineItemRequest(999L, null, null));

        BadRequestException ex = catchThrowableOfType(
            () -> service.create(request), BadRequestException.class);

        assertThat(ex.getMessage()).contains("not available to add");
    }

    @Test
    void sizeCapIsEnforced() {
        List<RoutineItemRequest> tooMany = java.util.stream.IntStream.range(0, 101)
                .mapToObj(i -> new RoutineItemRequest((long) i, null, null))
                .toList();
        when(contentRepository.findAllById(any())).thenReturn(List.of());

        RoutineRequest request = new RoutineRequest("Too long", null, tooMany);

        BadRequestException ex = catchThrowableOfType(
            () -> service.create(request), BadRequestException.class);

        assertThat(ex.getMessage()).contains("at most 100 items");
    }

    @Test
    void publishedItemsAreAccepted() {
        when(contentRepository.findAllById(any()))
                .thenReturn(List.of(item(1L, ContentStatus.PUBLISHED)));
        when(routines.findByIdAndUserId(anyLong(), anyLong()))
                .thenReturn(java.util.Optional.of(savedRoutine()));

        RoutineRequest request = requestWith(new RoutineItemRequest(1L, 60, "breathe"));

        RoutineDto dto = service.create(request);

        assertThat(dto.id()).isEqualTo(100L);
        assertThat(dto.items()).hasSize(1);
        assertThat(dto.items().get(0).position()).isZero();
    }



    private static RoutineRequest requestWith(RoutineItemRequest... itemRequests) {
        return new RoutineRequest("Morning flow", "A gentle start", List.of(itemRequests));
    }

    private static ContentItem item(long id, ContentStatus status) {
        ContentItem content = new ContentItem();
        ReflectionTestUtils.setField(content, "id", id);
        content.setStatus(status);
        return content;
    }

    private static Routine savedRoutine() {
        Routine routine = new Routine();
        ReflectionTestUtils.setField(routine, "id", 100L);
        routine.setUserId(USER_ID);
        routine.setName("Morning flow");
        return routine;
    }
}
