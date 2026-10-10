package com.pranaveda.routine;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Ordered items within a routine. Routines are always owned-scoped before their
 * items are touched, so no user column is needed here - the caller has already
 * proved ownership of the parent routine.
 */
public interface RoutineItemRepository extends JpaRepository<RoutineItem, Long> {

    List<RoutineItem> findByRoutineIdOrderByPositionAsc(Long routineId);

    @Modifying
    @Query("DELETE FROM RoutineItem i WHERE i.routineId = :routineId")
    void deleteByRoutineId(@Param("routineId") Long routineId);

    long countByRoutineId(Long routineId);
}
