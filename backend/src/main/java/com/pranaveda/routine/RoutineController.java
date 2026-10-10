package com.pranaveda.routine;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Personal routine endpoints (agents.md 2.10). All routes live under
 * {@code /api/v1/me/**}, so the security chain requires authentication, and the
 * service re-resolves the owner from the security context - a user can only
 * ever read or mutate their own routines. Routines are private by default.
 */
@Tag(name = "Routines")
@RestController
@RequestMapping("/api/v1/me/routines")
public class RoutineController {

    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    /** Creates a routine from an ordered sequence of published content. */
    @PostMapping
    public ResponseEntity<RoutineDto> create(@Valid @RequestBody RoutineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(routineService.create(request));
    }

    /** The caller's routines (summaries), most-recently-updated first. */
    @GetMapping
    public List<RoutineSummaryDto> listMine() {
        return routineService.listMine();
    }

    /** One of the caller's routines with its full ordered sequence. */
    @GetMapping("/{id}")
    public RoutineDto get(@PathVariable long id) {
        return routineService.load(id);
    }

    /** Renames/edits a routine and replaces its ordered sequence (reordering). */
    @PutMapping("/{id}")
    public RoutineDto update(@PathVariable long id, @Valid @RequestBody RoutineRequest request) {
        return routineService.update(id, request);
    }

    /** Deletes one of the caller's routines. Idempotent (404 if not theirs). */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        routineService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
